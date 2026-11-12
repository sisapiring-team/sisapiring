export type FoodCategory =
  | 'Semua'
  | 'Martabak'
  | 'Bakso & soto'
  | 'Jajanan'
  | 'Bakmie'
  | 'Roti'
  | 'Minuman'
  | 'Nasi & Lauk'
  | 'Sehat & Segar';

export interface CulinaryCategoryItem {
  id: Exclude<FoodCategory, 'Semua'>;
  label: string;
  imageUrl: string;
}

export const CULINARY_CATEGORIES: CulinaryCategoryItem[] = [
  {
    id: 'Martabak',
    label: 'Martabak',
    imageUrl: '/assets/images/cat_martabak_1794300332100.jpg',
  },
  {
    id: 'Bakso & soto',
    label: 'Bakso & soto',
    imageUrl: '/assets/images/cat_bakso_soto_1794300332564.jpg',
  },
  {
    id: 'Jajanan',
    label: 'Jajanan',
    imageUrl: '/assets/images/food_kopi_jajanan_pasar_1794295654124.jpg',
  },
  {
    id: 'Bakmie',
    label: 'Bakmie',
    imageUrl: '/assets/images/cat_bakmie_1794300333306.jpg',
  },
  {
    id: 'Roti',
    label: 'Roti',
    imageUrl: '/assets/images/food_artisan_pastry_box_1794295651168.jpg',
  },
  {
    id: 'Minuman',
    label: 'Minuman',
    imageUrl: '/assets/images/cat_minuman_es_1794300334138.jpg',
  },
  {
    id: 'Nasi & Lauk',
    label: 'Nasi & Lauk',
    imageUrl: '/assets/images/food_nasi_kapau_bowl_1794295653656.jpg',
  },
  {
    id: 'Sehat & Segar',
    label: 'Sehat & Segar',
    imageUrl: '/assets/images/food_healthy_salad_wrap_1794295654632.jpg',
  },
];

export type FoodTag =
  | 'Diskon ≥ 60%'
  | 'Di Bawah Rp 30rb'
  | 'Baru Matang'
  | 'Porsi Keluarga'
  | 'Stok Terakhir'
  | 'Bebas Pengawet'
  | 'Favorit Warga';

export const ALL_FOOD_TAGS: FoodTag[] = [
  'Diskon ≥ 60%',
  'Di Bawah Rp 30rb',
  'Baru Matang',
  'Porsi Keluarga',
  'Stok Terakhir',
  'Bebas Pengawet',
  'Favorit Warga',
];

export interface SisaPiringItem {
  id: string;
  title: string;
  merchantName: string;
  merchantOwner: string;
  merchantRole: string;
  category: Exclude<FoodCategory, 'Semua'>;
  city: string;
  district: string;
  address: string;
  distanceKm: number;
  originalPrice: number;
  rescuePrice: number;
  discountPercent: number;
  pickupWindow: string;
  pickupStartHour: number;
  remainingStock: number;
  initialQuota: number;
  freshBakedTime: string;
  rating: number;
  rescuedTotalCount: number;
  imageUrl: string;
  shortDescription: string;
  contentsList: string[];
  sisaPiringReason: string;
  dietaryNotes: string;
  storageTip: string;
  tags: FoodTag[];
}

export interface MerchantStory {
  id: string;
  ownerName: string;
  role: string;
  businessName: string;
  city: string;
  monthlyRecoveredRupiah: string;
  wasteReducedPercent: string;
  quote: string;
  beforeAfterSummary: string;
}

export const HERO_IMAGE_PATH = '/assets/images/hero_umkm_bakery_1794295650050.jpg';
export const PARTNER_PORTRAIT_PATH = '/assets/images/umkm_partner_portrait_1794295655906.jpg';

export const SISA_PIRING_CATALOG: SisaPiringItem[] = [
  {
    id: 'PRD-001',
    title: 'Artisan Butter Croissant & Pain au Chocolat (Paket 3 Pcs)',
    merchantName: 'Kala Bakehouse & Artisan Cafe',
    merchantOwner: 'Kang Ridwan Sasmita',
    merchantRole: 'Bakehouse Artisan Spesialis Viennoiserie',
    category: 'Roti',
    city: 'Bandung',
    district: 'Bandung Wetan',
    address: 'Jl. Progo No. 14, Citarum, Bandung Wetan, Bandung',
    distanceKm: 0.9,
    originalPrice: 65000,
    rescuePrice: 32500,
    discountPercent: 50,
    pickupWindow: '17:30 – 21:00 WIB',
    pickupStartHour: 17.5,
    remainingStock: 5,
    initialQuota: 10,
    freshBakedTime: 'Dipanggang 07.00 WIB',
    rating: 5.0,
    rescuedTotalCount: 420,
    imageUrl: '/assets/images/sisapiring_bakery_1794322284427.jpg',
    shortDescription:
      'Tiga pastry butter premium Prancis yang dipanggang pagi hari. Renyah di luar, lembut berlapis di dalam.',
    contentsList: [
      '2x Butter Croissant Premium Lapis Emas',
      '1x Pain au Chocolat dengan Cokelat Batang Belgia',
    ],
    sisaPiringReason:
      'Batch panggang pagi berlebih dari estimasi walk-in cafe, kualitas aroma dan rasa butter tetap prima.',
    dietaryNotes: '100% Halal MUI · Mengandung butter susu sapi, gandum, dan telur',
    storageTip: 'Panaskan di oven atau airfryer selama 3 menit suhu 160°C untuk kerenyahan maksimal.',
    tags: ['Baru Matang', 'Stok Terakhir', 'Favorit Warga'],
  },
  {
    id: 'PRD-002',
    title: 'Rustic Sourdough Loaf Gandum Utuh (Batch Pagi)',
    merchantName: 'Kala Bakehouse & Artisan Cafe',
    merchantOwner: 'Kang Ridwan Sasmita',
    merchantRole: 'Bakehouse Artisan Spesialis Viennoiserie',
    category: 'Roti',
    city: 'Bandung',
    district: 'Bandung Wetan',
    address: 'Jl. Progo No. 14, Citarum, Bandung Wetan, Bandung',
    distanceKm: 0.9,
    originalPrice: 70000,
    rescuePrice: 21000,
    discountPercent: 70,
    pickupWindow: '17:00 – 21:30 WIB',
    pickupStartHour: 17.0,
    remainingStock: 3,
    initialQuota: 8,
    freshBakedTime: 'Dipanggang 06.30 WIB',
    rating: 4.9,
    rescuedTotalCount: 280,
    imageUrl: '/assets/images/sisapiring_bakery_1794322284427.jpg',
    shortDescription:
      'Roti sourdough fermentasi alami 24 jam dengan tepung gandum utuh. Tanpa pengawet dan perasa buatan.',
    contentsList: [
      '1x Utuh Rustic Sourdough Loaf (Berat 650 gram)',
      'Dipotong rapi 12-14 slice siap konsumsi',
    ],
    sisaPiringReason:
      'Sisa pemanggangan pagi hari yang disiapkan untuk konsumsi sore/malam sebelum toko tutup.',
    dietaryNotes: 'Vegan Friendly · Fermentasi Alami · Rendah Gula',
    storageTip: 'Simpan di plastik kedap udara di suhu ruang atau bekukan irisan di freezer hingga 1 bulan.',
    tags: ['Diskon ≥ 60%', 'Bebas Pengawet', 'Favorit Warga'],
  },
  {
    id: 'PRD-003',
    title: 'Strawberry Cheesecake Slice & Chocolate Eclair Box',
    merchantName: 'Kala Bakehouse & Artisan Cafe',
    merchantOwner: 'Kang Ridwan Sasmita',
    merchantRole: 'Bakehouse Artisan Spesialis Viennoiserie',
    category: 'Jajanan',
    city: 'Bandung',
    district: 'Bandung Wetan',
    address: 'Jl. Progo No. 14, Citarum, Bandung Wetan, Bandung',
    distanceKm: 0.9,
    originalPrice: 85000,
    rescuePrice: 25500,
    discountPercent: 70,
    pickupWindow: '18:00 – 21:00 WIB',
    pickupStartHour: 18.0,
    remainingStock: 2,
    initialQuota: 6,
    freshBakedTime: 'Disiapkan 09.00 WIB',
    rating: 5.0,
    rescuedTotalCount: 310,
    imageUrl: '/assets/images/sisapiring_pastry_cake_1794322285409.jpg',
    shortDescription:
      'Kombinasi New York cheesecake lembut dengan topping stroberi Ciwidey segar dan eclair cokelat kaya rasa.',
    contentsList: [
      '1x Slice Creamy Strawberry Cheesecake',
      '2x Chocolate Pastry Cream Eclair',
    ],
    sisaPiringReason:
      'Produk chiller harian wajib dihabiskan sebelum batch baru besok pagi demi menjaga kesegaran.',
    dietaryNotes: 'Halal · Wajib disimpan di chiller / kulkas',
    storageTip: 'Simpan dalam chiller 2-6°C dan konsumsi dalam kurun waktu 24 jam.',
    tags: ['Diskon ≥ 60%', 'Di Bawah Rp 30rb', 'Stok Terakhir'],
  },
  {
    id: 'sp-01',
    title: 'Martabak Manis Keju Susu & Cokelat Kacang Loyang Tebal',
    merchantName: 'Martabak Legit Pak Darto',
    merchantOwner: 'Bapak Sudarto',
    merchantRole: 'UMKM Spesialis Martabak Sejak 2005',
    category: 'Martabak',
    city: 'Bandung',
    district: 'Lengkong',
    address: 'Jl. Burangrang No. 34, Lengkong, Bandung',
    distanceKm: 1.1,
    originalPrice: 70000,
    rescuePrice: 28000,
    discountPercent: 60,
    pickupWindow: '19:30 – 21:30 WIB',
    pickupStartHour: 19.5,
    remainingStock: 4,
    initialQuota: 9,
    freshBakedTime: 'Dipanggang 18.00 WIB',
    rating: 4.9,
    rescuedTotalCount: 1640,
    imageUrl: '/assets/images/cat_martabak_1794300332100.jpg',
    shortDescription:
      'Satu loyang penuh martabak manis bersarang lembut dengan parutan keju cheddar melimpah, susu kental manis, dan taburan cokelat kacang.',
    contentsList: [
      '1x Loyang Martabak Manis Kombinasi Keju Susu & Cokelat Kacang (8 potong tebal)',
      'Olesan mentega Wijsman harum saat masih hangat',
    ],
    sisaPiringReason:
      'Adonan fermentasi martabak malam ini dibuat berlebih untuk pesanan acara warga dan tidak dapat disimpan untuk keesokan hari.',
    dietaryNotes: '100% Halal · Mengandung telur, susu, keju, dan kacang',
    storageTip: 'Hangatkan di teflon tanpa minyak selama 2 menit agar pinggirannya kembali renyah.',
    tags: ['Diskon ≥ 60%', 'Di Bawah Rp 30rb', 'Baru Matang', 'Porsi Keluarga'],
  },
  {
    id: 'sp-02',
    title: 'Paket 2 Porsi Bakso Urat Sapi & Bihun Kuah Kaldu Sumsum',
    merchantName: 'Bakso & Soto Pak Kumis',
    merchantOwner: 'Bapak Slamet Riyadi',
    merchantRole: 'Warung Bakso & Soto Daging Asli',
    category: 'Bakso & soto',
    city: 'Bandung',
    district: 'Coblong',
    address: 'Jl. Hasanudin No. 19, Dago, Coblong, Bandung',
    distanceKm: 1.3,
    originalPrice: 64000,
    rescuePrice: 25000,
    discountPercent: 61,
    pickupWindow: '18:30 – 20:30 WIB',
    pickupStartHour: 18.5,
    remainingStock: 5,
    initialQuota: 12,
    freshBakedTime: 'Direbus 15.00 WIB',
    rating: 4.9,
    rescuedTotalCount: 1850,
    imageUrl: '/assets/images/cat_bakso_soto_1794300332564.jpg',
    shortDescription:
      'Dua porsi bakso urat daging sapi giling segar lengkap dengan mie kuning, bihun, tahu bakso, seledri, bawang goreng, dan kuah kaldu tulang.',
    contentsList: [
      '8x Butir Bakso Urat & Bakso Halus Daging Sapi Murni (2 Porsi)',
      '2x Bungkus Kuah Kaldu Sumsum Sapi Panas terpisah',
      'Mie Kuning, Bihun, Seledri, Bawang Goreng & Sambal Rawit Merah',
    ],
    sisaPiringReason:
      'Bakso digiling pagi hari tanpa bahan pengenyal buatan (boraks/pengawet) sehingga wajib habis terjual setiap malam.',
    dietaryNotes: '100% Halal · Daging Sapi Segar Tanpa Pengawet',
    storageTip: 'Didihkan kembali kuah kaldu sebelum dituang ke mangkok bakso.',
    tags: ['Diskon ≥ 60%', 'Di Bawah Rp 30rb', 'Bebas Pengawet', 'Favorit Warga'],
  },
  {
    id: 'sp-03',
    title: 'Bundel Jajanan Pasar Tradisional & Pastel Risoles Sore',
    merchantName: 'Kedai Klasik Nusantara',
    merchantOwner: 'Kang Dedi Permana',
    merchantRole: 'Kafe & Kudapan Tradisional',
    category: 'Jajanan',
    city: 'Bandung',
    district: 'Citarum',
    address: 'Jl. Cilaki No. 27, Citarum, Bandung',
    distanceKm: 0.9,
    originalPrice: 65000,
    rescuePrice: 26000,
    discountPercent: 60,
    pickupWindow: '17:30 – 19:30 WIB',
    pickupStartHour: 17.5,
    remainingStock: 3,
    initialQuota: 8,
    freshBakedTime: 'Dibuat 13.00 WIB',
    rating: 4.8,
    rescuedTotalCount: 960,
    imageUrl: '/assets/images/food_kopi_jajanan_pasar_1794295654124.jpg',
    shortDescription:
      'Kotak kudapan sore berisi klepon pandan gula merah lumer, kue lumpur kentang kismis, risoles ragout ayam, dan pastel sayur.',
    contentsList: [
      '4x Butir Klepon Pandan Gula Merah kelapa parut segar',
      '3x Kue Lumpur Kentang Kismis lembut',
      '3x Risoles Ragout Ayam & Pastel Telur Bumbu Kari',
    ],
    sisaPiringReason:
      'Kue basah tradisional dibuat tanpa bahan pengawet dan tidak dapat dijual kembali esok hari.',
    dietaryNotes: 'Halal · Mengandung susu, telur, dan kelapa segar',
    storageTip: 'Kue basah sebaiknya dikonsumsi sebelum pukul 22.00 WIB.',
    tags: ['Diskon ≥ 60%', 'Di Bawah Rp 30rb', 'Stok Terakhir', 'Bebas Pengawet'],
  },
  {
    id: 'sp-04',
    title: 'Paket 2 Porsi Yamin Manis Ayam Jamur & Pangsit Goreng',
    merchantName: 'Bakmie Tjap Keluarga',
    merchantOwner: 'Ko Hendri Tan',
    merchantRole: 'Kedai Mie Telur Rumahan Halal',
    category: 'Bakmie',
    city: 'Bandung',
    district: 'Sumur Bandung',
    address: 'Jl. Braga No. 58, Sumur Bandung, Bandung',
    distanceKm: 1.6,
    originalPrice: 76000,
    rescuePrice: 30000,
    discountPercent: 61,
    pickupWindow: '18:30 – 20:30 WIB',
    pickupStartHour: 18.5,
    remainingStock: 4,
    initialQuota: 10,
    freshBakedTime: 'Digiling 11.00 WIB',
    rating: 4.9,
    rescuedTotalCount: 1490,
    imageUrl: '/assets/images/cat_bakmie_1794300333306.jpg',
    shortDescription:
      'Dua porsi mie yamin telur kenyal buatan sendiri khas Bandung dengan topping ayam cincang jamur kecap, sawi hijau segar, pangsit goreng, dan kuah kaldu.',
    contentsList: [
      '2x Porsi Bakmie Yamin Telur Segar (bisa pilih sudah direbus atau mentah siap rebus)',
      '2x Cup Topping Ayam Jamur Kecap Gurih & Minyak Bawang',
      '4x Pangsit Goreng Ayam Udang & Kuah Kaldu Daun Bawang',
    ],
    sisaPiringReason:
      'Mie telur dibuat setiap pagi menggunakan telur bebek dan ayam segar tanpa pewarna maupun pengawet.',
    dietaryNotes: '100% Halal · No Pork No Lard · Bebas Pengawet',
    storageTip: 'Jika belum langsung dimakan, minta varian mie mentah yang tahan 2 hari di kulkas.',
    tags: ['Diskon ≥ 60%', 'Di Bawah Rp 30rb', 'Favorit Warga', 'Bebas Pengawet'],
  },
  {
    id: 'sp-05',
    title: 'Kotak Kejutan Artisan Croissant & Danish Sore',
    merchantName: 'Warung Roti Senja',
    merchantOwner: 'Ibu Siti Aminah',
    merchantRole: 'Bakery & Patisserie Lokal',
    category: 'Roti',
    city: 'Bandung',
    district: 'Bandung Wetan',
    address: 'Jl. Trunojoyo No. 18, Bandung Wetan, Bandung',
    distanceKm: 1.2,
    originalPrice: 90000,
    rescuePrice: 36000,
    discountPercent: 60,
    pickupWindow: '18:30 – 20:30 WIB',
    pickupStartHour: 18.5,
    remainingStock: 4,
    initialQuota: 10,
    freshBakedTime: 'Dipanggang 06.30 WIB',
    rating: 4.9,
    rescuedTotalCount: 1420,
    imageUrl: '/assets/images/food_artisan_pastry_box_1794295651168.jpg',
    shortDescription:
      'Berisi 4–5 potong pastry panggang pagi ini (Butter Croissant, Pain au Chocolat, dan Cheese Danish) yang masih renyah dan harum mentega.',
    contentsList: [
      '2x French Butter Croissant panggangan pagi',
      '1x Pain au Chocolat cokelat Belgia',
      '2x Cream Cheese Danish / Cinnamon Roll (sesuai ketersediaan etalase sore)',
    ],
    sisaPiringReason:
      'Warung Roti Senja menerapkan standar pemanggangan harian tanpa menyimpan pastry semalaman. Seluruh kue dipanggang pukul 06.30 WIB dan wajib habis pada hari yang sama.',
    dietaryNotes: 'Halal · Mengandung gandum, telur, dan produk susu',
    storageTip: 'Hangatkan kembali di oven atau air fryer suhu 160°C selama 3 menit untuk mengembalikan tekstur renyah berlapis.',
    tags: ['Diskon ≥ 60%', 'Favorit Warga', 'Bebas Pengawet'],
  },
  {
    id: 'sp-06',
    title: 'Paket 3 Cup Boba Brown Sugar Fresh Milk & Thai Tea',
    merchantName: 'Kopi & Teh Senja Manis',
    merchantOwner: 'Kak Raka Pratama',
    merchantRole: 'Kedai Minuman Segar & Kopi Susu',
    category: 'Minuman',
    city: 'Bandung',
    district: 'Buahbatu',
    address: 'Jl. Buah Batu No. 142, Buahbatu, Bandung',
    distanceKm: 2.1,
    originalPrice: 72000,
    rescuePrice: 27000,
    discountPercent: 63,
    pickupWindow: '18:00 – 20:00 WIB',
    pickupStartHour: 18.0,
    remainingStock: 6,
    initialQuota: 12,
    freshBakedTime: 'Diseduh 16.00 WIB',
    rating: 4.8,
    rescuedTotalCount: 1120,
    imageUrl: '/assets/images/cat_minuman_es_1794300334138.jpg',
    shortDescription:
      'Bundel hemat 3 minuman ukuran reguler berisi 2 Brown Sugar Boba Fresh Milk susu Lembang dan 1 Authentic Iced Thai Tea dengan boba kenyal.',
    contentsList: [
      '2x Cup Brown Sugar Boba Fresh Milk (boba dimasak sore ini)',
      '1x Cup Iced Creamy Thai Tea 16oz (es terpisah agar tidak cair)',
    ],
    sisaPiringReason:
      'Boba mutiara tapioka yang sudah dimasak sore hari hanya bertahan kenyal selama 5 jam dan tidak dapat disimpan hingga besok.',
    dietaryNotes: '100% Halal · Susu Sapi Lembang Segar Pasteurisasi',
    storageTip: 'Kocok sebelum diminum; tahan hingga 24 jam di dalam kulkas.',
    tags: ['Diskon ≥ 60%', 'Di Bawah Rp 30rb', 'Baru Matang', 'Favorit Warga'],
  },
  {
    id: 'sp-07',
    title: 'Paket Mangkok Nasi Kapau & Rendang Daging Sapi',
    merchantName: 'Dapur Kapau Bukittinggi Asli',
    merchantOwner: 'Bapak Hendra Wijaya',
    merchantRole: 'Rumah Makan Minang UMKM',
    category: 'Nasi & Lauk',
    city: 'Bandung',
    district: 'Cicendo',
    address: 'Jl. Pasirkaliki No. 84, Cicendo, Bandung',
    distanceKm: 2.4,
    originalPrice: 68000,
    rescuePrice: 29000,
    discountPercent: 57,
    pickupWindow: '19:00 – 21:00 WIB',
    pickupStartHour: 19.0,
    remainingStock: 6,
    initialQuota: 12,
    freshBakedTime: 'Dimasak 11.30 WIB',
    rating: 4.9,
    rescuedTotalCount: 2180,
    imageUrl: '/assets/images/food_nasi_kapau_bowl_1794295653656.jpg',
    shortDescription:
      'Porsi lengkap nasi putih hangat dengan potongan daging rendang empuk, gulai nangka muda, daun singkong rebus, dan sambal lado hijau segar.',
    contentsList: [
      '1x Porsi Nasi Putih beras Solok pilihan',
      '2x Potong Daging Sapi Rendang bumbu rempah dimasak 6 jam',
      'Gulai Nangka Muda, Daun Singkong, dan Sambal Lado Hijau terpisah',
    ],
    sisaPiringReason:
      'Dimasak pada sesi makan siang pukul 11.30 WIB. Porsi berlebih menjelang tutup warung dikemas higienis dalam wadah kraft food-grade agar tidak terbuang.',
    dietaryNotes: '100% Halal · Bebas pengawet buatan',
    storageTip: 'Dapat langsung disantap malam ini atau disimpan di kulkas tertutup hingga 24 jam (pisahkan sambal).',
    tags: ['Di Bawah Rp 30rb', 'Favorit Warga', 'Bebas Pengawet'],
  },
  {
    id: 'sp-08',
    title: 'Paket Sehat Chicken Caesar Wrap, Grain Bowl & Cold-Pressed',
    merchantName: 'Kebun Segar Salad Bar',
    merchantOwner: 'Kak Nadia Kusuma',
    merchantRole: 'Dapur Sehat & Jus Murni',
    category: 'Sehat & Segar',
    city: 'Bandung',
    district: 'Sukasari',
    address: 'Jl. Setiabudi No. 112, Sukasari, Bandung',
    distanceKm: 1.8,
    originalPrice: 110000,
    rescuePrice: 44000,
    discountPercent: 60,
    pickupWindow: '18:00 – 20:00 WIB',
    pickupStartHour: 18.0,
    remainingStock: 5,
    initialQuota: 9,
    freshBakedTime: 'Diracik 10.00 WIB',
    rating: 4.9,
    rescuedTotalCount: 1310,
    imageUrl: '/assets/images/food_healthy_salad_wrap_1794295654632.jpg',
    shortDescription:
      'Kombinasi tortilla gandum ayam panggang, semangkuk quinoa sayur panggang Lembang, dan 1 botol jus cold-pressed mangga-nanas murni tanpa gula.',
    contentsList: [
      '2x Potong Whole-Wheat Roasted Chicken Wrap dengan saus terpisah',
      '1x Mangkok Quinoa, Ubi Panggang, Jagung Manis, dan Kacang Hitam',
      '1x Botol Cold-Pressed Tropical Glow (Mangga, Nanas, Markisa 250ml)',
    ],
    sisaPiringReason:
      'Sayuran hidroponik Lembang dan buah peras dingin disiapkan setiap pagi. Demi menjaga kerenyahan daun selada, stok sore dijual hemat 60%.',
    dietaryNotes: 'Halal · Rendah Kalori · Tanpa Gula Tambahan',
    storageTip: 'Simpan pada suhu dingin 4°C dan tuang saus dressing sesaat sebelum dikonsumsi.',
    tags: ['Diskon ≥ 60%', 'Bebas Pengawet', 'Favorit Warga'],
  },
  {
    id: 'sp-09',
    title: 'Kantong Roti Sourdough & Donat Kentang Kampung',
    merchantName: 'Sari Bakery Braga',
    merchantOwner: 'Ibu Sari Rahmawati',
    merchantRole: 'Toko Roti Keluarga Sejak 1998',
    category: 'Roti',
    city: 'Bandung',
    district: 'Sumur Bandung',
    address: 'Jl. Naripan No. 45, Sumur Bandung, Bandung',
    distanceKm: 1.4,
    originalPrice: 64000,
    rescuePrice: 25000,
    discountPercent: 61,
    pickupWindow: '18:00 – 20:00 WIB',
    pickupStartHour: 18.0,
    remainingStock: 7,
    initialQuota: 15,
    freshBakedTime: 'Dipanggang 07.00 WIB',
    rating: 5.0,
    rescuedTotalCount: 3040,
    imageUrl: '/assets/images/umkm_partner_portrait_1794295655906.jpg',
    shortDescription:
      'Kantong kejutan berisi 1 loaf sourdough gandum utuh ukuran medium serta 4 donat kentang klasik dan roti manis isi cokelat keju.',
    contentsList: [
      '1x Country Sourdough Loaf ukuran medium (iris siap panggang)',
      '2x Donat Kentang Gula Halus / Cokelat Meses',
      '2x Roti Manis Klasik (Cokelat Keju / Srikaya Pandan)',
    ],
    sisaPiringReason:
      'Kelebihan kuota produksi harian dari pesanan katering pagi yang selalu dilebihkan 10% sebagai cadangan kualitas.',
    dietaryNotes: '100% Halal · Ragi Alami tanpa pelembut sintetis',
    storageTip: 'Roti sourdough tahan hingga 3 hari di suhu ruang atau 2 minggu di dalam freezer.',
    tags: ['Diskon ≥ 60%', 'Di Bawah Rp 30rb', 'Favorit Warga', 'Bebas Pengawet'],
  },
  {
    id: 'sp-10',
    title: 'Paket Keluarga Lauk Nusantara & Sambal Rumahan',
    merchantName: 'Warung Makan Ibu Rini',
    merchantOwner: 'Ibu Rini Wulandari',
    merchantRole: 'Katering & Warung Rumahan',
    category: 'Nasi & Lauk',
    city: 'Bandung',
    district: 'Coblong',
    address: 'Jl. Dipatiukur No. 88, Coblong, Bandung',
    distanceKm: 1.5,
    originalPrice: 85000,
    rescuePrice: 35000,
    discountPercent: 59,
    pickupWindow: '18:30 – 20:30 WIB',
    pickupStartHour: 18.5,
    remainingStock: 2,
    initialQuota: 10,
    freshBakedTime: 'Dimasak 14.00 WIB',
    rating: 4.8,
    rescuedTotalCount: 890,
    imageUrl: '/assets/images/food_nasi_kapau_bowl_1794295653656.jpg',
    shortDescription:
      'Porsi cukup untuk 2–3 orang berisi empal daging bumbu ketumbar, tahu tempe bacem, tumis buncis teri, dan dua porsi nasi hangat.',
    contentsList: [
      '2x Porsi Nasi Putih hangat',
      '3x Potong Empal Gepuk Daging Sapi & Tahu Tempe Bacem',
      '1x Kotak Sayur Tumis Harian dan Sambal Bajak',
    ],
    sisaPiringReason:
      'Menu prasmanan sore yang baru dimasak pukul 14.00 WIB dan dikemas rapat sebelum warung tutup pukul 20.30 WIB.',
    dietaryNotes: '100% Halal · Masakan rumahan rendah minyak',
    storageTip: 'Panaskan sebentar di kukusan atau teflon sebelum disajikan bersama keluarga.',
    tags: ['Porsi Keluarga', 'Baru Matang', 'Stok Terakhir'],
  },
];

export const MERCHANT_STORIES: MerchantStory[] = [
  {
    id: 'ms-0',
    ownerName: 'Kang Ridwan Sasmita',
    role: 'Founder & Head Baker',
    businessName: 'Kala Bakehouse & Artisan Cafe',
    city: 'Bandung',
    monthlyRecoveredRupiah: 'Rp 8,4 Juta / bulan',
    wasteReducedPercent: '96% Penyelamatan Viennoiserie',
    quote:
      'Sebagai artisan bakery di Progo Bandung, kami menolak kompromi mutu butter dan ragi alami. Berkat SisaPiring, batch pastry sore kami habis terselamatkan warga sekitar tanpa pernah masuk tempat sampah, dan margin operasional kami terlindungi.',
    beforeAfterSummary:
      'Sebelum bermitra: Rata-rata 15-20 pastry butter tersisa per malam. Sesudah bermitra: 96% terselamatkan via rescue deals dan verifikasi QR instan.',
  },
  {
    id: 'ms-1',
    ownerName: 'Ibu Sari Rahmawati',
    role: 'Pemilik Generasi Kedua',
    businessName: 'Sari Bakery Braga',
    city: 'Bandung',
    monthlyRecoveredRupiah: 'Rp 6,8 Juta / bulan',
    wasteReducedPercent: '94% Pengurangan Sisa Roti',
    quote:
      'Dulu setiap jam delapan malam hati saya selalu berat melihat belasan roti sehat harus disingkirkan karena aturan toko kami wajib fresh setiap pagi. Lewat SisaPiring, mahasiswa dan keluarga sekitar Braga datang menjemput paket sore dengan gembira, dan biaya bahan baku kami kembali utuh.',
    beforeAfterSummary:
      'Sebelum bergabung: rata-rata 18 potong roti tidak terjual per malam. Setelah 4 bulan di SisaPiring: 94% stok sore terjual habis dalam 45 menit sejak jendela penyelamatan dibuka.',
  },
  {
    id: 'ms-2',
    ownerName: 'Hendra Wijaya',
    role: 'Pendiri & Kepala Dapur',
    businessName: 'Dapur Kapau Bukittinggi Asli',
    city: 'Bandung',
    monthlyRecoveredRupiah: 'Rp 9,4 Juta / bulan',
    wasteReducedPercent: '480 Porsi Terselamatkan / bulan',
    quote:
      'Masakan bersantan dan rendang kami dimasak berjam-jam dengan rempah pilihan. Menjual porsi berlebih di jam tutup lewat SisaPiring bukan sekadar menyelamatkan modal dapur, tapi mengenalkan rasa masakan kami ke warga Bandung baru yang esok siangnya kembali beli harga normal.',
    beforeAfterSummary:
      'Sebelum bergabung: kerugian lauk sisa mencapai Rp 300.000 per hari. Setelah bergabung: mendatangkan 120+ pelanggan baru per bulan dengan arus kas sore yang stabil.',
  },
];

export interface StoreReview {
  id: string;
  merchantName: string;
  reviewerName: string;
  rating: number;
  date: string;
  itemName: string;
  comment: string;
  tags: string[];
}

export interface ComplaintReport {
  id: string;
  ticketCode: string;
  orderCode?: string;
  merchantName: string;
  itemName: string;
  reporterName: string;
  category:
    | 'Makanan Tidak Sesuai Deskripsi'
    | 'Kualitas / Kesegaran Kurang Baik'
    | 'Porsi Tidak Sesuai Ketentuan'
    | 'Kendala Saat Pengambilan di Toko';
  description: string;
  evidenceFileName?: string;
  createdAt: string;
  status: 'Sedang Ditinjau' | 'Selesai Ditindaklanjuti';
}

export const INITIAL_STORE_REVIEWS: StoreReview[] = [
  {
    id: 'rev-1',
    merchantName: 'Martabak Legit Pak Darto',
    reviewerName: 'Rizky Pratama',
    rating: 5,
    date: 'Hari ini · 20.15 WIB',
    itemName: 'Martabak Manis Keju Susu & Cokelat Kacang Loyang Tebal',
    comment:
      'Martabaknya masih hangat banget pas diambil jam 8 malam di Jl. Burangrang. Keju dan cokelatnya tebal sesuai deskripsi, hemat 60% rasa bintang lima!',
    tags: ['Sesuai Deskripsi', 'Masih Hangat & Segar', 'Porsi Melimpah'],
  },
  {
    id: 'rev-2',
    merchantName: 'Martabak Legit Pak Darto',
    reviewerName: 'Anisa Maharani',
    rating: 5,
    date: 'Kemarin · 20.40 WIB',
    itemName: 'Martabak Manis Keju Susu & Cokelat Kacang Loyang Tebal',
    comment:
      'Pak Darto ramah sekali waktu saya tunjukkan kode tiket SisaPiring. Adonan martabaknya lembut bersarang.',
    tags: ['Pelayanan Ramah', 'Sesuai Deskripsi'],
  },
  {
    id: 'rev-3',
    merchantName: 'Bakso & Soto Pak Kumis',
    reviewerName: 'Dimas Setiawan',
    rating: 5,
    date: 'Kemarin · 19.30 WIB',
    itemName: 'Paket 2 Porsi Bakso Urat Sapi & Bihun Kuah Kaldu Sumsum',
    comment:
      'Kuah kaldunya dipisah dalam plastik tahan panas dan bakso uratnya benar-benar daging sapi asli. Porsi 2 orang kenyang banget.',
    tags: ['Sesuai Deskripsi', 'Kemasan Rapi & Higienis', 'Porsi Melimpah'],
  },
  {
    id: 'rev-4',
    merchantName: 'Kedai Klasik Nusantara',
    reviewerName: 'Nabil Rachman',
    rating: 5,
    date: 'Kemarin · 18.45 WIB',
    itemName: 'Bundel Jajanan Pasar Tradisional & Pastel Risoles Sore',
    comment:
      'Klepon dan risoles ragout ayamnya masih segar semua, cocok buat teman ngopi sore di rumah.',
    tags: ['Sesuai Deskripsi', 'Masih Hangat & Segar'],
  },
  {
    id: 'rev-5',
    merchantName: 'Warung Roti Senja',
    reviewerName: 'Salsabila Putri',
    rating: 5,
    date: '2 hari lalu',
    itemName: 'Kotak Kejutan Artisan Croissant & Danish Sore',
    comment:
      'Dapat 2 butter croissant, 1 pain au chocolat, dan 2 cheese danish. Dipanggang ulang 3 menit di air fryer langsung renyah seperti baru keluar oven!',
    tags: ['Sesuai Deskripsi', 'Kualitas Terjaga', 'Kemasan Rapi & Higienis'],
  },
  {
    id: 'rev-6',
    merchantName: 'Sari Bakery Braga',
    reviewerName: 'Fajar Nugroho',
    rating: 5,
    date: '3 hari lalu',
    itemName: 'Kantong Roti Sourdough & Donat Kentang Kampung',
    comment:
      'Sourdough-nya empuk dan donat kentangnya favorit keluarga. Ibu Sari sangat ramah melayani pengambilan paket sore.',
    tags: ['Sesuai Deskripsi', 'Pelayanan Ramah', 'Porsi Melimpah'],
  },
];

export function formatRupiah(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}
