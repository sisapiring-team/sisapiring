import React from 'react';
import {
  ShieldCheck,
  TrendingUp,
  Store,
  PackageCheck,
  Receipt,
  AlertTriangle,
  Star,
  Users,
  ShoppingBag,
  ExternalLink,
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

  // ==========================================
  // 1. EXPANDED MODE (FOR MOBILE DRAWER)
  // ==========================================
  if (expanded) {
    return (
      <aside className="w-72 bg-[#122e24] text-white flex flex-col h-full border-r border-emerald-950/80 shadow-2xl select-none">
        <div className="p-5 border-b border-white/10 flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-300 font-bold shrink-0">
            <ShieldCheck className="w-6 h-6 text-amber-300" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-sm text-white">SisaPiring</span>
              <span className="text-[9px] font-mono font-bold bg-amber-400/20 text-amber-300 px-1.5 py-0.2 rounded border border-amber-300/30 uppercase">
                Admin
              </span>
            </div>
            <span className="text-[11px] text-emerald-200/70 block">Pusat Tata Kelola Bandung</span>
          </div>
        </div>

        <div className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-2xl text-xs transition-colors cursor-pointer text-left ${isActive
                    ? 'bg-emerald-800 text-white font-bold border border-emerald-600/40 shadow-sm'
                    : 'text-emerald-100/75 hover:bg-white/5 hover:text-white'
                  }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${isActive ? 'bg-amber-400 text-neutral-950' : 'bg-white/10 text-emerald-300'
                      }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="block truncate text-xs">{item.label}</span>
                    <span className="block text-[10px] text-emerald-300/60 truncate">{item.desc}</span>
                  </div>
                </div>
                {item.badge !== undefined && item.badge > 0 && (
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold text-white ${item.badgeColor || 'bg-amber-500'
                      }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="p-3 border-t border-white/10 space-y-2 bg-[#0e241c]">
          <button
            type="button"
            onClick={onSwitchToPublicEtalase}
            className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold bg-white/5 hover:bg-white/10 text-emerald-100 border border-white/5 cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-amber-300" />
              <span>Etalase Pembeli</span>
            </div>
            <ExternalLink className="w-3.5 h-3.5 text-emerald-400/60" />
          </button>

          <button
            type="button"
            onClick={onSwitchToSellerPortal}
            className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold bg-emerald-700/60 hover:bg-emerald-600 text-white border border-emerald-500/30 cursor-pointer"
          >
            <div className="flex items-center gap-2">
              <Store className="w-4 h-4 text-emerald-200" />
              <span>Portal Mitra UMKM</span>
            </div>
            <ExternalLink className="w-3.5 h-3.5 text-emerald-300/60" />
          </button>
        </div>
      </aside>
    );
  }

  // ==========================================
  // 2. SLIM ICON-ONLY RAIL (DEFAULT DESKTOP)
  // Width: w-16 (64px) or xl:w-20 (80px)
  // Hover Tooltips dynamically popup on right
  // ==========================================
  return (
    <aside className="w-16 xl:w-20 bg-[#122e24] text-white flex flex-col h-full border-r border-emerald-950/80 shadow-xl select-none shrink-0 z-40">
      {/* 1. Brand Logo Shield with Hover Tooltip */}
      <div className="relative group p-3 xl:p-4 flex items-center justify-center border-b border-white/10">
        <div className="w-10 h-10 xl:w-11 xl:h-11 rounded-2xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-300 font-bold shrink-0 shadow-inner cursor-default transition-transform group-hover:scale-105">
          <ShieldCheck className="w-5 h-5 xl:w-6 xl:h-6 text-amber-300" />
        </div>

        {/* Hover Tooltip Popup */}
        <div className="absolute left-full ml-3.5 px-3.5 py-2 bg-neutral-900/95 backdrop-blur-md text-white rounded-xl shadow-2xl border border-white/15 pointer-events-none opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-150 z-50 whitespace-nowrap">
          <div className="flex items-center gap-1.5">
            <span className="font-extrabold text-xs text-white">SisaPiring Admin</span>
            <span className="text-[9px] font-mono font-bold bg-amber-400/20 text-amber-300 px-1 rounded uppercase">
              Bandung
            </span>
          </div>
          <span className="text-[10px] text-emerald-300/80 block mt-0.5">
            Pusat Tata Kelola Platform Terpadu
          </span>
          {/* Tooltip arrow */}
          <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-neutral-900/95" />
        </div>
      </div>

      {/* 2. Slim Vertical Navigation Rail */}
      <div className="flex-1 py-4 px-2 xl:px-3 space-y-2.5 overflow-y-auto overflow-x-visible scrollbar-none flex flex-col items-center">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <div key={item.id} className="relative group flex items-center justify-center w-full">
              <button
                type="button"
                onClick={() => onTabChange(item.id)}
                className={`w-11 h-11 xl:w-12 xl:h-12 rounded-2xl flex items-center justify-center transition-all cursor-pointer relative ${isActive
                    ? 'bg-amber-400 text-neutral-950 font-bold shadow-md shadow-amber-400/20 scale-105'
                    : 'text-emerald-100/70 hover:bg-white/10 hover:text-white hover:scale-105'
                  }`}
                aria-label={item.label}
              >
                <Icon className="w-5 h-5" />

                {/* Counter Badge Dot */}
                {item.badge !== undefined && item.badge > 0 && (
                  <span
                    className={`absolute -top-1 -right-1 w-4 h-4 rounded-full ${item.badgeColor || 'bg-amber-500'
                      } text-white font-mono text-[9px] font-bold flex items-center justify-center shadow-xs border-2 border-[#122e24]`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>

              {/* Floating Hover Tooltip on Mouse Enter */}
              <div className="absolute left-full ml-3 px-3 py-2 bg-neutral-900/95 backdrop-blur-md text-white rounded-xl shadow-2xl border border-white/15 pointer-events-none opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-150 z-50 whitespace-nowrap">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-xs text-white">{item.label}</span>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span
                      className={`px-1.5 py-0.2 rounded-full text-[9px] font-bold text-white ${item.badgeColor || 'bg-amber-500'
                        }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </div>
                <span className="text-[10px] text-emerald-300/80 block mt-0.5">{item.desc}</span>
                {/* Tooltip arrow */}
                <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-neutral-900/95" />
              </div>
            </div>
          );
        })}
      </div>

      {/* 3. Bottom Slim Actions (Portal Switchers & Profile) */}
      <div className="p-2 border-t border-white/10 space-y-2 bg-[#0e241c] flex flex-col items-center">
        {/* Etalase Pembeli Icon Action */}
        <div className="relative group">
          <button
            type="button"
            onClick={onSwitchToPublicEtalase}
            className="w-10 h-10 rounded-xl flex items-center justify-center bg-white/5 hover:bg-white/15 text-amber-300 transition-colors cursor-pointer border border-white/5"
            aria-label="Buka Etalase Pembeli"
          >
            <ShoppingBag className="w-4 h-4" />
          </button>
          <div className="absolute left-full ml-3 px-3 py-1.5 bg-neutral-900/95 backdrop-blur-md text-white rounded-xl shadow-xl border border-white/15 pointer-events-none opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-150 z-50 whitespace-nowrap">
            <span className="font-bold text-xs text-white block">Buka Etalase Pembeli</span>
            <span className="text-[10px] text-neutral-400 block">Uji coba simulasi belanja konsumen</span>
            <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-neutral-900/95" />
          </div>
        </div>

        {/* Portal Mitra UMKM Icon Action */}
        <div className="relative group">
          <button
            type="button"
            onClick={onSwitchToSellerPortal}
            className="w-10 h-10 rounded-xl flex items-center justify-center bg-emerald-700/60 hover:bg-emerald-600 text-white transition-colors cursor-pointer border border-emerald-500/30"
            aria-label="Buka Portal Mitra UMKM"
          >
            <Store className="w-4 h-4 text-emerald-200" />
          </button>
          <div className="absolute left-full ml-3 px-3 py-1.5 bg-neutral-900/95 backdrop-blur-md text-white rounded-xl shadow-xl border border-white/15 pointer-events-none opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-150 z-50 whitespace-nowrap">
            <span className="font-bold text-xs text-white block">Buka Portal Mitra UMKM</span>
            <span className="text-[10px] text-neutral-400 block">Uji coba pesanan & produk seller</span>
            <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-neutral-900/95" />
          </div>
        </div>

        {/* Admin Profile Circle */}
        <div className="relative group pt-1">
          <div className="w-9 h-9 rounded-full bg-emerald-800 text-white flex items-center justify-center font-bold text-xs cursor-default border border-emerald-600/50">
            AD
            <span className="absolute bottom-1 right-1 w-2.5 h-2.5 bg-emerald-400 border-2 border-[#0e241c] rounded-full" />
          </div>
          <div className="absolute left-full ml-3 px-3 py-1.5 bg-neutral-900/95 backdrop-blur-md text-white rounded-xl shadow-xl border border-white/15 pointer-events-none opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-150 z-50 whitespace-nowrap">
            <span className="font-bold text-xs text-white block">Admin Tata Kelola</span>
            <span className="text-[10px] text-emerald-300 block">Diskominfokot Bandung • Online</span>
            <div className="absolute right-full top-1/2 -translate-y-1/2 border-4 border-transparent border-r-neutral-900/95" />
          </div>
        </div>
      </div>
    </aside>
  );
};
