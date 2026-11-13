<?php

namespace App\Services;

use App\Enums\OrderStatus;
use App\Enums\ReviewStatus;
use App\Models\Merchant;
use App\Models\Review;
use App\Models\User;
use Illuminate\Validation\ValidationException;

class ReviewService
{
    /**
     * @param  array{order_item_id: int, rating: int, comment: string, tags?: array<int, string>}  $data
     */
    public function create(User $user, array $data): Review
    {
        $orderItem = $user->orders()
            ->whereIn('status', [OrderStatus::Completed->value])
            ->whereHas('items', fn ($query) => $query->whereKey($data['order_item_id']))
            ->first()
            ?->items()
            ->with('order', 'product')
            ->find($data['order_item_id']);

        if (! $orderItem) {
            throw ValidationException::withMessages([
                'order_item_id' => 'Item pesanan tidak ditemukan atau pesanan belum selesai.',
            ]);
        }

        if ($orderItem->review()->exists()) {
            throw ValidationException::withMessages([
                'order_item_id' => 'Item pesanan ini sudah diulas.',
            ]);
        }

        $review = Review::query()->create([
            'order_id' => $orderItem->order_id,
            'order_item_id' => $orderItem->id,
            'merchant_id' => $orderItem->order->merchant_id,
            'product_id' => $orderItem->product_id,
            'reviewer_user_id' => $user->id,
            'rating' => max(1, min(5, (int) $data['rating'])),
            'comment' => $data['comment'],
            'tags' => $data['tags'] ?? null,
            'moderation_status' => ReviewStatus::Published,
        ]);

        $this->recomputeMerchantRating($review->merchant_id);

        return $review->load('merchant', 'product', 'reviewer');
    }

    /**
     * @param  array{rating?: int, comment?: string, tags?: array<int, string>}  $data
     */
    public function update(Review $review, array $data): Review
    {
        $review->update([
            'rating' => isset($data['rating']) ? max(1, min(5, (int) $data['rating'])) : $review->rating,
            'comment' => $data['comment'] ?? $review->comment,
            'tags' => $data['tags'] ?? $review->tags,
        ]);

        $this->recomputeMerchantRating($review->merchant_id);

        return $review->refresh();
    }

    public function moderate(Review $review, ReviewStatus $status, ?string $reason = null): Review
    {
        $review->update([
            'moderation_status' => $status,
            'flag_reason' => $reason,
            'moderated_at' => now(),
        ]);

        $this->recomputeMerchantRating($review->merchant_id);

        return $review->refresh();
    }

    public function recomputeMerchantRating(int $merchantId): void
    {
        $average = Review::query()
            ->where('merchant_id', $merchantId)
            ->where('moderation_status', ReviewStatus::Published->value)
            ->avg('rating');

        Merchant::query()->whereKey($merchantId)->update([
            'rating' => round((float) ($average ?? 0), 2),
        ]);
    }
}
