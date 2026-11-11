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
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';
import { AdminTab, AdminMacroStats } from './types';

interface AdminSidebarProps {
  activeTab: AdminTab;
  onTabChange: (tab: AdminTab) => void;
  macroStats: AdminMacroStats;
  onSwitchToPublicEtalase: () => void;
  onSwitchToSellerPortal?: () => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({
  activeTab,
  onTabChange,
  macroStats,
  onSwitchToPublicEtalase,
  onSwitchToSellerPortal,
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

  return (
    <aside className="w-64 xl:w-72 bg-[#122e24] text-white flex flex-col h-full border-r border-emerald-950/80 shadow-xl select-none">
      {/* 1. Header Brand & Platform Scope */}
      <div className="p-5 border-b border-white/10 flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-300 font-bold shrink-0 shadow-inner">
          <ShieldCheck className="w-6 h-6 text-amber-300" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="font-extrabold text-sm tracking-tight text-white block">
              SisaPiring
            </span>
            <span className="text-[9px] font-mono font-bold bg-amber-400/20 text-amber-300 px-1.5 py-0.2 rounded border border-amber-300/30 uppercase">
              Admin
            </span>
          </div>
          <span className="text-[11px] text-emerald-200/70 block truncate">
            Pusat Tata Kelola Bandung
          </span>
        </div>
      </div>

      {/* 2. Navigation Items List */}
      <div className="flex-1 px-3 py-4 space-y-1 overflow-y-auto scrollbar-thin scrollbar-thumb-emerald-900 scrollbar-track-transparent">
        <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-emerald-300/50">
          Menu Pengawasan Ekosistem
        </div>

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onTabChange(item.id)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-2xl text-xs transition-all cursor-pointer group text-left ${
                isActive
                  ? 'bg-emerald-800/80 text-white font-bold shadow-sm border border-emerald-600/40'
                  : 'text-emerald-100/75 hover:bg-white/5 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                    isActive
                      ? 'bg-amber-400 text-neutral-950 font-bold'
                      : 'bg-white/10 text-emerald-300 group-hover:bg-white/15 group-hover:text-white'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <span className="block truncate text-xs">{item.label}</span>
                  <span
                    className={`block text-[10px] truncate ${
                      isActive ? 'text-emerald-200/90' : 'text-emerald-300/50'
                    }`}
                  >
                    {item.desc}
                  </span>
                </div>
              </div>

              {item.badge !== undefined && item.badge > 0 ? (
                <span
                  className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold text-white shrink-0 ${
                    item.badgeColor || 'bg-amber-500'
                  }`}
                >
                  {item.badge}
                </span>
              ) : (
                <ChevronRight
                  className={`w-3.5 h-3.5 transition-transform shrink-0 ${
                    isActive
                      ? 'text-amber-300 translate-x-0.5'
                      : 'text-white/20 group-hover:text-white/50'
                  }`}
                />
              )}
            </button>
          );
        })}
      </div>

      {/* 3. Cross-Portal Quick Jump Actions */}
      <div className="p-3 border-t border-white/10 space-y-1.5 bg-[#0e241c]">
        <div className="px-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-emerald-300/50 flex items-center justify-between">
          <span>Pintas Portal</span>
          <span className="text-[9px] text-emerald-400/60 font-mono">Live Demo</span>
        </div>

        <button
          type="button"
          onClick={onSwitchToPublicEtalase}
          className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold bg-white/5 hover:bg-white/10 text-emerald-100 transition-colors border border-white/5 cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-3.5 h-3.5 text-amber-300" />
            <span>Etalase Pembeli</span>
          </div>
          <ExternalLink className="w-3 h-3 text-emerald-400/60" />
        </button>

        <button
          type="button"
          onClick={onSwitchToSellerPortal}
          className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold bg-emerald-700/60 hover:bg-emerald-600 text-white transition-colors border border-emerald-500/30 cursor-pointer"
        >
          <div className="flex items-center gap-2">
            <Store className="w-3.5 h-3.5 text-emerald-200" />
            <span>Portal Mitra UMKM</span>
          </div>
          <ExternalLink className="w-3 h-3 text-emerald-300/60" />
        </button>
      </div>

      {/* 4. Operator / Governance Profile Footer */}
      <div className="p-4 border-t border-white/10 bg-[#0b1c16] flex items-center justify-between text-xs">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="relative">
            <div className="w-8 h-8 rounded-full bg-emerald-700 text-white flex items-center justify-center font-bold text-xs">
              AD
            </div>
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 border-2 border-[#0b1c16] rounded-full" />
          </div>
          <div className="min-w-0">
            <span className="font-bold text-white block text-xs truncate">Admin Tata Kelola</span>
            <span className="text-[10px] text-emerald-300/60 block truncate">Diskominfokot Bandung</span>
          </div>
        </div>
      </div>
    </aside>
  );
};
