<?php

namespace App\Models;

use App\Enums\OrderStatus;
use App\Enums\PaymentStatus;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class OrderGroup extends Model
{
    protected $fillable = [
        'group_code',
        'user_id',
        'status',
        'payment_status',
        'subtotal',
        'platform_fee',
        'discount_total',
        'grand_total',
        'expires_at',
        'paid_at',
        'cancelled_at',
        'cancellation_reason',
        'buyer_note',
    ];

    protected $casts = [
        'subtotal' => 'decimal:2',
        'platform_fee' => 'decimal:2',
        'discount_total' => 'decimal:2',
        'grand_total' => 'decimal:2',
        'expires_at' => 'datetime',
        'paid_at' => 'datetime',
        'cancelled_at' => 'datetime',
        'status' => OrderStatus::class,
        'payment_status' => PaymentStatus::class,
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }

    public function payment(): HasOne
    {
        return $this->hasOne(Payment::class);
    }

    public function stockLocks(): HasMany
    {
        return $this->hasMany(StockLock::class);
    }
}
