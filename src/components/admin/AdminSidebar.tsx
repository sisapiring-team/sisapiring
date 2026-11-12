import React from 'react';
import {
  LayoutGrid,
  Store,
  UtensilsCrossed,
  Receipt,
  ShieldAlert,
  Users,
  ExternalLink,
  ShoppingBag,
} from 'lucide-react';
import { AdminTab, AdminMacroStats } from './types';

interface AdminSidebarProps {
  activeTab: AdminTab;
  onTabChange: (tab: AdminTab) => void;
  macroStats: AdminMacroStats;
  onSwitchToPublicEtalase: () => void;
  onSwitchToSellerPortal?: () => void;
  expanded?: boolean;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  activeTab,
  onTabChange,
  macroStats,
  onSwitchToPublicEtalase,
  onSwitchToSellerPortal,
  expanded = false,
}) => {
  // 1. KELOMPOK MENU FITUR MONITORING (BLOK ATAS)
  const featureNavItems = [
    {
      id: 'overview' as AdminTab,
      canonicalId: 'overview' as AdminTab,
      label: 'Ringkasan Monitoring',
      icon: LayoutGrid,
      desc: 'Ikhtisar operasional & kesehatan ekosistem',
      hasDot: false,
    },
    {
      id: 'stores' as AdminTab,
      canonicalId: 'seller-governance' as AdminTab,
      label: 'Monitoring Toko Mitra',
      icon: Store,
      desc: 'Verifikasi legalitas & status toko',
      badge: macroStats.pendingUmkmCount,
      hasDot: true,
    },
    {
      id: 'products' as AdminTab,
      canonicalId: 'product-curation' as AdminTab,
      label: 'Monitoring Menu Sisa Piring',
      icon: UtensilsCrossed,
      desc: 'Batas jam aman konsumsi & take down',
      hasDot: true,
    },
    {
      id: 'orders' as AdminTab,
      canonicalId: 'order-escrow' as AdminTab,
      label: 'Monitoring Pesanan Pembeli',
      icon: Receipt,
      desc: 'Pelacakan transaksi & kode pickup',
      hasDot: false,
    },
    {
      id: 'complaints' as AdminTab,
      canonicalId: 'disputes-refund' as AdminTab,
      label: 'Monitoring Komplain & Refund',
      icon: ShieldAlert,
      desc: 'Laporan makanan & resolusi sengketa',
      badge: macroStats.openDisputesCount,
      hasDot: false,
    },
  ];

  // 2. KELOMPOK MENU AKUN & PROFIL (BLOK BAWAH)
  const accountNavItems = [
    {
      id: 'users' as AdminTab,
      canonicalId: 'user-access' as AdminTab,
      label: 'Manajemen Akun & Pengguna',
      icon: Users,
      desc: 'Pengaturan akun pembeli, mitra & admin',
      hasDot: false,
    },
  ];

  // Helper check active status
  const isItemActive = (item: { id: AdminTab; canonicalId: AdminTab }) => {
    return (
      activeTab === item.id ||
      activeTab === item.canonicalId ||
      (item.id === 'stores' && activeTab === 'seller-governance') ||
      (item.id === 'products' && activeTab === 'product-curation') ||
      (item.id === 'orders' && activeTab === 'order-escrow') ||
      (item.id === 'complaints' && activeTab === 'disputes-refund') ||
      (item.id === 'users' && activeTab === 'user-access')
    );
  };

  // ========================================================
  // 1. EXPANDED MODE (FOR MOBILE DRAWER)
  // ========================================================
  if (expanded) {
    return (
      <aside className="w-72 bg-[#0c141d] text-white flex flex-col h-full border-r border-white/10 shadow-2xl select-none">
        <div className="p-5 border-b border-white/10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300 font-bold shrink-0">
            <LayoutGrid className="w-5 h-5 text-cyan-300" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-sm text-white">SisaPiring</span>
              <span className="text-[9px] font-mono font-bold bg-cyan-500/20 text-cyan-300 px-1.5 py-0.2 rounded border border-cyan-300/30 uppercase">
                Admin
              </span>
            </div>
            <span className="text-[11px] text-cyan-200/70 block">Pusat Monitoring Bandung</span>
          </div>
        </div>

        <div className="flex-1 py-4 px-3 space-y-4 overflow-y-auto">
          {/* Kelompok 1: Menu Fitur */}
          <div>
            <span className="px-3 text-[10px] font-mono uppercase tracking-wider text-neutral-400 font-bold block mb-1.5">
              Menu Fitur Monitoring
            </span>
            <div className="space-y-1">
              {featureNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = isItemActive(item);

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onTabChange(item.canonicalId)}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs transition-colors cursor-pointer text-left ${
                      isActive
                        ? 'bg-cyan-500/20 text-white font-bold border border-cyan-400/40 shadow-sm'
                        : 'text-neutral-300 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                          isActive ? 'bg-cyan-500 text-neutral-950 font-bold' : 'bg-white/10 text-cyan-300'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <span className="truncate block font-semibold">{item.label}</span>
                        <span className="text-[10px] text-neutral-400 truncate block">{item.desc}</span>
                      </div>
                    </div>
                    {item.badge !== undefined && item.badge > 0 && (
                      <span className="px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold text-neutral-950 bg-cyan-400">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Kelompok 2: Menu Akun / Profil */}
          <div className="pt-2 border-t border-white/10">
            <span className="px-3 text-[10px] font-mono uppercase tracking-wider text-neutral-400 font-bold block mb-1.5">
              Menu Akun & Akses
            </span>
            <div className="space-y-1">
              {accountNavItems.map((item) => {
                const Icon = item.icon;
                const isActive = isItemActive(item);

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onTabChange(item.canonicalId)}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs transition-colors cursor-pointer text-left ${
                      isActive
                        ? 'bg-cyan-500/20 text-white font-bold border border-cyan-400/40 shadow-sm'
                        : 'text-neutral-300 hover:bg-white/5 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div
                        className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                          isActive ? 'bg-cyan-500 text-neutral-950 font-bold' : 'bg-white/10 text-cyan-300'
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <span className="truncate block font-semibold">{item.label}</span>
                        <span className="text-[10px] text-neutral-400 truncate block">{item.desc}</span>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="p-4 border-t border-white/10 space-y-2 bg-[#101924]">
          <button
            type="button"
            onClick={onSwitchToPublicEtalase}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-neutral-300 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
          >
            <ShoppingBag className="w-4 h-4 text-amber-400" />
            <span>Buka Etalase Pembeli</span>
          </button>
          {onSwitchToSellerPortal && (
            <button
              type="button"
              onClick={onSwitchToSellerPortal}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-neutral-300 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
            >
              <Store className="w-4 h-4 text-emerald-400" />
              <span>Buka Portal Mitra UMKM</span>
            </button>
          )}
        </div>
      </aside>
    );
  }

  // ========================================================
  // 2. DESKTOP MODE: 2 KELOMPOK TERPISAH (HANYA ADA BG DI KAPSUL FITUR, DI BAWAHNYA KOSONG)
  // ========================================================
  return (
    <>
      {/* ======================================================== */}
      {/* BLOK 1: KAPSUL MENU FITUR (HANYA INI YANG ADA BACKGROUND!) */}
      {/* ======================================================== */}
      <nav
        aria-label="Menu Fitur Monitoring"
        className="fixed left-4 top-20 z-30 w-14 xl:w-16 rounded-3xl bg-[#131c26]/90 border border-white/10 backdrop-blur-md shadow-2xl py-3 px-1.5 xl:px-2 flex flex-col items-center gap-2.5 select-none"
      >
        {featureNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = isItemActive(item);

          return (
            <div key={item.id} className="relative group w-full flex justify-center">
              <button
                type="button"
                onClick={() => onTabChange(item.canonicalId)}
                className={`w-10 h-10 xl:w-11 xl:h-11 rounded-2xl flex items-center justify-center transition-all cursor-pointer relative ${
                  isActive
                    ? 'bg-cyan-500/25 text-cyan-300 border border-cyan-400/50 shadow-lg shadow-cyan-500/20 scale-105'
                    : 'text-neutral-400 hover:text-white hover:bg-white/10 hover:scale-105'
                }`}
                aria-label={item.label}
              >
                <Icon className="w-5 h-5" />

                {/* Status Indicator Dot */}
                {item.hasDot && !isActive && (
                  <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-emerald-400 ring-2 ring-[#131c26]" />
                )}

                {/* Counter Badge Dot */}
                {item.badge !== undefined && item.badge > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-cyan-400 text-neutral-950 font-mono text-[9px] font-black flex items-center justify-center shadow-xs ring-2 ring-[#131c26]">
                    {item.badge}
                  </span>
                )}
              </button>

              {/* Floating Hover Tooltip on Right */}
              <div className="pointer-events-none absolute left-full ml-3.5 top-1/2 -translate-y-1/2 z-50 opacity-0 group-hover:opacity-100 transition-all duration-150 transform translate-x-1 group-hover:translate-x-0 whitespace-nowrap">
                <div className="bg-[#111923]/98 text-white px-3.5 py-2 rounded-xl shadow-2xl border border-white/15 text-left flex items-center gap-2.5 backdrop-blur-xl">
                  <div>
                    <span className="font-bold text-xs text-white block">{item.label}</span>
                    <span className="text-[10px] text-neutral-400 block">{item.desc}</span>
                  </div>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-cyan-400 text-neutral-950">
                      {item.badge}
                    </span>
                  )}
                </div>
                {/* Arrow */}
                <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-[#111923]" />
              </div>
            </div>
          );
        })}
      </nav>

      {/* ======================================================== */}
      {/* RUANG TENGAH KOSONG / TRANSPARAN (TIDAK ADA BACKGROUND) */}
      {/* ======================================================== */}

      {/* ======================================================== */}
      {/* BLOK 2: KELOMPOK AKUN & PROFIL (TERPISAH DI BAGIAN BAWAH) */}
      {/* ======================================================== */}
      <div
        aria-label="Menu Akun & Profil"
        className="fixed left-4 bottom-6 z-30 w-14 xl:w-16 rounded-3xl bg-[#131c26]/90 border border-white/10 backdrop-blur-md shadow-2xl py-2.5 px-1.5 xl:px-2 flex flex-col items-center gap-2 select-none"
      >
        {/* 1. Manajemen Akun Pengguna */}
        {accountNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = isItemActive(item);

          return (
            <div key={item.id} className="relative group w-full flex justify-center">
              <button
                type="button"
                onClick={() => onTabChange(item.canonicalId)}
                className={`w-10 h-10 xl:w-11 xl:h-11 rounded-2xl flex items-center justify-center transition-all cursor-pointer relative ${
                  isActive
                    ? 'bg-cyan-500/25 text-cyan-300 border border-cyan-400/50 shadow-lg shadow-cyan-500/20 scale-105'
                    : 'text-neutral-400 hover:text-white hover:bg-white/10 hover:scale-105'
                }`}
                aria-label={item.label}
              >
                <Icon className="w-5 h-5" />
              </button>

              {/* Hover Tooltip */}
              <div className="pointer-events-none absolute left-full ml-3.5 top-1/2 -translate-y-1/2 z-50 opacity-0 group-hover:opacity-100 transition-all duration-150 transform translate-x-1 group-hover:translate-x-0 whitespace-nowrap">
                <div className="bg-[#111923]/98 text-white px-3.5 py-2 rounded-xl shadow-2xl border border-white/15 text-left backdrop-blur-xl">
                  <span className="font-bold text-xs text-white block">{item.label}</span>
                  <span className="text-[10px] text-neutral-400 block">{item.desc}</span>
                </div>
                <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-[#111923]" />
              </div>
            </div>
          );
        })}

        {/* Separator Garis Tipis */}
        <div className="w-6 h-px bg-white/15 my-0.5" />

        {/* 2. Tombol Pintas Buka Etalase */}
        <div className="relative group w-full flex justify-center">
          <button
            type="button"
            onClick={onSwitchToPublicEtalase}
            className="w-10 h-10 xl:w-11 xl:h-11 rounded-2xl bg-white/5 hover:bg-white/15 text-neutral-300 hover:text-white border border-white/10 flex items-center justify-center transition-all cursor-pointer hover:scale-105"
            title="Buka Etalase Pembeli"
            aria-label="Buka Etalase Pembeli"
          >
            <ExternalLink className="w-4 h-4" />
          </button>

          <div className="pointer-events-none absolute left-full ml-3.5 top-1/2 -translate-y-1/2 z-50 opacity-0 group-hover:opacity-100 transition-all duration-150 transform translate-x-1 group-hover:translate-x-0 whitespace-nowrap">
            <div className="bg-[#111923]/98 text-white px-3 py-1.5 rounded-xl shadow-2xl border border-white/15 text-left backdrop-blur-xl">
              <span className="font-bold text-xs text-white block">Pintas Etalase Konsumen</span>
              <span className="text-[10px] text-neutral-400 block">Buka tampilan pasar sisa piring</span>
            </div>
            <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-[#111923]" />
          </div>
        </div>

        {/* 3. Avatar Profil Super Administrator (SA) */}
        <div className="relative group w-full flex justify-center">
          <div
            onClick={onSwitchToSellerPortal}
            className="w-9 h-9 xl:w-10 xl:h-10 rounded-2xl bg-cyan-600/70 hover:bg-cyan-500 border border-cyan-400/40 text-cyan-100 font-extrabold text-xs flex items-center justify-center shadow-lg transition-transform hover:scale-105 cursor-pointer"
            title="Profil Super Administrator"
          >
            SA
          </div>

          <div className="pointer-events-none absolute left-full ml-3.5 top-1/2 -translate-y-1/2 z-50 opacity-0 group-hover:opacity-100 transition-all duration-150 transform translate-x-1 group-hover:translate-x-0 whitespace-nowrap">
            <div className="bg-[#111923]/98 text-white px-3 py-1.5 rounded-xl shadow-2xl border border-white/15 text-left backdrop-blur-xl">
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-xs text-white">Super Administrator</span>
                <span className="text-[9px] text-emerald-400 font-bold bg-emerald-500/10 px-1 rounded">
                  Online
                </span>
              </div>
              <span className="text-[10px] text-neutral-400 block">admin@sisapiring.id</span>
            </div>
            <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-[#111923]" />
          </div>
        </div>
      </div>
    </>
  );
};
