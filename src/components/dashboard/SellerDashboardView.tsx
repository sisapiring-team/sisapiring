import React, { useMemo, useState } from 'react';
import {
  UtensilsCrossed,
  ShoppingBag,
  TrendingUp,
  Leaf,
  Clock,
  ArrowRight,
  Plus,
  ShieldCheck,
  CheckCircle2,
  QrCode,
  MapPin,
  Calendar,
  ChevronRight,
  ChevronDown,
  PackageCheck,
  FileCheck,
  Layers,
} from 'lucide-react';
import { formatRupiah, calculateCO2Saved } from '../../utils/formatters';
import { useApp } from '../../context/AppContext';

/* ------------------------------------------------------------------
   Palette (see colour sheet):
   asparagus      #8DA249   success / positive delta
   faded orange   #F0935D   action
   navajo white   #FBE1B5   highlight
   limed spruce   #2C434F   structure
   Text stays inside those four hues + neutrals. Cards carry shadow,
   never a stroke, and each block has one label instead of a subtitle.
------------------------------------------------------------------- */

const C = {
  ink: '#2C434F',
  inkSoft: '#5C7079',
  mute: '#8FA0A6',
  faint: '#B9C6CA',
  orange: '#F0935D',
  green: '#8DA249',
  cream: '#FBE1B5',
  canvas: '#FFFFFF',
  surface: '#F4F6F1',
};

const ORDER_VIEW: Record<string, { label: string; tone: string; cta: string }> = {
  waiting_confirmation: { label: 'Perlu dikonfirmasi', tone: C.orange, cta: 'Konfirmasi' },
  confirmed: { label: 'Sedang disiapkan', tone: C.green, cta: 'Siap ambil' },
  ready_for_pickup: { label: 'Menunggu pembeli', tone: C.green, cta: 'Verifikasi' },
  completed: { label: 'Selesai', tone: C.mute, cta: '' },
  cancelled: { label: 'Dibatalkan', tone: C.mute, cta: '' },
};

const ORDER_PRIORITY: Record<string, number> = {
  waiting_confirmation: 0,
  confirmed: 1,
  ready_for_pickup: 2,
  completed: 3,
  cancelled: 4,
};

const clockOf = (iso: string) => {
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? ''
    : `${String(d.getHours()).padStart(2, '0')}.${String(d.getMinutes()).padStart(2, '0')}`;
};

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

  const [revenuePeriod, setRevenuePeriod] = useState<'7d' | '30d' | '90d'>('7d');
  const [activeChartPoint, setActiveChartPoint] = useState<{
    date: string;
    revenue: number;
    ordersCount: number;
  } | null>(null);
  const [performanceTab, setPerformanceTab] = useState<
    'best_selling' | 'low_stock' | 'expiring_soon'
  >('best_selling');

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 11) return 'Pagi';
    if (hour < 15) return 'Siang';
    if (hour < 18) return 'Sore';
    return 'Malam';
  };

  /* ---- derived state ------------------------------------------- */
  const metrics = useMemo(() => {
    const waiting = orders.filter((o) => o.status === 'waiting_confirmation');
    const confirmed = orders.filter((o) => o.status === 'confirmed');
    const ready = orders.filter((o) => o.status === 'ready_for_pickup');
    const completed = orders.filter((o) => o.status === 'completed');

    const revenue = completed.reduce((acc, o) => acc + o.totalPayment, 0);
    const portions = products.reduce((acc, p) => acc + p.portionsRescuedCount, 0);
    const donated = products
      .filter((p) => p.discountPercentage === 100)
      .reduce((acc, p) => acc + p.portionsRescuedCount, 0);

    return {
      waiting,
      confirmed,
      ready,
      completed,
      revenue,
      portions,
      donated,
      lowStock: products.filter((p) => p.isActive && p.stock <= 3),
      critical: products.filter((p) => p.isActive && p.stock > 0 && p.discountPercentage >= 70),
      best: [...products].sort((a, b) => b.portionsRescuedCount - a.portionsRescuedCount),
    };
  }, [orders, products]);

  const queue = useMemo(
    () =>
      [...orders]
        .sort(
          (a, b) =>
            (ORDER_PRIORITY[a.status] ?? 9) - (ORDER_PRIORITY[b.status] ?? 9) ||
            new Date(b.orderDate).getTime() - new Date(a.orderDate).getTime()
        )
        .slice(0, 4),
    [orders]
  );

  const monthlyTarget = 250;
  const targetPct = Math.min(100, Math.round((metrics.portions / monthlyTarget) * 100));

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
      {
        date: '10 Nov 2026',
        shortDate: 'Sel',
        revenue: metrics.revenue > 0 ? metrics.revenue : 340000,
        ordersCount: metrics.completed.length > 0 ? metrics.completed.length : 12,
      },
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
      { date: 'November 2026', shortDate: 'Nov', revenue: 7420000, ordersCount: 290 },
    ],
  };

  const chart = chartDatasets[revenuePeriod];
  const maxRevenue = Math.max(...chart.map((d) => d.revenue));

  /* ---- activity log (title only, whole row is the link) --------- */
  const activities = [
    ...(metrics.waiting.length > 0
      ? [
        {
          id: 'act-1',
          time: clockOf(metrics.waiting[0].orderDate),
          text: `Pesanan ${metrics.waiting[0].id} · ${metrics.waiting[0].customerName}`,
          onClick: () => navigateToOrdersWithFilter('waiting_confirmation'),
        },
      ]
      : []),
    {
      id: 'act-2',
      time: '15.20',
      text: 'Pengambilan terverifikasi · SP-BDG-074',
      onClick: () => navigateToOrdersWithFilter('completed'),
    },
    {
      id: 'act-3',
      time: '14.45',
      text: 'Diskon otomatis naik · Nasi Kuning Parahyangan',
      onClick: () => setActiveTab('rescue_deals'),
    },
    {
      id: 'act-4',
      time: '07.30',
      text: 'Deklarasi pangan disetujui · Artisan Butter Croissant',
      onClick: () => setActiveTab('products'),
    },
  ];

  return (
    <div className="min-h-full bg-[#ECEFEC] px-4 py-6 sm:px-6 lg:px-10 lg:py-8">
      <div className="mx-auto max-w-[1280px] space-y-5">
        {/* 1 · TOP BAR ------------------------------------------------ */}
        <header className="flex flex-wrap items-center justify-between gap-x-6 gap-y-4 rounded-[22px] bg-white px-5 py-4 shadow-[0_1px_2px_rgba(44,67,79,0.05),0_14px_34px_-18px_rgba(44,67,79,0.28)]">
          <div className="flex min-w-0 items-center gap-3.5">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl" style={{ background: C.ink }}>
              <UtensilsCrossed className="h-5 w-5" style={{ color: C.cream }} />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-[0.18em]" style={{ color: C.mute }}>
                {getGreeting()}, {sellerProfile.ownerName}
              </p>
              <div className="mt-0.5 flex flex-wrap items-center gap-x-2 gap-y-1">
                <h1
                  className="max-w-[240px] truncate text-[17px] font-semibold tracking-tight sm:max-w-none"
                  style={{ color: C.ink }}
                  title={sellerProfile.businessName}
                >
                  {sellerProfile.businessName}
                </h1>
                <button
                  type="button"
                  onClick={() => setIsVerificationModalOpen(true)}
                  title="Sertifikat & legalitas usaha"
                  className="inline-flex shrink-0 items-center gap-1 rounded-full bg-[#EEF1E7] px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] transition-colors hover:bg-[#E3E8D6]"
                  style={{ color: '#6B8127' }}
                >
                  <ShieldCheck className="h-3.5 w-3.5" />
                  Mitra Resmi
                </button>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={() => {
                const next = !sellerProfile.isOpenToday;
                updateSellerProfile({ isOpenToday: next });
                showToast(
                  next ? 'Toko beroperasi' : 'Toko ditutup sementara',
                  next
                    ? 'Etalase aktif menerima pesanan penjemputan.'
                    : 'Pesanan penjemputan dijeda sementara.',
                  'info'
                );
              }}
              className="inline-flex items-center gap-2 rounded-full px-3.5 py-2 text-xs font-semibold transition-colors"
              style={{
                background: sellerProfile.isOpenToday ? '#EEF1E7' : '#F1F2F0',
                color: sellerProfile.isOpenToday ? '#6B8127' : C.mute,
              }}
            >
              <span
                className="h-2 w-2 rounded-full"
                style={{ background: sellerProfile.isOpenToday ? C.green : C.faint }}
              />
              {sellerProfile.isOpenToday ? 'Buka' : 'Tutup'}
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('qr_pickup')}
              className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold text-white transition-opacity hover:opacity-90"
              style={{ background: C.ink }}
            >
              <QrCode className="h-4 w-4" style={{ color: C.cream }} />
              Verifikasi QR
            </button>

            <button
              type="button"
              onClick={() => setIsAddProductModalOpen(true)}
              className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold transition-opacity hover:opacity-90"
              style={{ background: C.orange, color: C.ink }}
            >
              <Plus className="h-4 w-4" />
              Tambah Sisa Piring
            </button>
          </div>
        </header>

        {/* meta strip ------------------------------------------------ */}
        <div className="flex flex-wrap items-center gap-x-5 gap-y-2 px-2 text-[11px]" style={{ color: C.mute }}>
          <span className="inline-flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5" />
            {sellerProfile.businessAddress} · Kec. {sellerProfile.district}, Bandung
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Calendar className="h-3.5 w-3.5" />
            Ambil {sellerProfile.pickupWindow}
          </span>
        </div>

        {/* 2 · PIPELINE STRIP ---------------------------------------- */}
        <section data-slot="pipeline">
          <div className="grid grid-cols-2 overflow-hidden rounded-[22px] bg-white shadow-[0_1px_2px_rgba(44,67,79,0.05),0_14px_34px_-18px_rgba(44,67,79,0.28)] sm:grid-cols-4">
            {[
              { k: 'Semua pesanan', v: orders.length, c: C.ink, f: 'all' as const, Icon: Layers },
              { k: 'Perlu dikonfirmasi', v: metrics.waiting.length, c: C.orange, f: 'waiting_confirmation' as const, Icon: Clock },
              { k: 'Siap diambil', v: metrics.ready.length, c: C.green, f: 'ready_for_pickup' as const, Icon: PackageCheck },
              { k: 'Selesai', v: metrics.completed.length, c: C.ink, f: 'completed' as const, Icon: CheckCircle2 },
            ].map((s, i) => (
              <button
                key={s.k}
                type="button"
                onClick={() => navigateToOrdersWithFilter(s.f)}
                className={`group flex items-center gap-3.5 px-5 py-5 text-left transition-colors hover:bg-[#F7F8F4] ${i > 0 ? 'border-l border-[#EDEFEA]' : ''
                  } ${i > 1 ? 'border-t border-[#EDEFEA] sm:border-t-0' : ''}`}
              >
                <s.Icon className="h-4 w-4 shrink-0" style={{ color: s.c }} />
                <div className="min-w-0">
                  <p className="truncate text-[10px] uppercase tracking-[0.14em]" style={{ color: C.mute }}>
                    {s.k}
                  </p>
                  <p className="font-mono text-[28px] font-bold leading-tight tracking-tight" style={{ color: s.c }}>
                    {s.v}
                  </p>
                </div>
              </button>
            ))}
          </div>
        </section>

        <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
          <div className="space-y-5 xl:col-span-7">
            {/* 3 · QUEUE --------------------------------------------- */}
            <section data-slot="queue">
              <div className="space-y-2.5">
                <div className="flex items-end justify-between px-1">
                  <h2 className="text-[11px] font-semibold uppercase tracking-[0.18em]" style={{ color: C.ink }}>
                    Antrean <span style={{ color: C.mute }}>({orders.length})</span>
                  </h2>
                  <button
                    type="button"
                    onClick={() => navigateToOrdersWithFilter('all')}
                    className="inline-flex items-center gap-1 text-[11px] font-semibold uppercase tracking-[0.1em] transition-colors hover:text-[#F0935D]"
                    style={{ color: C.mute }}
                  >
                    Semua pesanan
                    <ChevronDown className="h-3.5 w-3.5" />
                  </button>
                </div>

                {queue.map((o) => {
                  const view = ORDER_VIEW[o.status] ?? { label: o.status, tone: C.mute, cta: '' };
                  return (
                    <div
                      key={o.id}
                      role="button"
                      tabIndex={0}
                      onClick={() => navigateToOrdersWithFilter(o.status)}
                      onKeyDown={(e) => e.key === 'Enter' && navigateToOrdersWithFilter(o.status)}
                      className="grid cursor-pointer grid-cols-[minmax(0,1fr)_auto] items-center gap-4 rounded-[22px] bg-white px-5 py-4 shadow-[0_1px_2px_rgba(44,67,79,0.05),0_14px_34px_-18px_rgba(44,67,79,0.28)] transition-shadow hover:shadow-[0_1px_2px_rgba(44,67,79,0.06),0_18px_40px_-16px_rgba(44,67,79,0.34)]"
                    >
                      <div className="flex min-w-0 items-center gap-4">
                        <div className="shrink-0">
                          <p className="font-mono text-[13px] font-bold leading-tight" style={{ color: C.ink }}>
                            {o.id}
                          </p>
                          <p
                            className="mt-0.5 font-mono text-[11px] font-semibold"
                            style={{ color: view.cta ? C.orange : C.mute }}
                          >
                            {clockOf(o.orderDate)}
                          </p>
                        </div>

                        <div className="hidden h-10 w-px shrink-0 bg-[#EDEFEA] sm:block" />

                        <div className="min-w-0">
                          <p className="truncate text-[11px] uppercase tracking-[0.14em]" style={{ color: C.mute }}>
                            {view.label}
                          </p>
                          <p className="mt-1 truncate text-sm font-semibold" style={{ color: C.ink }}>
                            {o.customerName}
                          </p>
                          <p className="mt-0.5 truncate text-[11px]" style={{ color: C.mute }}>
                            {o.items.length} menu · ambil {sellerProfile.pickupWindow}
                          </p>
                        </div>
                      </div>

                      <div className="flex shrink-0 items-center gap-4">
                        <div className="text-right">
                          <p className="text-[10px] uppercase tracking-[0.14em]" style={{ color: C.mute }}>
                            Total
                          </p>
                          <p className="font-mono text-base font-bold" style={{ color: C.ink }}>
                            {formatRupiah(o.totalPayment)}
                          </p>
                        </div>

                        {view.cta ? (
                          <span
                            className="rounded-full px-4 py-2 text-[11px] font-bold"
                            style={{ background: C.cream, color: C.ink }}
                          >
                            {view.cta}
                          </span>
                        ) : (
                          <span className="hidden text-[11px] font-semibold sm:block" style={{ color: C.faint }}>
                            {o.status === 'completed' ? 'Terverifikasi' : '—'}
                          </span>
                        )}
                        <ChevronRight className="h-4 w-4" style={{ color: C.faint }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* 4 · REVENUE ------------------------------------------- */}
            <section data-slot="revenue">
              <div className="rounded-[22px] bg-white px-5 pb-5 pt-4 shadow-[0_1px_2px_rgba(44,67,79,0.05),0_14px_34px_-18px_rgba(44,67,79,0.28)] sm:px-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.18em]" style={{ color: C.ink }}>
                      <TrendingUp className="h-4 w-4" style={{ color: C.green }} />
                      Pendapatan
                    </p>
                    <div className="mt-2 flex items-baseline gap-3">
                      <span className="font-mono text-[30px] font-bold leading-none tracking-tight" style={{ color: C.ink }}>
                        {formatRupiah(metrics.revenue > 0 ? metrics.revenue : 340000)}
                      </span>
                      <span
                        className="rounded-full px-2.5 py-1 text-[11px] font-bold"
                        style={{ background: '#EEF1E7', color: '#6B8127' }}
                      >
                        +18,4%
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center rounded-full bg-[#F1F2EE] p-1">
                    {(['7d', '30d', '90d'] as const).map((p) => (
                      <button
                        key={p}
                        type="button"
                        onClick={() => {
                          setRevenuePeriod(p);
                          setActiveChartPoint(null);
                        }}
                        className="rounded-full px-3.5 py-1.5 text-[11px] font-semibold transition-colors"
                        style={
                          revenuePeriod === p
                            ? { background: C.ink, color: '#fff' }
                            : { color: C.mute }
                        }
                      >
                        {p === '7d' ? '7 hari' : p === '30d' ? '30 hari' : '90 hari'}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-5 flex h-40 items-end justify-between gap-3 sm:gap-5">
                  {chart.map((item) => {
                    const h = Math.max(14, Math.round((item.revenue / maxRevenue) * 100));
                    const on = activeChartPoint?.date === item.date;
                    return (
                      <div
                        key={item.date}
                        onMouseEnter={() => setActiveChartPoint(item)}
                        onMouseLeave={() => setActiveChartPoint(null)}
                        onClick={() => setActiveChartPoint(item)}
                        className="flex h-full flex-1 cursor-pointer flex-col justify-end gap-2.5"
                      >
                        <div className="flex justify-center">
                          <span
                            className="whitespace-nowrap font-mono text-[10px] font-semibold tabular-nums transition-opacity"
                            style={{ color: on ? C.orange : C.faint, opacity: on || revenuePeriod === '7d' ? 1 : 0 }}
                          >
                            {item.ordersCount}
                          </span>
                        </div>
                        <div className="flex min-h-0 flex-1 items-end">
                          <div
                            className="mx-auto w-full max-w-[34px] rounded-[7px_7px_3px_3px] transition-all duration-200"
                            style={{ height: `${h}%`, background: on ? C.orange : C.ink }}
                          />
                        </div>
                        <span
                          className="text-center text-[10px] font-semibold uppercase tracking-[0.1em]"
                          style={{ color: on ? C.orange : C.mute }}
                        >
                          {item.shortDate}
                        </span>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-4 flex items-center justify-between text-[11px]" style={{ color: C.mute }}>
                  {activeChartPoint ? (
                    <>
                      <span className="font-semibold" style={{ color: C.ink }}>
                        {activeChartPoint.date}
                      </span>
                      <span className="font-mono tabular-nums">
                        {formatRupiah(activeChartPoint.revenue)} · {activeChartPoint.ordersCount} pesanan
                      </span>
                    </>
                  ) : (
                    <>
                      <span>Total periode terpilih</span>
                      <span className="font-mono tabular-nums">
                        {formatRupiah(chart.reduce((a, d) => a + d.revenue, 0))} ·{' '}
                        {chart.reduce((a, d) => a + d.ordersCount, 0)} pesanan
                      </span>
                    </>
                  )}
                </div>
              </div>
            </section>
          </div>

          <div className="space-y-5 xl:col-span-5">
            {/* 5 · IMPACT -------------------------------------------- */}
            <section data-slot="impact">
              <div
                className="rounded-[22px] p-5 text-white shadow-[0_1px_2px_rgba(44,67,79,0.08),0_18px_40px_-18px_rgba(44,67,79,0.5)] sm:p-6"
                style={{ background: C.ink }}
              >
                <div className="flex items-start justify-between">
                  <p className="text-[10px] uppercase tracking-[0.22em]" style={{ color: 'rgba(255,255,255,0.45)' }}>
                    Dampak
                  </p>
                  <span
                    className="rounded-full px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em]"
                    style={{ background: 'rgba(255,255,255,0.1)', color: 'rgba(255,255,255,0.7)' }}
                  >
                    Kota Bandung
                  </span>
                </div>

                <div className="mt-4 flex items-end justify-between gap-4">
                  <div>
                    <p className="text-[11px]" style={{ color: 'rgba(255,255,255,0.5)' }}>
                      Porsi diselamatkan
                    </p>
                    <p className="font-mono text-[40px] font-bold leading-none tracking-tight">
                      {metrics.portions}
                    </p>
                  </div>
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl" style={{ background: 'rgba(141,162,73,0.22)' }}>
                    <Leaf className="h-5 w-5" style={{ color: C.cream }} />
                  </div>
                </div>

                {/* target meter */}
                <div className="mt-6">
                  <div className="flex items-center justify-between text-[11px]" style={{ color: 'rgba(255,255,255,0.55)' }}>
                    <span>Target {monthlyTarget} porsi / bulan</span>
                    <span className="font-mono font-bold" style={{ color: C.cream }}>
                      {targetPct}%
                    </span>
                  </div>
                  <div className="relative mt-2.5 h-[3px] rounded-full" style={{ background: 'rgba(255,255,255,0.15)' }}>
                    <div className="absolute inset-y-0 left-0 rounded-full" style={{ width: `${targetPct}%`, background: C.green }} />
                    <div
                      className="absolute top-1/2 h-[11px] w-[11px] -translate-x-1/2 -translate-y-1/2 rounded-full"
                      style={{ left: `${targetPct}%`, background: C.cream }}
                    />
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-2.5">
                  {[
                    { k: 'Terjual', v: `${metrics.portions - metrics.donated}`, s: 'porsi' },
                    { k: 'Didonasikan', v: `${metrics.donated}`, s: 'porsi' },
                    { k: 'Metana dicegah', v: calculateCO2Saved(metrics.portions), s: 'TPA Sarimukti' },
                    { k: 'Pesanan selesai', v: `${metrics.completed.length}`, s: 'transaksi' },
                  ].map((t) => (
                    <div key={t.k} className="rounded-[14px] px-3.5 py-3" style={{ background: 'rgba(255,255,255,0.06)' }}>
                      <p className="text-[10px] uppercase tracking-[0.12em]" style={{ color: 'rgba(255,255,255,0.42)' }}>
                        {t.k}
                      </p>
                      <p className="mt-1 font-mono text-[17px] font-bold leading-tight">{t.v}</p>
                      <p className="text-[10px]" style={{ color: 'rgba(255,255,255,0.35)' }}>
                        {t.s}
                      </p>
                    </div>
                  ))}
                </div>

                <button
                  type="button"
                  onClick={() => setActiveTab('products')}
                  className="mt-5 inline-flex items-center gap-2 rounded-full px-4 py-2.5 text-xs font-bold transition-opacity hover:opacity-90"
                  style={{ background: C.orange, color: C.ink }}
                >
                  <ArrowRight className="h-4 w-4" />
                  Cek etalase produk
                </button>
              </div>
            </section>

            {/* 6 · PRODUCTS ------------------------------------------ */}
            <section data-slot="products">
              <div className="rounded-[22px] bg-white p-5 shadow-[0_1px_2px_rgba(44,67,79,0.05),0_14px_34px_-18px_rgba(44,67,79,0.28)]">
                <div className="flex items-center rounded-full bg-[#F1F2EE] p-1">
                  {(
                    [
                      { k: 'Terlaris', t: 'best_selling' as const, n: 0 },
                      { k: 'Stok', t: 'low_stock' as const, n: metrics.lowStock.length },
                      { k: 'Kritis', t: 'expiring_soon' as const, n: metrics.critical.length },
                    ]
                  ).map((tb) => {
                    const on = performanceTab === tb.t;
                    return (
                      <button
                        key={tb.t}
                        type="button"
                        onClick={() => setPerformanceTab(tb.t)}
                        className="flex-1 rounded-full px-2 py-1.5 text-[11px] font-semibold transition-colors"
                        style={
                          on
                            ? { background: tb.t === 'expiring_soon' ? C.orange : C.ink, color: tb.t === 'expiring_soon' ? C.ink : '#fff' }
                            : { color: C.mute }
                        }
                      >
                        {tb.k}
                        {tb.n > 0 && (
                          <span className="ml-1 font-mono tabular-nums" style={{ color: on ? 'inherit' : C.orange }}>
                            {tb.n}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>

                <div className="mt-4 space-y-1">
                  {performanceTab === 'best_selling' &&
                    (metrics.best.length === 0 ? (
                      <p className="py-8 text-center text-xs" style={{ color: C.faint }}>
                        Belum ada produk.
                      </p>
                    ) : (
                      metrics.best.slice(0, 4).map((p, i) => (
                        <div
                          key={p.id}
                          className="flex items-center gap-3.5 rounded-[14px] px-2 py-2 transition-colors hover:bg-[#F7F8F4]"
                        >
                          <span className="w-4 shrink-0 text-center font-mono text-[11px] font-bold" style={{ color: C.faint }}>
                            {i + 1}
                          </span>
                          <img
                            src={p.image}
                            alt={p.name}
                            referrerPolicy="no-referrer"
                            className="h-10 w-10 shrink-0 rounded-[10px] object-cover"
                          />
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-[13px] font-semibold" style={{ color: C.ink }}>
                              {p.name}
                            </p>
                            <p className="truncate text-[11px]" style={{ color: C.mute }}>
                              {p.category} · stok {p.stock}
                            </p>
                          </div>
                          <p className="shrink-0 font-mono text-[13px] font-bold" style={{ color: C.green }}>
                            {p.portionsRescuedCount}
                          </p>
                        </div>
                      ))
                    ))}

                  {performanceTab === 'low_stock' &&
                    (metrics.lowStock.length === 0 ? (
                      <p className="py-8 text-center text-xs" style={{ color: C.faint }}>
                        Semua stok aman.
                      </p>
                    ) : (
                      metrics.lowStock.map((p) => (
                        <div
                          key={p.id}
                          className="flex items-center gap-3.5 rounded-[14px] px-2 py-2 transition-colors hover:bg-[#F7F8F4]"
                        >
                          <img
                            src={p.image}
                            alt={p.name}
                            referrerPolicy="no-referrer"
                            className="h-10 w-10 shrink-0 rounded-[10px] object-cover"
                          />
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-[13px] font-semibold" style={{ color: C.ink }}>
                              {p.name}
                            </p>
                            <p className="truncate text-[11px]" style={{ color: C.mute }}>
                              {p.category}
                            </p>
                          </div>
                          <span className="shrink-0 font-mono text-[13px] font-bold" style={{ color: C.orange }}>
                            {p.stock}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateStock(p.id, 2)}
                            title="Tambah 2 porsi"
                            className="shrink-0 rounded-full bg-[#F1F2EE] px-3 py-1.5 text-[11px] font-bold transition-colors hover:bg-[#E7EAE2]"
                            style={{ color: C.ink }}
                          >
                            +2
                          </button>
                        </div>
                      ))
                    ))}

                  {performanceTab === 'expiring_soon' &&
                    (metrics.critical.length === 0 ? (
                      <p className="py-8 text-center text-xs" style={{ color: C.faint }}>
                        Tidak ada yang mendekati batas aman.
                      </p>
                    ) : (
                      metrics.critical.map((p) => (
                        <div
                          key={p.id}
                          className="flex items-center gap-3.5 rounded-[14px] px-2 py-2 transition-colors hover:bg-[#F7F8F4]"
                        >
                          <img
                            src={p.image}
                            alt={p.name}
                            referrerPolicy="no-referrer"
                            className="h-10 w-10 shrink-0 rounded-[10px] object-cover"
                          />
                          <div className="min-w-0 flex-1">
                            <p className="truncate text-[13px] font-semibold" style={{ color: C.ink }}>
                              {p.name}
                            </p>
                            <p className="flex items-center gap-1 truncate text-[11px] font-semibold" style={{ color: C.orange }}>
                              <Clock className="h-3 w-3" />
                              s/d {p.safeConsumptionDeadline}
                            </p>
                          </div>
                          <span
                            className="shrink-0 rounded-full px-2 py-1 font-mono text-[10px] font-bold"
                            style={{ background: C.cream, color: C.ink }}
                          >
                            {p.discountPercentage}%
                          </span>
                        </div>
                      ))
                    ))}
                </div>
              </div>
            </section>

            {/* 7 · LOG ----------------------------------------------- */}
            <section data-slot="log">
              <div className="rounded-[22px] bg-white p-5 shadow-[0_1px_2px_rgba(44,67,79,0.05),0_14px_34px_-18px_rgba(44,67,79,0.28)]">
                <div className="flex items-center justify-between px-2">
                  <h2 className="text-[10px] uppercase tracking-[0.22em]" style={{ color: C.mute }}>
                    Aktivitas
                  </h2>
                  <span className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.12em]" style={{ color: C.green }}>
                    <span className="h-1.5 w-1.5 rounded-full" style={{ background: C.green }} />
                    Hari ini
                  </span>
                </div>

                <div className="mt-2 divide-y divide-[#EEF0EB]">
                  {activities.map((a) => (
                    <button
                      key={a.id}
                      type="button"
                      onClick={a.onClick}
                      className="grid w-full grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-4 py-3 text-left transition-colors hover:bg-[#F7F8F4]"
                    >
                      <span className="font-mono text-[11px] font-semibold tabular-nums" style={{ color: C.faint }}>
                        {a.time}
                      </span>
                      <span className="truncate text-[13px]" style={{ color: C.ink }}>
                        {a.text}
                      </span>
                      <ChevronRight className="h-4 w-4" style={{ color: C.faint }} />
                    </button>
                  ))}
                </div>
              </div>
            </section>
          </div>
        </div>

        {/* footer links ---------------------------------------------- */}
        <div data-slot="footer" className="flex flex-wrap items-center justify-between gap-3 px-2 pb-2 text-[11px]">
          <div className="flex items-center gap-5">
            <button
              type="button"
              onClick={() => setIsFoodSafetyModalOpen(true)}
              className="inline-flex items-center gap-1.5 font-semibold transition-colors hover:text-[#F0935D]"
              style={{ color: C.inkSoft }}
            >
              <FileCheck className="h-3.5 w-3.5" style={{ color: C.green }} />
              Keamanan pangan
            </button>
            <button
              type="button"
              onClick={() => setIsVerificationModalOpen(true)}
              className="inline-flex items-center gap-1.5 font-semibold transition-colors hover:text-[#F0935D]"
              style={{ color: C.inkSoft }}
            >
              <ShieldCheck className="h-3.5 w-3.5" style={{ color: C.green }} />
              Legalitas usaha
            </button>
            <button
              type="button"
              onClick={() => navigateToOrdersWithFilter('confirmed')}
              className="inline-flex items-center gap-1.5 font-semibold transition-colors hover:text-[#F0935D]"
              style={{ color: C.inkSoft }}
            >
              <ShoppingBag className="h-3.5 w-3.5" style={{ color: C.green }} />
              Pesanan sedang disiapkan
            </button>
          </div>
          <span className="font-mono tabular-nums" style={{ color: C.faint }}>
            WIB
          </span>
        </div>
      </div>
    </div>
  );
};