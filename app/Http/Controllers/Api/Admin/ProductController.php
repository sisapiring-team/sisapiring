<?php

namespace App\Http\Controllers\Api\Admin;

use App\Enums\ModerationStatus;
use App\Http\Controllers\Controller;
use App\Http\Resources\ProductResource;
use App\Models\Product;
use App\Models\ProductModeration;
use App\Notifications\SystemNotification;
use App\Services\AuditService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Validation\Rules\Enum;

class ProductController extends Controller
{
    public function __construct(private readonly AuditService $audit)
    {
    }

    public function index(Request $request): AnonymousResourceCollection
    {
        $products = Product::query()
            ->with('merchant')
            ->when($request->filled('status'), fn ($query) => $query->where('moderation_status', $request->string('status')))
            ->when($request->filled('merchant'), fn ($query) => $query->whereHas(
                'merchant',
                fn ($merchant) => $merchant->where('code', $request->string('merchant'))
            ))
            ->when($request->filled('q'), fn ($query) => $query->where('name', 'like', '%'.$request->string('q').'%'))
            ->latest()
            ->paginate((int) $request->integer('per_page', 20));

        return ProductResource::collection($products->withQueryString());
    }

    public function moderate(Request $request, Product $product): JsonResponse
    {
        $this->authorize('moderate', $product);

        $validated = $request->validate([
            'status' => ['required', new Enum(ModerationStatus::class)],
            'reason' => ['nullable', 'string', 'max:1000'],
        ]);

        $status = ModerationStatus::from($validated['status']);
        $from = $product->moderation_status;

        $product->update([
            'moderation_status' => $status,
            'takedown_reason' => $status === ModerationStatus::TakenDown ? ($validated['reason'] ?? null) : null,
            'last_checked_at' => now(),
            'moderated_by' => $request->user()->id,
            'is_active' => $status === ModerationStatus::TakenDown ? false : $product->is_active,
        ]);

        ProductModeration::query()->create([
            'product_id' => $product->id,
            'actor_user_id' => $request->user()->id,
            'action' => $status->value,
            'from_status' => $from,
            'to_status' => $status,
            'reason' => $validated['reason'] ?? null,
        ]);

        $product->loadMissing('merchant.user');
        $product->merchant?->user?->notify(new SystemNotification(
            'Moderasi produk',
            "Produk {$product->name} sekarang berstatus {$status->value}.",
            ['product_id' => $product->id],
        ));

        $this->audit->log($request->user(), 'product.moderated', $product, ['status' => $from?->value], ['status' => $status->value], $request);

        return response()->json(['data' => new ProductResource($product->refresh())]);
    }
}
