<?php

namespace App\Http\Controllers\Api\Admin;

use App\Enums\ReviewStatus;
use App\Http\Controllers\Controller;
use App\Http\Resources\ReviewResource;
use App\Models\Review;
use App\Services\ReviewService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Validation\Rules\Enum;

class ReviewController extends Controller
{
    public function __construct(private readonly ReviewService $reviews)
    {
    }

    public function index(Request $request): AnonymousResourceCollection
    {
        $reviews = Review::query()
            ->with('reviewer', 'merchant', 'product')
            ->when($request->filled('status'), fn ($query) => $query->where('moderation_status', $request->string('status')))
            ->when($request->filled('merchant'), fn ($query) => $query->whereHas(
                'merchant',
                fn ($merchant) => $merchant->where('code', $request->string('merchant'))
            ))
            ->latest()
            ->paginate((int) $request->integer('per_page', 20));

        return ReviewResource::collection($reviews->withQueryString());
    }

    public function moderate(Request $request, Review $review): JsonResponse
    {
        $this->authorize('moderate', $review);

        $validated = $request->validate([
            'status' => ['required', new Enum(ReviewStatus::class)],
            'reason' => ['nullable', 'string', 'max:500'],
            'admin_reply' => ['nullable', 'string', 'max:1000'],
        ]);

        $review->update([
            'moderated_by' => $request->user()->id,
            'admin_reply' => $validated['admin_reply'] ?? $review->admin_reply,
        ]);

        $updated = $this->reviews->moderate(
            $review,
            ReviewStatus::from($validated['status']),
            $validated['reason'] ?? null,
        );

        return response()->json(['data' => new ReviewResource($updated->load('reviewer', 'merchant', 'product'))]);
    }
}
