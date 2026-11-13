<?php

namespace App\Http\Controllers\Api\Admin;

use App\Enums\DisputeStatus;
use App\Enums\ModerationStatus;
use App\Enums\PaymentStatus;
use App\Enums\VerificationStatus;
use App\Http\Controllers\Controller;
use App\Http\Resources\OrderResource;
use App\Models\Dispute;
use App\Models\Merchant;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use App\Services\ImpactService;
use Illuminate\Http\JsonResponse;

class DashboardController extends Controller
{
    public function __construct(private readonly ImpactService $impact)
    {
    }

    public function index(): JsonResponse
    {
        $recentOrders = Order::query()
            ->with(['items.product', 'merchant'])
            ->latest()
            ->limit(8)
            ->get();

        return response()->json([
            'stats' => [
                'users' => User::query()->count(),
                'buyers' => User::query()->where('role', 'buyer')->count(),
                'sellers' => User::query()->where('role', 'seller')->count(),
                'merchantsPending' => Merchant::query()->where('verification_status', VerificationStatus::PendingReview->value)->count(),
                'merchantsVerified' => Merchant::query()->where('verification_status', VerificationStatus::Verified->value)->count(),
                'productsUnderReview' => Product::query()->where('moderation_status', ModerationStatus::UnderReview->value)->count(),
                'orders' => Order::query()->count(),
                'revenue' => (float) Order::query()->where('payment_status', PaymentStatus::Paid)->sum('total_payment'),
                'openDisputes' => Dispute::query()->whereIn('status', [DisputeStatus::Open->value, DisputeStatus::Investigating->value])->count(),
                'impact' => $this->impact->platformTotals(),
            ],
            'recentOrders' => OrderResource::collection($recentOrders),
        ]);
    }
}
