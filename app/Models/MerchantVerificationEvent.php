<?php

namespace App\Models;

use App\Enums\VerificationStatus;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MerchantVerificationEvent extends Model
{
    protected $fillable = [
        'merchant_id',
        'actor_user_id',
        'from_status',
        'to_status',
        'note',
    ];

    protected $casts = [
        'from_status' => VerificationStatus::class,
        'to_status' => VerificationStatus::class,
    ];

    public function merchant(): BelongsTo
    {
        return $this->belongsTo(Merchant::class);
    }

    public function actor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'actor_user_id');
    }
}
