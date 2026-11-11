import React from 'react';
import {
  ShieldCheck,
  ShoppingBag,
  Store,
  TrendingUp,
  PackageCheck,
  Receipt,
  AlertTriangle,
  Star,
  Users,
} from 'lucide-react';
import { AdminTab, AdminMacroStats } from './types';

interface AdminHeaderProps {
  activeTab: AdminTab;
  onTabChange: (tab: AdminTab) => void;
  macroStats: AdminMacroStats;
  onSwitchToPublicEtalase: () => void;
  onSwitchToSellerPortal?: () => void;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  activeTab,
  onTabChange,
  macroStats,
  onSwitchToPublicEtalase,
  onSwitchToSellerPortal,
}) => {
  const tabs = [
    { id: 'overview', label: 'Ringkasan & Dampak', icon: TrendingUp },
    {
      id: 'seller-governance',
      label: 'Mitra UMKM (Sisi Penjual)',
      icon: Store,
      badge: macroStats.pendingUmkmCount,
    },
    { id: 'product-curation', label: 'Menu & Keamanan Pangan', icon: PackageCheck },
    { id: 'order-escrow', label: 'Pesanan & Escrow', icon: Receipt },
    {
      id: 'disputes-refund',
      label: 'Komplain & Refund (Sisi User)',
      icon: AlertTriangle,
      badge: macroStats.openDisputesCount,
      badgeColor: 'bg-rose-500',
    },
    { id: 'reviews-moderation', label: 'Ulasan & Kepuasan', icon: Star },
    { id: 'user-access', label: 'Manajemen Akun (RBAC)', icon: Users },
  ];

  return (
    <header className="sticky top-0 z-40 bg-[#16382C] text-white border-b border-emerald-900 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Brand & Portal Role Identifier */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-300 font-bold shrink-0">
              <ShieldCheck className="w-5 h-5 text-amber-300" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h1 className="font-extrabold text-sm sm:text-base tracking-tight text-white truncate">
                  Pusat Tata Kelola Platform
                </h1>
                <span className="text-[10px] font-mono font-bold bg-amber-400/20 text-amber-300 px-2 py-0.5 rounded-full border border-amber-300/30 shrink-0">
                  Admin Console
                </span>
              </div>
              <p className="text-[11px] text-emerald-200/80 truncate">
                Penyelarasan Menu Konsumen (User) & Menu Mitra UMKM (Penjual) Bandung
              </p>
            </div>
          </div>

          {/* Quick Cross-Portal Switcher Actions */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={onSwitchToPublicEtalase}
              title="Buka Etalase Pembeli"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-white/10 hover:bg-white/20 text-emerald-100 transition-colors border border-white/10 cursor-pointer"
            >
              <ShoppingBag className="w-3.5 h-3.5 text-amber-300" />
              <span className="hidden sm:inline">Etalase Pembeli</span>
            </button>

            <button
              type="button"
              onClick={onSwitchToSellerPortal}
              title="Buka Portal Mitra UMKM"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-emerald-700/80 hover:bg-emerald-600 text-white transition-colors border border-emerald-500/30 cursor-pointer"
            >
              <Store className="w-3.5 h-3.5 text-emerald-200" />
              <span className="hidden sm:inline">Portal Penjual</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tab Navigation Menu */}
      <div className="bg-[#122e24] border-t border-emerald-950/60 overflow-x-auto scrollbar-none">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center gap-1 sm:gap-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => onTabChange(tab.id as AdminTab)}
                className={`flex items-center gap-2 py-3 px-3 sm:px-4 text-xs font-semibold whitespace-nowrap transition-colors border-b-2 cursor-pointer ${
                  isActive
                    ? 'border-amber-400 text-white bg-white/5 font-bold'
                    : 'border-transparent text-emerald-200/70 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon
                  className={`w-3.5 h-3.5 ${
                    isActive ? 'text-amber-400' : 'text-emerald-300/70'
                  }`}
                />
                <span>{tab.label}</span>
                {tab.badge !== undefined && tab.badge > 0 && (
                  <span
                    className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono font-bold text-white ${
                      tab.badgeColor || 'bg-amber-500'
                    }`}
                  >
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
};
