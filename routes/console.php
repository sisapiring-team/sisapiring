<?php

use App\Services\OrderService;
use App\Services\StockService;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

Schedule::call(fn () => app(OrderService::class)->expireStaleGroups())
    ->name('orders:expire-stale-groups')
    ->everyMinute()
    ->withoutOverlapping();

Schedule::call(fn () => app(StockService::class)->releaseExpired())
    ->name('stock:release-expired-locks')
    ->everyMinute()
    ->withoutOverlapping();
