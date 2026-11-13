<?php

namespace App\Policies;

use App\Enums\OrderStatus;
use App\Enums\ReviewStatus;
use App\Models\Review;
use App\Models\User;

class ReviewPolicy
{
    public function view(User $user, Review $review): bool
    {
        return $user->isAdmin()
            || $review->reviewer_user_id === $user->id
            || $review->merchant?->user_id === $user->id;
    }

    public function create(User $user, Review $review): bool
    {
        return $review->order?->user_id === $user->id
            && $review->order?->status === OrderStatus::Completed
            && $review->order?->completed_at?->greaterThan(now()->subDays(30));
    }

    public function update(User $user, Review $review): bool
    {
        return $review->reviewer_user_id === $user->id
            && $review->moderation_status !== ReviewStatus::Removed
            && $review->created_at?->greaterThan(now()->subDays(7));
    }

    public function moderate(User $user, Review $review): bool
    {
        return $user->isAdmin();
    }
}
