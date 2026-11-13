<?php

namespace App\Models;

use App\Enums\ReviewStatus;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Review extends Model
{
    protected $fillable = [
        'order_id',
        'order_item_id',
        'merchant_id',
        'product_id',
        'reviewer_user_id',
        'rating',
        'comment',
        'tags',
        'moderation_status',
        'flag_reason',
        'admin_reply',
        'merchant_reply',
        'merchant_replied_at',
        'moderated_by',
        'moderated_at',
    ];

    protected $casts = [
        'rating' => 'integer',
        'tags' => 'array',
        'moderated_at' => 'datetime',
        'merchant_replied_at' => 'datetime',
        'moderation_status' => ReviewStatus::class,
    ];

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function orderItem(): BelongsTo
    {
        return $this->belongsTo(OrderItem::class);
    }

    public function merchant(): BelongsTo
    {
        return $this->belongsTo(Merchant::class);
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewer_user_id');
    }

    public function moderator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'moderated_by');
    }
}
