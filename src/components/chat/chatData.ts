import { SellerConversation, BotQuickPrompt, ChatMessage } from './types';

export const INITIAL_SELLER_CONVERSATIONS: SellerConversation[] = [
  {
    id: 'conv-kala-bakehouse',
    merchantName: 'Kala Bakehouse & Artisan Cafe',
    merchantDistrict: 'Bandung Wetan (Riau / Progo)',
    merchantAddress: 'Jl. Progo No. 14, Citarum, Bandung Wetan',
    merchantAvatar: '/src/assets/images/sisapiring_pastry_1794322283457.jpg',
    isVerified: true,
    pickupWindow: '18:00 – 21:30 WIB',
    unreadCount: 1,
    lastMessage: 'Porsi Pastry Box sudah dikemas rapi dalam kotak food-grade, siap diambil jam 18:00 ya Kak!',
    lastMessageTime: '17:42',
    isOnline: true,
    activeOrderCode: 'SP-8821',
    messages: [
      {
        id: 'msg-1',
        sender: 'user',
        text: 'Halo Kak, untuk paket Pastry Box apakah rotinya masih renyah?',
        timestamp: '17:35',
        status: 'read',
      },
      {
        id: 'msg-2',
        sender: 'seller',
        text: 'Halo Kak! Betul sekali, batch panggang kami simpan di etalase bersuhu stabil. Kulit luarnya masih flaky dan butter-nya wangi sekali.',
        timestamp: '17:38',
        status: 'read',
      },
      {
        id: 'msg-3',
        sender: 'user',
        text: 'Baik, saya sudah pesan lewat aplikasi dengan kode #SP-8821. Nanti saya ambil sekitar jam 18:15 ya.',
        timestamp: '17:40',
        status: 'read',
      },
      {
        id: 'msg-4',
        sender: 'seller',
        text: 'Porsi Pastry Box sudah dikemas rapi dalam kotak food-grade, siap diambil jam 18:00 ya Kak! Cukup tunjukkan kode QR ke barista kami.',
        timestamp: '17:42',
        status: 'read',
        actionChips: [
          { label: 'Lihat Tiket QR Pesanan', action: 'view_order', payload: 'SP-8821' },
          { label: 'Petunjuk Arah Maps', action: 'maps' },
        ],
      },
    ],
  },
  {
    id: 'conv-martabak-darto',
    merchantName: 'Martabak Legit Pak Darto',
    merchantDistrict: 'Coblong (Dipatiukur)',
    merchantAddress: 'Jl. Dipatiukur No. 42, Coblong, Bandung',
    merchantAvatar: '/src/assets/images/cat_martabak_1794300332100.jpg',
    isVerified: true,
    pickupWindow: '19:00 – 22:30 WIB',
    unreadCount: 0,
    lastMessage: 'Siap Kak, nanti tinggal sebutkan nama pemesan saat tiba di gerai.',
    lastMessageTime: '16:20',
    isOnline: true,
    messages: [
      {
        id: 'msg-d1',
        sender: 'user',
        text: 'Sore Pak Darto, untuk martabak manis keju wijen apakah masih tersedia porsi sisa piring malam ini?',
        timestamp: '16:15',
        status: 'read',
      },
      {
        id: 'msg-d2',
        sender: 'seller',
        text: 'Sore Kak! Masih ada 4 loyang batch maghrib. Kami diskon 60% untuk selamatkan porsi sebelum jam 10 malam.',
        timestamp: '16:18',
        status: 'read',
      },
      {
        id: 'msg-d3',
        sender: 'seller',
        text: 'Siap Kak, nanti tinggal sebutkan nama pemesan saat tiba di gerai.',
        timestamp: '16:20',
        status: 'read',
      },
    ],
  },
  {
    id: 'conv-bakso-kumis',
    merchantName: 'Bakso & Soto Pak Kumis',
    merchantDistrict: 'Lengkong (Burangrang)',
    merchantAddress: 'Jl. Burangrang No. 28, Lengkong, Bandung',
    merchantAvatar: '/src/assets/images/cat_bakso_soto_1794300332564.jpg',
    isVerified: true,
    pickupWindow: '17:30 – 21:00 WIB',
    unreadCount: 0,
    lastMessage: 'Kuah dan sambal selalu kami pisahkan plastik tebal ya Kak.',
    lastMessageTime: 'Kemarin',
    isOnline: false,
    messages: [
      {
        id: 'msg-b1',
        sender: 'user',
        text: 'Halo Pak, apakah kuah baksonya bisa dipisah plastiknya?',
        timestamp: 'Kemarin 18:10',
        status: 'read',
      },
      {
        id: 'msg-b2',
        sender: 'seller',
        text: 'Kuah dan sambal selalu kami pisahkan plastik tebal ya Kak. Dijamin aman dan tidak bocor saat dibawa di motor.',
        timestamp: 'Kemarin 18:12',
        status: 'read',
      },
    ],
  },
  {
    id: 'conv-dapur-kapau',
    merchantName: 'Dapur Kapau Bukittinggi Asli',
    merchantDistrict: 'Coblong (Dago)',
    merchantAddress: 'Jl. Ir. H. Juanda No. 112, Dago, Bandung',
    merchantAvatar: '/src/assets/images/food_nasi_kapau_bowl_1794295653656.jpg',
    isVerified: true,
    pickupWindow: '18:30 – 21:30 WIB',
    unreadCount: 0,
    lastMessage: 'Santan rendang kami masak tanak matang, tahan disimpan hingga besok.',
    lastMessageTime: '10 Nov',
    isOnline: true,
    messages: [
      {
        id: 'msg-k1',
        sender: 'user',
        text: 'Halo uni, rendang dan gulai cincangnya masih segar untuk makan malam?',
        timestamp: '10 Nov 17:05',
        status: 'read',
      },
      {
        id: 'msg-k2',
        sender: 'seller',
        text: 'Santan rendang kami masak tanak matang, tahan disimpan hingga besok. Tinggal dihangatkan di teflon sebentar.',
        timestamp: '10 Nov 17:08',
        status: 'read',
      },
    ],
  },
];

export const SELLER_QUICK_QUESTIONS = [
  'Apakah pesanan saya sudah siap diambil?',
  'Saya tiba dalam 10 menit untuk ambil makanan.',
  'Bisa tolong pisahkan saus / sambal?',
  'Apakah kemasan aman untuk perjalanan naik motor?',
  'Apakah ada porsi sisa piring tambahan malam ini?',
  'Bisa tolong tambahkan sendok & alat makan ramah lingkungan?',
];

export const BOT_QUICK_PROMPTS: BotQuickPrompt[] = [
  {
    id: 'p-rekomendasi',
    title: 'Cari Makanan Hemat',
    subtitle: 'Rekomendasi di bawah Rp 25.000 di Bandung',
    icon: 'Soup',
    query: 'Rekomendasikan makanan sisa piring enak di bawah Rp 25.000 di Bandung',
  },
  {
    id: 'p-garansi',
    title: 'Garansi Refund 100%',
    subtitle: 'Bagaimana platform melindungi jika makanan basi?',
    icon: 'ShieldCheck',
    query: 'Bagaimana cara kerja garansi refund 100% jika makanan tidak segar?',
  },
  {
    id: 'p-tips-safety',
    title: 'Tips Hangatkan Makanan',
    subtitle: 'Panduan food safety & penyimpanan sisa piring',
    icon: 'Flame',
    query: 'Bagaimana tips memanaskan dan menyimpan makanan sisa piring agar tetap aman?',
  },
  {
    id: 'p-pickup',
    title: 'Alur Pengambilan (Pickup)',
    subtitle: 'Cara ambil pesanan dengan kode QR di gerai',
    icon: 'QrCode',
    query: 'Bagaimana cara mengambil pesanan sisa piring di gerai toko?',
  },
  {
    id: 'p-dampak',
    title: 'Dampak Lingkungan',
    subtitle: 'Berapa CO2e & air bersih yang dihemat?',
    icon: 'Leaf',
    query: 'Berapa dampak penyelamatan emisi CO2 dan air bersih per porsi makanan?',
  },
];

export const INITIAL_BOT_MESSAGES: ChatMessage[] = [
  {
    id: 'bot-welcome-1',
    sender: 'bot',
    text: `Halo! Saya **SisaPiring AI Assistant** 🤖🌱

Saya adalah asisten cerdas yang siap membantu Anda:
* 🍱 **Menemukan rekomendasi kuliner sisa piring** lezat & hemat di Kota Bandung.
* 🛡️ **Memandu garansi refund 100%** & keamanan dana rekening bersama (*Escrow*).
* 🍲 **Tips food safety**: Cara memanaskan, menyimpan, dan memeriksa kesegaran makanan.
* 🌿 **Menghitung jejak dampak lingkungan**: Berapa kg emisi karbon ($CO_2e$) & liter air bersih yang berhasil Anda selamatkan.

Silakan pilih topik di bawah atau ketik pertanyaan Anda!`,
    timestamp: 'Baru saja',
    actionChips: [
      { label: '🍲 Rekomendasi < 25rb', action: 'ask', payload: 'Rekomendasikan makanan di bawah 25rb' },
      { label: '📍 Kuliner Dago & Coblong', action: 'ask', payload: 'Menu sisa piring di Coblong' },
      { label: '🛡️ Cara Klaim Refund', action: 'ask', payload: 'Cara klaim garansi refund' },
      { label: '🔥 Tips Panaskan Makanan', action: 'ask', payload: 'Tips panaskan makanan' },
    ],
  },
];

