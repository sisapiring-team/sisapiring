<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Environmental Impact Factors
    |--------------------------------------------------------------------------
    |
    | These factors are the single source of truth for every impact number
    | exposed by the API, the AI assistant and the dashboards.
    |
    */

    'default_portion_weight_kg' => (float) env('IMPACT_PORTION_WEIGHT_KG', 0.35),

    'co2_kg_per_kg_food' => (float) env('IMPACT_CO2_KG_PER_KG', 2.5),

    'methane_kg_per_kg_food' => (float) env('IMPACT_METHANE_KG_PER_KG', 0.082),

    'water_liters_per_portion' => (float) env('IMPACT_WATER_LITERS_PER_PORTION', 62),

    'platform_fee_percent' => (float) env('PLATFORM_FEE_PERCENT', 0),

    'escrow_release_delay_hours' => (int) env('ESCROW_RELEASE_DELAY_HOURS', 24),

    'stock_lock_minutes' => (int) env('STOCK_LOCK_MINUTES', 10),

    'payment_expiry_minutes' => (int) env('PAYMENT_EXPIRY_MINUTES', 30),

];
