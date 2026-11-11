import React from 'react';
import {
  Menu,
  Clock,
  ShieldCheck,
  MapPin,
  AlertTriangle,
  Receipt,
  Sparkles,
} from 'lucide-react';
import { AdminTab, AdminMacroStats } from './types';
import { formatRupiah } from '../../data/sisaPiringCatalog';

interface AdminTopInfoBarProps {
  activeTab: AdminTab;
  macroStats: AdminMacroStats;
  onMobileMenuToggle: () => void;
}

export const AdminTopInfoBar: React.FC<AdminTopInfoBarProps> = ({
  activeTab,
  macroStats,
  onMobileMenuToggle,
}) => {
  const tabTitles: Record<AdminTab, { title: string; subtitle: string }> = {
    overview: {
      title: 'Ringkasan Ekosistem & Dampak Makro',
      subtitle: 'Analisis metrik makro pencegahan sampah pangan Kota Bandung',
    },
    'seller-governance': {
      title: 'Tata Kelola Mitra UMKM (Kebutuhan Penjual)',
      subtitle: 'Verifikasi legalitas NIB, KTP, Halal/PIRT, dan uji higienitas dapur',
    },
    'product-curation': {
      title: 'Kurasi Menu & Kontrol Keamanan Pangan',
      subtitle: 'Monitoring batas aman konsumsi (prep window) & fitur take down',
    },
    'order-escrow': {
      title: 'Monitoring Pesanan & Rekening Escrow Platform',
      subtitle: 'Pelacakan alur pesanan real-time & keamanan dana bersama (escrow)',
    },
    'disputes-refund': {
      title: 'Pusat Komplain & Garansi Refund Pembeli',
      subtitle: 'Resolusi tiket sengketa konsumen dengan fasilitas refund 100% instan',
    },
    'reviews-moderation': {
      title: 'Ulasan & Kepuasan Pelanggan',
      subtitle: 'Pemantauan rating bintang dan transparansi testimoni warga',
    },
    'user-access': {
      title: 'Manajemen Akun & Hak Akses (RBAC)',
      subtitle: 'Pengaturan akun konsumen (buyer), mitra UMKM (seller), dan admin',
    },
  };

  const currentTabInfo = tabTitles[activeTab] || {
    title: 'Pusat Tata Kelola Platform',
    subtitle: 'Pengawasan operasional ekosistem SisaPiring',
  };

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-neutral-200/80 shadow-xs px-4 sm:px-6 lg:px-8 py-3.5 transition-colors">
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3">
        {/* Left Side: Mobile Menu Button + Contextual Tab Heading */}
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={onMobileMenuToggle}
            className="lg:hidden p-2 rounded-xl bg-neutral-100 hover:bg-neutral-200 text-neutral-800 transition-colors cursor-pointer shrink-0"
            title="Buka Navigasi Admin"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-extrabold text-neutral-900 tracking-tight truncate">
                {currentTabInfo.title}
              </h2>
              <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live Monitoring
              </span>
            </div>
            <p className="text-xs text-neutral-500 truncate mt-0.5">
              {currentTabInfo.subtitle}
            </p>
          </div>
        </div>

        {/* Right Side: Dense Real-time Operational Intelligence Bar */}
        <div className="flex flex-wrap items-center gap-2 sm:gap-2.5 shrink-0 text-xs">
          {/* 1. Operating Window Info Badge */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#FAF9F6] border border-neutral-200 rounded-xl text-neutral-700">
            <Clock className="w-3.5 h-3.5 text-[#EE4D2D] shrink-0" />
            <span className="font-semibold text-[11px]">
              Sesi Ambil: <strong className="font-mono text-neutral-900">17:00 - 21:30 WIB</strong>
            </span>
          </div>

          {/* 2. District & Jurisdiction Badge */}
          <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 bg-neutral-50 border border-neutral-200 rounded-xl text-neutral-700">
            <MapPin className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
            <span className="text-[11px] font-semibold">
              Wilayah: <strong className="text-neutral-900">Kota Bandung (5 Kec.)</strong>
            </span>
          </div>

          {/* 3. Escrow Security Status Badge */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 border border-indigo-100 rounded-xl text-indigo-900">
            <Receipt className="w-3.5 h-3.5 text-indigo-700 shrink-0" />
            <span className="text-[11px] font-semibold">
              Escrow Aktif: <strong className="font-mono text-indigo-950 font-bold">{formatRupiah(macroStats.totalEscrowHeld)}</strong>
            </span>
          </div>

          {/* 4. Critical Action Indicator Badge */}
          {macroStats.openDisputesCount > 0 ? (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 animate-pulse">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-600 shrink-0" />
              <span className="text-[11px] font-bold">
                {macroStats.openDisputesCount} Komplain Terbuka
              </span>
            </div>
          ) : macroStats.pendingUmkmCount > 0 ? (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-800">
              <Sparkles className="w-3.5 h-3.5 text-amber-600 shrink-0" />
              <span className="text-[11px] font-bold">
                {macroStats.pendingUmkmCount} KYB Menunggu Review
              </span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 border border-emerald-100 rounded-xl text-emerald-800">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
              <span className="text-[11px] font-semibold">
                SOP Pangan: <strong className="text-emerald-900 font-bold">Aman</strong>
              </span>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

