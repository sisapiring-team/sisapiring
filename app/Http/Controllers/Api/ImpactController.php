<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\ImpactLog;
use Illuminate\Http\JsonResponse;

class ImpactController extends Controller
{
    /**
     * Aggregated environmental and economic impact for dashboards.
     */
    public function index(): JsonResponse
    {
        $totals = ImpactLog::query()
            ->selectRaw('COALESCE(SUM(portions_rescued), 0) as portions')
            ->selectRaw('COALESCE(SUM(weight_rescued_kg), 0) as weight_kg')
            ->selectRaw('COALESCE(SUM(co2_prevented_kg), 0) as co2_kg')
            ->selectRaw('COALESCE(SUM(methane_prevented_kg), 0) as methane_kg')
            ->selectRaw('COALESCE(SUM(money_saved_idr), 0) as money_saved')
            ->first();

        $daily = ImpactLog::query()
            ->selectRaw('DATE(created_at) as date')
            ->selectRaw('SUM(portions_rescued) as portions')
            ->selectRaw('SUM(co2_prevented_kg) as co2_kg')
            ->groupBy('date')
            ->orderBy('date')
            ->get();

        $recent = ImpactLog::query()
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
                'moneySavedIdr' => (float) $log->money_saved_idr,
                'createdAt' => $log->created_at?->toIso8601String(),
            ]);

        return response()->json([
            'totals' => [
                'portionsRescued' => (int) $totals->portions,
                'weightRescuedKg' => round((float) $totals->weight_kg, 3),
                'co2PreventedKg' => round((float) $totals->co2_kg, 3),
                'methanePreventedKg' => round((float) $totals->methane_kg, 3),
                'moneySavedIdr' => (float) $totals->money_saved,
            ],
            'daily' => $daily,
            'recent' => $recent,
        ]);
    }
}
