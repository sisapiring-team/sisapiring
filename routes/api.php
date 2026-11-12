<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CatalogController;
use App\Http\Controllers\Api\ImpactController;
use App\Http\Controllers\Api\MerchantController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\ProductController;
use Illuminate\Support\Facades\Route;

Route::get('/health', fn () => response()->json(['status' => 'ok', 'app' => config('app.name')]));

// Customer marketplace
Route::get('/catalog', [CatalogController::class, 'index']);

// Merchant / seller portal
Route::get('/merchants', [MerchantController::class, 'index']);
Route::get('/merchants/current', [MerchantController::class, 'current']);
Route::patch('/merchants/{merchant:code}', [MerchantController::class, 'update']);
Route::get('/merchants/{merchant:code}', [MerchantController::class, 'show']);

Route::get('/products', [ProductController::class, 'index']);
Route::post('/products', [ProductController::class, 'store']);
Route::get('/products/{product:code}', [ProductController::class, 'show']);
Route::patch('/products/{product:code}', [ProductController::class, 'update']);
Route::delete('/products/{product:code}', [ProductController::class, 'destroy']);
Route::patch('/products/{product:code}/stock', [ProductController::class, 'updateStock']);
Route::patch('/products/{product:code}/discount', [ProductController::class, 'applyDiscount']);

// Orders (buyer + seller)
Route::get('/orders', [OrderController::class, 'index']);
Route::post('/orders', [OrderController::class, 'store']);
Route::get('/orders/{order:order_code}', [OrderController::class, 'show']);
Route::patch('/orders/{order:order_code}/status', [OrderController::class, 'updateStatus']);
Route::post('/orders/{order:order_code}/cancel', [OrderController::class, 'cancel']);
Route::post('/orders/{order:order_code}/verify', [OrderController::class, 'verify']);

// Impact analytics
Route::get('/impact', [ImpactController::class, 'index']);

// Authentication
Route::post('/auth/register', [AuthController::class, 'register'])->middleware('throttle:10,1');
Route::post('/auth/login', [AuthController::class, 'login'])->middleware('throttle:10,1');

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/auth/me', [AuthController::class, 'me']);
    Route::post('/auth/logout', [AuthController::class, 'logout']);
});
