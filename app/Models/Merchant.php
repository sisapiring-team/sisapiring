<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Merchant extends Model
{
    use HasFactory;

    protected $fillable = [
        'code',
        'user_id',
        'business_name',
        'business_category',
        'owner_name',
        'owner_phone',
        'owner_email',
        'business_address',
        'city',
        'district',
        'latitude',
        'longitude',
        'business_photo',
        'business_document_name',
        'verification_status',
        'verification_notes',
        'operating_hours',
        'pickup_window',
        'store_bio',
        'is_open_today',
        'rating',
        'total_rescued_count',
    ];

    protected $casts = [
        'is_open_today' => 'boolean',
        'rating' => 'decimal:2',
        'latitude' => 'decimal:7',
        'longitude' => 'decimal:7',
        'total_rescued_count' => 'integer',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function products(): HasMany
    {
        return $this->hasMany(Product::class);
    }

    public function orders(): HasMany
    {
        return $this->hasMany(Order::class);
    }

    public function impactLogs(): HasMany
    {
        return $this->hasMany(ImpactLog::class);
    }
}
