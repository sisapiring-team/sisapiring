<?php

namespace App\Policies;

use App\Models\Conversation;
use App\Models\User;

class ConversationPolicy
{
    public function view(User $user, Conversation $conversation): bool
    {
        return $user->isAdmin()
            || $conversation->buyer_id === $user->id
            || $conversation->merchant?->user_id === $user->id;
    }

    public function send(User $user, Conversation $conversation): bool
    {
        return $conversation->buyer_id === $user->id
            || $conversation->merchant?->user_id === $user->id;
    }
}
