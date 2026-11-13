<?php

namespace App\Services;

use App\Models\ImpactLog;
use App\Models\Merchant;
use App\Models\Order;
use App\Models\User;

class ImpactService
{
    public function recordForOrder(Order $order): ImpactLog
    {
        if ($order->impactLog) {
            return $order->impactLog;
        }

        $order->loadMissing('items');

        $portions = (int) $order->items->sum('quantity');
        $weightKg = (float) $order->items->sum('weight_grams_total') / 1000;

        return ImpactLog::query()->create([
            'order_id' => $order->id,
            'merchant_id' => $order->merchant_id,
            'user_id' => $order->user_id,
            ...ImpactLog::calculateMetrics($portions, $weightKg, (float) $order->total_discount),
        ]);
    }

    /**
     * @return array<string, mixed>
     */
    public function summary(?User $user = null, ?Merchant $merchant = null): array
    {
        $query = ImpactLog::query()
            ->when($user, fn ($q) => $q->where('user_id', $user->id))
            ->when($merchant, fn ($q) => $q->where('merchant_id', $merchant->id));

        $totals = (clone $query)
            ->selectRaw('COALESCE(SUM(portions_rescued), 0) as portions')
            ->selectRaw('COALESCE(SUM(weight_rescued_kg), 0) as weight_kg')
            ->selectRaw('COALESCE(SUM(co2_prevented_kg), 0) as co2_kg')
            ->selectRaw('COALESCE(SUM(methane_prevented_kg), 0) as methane_kg')
            ->selectRaw('COALESCE(SUM(water_saved_liters), 0) as water_liters')
            ->selectRaw('COALESCE(SUM(money_saved_idr), 0) as money_saved')
            ->first();

        $daily = (clone $query)
            ->selectRaw('DATE(created_at) as date')
            ->selectRaw('SUM(portions_rescued) as portions')
            ->selectRaw('SUM(co2_prevented_kg) as co2_kg')
            ->groupBy('date')
            ->orderBy('date')
            ->limit(90)
            ->get();

        $recent = (clone $query)
            ->with('merchant:id,code,business_name')
            ->latest()
            ->limit(10)
            ->get()
            ->map(fn (ImpactLog $log) => [
                'id' => $log->id,
                'merchant' => $log->merchant?->business_name,
                'portionsRescued' => (int) $log->portions_rescued,
                'weightRescuedKg' => (float) $log->weight_rescued_kg,
                'co2PreventedKg' => (float) $log->co2_prevented_kg,
                'methanePreventedKg' => (float) $log->methane_prevented_kg,
                'waterSavedLiters' => (float) $log->water_saved_liters,
                'moneySavedIdr' => (float) $log->money_saved_idr,
                'createdAt' => $log->created_at?->toIso8601String(),
            ]);

        return [
            'totals' => [
                'portionsRescued' => (int) $totals->portions,
                'weightRescuedKg' => round((float) $totals->weight_kg, 3),
                'co2PreventedKg' => round((float) $totals->co2_kg, 3),
                'methanePreventedKg' => round((float) $totals->methane_kg, 3),
                'waterSavedLiters' => round((float) $totals->water_liters, 2),
                'moneySavedIdr' => (float) $totals->money_saved,
            ],
            'daily' => $daily,
            'recent' => $recent,
        ];
    }

    /**
     * @return array<string, int|float>
     */
    public function platformTotals(): array
    {
        $summary = $this->summary();

        return $summary['totals'];
    }
}
