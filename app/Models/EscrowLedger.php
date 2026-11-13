<?php

namespace App\Models;

use App\Enums\EscrowStatus;
use App\Enums\EscrowType;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EscrowLedger extends Model
{
    protected $table = 'escrow_ledger';

    protected $fillable = [
        'order_id',
        'merchant_id',
        'entry_type',
        'status',
        'amount',
        'currency',
        'reference',
        'available_at',
        'released_at',
        'note',
    ];

    protected $casts = [
        'amount' => 'decimal:2',
        'available_at' => 'datetime',
        'released_at' => 'datetime',
        'entry_type' => EscrowType::class,
        'status' => EscrowStatus::class,
    ];

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function merchant(): BelongsTo
    {
        return $this->belongsTo(Merchant::class);
    }
}
