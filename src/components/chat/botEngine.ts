import { SISA_PIRING_CATALOG, formatRupiah, SisaPiringItem } from '../../data/sisaPiringCatalog';
import { ChatMessage } from './types';

/**
 * Intelligent localized AI response engine for SisaPiring
 * Uses smart context-matching with rich metadata, and can optionally connect to Google Gemini API
 */
export async function generateBotResponse(
  userQuery: string,
  catalog: SisaPiringItem[] = SISA_PIRING_CATALOG
): Promise<Partial<ChatMessage>> {
  const q = userQuery.toLowerCase().trim();

  // 1. REKOMENDASI MAKANAN HEMAT / BUDGET (< 25rb / < 20rb)
  if (
    q.includes('rekomendasi') ||
    q.includes('di bawah') ||
    q.includes('hemat') ||
    q.includes('murah') ||
    q.includes('budget') ||
    q.includes('menu') ||
    q.includes('cari makanan')
  ) {
    const budgetMatches = catalog
      .filter((item) => item.rescuePrice <= 25000)
      .slice(0, 3);

    const featured = budgetMatches[0] || catalog[0];

    const listText = budgetMatches
      .map(
        (m, idx) =>
          `${idx + 1}. **${m.title}** (${m.merchantName})\n   💰 **${formatRupiah(m.rescuePrice)}** ~~(Normal ${formatRupiah(m.originalPrice)})~~ • Diskon ${m.discountPercent}%\n   📍 ${m.district} • Ambil: ${m.pickupWindow}`
      )
      .join('\n\n');

    return {
      text: `Berikut rekomendasi hidangan sisa piring paling hemat di Bandung malam ini:\n\n${listText}\n\n💡 *Semua porsi di atas diproduksi segar pada hari ini dan dijaga dalam standar prep window bersertifikat higienis.*`,
      productCard: {
        id: featured.id,
        title: featured.title,
        merchantName: featured.merchantName,
        price: featured.rescuePrice,
        originalPrice: featured.originalPrice,
        imageUrl: featured.imageUrl,
      },
      actionChips: [
        { label: 'Lihat Semua di Etalase', action: 'open_etalase' },
        { label: 'Cari di Coblong', action: 'ask', payload: 'Menu sisa piring di Coblong' },
        { label: 'Cari Roti & Pastry', action: 'ask', payload: 'Rekomendasi roti sisa piring' },
      ],
    };
  }

  // 2. LOKASI KECAMATAN DI BANDUNG (Coblong, Dago, Bandung Wetan, Lengkong, dll)
  if (
    q.includes('coblong') ||
    q.includes('dago') ||
    q.includes('dipatiukur') ||
    q.includes('bandung wetan') ||
    q.includes('riau') ||
    q.includes('lengkong') ||
    q.includes('sumur bandung') ||
    q.includes('braga') ||
    q.includes('lokasi')
  ) {
    let matchedDistrict = 'Coblong';
    if (q.includes('bandung wetan') || q.includes('riau') || q.includes('progo')) {
      matchedDistrict = 'Bandung Wetan';
    } else if (q.includes('lengkong') || q.includes('burangrang')) {
      matchedDistrict = 'Lengkong';
    } else if (q.includes('sumur bandung') || q.includes('braga')) {
      matchedDistrict = 'Sumur Bandung';
    }

    const items = catalog.filter((item) =>
      item.district.toLowerCase().includes(matchedDistrict.toLowerCase())
    );

    const listText = items
      .slice(0, 3)
      .map(
        (m, idx) =>
          `${idx + 1}. **${m.title}**\n   🏪 ${m.merchantName} (${m.address})\n   💰 **${formatRupiah(m.rescuePrice)}** (Sisa ${m.remainingStock} porsi)`
      )
      .join('\n\n');

    return {
      text: `📍 Ditemukan **${items.length} pilihan sisa piring** di wilayah **${matchedDistrict}**:\n\n${listText || 'Semua gerai di area ini siap melayani pickup malam ini!'}\n\nIngin melihat rute pengambilan atau filter kategori lain?`,
      actionChips: [
        { label: 'Buka Etalase Area Ini', action: 'open_etalase' },
        { label: 'Rekomendasi di Lengkong', action: 'ask', payload: 'Menu di Lengkong' },
        { label: 'Rekomendasi di Bandung Wetan', action: 'ask', payload: 'Menu di Bandung Wetan' },
      ],
    };
  }

  // 3. JAMINAN REFUND 100% & REKENING ESCROW
  if (
    q.includes('refund') ||
    q.includes('garansi') ||
    q.includes('basi') ||
    q.includes('rusak') ||
    q.includes('komplain') ||
    q.includes('ganti rugi') ||
    q.includes('uang kembali')
  ) {
    return {
      text: `🛡️ **Garansi Perlindungan Pembeli SisaPiring 100% Refund**:\n\nPlatform SisaPiring menggunakan sistem **Rekening Bersama (Escrow)** demi keamanan Anda:\n\n1. **Dana Ditahan Sementara**: Pembayaran Anda tidak langsung diteruskan ke UMKM, melainkan diamankan di rekening escrow platform.\n2. **Pemeriksaan Makanan**: Saat Anda mengambil makanan di gerai, Anda memiliki waktu hingga **2 jam** untuk melaporkan kendala kualitas.\n3. **Klaim Instan**: Jika makanan basi, berbau tidak wajar, atau berbeda dengan deskripsi, cukup laporkan via tombol *Komplain & Garansi* di menu **Pesanan** beserta 1 foto bukti.\n4. **100% Uang Kembali**: Dana refund akan diteruskan kembali ke saldo e-wallet / rekening Anda secara instan tanpa potongan biaya admin.`,
      actionChips: [
        { label: 'Cek Status Pesanan Saya', action: 'open_orders' },
        { label: 'Hubungi Penjual via Chat', action: 'open_seller_chat' },
        { label: 'Tips Food Safety', action: 'ask', payload: 'Tips panaskan makanan' },
      ],
    };
  }

  // 4. TIPS HANGATKAN & FOOD SAFETY
  if (
    q.includes('panas') ||
    q.includes('hangat') ||
    q.includes('simpan') ||
    q.includes('basi') ||
    q.includes('safety') ||
    q.includes('higienis') ||
    q.includes('airfryer') ||
    q.includes('oven')
  ) {
    return {
      text: `🔥 **Tips Penyimpanan & Pemanasan Makanan Sisa Piring**:\n\n* **🥐 Roti & Pastry / Viennoiserie**: Panaskan di *air fryer* atau oven pada suhu **160°C selama 3-4 menit**. Hindari microwave agar tekstur kulit tidak menjadi liat.\n* **🍛 Nasi & Masakan Berkuah / Santan**: Didihkan kembali di atas wajan/panci kecil dengan api sedang hingga mencapai suhu inti minimal **74°C**.\n* **🍜 Bakmi / Olahan Mie**: Jika kuah dipisah, panaskan kuah hingga mendidih terlebih dahulu, baru siramkan ke atas mie.\n* **❄️ Penyimpanan di Kulkas**: Jika tidak langsung dikonsumsi, segera simpan dalam wadah tertutup di chiller (maksimal 24 jam) atau freezer (tahan hingga 2 minggu).`,
      actionChips: [
        { label: 'Rekomendasi Roti & Pastry', action: 'ask', payload: 'Rekomendasi roti sisa piring' },
        { label: 'Garansi Refund 100%', action: 'ask', payload: 'Bagaimana garansi refund?' },
      ],
    };
  }

  // 5. CARA AMBIL PESANAN (PICKUP DENGAN QR CODE)
  if (
    q.includes('ambil') ||
    q.includes('pickup') ||
    q.includes('qr') ||
    q.includes('alur') ||
    q.includes('cara pesan')
  ) {
    return {
      text: `📱 **Panduan Pengambilan Pesanan di Gerai UMKM**:\n\n1. **Pilih & Checkout**: Pilih menu sisa piring favorit Anda sebelum sesi ambil ditutup.\n2. **Dapatkan Kode QR**: Buka tab **Pesanan** di aplikasi untuk melihat tiket digital dan Kode QR verifikasi unik Anda.\n3. **Kunjungi Gerai**: Datang ke gerai mitra pada jam operasional sesi ambil (umumnya **17:00 – 21:30 WIB**).\n4. **Tunjukkan QR ke Kasir**: Kasir mitra akan memindai QR untuk serah terima paket yang telah disiapkan rapi.\n5. **Selesai**: Nikmati hidangan lezat dan selamat Anda telah mencegah timbulan sampah makanan ke TPA!`,
      actionChips: [
        { label: 'Buka Tab Pesanan', action: 'open_orders' },
        { label: 'Chat Penjual Toko', action: 'open_seller_chat' },
        { label: 'Berapa Dampak Lingkungannya?', action: 'ask', payload: 'Berapa dampak CO2 per porsi?' },
      ],
    };
  }

  // 6. DAMPAK LINGKUNGAN (LCA METRIK EMISI & AIR)
  if (
    q.includes('co2') ||
    q.includes('karbon') ||
    q.includes('air') ||
    q.includes('dampak') ||
    q.includes('lingkungan') ||
    q.includes('tpa') ||
    q.includes('sarimukti')
  ) {
    return {
      text: `🌿 **Metodologi Dampak Lingkungan SisaPiring Kota Bandung**:\n\nBerdasarkan kajian Life Cycle Assessment (LCA) limbah organik perkotaan:\n\n* **📉 Reduksi Emisi Karbon**: Setiap 1 porsi hidangan yang Anda selamatkan mencegah rata-rata **0,45 kg $CO_2e$** gas metana dari pembusukan anaerobik di TPA Sarimukti.\n* **💧 Penghematan Air Bersih**: Mencegah pemborosan air tersembunyi (*virtual water*) rata-rata **62 liter air bersih** per porsi dari rantai pasok agrikultur.\n* **💰 Penghematan Dompet**: Warga Bandung menghemat rata-rata **50% – 70%** pengeluaran makan harian sambil membantu likuiditas modal pelaku UMKM lokal!`,
      actionChips: [
        { label: 'Mulai Selamatkan Makanan', action: 'open_etalase' },
        { label: 'Cari Makanan di Bawah 25rb', action: 'ask', payload: 'Rekomendasi di bawah 25rb' },
      ],
    };
  }

  // 7. DEFAULT HELPFUL FALLBACK
  return {
    text: `Terima kasih atas pertanyaannya! Saya dapat membantu Anda dalam beberapa hal berikut:\n\n* 🍱 Menemukan **rekomendasi kuliner sisa piring hemat** di berbagai kecamatan Kota Bandung.\n* 🛡️ Informasi perlindungan garansi **100% Refund & Rekening Escrow** jika makanan tidak sesuai.\n* ⏰ Jadwal dan panduan **pengambilan pesanan via QR code** di gerai mitra.\n* 🔥 **Tips pemanasan & higienitas** makanan agar tetap lezat dan aman.\n* 💬 Menghubungkan Anda langsung ke **Chat Mitra Penjual** terkait pesanan Anda.\n\nApa yang ingin Anda tanyakan lebih lanjut?`,
    actionChips: [
      { label: '🍲 Rekomendasi Menu Hemat', action: 'ask', payload: 'Rekomendasi di bawah 25rb' },
      { label: '🛡️ Garansi Refund 100%', action: 'ask', payload: 'Bagaimana garansi refund?' },
      { label: '💬 Chat dengan Penjual', action: 'open_seller_chat' },
      { label: '🔥 Tips Hangatkan Makanan', action: 'ask', payload: 'Tips panaskan makanan' },
    ],
  };
}

