import React from 'react';
import {
  TrendingUp,
  Store,
  PackageCheck,
  Receipt,
  AlertTriangle,
  Star,
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
  // LENGKAP 7 MENU FITUR & MONITORING (SEMUA MASUK DI BLOK ATAS)
  const navItems = [
    {
      id: 'overview' as AdminTab,
      label: 'Ringkasan & Dampak',
      icon: TrendingUp,
      desc: 'Metrik makro & statistik',
    },
    {
      id: 'seller-governance' as AdminTab,
      label: 'Mitra UMKM (Penjual)',
      icon: Store,
      desc: 'Verifikasi legalitas KYB',
      badge: macroStats.pendingUmkmCount,
      badgeColor: 'bg-amber-500',
    },
    {
      id: 'product-curation' as AdminTab,
      label: 'Menu & Food Safety',
      icon: PackageCheck,
      desc: 'Kurasi & kontrol take down',
    },
    {
      id: 'order-escrow' as AdminTab,
      label: 'Pesanan & Escrow',
      icon: Receipt,
      desc: 'Pelacakan rekening bersama',
    },
    {
      id: 'disputes-refund' as AdminTab,
      label: 'Komplain & Refund',
      icon: AlertTriangle,
      desc: 'Pusat garansi pembeli',
      badge: macroStats.openDisputesCount,
      badgeColor: 'bg-rose-500',
    },
    {
      id: 'reviews-moderation' as AdminTab,
      label: 'Ulasan & Kepuasan',
      icon: Star,
      desc: 'Rating & testimoni warga',
    },
    {
      id: 'user-access' as AdminTab,
      label: 'Manajemen Akun',
      icon: Users,
      desc: 'Hak akses pengguna (RBAC)',
    },
  ];

  // Helper check active tab
  const isItemActive = (id: AdminTab) => {
    if (activeTab === id) return true;
    if (id === 'seller-governance' && (activeTab as string) === 'stores') return true;
    if (id === 'product-curation' && (activeTab as string) === 'products') return true;
    if (id === 'order-escrow' && (activeTab as string) === 'orders') return true;
    if (id === 'disputes-refund' && (activeTab as string) === 'complaints') return true;
    if (id === 'user-access' && (activeTab as string) === 'users') return true;
    return false;
  };

  // ========================================================
  // 1. EXPANDED MODE (FOR MOBILE DRAWER)
  // ========================================================
  if (expanded) {
    return (
      <aside className="w-72 bg-[#0c141d] text-white flex flex-col h-full border-r border-white/10 shadow-2xl select-none">
        <div className="p-5 border-b border-white/10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-300 font-bold shrink-0">
            <TrendingUp className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-sm text-white">SisaPiring</span>
              <span className="text-[9px] font-mono font-bold bg-cyan-500/20 text-cyan-300 px-1.5 py-0.2 rounded border border-cyan-300/30 uppercase">
                Admin
              </span>
            </div>
            <span className="text-[11px] text-neutral-400 block">Pusat Monitoring Bandung</span>
          </div>
        </div>

        <div className="flex-1 py-4 px-3 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = isItemActive(item.id);

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs transition-colors cursor-pointer text-left ${
                  isActive
                    ? 'bg-amber-400 text-neutral-950 font-bold shadow-md shadow-amber-400/20'
                    : 'text-neutral-300 hover:bg-white/5 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${
                      isActive ? 'bg-neutral-950 text-amber-400 font-bold' : 'bg-white/10 text-neutral-300'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="truncate block font-semibold">{item.label}</span>
                    <span
                      className={`text-[10px] truncate block ${
                        isActive ? 'text-neutral-800' : 'text-neutral-400'
                      }`}
                    >
                      {item.desc}
                    </span>
                  </div>
                </div>
                {item.badge !== undefined && item.badge > 0 && (
                  <span
                    className={`px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold text-white ${
                      item.badgeColor || 'bg-amber-500'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
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
  // 2. DESKTOP MODE: DUA KELOMPOK TERPISAH
  // Kapsul Atas (7 Menu Fitur & Akun dengan Background)
  // Ke Bawahnya TIDAK ADA Background (Transparan)
  // Kapsul Bawah (Pintas Etalase & Avatar Profil SA)
  // ========================================================
  return (
    <>
      {/* ======================================================== */}
      {/* BLOK 1: KAPSUL 7 MENU FITUR & MONITORING (LENGKAP!) */}
      {/* HANYA DI BAGIAN INI SAJA YANG ADA BACKGROUND KAPSUL GELAP */}
      {/* ======================================================== */}
      <nav
        aria-label="Menu Fitur Monitoring"
        className="fixed left-4 top-20 z-30 w-14 xl:w-16 rounded-3xl bg-[#131c26]/90 border border-white/10 backdrop-blur-md shadow-2xl py-3 px-1.5 xl:px-2 flex flex-col items-center gap-2 select-none"
      >
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = isItemActive(item.id);

          return (
            <div key={item.id} className="relative group w-full flex justify-center">
              <button
                type="button"
                onClick={() => onTabChange(item.id)}
                className={`w-10 h-10 xl:w-11 xl:h-11 rounded-2xl flex items-center justify-center transition-all cursor-pointer relative ${
                  isActive
                    ? 'bg-amber-400 text-neutral-950 font-bold shadow-lg shadow-amber-400/25 scale-105'
                    : 'text-neutral-300 hover:text-white hover:bg-white/10 hover:scale-105'
                }`}
                aria-label={item.label}
              >
                <Icon className="w-5 h-5" />

                {/* Counter Badge Dot */}
                {item.badge !== undefined && item.badge > 0 && (
                  <span
                    className={`absolute -top-1 -right-1 w-4 h-4 rounded-full ${
                      item.badgeColor || 'bg-amber-500'
                    } text-white font-mono text-[9px] font-black flex items-center justify-center shadow-xs ring-2 ring-[#131c26]`}
                  >
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
                    <span
                      className={`px-1.5 py-0.5 rounded-full text-[9px] font-bold text-white ${
                        item.badgeColor || 'bg-amber-500'
                      }`}
                    >
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
      {/* RUANG TENGAH TRANSPARAN (KE BAWAHNYA TIDAK ADA BACKGROUND) */}
      {/* ======================================================== */}

      {/* ======================================================== */}
      {/* BLOK 2: MENU AKSI / PROFIL (TERPISAH MANDIRI DI BAWAH) */}
      {/* ======================================================== */}
      <div
        aria-label="Aksi Profil & Portal"
        className="fixed left-4 bottom-6 z-30 w-14 xl:w-16 rounded-3xl bg-[#131c26]/90 border border-white/10 backdrop-blur-md shadow-2xl py-2.5 px-1.5 xl:px-2 flex flex-col items-center gap-2 select-none"
      >
        {/* Tombol Pintas Buka Etalase Pembeli */}
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

        {/* Profil Super Administrator (SA) */}
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
