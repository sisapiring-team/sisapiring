<?php

return [
    'platform_fee_flat' => (int) env('PLATFORM_FEE_FLAT', 1000),
    'checkout_ttl_minutes' => (int) env('CHECKOUT_TTL_MINUTES', 10),
    'pickup_ttl_hours' => (int) env('PICKUP_TTL_HOURS', 4),
    'escrow_hold_hours' => (int) env('ESCROW_HOLD_HOURS', 24),
    'mock_gateway' => (bool) env('PAYMENT_MOCK_GATEWAY', true),
];
