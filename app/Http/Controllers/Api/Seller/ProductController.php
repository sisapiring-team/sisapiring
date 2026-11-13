<?php

namespace App\Http\Controllers\Api\Seller;

use App\Enums\ModerationStatus;
use App\Enums\VerificationStatus;
use App\Http\Controllers\Controller;
use App\Http\Resources\ProductResource;
use App\Models\Product;
use App\Models\ProductPriceHistory;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class ProductController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $merchant = $request->user()->merchant;
        abort_unless($merchant, 404);

        $products = Product::query()
            ->where('merchant_id', $merchant->id)
            ->when($request->filled('q'), fn ($query) => $query->where('name', 'like', '%'.$request->string('q').'%'))
            ->when($request->filled('status'), fn ($query) => $query->where('moderation_status', $request->string('status')))
            ->when($request->boolean('low_stock'), fn ($query) => $query->where('stock', '<=', 5))
            ->latest()
            ->paginate((int) $request->integer('per_page', 20));

        return ProductResource::collection($products->withQueryString());
    }

    public function store(Request $request): JsonResponse
    {
        $merchant = $request->user()->merchant;
        abort_unless($merchant, 404);

        $validated = $this->validatePayload($request);

        $discount = (int) $validated['discount_percentage'];
        $originalPrice = (float) $validated['original_price'];
        $discountedPrice = $this->discountedPrice($originalPrice, $discount);

        $product = DB::transaction(function () use ($validated, $merchant, $discount, $originalPrice, $discountedPrice) {
            $product = Product::query()->create([
                ...$validated,
                'code' => $this->nextCode(),
                'merchant_id' => $merchant->id,
                'discounted_price' => $discountedPrice,
                'weight_grams' => (int) ($validated['weight_grams'] ?? 350),
                'is_active' => $validated['is_active'] ?? true,
                'moderation_status' => $merchant->verification_status === VerificationStatus::Verified
                    ? ModerationStatus::Active
                    : ModerationStatus::UnderReview,
            ]);

            ProductPriceHistory::query()->create([
                'product_id' => $product->id,
                'changed_by' => $merchant->user_id,
                'original_price' => $originalPrice,
                'discounted_price' => $discountedPrice,
                'discount_percentage' => $discount,
            ]);

            return $product;
        });

        return response()->json(['data' => new ProductResource($product)], 201);
    }

    public function show(Request $request, Product $product): ProductResource
    {
        $this->authorize('view', $product);

        return new ProductResource($product);
    }

    public function update(Request $request, Product $product): JsonResponse
    {
        $this->authorize('update', $product);

        $validated = $this->validatePayload($request, true);
        $originalPrice = (float) ($validated['original_price'] ?? $product->original_price);
        $discount = (int) ($validated['discount_percentage'] ?? $product->discount_percentage);

        $priceChanged = isset($validated['original_price']) || isset($validated['discount_percentage']);

        $product->update([
            ...$validated,
            'discounted_price' => $priceChanged
                ? $this->discountedPrice($originalPrice, $discount)
                : $product->discounted_price,
        ]);

        if ($priceChanged) {
            ProductPriceHistory::query()->create([
                'product_id' => $product->id,
                'changed_by' => $request->user()->id,
                'original_price' => $originalPrice,
                'discounted_price' => $product->discounted_price,
                'discount_percentage' => $discount,
            ]);
        }

        return response()->json(['data' => new ProductResource($product->refresh())]);
    }

    public function destroy(Request $request, Product $product): JsonResponse
    {
        $this->authorize('delete', $product);

        $product->delete();

        return response()->json(['message' => 'Produk dihapus.']);
    }

    public function updateStock(Request $request, Product $product): JsonResponse
    {
        $this->authorize('update', $product);

        $validated = $request->validate([
            'stock' => ['required', 'integer', 'min:0'],
        ]);

        if ($validated['stock'] < $product->locked_stock) {
            throw ValidationException::withMessages([
                'stock' => 'Stok tidak boleh lebih kecil dari stok yang sedang terkunci.',
            ]);
        }

        $product->update(['stock' => $validated['stock']]);

        return response()->json(['data' => new ProductResource($product->refresh())]);
    }

    public function applyDiscount(Request $request, Product $product): JsonResponse
    {
        $this->authorize('update', $product);

        $validated = $request->validate([
            'discount_percentage' => ['required', 'integer', 'in:50,70,90,100'],
        ]);

        $discount = (int) $validated['discount_percentage'];

        $product->update([
            'discount_percentage' => $discount,
            'discounted_price' => $this->discountedPrice((float) $product->original_price, $discount),
        ]);

        ProductPriceHistory::query()->create([
            'product_id' => $product->id,
            'changed_by' => $request->user()->id,
            'original_price' => $product->original_price,
            'discounted_price' => $product->discounted_price,
            'discount_percentage' => $discount,
        ]);

        return response()->json(['data' => new ProductResource($product->refresh())]);
    }

    public function toggleActive(Request $request, Product $product): JsonResponse
    {
        $this->authorize('update', $product);

        $product->update(['is_active' => ! $product->is_active]);

        return response()->json(['data' => new ProductResource($product->refresh())]);
    }

    /**
     * @return array<string, mixed>
     */
    private function validatePayload(Request $request, bool $partial = false): array
    {
        $required = $partial ? 'sometimes' : 'required';

        return $request->validate([
            'name' => [$required, 'string', 'max:255'],
            'category' => [$required, 'string', 'max:255'],
            'image' => ['sometimes', 'nullable', 'string', 'max:2048'],
            'description' => ['sometimes', 'nullable', 'string', 'max:2000'],
            'original_price' => [$required, 'numeric', 'min:0'],
            'discount_percentage' => [$required, 'integer', 'in:50,70,90,100'],
            'stock' => [$required, 'integer', 'min:0'],
            'weight_grams' => ['sometimes', 'integer', 'min:1'],
            'production_time' => ['sometimes', 'nullable', 'string', 'max:255'],
            'safe_consumption_deadline' => ['sometimes', 'nullable', 'string', 'max:255'],
            'safe_deadline_at' => ['sometimes', 'nullable', 'date'],
            'pickup_schedule_start' => ['sometimes', 'nullable', 'string', 'max:50'],
            'pickup_schedule_end' => ['sometimes', 'nullable', 'string', 'max:50'],
            'storage_instruction' => ['sometimes', 'nullable', 'string', 'max:255'],
            'food_safety_checklist' => ['sometimes', 'nullable', 'array'],
            'is_active' => ['sometimes', 'boolean'],
        ]);
    }

    private function discountedPrice(float $original, int $discount): float
    {
        return $discount === 100 ? 0 : round($original * (1 - $discount / 100), 2);
    }

    private function nextCode(): string
    {
        $last = Product::query()->orderByDesc('id')->value('code');
        $sequence = $last ? (int) str($last)->afterLast('-')->value() + 1 : 1;

        return 'PRD-'.str_pad((string) $sequence, 4, '0', STR_PAD_LEFT);
    }
}
