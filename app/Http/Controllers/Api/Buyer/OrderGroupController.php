<?php

namespace App\Http\Controllers\Api\Buyer;

use App\Http\Controllers\Controller;
use App\Http\Resources\OrderGroupResource;
use App\Http\Resources\PaymentResource;
use App\Models\OrderGroup;
use App\Services\OrderService;
use App\Services\PaymentService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class OrderGroupController extends Controller
{
    public function __construct(
        private readonly OrderService $orders,
        private readonly PaymentService $payments,
    ) {
    }

    public function index(Request $request): AnonymousResourceCollection
    {
        $groups = OrderGroup::query()
            ->where('user_id', $request->user()->id)
            ->with(['orders.items.product', 'orders.merchant', 'payment'])
            ->when($request->filled('status'), fn ($query) => $query->where('status', $request->string('status')))
            ->latest()
            ->paginate((int) $request->integer('per_page', 10));

        return OrderGroupResource::collection($groups->withQueryString());
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'items' => ['required', 'array', 'min:1'],
            'items.*.product_code' => ['required', 'string', 'exists:products,code'],
            'items.*.quantity' => ['required', 'integer', 'min:1', 'max:50'],
            'customer_name' => ['required', 'string', 'max:255'],
            'customer_phone' => ['required', 'string', 'max:50'],
            'buyer_note' => ['nullable', 'string', 'max:500'],
        ]);

        $group = $this->orders->createGroup(
            $request->user(),
            $validated['items'],
            ['name' => $validated['customer_name'], 'phone' => $validated['customer_phone']],
            $validated['buyer_note'] ?? null,
        );

        return response()->json(['data' => new OrderGroupResource($group)], 201);
    }

    public function show(Request $request, OrderGroup $group): OrderGroupResource
    {
        $this->authorize('view', $group);

        return new OrderGroupResource(
            $group->load(['orders.items.product', 'orders.merchant', 'payment', 'user'])
        );
    }

    public function cancel(Request $request, OrderGroup $group): JsonResponse
    {
        $this->authorize('cancel', $group);

        $validated = $request->validate([
            'reason' => ['required', 'string', 'max:255'],
        ]);

        $this->orders->cancelGroup($group, $request->user(), $validated['reason']);

        return response()->json([
            'message' => 'Pesanan dibatalkan.',
            'data' => new OrderGroupResource($group->refresh()->load('orders.items.product', 'orders.merchant')),
        ]);
    }

    public function pay(Request $request, OrderGroup $group): JsonResponse
    {
        $this->authorize('view', $group);

        $payment = $this->payments->initiate($group);

        return response()->json([
            'data' => new PaymentResource($payment),
            'paymentUrl' => $payment->payment_url,
        ]);
    }
}
