<?php

namespace Database\Seeders;

use App\Models\ImpactLog;
use App\Models\Merchant;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\StockLock;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // 1. USERS
        // Akun UMKM (Seller)
        $sellerUser = User::firstOrCreate(
            ['email' => 'seller@sisapiring.com'],
            [
                'name' => 'Kang Ridwan Sasmita',
                'phone' => '+62 812-2345-6789',
                'role' => 'seller',
                'avatar' => '/assets/images/umkm_partner_portrait_1794295655906.jpg',
                'password' => Hash::make('SisaPiring123'),
                'email_verified_at' => now(),
            ]
        );

        // Akun Pembeli (Buyer)
        $buyerUser = User::firstOrCreate(
            ['email' => 'buyer@sisapiring.com'],
            [
                'name' => 'Siti Rahmawati',
                'phone' => '+62 857-1122-3344',
                'role' => 'buyer',
                'avatar' => null,
                'password' => Hash::make('SisaPiring123'),
                'email_verified_at' => now(),
            ]
        );

        // Akun Admin
        $adminUser = User::firstOrCreate(
            ['email' => 'admin@sisapiring.com'],
            [
                'name' => 'Admin SisaPiring Bandung',
                'phone' => '+62 811-0000-9999',
                'role' => 'admin',
                'avatar' => null,
                'password' => Hash::make('SisaPiring123'),
                'email_verified_at' => now(),
            ]
        );

        // Extra Buyer for community demonstration
        $buyerBudi = User::firstOrCreate(
            ['email' => 'budi.santoso@gmail.com'],
            [
                'name' => 'Budi Santoso',
                'phone' => '+62 813-9876-5432',
                'role' => 'buyer',
                'avatar' => null,
                'password' => Hash::make('SisaPiring123'),
                'email_verified_at' => now(),
            ]
        );

        // 2. MERCHANTS (UMKM Bandung)
        $merchantKala = Merchant::firstOrCreate(
            ['code' => 'UMKM-BDG-042'],
            [
                'user_id' => $sellerUser->id,
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
                'verification_status' => 'verified',
                'verification_notes' => 'Terverifikasi resmi oleh Kurator SisaPiring Bandung (Standar Higienitas & Izin Usaha Terpenuhi)',
                'operating_hours' => '08:00 - 21:00 WIB',
                'pickup_window' => '17:30 - 21:00 WIB',
                'store_bio' => 'Bakehouse artisan spesialis sourdough, viennoiserie, dan pastry hangat di kawasan Progo Bandung. Setiap hari kami memanggang batch segar dan berkomitmen zero food waste bersama SisaPiring.',
                'is_open_today' => true,
                'rating' => 4.90,
                'total_rescued_count' => 184,
            ]
        );

        $merchantSiti = Merchant::firstOrCreate(
            ['code' => 'UMKM-BDG-015'],
            [
                'user_id' => null,
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
                'verification_status' => 'verified',
                'verification_notes' => 'Dapur katering higienis tersertifikasi Halal & Dinkes',
                'operating_hours' => '09:00 - 20:30 WIB',
                'pickup_window' => '17:00 - 20:15 WIB',
                'store_bio' => 'Penyedia prasmanan dan nasi kotak khas Sunda dan Nusantara. Sisa porsi event harian kami selamatkan dengan kemasan tertutup rapat higienis.',
                'is_open_today' => true,
                'rating' => 4.82,
                'total_rescued_count' => 96,
            ]
        );

        // 3. PRODUCTS
        $foodSafetyChecklistDefault = [
            'isFitForConsumption' => true,
            'isProperlyStored' => true,
            'isCleanPackaging' => true,
            'isNoAbnormalOdor' => true,
            'isAccurateInformation' => true,
        ];

        $product1 = Product::firstOrCreate(
            ['code' => 'PRD-001'],
            [
                'merchant_id' => $merchantKala->id,
                'name' => 'Artisan Butter Croissant & Pain au Chocolat (Paket 3 Pcs)',
                'category' => 'Bakery & Roti',
                'image' => '/assets/images/sisapiring_bakery_1794322284427.jpg',
                'description' => 'Tiga pastry butter premium Prancis yang dipanggang pagi hari. Renyah di luar, lembut berlapis di dalam. Sangat nikmat dihangatkan 3 menit di oven/airfryer.',
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
                'food_safety_checklist' => $foodSafetyChecklistDefault,
                'is_active' => true,
                'portions_rescued_count' => 42,
            ]
        );

        $product2 = Product::firstOrCreate(
            ['code' => 'PRD-002'],
            [
                'merchant_id' => $merchantKala->id,
                'name' => 'Rustic Sourdough Loaf Gandum Utuh (Batch Pagi)',
                'category' => 'Bakery & Roti',
                'image' => '/assets/images/sisapiring_bakery_1794322284427.jpg',
                'description' => 'Roti sourdough fermentasi alami 24 jam dengan tepung gandum utuh. Tanpa pengawet dan perasa buatan. Cocok untuk sarapan avocado toast atau sandwich.',
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
                'food_safety_checklist' => $foodSafetyChecklistDefault,
                'is_active' => true,
                'portions_rescued_count' => 28,
            ]
        );

        $product3 = Product::firstOrCreate(
            ['code' => 'PRD-003'],
            [
                'merchant_id' => $merchantKala->id,
                'name' => 'Strawberry Cheesecake Slice & Chocolate Eclair Box',
                'category' => 'Kue & Pastry',
                'image' => '/assets/images/sisapiring_pastry_cake_1794322285409.jpg',
                'description' => 'Cheesecake lembut dengan selai stroberi Ciwidey segar dan eclair cokelat Belgia. Disimpan konsisten di chiller display pastry.',
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
                'food_safety_checklist' => $foodSafetyChecklistDefault,
                'is_active' => true,
                'portions_rescued_count' => 35,
            ]
        );

        $product4 = Product::firstOrCreate(
            ['code' => 'PRD-004'],
            [
                'merchant_id' => $merchantSiti->id,
                'name' => 'Nasi Kuning Parahyangan & Ayam Bakar Madu (Sisa Piring Event)',
                'category' => 'Katering & Nasi Kotak',
                'image' => '/assets/images/sisapiring_nasi_kotak_1794322285485.jpg',
                'description' => 'Sisa piring nasi kotak prasmanan tertutup rapat dari sesi siang. Masih hangat dalam thermal warmer box, lengkap dengan sambal dan lalap segar.',
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
                'food_safety_checklist' => $foodSafetyChecklistDefault,
                'is_active' => true,
                'portions_rescued_count' => 89,
            ]
        );

        $product5 = Product::firstOrCreate(
            ['code' => 'PRD-005'],
            [
                'merchant_id' => $merchantKala->id,
                'name' => 'Paket Donasi Bebas Bayar: Roti Gandum & Baguette',
                'category' => 'Bakery & Roti',
                'image' => '/assets/images/sisapiring_bakery_1794322284427.jpg',
                'description' => 'Inisiatif sedekah pangan dari Kala Bakehouse untuk warga yang membutuhkan. Sepenuhnya gratis (diskon 100%), hanya perlu konfirmasi pengambilan tepat waktu.',
                'original_price' => 35000,
                'discount_percentage' => 100, // 100% OFF = Bebas Bayar / Donasi
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
                'food_safety_checklist' => $foodSafetyChecklistDefault,
                'is_active' => true,
                'portions_rescued_count' => 112,
            ]
        );

        // 4. ORDERS & ORDER ITEMS
        // Order 1: Completed order (verified by QR)
        $orderCompleted = Order::firstOrCreate(
            ['order_code' => 'SP-BDG-2026-081'],
            [
                'pickup_code' => 'SP-7842',
                'user_id' => $buyerUser->id,
                'merchant_id' => $merchantKala->id,
                'customer_name' => 'Siti Rahmawati',
                'customer_phone' => '+62 857-1122-3344',
                'total_original_price' => 65000,
                'total_payment' => 32500,
                'total_discount' => 32500,
                'status' => 'completed',
                'pickup_deadline' => 'Hari ini, 21:00 WIB',
                'pickup_deadline_at' => Carbon::now()->subHours(1),
                'qr_code_token' => 'QR-SP-BDG-2026-081-SECURE',
                'is_verified_by_qr' => true,
                'verified_at' => Carbon::now()->subMinutes(45),
                'verified_by_user_id' => $sellerUser->id,
                'status_history' => [
                    ['status' => 'waiting_confirmation', 'timestamp' => Carbon::now()->subHours(3)->toIso8601String(), 'note' => 'Pesanan dibuat oleh pembeli'],
                    ['status' => 'confirmed', 'timestamp' => Carbon::now()->subHours(2)->toIso8601String(), 'note' => 'Pesanan dikonfirmasi oleh UMKM'],
                    ['status' => 'ready_for_pickup', 'timestamp' => Carbon::now()->subHours(1)->toIso8601String(), 'note' => 'Paket siap diambil di toko'],
                    ['status' => 'completed', 'timestamp' => Carbon::now()->subMinutes(45)->toIso8601String(), 'note' => 'Pengambilan diverifikasi via scan QR'],
                ],
            ]
        );

        OrderItem::firstOrCreate(
            [
                'order_id' => $orderCompleted->id,
                'product_id' => $product1->id,
            ],
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

        // Order 2: Ready for Pickup (active demonstration QR code!)
        $orderReady = Order::firstOrCreate(
            ['order_code' => 'SP-BDG-2026-088'],
            [
                'pickup_code' => 'SP-9124',
                'user_id' => $buyerUser->id,
                'merchant_id' => $merchantKala->id,
                'customer_name' => 'Siti Rahmawati',
                'customer_phone' => '+62 857-1122-3344',
                'total_original_price' => 85000,
                'total_payment' => 25500,
                'total_discount' => 59500,
                'status' => 'ready_for_pickup',
                'pickup_deadline' => 'Hari ini, 21:00 WIB',
                'pickup_deadline_at' => Carbon::now()->addHours(3),
                'qr_code_token' => 'QR-SP-BDG-2026-088-DEMO',
                'is_verified_by_qr' => false,
                'status_history' => [
                    ['status' => 'waiting_confirmation', 'timestamp' => Carbon::now()->subMinutes(40)->toIso8601String(), 'note' => 'Pesanan diterima'],
                    ['status' => 'confirmed', 'timestamp' => Carbon::now()->subMinutes(30)->toIso8601String(), 'note' => 'Dikonfirmasi Kala Bakehouse'],
                    ['status' => 'ready_for_pickup', 'timestamp' => Carbon::now()->subMinutes(15)->toIso8601String(), 'note' => 'Siap diambil. Tunjukkan QR Code pada kasir!'],
                ],
            ]
        );

        OrderItem::firstOrCreate(
            [
                'order_id' => $orderReady->id,
                'product_id' => $product3->id,
            ],
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

        // Order 3: Waiting confirmation
        $orderWaiting = Order::firstOrCreate(
            ['order_code' => 'SP-BDG-2026-092'],
            [
                'pickup_code' => 'SP-4301',
                'user_id' => $buyerBudi->id,
                'merchant_id' => $merchantSiti->id,
                'customer_name' => 'Budi Santoso',
                'customer_phone' => '+62 813-9876-5432',
                'total_original_price' => 90000,
                'total_payment' => 27000,
                'total_discount' => 63000,
                'status' => 'waiting_confirmation',
                'pickup_deadline' => 'Hari ini, 20:15 WIB',
                'pickup_deadline_at' => Carbon::now()->addHours(2),
                'qr_code_token' => 'QR-SP-BDG-2026-092-TOKEN',
                'is_verified_by_qr' => false,
                'status_history' => [
                    ['status' => 'waiting_confirmation', 'timestamp' => Carbon::now()->subMinutes(5)->toIso8601String(), 'note' => 'Menunggu konfirmasi dapur'],
                ],
            ]
        );

        OrderItem::firstOrCreate(
            [
                'order_id' => $orderWaiting->id,
                'product_id' => $product4->id,
            ],
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

        // 5. STOCK LOCK SAMPLE (Flash Sale Stock Locking with 10-minute timer)
        StockLock::firstOrCreate(
            [
                'product_id' => $product1->id,
                'user_id' => $buyerBudi->id,
            ],
            [
                'session_token' => Str::random(32),
                'quantity' => 1,
                'status' => 'active',
                'expires_at' => Carbon::now()->addMinutes(10),
            ]
        );

        // 6. IMPACT LOGS (Environmental conversion: Food Waste, CO2e, and Methane CH4)
        // Link completed order to ImpactLog
        ImpactLog::firstOrCreate(
            ['order_id' => $orderCompleted->id],
            [
                'merchant_id' => $merchantKala->id,
                'user_id' => $buyerUser->id,
                'portions_rescued' => 1,
                'weight_rescued_kg' => 0.350,
                'co2_prevented_kg' => 0.875, // 0.350 * 2.5
                'methane_prevented_kg' => 0.029, // 0.350 * 0.082
                'money_saved_idr' => 32500,
            ]
        );

        // Seed 15 cumulative historical impact logs for realistic Impact Dashboard charts
        $sampleMerchants = [$merchantKala->id, $merchantSiti->id];
        $sampleBuyers = [$buyerUser->id, $buyerBudi->id];

        for ($i = 1; $i <= 14; $i++) {
            $portions = rand(1, 3);
            $weight = round($portions * rand(300, 450) / 1000, 3);
            $moneySaved = $portions * rand(18000, 35000);
            $daysAgo = rand(1, 14);

            ImpactLog::create([
                'order_id' => null,
                'merchant_id' => $sampleMerchants[array_rand($sampleMerchants)],
                'user_id' => $sampleBuyers[array_rand($sampleBuyers)],
                'portions_rescued' => $portions,
                'weight_rescued_kg' => $weight,
                'co2_prevented_kg' => round($weight * 2.5, 3),
                'methane_prevented_kg' => round($weight * 0.082, 3),
                'money_saved_idr' => $moneySaved,
                'created_at' => Carbon::now()->subDays($daysAgo)->subHours(rand(1, 8)),
                'updated_at' => Carbon::now()->subDays($daysAgo)->subHours(rand(1, 8)),
            ]);
        }
    }
}
