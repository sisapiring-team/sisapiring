<?php

namespace App\Http\Controllers\Api;

use App\Enums\ReviewStatus;
use App\Enums\VerificationStatus;
use App\Http\Controllers\Controller;
use App\Http\Resources\MerchantResource;
use App\Http\Resources\ProductResource;
use App\Http\Resources\ReviewResource;
use App\Models\Merchant;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class MerchantController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $merchants = Merchant::query()
            ->where('verification_status', VerificationStatus::Verified->value)
            ->withCount('products')
            ->when($request->filled('q'), fn ($query) => $query->where('business_name', 'like', '%'.$request->string('q').'%'))
            ->when($request->filled('district'), fn ($query) => $query->where('district', $request->string('district')))
            ->when($request->filled('category'), fn ($query) => $query->where('business_category', $request->string('category')))
            ->orderByDesc('rating')
            ->paginate((int) $request->integer('per_page', 12));

        return MerchantResource::collection($merchants->withQueryString());
    }

    public function show(Merchant $merchant): JsonResponse
    {
        abort_unless($merchant->verification_status === VerificationStatus::Verified, 404);

        $merchant->load([
            'products' => fn ($query) => $query->visible()->orderByDesc('created_at')->limit(24),
            'reviews' => fn ($query) => $query->where('moderation_status', ReviewStatus::Published->value)
                ->with('reviewer')
                ->latest()
                ->limit(20),
        ]);

        return response()->json([
            'merchant' => new MerchantResource($merchant),
            'products' => ProductResource::collection($merchant->products),
            'reviews' => ReviewResource::collection($merchant->reviews),
        ]);
    }
}
