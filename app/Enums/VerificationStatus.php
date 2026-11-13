<?php

namespace App\Enums;

enum VerificationStatus: string
{
    case PendingReview = 'pending_review';
    case Verified = 'verified';
    case Rejected = 'rejected';

    public function isVerified(): bool
    {
        return $this === self::Verified;
    }
}
