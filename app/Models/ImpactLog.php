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
        'water_saved_liters',
        'money_saved_idr',
    ];

    protected $casts = [
        'portions_rescued' => 'integer',
        'weight_rescued_kg' => 'decimal:3',
        'co2_prevented_kg' => 'decimal:3',
        'methane_prevented_kg' => 'decimal:3',
        'water_saved_liters' => 'decimal:2',
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
     * Compute impact metrics using the centralised config factors.
     *
     * @return array<string, int|float>
     */
    public static function calculateMetrics(int $portions, float $weightKg, float $moneySaved): array
    {
        $co2PerKg = (float) config('impact.co2_kg_per_kg_food', 2.5);
        $methanePerKg = (float) config('impact.methane_kg_per_kg_food', 0.082);
        $waterPerPortion = (float) config('impact.water_liters_per_portion', 62);

        return [
            'portions_rescued' => $portions,
            'weight_rescued_kg' => round($weightKg, 3),
            'co2_prevented_kg' => round($weightKg * $co2PerKg, 3),
            'methane_prevented_kg' => round($weightKg * $methanePerKg, 3),
            'water_saved_liters' => round($portions * $waterPerPortion, 2),
            'money_saved_idr' => round($moneySaved, 2),
        ];
    }
}
