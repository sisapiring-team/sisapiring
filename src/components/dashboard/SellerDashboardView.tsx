import React, { useState } from 'react';
import {
  UtensilsCrossed,
  ShoppingBag,
  TrendingUp,
  Leaf,
  Clock,
  AlertTriangle,
  ArrowRight,
  Plus,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  QrCode,
  MapPin,
  HeartHandshake,
  ArrowUpRight,
  PackageCheck,
  FileCheck,
  Layers,
  ChevronRight,
  Store,
  Calendar,
} from 'lucide-react';
import { OrderStatus, SisaPiringProduct } from '../../types/seller';
import { formatRupiah, calculateCO2Saved } from '../../utils/formatters';
import { useApp } from '../../context/AppContext';

export const SellerDashboardView: React.FC = () => {
  const {
    sellerProfile,
    updateSellerProfile,
    products,
    orders,
    setActiveTab,
    navigateToOrdersWithFilter,
    setIsAddProductModalOpen,
    setIsVerificationModalOpen,
    setIsFoodSafetyModalOpen,
    updateStock,
    showToast,
  } = useApp();

  // Time filter for revenue chart
  const [revenuePeriod, setRevenuePeriod] = useState<'7d' | '30d' | '90d'>('7d');
  const [activeChartPoint, setActiveChartPoint] = useState<{
    date: string;
    revenue: number;
    ordersCount: number;
  } | null>(null);

  // Performance tab: 'best_selling' | 'low_stock' | 'expiring_soon'
  const [performanceTab, setPerformanceTab] = useState<'best_selling' | 'low_stock' | 'expiring_soon'>(
    'best_selling'
  );

  // Calculate dynamic greeting based on WIB current hour
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 11) return 'Selamat Pagi';
    if (hour < 15) return 'Selamat Siang';
    if (hour < 18) return 'Selamat Sore';
    return 'Selamat Malam';
  };

  // Metrics calculation from actual application state
  const totalProductsCount = products.length;
  const activeProducts = products.filter((p) => p.isActive && p.stock > 0);
  const activeProductsCount = activeProducts.length;

  const waitingOrders = orders.filter((o) => o.status === 'waiting_confirmation');
  const confirmedOrders = orders.filter((o) => o.status === 'confirmed');
  const readyOrders = orders.filter((o) => o.status === 'ready_for_pickup');
  const completedOrders = orders.filter((o) => o.status === 'completed');

  const totalRevenue = completedOrders.reduce((acc, o) => acc + o.totalPayment, 0);
  const totalPortionsRescued = products.reduce((acc, p) => acc + p.portionsRescuedCount, 0);

  // Donated count (products with 100% discount rescued)
  const donatedCount = products
    .filter((p) => p.discountPercentage === 100)
    .reduce((acc, p) => acc + p.portionsRescuedCount, 0);

  // Filtered lists for performance
  const bestSellingProducts = [...products].sort((a, b) => b.portionsRescuedCount - a.portionsRescuedCount);
  const lowStockProducts = products.filter((p) => p.isActive && p.stock <= 3);
  const expiringProducts = products.filter((p) => p.isActive && p.stock > 0 && p.discountPercentage >= 70);

  // Revenue chart dataset per period (Solid colors only)
  const chartDatasets: Record<
    '7d' | '30d' | '90d',
    { date: string; shortDate: string; revenue: number; ordersCount: number }[]
  > = {
    '7d': [
      { date: '04 Nov 2026', shortDate: 'Rab', revenue: 165000, ordersCount: 5 },
      { date: '05 Nov 2026', shortDate: 'Kam', revenue: 195000, ordersCount: 7 },
      { date: '06 Nov 2026', shortDate: 'Jum', revenue: 280000, ordersCount: 11 },
      { date: '07 Nov 2026', shortDate: 'Sab', revenue: 390000, ordersCount: 15 },
      { date: '08 Nov 2026', shortDate: 'Min', revenue: 420000, ordersCount: 17 },
      { date: '09 Nov 2026', shortDate: 'Sen', revenue: 210000, ordersCount: 8 },
      { date: '10 Nov 2026 (Hari Ini)', shortDate: 'Sel', revenue: totalRevenue > 0 ? totalRevenue : 340000, ordersCount: completedOrders.length > 0 ? completedOrders.length : 12 },
    ],
    '30d': [
      { date: 'Minggu 1', shortDate: 'M1', revenue: 1250000, ordersCount: 42 },
      { date: 'Minggu 2', shortDate: 'M2', revenue: 1480000, ordersCount: 54 },
      { date: 'Minggu 3', shortDate: 'M3', revenue: 1820000, ordersCount: 68 },
      { date: 'Minggu 4', shortDate: 'M4', revenue: 2150000, ordersCount: 81 },
    ],
    '90d': [
      { date: 'September 2026', shortDate: 'Sep', revenue: 5400000, ordersCount: 210 },
      { date: 'Oktober 2026', shortDate: 'Okt', revenue: 6850000, ordersCount: 265 },
      { date: 'November 2026 (Berjalan)', shortDate: 'Nov', revenue: 7420000, ordersCount: 290 },
    ],
  };

  const currentChartData = chartDatasets[revenuePeriod];
  const maxChartRevenue = Math.max(...currentChartData.map((d) => d.revenue));

  // Recent Activity Feed based on live orders and product data
  const recentActivities = [
    ...(waitingOrders.length > 0
      ? [
          {
            id: 'act-1',
            type: 'incoming_order',
            title: `Pesanan Baru ${waitingOrders[0].id}`,
            desc: `${waitingOrders[0].customerName} memesan ${waitingOrders[0].items.length} menu sisa piring`,
            time: waitingOrders[0].orderDate,
            actionLabel: 'Konfirmasi Pesanan',
            onClick: () => navigateToOrdersWithFilter('waiting_confirmation'),
          },
        ]
      : []),
    {
      id: 'act-2',
      type: 'pickup_verified',
      title: 'Verifikasi Pengambilan Sukses',
      desc: 'Pesanan SP-BDG-2026-074 selesai diserahkan ke pelanggan',
      time: 'Hari ini, 15:20 WIB',
      actionLabel: 'Buka Riwayat',
      onClick: () => navigateToOrdersWithFilter('completed'),
    },
    {
      id: 'act-3',
      type: 'deal_alert',
      title: 'Diskon Otomatis Tersedia',
      desc: 'Nasi Kuning Parahyangan mendekati batas aman (tersisa 2.5 jam)',
      time: 'Hari ini, 14:45 WIB',
      actionLabel: 'Atur Rescue Deals',
      onClick: () => setActiveTab('rescue_deals'),
    },
    {
      id: 'act-4',
      type: 'product_published',
      title: 'Deklarasi Pangan Terverifikasi',
      desc: 'Paket Artisan Butter Croissant dinyatakan 5/5 aman konsumsi',
      time: 'Hari ini, 07:30 WIB',
      actionLabel: 'Cek Produk',
      onClick: () => setActiveTab('products'),
    },
  ];

  return (
    <div className="p-3.5 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* 1. SELLER WELCOME SECTION */}
      <section className="bg-white rounded-2xl p-4 sm:p-6 border border-neutral-200 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Left: Greeting, Business Name, Location */}
          <div className="space-y-1.5 min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-neutral-500">
                {getGreeting()}, <strong className="text-neutral-800">{sellerProfile.ownerName}</strong>
              </span>

              {/* Interactive Mitra Resmi Bandung Verification Badge */}
              <button
                type="button"
                onClick={() => setIsVerificationModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#16382C] text-[#FFD230] hover:bg-[#214F3F] transition-colors cursor-pointer group shadow-xs shrink-0"
                title="Klik untuk melihat sertifikat & legalitas usaha"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-[#FFD230]" />
                <span>Mitra Resmi Bandung</span>
                <span className="text-[10px] bg-white/20 px-1 rounded text-white group-hover:bg-white/30">
                  Lihat Info
                </span>
              </button>
            </div>

            <h1 className="text-xl sm:text-2xl font-bold text-[#16382C] tracking-tight truncate">
              {sellerProfile.businessName}
            </h1>

            <div className="flex flex-wrap items-center gap-y-1 gap-x-2 text-xs text-neutral-500">
              <span className="flex items-center gap-1 text-neutral-700">
                <MapPin className="w-3.5 h-3.5 text-[#EE4D2D] shrink-0" />
                <span>{sellerProfile.businessAddress}</span>
              </span>
              <span>·</span>
              <span className="text-neutral-600">Kec. {sellerProfile.district}, Kota Bandung (WIB)</span>
              <span>·</span>
              <span className="text-neutral-600">Jadwal Ambil: {sellerProfile.pickupWindow}</span>
            </div>
          </div>

          {/* Right: Operating Status Switch & Quick Scan */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-neutral-100">
            {/* Operating Status Toggle */}
            <button
              type="button"
              onClick={() => {
                const nextState = !sellerProfile.isOpenToday;
                updateSellerProfile({ isOpenToday: nextState });
                showToast(
                  nextState ? 'Toko Beroperasi' : 'Toko Ditutup Sementara',
                  nextState
                    ? 'Etalase aktif menerima pesanan penjemputan warga Bandung.'
                    : 'Pesanan penjemputan dijeda sementara.',
                  'info'
                );
              }}
              className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold border transition-colors ${
                sellerProfile.isOpenToday
                  ? 'bg-emerald-50 text-emerald-900 border-emerald-200 hover:bg-emerald-100'
                  : 'bg-neutral-100 text-neutral-700 border-neutral-200 hover:bg-neutral-200'
              }`}
            >
              <span
                className={`w-2.5 h-2.5 rounded-full ${
                  sellerProfile.isOpenToday ? 'bg-emerald-600' : 'bg-neutral-400'
                }`}
              />
              <span>{sellerProfile.isOpenToday ? 'Buka (Menerima Pengambilan)' : 'Tutup Sementara'}</span>
            </button>

            {/* Quick QR Pickup */}
            <button
              type="button"
              onClick={() => setActiveTab('qr_pickup')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#16382C] hover:bg-[#214F3F] text-white text-xs font-bold rounded-xl transition-colors shadow-xs"
            >
              <QrCode className="w-4 h-4 text-[#FFD230]" />
              <span>Verifikasi QR</span>
            </button>

            {/* Add Sisa Piring */}
            <button
              type="button"
              onClick={() => setIsAddProductModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-[#EE4D2D] hover:bg-[#D73C1C] text-white text-xs font-bold rounded-xl transition-colors shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Tambah Sisa Piring</span>
            </button>
          </div>
        </div>
      </section>

      {/* 2. INTERACTIVE QUICK ACTIONS SECTION */}
      <section className="bg-white rounded-2xl p-4 sm:p-5 border border-neutral-200 shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold text-neutral-800 uppercase tracking-wider">
            Aksi Cepat Merchant (Quick Actions)
          </h2>
          <span className="text-[11px] text-neutral-400">Pintasan Kerja Utama</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5 sm:gap-3">
          {/* Action 1: Tambah Sisa Piring Baru */}
          <button
            type="button"
            onClick={() => setIsAddProductModalOpen(true)}
            className="p-3 bg-[#FAF9F6] hover:bg-neutral-100 rounded-xl border border-neutral-200 transition-all text-left flex flex-col justify-between group"
          >
            <div className="w-8 h-8 rounded-lg bg-[#EE4D2D] text-white flex items-center justify-center mb-2 shadow-xs group-hover:scale-105 transition-transform">
              <Plus className="w-4 h-4" />
            </div>
            <div>
              <p className="font-bold text-xs text-neutral-900 leading-tight">Tambah Sisa Piring</p>
              <p className="text-[10px] text-neutral-500 mt-0.5">Input batch makanan baru</p>
            </div>
          </button>

          {/* Action 2: Kelola Produk */}
          <button
            type="button"
            onClick={() => setActiveTab('products')}
            className="p-3 bg-[#FAF9F6] hover:bg-neutral-100 rounded-xl border border-neutral-200 transition-all text-left flex flex-col justify-between group"
          >
            <div className="w-8 h-8 rounded-lg bg-[#16382C] text-[#FFD230] flex items-center justify-center mb-2 shadow-xs group-hover:scale-105 transition-transform">
              <UtensilsCrossed className="w-4 h-4" />
            </div>
            <div>
              <p className="font-bold text-xs text-neutral-900 leading-tight">Kelola Produk</p>
              <p className="text-[10px] text-neutral-500 mt-0.5">{products.length} menu terdaftar</p>
            </div>
          </button>

          {/* Action 3: Pesanan Masuk */}
          <button
            type="button"
            onClick={() => navigateToOrdersWithFilter('waiting_confirmation')}
            className="p-3 bg-[#FAF9F6] hover:bg-neutral-100 rounded-xl border border-neutral-200 transition-all text-left flex flex-col justify-between group relative"
          >
            <div className="w-8 h-8 rounded-lg bg-[#EE4D2D] text-white flex items-center justify-center mb-2 shadow-xs group-hover:scale-105 transition-transform">
              <ShoppingBag className="w-4 h-4" />
            </div>
            {waitingOrders.length > 0 && (
              <span className="absolute top-3 right-3 text-[10px] font-mono font-bold bg-[#EE4D2D] text-white px-1.5 py-0.2 rounded-full">
                {waitingOrders.length}
              </span>
            )}
            <div>
              <p className="font-bold text-xs text-neutral-900 leading-tight">Pesanan Masuk</p>
              <p className="text-[10px] text-neutral-500 mt-0.5">
                {waitingOrders.length > 0 ? `${waitingOrders.length} perlu konfirmasi` : 'Semua tertangani'}
              </p>
            </div>
          </button>

          {/* Action 4: Verifikasi Pengambilan */}
          <button
            type="button"
            onClick={() => setActiveTab('qr_pickup')}
            className="p-3 bg-[#FAF9F6] hover:bg-neutral-100 rounded-xl border border-neutral-200 transition-all text-left flex flex-col justify-between group"
          >
            <div className="w-8 h-8 rounded-lg bg-[#16382C] text-white flex items-center justify-center mb-2 shadow-xs group-hover:scale-105 transition-transform">
              <QrCode className="w-4 h-4 text-[#FFD230]" />
            </div>
            <div>
              <p className="font-bold text-xs text-neutral-900 leading-tight">Verifikasi Ambil</p>
              <p className="text-[10px] text-neutral-500 mt-0.5">Scan QR / PIN kasir</p>
            </div>
          </button>

          {/* Action 5: Deklarasi Keamanan Pangan */}
          <button
            type="button"
            onClick={() => setIsFoodSafetyModalOpen(true)}
            className="p-3 bg-[#FAF9F6] hover:bg-neutral-100 rounded-xl border border-neutral-200 transition-all text-left flex flex-col justify-between group col-span-2 sm:col-span-1"
          >
            <div className="w-8 h-8 rounded-lg bg-emerald-800 text-white flex items-center justify-center mb-2 shadow-xs group-hover:scale-105 transition-transform">
              <FileCheck className="w-4 h-4 text-[#FFD230]" />
            </div>
            <div>
              <p className="font-bold text-xs text-neutral-900 leading-tight">Keamanan Pangan</p>
              <p className="text-[10px] text-neutral-500 mt-0.5">5/5 standar terpenuhi</p>
            </div>
          </button>
        </div>
      </section>

      {/* 3. ORDER ANALYTICS (CLICKABLE TO ORDERS VIEW) */}
      <section className="space-y-2.5">
        <div className="flex items-center justify-between">
          <h2 className="text-xs font-bold text-neutral-800 uppercase tracking-wider">
            Status Alur Pesanan (Order Pipeline)
          </h2>
          <span className="text-[11px] text-neutral-500">Klik kartu untuk filter langsung</span>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {/* Card 1: Total Orders */}
          <div
            onClick={() => navigateToOrdersWithFilter('all')}
            className="bg-white p-4 rounded-2xl border border-neutral-200 hover:border-[#16382C] transition-all cursor-pointer shadow-xs group"
          >
            <div className="flex items-center justify-between text-neutral-500 mb-1">
              <span className="text-xs font-semibold">Semua Pesanan</span>
              <ShoppingBag className="w-4 h-4 text-neutral-400 group-hover:text-[#16382C]" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-mono font-bold text-neutral-900">
                {orders.length}
              </span>
              <span className="text-[11px] text-neutral-400">transaksi</span>
            </div>
            <p className="text-[10px] text-neutral-500 mt-1 flex items-center gap-1 group-hover:text-[#16382C]">
              <span>Buka daftar lengkap</span>
              <ChevronRight className="w-3 h-3" />
            </p>
          </div>

          {/* Card 2: Waiting for Confirmation */}
          <div
            onClick={() => navigateToOrdersWithFilter('waiting_confirmation')}
            className="bg-white p-4 rounded-2xl border border-neutral-200 hover:border-[#EE4D2D] transition-all cursor-pointer shadow-xs group"
          >
            <div className="flex items-center justify-between text-neutral-500 mb-1">
              <span className="text-xs font-semibold">Menunggu Konfirmasi</span>
              <Clock className="w-4 h-4 text-[#EE4D2D]" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-mono font-bold text-[#EE4D2D]">
                {waitingOrders.length}
              </span>
              <span className="text-[11px] text-neutral-500 font-semibold">antrean</span>
            </div>
            <p className="text-[10px] text-[#EE4D2D] mt-1 flex items-center gap-1 font-semibold">
              <span>{waitingOrders.length > 0 ? 'Perlu tindakan staf' : 'Tidak ada antrean'}</span>
              <ChevronRight className="w-3 h-3" />
            </p>
          </div>

          {/* Card 3: Ready for Pickup */}
          <div
            onClick={() => navigateToOrdersWithFilter('ready_for_pickup')}
            className="bg-white p-4 rounded-2xl border border-neutral-200 hover:border-emerald-600 transition-all cursor-pointer shadow-xs group"
          >
            <div className="flex items-center justify-between text-neutral-500 mb-1">
              <span className="text-xs font-semibold">Siap Diambil</span>
              <PackageCheck className="w-4 h-4 text-emerald-700" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-mono font-bold text-emerald-800">
                {readyOrders.length}
              </span>
              <span className="text-[11px] text-neutral-500 font-semibold">paket</span>
            </div>
            <p className="text-[10px] text-emerald-700 mt-1 flex items-center gap-1 font-semibold">
              <span>Menunggu kedatangan pembeli</span>
              <ChevronRight className="w-3 h-3" />
            </p>
          </div>

          {/* Card 4: Completed */}
          <div
            onClick={() => navigateToOrdersWithFilter('completed')}
            className="bg-white p-4 rounded-2xl border border-neutral-200 hover:border-neutral-400 transition-all cursor-pointer shadow-xs group"
          >
            <div className="flex items-center justify-between text-neutral-500 mb-1">
              <span className="text-xs font-semibold">Pesanan Selesai</span>
              <CheckCircle2 className="w-4 h-4 text-emerald-700" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl sm:text-3xl font-mono font-bold text-[#16382C]">
                {completedOrders.length}
              </span>
              <span className="text-[11px] text-neutral-500">sukses</span>
            </div>
            <p className="text-[10px] text-neutral-500 mt-1 flex items-center gap-1 group-hover:text-neutral-800">
              <span>Terverifikasi via QR / PIN</span>
              <ChevronRight className="w-3 h-3" />
            </p>
          </div>
        </div>
      </section>

      {/* 4. REVENUE & FOOD RESCUE ANALYTICS (INTERACTIVE CHART) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* A. Revenue Analytics (8 cols on lg) */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-4 sm:p-6 border border-neutral-200 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-[#16382C]" />
                <h3 className="text-xs font-bold text-neutral-800 uppercase tracking-wider">
                  Analisis Pendapatan Penjualan Sisa Piring
                </h3>
              </div>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-xl sm:text-2xl font-bold font-mono text-[#16382C]">
                  {formatRupiah(totalRevenue > 0 ? totalRevenue : 340000)}
                </span>
                <span className="inline-flex items-center gap-0.5 text-xs text-emerald-700 font-semibold">
                  <ArrowUpRight className="w-3.5 h-3.5" />
                  <span>+18.4% vs periode lalu</span>
                </span>
              </div>
            </div>

            {/* Time Filter Tabs (Solid colors) */}
            <div className="flex items-center bg-neutral-100 p-1 rounded-xl self-start sm:self-center">
              {(['7d', '30d', '90d'] as const).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => {
                    setRevenuePeriod(p);
                    setActiveChartPoint(null);
                  }}
                  className={`px-3 py-1 text-xs font-bold rounded-lg transition-colors ${
                    revenuePeriod === p
                      ? 'bg-[#16382C] text-white shadow-xs'
                      : 'text-neutral-600 hover:text-neutral-900'
                  }`}
                >
                  {p === '7d' ? '7 Hari' : p === '30d' ? '30 Hari' : '90 Hari'}
                </button>
              ))}
            </div>
          </div>

          {/* Interactive Tooltip Card */}
          <div className="h-10 flex items-center justify-between px-3 bg-[#FAF9F6] rounded-xl border border-neutral-200 text-xs">
            {activeChartPoint ? (
              <>
                <span className="font-semibold text-neutral-700">{activeChartPoint.date}</span>
                <div className="flex items-center gap-3">
                  <span className="font-mono font-bold text-[#16382C]">
                    {formatRupiah(activeChartPoint.revenue)}
                  </span>
                  <span className="text-neutral-400">·</span>
                  <span className="text-neutral-600 font-mono font-medium">
                    {activeChartPoint.ordersCount} pesanan selesai
                  </span>
                </div>
              </>
            ) : (
              <span className="text-neutral-500 text-[11px]">
                Arahkan kursor atau sentuh pilar grafik untuk melihat tanggal, omzet, dan jumlah pesanan.
              </span>
            )}
          </div>

          {/* Solid SVG Bar Visualization (NO GRADIENTS) */}
          <div className="pt-2">
            <div className="h-44 flex items-end justify-between gap-2 sm:gap-4 px-2">
              {currentChartData.map((item, idx) => {
                const heightPct = Math.max(15, Math.round((item.revenue / maxChartRevenue) * 100));
                const isSelected = activeChartPoint?.date === item.date;

                return (
                  <div
                    key={idx}
                    onMouseEnter={() =>
                      setActiveChartPoint({
                        date: item.date,
                        revenue: item.revenue,
                        ordersCount: item.ordersCount,
                      })
                    }
                    onClick={() =>
                      setActiveChartPoint({
                        date: item.date,
                        revenue: item.revenue,
                        ordersCount: item.ordersCount,
                      })
                    }
                    className="flex-1 flex flex-col items-center gap-2 cursor-pointer group"
                  >
                    <div className="w-full max-w-[44px] bg-neutral-100 rounded-t-lg overflow-hidden flex items-end h-32">
                      <div
                        style={{ height: `${heightPct}%` }}
                        className={`w-full transition-all rounded-t-md ${
                          isSelected
                            ? 'bg-[#EE4D2D]'
                            : 'bg-[#16382C] group-hover:bg-[#214F3F]'
                        }`}
                      />
                    </div>
                    <span
                      className={`text-[11px] font-mono font-semibold truncate ${
                        isSelected ? 'text-[#EE4D2D] font-bold' : 'text-neutral-600'
                      }`}
                    >
                      {item.shortDate}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* B. Food Rescue Impact Analytics (5 cols on lg) */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-4 sm:p-6 border border-neutral-200 shadow-xs space-y-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
              <div className="flex items-center gap-2">
                <Leaf className="w-4 h-4 text-emerald-700" />
                <h3 className="text-xs font-bold text-neutral-800 uppercase tracking-wider">
                  Dampak Penyelamatan Pangan
                </h3>
              </div>
              <span className="text-[10px] font-mono font-bold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
                Kota Bandung
              </span>
            </div>

            <div className="mt-4 space-y-3">
              {/* Total Portions Rescued */}
              <div className="p-3 bg-[#FAF9F6] rounded-xl border border-neutral-200 flex items-center justify-between">
                <div>
                  <span className="text-[11px] text-neutral-500 block">Total Porsi Diselamatkan</span>
                  <span className="text-2xl font-bold font-mono text-[#16382C]">
                    {totalPortionsRescued} <span className="text-xs text-neutral-600 font-sans">porsi</span>
                  </span>
                </div>
                <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                  <Leaf className="w-5 h-5" />
                </div>
              </div>

              {/* Total Sisa Piring Sold vs Donated */}
              <div className="grid grid-cols-2 gap-2.5 text-xs">
                <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200">
                  <span className="text-[11px] text-neutral-500 block">Produk Terjual</span>
                  <span className="text-lg font-bold font-mono text-neutral-900">
                    {totalPortionsRescued - donatedCount} <span className="text-[10px]">porsi</span>
                  </span>
                  <span className="text-[10px] text-neutral-400 block mt-0.5">Diskon 50% - 90%</span>
                </div>

                <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200">
                  <span className="text-[11px] text-neutral-500 block">Produk Didonasikan</span>
                  <span className="text-lg font-bold font-mono text-[#16382C]">
                    {donatedCount} <span className="text-[10px]">porsi</span>
                  </span>
                  <span className="text-[10px] text-[#16382C] font-semibold block mt-0.5">
                    100% Bebas Bayar
                  </span>
                </div>
              </div>

              {/* Carbon Emissions Prevented */}
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 flex items-center justify-between text-xs text-emerald-950">
                <div>
                  <span className="text-[11px] text-emerald-800 font-semibold block">
                    Pencegahan Emisi Gas Metana
                  </span>
                  <span className="font-mono font-extrabold text-base text-emerald-900">
                    {calculateCO2Saved(totalPortionsRescued)}
                  </span>
                </div>
                <span className="text-[10px] text-emerald-700 bg-emerald-100 px-2 py-1 rounded-md font-semibold">
                  TPA Sarimukti
                </span>
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-neutral-100 flex items-center justify-between text-xs">
            <span className="text-neutral-500">Target Bulanan UMKM:</span>
            <span className="font-mono font-bold text-[#16382C]">250 Porsi (92% Tercapai)</span>
          </div>
        </div>
      </div>

      {/* 5. PRODUCT PERFORMANCE & RECENT ACTIVITY GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* D. Product Performance (7 cols on lg) */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-4 sm:p-6 border border-neutral-200 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-xs font-bold text-neutral-800 uppercase tracking-wider">
                Performa Produk Sisa Piring
              </h3>
              <p className="text-xs text-neutral-500 mt-0.5">
                Pantau menu terlaris, stok menipis, dan produk yang mendekati batas aman
              </p>
            </div>

            {/* Performance Segmented Tabs */}
            <div className="flex items-center bg-neutral-100 p-1 rounded-xl self-start sm:self-center overflow-x-auto max-w-full">
              <button
                type="button"
                onClick={() => setPerformanceTab('best_selling')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                  performanceTab === 'best_selling'
                    ? 'bg-white text-[#16382C] shadow-xs'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                Terlaris
              </button>
              <button
                type="button"
                onClick={() => setPerformanceTab('low_stock')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                  performanceTab === 'low_stock'
                    ? 'bg-white text-amber-900 shadow-xs'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                Stok Menipis ({lowStockProducts.length})
              </button>
              <button
                type="button"
                onClick={() => setPerformanceTab('expiring_soon')}
                className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${
                  performanceTab === 'expiring_soon'
                    ? 'bg-white text-[#EE4D2D] shadow-xs'
                    : 'text-neutral-600 hover:text-neutral-900'
                }`}
              >
                Kritis Waktu ({expiringProducts.length})
              </button>
            </div>
          </div>

          {/* Product Items List */}
          <div className="space-y-2.5 divide-y divide-neutral-100 text-xs">
            {performanceTab === 'best_selling' &&
              bestSellingProducts.slice(0, 4).map((p, idx) => (
                <div
                  key={p.id}
                  className="pt-2.5 first:pt-0 flex items-center justify-between gap-3 hover:bg-neutral-50/70 p-2 rounded-xl transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-5 text-center font-mono font-bold text-neutral-400 text-xs">
                      #{idx + 1}
                    </span>
                    <img
                      src={p.image}
                      alt={p.name}
                      className="w-10 h-10 rounded-xl object-cover border border-neutral-200 shrink-0"
                      referrerPolicy="no-referrer"
                    />
                    <div className="min-w-0">
                      <p className="font-bold text-neutral-900 truncate" title={p.name}>
                        {p.name}
                      </p>
                      <p className="text-[11px] text-neutral-500">
                        {p.category} · Stok: {p.stock} porsi
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="font-mono font-bold text-[#16382C] block">
                      {p.portionsRescuedCount} porsi
                    </span>
                    <span className="text-[10px] text-emerald-700 font-semibold bg-emerald-50 px-1.5 py-0.2 rounded">
                      Terselamatkan
                    </span>
                  </div>
                </div>
              ))}

            {performanceTab === 'low_stock' &&
              (lowStockProducts.length === 0 ? (
                <div className="py-6 text-center text-xs text-neutral-400">
                  Semua stok sisa piring saat ini dalam kondisi aman (&gt; 3 porsi).
                </div>
              ) : (
                lowStockProducts.map((p) => (
                  <div
                    key={p.id}
                    className="pt-2.5 first:pt-0 flex items-center justify-between gap-3 hover:bg-neutral-50/70 p-2 rounded-xl transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={p.image}
                        alt={p.name}
                        className="w-10 h-10 rounded-xl object-cover border border-neutral-200 shrink-0"
                        referrerPolicy="no-referrer"
                      />
                      <div className="min-w-0">
                        <p className="font-bold text-neutral-900 truncate">{p.name}</p>
                        <p className="text-[11px] text-amber-800 font-medium">
                          Sisa {p.stock} porsi di etalase
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        onClick={() => updateStock(p.id, 2)}
                        className="px-2.5 py-1 bg-[#16382C] text-white text-[11px] font-semibold rounded-lg hover:bg-[#214F3F]"
                      >
                        + Tambah 2
                      </button>
                    </div>
                  </div>
                ))
              ))}

            {performanceTab === 'expiring_soon' &&
              (expiringProducts.length === 0 ? (
                <div className="py-6 text-center text-xs text-neutral-400">
                  Tidak ada produk dengan batas waktu mendesak saat ini.
                </div>
              ) : (
                expiringProducts.map((p) => (
                  <div
                    key={p.id}
                    className="pt-2.5 first:pt-0 flex items-center justify-between gap-3 hover:bg-neutral-50/70 p-2 rounded-xl transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={p.image}
                        alt={p.name}
                        className="w-10 h-10 rounded-xl object-cover border border-neutral-200 shrink-0"
                        referrerPolicy="no-referrer"
                      />
                      <div className="min-w-0">
                        <p className="font-bold text-neutral-900 truncate">{p.name}</p>
                        <p className="text-[11px] text-[#EE4D2D] font-medium flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          <span>Aman s/d {p.safeConsumptionDeadline}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="font-mono font-bold text-xs bg-[#EE4D2D]/10 text-[#EE4D2D] px-2 py-0.5 rounded">
                        {p.discountPercentage}% OFF
                      </span>
                      <button
                        type="button"
                        onClick={() => setActiveTab('rescue_deals')}
                        className="px-2.5 py-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-[11px] font-semibold rounded-lg"
                      >
                        Atur Diskon
                      </button>
                    </div>
                  </div>
                ))
              ))}
          </div>

          <div className="pt-2 border-t border-neutral-100 flex justify-end">
            <button
              type="button"
              onClick={() => setActiveTab('products')}
              className="text-xs font-semibold text-[#16382C] hover:underline flex items-center gap-1"
            >
              <span>Buka Seluruh Etalase Produk ({products.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* E. Recent Activity Section (5 cols on lg) */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-4 sm:p-6 border border-neutral-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
            <div>
              <h3 className="text-xs font-bold text-neutral-800 uppercase tracking-wider">
                Aktivitas Terkini (Recent Activity)
              </h3>
              <p className="text-xs text-neutral-500 mt-0.5">Log peristiwa bisnis dan pesanan harian</p>
            </div>
            <span className="text-[11px] font-mono text-neutral-400">Hari ini</span>
          </div>

          <div className="space-y-3 text-xs">
            {recentActivities.map((act) => (
              <div
                key={act.id}
                className="p-3 bg-[#FAF9F6] rounded-xl border border-neutral-200 hover:border-neutral-300 transition-colors space-y-2"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="font-bold text-neutral-900 leading-tight">{act.title}</p>
                    <p className="text-[11px] text-neutral-600 mt-0.5">{act.desc}</p>
                  </div>
                  <span className="text-[10px] text-neutral-400 font-mono shrink-0">{act.time}</span>
                </div>

                <div className="flex justify-end pt-1">
                  <button
                    type="button"
                    onClick={act.onClick}
                    className="inline-flex items-center gap-1 text-[11px] font-bold text-[#16382C] hover:text-[#EE4D2D] transition-colors"
                  >
                    <span>{act.actionLabel}</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 text-[11px] text-neutral-500 flex items-center justify-between">
            <span>Sinkronisasi Otomatis WIB</span>
            <span className="font-mono font-semibold text-emerald-800">● Realtime Terhubung</span>
          </div>
        </div>
      </div>
    </div>
  );
};
