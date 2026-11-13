<?php

namespace App\Policies;

use App\Models\Dispute;
use App\Models\User;

class DisputePolicy
{
    public function view(User $user, Dispute $dispute): bool
    {
        return $user->isAdmin()
            || $dispute->reporter_user_id === $user->id
            || $dispute->merchant?->user_id === $user->id;
    }

    public function create(User $user, Dispute $dispute): bool
    {
        return $dispute->order?->user_id === $user->id;
    }

    public function reply(User $user, Dispute $dispute): bool
    {
        return $user->isAdmin()
            || $dispute->reporter_user_id === $user->id
            || $dispute->merchant?->user_id === $user->id;
    }

    public function resolve(User $user, Dispute $dispute): bool
    {
        return $user->isAdmin();
    }
}
