<?php

namespace Tests\Feature\Api;

use App\Enums\OrderStatus;
use App\Enums\PaymentStatus;
use App\Enums\VerificationStatus;
use App\Models\ImpactLog;
use App\Models\Merchant;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\Review;
use App\Models\StockLock;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class BuyerFeaturesTest extends TestCase
{
    use RefreshDatabase;

    public function test_buyer_order_cancellation_releases_locked_stock(): void
    {
        [$buyer, $seller, $merchant, $product] = $this->setupMarketplace();
        $otherBuyer = User::factory()->create(['role' => 'buyer']);

        Sanctum::actingAs($buyer);

        $checkoutResponse = $this->postJson('/api/v1/buyer/order-groups', [
            'items' => [['product_code' => $product->code, 'quantity' => 3]],
            'customer_name' => 'Siti Rahmawati',
            'customer_phone' => '085711223344',
            'buyer_note' => 'Bungkus terpisah.',
        ])->assertCreated();

        $groupCode = $checkoutResponse->json('data.id');
        $this->assertNotEmpty($groupCode);

        // Verify locked stock was incremented
        $product->refresh();
        $this->assertSame(3, $product->locked_stock);
        $this->assertSame(10, $product->stock);

        $stockLock = StockLock::where('product_id', $product->id)->first();
        $this->assertNotNull($stockLock);
        $this->assertSame('active', $stockLock->status);
        $this->assertSame(3, $stockLock->quantity);

        // Negative test: Another buyer cannot cancel this group
        Sanctum::actingAs($otherBuyer);
        $this->postJson("/api/v1/buyer/order-groups/{$groupCode}/cancel", [
            'reason' => 'Mencoba batalkan milik orang lain',
        ])->assertForbidden();

        // Legitimate buyer cancels order group
        Sanctum::actingAs($buyer);
        $cancelResponse = $this->postJson("/api/v1/buyer/order-groups/{$groupCode}/cancel", [
            'reason' => 'Perubahan rencana konsumsi makanan',
        ])->assertOk();

        $this->assertSame('Pesanan dibatalkan.', $cancelResponse->json('message'));
        $this->assertSame(OrderStatus::Cancelled->value, $cancelResponse->json('data.status'));

        // Verify locked stock is released back to 0 while available stock remains 10
        $product->refresh();
        $this->assertSame(0, $product->locked_stock);
        $this->assertSame(10, $product->stock);

        $stockLock->refresh();
        $this->assertSame('released', $stockLock->status);
    }

    public function test_buyer_review_submission_for_completed_order_item(): void
    {
        [$buyer, $seller, $merchant, $product] = $this->setupMarketplace();

        // Create completed order and item directly for the buyer
        $order = Order::create([
            'order_code' => 'SP-TEST-'.Str::random(6),
            'pickup_code' => 'SP-1234',
            'user_id' => $buyer->id,
            'merchant_id' => $merchant->id,
            'customer_name' => $buyer->name,
            'customer_phone' => '081234567890',
            'total_original_price' => 60000,
            'total_payment' => 30000,
            'total_discount' => 30000,
            'platform_fee' => 2000,
            'status' => OrderStatus::Completed,
            'payment_status' => PaymentStatus::Paid,
            'paid_at' => now(),
            'completed_at' => now(),
            'qr_code_token' => (string) Str::uuid(),
            'is_verified_by_qr' => true,
            'verified_at' => now(),
        ]);

        $orderItem = OrderItem::create([
            'order_id' => $order->id,
            'product_id' => $product->id,
            'product_name' => $product->name,
            'category' => $product->category,
            'original_price' => 60000,
            'price_per_item' => 30000,
            'quantity' => 1,
            'subtotal' => 30000,
            'weight_grams_total' => 350,
        ]);

        Sanctum::actingAs($buyer);

        $response = $this->postJson('/api/v1/buyer/reviews', [
            'order_item_id' => $orderItem->id,
            'rating' => 5,
            'comment' => 'Kualitas roti sangat baik dan masih renyah!',
            'tags' => ['Renyah', 'Porsi Pas', 'Higienis'],
        ])->assertCreated();

        $this->assertSame(5, $response->json('data.rating'));
        $this->assertSame('Kualitas roti sangat baik dan masih renyah!', $response->json('data.comment'));

        $this->assertDatabaseHas('reviews', [
            'order_item_id' => $orderItem->id,
            'reviewer_user_id' => $buyer->id,
            'rating' => 5,
            'moderation_status' => 'published',
        ]);

        // Merchant rating should be updated to 5.0
        $merchant->refresh();
        $this->assertEquals(5.0, (float) $merchant->rating);
    }

    public function test_rejection_of_review_for_uncompleted_order_item(): void
    {
        [$buyer, $seller, $merchant, $product] = $this->setupMarketplace();
        $otherBuyer = User::factory()->create(['role' => 'buyer']);

        // Order is still waiting_confirmation (not completed)
        $uncompletedOrder = Order::create([
            'order_code' => 'SP-TEST-'.Str::random(6),
            'pickup_code' => 'SP-5678',
            'user_id' => $buyer->id,
            'merchant_id' => $merchant->id,
            'customer_name' => $buyer->name,
            'customer_phone' => '081234567890',
            'total_original_price' => 60000,
            'total_payment' => 30000,
            'total_discount' => 30000,
            'platform_fee' => 2000,
            'status' => OrderStatus::WaitingConfirmation,
            'payment_status' => PaymentStatus::Paid,
            'paid_at' => now(),
            'qr_code_token' => (string) Str::uuid(),
            'is_verified_by_qr' => false,
        ]);

        $orderItem = OrderItem::create([
            'order_id' => $uncompletedOrder->id,
            'product_id' => $product->id,
            'product_name' => $product->name,
            'category' => $product->category,
            'original_price' => 60000,
            'price_per_item' => 30000,
            'quantity' => 1,
            'subtotal' => 30000,
            'weight_grams_total' => 350,
        ]);

        Sanctum::actingAs($buyer);

        // Attempting to review an uncompleted order item must fail
        $this->postJson('/api/v1/buyer/reviews', [
            'order_item_id' => $orderItem->id,
            'rating' => 4,
            'comment' => 'Belum diambil tapi mau ulas duluan.',
        ])->assertUnprocessable()
            ->assertJsonValidationErrors(['order_item_id']);

        // Other buyer attempting to review this item must also fail
        Sanctum::actingAs($otherBuyer);
        $this->postJson('/api/v1/buyer/reviews', [
            'order_item_id' => $orderItem->id,
            'rating' => 3,
            'comment' => 'Bukan pesanan saya.',
        ])->assertUnprocessable();

        $this->assertSame(0, Review::count());
    }

    public function test_buyer_dispute_creation_and_messaging(): void
    {
        [$buyer, $seller, $merchant, $product] = $this->setupMarketplace();
        $otherBuyer = User::factory()->create(['role' => 'buyer']);

        $order = Order::create([
            'order_code' => 'SP-TEST-'.Str::random(6),
            'pickup_code' => 'SP-9999',
            'user_id' => $buyer->id,
            'merchant_id' => $merchant->id,
            'customer_name' => $buyer->name,
            'customer_phone' => '081234567890',
            'total_original_price' => 60000,
            'total_payment' => 30000,
            'total_discount' => 30000,
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
            'product_id' => $product->id,
            'product_name' => $product->name,
            'category' => $product->category,
            'original_price' => 60000,
            'price_per_item' => 30000,
            'quantity' => 1,
            'subtotal' => 30000,
            'weight_grams_total' => 350,
        ]);

        Sanctum::actingAs($buyer);

        // Buyer opens a dispute
        $disputeResponse = $this->postJson('/api/v1/buyer/disputes', [
            'order_id' => $order->id,
            'order_item_id' => $orderItem->id,
            'category' => 'Kualitas Makanan Tidak Layak',
            'description' => 'Makanan sudah berbau asam saat diambil di lokasi toko.',
            'evidence_path' => 'disputes/evidence_sample.jpg',
        ])->assertCreated();

        $disputeId = $disputeResponse->json('data.id');
        $this->assertNotEmpty($disputeId);
        $this->assertSame('open', $disputeResponse->json('data.status'));
        $this->assertNotEmpty($disputeResponse->json('data.ticketCode'));

        // Buyer sends a follow-up message to the dispute
        $msgResponse = $this->postJson("/api/v1/buyer/disputes/{$disputeId}/messages", [
            'body' => 'Saya sertakan juga foto struk pengambilan dan nomor seri kemasan.',
            'attachment_path' => 'disputes/receipt.jpg',
        ])->assertCreated();

        $this->assertSame('Saya sertakan juga foto struk pengambilan dan nomor seri kemasan.', $msgResponse->json('data.body'));

        // Negative test: Another buyer cannot view or reply to this dispute
        Sanctum::actingAs($otherBuyer);
        $this->getJson("/api/v1/buyer/disputes/{$disputeId}")->assertForbidden();
        $this->postJson("/api/v1/buyer/disputes/{$disputeId}/messages", [
            'body' => 'Pesan dari penyusup',
        ])->assertForbidden();
    }

    public function test_direct_conversation_initiation_with_merchant(): void
    {
        [$buyer, $seller, $merchant, $product] = $this->setupMarketplace();

        Sanctum::actingAs($buyer);

        // Buyer starts a new conversation with merchant
        $startResponse = $this->postJson('/api/v1/conversations', [
            'merchant_code' => $merchant->code,
            'message' => 'Halo kak, apakah menu roti ini ready untuk diambil sebelum jam 19:00?',
        ])->assertCreated();

        $conversationId = $startResponse->json('data.id');
        $this->assertNotEmpty($conversationId);
        $this->assertSame($merchant->code, $startResponse->json('data.merchant.id'));

        // Buyer sends a second message
        $sendResponse = $this->postJson("/api/v1/conversations/{$conversationId}/messages", [
            'body' => 'Saya mau ambil sekitar 15 menit lagi.',
            'type' => 'text',
        ])->assertCreated();

        $this->assertSame('Saya mau ambil sekitar 15 menit lagi.', $sendResponse->json('data.body'));

        // List conversations
        $listResponse = $this->getJson('/api/v1/conversations')
            ->assertOk();
        $this->assertCount(1, $listResponse->json('data'));

        // Mark conversation as read
        $this->postJson("/api/v1/conversations/{$conversationId}/read")
            ->assertOk()
            ->assertJsonPath('message', 'Pesan ditandai sudah dibaca.');
    }

    public function test_buyer_environmental_impact_query(): void
    {
        [$buyer, $seller, $merchant, $product] = $this->setupMarketplace();

        // Record impact log for the buyer with null order_id
        ImpactLog::create([
            'order_id' => null,
            'merchant_id' => $merchant->id,
            'user_id' => $buyer->id,
            'portions_rescued' => 4,
            'weight_rescued_kg' => 1.400,
            'co2_prevented_kg' => 3.500,
            'methane_prevented_kg' => 0.280,
            'water_saved_liters' => 700.00,
            'money_saved_idr' => 60000.00,
        ]);

        Sanctum::actingAs($buyer);

        $response = $this->getJson('/api/v1/buyer/impact')
            ->assertOk();

        $this->assertSame(4, (int) $response->json('totals.portionsRescued'));
        $this->assertEquals(1.4, (float) $response->json('totals.weightRescuedKg'));
        $this->assertEquals(3.5, (float) $response->json('totals.co2PreventedKg'));
        $this->assertEquals(60000.0, (float) $response->json('totals.moneySavedIdr'));
    }

    public function test_catalog_category_browsing_and_filtering(): void
    {
        [$buyer, $seller, $merchant, $product1] = $this->setupMarketplace();

        // Second product in different category
        $product2 = Product::create([
            'code' => 'PRD-MEAL-01',
            'merchant_id' => $merchant->id,
            'name' => 'Nasi Kotak Ayam Bakar',
            'category' => 'Makanan Berat',
            'original_price' => 35000,
            'discount_percentage' => 50,
            'discounted_price' => 17500,
            'stock' => 8,
            'weight_grams' => 450,
            'safe_deadline_at' => now()->addDay(),
            'is_active' => true,
        ]);

        // Query available categories
        $categoriesResponse = $this->getJson('/api/v1/catalog/categories')
            ->assertOk();

        $categories = $categoriesResponse->json('data');
        $this->assertContains('Bakery & Roti', $categories);
        $this->assertContains('Makanan Berat', $categories);

        // Filter catalog by category 'Bakery & Roti'
        $filteredResponse = $this->getJson('/api/v1/catalog?category=Bakery%20%26%20Roti')
            ->assertOk();

        $itemIds = collect($filteredResponse->json('data'))->pluck('id')->all();
        $this->assertContains($product1->code, $itemIds);
        $this->assertNotContains($product2->code, $itemIds);

        // Filter catalog by category 'Makanan Berat'
        $filteredMealResponse = $this->getJson('/api/v1/catalog?category=Makanan%20Berat')
            ->assertOk();

        $mealIds = collect($filteredMealResponse->json('data'))->pluck('id')->all();
        $this->assertContains($product2->code, $mealIds);
        $this->assertNotContains($product1->code, $mealIds);
    }

    /**
     * @return array{0: User, 1: User, 2: Merchant, 3: Product}
     */
    private function setupMarketplace(): array
    {
        $buyer = User::factory()->create(['role' => 'buyer']);
        $seller = User::factory()->create(['role' => 'seller']);

        $merchant = Merchant::create([
            'code' => 'UMKM-'.Str::upper(Str::random(6)),
            'user_id' => $seller->id,
            'business_name' => 'Toko Surplus Bandung',
            'business_category' => 'Bakery & Roti',
            'owner_name' => $seller->name,
            'owner_phone' => '081299887766',
            'owner_email' => $seller->email,
            'business_address' => 'Jl. Braga No. 10',
            'district' => 'Sumur Bandung',
            'verification_status' => VerificationStatus::Verified,
        ]);

        $product = Product::create([
            'code' => 'PRD-'.Str::upper(Str::random(6)),
            'merchant_id' => $merchant->id,
            'name' => 'Aneka Pastry Surplus',
            'category' => 'Bakery & Roti',
            'original_price' => 60000,
            'discount_percentage' => 50,
            'discounted_price' => 30000,
            'stock' => 10,
            'locked_stock' => 0,
            'weight_grams' => 350,
            'safe_deadline_at' => now()->addDay(),
            'is_active' => true,
        ]);

        return [$buyer, $seller, $merchant, $product];
    }
}
