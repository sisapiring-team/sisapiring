<?php

namespace App\Http\Controllers\Api\Seller;

use App\Enums\OrderStatus;
use App\Http\Controllers\Controller;
use App\Http\Resources\OrderResource;
use App\Models\Order;
use App\Services\OrderService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Validation\Rules\Enum;

class OrderController extends Controller
{
    public function __construct(private readonly OrderService $orders)
    {
    }

    public function index(Request $request): AnonymousResourceCollection
    {
        $merchant = $request->user()->merchant;
        abort_unless($merchant, 404);

        $orders = Order::query()
            ->where('merchant_id', $merchant->id)
            ->with(['items.product', 'items.review', 'merchant', 'group', 'user'])
            ->when($request->filled('status'), fn ($query) => $query->where('status', $request->string('status')))
            ->when($request->filled('q'), fn ($query) => $query->where(
                fn ($inner) => $inner->where('order_code', 'like', '%'.$request->string('q').'%')
                    ->orWhere('customer_name', 'like', '%'.$request->string('q').'%')
            ))
            ->latest()
            ->paginate((int) $request->integer('per_page', 15));

        return OrderResource::collection($orders->withQueryString());
    }

    public function show(Request $request, Order $order): OrderResource
    {
        $this->authorize('view', $order);

        return new OrderResource($order->load(['items.product', 'items.review', 'merchant', 'group', 'user']));
    }

    public function updateStatus(Request $request, Order $order): JsonResponse
    {
        $this->authorize('updateStatus', $order);

        $validated = $request->validate([
            'status' => ['required', new Enum(OrderStatus::class)],
            'note' => ['nullable', 'string', 'max:255'],
        ]);

        $updated = $this->orders->transitionOrder(
            $order,
            OrderStatus::from($validated['status']),
            $request->user(),
            $validated['note'] ?? null,
        );

        return response()->json(['data' => new OrderResource($updated->load('items.product', 'merchant'))]);
    }

    public function verify(Request $request, Order $order): JsonResponse
    {
        $this->authorize('verifyPickup', $order);

        $validated = $request->validate([
            'pickup_code' => ['nullable', 'string', 'max:20'],
            'qr_token' => ['nullable', 'string', 'max:100'],
        ]);

        $updated = $this->orders->verifyPickup(
            $order,
            $request->user(),
            $validated['pickup_code'] ?? null,
            $validated['qr_token'] ?? null,
        );

        return response()->json([
            'message' => 'Pengambilan berhasil diverifikasi.',
            'data' => new OrderResource($updated->load('items.product', 'merchant')),
        ]);
    }
}
