<?php

namespace App\Models;

use App\Enums\ModerationStatus;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ProductModeration extends Model
{
    protected $fillable = [
        'product_id',
        'actor_user_id',
        'action',
        'from_status',
        'to_status',
        'reason',
    ];

    protected $casts = [
        'from_status' => ModerationStatus::class,
        'to_status' => ModerationStatus::class,
    ];

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function actor(): BelongsTo
    {
        return $this->belongsTo(User::class, 'actor_user_id');
    }
}
