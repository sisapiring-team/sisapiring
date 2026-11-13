<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class StockLock extends Model
{
    use HasFactory;

    protected $fillable = [
        'product_id',
        'order_group_id',
        'order_id',
        'user_id',
        'session_token',
        'quantity',
        'status',
        'expires_at',
        'converted_at',
        'released_at',
    ];

    protected $casts = [
        'quantity' => 'integer',
        'expires_at' => 'datetime',
        'converted_at' => 'datetime',
        'released_at' => 'datetime',
    ];

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function orderGroup(): BelongsTo
    {
        return $this->belongsTo(OrderGroup::class, 'order_group_id');
    }

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function isExpired(): bool
    {
        return $this->expires_at->isPast();
    }
}
