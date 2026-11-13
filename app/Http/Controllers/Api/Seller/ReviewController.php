<?php

namespace App\Http\Controllers\Api\Seller;

use App\Http\Controllers\Controller;
use App\Http\Resources\ReviewResource;
use App\Models\Review;
use App\Notifications\SystemNotification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class ReviewController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $merchant = $request->user()->merchant;
        abort_unless($merchant, 404);

        $reviews = Review::query()
            ->where('merchant_id', $merchant->id)
            ->with('reviewer', 'product')
            ->when($request->filled('rating'), fn ($query) => $query->where('rating', $request->integer('rating')))
            ->when($request->boolean('unreplied'), fn ($query) => $query->whereNull('merchant_reply'))
            ->latest()
            ->paginate((int) $request->integer('per_page', 15));

        return ReviewResource::collection($reviews->withQueryString());
    }

    public function reply(Request $request, Review $review): JsonResponse
    {
        $merchant = $request->user()->merchant;
        abort_unless($merchant && $review->merchant_id === $merchant->id, 403);

        $validated = $request->validate([
            'reply' => ['required', 'string', 'max:1000'],
        ]);

        $review->update([
            'merchant_reply' => $validated['reply'],
            'merchant_replied_at' => now(),
        ]);

        $review->loadMissing('reviewer');
        $review->reviewer?->notify(new SystemNotification(
            'Balasan ulasan',
            'Mitra membalas ulasan Anda.',
            ['review_id' => $review->id],
        ));

        return response()->json(['data' => new ReviewResource($review->refresh())]);
    }
}
