# SisaPiring (SisaRasa — Penyelamat Kuliner UMKM)

Platform pasar kuliner surplus dan tata kelola keamanan pangan terpadu yang menghubungkan masyarakat dengan hidangan segar berlebih dari UMKM lokal dengan potongan harga hingga 60%, dilengkapi dengan pusat kendali admin (Admin Governance Console) untuk verifikasi legalitas, kontrol mutu pangan, dan pencegahan manipulasi harga.

---

## 🌟 Ikhtisar Proyek (Project Overview)

SisaRasa/SisaPiring memecahkan masalah pemborosan pangan (*food waste*) di Indonesia sekaligus memberdayakan UMKM kuliner lokal. Sistem ini mengintegrasikan dua antarmuka utama dalam satu platform:
1. **Portal Konsumen (User Marketplace)**: Tempat masyarakat menemukan, memesan, dan menyelamatkan hidangan berlebih berkualitas tinggi dengan diskon hingga 60%.
2. **Pusat Tata Kelola Admin (Platform Governance & Control Center)**: Panel komprehensif bagi pengelola platform untuk memvalidasi legalitas mitra UMKM, memantau standar keamanan makanan, mencegah manipulasi diskon semu, menyelesaikan sengketa/komplain secara adil dengan jaminan *escrow*, serta menganalisis metrik dampak lingkungan makro.

---

## 🚀 Fitur Lengkap

### 👥 1. Modul Konsumen & Marketplace (User Frontend)
- **Etalase Surplus Interaktif**: Jelajahi hidangan berlebih dari gerai UMKM terdekat dengan filter kategori (Roti/Pastry, Nasi/Lauk, Kopi/Minuman, Martabak, dll.), filter radius wilayah, dan batas jam konsumsi aman (*prep window*).
- **Katalog Toko Mitra (Store Page)**: Informasi profil gerai UMKM, cerita UMKM, jam operasional, ulasan dan penilaian bintang dari pembeli lain.
- **Kantong Penyelamatan (Cart) & Alur Checkout**: Alur transaksi cepat dengan pilihan pembayaran QRIS Terintegrasi, Virtual Account / E-Wallet, atau COD Kasir Toko.
- **Pelacakan Pesanan Real-Time**: Status pesanan bertahap (Menunggu Konfirmasi -> Disiapkan Mitra -> Dalam Perjalanan/Siap Diambil -> Sampai & Selesai).
- **Sistem Rating & Ulasan Transparan**: Ulasan produk dan toko setelah pesanan selesai.
- **Pusat Pelaporan & Komplain Keamanan Makanan**: Pengajuan tiket komplain (misal: makanan tidak sesuai, basi, porsi kurang) yang terhubung langsung ke panel resolusi admin dengan opsi refund dana *escrow*.
- **Impact Calculator (Kalkulator Dampak)**: Menghitung secara otomatis kilogram sampah pangan yang dicegah, reduksi emisi karbon $CO_2e$, penghematan air bersih, dan nominal rupiah yang berhasil dihemat.
- **Autentikasi Pengguna & Profil**: Login/Register cepat, manajemen alamat pengiriman default, dan nomor kontak.

### 🛡️ 2. Modul Tata Kelola Admin (Admin Governance Console)
- **Macro Environmental & Economic Impact Dashboard**: Analitik makro metrik dampak lingkungan (porsi diselamatkan, sampah pangan terhindarkan, reduksi emisi $CO_2e$, air bersih terselamatkan), pendapatan UMKM yang dipulihkan, partisipasi per kecamatan (Coblong, Lengkong, Sukasari, dll.), dan ekspor laporan ke CSV.
- **Verifikasi Legalitas & Higienitas UMKM (Seller Onboarding KYB)**: Validasi NIB (Nomor Induk Berusaha), KTP pemilik usaha, nomor sertifikasi Halal / PIRT, foto dapur/gerai, serta penandatanganan komitmen higienitas pangan sebelum UMKM dapat berjualan.
- **Monitoring Produk & Kontrol Keamanan Pangan**: Pemantauan kesegaran hidangan surplus, kontrol *prep window*, dan fitur penarikan/pembekuan (*Take Down*) otomatis maupun manual atas produk yang tidak aman.
- **Investigasi Manipulasi Harga & Diskon Semu**: Sistem deteksi anomali untuk mencegah UMKM menaikkan harga normal secara fiktif sebelum menerapkan diskon penyelamatan, dengan opsi intervensi koreksi harga oleh admin.
- **Penyelesaian Sengketa Pelanggan (Dispute & Complaint Resolution)**: Penanganan tiket laporan pembeli dengan investigasi cepat, fasilitas eksekusi *refund* otomatis ke pembeli dari dana *escrow*, serta penjatuhan sanksi peringatan/suspensi gerai.
- **Monitoring Transaksi & Pembayaran Escrow**: Pemantauan status gerbang pembayaran (*Dana Ditahan / Escrow*, *Selesai / Settled*, *Refunded*, *Dibatalkan*).
- **Manajemen Hak Akses Pengguna (RBAC)**: Pengelolaan akun pengguna lintas peran (*Buyer*, *UMKM Partner*, *Admin Platform*) serta pemberian sanksi akun (*Aktif*, *Peringatan*, *Suspended*).

---

## 🛠️ Tech Stack

- **Framework**: React 19 + TypeScript
- **Bundler**: Vite 8
- **Styling**: Tailwind CSS v4
- **Motion**: Motion (Framer Motion engine)
- **Icons**: Lucide React
- **AI / LLM Integration**: Google GenAI SDK (`@google/genai`)

---

## 💻 Menjalankan Secara Lokal (Local Development)

```bash
# 1. Masuk ke direktori proyek
cd sisarasa-—-penyelamat-kuliner-umkm

# 2. Install dependencies (jika belum)
npm install

# 3. Jalankan server development
npm run dev
```

Aplikasi dapat diakses di:
👉 `http://localhost:3000`

---

## 🔄 Cara Berpindah Antara Mode Pembeli dan Admin

- **Mode Pembeli**: Klik menu navigasi *"Beranda"* atau *"Etalase Makanan"* di bagian atas.
- **Mode Admin**: Klik tombol *"Panel Admin"* di bilah navigasi atas (tersedia di desktop & mobile), di footer, atau di menu profil akun.
- **Dari Admin kembali ke Pembeli**: Klik tombol *"Buka Etalase Pembeli"* pada sidebar kiri admin console.
