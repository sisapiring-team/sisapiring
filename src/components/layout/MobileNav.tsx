import React from 'react';
import {
  LayoutDashboard,
  UtensilsCrossed,
  ShoppingBag,
  QrCode,
  Sparkles,
  BarChart3,
  Store,
  Settings,
  X,
  FileCheck,
  ShoppingBag as MarketplaceIcon,
  ShieldCheck,
} from 'lucide-react';
import { ActiveTab, useApp } from '../../context/AppContext';

interface MobileNavProps {
  isOpen: boolean;
  onClose: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ isOpen, onClose }) => {
  const { activeTab, setActiveTab, orders, products, sellerProfile } = useApp();

  const pendingOrders = orders.filter((o) => o.status === 'waiting_confirmation').length;

  const navItems = [
    { id: 'dashboard' as ActiveTab, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'products' as ActiveTab, label: 'Produk Saya', icon: UtensilsCrossed, badge: products.length },
    {
      id: 'orders' as ActiveTab,
      label: 'Pesanan Masuk',
      icon: ShoppingBag,
      badge: pendingOrders > 0 ? pendingOrders : undefined,
    },
    { id: 'rescue_deals' as ActiveTab, label: 'Rescue Deals & Diskon', icon: Sparkles },
    { id: 'qr_pickup' as ActiveTab, label: 'Verifikasi Pengambilan QR', icon: QrCode },
    { id: 'analytics' as ActiveTab, label: 'Statistik & Dampak', icon: BarChart3 },
    { id: 'profile' as ActiveTab, label: 'Profil Usaha', icon: Store },
    { id: 'settings' as ActiveTab, label: 'Pengaturan', icon: Settings },
    { id: 'registration' as ActiveTab, label: 'Verifikasi UMKM', icon: FileCheck },
  ];

  const handleSelect = (tab: ActiveTab) => {
    setActiveTab(tab);
    onClose();
  };

  return (
    <>
      {/* Mobile Slide-out Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity"
            onClick={onClose}
          />

          {/* Drawer content */}
          <div className="relative w-72 max-w-[80vw] bg-[#1F281A] text-white flex flex-col h-full shadow-2xl z-10">
            <div className="p-4 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#f89254] flex items-center justify-center font-bold text-white text-base">
                  S
                </div>
                <div>
                  <span className="font-bold text-sm tracking-tight text-white block">SisaPiring</span>
                  <span className="text-[10px] text-white/70 block uppercase tracking-wider">Mitra UMKM Bandung</span>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 text-white/70 hover:text-white rounded-lg hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="px-4 py-2.5 bg-white/5 border-b border-white/10 text-xs">
              <p className="font-semibold text-white truncate">{sellerProfile.businessName}</p>
              <p className="text-[11px] text-white/60">Kec. {sellerProfile.district}, Kota Bandung</p>
            </div>

            <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleSelect(item.id)}
                    className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-white/15 text-white font-semibold'
                        : 'text-white/75 hover:bg-white/10 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-[#fbe1b5]' : 'text-white/60'}`} />
                      <span>{item.label}</span>
                    </div>
                    {item.badge !== undefined && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#f89254] text-white font-bold">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>

            <div className="p-3 border-t border-white/10 space-y-2">
              <button
                onClick={() => handleSelect('marketplace')}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold bg-white text-[#1F281A] cursor-pointer"
              >
                <MarketplaceIcon className="w-4 h-4 text-[#f89254]" />
                <span>Lihat Etalase Pembeli</span>
              </button>
              <button
                onClick={() => handleSelect('admin')}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-semibold bg-amber-400/20 text-amber-300 border border-amber-300/30 cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4 text-amber-300" />
                <span>Panel Admin Platform</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Bottom Quick-Access Bar */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 h-14 bg-white border-t border-neutral-200 flex items-center justify-around z-30 px-2 shadow-lg">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex flex-col items-center justify-center flex-1 py-1 ${
            activeTab === 'dashboard' ? 'text-[#1F281A]' : 'text-neutral-500'
          }`}
        >
          <LayoutDashboard className="w-5 h-5" />
          <span className="text-[10px] mt-0.5 font-medium">Dashboard</span>
        </button>

        <button
          onClick={() => setActiveTab('products')}
          className={`flex flex-col items-center justify-center flex-1 py-1 ${
            activeTab === 'products' ? 'text-[#1F281A]' : 'text-neutral-500'
          }`}
        >
          <UtensilsCrossed className="w-5 h-5" />
          <span className="text-[10px] mt-0.5 font-medium">Produk</span>
        </button>

        {/* Floating Rescue QR Verification Action Button */}
        <button
          onClick={() => setActiveTab('qr_pickup')}
          className="flex flex-col items-center justify-center -mt-5"
        >
          <div className="w-12 h-12 rounded-full bg-[#f89254] text-white flex items-center justify-center shadow-lg active:scale-95 transition-transform">
            <QrCode className="w-6 h-6" />
          </div>
          <span className="text-[10px] mt-0.5 font-semibold text-[#f89254]">Scan QR</span>
        </button>

        <button
          onClick={() => setActiveTab('orders')}
          className={`relative flex flex-col items-center justify-center flex-1 py-1 ${
            activeTab === 'orders' ? 'text-[#1F281A]' : 'text-neutral-500'
          }`}
        >
          <ShoppingBag className="w-5 h-5" />
          {pendingOrders > 0 && (
            <span className="absolute top-1 right-5 w-2 h-2 rounded-full bg-[#f89254]" />
          )}
          <span className="text-[10px] mt-0.5 font-medium">Pesanan</span>
        </button>

        <button
          onClick={() => setActiveTab('rescue_deals')}
          className={`flex flex-col items-center justify-center flex-1 py-1 ${
            activeTab === 'rescue_deals' ? 'text-[#1F281A]' : 'text-neutral-500'
          }`}
        >
          <Sparkles className="w-5 h-5" />
          <span className="text-[10px] mt-0.5 font-medium">Deals</span>
        </button>
      </div>
    </>
  );
};
