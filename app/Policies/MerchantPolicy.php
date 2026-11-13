<?php

namespace App\Policies;

use App\Models\Merchant;
use App\Models\User;

class MerchantPolicy
{
    public function view(User $user, Merchant $merchant): bool
    {
        return $user->isAdmin() || $merchant->user_id === $user->id;
    }

    public function update(User $user, Merchant $merchant): bool
    {
        return $merchant->user_id === $user->id || $user->isAdmin();
    }

    public function verify(User $user, Merchant $merchant): bool
    {
        return $user->isAdmin();
    }

    public function suspend(User $user, Merchant $merchant): bool
    {
        return $user->isAdmin();
    }
}
