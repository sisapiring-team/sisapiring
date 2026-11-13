<?php

namespace Database\Seeders;

use App\Enums\AccountStatus;
use App\Enums\DisputeStatus;
use App\Enums\EscrowStatus;
use App\Enums\EscrowType;
use App\Enums\ModerationStatus;
use App\Enums\OrderStatus;
use App\Enums\PaymentMethod;
use App\Enums\PaymentStatus;
use App\Enums\ReviewStatus;
use App\Enums\UserRole;
use App\Enums\VerificationStatus;
use App\Models\Conversation;
use App\Models\Dispute;
use App\Models\DisputeMessage;
use App\Models\EscrowLedger;
use App\Models\ImpactLog;
use App\Models\Merchant;
use App\Models\Message;
use App\Models\Order;
use App\Models\OrderGroup;
use App\Models\OrderItem;
use App\Models\Payment;
use App\Models\Product;
use App\Models\Review;
use App\Models\StockLock;
use App\Models\User;
use App\Notifications\SystemNotification;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $password = Hash::make('SisaPiring123');

        $sellerKala = User::updateOrCreate(
            ['email' => 'seller@sisapiring.com'],
            [
                'name' => 'Kang Ridwan Sasmita',
                'phone' => '+62 812-2345-6789',
                'role' => UserRole::Seller,
                'account_status' => AccountStatus::Active,
                'avatar' => '/assets/images/umkm_partner_portrait_1794295655906.jpg',
                'password' => $password,
                'email_verified_at' => now(),
            ]
        );

        $sellerSiti = User::updateOrCreate(
            ['email' => 'dapurbusiti@sisapiring.com'],
            [
                'name' => 'Ibu Siti Haryanti',
                'phone' => '+62 813-2211-4455',
                'role' => UserRole::Seller,
                'account_status' => AccountStatus::Active,
                'password' => $password,
                'email_verified_at' => now(),
            ]
        );

        $buyer = User::updateOrCreate(
            ['email' => 'buyer@sisapiring.com'],
            [
                'name' => 'Siti Rahmawati',
                'phone' => '+62 857-1122-3344',
                'district' => 'Bandung Wetan',
                'default_address' => 'Jl. Progo No. 14, Bandung Wetan',
                'role' => UserRole::Buyer,
                'account_status' => AccountStatus::Active,
                'password' => $password,
                'email_verified_at' => now(),
            ]
        );

        $buyerBudi = User::updateOrCreate(
            ['email' => 'budi.santoso@gmail.com'],
            [
                'name' => 'Budi Santoso',
                'phone' => '+62 813-9876-5432',
                'district' => 'Coblong',
                'role' => UserRole::Buyer,
                'account_status' => AccountStatus::Active,
                'password' => $password,
                'email_verified_at' => now(),
            ]
        );

        $admin = User::updateOrCreate(
            ['email' => 'admin@sisapiring.com'],
            [
                'name' => 'Admin SisaPiring Bandung',
                'phone' => '+62 811-0000-9999',
                'role' => UserRole::Admin,
                'account_status' => AccountStatus::Active,
                'password' => $password,
                'email_verified_at' => now(),
            ]
        );

        $merchantKala = Merchant::updateOrCreate(
            ['code' => 'UMKM-BDG-042'],
            [
                'user_id' => $sellerKala->id,
                'business_name' => 'Kala Bakehouse & Artisan Cafe',
                'business_category' => 'Bakery & Roti',
                'owner_name' => 'Kang Ridwan Sasmita',
                'owner_phone' => '+62 812-2345-6789',
                'owner_email' => 'ridwan@kalabakehouse.id',
                'business_address' => 'Jl. Progo No. 14, Citarum, Bandung Wetan, Bandung',
                'city' => 'Bandung',
                'district' => 'Bandung Wetan',
                'latitude' => -6.90389,
                'longitude' => 107.61861,
                'business_photo' => '/assets/images/sisapiring_storefront_1794322286782.jpg',
                'business_document_name' => 'NIB_02847291038_KalaBakehouse.pdf',
                'nib_number' => '02847291038',
                'doc_type' => 'nib',
                'hygiene_commitment_signed' => true,
                'verification_status' => VerificationStatus::Verified,
                'verification_notes' => 'Terverifikasi resmi oleh Kurator SisaPiring Bandung.',
                'reviewed_by' => $admin->id,
                'reviewed_at' => now()->subDays(30),
                'operating_hours' => '08:00 - 21:00 WIB',
                'pickup_window' => '17:30 - 21:00 WIB',
                'store_bio' => 'Bakehouse artisan spesialis sourdough, viennoiserie, dan pastry hangat di kawasan Progo Bandung.',
                'is_open_today' => true,
                'rating' => 4.90,
                'total_rescued_count' => 184,
            ]
        );

        $merchantSiti = Merchant::updateOrCreate(
            ['code' => 'UMKM-BDG-015'],
            [
                'user_id' => $sellerSiti->id,
                'business_name' => 'Dapur Bu Siti Katering Nusantara',
                'business_category' => 'Katering & Nasi Kotak',
                'owner_name' => 'Ibu Siti Haryanti',
                'owner_phone' => '+62 813-2211-4455',
                'owner_email' => 'dapurbusiti@gmail.com',
                'business_address' => 'Jl. Dipatiukur No. 45, Coblong, Bandung',
                'city' => 'Bandung',
                'district' => 'Coblong',
                'latitude' => -6.89123,
                'longitude' => 107.61678,
                'business_photo' => '/assets/images/food_nasi_kapau_bowl_1794295653656.jpg',
                'business_document_name' => 'NIB_91823719283_DapurBuSiti.pdf',
                'nib_number' => '91823719283',
                'doc_type' => 'nib',
                'hygiene_commitment_signed' => true,
                'verification_status' => VerificationStatus::Verified,
                'verification_notes' => 'Dapur katering higienis tersertifikasi Halal & Dinkes.',
                'reviewed_by' => $admin->id,
                'reviewed_at' => now()->subDays(21),
                'operating_hours' => '09:00 - 20:30 WIB',
                'pickup_window' => '17:00 - 20:15 WIB',
                'store_bio' => 'Penyedia prasmanan dan nasi kotak khas Sunda dan Nusantara.',
                'is_open_today' => true,
                'rating' => 4.82,
                'total_rescued_count' => 96,
            ]
        );

        $checklist = [
            'isFitForConsumption' => true,
            'isProperlyStored' => true,
            'isCleanPackaging' => true,
            'isNoAbnormalOdor' => true,
            'isAccurateInformation' => true,
        ];

        $product1 = Product::updateOrCreate(
            ['code' => 'PRD-001'],
            [
                'merchant_id' => $merchantKala->id,
                'name' => 'Artisan Butter Croissant & Pain au Chocolat (Paket 3 Pcs)',
                'category' => 'Bakery & Roti',
                'image' => '/assets/images/sisapiring_bakery_1794322284427.jpg',
                'description' => 'Tiga pastry butter premium Prancis yang dipanggang pagi hari.',
                'original_price' => 65000,
                'discount_percentage' => 50,
                'discounted_price' => 32500,
                'stock' => 5,
                'locked_stock' => 0,
                'weight_grams' => 350,
                'production_time' => 'Hari ini, 07:00 WIB',
                'safe_consumption_deadline' => 'Hari ini, 23:00 WIB',
                'safe_deadline_at' => Carbon::now()->addHours(6),
                'pickup_schedule_start' => '17:30 WIB',
                'pickup_schedule_end' => '21:00 WIB',
                'storage_instruction' => 'Suhu Ruang (Kering & Sejuk)',
                'food_safety_checklist' => $checklist,
                'is_active' => true,
                'moderation_status' => ModerationStatus::Active,
                'portions_rescued_count' => 42,
            ]
        );

        $product2 = Product::updateOrCreate(
            ['code' => 'PRD-002'],
            [
                'merchant_id' => $merchantKala->id,
                'name' => 'Rustic Sourdough Loaf Gandum Utuh (Batch Pagi)',
                'category' => 'Bakery & Roti',
                'image' => '/assets/images/sisapiring_bakery_1794322284427.jpg',
                'description' => 'Roti sourdough fermentasi alami 24 jam dengan tepung gandum utuh.',
                'original_price' => 70000,
                'discount_percentage' => 70,
                'discounted_price' => 21000,
                'stock' => 3,
                'locked_stock' => 0,
                'weight_grams' => 500,
                'production_time' => 'Hari ini, 06:30 WIB',
                'safe_consumption_deadline' => 'Besok, 12:00 WIB',
                'safe_deadline_at' => Carbon::now()->addHours(18),
                'pickup_schedule_start' => '17:00 WIB',
                'pickup_schedule_end' => '21:30 WIB',
                'storage_instruction' => 'Suhu Ruang (Kering & Sejuk)',
                'food_safety_checklist' => $checklist,
                'is_active' => true,
                'moderation_status' => ModerationStatus::Active,
                'portions_rescued_count' => 28,
            ]
        );

        $product3 = Product::updateOrCreate(
            ['code' => 'PRD-003'],
            [
                'merchant_id' => $merchantKala->id,
                'name' => 'Strawberry Cheesecake Slice & Chocolate Eclair Box',
                'category' => 'Kue & Pastry',
                'image' => '/assets/images/sisapiring_pastry_cake_1794322285409.jpg',
                'description' => 'Cheesecake lembut dengan selai stroberi Ciwidey segar dan eclair cokelat Belgia.',
                'original_price' => 85000,
                'discount_percentage' => 70,
                'discounted_price' => 25500,
                'stock' => 2,
                'locked_stock' => 0,
                'weight_grams' => 300,
                'production_time' => 'Hari ini, 09:00 WIB',
                'safe_consumption_deadline' => 'Hari ini, 22:00 WIB',
                'safe_deadline_at' => Carbon::now()->addHours(4),
                'pickup_schedule_start' => '18:00 WIB',
                'pickup_schedule_end' => '21:00 WIB',
                'storage_instruction' => 'Lemari Pendingin (Chiller 2-6°C)',
                'food_safety_checklist' => $checklist,
                'is_active' => true,
                'moderation_status' => ModerationStatus::Active,
                'portions_rescued_count' => 35,
            ]
        );

        $product4 = Product::updateOrCreate(
            ['code' => 'PRD-004'],
            [
                'merchant_id' => $merchantSiti->id,
                'name' => 'Nasi Kuning Parahyangan & Ayam Bakar Madu',
                'category' => 'Katering & Nasi Kotak',
                'image' => '/assets/images/sisapiring_nasi_kotak_1794322285485.jpg',
                'description' => 'Nasi kotak prasmanan tertutup rapat dari sesi siang, lengkap dengan sambal dan lalap.',
                'original_price' => 45000,
                'discount_percentage' => 70,
                'discounted_price' => 13500,
                'stock' => 6,
                'locked_stock' => 0,
                'weight_grams' => 420,
                'production_time' => 'Hari ini, 12:00 WIB',
                'safe_consumption_deadline' => 'Hari ini, 20:30 WIB',
                'safe_deadline_at' => Carbon::now()->addHours(3),
                'pickup_schedule_start' => '17:00 WIB',
                'pickup_schedule_end' => '20:15 WIB',
                'storage_instruction' => 'Penghangat Makanan (Food Warmer)',
                'food_safety_checklist' => $checklist,
                'is_active' => true,
                'moderation_status' => ModerationStatus::Active,
                'portions_rescued_count' => 89,
            ]
        );

        $product5 = Product::updateOrCreate(
            ['code' => 'PRD-005'],
            [
                'merchant_id' => $merchantKala->id,
                'name' => 'Paket Donasi Bebas Bayar: Roti Gandum & Baguette',
                'category' => 'Bakery & Roti',
                'image' => '/assets/images/sisapiring_bakery_1794322284427.jpg',
                'description' => 'Inisiatif sedekah pangan dari Kala Bakehouse untuk warga yang membutuhkan.',
                'original_price' => 35000,
                'discount_percentage' => 100,
                'discounted_price' => 0,
                'stock' => 4,
                'locked_stock' => 0,
                'weight_grams' => 400,
                'production_time' => 'Hari ini, 06:00 WIB',
                'safe_consumption_deadline' => 'Hari ini, 21:00 WIB',
                'safe_deadline_at' => Carbon::now()->addHours(5),
                'pickup_schedule_start' => '18:00 WIB',
                'pickup_schedule_end' => '21:00 WIB',
                'storage_instruction' => 'Suhu Ruang (Kering & Sejuk)',
                'food_safety_checklist' => $checklist,
                'is_active' => true,
                'moderation_status' => ModerationStatus::Active,
                'portions_rescued_count' => 112,
            ]
        );

        $completedGroup = OrderGroup::updateOrCreate(
            ['group_code' => 'SPG-DEMO-001'],
            [
                'user_id' => $buyer->id,
                'status' => OrderStatus::Completed,
                'payment_status' => PaymentStatus::Paid,
                'subtotal' => 32500,
                'platform_fee' => 1000,
                'discount_total' => 32500,
                'grand_total' => 33500,
                'expires_at' => now()->subDays(2),
                'paid_at' => now()->subDays(2),
            ]
        );

        $orderCompleted = Order::updateOrCreate(
            ['order_code' => 'SP-BDG-2026-081'],
            [
                'order_group_id' => $completedGroup->id,
                'pickup_code' => 'SP-7842',
                'user_id' => $buyer->id,
                'merchant_id' => $merchantKala->id,
                'customer_name' => $buyer->name,
                'customer_phone' => $buyer->phone,
                'total_original_price' => 65000,
                'total_payment' => 32500,
                'total_discount' => 32500,
                'status' => OrderStatus::Completed,
                'payment_status' => PaymentStatus::Paid,
                'pickup_deadline' => 'Hari ini, 21:00 WIB',
                'pickup_deadline_at' => now()->subDay(),
                'paid_at' => now()->subDays(2),
                'completed_at' => now()->subDays(2)->addHours(3),
                'qr_code_token' => 'QR-SP-BDG-2026-081-SECURE',
                'is_verified_by_qr' => true,
                'verified_at' => now()->subDays(2)->addHours(3),
                'verified_by_user_id' => $sellerKala->id,
                'status_history' => [
                    ['status' => 'pending_payment', 'timestamp' => now()->subDays(2)->subHours(1)->toIso8601String(), 'note' => 'Pesanan dibuat'],
                    ['status' => 'waiting_confirmation', 'timestamp' => now()->subDays(2)->toIso8601String(), 'note' => 'Pembayaran berhasil'],
                    ['status' => 'confirmed', 'timestamp' => now()->subDays(2)->addHour()->toIso8601String(), 'note' => 'Dikonfirmasi UMKM'],
                    ['status' => 'completed', 'timestamp' => now()->subDays(2)->addHours(3)->toIso8601String(), 'note' => 'Pengambilan diverifikasi'],
                ],
            ]
        );

        $completedItem = OrderItem::updateOrCreate(
            ['order_id' => $orderCompleted->id, 'product_id' => $product1->id],
            [
                'product_name' => $product1->name,
                'category' => $product1->category,
                'image' => $product1->image,
                'original_price' => $product1->original_price,
                'price_per_item' => $product1->discounted_price,
                'quantity' => 1,
                'subtotal' => $product1->discounted_price,
                'weight_grams_total' => 350,
            ]
        );

        $readyGroup = OrderGroup::updateOrCreate(
            ['group_code' => 'SPG-DEMO-002'],
            [
                'user_id' => $buyer->id,
                'status' => OrderStatus::ReadyForPickup,
                'payment_status' => PaymentStatus::Paid,
                'subtotal' => 25500,
                'platform_fee' => 1000,
                'discount_total' => 59500,
                'grand_total' => 26500,
                'expires_at' => now()->addHours(3),
                'paid_at' => now()->subMinutes(40),
            ]
        );

        $orderReady = Order::updateOrCreate(
            ['order_code' => 'SP-BDG-2026-088'],
            [
                'order_group_id' => $readyGroup->id,
                'pickup_code' => 'SP-9124',
                'user_id' => $buyer->id,
                'merchant_id' => $merchantKala->id,
                'customer_name' => $buyer->name,
                'customer_phone' => $buyer->phone,
                'total_original_price' => 85000,
                'total_payment' => 25500,
                'total_discount' => 59500,
                'status' => OrderStatus::ReadyForPickup,
                'payment_status' => PaymentStatus::Paid,
                'pickup_deadline' => 'Hari ini, 21:00 WIB',
                'pickup_deadline_at' => now()->addHours(3),
                'paid_at' => now()->subMinutes(40),
                'qr_code_token' => 'QR-SP-BDG-2026-088-DEMO',
                'status_history' => [
                    ['status' => 'pending_payment', 'timestamp' => now()->subMinutes(45)->toIso8601String(), 'note' => 'Pesanan dibuat'],
                    ['status' => 'waiting_confirmation', 'timestamp' => now()->subMinutes(40)->toIso8601String(), 'note' => 'Pembayaran berhasil'],
                    ['status' => 'confirmed', 'timestamp' => now()->subMinutes(30)->toIso8601String(), 'note' => 'Dikonfirmasi Kala Bakehouse'],
                    ['status' => 'ready_for_pickup', 'timestamp' => now()->subMinutes(15)->toIso8601String(), 'note' => 'Siap diambil'],
                ],
            ]
        );

        $readyItem = OrderItem::updateOrCreate(
            ['order_id' => $orderReady->id, 'product_id' => $product3->id],
            [
                'product_name' => $product3->name,
                'category' => $product3->category,
                'image' => $product3->image,
                'original_price' => $product3->original_price,
                'price_per_item' => $product3->discounted_price,
                'quantity' => 1,
                'subtotal' => $product3->discounted_price,
                'weight_grams_total' => 300,
            ]
        );

        $waitingGroup = OrderGroup::updateOrCreate(
            ['group_code' => 'SPG-DEMO-003'],
            [
                'user_id' => $buyerBudi->id,
                'status' => OrderStatus::WaitingConfirmation,
                'payment_status' => PaymentStatus::Paid,
                'subtotal' => 27000,
                'platform_fee' => 1000,
                'discount_total' => 63000,
                'grand_total' => 28000,
                'expires_at' => now()->addHours(2),
                'paid_at' => now()->subMinutes(10),
            ]
        );

        $orderWaiting = Order::updateOrCreate(
            ['order_code' => 'SP-BDG-2026-092'],
            [
                'order_group_id' => $waitingGroup->id,
                'pickup_code' => 'SP-4301',
                'user_id' => $buyerBudi->id,
                'merchant_id' => $merchantSiti->id,
                'customer_name' => $buyerBudi->name,
                'customer_phone' => $buyerBudi->phone,
                'total_original_price' => 90000,
                'total_payment' => 27000,
                'total_discount' => 63000,
                'status' => OrderStatus::WaitingConfirmation,
                'payment_status' => PaymentStatus::Paid,
                'pickup_deadline' => 'Hari ini, 20:15 WIB',
                'pickup_deadline_at' => now()->addHours(2),
                'paid_at' => now()->subMinutes(10),
                'qr_code_token' => 'QR-SP-BDG-2026-092-TOKEN',
                'status_history' => [
                    ['status' => 'pending_payment', 'timestamp' => now()->subMinutes(12)->toIso8601String(), 'note' => 'Pesanan dibuat'],
                    ['status' => 'waiting_confirmation', 'timestamp' => now()->subMinutes(10)->toIso8601String(), 'note' => 'Pembayaran berhasil, menunggu konfirmasi dapur'],
                ],
            ]
        );

        $waitingItem = OrderItem::updateOrCreate(
            ['order_id' => $orderWaiting->id, 'product_id' => $product4->id],
            [
                'product_name' => $product4->name,
                'category' => $product4->category,
                'image' => $product4->image,
                'original_price' => $product4->original_price,
                'price_per_item' => $product4->discounted_price,
                'quantity' => 2,
                'subtotal' => $product4->discounted_price * 2,
                'weight_grams_total' => 840,
            ]
        );

        $pendingGroup = OrderGroup::updateOrCreate(
            ['group_code' => 'SPG-DEMO-004'],
            [
                'user_id' => $buyerBudi->id,
                'status' => OrderStatus::PendingPayment,
                'payment_status' => PaymentStatus::Pending,
                'subtotal' => 21000,
                'platform_fee' => 1000,
                'discount_total' => 49000,
                'grand_total' => 22000,
                'expires_at' => now()->addMinutes(10),
            ]
        );

        $orderPending = Order::updateOrCreate(
            ['order_code' => 'SP-BDG-2026-099'],
            [
                'order_group_id' => $pendingGroup->id,
                'pickup_code' => 'SP-1188',
                'user_id' => $buyerBudi->id,
                'merchant_id' => $merchantKala->id,
                'customer_name' => $buyerBudi->name,
                'customer_phone' => $buyerBudi->phone,
                'total_original_price' => 70000,
                'total_payment' => 21000,
                'total_discount' => 49000,
                'status' => OrderStatus::PendingPayment,
                'payment_status' => PaymentStatus::Pending,
                'pickup_deadline' => 'Hari ini, 21:30 WIB',
                'pickup_deadline_at' => now()->addHours(5),
                'qr_code_token' => 'QR-SP-BDG-2026-099-TOKEN',
                'status_history' => [
                    ['status' => 'pending_payment', 'timestamp' => now()->toIso8601String(), 'note' => 'Menunggu pembayaran'],
                ],
            ]
        );

        OrderItem::updateOrCreate(
            ['order_id' => $orderPending->id, 'product_id' => $product2->id],
            [
                'product_name' => $product2->name,
                'category' => $product2->category,
                'image' => $product2->image,
                'original_price' => $product2->original_price,
                'price_per_item' => $product2->discounted_price,
                'quantity' => 1,
                'subtotal' => $product2->discounted_price,
                'weight_grams_total' => 500,
            ]
        );

        foreach ([$completedGroup, $readyGroup, $waitingGroup] as $group) {
            Payment::updateOrCreate(
                ['order_group_id' => $group->id],
                [
                    'user_id' => $group->user_id,
                    'provider' => 'xendit',
                    'method' => PaymentMethod::Qris,
                    'status' => PaymentStatus::Paid,
                    'amount' => $group->grand_total,
                    'currency' => 'IDR',
                    'external_id' => 'SP-'.$group->group_code.'-DEMO',
                    'xendit_invoice_id' => 'inv_demo_'.$group->id,
                    'xendit_payment_id' => 'pay_demo_'.$group->id,
                    'paid_at' => $group->paid_at,
                ]
            );
        }

        Payment::updateOrCreate(
            ['order_group_id' => $pendingGroup->id],
            [
                'user_id' => $pendingGroup->user_id,
                'provider' => 'xendit',
                'method' => PaymentMethod::Qris,
                'status' => PaymentStatus::Pending,
                'amount' => $pendingGroup->grand_total,
                'currency' => 'IDR',
                'external_id' => 'SP-'.$pendingGroup->group_code.'-DEMO',
                'expires_at' => $pendingGroup->expires_at,
            ]
        );

        foreach ([$orderCompleted, $orderReady] as $order) {
            EscrowLedger::updateOrCreate(
                ['order_id' => $order->id, 'entry_type' => EscrowType::Hold],
                [
                    'merchant_id' => $order->merchant_id,
                    'status' => $order->status === OrderStatus::Completed ? EscrowStatus::Released : EscrowStatus::Held,
                    'amount' => $order->total_payment,
                    'currency' => 'IDR',
                    'available_at' => now()->addHours(24),
                    'released_at' => $order->status === OrderStatus::Completed ? now()->subDay() : null,
                ]
            );
        }

        StockLock::updateOrCreate(
            ['product_id' => $product2->id, 'order_group_id' => $pendingGroup->id],
            [
                'order_id' => $orderPending->id,
                'user_id' => $buyerBudi->id,
                'session_token' => Str::random(32),
                'quantity' => 1,
                'status' => 'active',
                'expires_at' => now()->addMinutes(10),
            ]
        );
        $product2->update(['locked_stock' => 1]);

        Review::updateOrCreate(
            ['order_item_id' => $completedItem->id],
            [
                'order_id' => $orderCompleted->id,
                'merchant_id' => $merchantKala->id,
                'product_id' => $product1->id,
                'reviewer_user_id' => $buyer->id,
                'rating' => 5,
                'comment' => 'Croissantnya masih sangat renyah dan manisnya pas. Pengambilan cepat, staf ramah!',
                'tags' => ['Renyah', 'Ramah', 'Sesuai Deskripsi'],
                'moderation_status' => ReviewStatus::Published,
            ]
        );

        Review::updateOrCreate(
            ['order_item_id' => $readyItem->id],
            [
                'order_id' => $orderReady->id,
                'merchant_id' => $merchantKala->id,
                'product_id' => $product3->id,
                'reviewer_user_id' => $buyer->id,
                'rating' => 4,
                'comment' => 'Cheesecakenya lembut, eclair sedikit melempem karena perjalanan.',
                'tags' => ['Lembut'],
                'moderation_status' => ReviewStatus::Published,
            ]
        );

        $dispute = Dispute::updateOrCreate(
            ['ticket_code' => 'TKT-DEMO-001'],
            [
                'order_id' => $orderWaiting->id,
                'order_item_id' => $waitingItem->id,
                'reporter_user_id' => $buyerBudi->id,
                'merchant_id' => $merchantSiti->id,
                'product_id' => $product4->id,
                'category' => 'Kualitas Makanan',
                'description' => 'Nasi kotak diterima dalam kondisi kurang hangat. Mohon penjelasan mitra.',
                'severity' => 'medium',
                'status' => DisputeStatus::Investigating,
            ]
        );

        DisputeMessage::updateOrCreate(
            ['dispute_id' => $dispute->id, 'sender_user_id' => $buyerBudi->id],
            ['body' => 'Nasi kotak diterima dalam kondisi kurang hangat. Mohon penjelasan mitra.']
        );

        $conversation = Conversation::updateOrCreate(
            ['buyer_id' => $buyer->id, 'merchant_id' => $merchantKala->id],
            ['order_id' => $orderReady->id, 'last_message_at' => now()->subMinutes(20)]
        );

        Message::updateOrCreate(
            ['conversation_id' => $conversation->id, 'body' => 'Halo kak, apakah pesanan saya bisa diambil jam 19:30?'],
            ['sender_user_id' => $buyer->id, 'type' => 'text', 'created_at' => now()->subMinutes(25)]
        );

        Message::updateOrCreate(
            ['conversation_id' => $conversation->id, 'body' => 'Bisa kak, kami buka sampai 21:00. Ditunggu!'],
            ['sender_user_id' => $sellerKala->id, 'type' => 'text', 'created_at' => now()->subMinutes(20)]
        );

        ImpactLog::updateOrCreate(
            ['order_id' => $orderCompleted->id],
            [
                'merchant_id' => $merchantKala->id,
                'user_id' => $buyer->id,
                ...ImpactLog::calculateMetrics(1, 0.35, 32500),
            ]
        );

        for ($i = 1; $i <= 14; $i++) {
            $portions = rand(1, 3);
            $weight = round($portions * rand(300, 450) / 1000, 3);
            $moneySaved = $portions * rand(18000, 35000);

            ImpactLog::query()->create([
                'order_id' => null,
                'merchant_id' => rand(0, 1) ? $merchantKala->id : $merchantSiti->id,
                'user_id' => rand(0, 1) ? $buyer->id : $buyerBudi->id,
                ...ImpactLog::calculateMetrics($portions, $weight, $moneySaved),
                'created_at' => now()->subDays(rand(1, 14))->subHours(rand(1, 8)),
                'updated_at' => now()->subDays(rand(1, 14))->subHours(rand(1, 8)),
            ]);
        }

        $buyer->notify(new SystemNotification('Selamat datang di SisaPiring', 'Akun demo pembeli siap digunakan.', [
            'demo' => true,
        ]));

        $sellerKala->notify(new SystemNotification('Pesanan baru menunggu konfirmasi', 'Ada pesanan yang perlu dikonfirmasi hari ini.', [
            'demo' => true,
        ]));
    }
}
