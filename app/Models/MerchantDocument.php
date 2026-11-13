<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class MerchantDocument extends Model
{
    protected $fillable = [
        'merchant_id',
        'doc_type',
        'file_path',
        'mime_type',
        'size_bytes',
        'status',
        'review_notes',
        'reviewed_by',
        'reviewed_at',
    ];

    protected $casts = [
        'size_bytes' => 'integer',
        'reviewed_at' => 'datetime',
    ];

    public function merchant(): BelongsTo
    {
        return $this->belongsTo(Merchant::class);
    }

    public function reviewer(): BelongsTo
    {
        return $this->belongsTo(User::class, 'reviewed_by');
    }
}
