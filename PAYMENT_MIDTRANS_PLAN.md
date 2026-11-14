# RENCANA IMPLEMENTASI SISTEM PEMBAYARAN MIDTRANS & DOMPET ESCROW MITRA
**Proyek:** SisaPiring Platform (Lomba Hackathon)  
**Dokumen ini ditujukan untuk:** Developer / AI Agent / Kolaborator Tim  
**Status:** Siap Dikerjakan (Ready for Execution)  
**Target Arsitektur:** Multi-Vendor Marketplace (Inbound Midtrans Snap + Escrow Platform + Dompet Penjual UMKM)

---

## 1. Ringkasan & Logika Bisnis (Executive Overview)

Pada platform marketplace multi-vendor seperti **SisaPiring**:
1. **Satu Invoice Multi-Merchant:** Pembeli dapat memesan makanan penyelamatan (*rescue food*) dari beberapa gerai UMKM sekaligus dalam satu keranjang belanja.
2. **Uang Masuk ke Escrow Platform:** Pembeli membayar tagihan gabungan (`OrderGroup`) melalui **Midtrans Snap** (QRIS, GoPay, ShopeePay, Virtual Account Bank). Uang pertama kali masuk ke rekening penampung platform.
3. **Pencegahan Makanan Terbuang (StockLock TTL):** Saat checkout, stok makanan dikunci sementara (`StockLock`). Jika pembayaran gagal atau kedaluwarsa (misal 15-30 menit), stok otomatis dilepas kembali ke etalase publik.
4. **Keamanan Dana Bersama (Escrow Holding):** Ketika Midtrans mengirim notifikasi `settlement`, status pesanan berubah menjadi `waiting_confirmation` dan dana dicatat ke `escrow_ledgers`. Dana TIDAK langsung dicairkan ke penjual untuk melindungi hak pembeli jika terjadi pembatalan/sengketa.
5. **Pencairan ke Dompet UMKM:** Setelah pembeli mengambil pesanan di gerai dan memindai QR code verifikasi (status order `completed`), dana escrow otomatis dirilis dan ditambahkan ke **Saldo Dompet Mitra UMKM** (`merchants.balance`).
6. **Penarikan Dana (Withdrawal):** Mitra UMKM dapat mengajukan penarikan dana ke rekening bank / e-wallet mereka melalui panel penjual (`/penjual`).

---

## 2. Kebutuhan Database & Perubahan Skema (Database Migrations)

### A. Tabel `payments` (Penyesuaian untuk Midtrans)
Tambahkan kolom untuk menyimpan token Snap dan ID transaksi Midtrans:
```php
Schema::table('payments', function (Blueprint $table) {
    $table->string('snap_token')->nullable()->after('payment_url');
    $table->string('midtrans_transaction_id')->nullable()->after('snap_token');
});
```

### B. Tabel `merchants` (Saldo Dompet UMKM)
Tambahkan kolom saldo dan rekening bank untuk pencairan:
```php
Schema::table('merchants', function (Blueprint $table) {
    $table->decimal('balance', 14, 2)->default(0)->after('rating');
    $table->string('bank_name')->nullable()->after('balance');
    $table->string('bank_account_number')->nullable()->after('bank_name');
    $table->string('bank_account_name')->nullable()->after('bank_account_number');
});
```

### C. Tabel `withdrawal_requests` (Pengajuan Penarikan Dana Mitra)
Buat tabel baru untuk mencatat riwayat penarikan dana oleh UMKM:
```php
Schema::create('withdrawal_requests', function (Blueprint $table) {
    $table->id();
    $table->foreignId('merchant_id')->constrained()->cascadeOnDelete();
    $table->decimal('amount', 12, 2);
    $table->string('bank_name');
    $table->string('bank_account_number');
    $table->string('bank_account_name');
    $table->enum('status', ['pending', 'approved', 'rejected'])->default('pending');
    $table->text('admin_note')->nullable();
    $table->timestamp('processed_at')->nullable();
    $table->timestamps();
});
```

---

## 3. Rincian Pengerjaan Backend (Laravel 11)

### Langkah 1: Konfigurasi `.env` & `config/services.php`
Tambahkan konfigurasi Midtrans di `config/services.php`:
```php
'midtrans' => [
    'server_key' => env('MIDTRANS_SERVER_KEY'),
    'client_key' => env('MIDTRANS_CLIENT_KEY'),
    'is_production' => (bool) env('MIDTRANS_IS_PRODUCTION', false),
    'is_sanitized' => (bool) env('MIDTRANS_IS_SANITIZED', true),
    'is_3ds' => (bool) env('MIDTRANS_IS_3DS', true),
],
```

Variabel di `.env`:
```env
MIDTRANS_SERVER_KEY=SB-Mid-server-xxxxxxxxxxxxxxxxx
MIDTRANS_CLIENT_KEY=SB-Mid-client-xxxxxxxxxxxxxxxxx
MIDTRANS_IS_PRODUCTION=false
MIDTRANS_IS_SANITIZED=true
MIDTRANS_IS_3DS=true
```

### Langkah 2: Buat `App\Services\MidtransService`
Service ringan berbasis Laravel `Http` client (tanpa dependensi bloatware eksternal):
- **Base URL:**
  - Sandbox: `https://app.sandbox.midtrans.com/snap/v1/transactions`
  - Production: `https://app.midtrans.com/snap/v1/transactions`
- **Method `createSnapToken(OrderGroup $group, Payment $payment): array`:**
  - Payload:
    - `transaction_details`: `order_id` (menggunakan `$payment->external_id`), `gross_amount` (integer grand_total).
    - `customer_details`: nama, email, nomor HP pembeli.
    - `item_details`: daftar item pesanan dari seluruh order dalam group + platform fee.
  - Headers: `Authorization: Basic base64(SERVER_KEY:)`, `Content-Type: application/json`.
  - Mengembalikan `token` dan `redirect_url`.
- **Method `verifySignature(array $payload): bool`:**
  - Rumus hash Midtrans: `sha512(order_id + status_code + gross_amount + ServerKey)`
  - Membandingkan hasil hash dengan `$payload['signature_key']`.

### Langkah 3: Integrasikan ke `PaymentService` & `OrderService`
- Saat inisiasi pembayaran (`PaymentService::initiate`), panggil `MidtransService::createSnapToken()` dan simpan hasilnya di kolom `snap_token` serta `payment_url`.
- Saat menerima webhook notifikasi pembayaran:
  - Validasi signature keamanan SHA512.
  - Periksa status Midtrans:
    - `settlement`, `capture` (fraud `accept`) ➔ panggil `markPaid()`.
    - `expire` ➔ panggil `markExpired()` (lepas kunci stok).
    - `deny`, `cancel` ➔ panggil `markFailed()`.

### Langkah 4: Alur Rilis Escrow ke Saldo UMKM saat Order Selesai
Pada `OrderService` atau `Seller\OrderController@verify` (saat pesanan diverifikasi via QR / selesai):
1. Ubah status order menjadi `completed`.
2. Hitung pendapatan bersih mitra (`total_payment - platform_fee`).
3. Rilis dana dari `EscrowLedger` (`status: settled`).
4. Tambahkan saldo ke akun merchant:
   ```php
   $merchant->increment('balance', $netEarning);
   ```

### Langkah 5: Endpoint Webhook Midtrans
Tambahkan rute di `routes/api.php` (tanpa middleware auth / CSRF):
```php
Route::post('/webhooks/midtrans', [WebhookController::class, 'midtrans']);
```

---

## 4. Rincian Pengerjaan Frontend (React + Vite + TypeScript)

### Langkah 1: Pasang SDK Midtrans Snap JS
Di file `index.html`:
```html
<script 
  type="text/javascript"
  src="https://app.sandbox.midtrans.com/snap/snap.js"
  data-client-key="%VITE_MIDTRANS_CLIENT_KEY%">
</script>
```

### Langkah 2: Alur Pembayaran di `/kantong/confirmation` (`RescueCartFlow.tsx`)
1. Ketika pembeli mengonfirmasi pesanan dan memilih pembayaran online (QRIS/Transfer):
2. Frontend memanggil API `POST /api/v1/buyer/order-groups` (buat pesanan & kunci stok).
3. Frontend memanggil API `POST /api/v1/buyer/order-groups/{group_code}/pay` untuk mendapatkan `snap_token`.
4. Buka Midtrans Snap Popup:
   ```ts
   window.snap.pay(snapToken, {
     onSuccess: function(result) {
       // Tampilkan animasi sukses dan redirect ke /pesanan
     },
     onPending: function(result) {
       // Arahkan ke step menunggu pembayaran
     },
     onError: function(result) {
       // Tampilkan notifikasi error
     },
     onClose: function() {
       // Konfirmasi pembatalan
     }
   });
   ```

### Langkah 3: Panel Penjual (`/penjual`) - Fitur Saldo & Penarikan
1. Di dashboard penjual, tambahkan komponen **Card Saldo Penghasilan Aktif**:
   - Menampilkan total saldo yang siap ditarik (`merchant.balance`).
   - Menampilkan saldo tertahan di escrow yang masih menunggu pesanan diambil.
2. Tambahkan modal **"Tarik Dana"**:
   - Input nominal penarikan, bank tujuan, nomor rekening, dan nama pemilik.
   - Mengirim request `POST /api/v1/seller/withdrawals`.
   - Mengurangi saldo yang dapat ditarik dan mencatat ke riwayat penarikan dana.

---

## 5. Petunjuk Pengujian (Testing & Verification Guide)

### A. Pengujian Pembayaran Sandbox
Midtrans menyediakan simulator resmi untuk menguji status pembayaran tanpa uang asli:
* **QRIS Simulator:** Unduh simulator QRIS Midtrans atau gunakan simulator di [Simulator Midtrans](https://simulator.sandbox.midtrans.com/).
* **Virtual Account:** Copy nomor VA yang dihasilkan, masukkan ke simulator BCA / Mandiri / BNI / BRI di portal simulator Midtrans.

### B. Pengujian Webhook Lokal
Untuk menerima webhook Midtrans di localhost saat pengujian:
1. Gunakan tunnel seperti `ngrok`:
   ```bash
   ngrok http 8000
   ```
2. Salin URL ngrok (misal `https://abc-123.ngrok-free.app/api/v1/webhooks/midtrans`).
3. Masukkan URL tersebut ke **Dashboard Midtrans Sandbox ➔ Settings ➔ Configuration ➔ Notification URL**.

---

## 6. Pembagian Tugas (Bila Dikerjakan Bersama / Dibagikan ke Agent Lain)

Jika tugas ini didelegasikan atau dikerjakan secara paralel:

* **Tugas 1 (Backend Core):**
  - Buat migration: `add_midtrans_fields_to_payments`, `add_balance_to_merchants`, `create_withdrawal_requests`.
  - Buat `App\Services\MidtransService` & konfigurasi `config/services.php`.
  - Buat endpoint `WebhookController@midtrans`.
* **Tugas 2 (Escrow & Seller Wallet):**
  - Update `OrderService` agar merilis saldo escrow ke `merchant.balance` saat order `completed`.
  - Buat API endpoint `POST /api/v1/seller/withdrawals` dan `GET /api/v1/seller/withdrawals`.
* **Tugas 3 (Frontend Checkout):**
  - Muat Snap JS di `index.html`.
  - Hubungkan trigger Snap modal di `RescueCartFlow.tsx`.
* **Tugas 4 (Frontend Seller Portal):**
  - Tambahkan tampilan Saldo Dompet UMKM dan formulir Tarik Dana di halaman `/penjual`.
