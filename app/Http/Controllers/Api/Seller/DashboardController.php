<?php

namespace App\Http\Controllers\Api\Seller;

use App\Enums\OrderStatus;
use App\Enums\PaymentStatus;
use App\Http\Controllers\Controller;
use App\Http\Resources\OrderResource;
use App\Models\Order;
use App\Models\Product;
use App\Services\ImpactService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DashboardController extends Controller
{
    public function __construct(private readonly ImpactService $impact)
    {
    }

    public function index(Request $request): JsonResponse
    {
        $merchant = $request->user()->merchant;
        abort_unless($merchant, 404);

        $paidOrders = Order::query()
            ->where('merchant_id', $merchant->id)
            ->where('payment_status', PaymentStatus::Paid);

        $byStatus = Order::query()
            ->where('merchant_id', $merchant->id)
            ->selectRaw('status, COUNT(*) as total')
            ->groupBy('status')
            ->pluck('total', 'status');

        $recentOrders = Order::query()
            ->where('merchant_id', $merchant->id)
            ->with(['items.product', 'merchant'])
            ->latest()
            ->limit(5)
            ->get();

        $lowStock = Product::query()
            ->where('merchant_id', $merchant->id)
            ->where('is_active', true)
            ->where('stock', '<=', 5)
            ->orderBy('stock')
            ->limit(10)
            ->get(['code', 'name', 'stock', 'locked_stock']);

        return response()->json([
            'merchant' => [
                'id' => $merchant->code,
                'businessName' => $merchant->business_name,
                'rating' => (float) $merchant->rating,
                'verificationStatus' => $merchant->verification_status?->value,
            ],
            'stats' => [
                'revenue' => (float) (clone $paidOrders)->sum('total_payment'),
                'orders' => Order::query()->where('merchant_id', $merchant->id)->count(),
                'activeProducts' => Product::query()->where('merchant_id', $merchant->id)->where('is_active', true)->count(),
                'resolvedImpact' => $this->impact->summary(null, $merchant)['totals'],
            ],
            'ordersByStatus' => collect(OrderStatus::cases())->mapWithKeys(fn ($status) => [
                $status->value => (int) ($byStatus[$status->value] ?? 0),
            ]),
            'recentOrders' => OrderResource::collection($recentOrders),
            'lowStock' => $lowStock->map(fn ($product) => [
                'id' => $product->code,
                'name' => $product->name,
                'stock' => (int) $product->stock,
                'lockedStock' => (int) $product->locked_stock,
            ]),
        ]);
    }
}
