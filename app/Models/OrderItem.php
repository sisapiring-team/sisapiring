<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasOne;

class OrderItem extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_id',
        'product_id',
        'product_name',
        'category',
        'image',
        'original_price',
        'price_per_item',
        'quantity',
        'subtotal',
        'weight_grams_total',
    ];

    protected $casts = [
        'original_price' => 'decimal:2',
        'price_per_item' => 'decimal:2',
        'subtotal' => 'decimal:2',
        'quantity' => 'integer',
        'weight_grams_total' => 'integer',
    ];

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function product(): BelongsTo
    {
        return $this->belongsTo(Product::class);
    }

    public function review(): HasOne
    {
        return $this->hasOne(Review::class);
    }
}
