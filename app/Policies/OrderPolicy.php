<?php

namespace App\Policies;

use App\Enums\OrderStatus;
use App\Enums\UserRole;
use App\Models\Order;
use App\Models\User;

class OrderPolicy
{
    public function view(User $user, Order $order): bool
    {
        return $user->isAdmin()
            || $order->user_id === $user->id
            || ($user->isSeller() && $order->merchant?->user_id === $user->id);
    }

    public function cancel(User $user, Order $order): bool
    {
        if ($user->isAdmin()) {
            return true;
        }

        return $order->user_id === $user->id
            && in_array($order->status, [OrderStatus::PendingPayment, OrderStatus::WaitingConfirmation], true);
    }

    public function updateStatus(User $user, Order $order): bool
    {
        if ($user->isAdmin()) {
            return true;
        }

        return $user->isSeller()
            && $order->merchant?->user_id === $user->id
            && $order->payment_status->value === 'paid';
    }

    public function verifyPickup(User $user, Order $order): bool
    {
        return $user->isSeller()
            && $order->merchant?->user_id === $user->id
            && in_array($order->status, [OrderStatus::Confirmed, OrderStatus::ReadyForPickup], true);
    }

    public function delete(User $user, Order $order): bool
    {
        return $user->isAdmin();
    }
}
