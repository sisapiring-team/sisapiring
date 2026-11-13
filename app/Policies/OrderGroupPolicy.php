<?php

namespace App\Policies;

use App\Enums\OrderStatus;
use App\Models\OrderGroup;
use App\Models\User;

class OrderGroupPolicy
{
    public function view(User $user, OrderGroup $group): bool
    {
        return $user->isAdmin() || $group->user_id === $user->id;
    }

    public function cancel(User $user, OrderGroup $group): bool
    {
        if ($user->isAdmin()) {
            return true;
        }

        return $group->user_id === $user->id
            && in_array($group->status, [OrderStatus::PendingPayment, OrderStatus::WaitingConfirmation], true);
    }
}
