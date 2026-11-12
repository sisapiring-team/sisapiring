# SisaPiring — Penyelamat Produk Tak Terjual

<p align="center">
  <strong>Save Food. Reduce Waste. Create Impact.</strong>
</p>

<p align="center">
  Platform digital yang menghubungkan UMKM makanan dengan masyarakat untuk menyelamatkan produk surplus layak konsumsi. Membantu UMKM menekan kerugian, mempermudah akses makanan terjangkau, dan mencatat dampak nyata pengurangan limbah makanan.
</p>

---

## 📌 Ringkasan Proyek
- **Kategori:** Web Application (Mobile-First Design)
- **Nama Aplikasi:** SisaPiring
- **Target Pengguna:** UMKM/Seller (Penjual Makanan), Buyer (Masyarakat Umum), dan Administrator.

### Latar Belakang Masalah
1. UMKM makanan sering mengalami kerugian akibat produk surplus yang tidak terjual di penghujung hari.
2. Masyarakat kesulitan mencari alternatif makanan berkualitas dengan harga yang lebih terjangkau.
3. Kurangnya transparansi keamanan pangan pada produk sisa, serta belum adanya pencatatan sistematis mengenai seberapa besar dampak penyelamatan makanan terhadap lingkungan (misal: pengurangan gas metana dari *food waste*).

### Solusi SisaPiring
SisaPiring hadir sebagai ekosistem *Food Rescue Marketplace*. Kami memfasilitasi transaksi diskon bertingkat (Rescue Deals 50% - 100%) dengan berlandaskan transparansi keamanan pangan (*Food Safety Checklist*), pengambilan mandiri (*QR Pickup*), dan menyediakan **Impact Dashboard** untuk menghitung emisi yang berhasil dicegah dari makanan yang diselamatkan.

---

## ✨ Fitur Utama (Terimplementasi)

1. **User & Seller Management:**
   - Registrasi peran ganda (Buyer & UMKM).
   - *Seller Verification* untuk memastikan validitas identitas UMKM.
2. **Food Safety Management:**
   - *Food Condition Checklist*: Verifikasi wajib sebelum UMKM mengunggah produk.
   - *Countdown Timer*: Pemantauan batas waktu aman pengambilan makanan.
3. **Rescue Deals & Product Management:**
   - *Tiered Discount System*: Diskon dinamis (50%, 70%, 90%, hingga 100% donasi).
   - *Limited Stock Indicator* & *Stock Locking* mencegah *double-booking*.
4. **Order & Transaction:**
   - Pemesanan berbasis *Pickup* (Ambil di tempat).
   - *QR Pickup Verification* untuk serah terima yang aman dan cepat.
5. **Food Rescue Impact Dashboard:**
   - Pencatatan otomatis konversi jumlah porsi yang diselamatkan menjadi estimasi metrik lingkungan (misal: gram emisi gas metana yang dicegah).

---

## 🛠️ Teknologi yang Digunakan

- **Frontend:** Next.js / React (Tampilan difokuskan pada *Mobile-First* / memanjang seperti layar HP agar realistis digunakan di lapangan).
- **Backend & Database:** Supabase / Firebase (Digunakan untuk autentikasi, manajemen CRUD produk, dan kalkulasi data di Impact Dashboard secara *real-time*).
- **Desain & Prototyping:** Figma
- **Video & Multimedia:** CapCut
- **Version Control:** Git & GitHub

---

## 👥 Susunan Tim & Pembagian Peran

| Nama | Peran | Fokus Pekerjaan (Job Desk) | GitHub |
|---|---|---|---|
| **[Nama Anggota 1]** | **Frontend Developer** *(The Builder)* | Bertanggung jawab penuh pada *coding* tampilan website. Wajib memastikan desain *mobile-first* (responsif untuk layar HP) karena aplikasi pemesanan makanan didesain untuk penggunaan dinamis di lapangan. | [@username](https://github.com/) |
| **[Nama Anggota 2]** | **Backend & Database** *(The Logic)* | Menangani logika sistem: Autentikasi, integrasi Firebase/Supabase, operasi CRUD produk, *countdown timer*, sistem kuncian stok, serta rumus kalkulasi di Impact Dashboard. | [@username](https://github.com/) |
| **[Nama Anggota 3]** | **UI/UX & Video Editor** *(The Artist)* | Membuat *wireframe* dan desain antarmuka secara tangkas di Figma. Bertugas merekam *footage* dan mengedit video demo menggunakan CapCut untuk presentasi visual yang memukau. | [@username](https://github.com/) |
| **[Nama Anggota 4]** | **Project Manager** *(The Pitcher)* | *Hustler* utama tim. Menulis naskah video, menyiapkan materi *pitch deck*, menjadi aktor utama demo aplikasi, serta melakukan *QA Testing* ketat untuk memastikan aplikasi bebas *bug*. | [@username](https://github.com/) |

---

## 🏗️ Arsitektur Sistem & Alur Data

> *(Catatan untuk Tim: Ganti gambar di bawah ini dengan diagram arsitektur sistem/ERD Anda. Anda bisa menggunakan draw.io atau mermaid.js)*

![System Architecture Placeholder](https://via.placeholder.com/800x400?text=System+Architecture+%26+Data+Flow+Diagram)

**Alur Data Singkat:**
1. **UMKM** menginput data produk beserta foto dan *Food Safety Checklist* ke Database.
2. **Sistem (Backend)** menghitung batas waktu kedaluwarsa dan menampilkan produk ke halaman *Buyer*.
3. **Buyer** melakukan pemesanan (sistem melakukan *stock locking* otomatis di database).
4. **Buyer & UMKM** bertemu di lokasi; UMKM memindai QR code *Buyer* via sistem.
5. Status menjadi *Completed*; **Sistem** mengirimkan data ke Impact Dashboard untuk diakumulasi menjadi poin/metrik penyelamatan lingkungan.

---

## 🚀 Panduan Instalasi & Konfigurasi

### Prasyarat
- Node.js (v18 atau lebih baru)
- Git
- Akun Firebase / Supabase (untuk konfigurasi *environment*)

### Instalasi Langkah-demi-Langkah

1. **Clone repository ini**
   ```bash
   git clone https://github.com/USERNAME/SisaPiring.git
   cd SisaPiring
   ```

2. **Instalasi Dependencies**
   ```bash
   npm install
   # atau
   yarn install
   ```

3. **Konfigurasi Environment Variables**
   - Salin file `.env.example` menjadi `.env.local`
   ```bash
   cp .env.example .env.local
   ```
   - Buka `.env.local` dan isi dengan kredensial API Anda:
   ```env
   # Contoh .env.example
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   # atau
   NEXT_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
   ```

4. **Jalankan Aplikasi (Development Mode)**
   ```bash
   npm run dev
   # atau
   yarn dev
   ```
   Aplikasi dapat diakses melalui `http://localhost:3000`. Pastikan menggunakan mode *Inspect* (F12) dan pilih tampilan *Mobile* pada *browser* Anda untuk pengalaman terbaik.

---

## 🔑 Akun Demonstrasi (Demo)

Gunakan kredensial berikut untuk mencoba aplikasi kami tanpa perlu mendaftar dari awal:

**1. Akun UMKM / Penjual**
- **Email:** seller@sisapiring.com
- **Password:** SisaPiringSeller123
- *Fungsi: Mengunggah produk surplus, mengatur diskon, scan QR pembeli, melihat dashboard penjualan.*

**2. Akun Buyer / Pembeli**
- **Email:** buyer@sisapiring.com
- **Password:** SisaPiringBuyer123
- *Fungsi: Mencari makanan terdekat, melakukan reservasi, melihat histori donasi.*

---

## 🤖 Dokumentasi Penggunaan AI

Dalam pengembangan SisaPiring, kami memanfaatkan AI untuk mempercepat alur kerja:
- **ChatGPT / Gemini:** Digunakan untuk optimasi *copywriting* UI/UX, penulisan kerangka materi *pitch deck*, dan mencari solusi *debugging* untuk *error* spesifik pada implementasi *countdown timer* di React.
- **GitHub Copilot:** Membantu tim *Frontend* dalam *auto-completion* struktur komponen UI Tailwind CSS.

---

## 📜 Atribusi & Pihak Ketiga

Kami mengucapkan terima kasih kepada layanan dan kreator aset berikut:
- **Icons & Illustrations:** [Lucide Icons](https://lucide.dev/) dan [Freepik](https://www.freepik.com/) (Free License).
- **Fonts:** [Google Fonts - Inter & Poppins](https://fonts.google.com/).
- **UI Framework:** Tailwind CSS dan shadcn/ui.
- **Sound Effects (Video):** Library gratis CapCut.
- *Tidak ada dataset eksternal spesifik yang digunakan; data UMKM di-generate sebagai data dummy/mock untuk keperluan demonstrasi (QA Testing).*

---
<p align="center">
  Dibuat dengan semangat berkelanjutan oleh <strong>Tim SisaPiring</strong> 🍃
</p>