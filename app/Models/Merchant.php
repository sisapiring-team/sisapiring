<?php

namespace App\Models;

use App\Enums\VerificationStatus;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class Merchant extends Model
{
    use HasFactory, SoftDeletes;

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
        'nib_number',
        'ktp_masked',
        'halal_or_pirt_number',
        'doc_type',
        'business_document_path',
        'hygiene_commitment_signed',
        'verification_status',
        'verification_notes',
        'reviewed_by',
        'reviewed_at',
        'suspended_reason',
        'operating_hours',
        'pickup_window',
        'store_bio',
        'is_open_today',
        'rating',
        'total_rescued_count',
    ];

    protected $casts = [
        'is_open_today' => 'boolean',
        'hygiene_commitment_signed' => 'boolean',
        'rating' => 'decimal:2',
        'latitude' => 'decimal:7',
        'longitude' => 'decimal:7',
        'total_rescued_count' => 'integer',
        'verification_status' => VerificationStatus::class,
        'reviewed_at' => 'datetime',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by');
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

    public function documents(): HasMany
    {
        return $this->hasMany(MerchantDocument::class);
    }

    public function verificationEvents(): HasMany
    {
        return $this->hasMany(MerchantVerificationEvent::class);
    }

    public function reviews(): HasMany
    {
        return $this->hasMany(Review::class);
    }

    public function disputes(): HasMany
    {
        return $this->hasMany(Dispute::class);
    }

    public function conversations(): HasMany
    {
        return $this->hasMany(Conversation::class);
    }

    public function isVerified(): bool
    {
        return $this->verification_status === VerificationStatus::Verified;
    }
}
