<?php

namespace App\Http\Controllers\Api\Buyer;

use App\Http\Controllers\Controller;
use App\Http\Resources\OrderResource;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class OrderController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $orders = Order::query()
            ->where('user_id', $request->user()->id)
            ->with(['items.product', 'items.review', 'merchant', 'group'])
            ->when($request->filled('status'), fn ($query) => $query->where('status', $request->string('status')))
            ->latest()
            ->paginate((int) $request->integer('per_page', 10));

        return OrderResource::collection($orders->withQueryString());
    }

    public function show(Request $request, Order $order): OrderResource
    {
        $this->authorize('view', $order);

        return new OrderResource($order->load(['items.product', 'items.review', 'merchant', 'group']));
    }
}
