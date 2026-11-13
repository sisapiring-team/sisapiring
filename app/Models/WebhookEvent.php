<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class WebhookEvent extends Model
{
    protected $fillable = [
        'provider',
        'external_id',
        'event_type',
        'payload',
        'status',
        'processed_at',
        'error_message',
        'payment_id',
    ];

    protected $casts = [
        'payload' => 'array',
        'processed_at' => 'datetime',
    ];

    public function payment(): BelongsTo
    {
        return $this->belongsTo(Payment::class);
    }

    public function isProcessed(): bool
    {
        return $this->status === 'processed';
    }
}
