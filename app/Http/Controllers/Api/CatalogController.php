<?php

namespace App\Http\Controllers\Api;

use App\Enums\VerificationStatus;
use App\Http\Controllers\Controller;
use App\Http\Resources\CatalogItemResource;
use App\Http\Resources\ProductResource;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class CatalogController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $validated = $request->validate([
            'q' => ['nullable', 'string', 'max:100'],
            'category' => ['nullable', 'string', 'max:100'],
            'district' => ['nullable', 'string', 'max:100'],
            'merchant' => ['nullable', 'string', 'max:100'],
            'min_price' => ['nullable', 'numeric', 'min:0'],
            'max_price' => ['nullable', 'numeric', 'min:0'],
            'min_discount' => ['nullable', 'integer', 'between:0,100'],
            'sort' => ['nullable', 'in:latest,price_asc,price_desc,discount,rating'],
            'per_page' => ['nullable', 'integer', 'between:1,50'],
        ]);

        $products = Product::query()
            ->visible()
            ->with('merchant')
            ->whereHas('merchant', fn ($query) => $query->where('verification_status', VerificationStatus::Verified->value))
            ->when($validated['q'] ?? null, fn ($query, $q) => $query->where(
                fn ($inner) => $inner->where('name', 'like', "%{$q}%")
                    ->orWhere('description', 'like', "%{$q}%")
                    ->orWhere('category', 'like', "%{$q}%")
            ))
            ->when($validated['category'] ?? null, fn ($query, $category) => $query->where('category', $category))
            ->when($validated['merchant'] ?? null, fn ($query, $code) => $query->whereHas(
                'merchant',
                fn ($merchant) => $merchant->where('code', $code)
            ))
            ->when($validated['district'] ?? null, fn ($query, $district) => $query->whereHas(
                'merchant',
                fn ($merchant) => $merchant->where('district', $district)
            ))
            ->when($validated['min_price'] ?? null, fn ($query, $price) => $query->where('discounted_price', '>=', $price))
            ->when($validated['max_price'] ?? null, fn ($query, $price) => $query->where('discounted_price', '<=', $price))
            ->when($validated['min_discount'] ?? null, fn ($query, $discount) => $query->where('discount_percentage', '>=', $discount));

        match ($validated['sort'] ?? 'latest') {
            'price_asc' => $products->orderBy('discounted_price'),
            'price_desc' => $products->orderByDesc('discounted_price'),
            'discount' => $products->orderByDesc('discount_percentage'),
            'rating' => $products->orderByDesc(
                \App\Models\Merchant::select('rating')
                    ->whereColumn('merchants.id', 'products.merchant_id')
            ),
            default => $products->latest(),
        };

        return CatalogItemResource::collection(
            $products->paginate((int) ($validated['per_page'] ?? 12))->withQueryString()
        );
    }

    public function show(Product $product): ProductResource
    {
        abort_unless($product->is_active && $product->moderation_status?->value === 'active', 404);

        return new ProductResource($product->load('merchant'));
    }

    public function categories(): \Illuminate\Http\JsonResponse
    {
        $categories = Product::query()
            ->visible()
            ->select('category')
            ->distinct()
            ->orderBy('category')
            ->pluck('category');

        return response()->json(['data' => $categories]);
    }
}
