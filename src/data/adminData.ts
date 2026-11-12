import { ComplaintReport } from './sisaPiringCatalog';

export type UmkmVerificationStatus =
  | 'Menunggu Verifikasi'
  | 'Verified'
  | 'Ditolak'
  | 'Suspended';

export interface UmkmVerificationRecord {
  id: string;
  storeName: string;
  ownerName: string;
  email: string;
  phone: string;
  category: string;
  district: string;
  address: string;
  submittedAt: string;
  status: UmkmVerificationStatus;
  nibNumber: string;
  ktpMasked: string;
  halalOrPirtNumber: string;
  docType: string;
  docFileName: string;
  storePhotoUrl: string;
  hygieneCommitmentSigned: boolean;
  adminNotes: string;
}

export type ProductMonitoringStatus =
  | 'Aktif & Aman'
  | 'Dalam Tinjauan'
  | 'Take Down';

export interface ProductMonitoringMeta {
  itemId: string;
  monitoringStatus: ProductMonitoringStatus;
  reportCount: number;
  safetyFlag: string;
  prepWindowVerified: boolean;
  lastCheckedAt: string;
  takedownReason?: string;
}

export type DisputeStatus =
  | 'Sedang Ditinjau'
  | 'Investigasi Mitra'
  | 'Selesai (Refund Pembeli)'
  | 'Selesai (Sanksi UMKM)'
  | 'Ditolak (Bukti Tidak Valid)';

export type DisputeType =
  | 'Makanan Basi / Tidak Layak Konsumsi'
  | 'Pesanan Tidak Diserahkan'
  | 'Dugaan Penipuan / Fiktif'
  | 'Makanan Tidak Sesuai Deskripsi'
  | 'Kualitas / Kesegaran Kurang Baik'
  | 'Porsi Tidak Sesuai Ketentuan'
  | 'Kendala Saat Pengambilan di Toko';

export interface AdminDisputeRecord {
  id: string;
  ticketCode: string;
  orderCode: string;
  merchantName: string;
  itemName: string;
  reporterName: string;
  reporterPhone: string;
  category: DisputeType;
  description: string;
  evidenceFileName?: string;
  createdAt: string;
  amountPaid: number;
  severity: 'Kritis (Keamanan Pangan)' | 'Tinggi (Finansial/Serah Terima)' | 'Sedang (Kualitas/Porsi)';
  status: DisputeStatus;
  adminResolutionNote?: string;
}

export type GatewayTransactionStatus =
  | 'Selesai (Settled)'
  | 'Dana Ditahan (Escrow)'
  | 'Refunded'
  | 'Dibatalkan';

export interface AdminTransactionRecord {
  id: string;
  orderCode: string;
  timestamp: string;
  buyerName: string;
  merchantName: string;
  itemTitle: string;
  quantity: number;
  reportedNormalPrice: number;
  verifiedBaselinePrice: number;
  rescuePrice: number;
  reportedDiscountPercent: number;
  realDiscountPercent: number;
  totalPaid: number;
  paymentMethod: 'QRIS Terintegrasi' | 'VA Bank / E-Wallet' | 'COD Kasir Mitra';
  paymentGatewayRef: string;
  gatewayStatus: GatewayTransactionStatus;
  manipulationFlag: 'Aman' | 'Indikasi Markup Harga Normal' | 'Diskon Semu Terdeteksi';
  adminActionNote?: string;
}

export interface DiscountHistoryEntry {
  id: string;
  itemId: string;
  itemTitle: string;
  merchantName: string;
  recordedDate: string;
  historicalNormalPrice: number;
  submittedNormalPrice: number;
  rescuePrice: number;
  claimedDiscountPercent: number;
  actualDiscountFromBaseline: number;
  markupDeviationPercent: number;
  status: 'Terverifikasi Wajar' | 'Peringatan Manipulasi Harga' | 'Harga Dikoreksi Admin';
}

export type UserRole = 'Buyer' | 'UMKM' | 'Admin';
export type AccountStatus = 'Aktif' | 'Peringatan (Warning)' | 'Suspended';

export interface UserAccessRecord {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  status: AccountStatus;
  district: string;
  joinedAt: string;
  lastActive: string;
  violationCount: number;
  sanctionNote?: string;
}

export interface MacroPeriodStats {
  periodLabel: string;
  totalPortionsRescued: number;
  totalTransactionsCompleted: number;
  foodWastePreventedKg: number;
  co2EmissionsSavedKg: number;
  waterSavedLiters: number;
  activeUmkmPartners: number;
  totalUmkmApplications: number;
  umkmRevenueRecovered: number;
  citizenSavingsTotal: number;
  districtStats: {
    district: string;
    portionsRescued: number;
    activeUmkm: number;
    wasteReducedKg: number;
    participationRate: number;
  }[];
  categoryImpact: {
    category: string;
    portionsRescued: number;
    transactions: number;
    co2SavedKg: number;
    avgDiscountPercent: number;
  }[];
  timelineData: {
    label: string;
    portions: number;
    transactions: number;
    wasteKg: number;
  }[];
}

export const INITIAL_UMKM_VERIFICATIONS: UmkmVerificationRecord[] = [
  {
    id: 'umkm-ver-00',
    storeName: 'Kala Bakehouse & Artisan Cafe',
    ownerName: 'Kang Ridwan Sasmita',
    email: 'ridwan@kalabakehouse.id',
    phone: '+62 812-2345-6789',
    category: 'Roti, Kue & Pastry',
    district: 'Bandung Wetan (Citarum / Progo)',
    address: 'Jl. Progo No. 14, Citarum, Bandung Wetan, Bandung',
    submittedAt: 'Kemarin · 10.15 WIB',
    status: 'Verified',
    nibNumber: '02847291038',
    ktpMasked: '327310******0019',
    halalOrPirtNumber: 'ID32110009847120425',
    docType: 'NIB Berusaha & Sertifikasi Higiene Sanitasi Pangan',
    docFileName: 'NIB_02847291038_KalaBakehouse.pdf',
    storePhotoUrl: '/assets/images/sisapiring_storefront_1794322286782.jpg',
    hygieneCommitmentSigned: true,
    adminNotes: 'Mitra resmi terverifikasi. Standar dapur higienis, fasilitas pendingin terjaga, dan komitmen anti-food waste telah disetujui kurator SisaPiring.',
  },
  {
    id: 'umkm-ver-01',
    storeName: 'Kue Balok & Kopi Lengkong Jaya',
    ownerName: 'Kang Asep Sunandar',
    email: 'asep.lengkongjaya@gmail.com',
    phone: '081322448891',
    category: 'Martabak & Jajanan Sore',
    district: 'Lengkong (Burangrang)',
    address: 'Jl. Lengkong Kecil No. 48, Paledang, Bandung',
    submittedAt: 'Hari ini · 14.20 WIB',
    status: 'Menunggu Verifikasi',
    nibNumber: '9120301847291',
    ktpMasked: '327308******0004',
    halalOrPirtNumber: 'ID32110004819200324',
    docType: 'NIB (Nomor Induk Berusaha) & Sertifikat Halal',
    docFileName: 'NIB_Halal_KueBalokLengkong.pdf',
    storePhotoUrl: '/assets/images/food_kopi_jajanan_pasar_1794295654124.jpg',
    hygieneCommitmentSigned: true,
    adminNotes: 'Dokumen NIB dan foto dapur bersih sudah diunggah. Menunggu pengecekan kesesuaian alamat usaha.',
  },
  {
    id: 'umkm-ver-02',
    storeName: 'Dapur Pastri & Croissant Ciumbuleuit',
    ownerName: 'Teh Risa Amalia',
    email: 'risa.pastri@ciumbuleuit.id',
    phone: '081299883412',
    category: 'Roti, Kue & Pastry',
    district: 'Coblong (Dago / Dipatiukur)',
    address: 'Jl. Cikapundung Barat No. 11, Coblong, Bandung',
    submittedAt: 'Hari ini · 11.05 WIB',
    status: 'Menunggu Verifikasi',
    nibNumber: '9120409928174',
    ktpMasked: '327302******0012',
    halalOrPirtNumber: 'P-IRT 2063273010942-28',
    docType: 'Sertifikat PIRT & KTP Penanggung Jawab',
    docFileName: 'PIRT_DapurPastri_Ciumbuleuit.pdf',
    storePhotoUrl: '/assets/images/food_artisan_pastry_box_1794295651168.jpg',
    hygieneCommitmentSigned: true,
    adminNotes: 'PIRT aktif hingga 2028. Etalase penyimpanan memiliki pengatur suhu tertutup.',
  },
  {
    id: 'umkm-ver-03',
    storeName: 'Sari Bakery Braga',
    ownerName: 'Ibu Sari Rahmawati',
    email: 'sari.bakery.braga@gmail.com',
    phone: '081122334455',
    category: 'Roti, Kue & Pastry',
    district: 'Sumur Bandung (Braga)',
    address: 'Jl. Naripan No. 45, Sumur Bandung, Bandung',
    submittedAt: '12 Okt 2026 · 09.30 WIB',
    status: 'Verified',
    nibNumber: '8120110293847',
    ktpMasked: '327305******0001',
    halalOrPirtNumber: 'ID32110001928370123',
    docType: 'NIB & Sertifikat Halal MUI',
    docFileName: 'Berkas_Lengkap_SariBakery.pdf',
    storePhotoUrl: '/assets/images/umkm_partner_portrait_1794295655906.jpg',
    hygieneCommitmentSigned: true,
    adminNotes: 'Mitra teladan dengan rekor 3.040+ porsi terselamatkan dan rating 5.0.',
  },
  {
    id: 'umkm-ver-04',
    storeName: 'Martabak Legit Pak Darto',
    ownerName: 'Bapak Sudarto',
    email: 'pakdarto.martabak@yahoo.com',
    phone: '081394827162',
    category: 'Martabak & Jajanan Sore',
    district: 'Lengkong (Burangrang)',
    address: 'Jl. Burangrang No. 34, Lengkong, Bandung',
    submittedAt: '18 Okt 2026 · 15.10 WIB',
    status: 'Verified',
    nibNumber: '8120948372615',
    ktpMasked: '327309******0008',
    halalOrPirtNumber: 'P-IRT 2053273041120-27',
    docType: 'Surat Keterangan Usaha (SKU) & KTP',
    docFileName: 'SKU_Kelurahan_MartabakPakDarto.pdf',
    storePhotoUrl: '/assets/images/cat_martabak_1794300332100.jpg',
    hygieneCommitmentSigned: true,
    adminNotes: 'Terverifikasi lapangan oleh tim kurator SisaPiring Bandung.',
  },
  {
    id: 'umkm-ver-05',
    storeName: 'Warung Ayam Geprek Malam Cicaheum',
    ownerName: 'Deni Kurniawan',
    email: 'deni.geprek99@gmail.com',
    phone: '085721903847',
    category: 'Nasi, Lauk & Warung Makan',
    district: 'Cicendo (Pasirkaliki)',
    address: 'Jl. H. Djundjunan No. 90, Bandung',
    submittedAt: '4 Nov 2026 · 20.00 WIB',
    status: 'Suspended',
    nibNumber: 'Belum Dilampirkan',
    ktpMasked: '327314******0019',
    halalOrPirtNumber: 'Tidak Ada',
    docType: 'KTP Penanggung Jawab (Buram)',
    docFileName: 'Foto_KTP_Geprek99.jpg',
    storePhotoUrl: '/assets/images/food_nasi_kapau_bowl_1794295653656.jpg',
    hygieneCommitmentSigned: false,
    adminNotes: 'Ditangguhkan sementara karena 2 laporan keterlambatan serah terima dan dokumen SKU belum valid.',
  },
  {
    id: 'umkm-ver-06',
    storeName: 'Kedai Dimsum Beku Tanpa Label',
    ownerName: 'Robby Wijaya',
    email: 'robby.dimsum@mail.com',
    phone: '087823119044',
    category: 'Katering & Dapur Rumahan',
    district: 'Buahbatu',
    address: 'Jl. Margacinta No. 12, Buahbatu, Bandung',
    submittedAt: '1 Nov 2026 · 16.45 WIB',
    status: 'Ditolak',
    nibNumber: '-',
    ktpMasked: '327319******0022',
    halalOrPirtNumber: '-',
    docType: 'KTP Penanggung Jawab',
    docFileName: 'dokumen_tidak_lengkap.jpg',
    storePhotoUrl: '/assets/images/cat_bakmie_1794300333306.jpg',
    hygieneCommitmentSigned: false,
    adminNotes: 'Ditolak karena tidak mencantumkan tanggal produksi makanan olahan beku dan alamat dapur tidak ditemukan.',
  },
];

export const INITIAL_PRODUCT_MONITORING: Record<string, ProductMonitoringMeta> = {
  'sp-01': {
    itemId: 'sp-01',
    monitoringStatus: 'Aktif & Aman',
    reportCount: 0,
    safetyFlag: 'Aman · Dipanggang Hari Ini (18.00 WIB)',
    prepWindowVerified: true,
    lastCheckedAt: 'Hari ini · 18.15 WIB',
  },
  'sp-02': {
    itemId: 'sp-02',
    monitoringStatus: 'Aktif & Aman',
    reportCount: 0,
    safetyFlag: 'Aman · Kuah Kaldu Dipisah Panas',
    prepWindowVerified: true,
    lastCheckedAt: 'Hari ini · 17.40 WIB',
  },
  'sp-03': {
    itemId: 'sp-03',
    monitoringStatus: 'Dalam Tinjauan',
    reportCount: 1,
    safetyFlag: 'Perlu Pengawasan · Kue Basah Bersantan (Batas 22.00 WIB)',
    prepWindowVerified: true,
    lastCheckedAt: 'Hari ini · 18.00 WIB',
  },
  'sp-04': {
    itemId: 'sp-04',
    monitoringStatus: 'Aktif & Aman',
    reportCount: 0,
    safetyFlag: 'Aman · Mie Segar Tanpa Pengawet',
    prepWindowVerified: true,
    lastCheckedAt: 'Hari ini · 17.50 WIB',
  },
  'sp-05': {
    itemId: 'sp-05',
    monitoringStatus: 'Aktif & Aman',
    reportCount: 0,
    safetyFlag: 'Aman · Bakery Harian Standar Higienis',
    prepWindowVerified: true,
    lastCheckedAt: 'Hari ini · 18.10 WIB',
  },
  'sp-06': {
    itemId: 'sp-06',
    monitoringStatus: 'Dalam Tinjauan',
    reportCount: 1,
    safetyFlag: 'Perhatian · Produk Susu Segar Wajib Dingin (< 5°C)',
    prepWindowVerified: true,
    lastCheckedAt: 'Hari ini · 18.05 WIB',
  },
  'sp-07': {
    itemId: 'sp-07',
    monitoringStatus: 'Aktif & Aman',
    reportCount: 0,
    safetyFlag: 'Aman · Kemasan Food-Grade Tertutup',
    prepWindowVerified: true,
    lastCheckedAt: 'Hari ini · 18.20 WIB',
  },
  'sp-08': {
    itemId: 'sp-08',
    monitoringStatus: 'Aktif & Aman',
    reportCount: 0,
    safetyFlag: 'Aman · Rantai Dingin Salad Terjaga',
    prepWindowVerified: true,
    lastCheckedAt: 'Hari ini · 17.30 WIB',
  },
  'sp-09': {
    itemId: 'sp-09',
    monitoringStatus: 'Aktif & Aman',
    reportCount: 0,
    safetyFlag: 'Aman · Fermentasi Sourdough Alami',
    prepWindowVerified: true,
    lastCheckedAt: 'Hari ini · 17.45 WIB',
  },
  'sp-10': {
    itemId: 'sp-10',
    monitoringStatus: 'Dalam Tinjauan',
    reportCount: 2,
    safetyFlag: 'Perlu Audit · Lauk Santan & Sambal Sore Hari',
    prepWindowVerified: false,
    lastCheckedAt: 'Hari ini · 18.25 WIB',
  },
};

export const INITIAL_ADMIN_DISPUTES: AdminDisputeRecord[] = [
  {
    id: 'disp-01',
    ticketCode: 'KL-9041',
    orderCode: 'SP-7912',
    merchantName: 'Warung Makan Ibu Rini',
    itemName: 'Paket Keluarga Lauk Nusantara & Sambal Rumahan',
    reporterName: 'Adit Suryanto',
    reporterPhone: '081288391044',
    category: 'Makanan Basi / Tidak Layak Konsumsi',
    description:
      'Sayur tumis buncis di dalam kotak sudah agak berlendir dan berbau asam saat dibuka pukul 20.15 WIB, padahal baru diambil pukul 19.45 WIB.',
    evidenceFileName: 'bukti_sayur_buncis_sp7912.jpg',
    createdAt: 'Hari ini · 20.22 WIB',
    amountPaid: 35000,
    severity: 'Kritis (Keamanan Pangan)',
    status: 'Sedang Ditinjau',
  },
  {
    id: 'disp-02',
    ticketCode: 'KL-8834',
    orderCode: 'SP-7805',
    merchantName: 'Kopi & Teh Senja Manis',
    itemName: 'Paket 3 Cup Boba Brown Sugar Fresh Milk & Thai Tea',
    reporterName: 'Clara Nathania',
    reporterPhone: '081377482910',
    category: 'Pesanan Tidak Diserahkan',
    description:
      'Saat saya tiba di kedai Jl. Buah Batu pukul 19.30 WIB sesuai jadwal pengambilan, rolling door toko sudah tutup rapat dan tidak ada petugas kasir.',
    evidenceFileName: 'foto_toko_tutup_buahbatu.jpg',
    createdAt: 'Hari ini · 19.40 WIB',
    amountPaid: 27000,
    severity: 'Tinggi (Finansial/Serah Terima)',
    status: 'Investigasi Mitra',
    adminResolutionNote: 'Sedang mengonfirmasi log jam tutup kasir mitra dan memproses pengembalian dana QRIS.',
  },
  {
    id: 'disp-03',
    ticketCode: 'KL-8519',
    orderCode: 'SP-7410',
    merchantName: 'Kedai Klasik Nusantara',
    itemName: 'Bundel Jajanan Pasar Tradisional & Pastel Risoles Sore',
    reporterName: 'Budi Santoso',
    reporterPhone: '085622184920',
    category: 'Porsi Tidak Sesuai Ketentuan',
    description:
      'Di deskripsi tertulis 10 potong kue basah (4 klepon, 3 kue lumpur, 3 risoles), namun saat dibuka di rumah hanya ada 7 potong kue.',
    evidenceFileName: 'isi_kotak_jajanan_7pcs.jpg',
    createdAt: 'Kemarin · 20.05 WIB',
    amountPaid: 26000,
    severity: 'Sedang (Kualitas/Porsi)',
    status: 'Selesai (Refund Pembeli)',
    adminResolutionNote: 'Refund parsial Rp 10.000 telah dikembalikan ke saldo pembeli & teguran tertulis dikirim ke Kedai Klasik Nusantara.',
  },
  {
    id: 'disp-04',
    ticketCode: 'KL-8203',
    orderCode: 'SP-6994',
    merchantName: 'Warung Ayam Geprek Malam Cicaheum',
    itemName: 'Paket 3 Box Ayam Geprek Sambal Korek',
    reporterName: 'Rina Kartika',
    reporterPhone: '081902837465',
    category: 'Dugaan Penipuan / Fiktif',
    description:
      'Mitra meminta pembayaran tambahan Rp 15.000 di luar aplikasi saat pengambilan paket yang sudah lunas via QRIS.',
    evidenceFileName: 'chat_bukti_pungutan_tambahan.png',
    createdAt: '5 Nov 2026 · 21.10 WIB',
    amountPaid: 33000,
    severity: 'Tinggi (Finansial/Serah Terima)',
    status: 'Selesai (Sanksi UMKM)',
    adminResolutionNote: 'Dana pembeli di-refund 100% dan akun mitra Warung Ayam Geprek Malam Cicaheum telah di-Suspend.',
  },
];

export const INITIAL_ADMIN_TRANSACTIONS: AdminTransactionRecord[] = [
  {
    id: 'trx-01',
    orderCode: 'SP-8421',
    timestamp: 'Hari ini · 16.40 WIB',
    buyerName: 'Nabil Rachman',
    merchantName: 'Martabak Legit Pak Darto',
    itemTitle: 'Martabak Manis Keju Susu & Cokelat Kacang Loyang Tebal',
    quantity: 1,
    reportedNormalPrice: 70000,
    verifiedBaselinePrice: 70000,
    rescuePrice: 28000,
    reportedDiscountPercent: 60,
    realDiscountPercent: 60,
    totalPaid: 28000,
    paymentMethod: 'QRIS Terintegrasi',
    paymentGatewayRef: 'QRIS-BDG-20261110-8421',
    gatewayStatus: 'Dana Ditahan (Escrow)',
    manipulationFlag: 'Aman',
  },
  {
    id: 'trx-02',
    orderCode: 'SP-7912',
    timestamp: 'Hari ini · 18.55 WIB',
    buyerName: 'Adit Suryanto',
    merchantName: 'Warung Makan Ibu Rini',
    itemTitle: 'Paket Keluarga Lauk Nusantara & Sambal Rumahan',
    quantity: 1,
    reportedNormalPrice: 115000,
    verifiedBaselinePrice: 85000,
    rescuePrice: 35000,
    reportedDiscountPercent: 70,
    realDiscountPercent: 59,
    totalPaid: 35000,
    paymentMethod: 'QRIS Terintegrasi',
    paymentGatewayRef: 'QRIS-BDG-20261110-7912',
    gatewayStatus: 'Dana Ditahan (Escrow)',
    manipulationFlag: 'Indikasi Markup Harga Normal',
    adminActionNote: 'Harga normal dinaikkan dari Rp 85.000 ke Rp 115.000 sebelum jam buka sore.',
  },
  {
    id: 'trx-03',
    orderCode: 'SP-7805',
    timestamp: 'Hari ini · 18.12 WIB',
    buyerName: 'Clara Nathania',
    merchantName: 'Kopi & Teh Senja Manis',
    itemTitle: 'Paket 3 Cup Boba Brown Sugar Fresh Milk & Thai Tea',
    quantity: 1,
    reportedNormalPrice: 72000,
    verifiedBaselinePrice: 72000,
    rescuePrice: 27000,
    reportedDiscountPercent: 63,
    realDiscountPercent: 63,
    totalPaid: 27000,
    paymentMethod: 'QRIS Terintegrasi',
    paymentGatewayRef: 'QRIS-BDG-20261110-7805',
    gatewayStatus: 'Dana Ditahan (Escrow)',
    manipulationFlag: 'Aman',
  },
  {
    id: 'trx-04',
    orderCode: 'SP-7109',
    timestamp: 'Kemarin · 19.15 WIB',
    buyerName: 'Nabil Rachman',
    merchantName: 'Kedai Klasik Nusantara',
    itemTitle: 'Bundel Jajanan Pasar Tradisional & Pastel Risoles Sore',
    quantity: 1,
    reportedNormalPrice: 65000,
    verifiedBaselinePrice: 65000,
    rescuePrice: 26000,
    reportedDiscountPercent: 60,
    realDiscountPercent: 60,
    totalPaid: 26000,
    paymentMethod: 'QRIS Terintegrasi',
    paymentGatewayRef: 'QRIS-BDG-20261109-7109',
    gatewayStatus: 'Selesai (Settled)',
    manipulationFlag: 'Aman',
  },
  {
    id: 'trx-05',
    orderCode: 'SP-6994',
    timestamp: '5 Nov 2026 · 19.45 WIB',
    buyerName: 'Rina Kartika',
    merchantName: 'Warung Ayam Geprek Malam Cicaheum',
    itemTitle: 'Paket 3 Box Ayam Geprek Sambal Korek',
    quantity: 1,
    reportedNormalPrice: 90000,
    verifiedBaselinePrice: 54000,
    rescuePrice: 33000,
    reportedDiscountPercent: 63,
    realDiscountPercent: 39,
    totalPaid: 33000,
    paymentMethod: 'VA Bank / E-Wallet',
    paymentGatewayRef: 'EWAL-BDG-20261105-6994',
    gatewayStatus: 'Refunded',
    manipulationFlag: 'Diskon Semu Terdeteksi',
    adminActionNote: 'Manipulasi harga normal (+66% di atas harga menu asli) & sengketa pembeli. Dana telah di-refund.',
  },
  {
    id: 'trx-06',
    orderCode: 'SP-6542',
    timestamp: '7 Nov 2026 · 18.50 WIB',
    buyerName: 'Nabil Rachman',
    merchantName: 'Bakso & Soto Pak Kumis',
    itemTitle: 'Paket 2 Porsi Bakso Urat Sapi & Bihun Kuah Kaldu Sumsum',
    quantity: 2,
    reportedNormalPrice: 64000,
    verifiedBaselinePrice: 64000,
    rescuePrice: 25000,
    reportedDiscountPercent: 61,
    realDiscountPercent: 61,
    totalPaid: 50000,
    paymentMethod: 'COD Kasir Mitra',
    paymentGatewayRef: 'COD-BDG-20261107-6542',
    gatewayStatus: 'Selesai (Settled)',
    manipulationFlag: 'Aman',
  },
];

export const INITIAL_DISCOUNT_HISTORY: DiscountHistoryEntry[] = [
  {
    id: 'dh-01',
    itemId: 'sp-10',
    itemTitle: 'Paket Keluarga Lauk Nusantara & Sambal Rumahan',
    merchantName: 'Warung Makan Ibu Rini',
    recordedDate: 'Hari ini · 16.00 WIB',
    historicalNormalPrice: 85000,
    submittedNormalPrice: 115000,
    rescuePrice: 35000,
    claimedDiscountPercent: 70,
    actualDiscountFromBaseline: 59,
    markupDeviationPercent: 35.3,
    status: 'Peringatan Manipulasi Harga',
  },
  {
    id: 'dh-02',
    itemId: 'sp-03',
    itemTitle: 'Bundel Jajanan Pasar Tradisional & Pastel Risoles Sore',
    merchantName: 'Kedai Klasik Nusantara',
    recordedDate: 'Kemarin · 15.30 WIB',
    historicalNormalPrice: 65000,
    submittedNormalPrice: 82000,
    rescuePrice: 26000,
    claimedDiscountPercent: 68,
    actualDiscountFromBaseline: 60,
    markupDeviationPercent: 26.1,
    status: 'Harga Dikoreksi Admin',
  },
  {
    id: 'dh-03',
    itemId: 'sp-01',
    itemTitle: 'Martabak Manis Keju Susu & Cokelat Kacang Loyang Tebal',
    merchantName: 'Martabak Legit Pak Darto',
    recordedDate: 'Hari ini · 17.00 WIB',
    historicalNormalPrice: 70000,
    submittedNormalPrice: 70000,
    rescuePrice: 28000,
    claimedDiscountPercent: 60,
    actualDiscountFromBaseline: 60,
    markupDeviationPercent: 0,
    status: 'Terverifikasi Wajar',
  },
  {
    id: 'dh-04',
    itemId: 'sp-05',
    itemTitle: 'Kotak Kejutan Artisan Croissant & Danish Sore',
    merchantName: 'Warung Roti Senja',
    recordedDate: 'Hari ini · 16.45 WIB',
    historicalNormalPrice: 90000,
    submittedNormalPrice: 90000,
    rescuePrice: 36000,
    claimedDiscountPercent: 60,
    actualDiscountFromBaseline: 60,
    markupDeviationPercent: 0,
    status: 'Terverifikasi Wajar',
  },
  {
    id: 'dh-05',
    itemId: 'sp-09',
    itemTitle: 'Kantong Roti Sourdough & Donat Kentang Kampung',
    merchantName: 'Sari Bakery Braga',
    recordedDate: 'Hari ini · 16.30 WIB',
    historicalNormalPrice: 64000,
    submittedNormalPrice: 64000,
    rescuePrice: 25000,
    claimedDiscountPercent: 61,
    actualDiscountFromBaseline: 61,
    markupDeviationPercent: 0,
    status: 'Terverifikasi Wajar',
  },
];

export const INITIAL_USER_ACCESS_LIST: UserAccessRecord[] = [
  {
    id: 'usr-01',
    name: 'Nabil Rachman',
    email: 'nabilrachman2008@gmail.com',
    phone: '081234567890',
    role: 'Admin',
    status: 'Aktif',
    district: 'Coblong (Dago / Dipatiukur)',
    joinedAt: '10 Jan 2026',
    lastActive: 'Sedang Online',
    violationCount: 0,
  },
  {
    id: 'usr-02',
    name: 'Ibu Sari Rahmawati (Sari Bakery Braga)',
    email: 'sari.bakery.braga@gmail.com',
    phone: '081122334455',
    role: 'UMKM',
    status: 'Aktif',
    district: 'Sumur Bandung (Braga)',
    joinedAt: '14 Feb 2026',
    lastActive: 'Hari ini · 19.20 WIB',
    violationCount: 0,
  },
  {
    id: 'usr-03',
    name: 'Bapak Sudarto (Martabak Legit Pak Darto)',
    email: 'pakdarto.martabak@yahoo.com',
    phone: '081394827162',
    role: 'UMKM',
    status: 'Aktif',
    district: 'Lengkong (Burangrang)',
    joinedAt: '20 Feb 2026',
    lastActive: 'Hari ini · 20.05 WIB',
    violationCount: 0,
  },
  {
    id: 'usr-04',
    name: 'Ibu Rini Wulandari (Warung Makan Ibu Rini)',
    email: 'rini.katering.du@gmail.com',
    phone: '081290876543',
    role: 'UMKM',
    status: 'Peringatan (Warning)',
    district: 'Coblong (Dago / Dipatiukur)',
    joinedAt: '12 Mei 2026',
    lastActive: 'Hari ini · 18.50 WIB',
    violationCount: 2,
    sanctionNote: 'Peringatan Ke-1: Laporan kesegaran sayur tumis & deviasi markup harga normal +35%.',
  },
  {
    id: 'usr-05',
    name: 'Deni Kurniawan (Warung Ayam Geprek Malam)',
    email: 'deni.geprek99@gmail.com',
    phone: '085721903847',
    role: 'UMKM',
    status: 'Suspended',
    district: 'Cicendo (Pasirkaliki)',
    joinedAt: '19 Agu 2026',
    lastActive: '5 Nov 2026',
    violationCount: 3,
    sanctionNote: 'Akun dibekukan (Suspended): Meminta pungutan tambahan di luar aplikasi & manipulasi diskon semu.',
  },
  {
    id: 'usr-06',
    name: 'Adit Suryanto',
    email: 'adit.suryanto@mahasiswa.itb.ac.id',
    phone: '081288391044',
    role: 'Buyer',
    status: 'Aktif',
    district: 'Coblong (Dago / Dipatiukur)',
    joinedAt: '03 Mar 2026',
    lastActive: 'Hari ini · 20.25 WIB',
    violationCount: 0,
  },
  {
    id: 'usr-07',
    name: 'Clara Nathania',
    email: 'clara.nathania@unpar.ac.id',
    phone: '081377482910',
    role: 'Buyer',
    status: 'Aktif',
    district: 'Sukasari (Setiabudi)',
    joinedAt: '15 Apr 2026',
    lastActive: 'Hari ini · 19.45 WIB',
    violationCount: 0,
  },
  {
    id: 'usr-08',
    name: 'Hendra Kusuma (Akun Buyer Fiktif)',
    email: 'hendra.spammer88@mail.com',
    phone: '089911223344',
    role: 'Buyer',
    status: 'Suspended',
    district: 'Buahbatu',
    joinedAt: '01 Nov 2026',
    lastActive: '03 Nov 2026',
    violationCount: 4,
    sanctionNote: 'Melakukan 4x pemesanan COD fiktif tanpa datang menjemput makanan di mitra UMKM.',
  },
];

export const MACRO_IMPACT_BY_PERIOD: Record<
  '7d' | '30d' | 'quarter' | 'all',
  MacroPeriodStats
> = {
  '7d': {
    periodLabel: '7 Hari Terakhir (4 – 10 Nov 2026)',
    totalPortionsRescued: 1248,
    totalTransactionsCompleted: 982,
    foodWastePreventedKg: 561.6,
    co2EmissionsSavedKg: 1404.0,
    waterSavedLiters: 449280,
    activeUmkmPartners: 42,
    totalUmkmApplications: 48,
    umkmRevenueRecovered: 34944000,
    citizenSavingsTotal: 52416000,
    districtStats: [
      {
        district: 'Coblong (Dago / Dipatiukur)',
        portionsRescued: 342,
        activeUmkm: 11,
        wasteReducedKg: 153.9,
        participationRate: 92,
      },
      {
        district: 'Sumur Bandung (Braga / Naripan)',
        portionsRescued: 268,
        activeUmkm: 8,
        wasteReducedKg: 120.6,
        participationRate: 88,
      },
      {
        district: 'Lengkong (Burangrang)',
        portionsRescued: 215,
        activeUmkm: 7,
        wasteReducedKg: 96.8,
        participationRate: 86,
      },
      {
        district: 'Bandung Wetan (Trunojoyo / Riau)',
        portionsRescued: 184,
        activeUmkm: 6,
        wasteReducedKg: 82.8,
        participationRate: 83,
      },
      {
        district: 'Buahbatu & Sukasari',
        portionsRescued: 239,
        activeUmkm: 10,
        wasteReducedKg: 107.5,
        participationRate: 79,
      },
    ],
    categoryImpact: [
      {
        category: 'Roti, Kue & Pastry',
        portionsRescued: 390,
        transactions: 312,
        co2SavedKg: 438.8,
        avgDiscountPercent: 61,
      },
      {
        category: 'Nasi, Lauk & Warung Makan',
        portionsRescued: 325,
        transactions: 260,
        co2SavedKg: 365.6,
        avgDiscountPercent: 58,
      },
      {
        category: 'Bakso, Soto & Bakmie',
        portionsRescued: 248,
        transactions: 195,
        co2SavedKg: 279.0,
        avgDiscountPercent: 61,
      },
      {
        category: 'Martabak & Jajanan Sore',
        portionsRescued: 185,
        transactions: 140,
        co2SavedKg: 208.1,
        avgDiscountPercent: 60,
      },
      {
        category: 'Minuman & Salad Segar',
        portionsRescued: 100,
        transactions: 75,
        co2SavedKg: 112.5,
        avgDiscountPercent: 62,
      },
    ],
    timelineData: [
      { label: 'Rab, 4 Nov', portions: 158, transactions: 124, wasteKg: 71.1 },
      { label: 'Kam, 5 Nov', portions: 165, transactions: 131, wasteKg: 74.2 },
      { label: 'Jum, 6 Nov', portions: 192, transactions: 152, wasteKg: 86.4 },
      { label: 'Sab, 7 Nov', portions: 214, transactions: 168, wasteKg: 96.3 },
      { label: 'Min, 8 Nov', portions: 189, transactions: 147, wasteKg: 85.0 },
      { label: 'Sen, 9 Nov', portions: 162, transactions: 128, wasteKg: 72.9 },
      { label: 'Sel, 10 Nov', portions: 168, transactions: 132, wasteKg: 75.7 },
    ],
  },
  '30d': {
    periodLabel: '30 Hari Terakhir (Oktober – November 2026)',
    totalPortionsRescued: 5420,
    totalTransactionsCompleted: 4190,
    foodWastePreventedKg: 2439.0,
    co2EmissionsSavedKg: 6097.5,
    waterSavedLiters: 1951200,
    activeUmkmPartners: 45,
    totalUmkmApplications: 54,
    umkmRevenueRecovered: 151760000,
    citizenSavingsTotal: 227640000,
    districtStats: [
      {
        district: 'Coblong (Dago / Dipatiukur)',
        portionsRescued: 1480,
        activeUmkm: 12,
        wasteReducedKg: 666.0,
        participationRate: 94,
      },
      {
        district: 'Sumur Bandung (Braga / Naripan)',
        portionsRescued: 1160,
        activeUmkm: 9,
        wasteReducedKg: 522.0,
        participationRate: 90,
      },
      {
        district: 'Lengkong (Burangrang)',
        portionsRescued: 940,
        activeUmkm: 8,
        wasteReducedKg: 423.0,
        participationRate: 87,
      },
      {
        district: 'Bandung Wetan (Trunojoyo / Riau)',
        portionsRescued: 810,
        activeUmkm: 6,
        wasteReducedKg: 364.5,
        participationRate: 85,
      },
      {
        district: 'Buahbatu & Sukasari',
        portionsRescued: 1030,
        activeUmkm: 10,
        wasteReducedKg: 463.5,
        participationRate: 81,
      },
    ],
    categoryImpact: [
      {
        category: 'Roti, Kue & Pastry',
        portionsRescued: 1680,
        transactions: 1310,
        co2SavedKg: 1890.0,
        avgDiscountPercent: 61,
      },
      {
        category: 'Nasi, Lauk & Warung Makan',
        portionsRescued: 1420,
        transactions: 1105,
        co2SavedKg: 1597.5,
        avgDiscountPercent: 58,
      },
      {
        category: 'Bakso, Soto & Bakmie',
        portionsRescued: 1090,
        transactions: 840,
        co2SavedKg: 1226.3,
        avgDiscountPercent: 61,
      },
      {
        category: 'Martabak & Jajanan Sore',
        portionsRescued: 790,
        transactions: 605,
        co2SavedKg: 888.7,
        avgDiscountPercent: 60,
      },
      {
        category: 'Minuman & Salad Segar',
        portionsRescued: 440,
        transactions: 330,
        co2SavedKg: 495.0,
        avgDiscountPercent: 62,
      },
    ],
    timelineData: [
      { label: 'Minggu 1 Okt', portions: 1210, transactions: 940, wasteKg: 544.5 },
      { label: 'Minggu 2 Okt', portions: 1340, transactions: 1035, wasteKg: 603.0 },
      { label: 'Minggu 3 Okt', portions: 1390, transactions: 1075, wasteKg: 625.5 },
      { label: 'Minggu 4 Okt – Nov', portions: 1480, transactions: 1140, wasteKg: 666.0 },
    ],
  },
  quarter: {
    periodLabel: 'Kuartal IV 2026 (Sep – Nov 2026)',
    totalPortionsRescued: 14890,
    totalTransactionsCompleted: 11420,
    foodWastePreventedKg: 6700.5,
    co2EmissionsSavedKg: 16751.2,
    waterSavedLiters: 5360400,
    activeUmkmPartners: 45,
    totalUmkmApplications: 58,
    umkmRevenueRecovered: 416920000,
    citizenSavingsTotal: 625380000,
    districtStats: [
      {
        district: 'Coblong (Dago / Dipatiukur)',
        portionsRescued: 4120,
        activeUmkm: 12,
        wasteReducedKg: 1854.0,
        participationRate: 95,
      },
      {
        district: 'Sumur Bandung (Braga / Naripan)',
        portionsRescued: 3190,
        activeUmkm: 9,
        wasteReducedKg: 1435.5,
        participationRate: 91,
      },
      {
        district: 'Lengkong (Burangrang)',
        portionsRescued: 2580,
        activeUmkm: 8,
        wasteReducedKg: 1161.0,
        participationRate: 88,
      },
      {
        district: 'Bandung Wetan (Trunojoyo / Riau)',
        portionsRescued: 2210,
        activeUmkm: 6,
        wasteReducedKg: 994.5,
        participationRate: 86,
      },
      {
        district: 'Buahbatu & Sukasari',
        portionsRescued: 2790,
        activeUmkm: 10,
        wasteReducedKg: 1255.5,
        participationRate: 82,
      },
    ],
    categoryImpact: [
      {
        category: 'Roti, Kue & Pastry',
        portionsRescued: 4610,
        transactions: 3540,
        co2SavedKg: 5186.2,
        avgDiscountPercent: 61,
      },
      {
        category: 'Nasi, Lauk & Warung Makan',
        portionsRescued: 3920,
        transactions: 3010,
        co2SavedKg: 4410.0,
        avgDiscountPercent: 58,
      },
      {
        category: 'Bakso, Soto & Bakmie',
        portionsRescued: 2980,
        transactions: 2290,
        co2SavedKg: 3352.5,
        avgDiscountPercent: 61,
      },
      {
        category: 'Martabak & Jajanan Sore',
        portionsRescued: 2170,
        transactions: 1650,
        co2SavedKg: 2441.3,
        avgDiscountPercent: 60,
      },
      {
        category: 'Minuman & Salad Segar',
        portionsRescued: 1210,
        transactions: 930,
        co2SavedKg: 1361.2,
        avgDiscountPercent: 62,
      },
    ],
    timelineData: [
      { label: 'September 2026', portions: 4520, transactions: 3480, wasteKg: 2034.0 },
      { label: 'Oktober 2026', portions: 5180, transactions: 3960, wasteKg: 2331.0 },
      { label: 'November 2026 (Berjalan)', portions: 5190, transactions: 3980, wasteKg: 2335.5 },
    ],
  },
  all: {
    periodLabel: 'Sepanjang Waktu (Januari – November 2026)',
    totalPortionsRescued: 15890,
    totalTransactionsCompleted: 12340,
    foodWastePreventedKg: 7150.5,
    co2EmissionsSavedKg: 17876.2,
    waterSavedLiters: 5720400,
    activeUmkmPartners: 45,
    totalUmkmApplications: 62,
    umkmRevenueRecovered: 444920000,
    citizenSavingsTotal: 667380000,
    districtStats: [
      {
        district: 'Coblong (Dago / Dipatiukur)',
        portionsRescued: 4460,
        activeUmkm: 12,
        wasteReducedKg: 2007.0,
        participationRate: 95,
      },
      {
        district: 'Sumur Bandung (Braga / Naripan)',
        portionsRescued: 3420,
        activeUmkm: 9,
        wasteReducedKg: 1539.0,
        participationRate: 91,
      },
      {
        district: 'Lengkong (Burangrang)',
        portionsRescued: 2740,
        activeUmkm: 8,
        wasteReducedKg: 1233.0,
        participationRate: 88,
      },
      {
        district: 'Bandung Wetan (Trunojoyo / Riau)',
        portionsRescued: 2350,
        activeUmkm: 6,
        wasteReducedKg: 1057.5,
        participationRate: 86,
      },
      {
        district: 'Buahbatu & Sukasari',
        portionsRescued: 2920,
        activeUmkm: 10,
        wasteReducedKg: 1314.0,
        participationRate: 83,
      },
    ],
    categoryImpact: [
      {
        category: 'Roti, Kue & Pastry',
        portionsRescued: 4920,
        transactions: 3810,
        co2SavedKg: 5535.0,
        avgDiscountPercent: 61,
      },
      {
        category: 'Nasi, Lauk & Warung Makan',
        portionsRescued: 4190,
        transactions: 3260,
        co2SavedKg: 4713.8,
        avgDiscountPercent: 58,
      },
      {
        category: 'Bakso, Soto & Bakmie',
        portionsRescued: 3180,
        transactions: 2470,
        co2SavedKg: 3577.5,
        avgDiscountPercent: 61,
      },
      {
        category: 'Martabak & Jajanan Sore',
        portionsRescued: 2310,
        transactions: 1790,
        co2SavedKg: 2598.7,
        avgDiscountPercent: 60,
      },
      {
        category: 'Minuman & Salad Segar',
        portionsRescued: 1290,
        transactions: 1010,
        co2SavedKg: 1451.2,
        avgDiscountPercent: 62,
      },
    ],
    timelineData: [
      { label: 'Q1 2026', portions: 2840, transactions: 2210, wasteKg: 1278.0 },
      { label: 'Q2 2026', portions: 3910, transactions: 3040, wasteKg: 1759.5 },
      { label: 'Q3 2026', portions: 4320, transactions: 3360, wasteKg: 1944.0 },
      { label: 'Q4 2026', portions: 4820, transactions: 3730, wasteKg: 2169.0 },
    ],
  },
};

export function mapComplaintToAdminDispute(c: ComplaintReport): AdminDisputeRecord {
  return {
    id: c.id,
    ticketCode: c.ticketCode,
    orderCode: c.orderCode || 'SP-8421',
    merchantName: c.merchantName,
    itemName: c.itemName,
    reporterName: c.reporterName,
    reporterPhone: '081234567890',
    category: c.category,
    description: c.description,
    evidenceFileName: c.evidenceFileName,
    createdAt: c.createdAt,
    amountPaid: 28000,
    severity:
      c.category === 'Kualitas / Kesegaran Kurang Baik'
        ? 'Kritis (Keamanan Pangan)'
        : c.category === 'Kendala Saat Pengambilan di Toko'
        ? 'Tinggi (Finansial/Serah Terima)'
        : 'Sedang (Kualitas/Porsi)',
    status:
      c.status === 'Selesai Ditindaklanjuti'
        ? 'Selesai (Refund Pembeli)'
        : 'Sedang Ditinjau',
  };
}
