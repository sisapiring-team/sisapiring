<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Product extends Model
{
    use HasFactory;

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
        'food_safety_checklist' => 'array',
    ];

    public function merchant(): BelongsTo
    {
        return $this->belongsTo(Merchant::class);
    }

    public function orderItems(): HasMany
    {
        return $this->hasMany(OrderItem::class);
    }

    public function stockLocks(): HasMany
    {
        return $this->hasMany(StockLock::class);
    }

    /**
     * Get available stock (total stock minus currently locked stock)
     */
    public function getAvailableStockAttribute(): int
    {
        return max(0, $this->stock - $this->locked_stock);
    }
}
