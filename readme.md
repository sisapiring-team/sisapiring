# SisaPiring (SisaRasa — Penyelamat Kuliner UMKM)

Platform pasar kuliner surplus terpadu yang menghubungkan masyarakat dengan hidangan segar berlebih dari UMKM lokal dengan potongan harga hingga 60%, dilengkapi dengan Portal Mitra UMKM Kota Bandung dan Pusat Tata Kelola Admin (Platform Governance & Control Console).

---

## 🌟 Ekosistem Platform Terpadu (Unified 3-in-1 Platform)

SisaPiring menyatukan tiga pilar utama dalam satu platform:
1. **Portal Konsumen (Customer Marketplace)**: Tempat warga menemukan, memesan, dan menyelamatkan hidangan berlebih dari UMKM lokal dengan potongan harga hingga 60%, kalkulator dampak lingkungan, dan pelacakan pesanan.
2. **Portal Mitra UMKM (Seller / Merchant Portal)**: Dashboard interaktif bagi pelaku usaha kuliner di Kota Bandung untuk mengelola stok surplus, rekomendasi diskon pintar otomatis (50%, 70%, 90%, 100% donasi), verifikasi pengambilan via QR Code, deklarasi keamanan pangan, analitik penjualan, dan registrasi KYB.
3. **Pusat Tata Kelola Admin (Platform Governance & Control Console)**: Pengawasan kepatuhan legalitas (NIB, KTP, Halal/PIRT), monitoring mutu produk & prep window, investigasi manipulasi diskon semu, resolusi komplain & refund escrow, serta analitik makro kota Bandung.

---

## 🚀 Fitur Lengkap Per Modul

### 👥 1. Modul Konsumen (User Marketplace)
- **Etalase Surplus Interaktif**: Filter kategori kuliner, filter radius wilayah, jam batas konsumsi aman (*prep window*).
- **Katalog Toko Mitra (Store Profile)**: Profil gerai, jam operasional, ulasan dan penilaian bintang.
- **Kantong Penyelamatan (Cart) & Checkout**: Pilihan pembayaran QRIS Terintegrasi, VA/E-Wallet, atau COD Kasir.
- **Pelacakan Pesanan Real-Time**: Status pesanan bertahap (Menunggu Konfirmasi -> Disiapkan Mitra -> Siap Ambil / Diantar -> Selesai).
- **Sistem Rating & Ulasan Transparan**: Ulasan produk dan bintang pasca-transaksi.
- **Pusat Komplain & Garansi Keamanan**: Form pelaporan makanan bermasalah dengan integrasi ke tim sengketa admin dan pengembalian dana escrow.
- **Impact Calculator**: Kalkulasi otomatis penghematan emisi CO2e, sampah pangan dicegah (kg), air bersih (L), dan nominal rupiah dihemat.

### 🏪 2. Modul Mitra UMKM (Seller Portal Bandung)
- **Seller Dashboard**: Ringkasan performa harian (porsi diselamatkan, pendapatan surplus, pesanan aktif, jam operasional toko).
- **Manajemen Produk Surplus**: Tambah hidangan surplus, pengaturan stok real-time, waktu batas aman konsumsi.
- **Discount Suggestion Engine**: Rekomendasi diskon otomatis bertahap (50%, 70%, 90%, 100% donasi) berbasis sisa jam konsumsi dan volume stok.
- **Verifikasi Pengambilan QR (QR Pickup Scanner)**: Validasi serah terima pesanan secara instan dengan verifikasi kode QR pesanan pembeli.
- **Deklarasi Standar Higienitas & Keamanan Pangan**: Pengecekan komitmen mutu sebelum merilis hidangan surplus ke etalase.
- **Analitik Penjualan & Dampak UMKM**: Visualisasi omzet surplus yang berhasil diselamatkan dan tren penyelamatan harian.
- **Profil Gerai & Pengaturan Toko**: Manajemen info toko, jadwal operasional, dan pengaturan notifikasi.
- **Registrasi Mitra Baru (KYB Onboarding)**: Formulir pengajuan izin usaha, NIB, sertifikasi halal/PIRT untuk ditinjau admin.

### 🛡️ 3. Modul Tata Kelola Admin (Admin Governance Console)
- **Macro Environmental & Economic Impact Dashboard**: Analitik makro metrik dampak lingkungan makro (porsi diselamatkan, sampah pangan terhindarkan, reduksi emisi CO2e, air bersih terselamatkan), pendapatan UMKM yang dipulihkan, partisipasi per kecamatan (Coblong, Lengkong, Sukasari, dll.), dan ekspor laporan ke CSV.
- **Verifikasi Legalitas & Higienitas UMKM (Seller Onboarding KYB)**: Validasi NIB, KTP pemilik usaha, nomor sertifikasi Halal / PIRT, foto dapur/gerai, serta penandatanganan komitmen higienitas pangan.
- **Monitoring Produk & Kontrol Keamanan Pangan**: Pemantauan kesegaran hidangan surplus, kontrol prep window, dan fitur penarikan/pembekuan (*Take Down*) atas produk yang tidak aman.
- **Investigasi Manipulasi Harga & Diskon Semu**: Sistem deteksi anomali untuk mencegah UMKM menaikkan harga normal secara fiktif sebelum menerapkan diskon penyelamatan.
- **Penyelesaian Sengketa Pelanggan (Dispute Resolution)**: Penanganan tiket laporan pembeli dengan investigasi cepat, fasilitas eksekusi *refund* otomatis ke pembeli dari dana *escrow*, serta penjatuhan sanksi peringatan/suspensi gerai.
- **Monitoring Transaksi & Pembayaran Escrow**: Pemantauan status gerbang pembayaran (*Escrow*, *Settled*, *Refunded*, *Dibatalkan*).
- **Manajemen Hak Akses Pengguna (RBAC)**: Pengelolaan akun pengguna lintas peran (*Buyer*, *UMKM Partner*, *Admin Platform*) serta pemberian sanksi akun (*Aktif*, *Peringatan*, *Suspended*).

---

## 🛠️ Tech Stack

- **Framework**: React 19 + TypeScript
- **Bundler**: Vite 8
- **Styling**: Tailwind CSS v4
- **Motion**: Motion (Framer Motion)
- **Icons**: Lucide React
- **AI Integration**: Google GenAI SDK (`@google/genai`)

---

## 💻 Menjalankan Secara Lokal

```bash
# 1. Install dependencies
npm install

# 2. Jalankan server development
npm run dev
```

Aplikasi dapat diakses di:
👉 `http://localhost:3000`

---

## 🔄 Navigasi Antar Peran (Portal Switcher)

Platform ini dilengkapi pengalih peran instan di bilah navigasi atas:
- **🛍️ Konsumen**: Akses etalase surplus, keranjang, pesanan, dan ulasan.
- **🏪 Mitra UMKM**: Akses dashboard penjual, kelola produk, diskon kilat, dan QR scanner.
- **🛡️ Admin**: Akses dashboard tata kelola, verifikasi UMKM, investigasi manipulasi, dan analitik makro.
