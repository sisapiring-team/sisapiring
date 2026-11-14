<?php

namespace Tests\Feature\Api;

use App\Enums\AccountStatus;
use App\Enums\DisputeStatus;
use App\Enums\EscrowStatus;
use App\Enums\EscrowType;
use App\Enums\ModerationStatus;
use App\Enums\OrderStatus;
use App\Enums\PaymentStatus;
use App\Enums\ReviewStatus;
use App\Enums\VerificationStatus;
use App\Models\Dispute;
use App\Models\EscrowLedger;
use App\Models\Merchant;
use App\Models\Order;
use App\Models\OrderGroup;
use App\Models\OrderItem;
use App\Models\Payment;
use App\Models\Product;
use App\Models\Review;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

class AdminGovernanceTest extends TestCase
{
    use RefreshDatabase;

    public function test_umkm_merchant_verification_suspension_and_reinstatement(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $seller = User::factory()->create(['role' => 'seller']);

        $merchant = Merchant::create([
            'code' => 'UMKM-BDG-TEST',
            'user_id' => $seller->id,
            'business_name' => 'Kala Bakehouse Test',
            'business_category' => 'Bakery & Roti',
            'owner_name' => $seller->name,
            'owner_phone' => '081234567890',
            'owner_email' => $seller->email,
            'business_address' => 'Jl. Dago No. 12',
            'district' => 'Coblong',
            'verification_status' => VerificationStatus::PendingReview,
            'is_open_today' => true,
        ]);

        $product = Product::create([
            'code' => 'PRD-BDG-TEST',
            'merchant_id' => $merchant->id,
            'name' => 'Croissant Almond',
            'category' => 'Bakery & Roti',
            'original_price' => 30000,
            'discount_percentage' => 50,
            'discounted_price' => 15000,
            'stock' => 10,
            'weight_grams' => 200,
            'is_active' => true,
            'moderation_status' => ModerationStatus::UnderReview,
        ]);

        Sanctum::actingAs($admin);

        // 1. Admin Verifies Merchant
        $verifyResponse = $this->postJson("/api/v1/admin/merchants/{$merchant->code}/verify", [
            'status' => 'verified',
            'note' => 'Dokumen NIB dan sertifikasi higienis terverifikasi valid.',
        ])->assertOk();

        $this->assertSame('verified', $verifyResponse->json('data.verificationStatus'));

        $merchant->refresh();
        $this->assertSame(VerificationStatus::Verified, $merchant->verification_status);
        $this->assertSame('Dokumen NIB dan sertifikasi higienis terverifikasi valid.', $merchant->verification_notes);

        // Associated products should be promoted to Active
        $product->refresh();
        $this->assertSame(ModerationStatus::Active, $product->moderation_status);

        // 2. Admin Suspends Merchant
        $suspendResponse = $this->postJson("/api/v1/admin/merchants/{$merchant->code}/suspend", [
            'reason' => 'Laporan kontaminasi makanan berulang dari pembeli.',
        ])->assertOk();

        $this->assertSame('Merchant dibekukan.', $suspendResponse->json('message'));

        $merchant->refresh();
        $this->assertSame('Laporan kontaminasi makanan berulang dari pembeli.', $merchant->suspended_reason);
        $this->assertFalse($merchant->is_open_today);

        // All merchant products should be deactivated
        $product->refresh();
        $this->assertFalse($product->is_active);

        // 3. Admin Reinstates Merchant
        $reinstateResponse = $this->postJson("/api/v1/admin/merchants/{$merchant->code}/reinstate")
            ->assertOk();

        $this->assertSame('Merchant diaktifkan kembali.', $reinstateResponse->json('message'));

        $merchant->refresh();
        $this->assertNull($merchant->suspended_reason);
        $this->assertTrue($merchant->is_open_today);
    }

    public function test_food_surplus_product_moderation_and_takedown(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $seller = User::factory()->create(['role' => 'seller']);

        $merchant = Merchant::create([
            'code' => 'UMKM-MOD-TEST',
            'user_id' => $seller->id,
            'business_name' => 'Dapur Uji Moderasi',
            'business_category' => 'Bakery & Roti',
            'owner_name' => $seller->name,
            'owner_phone' => '081234567890',
            'owner_email' => $seller->email,
            'business_address' => 'Jl. Moderasi No. 1',
            'district' => 'Coblong',
            'verification_status' => VerificationStatus::Verified,
        ]);

        $product = Product::create([
            'code' => 'PRD-TAKEDOWN-01',
            'merchant_id' => $merchant->id,
            'name' => 'Pastry Roti Rusak',
            'category' => 'Bakery & Roti',
            'original_price' => 50000,
            'discount_percentage' => 50,
            'discounted_price' => 25000,
            'stock' => 5,
            'weight_grams' => 300,
            'is_active' => true,
            'moderation_status' => ModerationStatus::Active,
        ]);

        Sanctum::actingAs($admin);

        // Admin takes down unsafe product
        $takedownResponse = $this->postJson("/api/v1/admin/products/{$product->code}/moderate", [
            'status' => 'taken_down',
            'reason' => 'Kemasan pecah dan potensi kontaminasi jamur.',
        ])->assertOk();

        $this->assertSame('taken_down', $takedownResponse->json('data.moderationStatus'));
        $this->assertFalse($takedownResponse->json('data.isActive'));

        $product->refresh();
        $this->assertSame(ModerationStatus::TakenDown, $product->moderation_status);
        $this->assertFalse($product->is_active);
        $this->assertSame('Kemasan pecah dan potensi kontaminasi jamur.', $product->takedown_reason);

        // Verify product moderation history record
        $this->assertDatabaseHas('product_moderations', [
            'product_id' => $product->id,
            'actor_user_id' => $admin->id,
            'action' => 'taken_down',
            'reason' => 'Kemasan pecah dan potensi kontaminasi jamur.',
        ]);

        // Re-activate product
        $this->postJson("/api/v1/admin/products/{$product->code}/moderate", [
            'status' => 'active',
            'reason' => 'Pemeriksaan ulang lolos standar kualitas.',
        ])->assertOk();

        $product->refresh();
        $this->assertSame(ModerationStatus::Active, $product->moderation_status);
        $this->assertNull($product->takedown_reason);
    }

    public function test_dispute_resolution_with_buyer_escrow_refund(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $buyer = User::factory()->create(['role' => 'buyer']);
        $seller = User::factory()->create(['role' => 'seller']);

        $merchant = Merchant::create([
            'code' => 'UMKM-DISP-TEST',
            'user_id' => $seller->id,
            'business_name' => 'Toko Sengketa Refund',
            'business_category' => 'Bakery & Roti',
            'owner_name' => $seller->name,
            'owner_phone' => '081234567890',
            'owner_email' => $seller->email,
            'business_address' => 'Jl. Dipatiukur No. 88',
            'district' => 'Coblong',
            'verification_status' => VerificationStatus::Verified,
        ]);

        $group = OrderGroup::create([
            'group_code' => 'SPG-REFUND-001',
            'user_id' => $buyer->id,
            'status' => OrderStatus::Completed,
            'payment_status' => PaymentStatus::Paid,
            'subtotal' => 50000,
            'platform_fee' => 2000,
            'grand_total' => 52000,
        ]);

        $payment = Payment::create([
            'order_group_id' => $group->id,
            'user_id' => $buyer->id,
            'provider' => 'xendit',
            'method' => 'qris',
            'status' => PaymentStatus::Paid,
            'amount' => 52000,
            'currency' => 'IDR',
            'external_id' => 'PAY-'.Str::random(10),
        ]);

        $order = Order::create([
            'order_group_id' => $group->id,
            'order_code' => 'SP-DISP-REFUND',
            'pickup_code' => 'SP-8888',
            'user_id' => $buyer->id,
            'merchant_id' => $merchant->id,
            'customer_name' => $buyer->name,
            'customer_phone' => '081234567890',
            'total_original_price' => 100000,
            'total_payment' => 50000,
            'total_discount' => 50000,
            'platform_fee' => 2000,
            'status' => OrderStatus::Completed,
            'payment_status' => PaymentStatus::Paid,
            'paid_at' => now(),
            'completed_at' => now(),
            'qr_code_token' => (string) Str::uuid(),
            'is_verified_by_qr' => true,
        ]);

        // Create escrow hold entry
        $escrow = EscrowLedger::create([
            'order_id' => $order->id,
            'merchant_id' => $merchant->id,
            'entry_type' => EscrowType::Hold,
            'status' => EscrowStatus::Held,
            'amount' => 50000,
            'currency' => 'IDR',
            'reference' => 'HOLD-'.$order->order_code,
        ]);

        // Create open dispute
        $dispute = Dispute::create([
            'ticket_code' => 'TKT-REFUND-001',
            'order_id' => $order->id,
            'reporter_user_id' => $buyer->id,
            'merchant_id' => $merchant->id,
            'category' => 'Pesanan Basi',
            'description' => 'Makanan sudah tidak layak konsumsi saat diambil.',
            'status' => DisputeStatus::Open,
        ]);

        Sanctum::actingAs($admin);

        // Admin resolves dispute with full buyer refund
        $resolveResponse = $this->postJson("/api/v1/admin/disputes/{$dispute->id}/resolve", [
            'status' => 'resolved_refund',
            'resolution_type' => 'full_refund',
            'resolution_note' => 'Disetujui pengembalian dana penuh ke pembeli.',
            'refund_amount' => 50000,
        ])->assertOk();

        $this->assertSame('resolved_refund', $resolveResponse->json('data.status'));
        $this->assertEquals(50000, (float) $resolveResponse->json('data.refundAmount'));

        $dispute->refresh();
        $this->assertSame(DisputeStatus::ResolvedRefund, $dispute->status);
        $this->assertSame('Disetujui pengembalian dana penuh ke pembeli.', $dispute->resolution_note);
        $this->assertSame($admin->id, $dispute->resolved_by);

        // Escrow ledger entry should be updated to 'refunded'
        $escrow->refresh();
        $this->assertSame(EscrowStatus::Refunded, $escrow->status);

        // Negative test: Resolving an already resolved dispute must be rejected
        $this->postJson("/api/v1/admin/disputes/{$dispute->id}/resolve", [
            'status' => 'resolved_refund',
            'resolution_note' => 'Resolusi ulang yang tidak sah',
        ])->assertUnprocessable()
            ->assertJsonValidationErrors(['status']);
    }

    public function test_user_account_status_update_and_self_suspension_rejection(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $buyer = User::factory()->create([
            'role' => 'buyer',
            'account_status' => AccountStatus::Active,
        ]);

        Sanctum::actingAs($admin);

        // Admin updates buyer status to suspended
        $suspendResponse = $this->patchJson("/api/v1/admin/users/{$buyer->id}/status", [
            'status' => 'suspended',
            'note' => 'Akun terindikasi melakukan penyalahgunaan promo dan pembatalan berulang.',
        ])->assertOk();

        $this->assertSame('suspended', $suspendResponse->json('data.accountStatus'));

        $buyer->refresh();
        $this->assertSame(AccountStatus::Suspended, $buyer->account_status);
        $this->assertSame('Akun terindikasi melakukan penyalahgunaan promo dan pembatalan berulang.', $buyer->sanction_note);
        $this->assertSame($admin->id, $buyer->suspended_by);
        $this->assertNotNull($buyer->suspended_at);

        // Admin updates buyer status to active (reinstatement)
        $this->patchJson("/api/v1/admin/users/{$buyer->id}/status", [
            'status' => 'active',
            'note' => 'Banding diterima, akun dipulihkan.',
        ])->assertOk();

        $buyer->refresh();
        $this->assertSame(AccountStatus::Active, $buyer->account_status);
        $this->assertNull($buyer->suspended_at);

        // Negative test: Admin cannot change their own account status
        $selfResponse = $this->patchJson("/api/v1/admin/users/{$admin->id}/status", [
            'status' => 'suspended',
            'note' => 'Mencoba membekukan akun sendiri',
        ])->assertUnprocessable();

        $this->assertSame('Anda tidak dapat mengubah status akun sendiri.', $selfResponse->json('message'));
        $this->assertSame(AccountStatus::Active, $admin->refresh()->account_status);
    }

    public function test_review_moderation_by_admin(): void
    {
        $admin = User::factory()->create(['role' => 'admin']);
        $buyer = User::factory()->create(['role' => 'buyer']);
        $seller = User::factory()->create(['role' => 'seller']);

        $merchant = Merchant::create([
            'code' => 'UMKM-REV-MOD',
            'user_id' => $seller->id,
            'business_name' => 'Dapur Review Moderasi',
            'business_category' => 'Bakery & Roti',
            'owner_name' => $seller->name,
            'owner_phone' => '081234567890',
            'owner_email' => $seller->email,
            'business_address' => 'Jl. Supratman No. 20',
            'district' => 'Cibeunying Kaler',
            'verification_status' => VerificationStatus::Verified,
        ]);

        $order = Order::create([
            'order_code' => 'SP-REV-MOD-01',
            'pickup_code' => 'SP-4444',
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
            'product_name' => 'Roti Isi Coklat',
            'category' => 'Bakery & Roti',
            'original_price' => 50000,
            'price_per_item' => 25000,
            'quantity' => 1,
            'subtotal' => 25000,
            'weight_grams_total' => 300,
        ]);

        $review = Review::create([
            'order_id' => $order->id,
            'order_item_id' => $orderItem->id,
            'merchant_id' => $merchant->id,
            'reviewer_user_id' => $buyer->id,
            'rating' => 1,
            'comment' => 'Ulasan memuat kata kasar dan tidak pantas untuk ditampilkan.',
            'moderation_status' => ReviewStatus::Published,
        ]);

        Sanctum::actingAs($admin);

        // Admin hides the inappropriate review
        $modResponse = $this->postJson("/api/v1/admin/reviews/{$review->id}/moderate", [
            'status' => 'hidden',
            'reason' => 'Pelanggaran pedoman komunitas: kata-kata kasar.',
            'admin_reply' => 'Ulasan ini telah disembunyikan oleh tim moderasi SisaPiring.',
        ])->assertOk();

        $this->assertSame('hidden', $modResponse->json('data.moderationStatus'));
        $this->assertSame('Pelanggaran pedoman komunitas: kata-kata kasar.', $modResponse->json('data.flagReason'));
        $this->assertSame('Ulasan ini telah disembunyikan oleh tim moderasi SisaPiring.', $modResponse->json('data.adminReply'));

        $review->refresh();
        $this->assertSame(ReviewStatus::Hidden, $review->moderation_status);
        $this->assertSame('Pelanggaran pedoman komunitas: kata-kata kasar.', $review->flag_reason);
        $this->assertSame($admin->id, $review->moderated_by);
    }

    public function test_non_admin_access_rejection(): void
    {
        $buyer = User::factory()->create(['role' => 'buyer']);
        $seller = User::factory()->create(['role' => 'seller']);

        $merchant = Merchant::create([
            'code' => 'UMKM-SEC-TEST',
            'user_id' => $seller->id,
            'business_name' => 'Toko Uji Akses',
            'business_category' => 'Bakery & Roti',
            'owner_name' => $seller->name,
            'owner_phone' => '081234567890',
            'owner_email' => $seller->email,
            'business_address' => 'Jl. Akses No. 1',
            'district' => 'Coblong',
            'verification_status' => VerificationStatus::Verified,
        ]);

        $product = Product::create([
            'code' => 'PRD-SEC-TEST',
            'merchant_id' => $merchant->id,
            'name' => 'Produk Uji Akses',
            'category' => 'Bakery & Roti',
            'original_price' => 30000,
            'discount_percentage' => 50,
            'discounted_price' => 15000,
            'stock' => 5,
            'weight_grams' => 200,
            'is_active' => true,
        ]);

        $order = Order::create([
            'order_code' => 'SP-SEC-ORDER',
            'pickup_code' => 'SP-1111',
            'user_id' => $buyer->id,
            'merchant_id' => $merchant->id,
            'customer_name' => $buyer->name,
            'customer_phone' => '081234567890',
            'total_original_price' => 30000,
            'total_payment' => 15000,
            'total_discount' => 15000,
            'platform_fee' => 2000,
            'status' => OrderStatus::Completed,
            'payment_status' => PaymentStatus::Paid,
            'paid_at' => now(),
            'qr_code_token' => (string) Str::uuid(),
            'is_verified_by_qr' => true,
        ]);

        $dispute = Dispute::create([
            'ticket_code' => 'TKT-SEC-001',
            'order_id' => $order->id,
            'reporter_user_id' => $buyer->id,
            'merchant_id' => $merchant->id,
            'category' => 'Uji Akses',
            'description' => 'Uji akses sengketa non-admin',
            'status' => DisputeStatus::Open,
        ]);

        // 1. Unauthenticated request to admin dashboard
        $this->getJson('/api/v1/admin/dashboard')
            ->assertUnauthorized();

        // 2. Buyer attempts to access admin dashboard
        Sanctum::actingAs($buyer);
        $this->getJson('/api/v1/admin/dashboard')
            ->assertForbidden()
            ->assertJsonPath('message', 'Anda tidak memiliki akses ke sumber daya ini.');

        // 3. Seller attempts to verify merchant
        Sanctum::actingAs($seller);
        $this->postJson("/api/v1/admin/merchants/{$merchant->code}/verify", [
            'status' => 'verified',
        ])->assertForbidden()
            ->assertJsonPath('message', 'Anda tidak memiliki akses ke sumber daya ini.');

        // 4. Buyer attempts to moderate product
        Sanctum::actingAs($buyer);
        $this->postJson("/api/v1/admin/products/{$product->code}/moderate", [
            'status' => 'taken_down',
        ])->assertForbidden()
            ->assertJsonPath('message', 'Anda tidak memiliki akses ke sumber daya ini.');

        // 5. Buyer attempts to resolve dispute
        $this->postJson("/api/v1/admin/disputes/{$dispute->id}/resolve", [
            'status' => 'resolved_refund',
        ])->assertForbidden()
            ->assertJsonPath('message', 'Anda tidak memiliki akses ke sumber daya ini.');

        // 6. Seller attempts to update user status
        Sanctum::actingAs($seller);
        $this->patchJson("/api/v1/admin/users/{$buyer->id}/status", [
            'status' => 'suspended',
        ])->assertForbidden()
            ->assertJsonPath('message', 'Anda tidak memiliki akses ke sumber daya ini.');
    }
}
