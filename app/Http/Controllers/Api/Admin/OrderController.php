<?php

namespace App\Http\Controllers\Api\Admin;

use App\Enums\PaymentStatus;
use App\Http\Controllers\Controller;
use App\Http\Resources\OrderGroupResource;
use App\Http\Resources\OrderResource;
use App\Models\Order;
use App\Models\OrderGroup;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class OrderController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $orders = Order::query()
            ->with(['items.product', 'merchant', 'user', 'group'])
            ->when($request->filled('status'), fn ($query) => $query->where('status', $request->string('status')))
            ->when($request->filled('payment_status'), fn ($query) => $query->where('payment_status', $request->string('payment_status')))
            ->when($request->filled('merchant'), fn ($query) => $query->whereHas(
                'merchant',
                fn ($merchant) => $merchant->where('code', $request->string('merchant'))
            ))
            ->when($request->filled('q'), fn ($query) => $query->where(
                fn ($inner) => $inner->where('order_code', 'like', '%'.$request->string('q').'%')
                    ->orWhere('customer_name', 'like', '%'.$request->string('q').'%')
            ))
            ->latest()
            ->paginate((int) $request->integer('per_page', 20));

        return OrderResource::collection($orders->withQueryString());
    }

    public function show(Order $order): OrderResource
    {
        return new OrderResource($order->load(['items.product', 'merchant', 'user', 'group.payment', 'disputes']));
    }

    public function groups(Request $request): AnonymousResourceCollection
    {
        $groups = OrderGroup::query()
            ->with(['orders.merchant', 'payment', 'user'])
            ->when($request->filled('payment_status'), fn ($query) => $query->where('payment_status', $request->string('payment_status')))
            ->latest()
            ->paginate((int) $request->integer('per_page', 20));

        return OrderGroupResource::collection($groups->withQueryString());
    }
}
