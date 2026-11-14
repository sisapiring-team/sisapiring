<?php

use App\Http\Controllers\Api\Admin;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\Buyer;
use App\Http\Controllers\Api\CatalogController;
use App\Http\Controllers\Api\Chat\AssistantController;
use App\Http\Controllers\Api\Chat\ConversationController;
use App\Http\Controllers\Api\ImpactController;
use App\Http\Controllers\Api\MerchantController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\Seller;
use App\Http\Controllers\Api\WebhookController;
use Illuminate\Support\Facades\Route;

Route::prefix('v1')->group(function () {
    Route::get('/health', fn () => response()->json([
        'status' => 'ok',
        'app' => config('app.name'),
        'time' => now()->toIso8601String(),
    ]));

    // Public marketplace
    Route::get('/catalog', [CatalogController::class, 'index']);
    Route::get('/catalog/categories', [CatalogController::class, 'categories']);
    Route::get('/catalog/{product:code}', [CatalogController::class, 'show']);
    Route::get('/merchants', [MerchantController::class, 'index']);
    Route::get('/merchants/{merchant:code}', [MerchantController::class, 'show']);
    Route::get('/impact', [ImpactController::class, 'index']);

    // Authentication
    Route::post('/auth/register', [AuthController::class, 'register'])->middleware('throttle:10,1');
    Route::post('/auth/login', [AuthController::class, 'login'])->middleware('throttle:10,1');

    // Payment gateway webhook
    Route::post('/webhooks/xendit', [WebhookController::class, 'xendit']);

    Route::middleware('auth:sanctum')->group(function () {
        Route::get('/auth/me', [AuthController::class, 'me']);
        Route::post('/auth/logout', [AuthController::class, 'logout']);
        Route::patch('/auth/profile', [AuthController::class, 'updateProfile']);
        Route::post('/auth/password', [AuthController::class, 'changePassword']);

        Route::get('/notifications', [NotificationController::class, 'index']);
        Route::post('/notifications/read-all', [NotificationController::class, 'markAllRead']);
        Route::post('/notifications/{notification}/read', [NotificationController::class, 'markRead']);

        Route::middleware('role:buyer,seller')->group(function () {
            Route::get('/conversations', [ConversationController::class, 'index']);
            Route::post('/conversations', [ConversationController::class, 'store'])->middleware('role:buyer');
            Route::get('/conversations/{conversation}', [ConversationController::class, 'show']);
            Route::post('/conversations/{conversation}/messages', [ConversationController::class, 'send']);
            Route::post('/conversations/{conversation}/read', [ConversationController::class, 'read']);

            Route::get('/assistant/conversations', [AssistantController::class, 'index']);
            Route::post('/assistant/chat', [AssistantController::class, 'chat']);
            Route::delete('/assistant/conversations/{conversation}', [AssistantController::class, 'destroy']);
        });

        // Buyer endpoints
        Route::middleware('role:buyer')->prefix('buyer')->group(function () {
            Route::get('/order-groups', [Buyer\OrderGroupController::class, 'index']);
            Route::post('/order-groups', [Buyer\OrderGroupController::class, 'store']);
            Route::get('/order-groups/{group:group_code}', [Buyer\OrderGroupController::class, 'show']);
            Route::post('/order-groups/{group:group_code}/cancel', [Buyer\OrderGroupController::class, 'cancel']);
            Route::post('/order-groups/{group:group_code}/pay', [Buyer\OrderGroupController::class, 'pay']);

            Route::get('/orders', [Buyer\OrderController::class, 'index']);
            Route::get('/orders/{order:order_code}', [Buyer\OrderController::class, 'show']);

            Route::get('/payments/{payment}', [Buyer\PaymentController::class, 'show']);
            Route::post('/payments/{payment}/mock-pay', [Buyer\PaymentController::class, 'mockPay']);

            Route::get('/reviews', [Buyer\ReviewController::class, 'index']);
            Route::post('/reviews', [Buyer\ReviewController::class, 'store']);
            Route::patch('/reviews/{review}', [Buyer\ReviewController::class, 'update']);

            Route::get('/disputes', [Buyer\DisputeController::class, 'index']);
            Route::post('/disputes', [Buyer\DisputeController::class, 'store']);
            Route::get('/disputes/{dispute}', [Buyer\DisputeController::class, 'show']);
            Route::post('/disputes/{dispute}/messages', [Buyer\DisputeController::class, 'reply']);

            Route::get('/impact', [Buyer\ImpactController::class, 'index']);
        });

        // Seller endpoints
        Route::middleware('role:seller')->prefix('seller')->group(function () {
            Route::get('/dashboard', [Seller\DashboardController::class, 'index']);

            Route::get('/merchant', [Seller\MerchantController::class, 'current']);
            Route::patch('/merchant', [Seller\MerchantController::class, 'update']);
            Route::post('/merchant/documents', [Seller\MerchantController::class, 'uploadDocument']);
            Route::post('/merchant/submit-verification', [Seller\MerchantController::class, 'submitVerification']);

            Route::get('/products', [Seller\ProductController::class, 'index']);
            Route::post('/products', [Seller\ProductController::class, 'store']);
            Route::get('/products/{product:code}', [Seller\ProductController::class, 'show']);
            Route::patch('/products/{product:code}', [Seller\ProductController::class, 'update']);
            Route::delete('/products/{product:code}', [Seller\ProductController::class, 'destroy']);
            Route::patch('/products/{product:code}/stock', [Seller\ProductController::class, 'updateStock']);
            Route::patch('/products/{product:code}/discount', [Seller\ProductController::class, 'applyDiscount']);
            Route::patch('/products/{product:code}/toggle-active', [Seller\ProductController::class, 'toggleActive']);

            Route::get('/orders', [Seller\OrderController::class, 'index']);
            Route::get('/orders/{order:order_code}', [Seller\OrderController::class, 'show']);
            Route::patch('/orders/{order:order_code}/status', [Seller\OrderController::class, 'updateStatus']);
            Route::post('/orders/{order:order_code}/verify', [Seller\OrderController::class, 'verify']);

            Route::get('/reviews', [Seller\ReviewController::class, 'index']);
            Route::post('/reviews/{review}/reply', [Seller\ReviewController::class, 'reply']);

            Route::get('/disputes', [Seller\DisputeController::class, 'index']);
            Route::get('/disputes/{dispute}', [Seller\DisputeController::class, 'show']);
            Route::post('/disputes/{dispute}/messages', [Seller\DisputeController::class, 'reply']);
        });

        // Admin endpoints
        Route::middleware('role:admin')->prefix('admin')->group(function () {
            Route::get('/dashboard', [Admin\DashboardController::class, 'index']);

            Route::get('/merchants', [Admin\MerchantController::class, 'index']);
            Route::get('/merchants/{merchant:code}', [Admin\MerchantController::class, 'show']);
            Route::post('/merchants/{merchant:code}/verify', [Admin\MerchantController::class, 'verify']);
            Route::post('/merchants/{merchant:code}/suspend', [Admin\MerchantController::class, 'suspend']);
            Route::post('/merchants/{merchant:code}/reinstate', [Admin\MerchantController::class, 'reinstate']);

            Route::get('/products', [Admin\ProductController::class, 'index']);
            Route::post('/products/{product:code}/moderate', [Admin\ProductController::class, 'moderate']);

            Route::get('/orders/groups', [Admin\OrderController::class, 'groups']);
            Route::get('/orders', [Admin\OrderController::class, 'index']);
            Route::get('/orders/{order:order_code}', [Admin\OrderController::class, 'show']);

            Route::get('/disputes', [Admin\DisputeController::class, 'index']);
            Route::get('/disputes/{dispute}', [Admin\DisputeController::class, 'show']);
            Route::post('/disputes/{dispute}/resolve', [Admin\DisputeController::class, 'resolve']);

            Route::get('/reviews', [Admin\ReviewController::class, 'index']);
            Route::post('/reviews/{review}/moderate', [Admin\ReviewController::class, 'moderate']);

            Route::get('/users', [Admin\UserController::class, 'index']);
            Route::post('/users', [Admin\UserController::class, 'store']);
            Route::patch('/users/{user}/status', [Admin\UserController::class, 'updateStatus']);
        });
    });
});
