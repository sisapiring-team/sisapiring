<?php

namespace App\Http\Controllers\Api\Buyer;

use App\Http\Controllers\Controller;
use App\Http\Resources\ReviewResource;
use App\Models\Review;
use App\Services\ReviewService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class ReviewController extends Controller
{
    public function __construct(private readonly ReviewService $reviews)
    {
    }

    public function index(Request $request): AnonymousResourceCollection
    {
        $reviews = Review::query()
            ->where('reviewer_user_id', $request->user()->id)
            ->with('merchant', 'product')
            ->latest()
            ->paginate((int) $request->integer('per_page', 10));

        return ReviewResource::collection($reviews->withQueryString());
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'order_item_id' => ['required', 'integer', 'exists:order_items,id'],
            'rating' => ['required', 'integer', 'between:1,5'],
            'comment' => ['required', 'string', 'max:2000'],
            'tags' => ['nullable', 'array'],
            'tags.*' => ['string', 'max:50'],
        ]);

        $review = $this->reviews->create($request->user(), $validated);

        return response()->json(['data' => new ReviewResource($review)], 201);
    }

    public function update(Request $request, Review $review): JsonResponse
    {
        $this->authorize('update', $review);

        $validated = $request->validate([
            'rating' => ['sometimes', 'integer', 'between:1,5'],
            'comment' => ['sometimes', 'string', 'max:2000'],
            'tags' => ['sometimes', 'nullable', 'array'],
            'tags.*' => ['string', 'max:50'],
        ]);

        $updated = $this->reviews->update($review, $validated);

        return response()->json(['data' => new ReviewResource($updated)]);
    }
}
