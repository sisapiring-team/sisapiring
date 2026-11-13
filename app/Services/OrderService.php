<?php

namespace App\Services;

use App\Enums\OrderStatus;
use App\Enums\PaymentStatus;
use App\Models\Merchant;
use App\Models\Order;
use App\Models\OrderGroup;
use App\Models\Product;
use App\Models\User;
use App\Notifications\SystemNotification;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class OrderService
{
    public function __construct(
        private readonly StockService $stock,
        private readonly ImpactService $impact,
        private readonly EscrowService $escrow,
    ) {
    }

    /**
     * @param  array<int, array{product_code: string, quantity: int}>  $items
     * @param  array{name: string, phone: string}  $customer
     */
    public function createGroup(User $user, array $items, array $customer, ?string $buyerNote = null): OrderGroup
    {
        $group = DB::transaction(function () use ($user, $items, $customer, $buyerNote) {
            $codes = collect($items)->pluck('product_code')->unique()->values();
            $products = Product::query()
                ->with('merchant')
                ->whereIn('code', $codes)
                ->lockForUpdate()
                ->get()
                ->keyBy('code');

            $lines = [];
            $subtotal = 0.0;
            $originalTotal = 0.0;

            foreach ($items as $item) {
                /** @var Product|null $product */
                $product = $products->get($item['product_code']);
                if (! $product) {
                    throw ValidationException::withMessages([
                        'items' => "Produk {$item['product_code']} tidak ditemukan.",
                    ]);
                }

                $quantity = (int) $item['quantity'];
                $this->stock->assertAvailable($product, $quantity);

                $lines[] = ['product' => $product, 'quantity' => $quantity];
                $subtotal += (float) $product->discounted_price * $quantity;
                $originalTotal += (float) $product->original_price * $quantity;
            }

            $platformFee = $subtotal > 0 ? (float) config('payment.platform_fee_flat', 1000) : 0.0;
            $grandTotal = $subtotal + $platformFee;

            $group = OrderGroup::query()->create([
                'group_code' => $this->nextGroupCode(),
                'user_id' => $user->id,
                'status' => OrderStatus::PendingPayment,
                'payment_status' => PaymentStatus::Unpaid,
                'subtotal' => $subtotal,
                'platform_fee' => $platformFee,
                'discount_total' => $originalTotal - $subtotal,
                'grand_total' => $grandTotal,
                'expires_at' => now()->addMinutes((int) config('payment.checkout_ttl_minutes', 10)),
                'buyer_note' => $buyerNote,
            ]);

            $byMerchant = collect($lines)->groupBy(fn ($line) => $line['product']->merchant_id);

            foreach ($byMerchant as $merchantId => $merchantLines) {
                $merchantSubtotal = collect($merchantLines)->sum(
                    fn ($line) => (float) $line['product']->discounted_price * $line['quantity']
                );
                $merchantOriginal = collect($merchantLines)->sum(
                    fn ($line) => (float) $line['product']->original_price * $line['quantity']
                );

                $order = Order::query()->create([
                    'order_group_id' => $group->id,
                    'order_code' => $this->nextOrderCode(),
                    'pickup_code' => $this->nextPickupCode(),
                    'user_id' => $user->id,
                    'merchant_id' => $merchantId,
                    'customer_name' => $customer['name'],
                    'customer_phone' => $customer['phone'],
                    'total_original_price' => $merchantOriginal,
                    'total_payment' => $merchantSubtotal,
                    'total_discount' => $merchantOriginal - $merchantSubtotal,
                    'platform_fee' => 0,
                    'status' => OrderStatus::PendingPayment,
                    'payment_status' => PaymentStatus::Unpaid,
                    'pickup_deadline' => now()->addHours((int) config('payment.pickup_ttl_hours', 4))->format('H:i').' WIB',
                    'pickup_deadline_at' => now()->addHours((int) config('payment.pickup_ttl_hours', 4)),
                    'qr_code_token' => (string) Str::uuid(),
                    'is_verified_by_qr' => false,
                    'status_history' => [$this->historyEntry(OrderStatus::PendingPayment, 'Pesanan dibuat, menunggu pembayaran.')],
                ]);

                foreach ($merchantLines as $line) {
                    $product = $line['product'];
                    $quantity = (int) $line['quantity'];

                    $order->items()->create([
                        'product_id' => $product->id,
                        'product_name' => $product->name,
                        'category' => $product->category,
                        'image' => $product->image,
                        'original_price' => $product->original_price,
                        'price_per_item' => $product->discounted_price,
                        'quantity' => $quantity,
                        'subtotal' => (float) $product->discounted_price * $quantity,
                        'weight_grams_total' => (int) $product->weight_grams * $quantity,
                    ]);
                }
            }

            $this->stock->reserve($user, $group, $lines);

            return $group;
        });

        return $group->load(['orders.items.product', 'orders.merchant', 'payment']);
    }

    public function markGroupPaid(OrderGroup $group): void
    {
        $group->loadMissing('orders');
        $group->update([
            'status' => OrderStatus::WaitingConfirmation,
            'payment_status' => PaymentStatus::Paid,
            'paid_at' => now(),
        ]);

        $this->stock->convertForGroup($group);

        foreach ($group->orders as $order) {
            $order->update([
                'status' => OrderStatus::WaitingConfirmation,
                'payment_status' => PaymentStatus::Paid,
                'paid_at' => now(),
                'status_history' => $this->appendHistory(
                    $order->status_history,
                    OrderStatus::WaitingConfirmation,
                    'Pembayaran berhasil. Menunggu konfirmasi mitra.',
                ),
            ]);

            $this->escrow->holdForOrder($order);
            $this->notify($order->merchant?->user, 'Pesanan baru', "Pesanan {$order->order_code} sudah dibayar.");
        }

        $this->notify($group->user, 'Pembayaran berhasil', "Pembayaran pesanan {$group->group_code} berhasil.");
    }

    public function cancelGroup(OrderGroup $group, ?User $actor = null, ?string $reason = null, bool $expired = false): void
    {
        DB::transaction(function () use ($group, $actor, $reason, $expired) {
            $group->loadMissing('orders');
            $status = $expired ? OrderStatus::Expired : OrderStatus::Cancelled;

            $this->stock->releaseForGroup($group);

            foreach ($group->orders as $order) {
                if ($order->status->isFinal()) {
                    continue;
                }

                if ($order->payment_status === PaymentStatus::Paid) {
                    $this->escrow->refundForOrder($order, $reason);
                }

                $order->update([
                    'status' => $status,
                    'cancelled_at' => now(),
                    'cancellation_reason' => $reason,
                    'status_history' => $this->appendHistory(
                        $order->status_history,
                        $status,
                        $reason ?? 'Checkout kedaluwarsa.',
                    ),
                ]);

                $this->notify($order->merchant?->user, 'Pesanan dibatalkan', "Pesanan {$order->order_code} dibatalkan.");
            }

            $group->update([
                'status' => $status,
                'cancelled_at' => now(),
                'cancellation_reason' => $reason,
            ]);

            $this->notify($group->user, 'Pesanan dibatalkan', $reason ?? 'Checkout kedaluwarsa.');
        });
    }

    public function transitionOrder(Order $order, OrderStatus $next, ?User $actor = null, ?string $note = null): Order
    {
        return DB::transaction(function () use ($order, $next, $actor, $note) {
            if (! $order->status->canTransitionTo($next)) {
                throw ValidationException::withMessages([
                    'status' => "Status {$order->status->label()} tidak dapat berubah menjadi {$next->label()}.",
                ]);
            }

            if ($next === OrderStatus::Completed) {
                return $this->completeOrder($order, $actor, $note);
            }

            $attributes = [
                'status' => $next,
                'status_history' => $this->appendHistory($order->status_history, $next, $note),
            ];

            if ($next === OrderStatus::Cancelled) {
                $attributes['cancelled_at'] = now();
                $attributes['cancellation_reason'] = $note;
            }

            $order->update($attributes);

            $this->notify($order->user, 'Status pesanan diperbarui', "Pesanan {$order->order_code}: {$next->label()}.");
            $this->notify($order->merchant?->user, 'Status pesanan diperbarui', "Pesanan {$order->order_code}: {$next->label()}.");

            return $order->refresh();
        });
    }

    public function completeOrder(Order $order, ?User $actor = null, ?string $note = null): Order
    {
        if ($order->payment_status !== PaymentStatus::Paid) {
            throw ValidationException::withMessages([
                'order' => 'Pesanan belum dibayar.',
            ]);
        }

        $order->loadMissing('items.product', 'merchant');

        $order->update([
            'status' => OrderStatus::Completed,
            'completed_at' => now(),
            'is_verified_by_qr' => true,
            'verified_at' => now(),
            'verified_by_user_id' => $actor?->id,
            'status_history' => $this->appendHistory(
                $order->status_history,
                OrderStatus::Completed,
                $note ?? 'Pesanan diambil dan diverifikasi.',
            ),
        ]);

        foreach ($order->items as $item) {
            $item->product?->increment('portions_rescued_count', $item->quantity);
        }

        $order->merchant?->increment('total_rescued_count', (int) $order->items->sum('quantity'));

        $this->impact->recordForOrder($order);
        $this->escrow->releaseForOrder($order, 'Pesanan selesai.');

        $this->notify($order->user, 'Pesanan selesai', "Terima kasih! Pesanan {$order->order_code} sudah selesai.");
        $this->notify($order->merchant?->user, 'Pesanan selesai', "Pesanan {$order->order_code} sudah diambil pembeli.");

        return $order->refresh();
    }

    public function verifyPickup(Order $order, User $actor, ?string $pickupCode = null, ?string $qrToken = null): Order
    {
        if ($order->merchant?->user_id !== $actor->id && ! $actor->isAdmin()) {
            throw ValidationException::withMessages(['order' => 'Anda tidak berhak memverifikasi pesanan ini.']);
        }

        $validCode = ($pickupCode !== null && hash_equals((string) $order->pickup_code, $pickupCode))
            || ($qrToken !== null && hash_equals((string) $order->qr_code_token, $qrToken));

        if (! $validCode) {
            throw ValidationException::withMessages(['pickup_code' => 'Kode pengambilan tidak valid.']);
        }

        return $this->transitionOrder($order, OrderStatus::Completed, $actor, 'Verifikasi pengambilan berhasil.');
    }

    public function expireStaleGroups(): int
    {
        $groups = OrderGroup::query()
            ->where('status', OrderStatus::PendingPayment)
            ->where('expires_at', '<=', now())
            ->get();

        foreach ($groups as $group) {
            $this->cancelGroup($group, null, 'Batas waktu pembayaran habis.', true);
        }

        return $groups->count();
    }

    /**
     * @return array<string, mixed>
     */
    private function historyEntry(OrderStatus $status, ?string $note): array
    {
        return [
            'status' => $status->value,
            'timestamp' => now()->format('d M Y, H:i').' WIB',
            'note' => $note,
        ];
    }

    /**
     * @param  array<int, array<string, mixed>>|null  $history
     * @return array<int, array<string, mixed>>
     */
    private function appendHistory(?array $history, OrderStatus $status, ?string $note): array
    {
        $history = $history ?? [];
        $history[] = $this->historyEntry($status, $note);

        return $history;
    }

    private function notify(?User $user, string $title, string $body): void
    {
        $user?->notify(new SystemNotification($title, $body));
    }

    private function nextGroupCode(): string
    {
        do {
            $code = 'SPG-'.now()->format('ymd').'-'.strtoupper(Str::random(5));
        } while (OrderGroup::query()->where('group_code', $code)->exists());

        return $code;
    }

    private function nextOrderCode(): string
    {
        $prefix = 'SP-BDG-'.now()->format('Y').'-';

        $last = Order::query()
            ->where('order_code', 'like', $prefix.'%')
            ->orderByDesc('order_code')
            ->value('order_code');

        $sequence = $last ? (int) str($last)->afterLast('-')->value() + 1 : 1;

        return $prefix.str_pad((string) $sequence, 4, '0', STR_PAD_LEFT);
    }

    private function nextPickupCode(): string
    {
        do {
            $code = 'SP-'.random_int(1000, 9999);
        } while (Order::query()->where('pickup_code', $code)->exists());

        return $code;
    }

    /**
     * @return array{orders: int, merchants: int}
     */
    public function sellerStats(Merchant $merchant): array
    {
        return [
            'orders' => Order::query()->where('merchant_id', $merchant->id)->count(),
            'merchants' => 1,
        ];
    }
}
