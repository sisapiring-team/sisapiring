<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProductResource;
use App\Models\Merchant;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;
use Illuminate\Support\Facades\DB;

class ProductController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $merchant = $this->resolveMerchant($request);

        $products = Product::query()
            ->when($merchant, fn ($query) => $query->where('merchant_id', $merchant->id))
            ->latest()
            ->get();

        return ProductResource::collection($products);
    }

    public function show(Product $product): ProductResource
    {
        return new ProductResource($product);
    }

    public function store(Request $request): ProductResource
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'category' => ['required', 'string', 'max:255'],
            'image' => ['nullable', 'string', 'max:2048'],
            'description' => ['nullable', 'string'],
            'originalPrice' => ['required', 'numeric', 'min:0'],
            'discountPercentage' => ['required', 'integer', 'in:50,70,90,100'],
            'stock' => ['required', 'integer', 'min:0'],
            'weightGrams' => ['nullable', 'integer', 'min:1'],
            'productionTime' => ['nullable', 'string', 'max:255'],
            'safeConsumptionDeadline' => ['nullable', 'string', 'max:255'],
            'safeDeadlineTimestamp' => ['nullable', 'integer'],
            'pickupScheduleStart' => ['nullable', 'string', 'max:50'],
            'pickupScheduleEnd' => ['nullable', 'string', 'max:50'],
            'storageInstruction' => ['nullable', 'string', 'max:255'],
            'foodSafetyChecklist' => ['nullable', 'array'],
            'isActive' => ['sometimes', 'boolean'],
            'merchantCode' => ['nullable', 'string'],
        ]);

        $merchant = $this->resolveMerchant($request, $validated['merchantCode'] ?? null);

        if (! $merchant) {
            return response()->json(['message' => 'Merchant tidak ditemukan.'], 422);
        }

        $discount = (int) $validated['discountPercentage'];
        $originalPrice = (float) $validated['originalPrice'];

        $product = DB::transaction(function () use ($validated, $merchant, $discount, $originalPrice) {
            return Product::query()->create([
                'code' => $this->nextCode(),
                'merchant_id' => $merchant->id,
                'name' => $validated['name'],
                'category' => $validated['category'],
                'image' => $validated['image'] ?? null,
                'description' => $validated['description'] ?? null,
                'original_price' => $originalPrice,
                'discount_percentage' => $discount,
                'discounted_price' => $discount === 100 ? 0 : round($originalPrice * (1 - $discount / 100), 2),
                'stock' => (int) $validated['stock'],
                'weight_grams' => (int) ($validated['weightGrams'] ?? 350),
                'production_time' => $validated['productionTime'] ?? null,
                'safe_consumption_deadline' => $validated['safeConsumptionDeadline'] ?? null,
                'safe_deadline_at' => isset($validated['safeDeadlineTimestamp'])
                    ? now()->addMilliseconds($validated['safeDeadlineTimestamp'] - now()->getTimestampMs())
                    : null,
                'pickup_schedule_start' => $validated['pickupScheduleStart'] ?? null,
                'pickup_schedule_end' => $validated['pickupScheduleEnd'] ?? null,
                'storage_instruction' => $validated['storageInstruction'] ?? 'Suhu Ruang (Kering & Sejuk)',
                'food_safety_checklist' => $validated['foodSafetyChecklist'] ?? null,
                'is_active' => $validated['isActive'] ?? true,
            ]);
        });

        return new ProductResource($product->refresh());
    }

    public function update(Request $request, Product $product): ProductResource
    {
        $validated = $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'category' => ['sometimes', 'string', 'max:255'],
            'image' => ['sometimes', 'nullable', 'string', 'max:2048'],
            'description' => ['sometimes', 'nullable', 'string'],
            'originalPrice' => ['sometimes', 'numeric', 'min:0'],
            'discountPercentage' => ['sometimes', 'integer', 'in:50,70,90,100'],
            'stock' => ['sometimes', 'integer', 'min:0'],
            'weightGrams' => ['sometimes', 'integer', 'min:1'],
            'productionTime' => ['sometimes', 'nullable', 'string', 'max:255'],
            'safeConsumptionDeadline' => ['sometimes', 'nullable', 'string', 'max:255'],
            'safeDeadlineTimestamp' => ['sometimes', 'nullable', 'integer'],
            'pickupScheduleStart' => ['sometimes', 'nullable', 'string', 'max:50'],
            'pickupScheduleEnd' => ['sometimes', 'nullable', 'string', 'max:50'],
            'storageInstruction' => ['sometimes', 'nullable', 'string', 'max:255'],
            'foodSafetyChecklist' => ['sometimes', 'nullable', 'array'],
            'isActive' => ['sometimes', 'boolean'],
        ]);

        $updated = [
            'name' => $validated['name'] ?? $product->name,
            'category' => $validated['category'] ?? $product->category,
            'image' => $validated['image'] ?? $product->image,
            'description' => $validated['description'] ?? $product->description,
            'original_price' => $validated['originalPrice'] ?? $product->original_price,
            'discount_percentage' => $validated['discountPercentage'] ?? $product->discount_percentage,
            'stock' => $validated['stock'] ?? $product->stock,
            'weight_grams' => $validated['weightGrams'] ?? $product->weight_grams,
            'production_time' => $validated['productionTime'] ?? $product->production_time,
            'safe_consumption_deadline' => $validated['safeConsumptionDeadline'] ?? $product->safe_consumption_deadline,
            'pickup_schedule_start' => $validated['pickupScheduleStart'] ?? $product->pickup_schedule_start,
            'pickup_schedule_end' => $validated['pickupScheduleEnd'] ?? $product->pickup_schedule_end,
            'storage_instruction' => $validated['storageInstruction'] ?? $product->storage_instruction,
            'food_safety_checklist' => $validated['foodSafetyChecklist'] ?? $product->food_safety_checklist,
            'is_active' => $validated['isActive'] ?? $product->is_active,
        ];

        if (array_key_exists('safeDeadlineTimestamp', $validated)) {
            $updated['safe_deadline_at'] = $validated['safeDeadlineTimestamp'] !== null
                ? now()->addMilliseconds($validated['safeDeadlineTimestamp'] - now()->getTimestampMs())
                : null;
        }

        if (isset($validated['originalPrice']) || isset($validated['discountPercentage'])) {
            $updated['discounted_price'] = (int) $updated['discount_percentage'] === 100
                ? 0
                : round((float) $updated['original_price'] * (1 - (int) $updated['discount_percentage'] / 100), 2);
        }

        $product->update($updated);

        return new ProductResource($product->refresh());
    }

    public function destroy(Product $product): Response
    {
        $product->delete();

        return response()->noContent();
    }

    public function updateStock(Request $request, Product $product): ProductResource
    {
        $validated = $request->validate([
            'delta' => ['required', 'integer'],
            'stock' => ['nullable', 'integer', 'min:0'],
        ]);

        $newStock = array_key_exists('stock', $validated) && $validated['stock'] !== null
            ? (int) $validated['stock']
            : max(0, $product->stock + (int) $validated['delta']);

        $product->update(['stock' => $newStock]);

        return new ProductResource($product->refresh());
    }

    public function applyDiscount(Request $request, Product $product): ProductResource
    {
        $validated = $request->validate([
            'discountPercentage' => ['required', 'integer', 'in:50,70,90,100'],
        ]);

        $discount = (int) $validated['discountPercentage'];
        $product->update([
            'discount_percentage' => $discount,
            'discounted_price' => $discount === 100
                ? 0
                : round((float) $product->original_price * (1 - $discount / 100), 2),
        ]);

        return new ProductResource($product->refresh());
    }

    private function resolveMerchant(Request $request, ?string $merchantCode = null): ?Merchant
    {
        if ($merchantCode) {
            return Merchant::query()->where('code', $merchantCode)->first();
        }

        return $request->user()?->merchant
            ?? Merchant::query()->orderBy('id')->first();
    }

    private function nextCode(): string
    {
        $last = Product::query()->orderByDesc('id')->value('code');
        $sequence = $last ? (int) str($last)->afterLast('-')->value() + 1 : 1;

        return 'PRD-'.str_pad((string) $sequence, 3, '0', STR_PAD_LEFT);
    }
}
