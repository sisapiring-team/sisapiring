<?php

namespace Tests\Feature\Api;

use App\Enums\DisputeStatus;
use App\Enums\OrderStatus;
use App\Enums\PaymentStatus;
use App\Enums\ReviewStatus;
use App\Enums\VerificationStatus;
use App\Models\Dispute;
use App\Models\DisputeMessage;
use App\Models\Merchant;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\ProductPriceHistory;
use App\Models\Review;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class SellerFeaturesTest extends TestCase
{
    use RefreshDatabase;

    public function test_product_creation_with_food_safety_checklist_validation(): void
    {
        [$seller, $merchant] = $this->setupSeller();

        Sanctum::actingAs($seller);

        // Valid product creation with food safety checklist
        $payload = [
            'name' => 'Croissant Cokelat Artisan',
            'category' => 'Bakery & Roti',
            'original_price' => 45000,
            'discount_percentage' => 50,
            'stock' => 12,
            'weight_grams' => 220,
            'storage_instruction' => 'Simpan pada suhu ruang tertutup rapat',
            'food_safety_checklist' => [
                'clean_packaging' => true,
                'temperature_ok' => true,
                'fresh_quality' => true,
                'halal_hygiene' => true,
            ],
            'safe_consumption_deadline' => 'Hari ini pukul 22:00',
            'is_active' => true,
        ];

        $response = $this->postJson('/api/v1/seller/products', $payload)
            ->assertCreated();

        $productCode = $response->json('data.id');
        $this->assertNotEmpty($productCode);
        $this->assertSame('Croissant Cokelat Artisan', $response->json('data.name'));
        $this->assertSame(22500, (int) $response->json('data.discountedPrice'));
        $this->assertSame('active', $response->json('data.moderationStatus'));

        // Verify database persistence
        $product = Product::where('code', $productCode)->first();
        $this->assertNotNull($product);
        $this->assertSame(45000.0, (float) $product->original_price);
        $this->assertSame(22500.0, (float) $product->discounted_price);
        $this->assertTrue($product->food_safety_checklist['clean_packaging']);
        $this->assertTrue($product->food_safety_checklist['halal_hygiene']);

        // Verify initial price history was recorded
        $this->assertDatabaseHas('product_price_histories', [
            'product_id' => $product->id,
            'original_price' => 45000,
            'discounted_price' => 22500,
            'discount_percentage' => 50,
        ]);

        // Boundary/Negative: Invalid discount percentage (e.g. 40% not in 50, 70, 90, 100)
        $invalidPayload = $payload;
        $invalidPayload['name'] = 'Roti Diskon Tidak Valid';
        $invalidPayload['discount_percentage'] = 40;
        $this->postJson('/api/v1/seller/products', $invalidPayload)
            ->assertUnprocessable()
            ->assertJsonValidationErrors(['discount_percentage']);

        // Negative: Missing required fields
        $this->postJson('/api/v1/seller/products', [
            'description' => 'Produk tanpa nama dan harga',
        ])->assertUnprocessable()
            ->assertJsonValidationErrors(['name', 'category', 'original_price', 'discount_percentage', 'stock']);
    }

    public function test_tiered_discount_application_50_70_100(): void
    {
        [$seller, $merchant] = $this->setupSeller();
        $otherSeller = User::factory()->create(['role' => 'seller']);
        $this->merchantFor($otherSeller, 'UMKM-OTHER');

        $product = Product::create([
            'code' => 'PRD-DISCOUNT-TEST',
            'merchant_id' => $merchant->id,
            'name' => 'Kue Chiffon Pandan',
            'category' => 'Kue Basah',
            'original_price' => 100000,
            'discount_percentage' => 50,
            'discounted_price' => 50000,
            'stock' => 10,
            'weight_grams' => 500,
            'is_active' => true,
        ]);

        Sanctum::actingAs($seller);

        // 1. Apply 70% Tier
        $res70 = $this->patchJson("/api/v1/seller/products/{$product->code}/discount", [
            'discount_percentage' => 70,
        ])->assertOk();

        $this->assertSame(70, $res70->json('data.discountPercentage'));
        $this->assertSame(30000, (int) $res70->json('data.discountedPrice'));
        $this->assertSame(30000.0, (float) $product->refresh()->discounted_price);

        // 2. Apply 90% Tier
        $res90 = $this->patchJson("/api/v1/seller/products/{$product->code}/discount", [
            'discount_percentage' => 90,
        ])->assertOk();

        $this->assertSame(90, $res90->json('data.discountPercentage'));
        $this->assertSame(10000, (int) $res90->json('data.discountedPrice'));

        // 3. Apply 100% Tier (Rescue Gratis)
        $res100 = $this->patchJson("/api/v1/seller/products/{$product->code}/discount", [
            'discount_percentage' => 100,
        ])->assertOk();

        $this->assertSame(100, $res100->json('data.discountPercentage'));
        $this->assertSame(0, (int) $res100->json('data.discountedPrice'));
        $this->assertSame(0.0, (float) $product->refresh()->discounted_price);

        // Price history count should reflect the tiered changes
        $this->assertSame(3, ProductPriceHistory::where('product_id', $product->id)->count());

        // Boundary/Negative: Non-standard discount percentage
        $this->patchJson("/api/v1/seller/products/{$product->code}/discount", [
            'discount_percentage' => 60,
        ])->assertUnprocessable()
            ->assertJsonValidationErrors(['discount_percentage']);

        // Cross-merchant negative test
        Sanctum::actingAs($otherSeller);
        $this->patchJson("/api/v1/seller/products/{$product->code}/discount", [
            'discount_percentage' => 50,
        ])->assertForbidden();
    }

    public function test_stock_updates_and_active_toggle(): void
    {
        [$seller, $merchant] = $this->setupSeller();
        $otherSeller = User::factory()->create(['role' => 'seller']);
        $this->merchantFor($otherSeller, 'UMKM-OTHER2');

        $product = Product::create([
            'code' => 'PRD-STOCK-TEST',
            'merchant_id' => $merchant->id,
            'name' => 'Baguette Tradisional',
            'category' => 'Bakery & Roti',
            'original_price' => 30000,
            'discount_percentage' => 50,
            'discounted_price' => 15000,
            'stock' => 10,
            'locked_stock' => 4,
            'weight_grams' => 250,
            'is_active' => true,
        ]);

        Sanctum::actingAs($seller);

        // Update stock to valid number above locked_stock
        $stockResponse = $this->patchJson("/api/v1/seller/products/{$product->code}/stock", [
            'stock' => 20,
        ])->assertOk();

        $this->assertSame(20, $stockResponse->json('data.stock'));
        $this->assertSame(20, $product->refresh()->stock);

        // Boundary/Negative: Updating stock below currently locked stock must be rejected
        $this->patchJson("/api/v1/seller/products/{$product->code}/stock", [
            'stock' => 3, // locked_stock is 4
        ])->assertUnprocessable()
            ->assertJsonValidationErrors(['stock']);

        // Boundary: Updating stock exactly equal to locked stock is allowed
        $this->patchJson("/api/v1/seller/products/{$product->code}/stock", [
            'stock' => 4,
        ])->assertOk();
        $this->assertSame(4, $product->refresh()->stock);

        // Toggle active status (true -> false)
        $toggle1 = $this->patchJson("/api/v1/seller/products/{$product->code}/toggle-active")
            ->assertOk();
        $this->assertFalse($toggle1->json('data.isActive'));
        $this->assertFalse($product->refresh()->is_active);

        // Toggle active status (false -> true)
        $toggle2 = $this->patchJson("/api/v1/seller/products/{$product->code}/toggle-active")
            ->assertOk();
        $this->assertTrue($toggle2->json('data.isActive'));
        $this->assertTrue($product->refresh()->is_active);

        // Cross-merchant negative test
        Sanctum::actingAs($otherSeller);
        $this->patchJson("/api/v1/seller/products/{$product->code}/stock", ['stock' => 15])
            ->assertForbidden();
        $this->patchJson("/api/v1/seller/products/{$product->code}/toggle-active")
            ->assertForbidden();
    }

    public function test_merchant_profile_and_operating_hours_update(): void
    {
        [$seller, $merchant] = $this->setupSeller();

        Sanctum::actingAs($seller);

        $updateResponse = $this->patchJson('/api/v1/seller/merchant', [
            'business_name' => 'Kala Bakehouse Bandung Baru',
            'operating_hours' => '07:30 - 21:00 WIB',
            'pickup_window' => '17:00 - 20:30 WIB',
            'store_bio' => 'Pelopor penyelamatan pastry lezat premium di area Dago.',
            'is_open_today' => true,
        ])->assertOk();

        $this->assertSame('Kala Bakehouse Bandung Baru', $updateResponse->json('data.businessName'));
        $this->assertSame('07:30 - 21:00 WIB', $updateResponse->json('data.operatingHours'));
        $this->assertSame('17:00 - 20:30 WIB', $updateResponse->json('data.pickupWindow'));
        $this->assertTrue($updateResponse->json('data.isOpenToday'));

        $merchant->refresh();
        $this->assertSame('Kala Bakehouse Bandung Baru', $merchant->business_name);
        $this->assertSame('07:30 - 21:00 WIB', $merchant->operating_hours);
        $this->assertSame('17:00 - 20:30 WIB', $merchant->pickup_window);

        // Verify current profile endpoint returns updated data
        $currResponse = $this->getJson('/api/v1/seller/merchant')
            ->assertOk();
        $this->assertSame('Kala Bakehouse Bandung Baru', $currResponse->json('data.businessName'));
    }

    public function test_seller_reply_to_customer_review(): void
    {
        [$seller, $merchant] = $this->setupSeller();
        $buyer = User::factory()->create(['role' => 'buyer']);
        $otherSeller = User::factory()->create(['role' => 'seller']);
        $this->merchantFor($otherSeller, 'UMKM-OTHER3');

        $order = Order::create([
            'order_code' => 'SP-REV-'.Str::random(6),
            'pickup_code' => 'SP-3333',
            'user_id' => $buyer->id,
            'merchant_id' => $merchant->id,
            'customer_name' => $buyer->name,
            'customer_phone' => '081234567890',
            'total_original_price' => 50000,
            'total_payment' => 25000,
            'total_discount' => 25000,
            'platform_fee' => 2000,
            'status' => OrderStatus::Completed,
            'payment_status' => PaymentStatus::Paid,
            'paid_at' => now(),
            'completed_at' => now(),
            'qr_code_token' => (string) Str::uuid(),
            'is_verified_by_qr' => true,
        ]);

        $orderItem = OrderItem::create([
            'order_id' => $order->id,
            'product_name' => 'Sourdough Loaf',
            'category' => 'Bakery & Roti',
            'original_price' => 50000,
            'price_per_item' => 25000,
            'quantity' => 1,
            'subtotal' => 25000,
            'weight_grams_total' => 400,
        ]);

        $review = Review::create([
            'order_id' => $order->id,
            'order_item_id' => $orderItem->id,
            'merchant_id' => $merchant->id,
            'reviewer_user_id' => $buyer->id,
            'rating' => 5,
            'comment' => 'Rotinya enak banget!',
            'moderation_status' => ReviewStatus::Published,
        ]);

        // Legitimate seller replies to review
        Sanctum::actingAs($seller);
        $replyResponse = $this->postJson("/api/v1/seller/reviews/{$review->id}/reply", [
            'reply' => 'Terima kasih atas ulasannya kak! Ditunggu kedatangan berikutnya.',
        ])->assertOk();

        $this->assertSame('Terima kasih atas ulasannya kak! Ditunggu kedatangan berikutnya.', $replyResponse->json('data.merchantReply'));

        $review->refresh();
        $this->assertSame('Terima kasih atas ulasannya kak! Ditunggu kedatangan berikutnya.', $review->merchant_reply);
        $this->assertNotNull($review->merchant_replied_at);

        // Cross-merchant negative test: another seller cannot reply
        Sanctum::actingAs($otherSeller);
        $this->postJson("/api/v1/seller/reviews/{$review->id}/reply", [
            'reply' => 'Balasan dari toko lain',
        ])->assertForbidden();
    }

    public function test_seller_reply_to_dispute(): void
    {
        [$seller, $merchant] = $this->setupSeller();
        $buyer = User::factory()->create(['role' => 'buyer']);
        $otherSeller = User::factory()->create(['role' => 'seller']);
        $this->merchantFor($otherSeller, 'UMKM-OTHER4');

        $order = Order::create([
            'order_code' => 'SP-DISP-'.Str::random(6),
            'pickup_code' => 'SP-7777',
            'user_id' => $buyer->id,
            'merchant_id' => $merchant->id,
            'customer_name' => $buyer->name,
            'customer_phone' => '081234567890',
            'total_original_price' => 50000,
            'total_payment' => 25000,
            'total_discount' => 25000,
            'platform_fee' => 2000,
            'status' => OrderStatus::Completed,
            'payment_status' => PaymentStatus::Paid,
            'paid_at' => now(),
            'completed_at' => now(),
            'qr_code_token' => (string) Str::uuid(),
            'is_verified_by_qr' => true,
        ]);

        $dispute = Dispute::create([
            'ticket_code' => 'TKT-TEST-'.Str::random(4),
            'order_id' => $order->id,
            'reporter_user_id' => $buyer->id,
            'merchant_id' => $merchant->id,
            'category' => 'Kemasan Rusak',
            'description' => 'Kemasan terbuka saat serah terima.',
            'status' => DisputeStatus::Open,
        ]);

        DisputeMessage::create([
            'dispute_id' => $dispute->id,
            'sender_user_id' => $buyer->id,
            'body' => 'Kemasan terbuka saat serah terima.',
        ]);

        // Legitimate seller replies to dispute
        Sanctum::actingAs($seller);
        $replyResponse = $this->postJson("/api/v1/seller/disputes/{$dispute->id}/messages", [
            'body' => 'Mohon maaf atas kelalaian staf kami. Kami siap mengganti produk atau menyetujui refund.',
        ])->assertCreated();

        $this->assertSame('Mohon maaf atas kelalaian staf kami. Kami siap mengganti produk atau menyetujui refund.', $replyResponse->json('data.body'));

        $this->assertDatabaseHas('dispute_messages', [
            'dispute_id' => $dispute->id,
            'sender_user_id' => $seller->id,
            'body' => 'Mohon maaf atas kelalaian staf kami. Kami siap mengganti produk atau menyetujui refund.',
        ]);

        // Cross-merchant negative test: another seller cannot reply
        Sanctum::actingAs($otherSeller);
        $this->postJson("/api/v1/seller/disputes/{$dispute->id}/messages", [
            'body' => 'Penyusup sengketa toko lain',
        ])->assertForbidden();
    }

    /**
     * @return array{0: User, 1: Merchant}
     */
    private function setupSeller(): array
    {
        $seller = User::factory()->create(['role' => 'seller']);
        $merchant = $this->merchantFor($seller, 'UMKM-'.Str::upper(Str::random(6)));

        return [$seller, $merchant];
    }

    private function merchantFor(User $seller, string $code): Merchant
    {
        return Merchant::create([
            'code' => $code,
            'user_id' => $seller->id,
            'business_name' => 'Kala Bakehouse '.Str::random(4),
            'business_category' => 'Bakery & Roti',
            'owner_name' => $seller->name,
            'owner_phone' => '081234567890',
            'owner_email' => $seller->email,
            'business_address' => 'Jl. Riau No. 45',
            'district' => 'Bandung Wetan',
            'verification_status' => VerificationStatus::Verified,
        ]);
    }
}
