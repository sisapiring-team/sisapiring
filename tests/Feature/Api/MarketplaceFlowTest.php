<?php

namespace Tests\Feature\Api;

use App\Enums\EscrowStatus;
use App\Enums\VerificationStatus;
use App\Models\EscrowLedger;
use App\Models\ImpactLog;
use App\Models\Merchant;
use App\Models\Order;
use App\Models\Product;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class MarketplaceFlowTest extends TestCase
{
    use RefreshDatabase;

    public function test_buyer_can_checkout_pay_and_seller_can_complete_pickup(): void
    {
        [$buyer, $seller, $merchant, $product] = $this->marketplace();

        $login = $this->postJson('/api/v1/auth/login', [
            'email' => $buyer->email,
            'password' => 'password',
        ])->assertOk();

        $token = $login->json('token');
        $this->assertNotEmpty($token);

        $this->withHeader('Authorization', 'Bearer '.$token)
            ->getJson('/api/v1/auth/me')
            ->assertOk()
            ->assertJsonPath('user.role', 'buyer');

        $checkout = $this->withHeader('Authorization', 'Bearer '.$token)
            ->postJson('/api/v1/buyer/order-groups', [
                'items' => [['product_code' => $product->code, 'quantity' => 2]],
                'customer_name' => 'Siti Rahmawati',
                'customer_phone' => '085711223344',
                'buyer_note' => 'Tolong dibungkus rapi.',
            ])
            ->assertCreated()
            ->assertJsonPath('data.status', 'pending_payment')
            ->json('data');

        $this->assertSame(2, $product->refresh()->locked_stock);
        $this->assertSame(10, $product->stock);

        $groupCode = $checkout['id'];
        $orderCode = $checkout['orders'][0]['id'];

        $payment = $this->withHeader('Authorization', 'Bearer '.$token)
            ->postJson("/api/v1/buyer/order-groups/{$groupCode}/pay")
            ->assertOk()
            ->json('data');

        $this->withHeader('Authorization', 'Bearer '.$token)
            ->postJson("/api/v1/buyer/payments/{$payment['id']}/mock-pay")
            ->assertOk()
            ->assertJsonPath('data.status', 'paid');

        $this->withHeader('Authorization', 'Bearer '.$token)
            ->getJson("/api/v1/buyer/order-groups/{$groupCode}")
            ->assertOk()
            ->assertJsonPath('data.status', 'waiting_confirmation')
            ->assertJsonPath('data.paymentStatus', 'paid');

        $this->assertSame(0, $product->refresh()->locked_stock);
        $this->assertSame(8, $product->stock);

        Sanctum::actingAs($seller);

        foreach (['confirmed', 'ready_for_pickup'] as $status) {
            $this->patchJson("/api/v1/seller/orders/{$orderCode}/status", ['status' => $status])
                ->assertOk()
                ->assertJsonPath('data.status', $status);
        }

        $this->postJson("/api/v1/seller/orders/{$orderCode}/verify", ['pickup_code' => 'SP-0000'])
            ->assertUnprocessable();

        $pickupCode = Order::where('order_code', $orderCode)->value('pickup_code');

        $this->postJson("/api/v1/seller/orders/{$orderCode}/verify", ['pickup_code' => $pickupCode])
            ->assertOk()
            ->assertJsonPath('data.status', 'completed');

        $this->assertSame(8, $product->refresh()->stock);
        $this->assertDatabaseHas('impact_logs', ['order_id' => Order::where('order_code', $orderCode)->value('id')]);
        $this->assertDatabaseHas('escrow_ledger', ['order_id' => Order::where('order_code', $orderCode)->value('id')]);
        $this->assertSame(1, ImpactLog::count());
        $this->assertSame(2, (int) ImpactLog::first()->portions_rescued);
        $this->assertSame(EscrowStatus::Released->value, EscrowLedger::first()->status->value);
    }

    public function test_buyer_cannot_read_another_buyers_order_group(): void
    {
        [$buyer, $seller, $merchant, $product] = $this->marketplace();
        $otherBuyer = User::factory()->create(['role' => 'buyer']);

        Sanctum::actingAs($buyer);

        $groupCode = $this->postJson('/api/v1/buyer/order-groups', [
            'items' => [['product_code' => $product->code, 'quantity' => 1]],
            'customer_name' => 'Siti Rahmawati',
            'customer_phone' => '085711223344',
        ])->assertCreated()->json('data.id');

        Sanctum::actingAs($otherBuyer);

        $this->getJson("/api/v1/buyer/order-groups/{$groupCode}")->assertForbidden();
    }

    public function test_seller_cannot_manage_another_merchants_order(): void
    {
        [$buyer, $seller, $merchant, $product] = $this->marketplace();
        $otherSeller = User::factory()->create(['role' => 'seller']);
        $otherMerchant = $this->merchantFor($otherSeller, 'UMKM-OTHER');

        Sanctum::actingAs($buyer);

        $orderCode = $this->postJson('/api/v1/buyer/order-groups', [
            'items' => [['product_code' => $product->code, 'quantity' => 1]],
            'customer_name' => 'Siti Rahmawati',
            'customer_phone' => '085711223344',
        ])->assertCreated()->json('data.orders.0.id');

        Sanctum::actingAs($otherSeller);

        $this->patchJson("/api/v1/seller/orders/{$orderCode}/status", ['status' => 'confirmed'])
            ->assertForbidden();
    }

    public function test_catalog_only_lists_verified_merchants_and_active_products(): void
    {
        [$buyer, $seller, $merchant, $product] = $this->marketplace();

        $pendingSeller = User::factory()->create(['role' => 'seller']);
        $pendingMerchant = $this->merchantFor($pendingSeller, 'UMKM-PENDING');
        $pendingMerchant->update(['verification_status' => VerificationStatus::PendingReview]);

        Product::create([
            'code' => 'PRD-PENDING',
            'merchant_id' => $pendingMerchant->id,
            'name' => 'Kue Belum Terverifikasi',
            'category' => 'Bakery & Roti',
            'original_price' => 50000,
            'discount_percentage' => 50,
            'discounted_price' => 25000,
            'stock' => 5,
            'weight_grams' => 350,
            'safe_deadline_at' => now()->addDay(),
            'is_active' => true,
        ]);

        $this->getJson('/api/v1/catalog')
            ->assertOk()
            ->assertJsonFragment(['id' => $product->code])
            ->assertJsonMissing(['id' => 'PRD-PENDING']);
    }

    /**
     * @return array{0: User, 1: User, 2: Merchant, 3: Product}
     */
    private function marketplace(): array
    {
        $buyer = User::factory()->create(['role' => 'buyer']);
        $seller = User::factory()->create(['role' => 'seller']);
        $merchant = $this->merchantFor($seller, 'UMKM-TEST');

        $product = Product::create([
            'code' => 'PRD-TEST',
            'merchant_id' => $merchant->id,
            'name' => 'Paket Roti Surplus',
            'category' => 'Bakery & Roti',
            'original_price' => 60000,
            'discount_percentage' => 50,
            'discounted_price' => 30000,
            'stock' => 10,
            'weight_grams' => 350,
            'safe_deadline_at' => now()->addDay(),
            'is_active' => true,
        ]);

        return [$buyer, $seller, $merchant, $product];
    }

    private function merchantFor(User $seller, string $code): Merchant
    {
        return Merchant::create([
            'code' => $code,
            'user_id' => $seller->id,
            'business_name' => 'Dapur Uji '.Str::random(4),
            'business_category' => 'Bakery & Roti',
            'owner_name' => $seller->name,
            'owner_phone' => '081234567890',
            'owner_email' => $seller->email,
            'business_address' => 'Jl. Uji No. 1',
            'district' => 'Coblong',
            'verification_status' => VerificationStatus::Verified,
        ]);
    }
}
