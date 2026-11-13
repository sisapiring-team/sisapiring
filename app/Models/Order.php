<?php

namespace App\Models;

use App\Enums\OrderStatus;
use App\Enums\PaymentStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Order extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_group_id',
        'order_code',
        'pickup_code',
        'user_id',
        'merchant_id',
        'customer_name',
        'customer_phone',
        'total_original_price',
        'total_payment',
        'total_discount',
        'platform_fee',
        'status',
        'payment_status',
        'pickup_deadline',
        'pickup_deadline_at',
        'paid_at',
        'completed_at',
        'cancelled_at',
        'qr_code_token',
        'is_verified_by_qr',
        'verified_at',
        'verified_by_user_id',
        'cancellation_reason',
        'notes',
        'status_history',
    ];

    protected $casts = [
        'total_original_price' => 'decimal:2',
        'total_payment' => 'decimal:2',
        'total_discount' => 'decimal:2',
        'platform_fee' => 'decimal:2',
        'is_verified_by_qr' => 'boolean',
        'pickup_deadline_at' => 'datetime',
        'paid_at' => 'datetime',
        'completed_at' => 'datetime',
        'cancelled_at' => 'datetime',
        'verified_at' => 'datetime',
        'status_history' => 'array',
        'status' => OrderStatus::class,
        'payment_status' => PaymentStatus::class,
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function group(): BelongsTo
    {
        return $this->belongsTo(OrderGroup::class, 'order_group_id');
    }

    public function merchant(): BelongsTo
    {
        return $this->belongsTo(Merchant::class);
    }

    public function verifiedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'verified_by_user_id');
    }

    public function items(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    public function impactLog(): HasOne
    {
        return $this->hasOne(ImpactLog::class);
    }

    public function reviews(): HasMany
    {
        return $this->hasMany(Review::class);
    }

    public function disputes(): HasMany
    {
        return $this->hasMany(Dispute::class);
    }

    public function escrowEntries(): HasMany
    {
        return $this->hasMany(EscrowLedger::class);
    }
}
