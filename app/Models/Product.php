<?php

namespace App\Models;

use App\Enums\ModerationStatus;
use Illuminate\Database\Eloquent\Builder;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Product extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'code',
        'merchant_id',
        'name',
        'category',
        'image',
        'description',
        'original_price',
        'discount_percentage',
        'discounted_price',
        'stock',
        'locked_stock',
        'weight_grams',
        'production_time',
        'safe_consumption_deadline',
        'safe_deadline_at',
        'pickup_schedule_start',
        'pickup_schedule_end',
        'storage_instruction',
        'food_safety_checklist',
        'is_active',
        'moderation_status',
        'takedown_reason',
        'last_checked_at',
        'moderated_by',
        'portions_rescued_count',
    ];

    protected $casts = [
        'original_price' => 'decimal:2',
        'discounted_price' => 'decimal:2',
        'discount_percentage' => 'integer',
        'stock' => 'integer',
        'locked_stock' => 'integer',
        'weight_grams' => 'integer',
        'portions_rescued_count' => 'integer',
        'is_active' => 'boolean',
        'safe_deadline_at' => 'datetime',
        'last_checked_at' => 'datetime',
        'food_safety_checklist' => 'array',
        'moderation_status' => ModerationStatus::class,
    ];

    public function merchant(): BelongsTo
    {
        return $this->belongsTo(Merchant::class);
    }

    public function moderator(): BelongsTo
    {
        return $this->belongsTo(User::class, 'moderated_by');
    }

    public function orderItems(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    public function stockLocks(): HasMany
    {
        return $this->hasMany(StockLock::class);
    }

    public function moderations(): HasMany
    {
        return $this->hasMany(ProductModeration::class);
    }

    public function priceHistories(): HasMany
    {
        return $this->hasMany(ProductPriceHistory::class);
    }

    public function reviews(): HasMany
    {
        return $this->hasMany(Review::class);
    }

    public function scopeVisible(Builder $query): Builder
    {
        return $query
            ->where('is_active', true)
            ->where('moderation_status', ModerationStatus::Active->value)
            ->where('safe_deadline_at', '>', now());
    }

    public function getAvailableStockAttribute(): int
    {
        return max(0, $this->stock - $this->locked_stock);
    }
}
