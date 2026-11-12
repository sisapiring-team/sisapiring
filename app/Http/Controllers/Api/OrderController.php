<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\OrderResource;
use App\Models\ImpactLog;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class OrderController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $orders = Order::query()
            ->with(['items.product', 'merchant'])
            ->when($request->filled('status'), fn ($query) => $query->where('status', $request->string('status')))
            ->when($request->filled('merchantCode'), fn ($query) => $query->whereHas(
                'merchant',
                fn ($merchant) => $merchant->where('code', $request->string('merchantCode'))
            ))
            ->latest()
            ->get();

        return OrderResource::collection($orders);
    }

    public function show(Order $order): OrderResource
    {
        $order->load(['items.product', 'merchant']);

        return new OrderResource($order);
    }

    public function store(Request $request): OrderResource
    {
        $validated = $request->validate([
            'items' => ['required', 'array', 'min:1'],
            'items.*.productId' => ['required', 'string'],
            'items.*.quantity' => ['required', 'integer', 'min:1'],
            'customerName' => ['required', 'string', 'max:255'],
            'customerPhone' => ['required', 'string', 'max:50'],
        ]);

        $order = DB::transaction(function () use ($validated, $request) {
            $products = Product::query()
                ->with('merchant')
                ->whereIn('code', collect($validated['items'])->pluck('productId'))
                ->lockForUpdate()
                ->get()
                ->keyBy('code');

            $orderItems = [];
            $totalOriginal = 0.0;
            $totalPayment = 0.0;
            $merchantId = null;

            foreach ($validated['items'] as $item) {
                /** @var Product|null $product */
                $product = $products->get($item['productId']);

                if (! $product) {
                    throw ValidationException::withMessages([
                        'items' => "Produk {$item['productId']} tidak ditemukan.",
                    ]);
                }

                if ($product->available_stock < $item['quantity']) {
                    throw ValidationException::withMessages([
                        'items' => "Stok {$product->name} tidak mencukupi.",
                    ]);
                }

                $quantity = (int) $item['quantity'];
                $merchantId ??= $product->merchant_id;

                $orderItems[] = [
                    'product_id' => $product->id,
                    'product_name' => $product->name,
                    'category' => $product->category,
                    'image' => $product->image,
                    'original_price' => $product->original_price,
                    'price_per_item' => $product->discounted_price,
                    'quantity' => $quantity,
                    'subtotal' => (float) $product->discounted_price * $quantity,
                    'weight_grams_total' => (int) $product->weight_grams * $quantity,
                ];

                $totalOriginal += (float) $product->original_price * $quantity;
                $totalPayment += (float) $product->discounted_price * $quantity;

                $product->decrement('stock', $quantity);
            }

            $customer = $request->user()
                ?? User::query()->where('role', 'buyer')->orderBy('id')->first();

            $order = Order::query()->create([
                'order_code' => $this->nextOrderCode(),
                'pickup_code' => $this->nextPickupCode(),
                'user_id' => $customer?->id ?? User::query()->orderBy('id')->value('id'),
                'merchant_id' => $merchantId,
                'customer_name' => $validated['customerName'],
                'customer_phone' => $validated['customerPhone'],
                'total_original_price' => $totalOriginal,
                'total_payment' => $totalPayment,
                'total_discount' => $totalOriginal - $totalPayment,
                'status' => 'waiting_confirmation',
                'pickup_deadline' => 'Hari ini, 21:00 WIB',
                'pickup_deadline_at' => now()->addHours(4),
                'qr_code_token' => (string) Str::uuid(),
                'is_verified_by_qr' => false,
                'status_history' => [[
                    'status' => 'waiting_confirmation',
                    'timestamp' => now()->format('d M Y, H:i').' WIB',
                    'note' => 'Pesanan dibuat oleh pembeli di Marketplace SisaPiring',
                ]],
            ]);

            $order->items()->createMany($orderItems);

            return $order;
        });

        return new OrderResource($order->load(['items.product', 'merchant']));
    }

    public function updateStatus(Request $request, Order $order): OrderResource
    {
        $validated = $request->validate([
            'status' => ['required', 'in:waiting_confirmation,confirmed,ready_for_pickup,completed,cancelled'],
            'note' => ['nullable', 'string', 'max:255'],
        ]);

        $status = $validated['status'];
        $history = $order->status_history ?? [];
        $history[] = [
            'status' => $status,
            'timestamp' => now()->format('d M Y, H:i').' WIB',
            'note' => $validated['note'] ?? null,
        ];

        $order->update([
            'status' => $status,
            'status_history' => $history,
            'is_verified_by_qr' => $status === 'completed' ? true : $order->is_verified_by_qr,
            'verified_at' => $status === 'completed' ? now() : $order->verified_at,
        ]);

        if ($status === 'completed' && ! $order->impactLog) {
            $this->recordImpact($order);
        }

        return new OrderResource($order->refresh()->load(['items.product', 'merchant']));
    }

    public function cancel(Request $request, Order $order): OrderResource
    {
        $validated = $request->validate([
            'reason' => ['required', 'string', 'max:255'],
        ]);

        $history = $order->status_history ?? [];
        $history[] = [
            'status' => 'cancelled',
            'timestamp' => now()->format('d M Y, H:i').' WIB',
            'note' => 'Dibatalkan: '.$validated['reason'],
        ];

        $order->update([
            'status' => 'cancelled',
            'cancellation_reason' => $validated['reason'],
            'status_history' => $history,
        ]);

        return new OrderResource($order->refresh()->load(['items.product', 'merchant']));
    }

    public function verify(Request $request, Order $order): OrderResource
    {
        if ($order->status === 'completed') {
            throw ValidationException::withMessages([
                'order' => 'Pengambilan pesanan ini sudah pernah diverifikasi.',
            ]);
        }

        if ($order->status === 'cancelled') {
            throw ValidationException::withMessages([
                'order' => 'Pesanan yang dibatalkan tidak dapat diverifikasi.',
            ]);
        }

        $validated = $request->validate([
            'verifiedBy' => ['nullable', 'string', 'max:255'],
        ]);

        $history = $order->status_history ?? [];
        $history[] = [
            'status' => 'completed',
            'timestamp' => now()->format('d M Y, H:i').' WIB',
            'note' => 'Verifikasi sukses melalui Scan QR / Kode PIN Kasir',
        ];

        DB::transaction(function () use ($order, $history, $request) {
            $order->update([
                'status' => 'completed',
                'is_verified_by_qr' => true,
                'verified_at' => now(),
                'verified_by_user_id' => $request->user()?->id,
                'status_history' => $history,
            ]);

            $order->load('items.product');

            foreach ($order->items as $item) {
                $item->product?->increment('portions_rescued_count', $item->quantity);
            }

            if (! $order->impactLog) {
                $this->recordImpact($order);
            }
        });

        return new OrderResource($order->refresh()->load(['items.product', 'merchant']));
    }

    private function recordImpact(Order $order): void
    {
        $portions = (int) $order->items->sum('quantity');
        $weightKg = (float) $order->items->sum('weight_grams_total') / 1000;

        ImpactLog::query()->create([
            'order_id' => $order->id,
            'merchant_id' => $order->merchant_id,
            'user_id' => $order->user_id,
            ...ImpactLog::calculateMetrics($portions, $weightKg, (float) $order->total_discount),
        ]);
    }

    private function nextOrderCode(): string
    {
        $year = now()->format('Y');
        $prefix = "SP-BDG-{$year}-";

        $last = Order::query()
            ->where('order_code', 'like', $prefix.'%')
            ->orderByDesc('order_code')
            ->value('order_code');

        $sequence = $last ? (int) str($last)->afterLast('-')->value() + 1 : 1;

        return $prefix.str_pad((string) $sequence, 3, '0', STR_PAD_LEFT);
    }

    private function nextPickupCode(): string
    {
        do {
            $code = 'SP-'.random_int(1000, 9999);
        } while (Order::query()->where('pickup_code', $code)->exists());

        return $code;
    }
}
