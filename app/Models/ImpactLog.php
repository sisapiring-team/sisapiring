<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ImpactLog extends Model
{
    use HasFactory;

    protected $fillable = [
        'order_id',
        'merchant_id',
        'user_id',
        'portions_rescued',
        'weight_rescued_kg',
        'co2_prevented_kg',
        'methane_prevented_kg',
        'money_saved_idr',
    ];

    protected $casts = [
        'portions_rescued' => 'integer',
        'weight_rescued_kg' => 'decimal:3',
        'co2_prevented_kg' => 'decimal:3',
        'methane_prevented_kg' => 'decimal:3',
        'money_saved_idr' => 'decimal:2',
    ];

    public function order(): BelongsTo
    {
        return $this->belongsTo(Order::class);
    }

    public function merchant(): BelongsTo
    {
        return $this->belongsTo(Merchant::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Compute impact metrics from portion count and weight
     * Standard factors:
     * - 1 portion ~ 0.35 kg
     * - 1 kg food waste prevented = 2.5 kg CO2e prevented
     * - 1 kg food waste diverted from landfill = 0.082 kg (82g) CH4 (Methane) prevented
     */
    public static function calculateMetrics(int $portions, float $weightKg, float $moneySaved): array
    {
        return [
            'portions_rescued' => $portions,
            'weight_rescued_kg' => round($weightKg, 3),
            'co2_prevented_kg' => round($weightKg * 2.5, 3),
            'methane_prevented_kg' => round($weightKg * 0.082, 3),
            'money_saved_idr' => round($moneySaved, 2),
        ];
    }
}
