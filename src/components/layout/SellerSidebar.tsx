import React, { useState } from 'react';
import {
  LayoutDashboard,
  UtensilsCrossed,
  ShoppingBag,
  Sparkles,
  QrCode,
  BarChart3,
  Store,
  Settings,
  LogOut,
  ShoppingBag as MarketplaceIcon,
  CheckCircle2,
  Clock,
  XCircle,
  FileCheck,
} from 'lucide-react';
import { ActiveTab, useApp } from '../../context/AppContext';
import { ConfirmationModal } from '../common/ConfirmationModal';

interface NavItem {
  id: ActiveTab;
  label: string;
  icon: React.ElementType;
  badge?: number | string;
}

export const SellerSidebar: React.FC = () => {
  const { activeTab, setActiveTab, orders, products, sellerProfile, showToast, setIsVerificationModalOpen } = useApp();
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  // Calculate pending counts
  const pendingOrdersCount = orders.filter((o) => o.status === 'waiting_confirmation').length;
  const criticalProductsCount = products.filter((p) => p.isActive && p.stock > 0 && p.discountPercentage < 70).length;

  const navItems: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'products', label: 'Produk Saya', icon: UtensilsCrossed, badge: products.length },
    {
      id: 'orders',
      label: 'Pesanan Masuk',
      icon: ShoppingBag,
      badge: pendingOrdersCount > 0 ? `${pendingOrdersCount} baru` : undefined,
    },
    {
      id: 'rescue_deals',
      label: 'Rescue Deals',
      icon: Sparkles,
      badge: criticalProductsCount > 0 ? `${criticalProductsCount} saran` : undefined,
    },
    { id: 'qr_pickup', label: 'Verifikasi Pengambilan', icon: QrCode },
    { id: 'analytics', label: 'Statistik & Dampak', icon: BarChart3 },
    { id: 'profile', label: 'Profil Usaha', icon: Store },
    { id: 'settings', label: 'Pengaturan', icon: Settings },
  ];

  const handleLogout = () => {
    setShowLogoutModal(false);
    showToast('Keluar Berhasil', 'Sesi sesi portal mitra telah ditutup.', 'info');
  };

  return (
    <>
      <aside className="w-64 bg-[#16382C] text-white flex flex-col shrink-0 border-r border-[#16382C]/50 select-none">
        {/* Brand Header */}
        <div className="p-5 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#EE4D2D] flex items-center justify-center font-bold text-white text-lg shadow-sm">
              S
            </div>
            <div>
              <span className="font-bold text-base tracking-tight text-white block leading-tight">
                SisaPiring
              </span>
              <span className="text-[11px] font-medium text-white/70 block leading-tight tracking-wider uppercase">
                Portal Mitra UMKM
              </span>
            </div>
          </div>
        </div>

        {/* Store Verification Card */}
        <div
          onClick={() => setIsVerificationModalOpen(true)}
          className="px-4 py-3 mx-3 my-3 bg-white/5 hover:bg-white/10 rounded-xl border border-white/10 cursor-pointer transition-colors group"
          title="Klik untuk melihat rincian verifikasi resmi"
        >
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-xs font-semibold text-white/90 truncate max-w-[140px] group-hover:text-white">
              {sellerProfile.businessName}
            </span>
            {sellerProfile.verificationStatus === 'verified' ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[#FFD230]">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#FFD230]" />
                Verifikasi
              </span>
            ) : sellerProfile.verificationStatus === 'pending_review' ? (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-300">
                <Clock className="w-3.5 h-3.5 text-amber-300" />
                Tinjauan
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-rose-300">
                <XCircle className="w-3.5 h-3.5 text-rose-300" />
                Ditolak
              </span>
            )}
          </div>
          <div className="flex items-center text-[11px] text-white/60">
            <span>Kec. {sellerProfile.district}</span>
            <span className="mx-1.5">·</span>
            <span>Kota Bandung</span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-white/15 text-white font-semibold shadow-xs'
                    : 'text-white/75 hover:bg-white/10 hover:text-white'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Icon
                    className={`w-4 h-4 shrink-0 ${
                      isActive ? 'text-[#FFD230]' : 'text-white/60'
                    }`}
                  />
                  <span className="truncate">{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[11px] font-mono px-2 py-0.5 rounded-full ${
                      typeof item.badge === 'string' && item.badge.includes('baru')
                        ? 'bg-[#EE4D2D] text-white font-bold'
                        : typeof item.badge === 'string' && item.badge.includes('saran')
                        ? 'bg-[#FFD230] text-[#16382C] font-semibold'
                        : 'bg-white/10 text-white/80'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}

          {/* Registration / Verification Wizard Link */}
          <button
            onClick={() => setActiveTab('registration')}
            className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors ${
              activeTab === 'registration'
                ? 'bg-white/15 text-white font-semibold'
                : 'text-white/75 hover:bg-white/10 hover:text-white'
            }`}
          >
            <div className="flex items-center gap-3 min-w-0">
              <FileCheck
                className={`w-4 h-4 shrink-0 ${
                  activeTab === 'registration' ? 'text-[#FFD230]' : 'text-white/60'
                }`}
              />
              <span className="truncate">Verifikasi UMKM</span>
            </div>
            <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-white/10 text-white/70">
              Flow
            </span>
          </button>
        </nav>

        {/* Marketplace Mode Switcher & Logout */}
        <div className="p-3 border-t border-white/10 space-y-2">
          {/* Marketplace test link */}
          <button
            onClick={() => setActiveTab('marketplace')}
            className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold bg-[#FAF9F6] text-[#16382C] hover:bg-white transition-all shadow-xs group"
          >
            <div className="flex items-center gap-2">
              <MarketplaceIcon className="w-4 h-4 text-[#EE4D2D]" />
              <span>Etalase Pembeli</span>
            </div>
            <span className="text-[10px] font-medium bg-[#16382C]/10 text-[#16382C] px-1.5 py-0.5 rounded group-hover:bg-[#16382C] group-hover:text-white transition-colors">
              Pratinjau
            </span>
          </button>

          {/* Admin Governance link */}
          <button
            onClick={() => setActiveTab('admin')}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold bg-white/10 text-white hover:bg-white/20 transition-all group"
          >
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#FFD230]" />
              <span>Panel Admin</span>
            </div>
            <span className="text-[10px] font-medium bg-amber-400/20 text-[#FFD230] px-1.5 py-0.5 rounded">
              Gov
            </span>
          </button>

          {/* Logout button */}
          <button
            onClick={() => setShowLogoutModal(true)}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-white/60 hover:text-white hover:bg-white/5 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Keluar Portal</span>
          </button>
        </div>
      </aside>

      <ConfirmationModal
        isOpen={showLogoutModal}
        title="Keluar dari Portal Mitra?"
        message="Anda akan mengakhiri sesi dashboard mitra UMKM SisaPiring. Anda dapat masuk kembali kapan saja."
        confirmLabel="Keluar"
        cancelLabel="Tetap di Dashboard"
        onConfirm={handleLogout}
        onCancel={() => setShowLogoutModal(false)}
      />
    </>
  );
};
