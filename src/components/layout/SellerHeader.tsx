import React, { useState } from 'react';
import {
  Menu,
  Bell,
  MapPin,
  ExternalLink,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { ActiveTab, useApp } from '../../context/AppContext';

interface SellerHeaderProps {
  onMobileMenuToggle: () => void;
}

export const SellerHeader: React.FC<SellerHeaderProps> = ({ onMobileMenuToggle }) => {
  const { activeTab, setActiveTab, sellerProfile, updateSellerProfile, orders } = useApp();
  const [showNotifications, setShowNotifications] = useState(false);

  const pendingOrders = orders.filter((o) => o.status === 'waiting_confirmation');

  const tabTitles: Record<ActiveTab, { title: string; subtitle: string }> = {
    dashboard: { title: 'Dashboard Ikhtisar', subtitle: 'Pantau performa sisa piring rescue harian' },
    products: { title: 'Manajemen Produk Sisa Piring', subtitle: 'Kelola etalase makanan, stok, dan keamanan pangan' },
    orders: { title: 'Pesanan Masuk', subtitle: 'Konfirmasi dan kelola jadwal penjemputan pembeli' },
    rescue_deals: { title: 'Rescue Deals & Diskon Pintar', subtitle: 'Rekomendasi diskon otomatis berbasis waktu kedaluwarsa' },
    qr_pickup: { title: 'Verifikasi Pengambilan QR', subtitle: 'Scan QR atau verifikasi kode 6-digit pelanggan' },
    analytics: { title: 'Statistik & Dampak Lingkungan', subtitle: 'Laporan omzet dan kontribusi pencegahan food waste' },
    profile: { title: 'Profil Usaha UMKM', subtitle: 'Kelola identitas, alamat Bandung, dan jam operasional' },
    settings: { title: 'Pengaturan Toko', subtitle: 'Atur preferensi sistem, notifikasi, dan otomatisasi' },
    registration: { title: 'Registrasi & Verifikasi UMKM', subtitle: 'Alur pendaftaran mitra resmi SisaPiring Kota Bandung' },
    marketplace: { title: 'Etalase Pasar SisaPiring', subtitle: 'Mode pelanggan: uji coba belanja sisa piring' },
    admin: { title: 'Pusat Tata Kelola Admin', subtitle: 'Governance, verifikasi legalitas, dan analitik makro' },
  };

  const current = tabTitles[activeTab] || { title: 'Dashboard', subtitle: '' };

  return (
    <header className="h-16 bg-white border-b border-neutral-200 px-4 md:px-6 flex items-center justify-between shrink-0 sticky top-0 z-20">
      {/* Left: Mobile Toggle + Breadcrumb */}
      <div className="flex items-center gap-3 min-w-0">
        <button
          onClick={onMobileMenuToggle}
          className="lg:hidden p-2 text-neutral-600 hover:text-neutral-900 rounded-lg hover:bg-neutral-100 transition-colors"
          aria-label="Buka menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-1.5 text-xs text-neutral-500 truncate">
          <span className="font-medium text-[#16382C]">SisaPiring</span>
          <ChevronRight className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
          <span className="font-semibold text-neutral-800 truncate">{current.title}</span>
        </div>
      </div>

      {/* Right: Operational Status, District, Notifications, Avatar */}
      <div className="flex items-center gap-3 md:gap-4 shrink-0">
        {/* Bandung District Badge */}
        <div className="hidden sm:flex items-center gap-1.5 text-xs text-neutral-600 bg-neutral-100 px-2.5 py-1.5 rounded-lg border border-neutral-200">
          <MapPin className="w-3.5 h-3.5 text-[#EE4D2D]" />
          <span className="font-medium">Kec. {sellerProfile.district}, Bandung</span>
        </div>

        {/* Operational Toggle (Buka/Tutup) */}
        <button
          type="button"
          onClick={() => updateSellerProfile({ isOpenToday: !sellerProfile.isOpenToday })}
          className={`hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
            sellerProfile.isOpenToday
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100'
              : 'bg-neutral-100 text-neutral-600 border-neutral-200 hover:bg-neutral-200'
          }`}
          title="Klik untuk mengubah jam buka penjemputan"
        >
          <span
            className={`w-2 h-2 rounded-full ${
              sellerProfile.isOpenToday ? 'bg-emerald-600' : 'bg-neutral-400'
            }`}
          />
          <span>{sellerProfile.isOpenToday ? 'Menerima Pengambilan' : 'Tutup Sementara'}</span>
        </button>

        {/* Switch to Customer Marketplace */}
        <button
          type="button"
          onClick={() => setActiveTab('marketplace')}
          className="hidden sm:flex items-center gap-1.5 text-xs font-semibold text-[#EE4D2D] bg-[#EE4D2D]/10 hover:bg-[#EE4D2D]/20 px-3 py-1.5 rounded-lg transition-colors border border-[#EE4D2D]/20"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          <span>Lihat Etalase Pembeli</span>
        </button>

        {/* Switch to Admin Governance */}
        <button
          type="button"
          onClick={() => setActiveTab('admin')}
          className="hidden md:flex items-center gap-1.5 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 px-3 py-1.5 rounded-lg transition-colors border border-emerald-200"
        >
          <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
          <span>Panel Admin</span>
        </button>

        {/* Notifications Bell */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative p-2 text-neutral-600 hover:text-neutral-900 rounded-lg hover:bg-neutral-100 transition-colors"
            aria-label="Notifikasi"
          >
            <Bell className="w-5 h-5" />
            {pendingOrders.length > 0 && (
              <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-[#EE4D2D] rounded-full ring-2 ring-white" />
            )}
          </button>

          {/* Notifications Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-neutral-200 py-3 z-30">
              <div className="px-4 pb-2 border-b border-neutral-100 flex items-center justify-between">
                <span className="text-xs font-bold text-neutral-800 uppercase tracking-wider">
                  Notifikasi Pesanan
                </span>
                <span className="text-[11px] font-mono text-neutral-500">
                  {pendingOrders.length} menunggu
                </span>
              </div>
              <div className="max-h-64 overflow-y-auto divide-y divide-neutral-50">
                {pendingOrders.length === 0 ? (
                  <div className="px-4 py-6 text-center text-xs text-neutral-500">
                    Tidak ada pesanan baru yang menunggu konfirmasi saat ini.
                  </div>
                ) : (
                  pendingOrders.map((ord) => (
                    <div
                      key={ord.id}
                      onClick={() => {
                        setActiveTab('orders');
                        setShowNotifications(false);
                      }}
                      className="px-4 py-3 hover:bg-neutral-50 cursor-pointer transition-colors"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-[#EE4D2D] font-mono">{ord.id}</span>
                        <span className="text-[11px] text-neutral-400">{ord.orderDate}</span>
                      </div>
                      <p className="text-xs font-medium text-neutral-800 mt-1 truncate">
                        {ord.customerName}
                      </p>
                      <p className="text-[11px] text-neutral-500">
                        {ord.items.length} produk · Kode: <span className="font-mono font-semibold">{ord.pickupCode}</span>
                      </p>
                    </div>
                  ))
                )}
              </div>
              <div className="px-4 pt-2 border-t border-neutral-100 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('orders');
                    setShowNotifications(false);
                  }}
                  className="text-xs font-semibold text-[#16382C] hover:underline"
                >
                  Buka Semua Pesanan Masuk
                </button>
              </div>
            </div>
          )}
        </div>

        {/* User Avatar */}
        <div
          onClick={() => setActiveTab('profile')}
          className="flex items-center gap-2 pl-2 border-l border-neutral-200 cursor-pointer group"
        >
          <img
            src={sellerProfile.businessPhoto}
            alt={sellerProfile.businessName}
            className="w-8 h-8 rounded-full object-cover border border-neutral-300 group-hover:ring-2 group-hover:ring-[#16382C]/20 transition-all"
            referrerPolicy="no-referrer"
          />
          <div className="hidden xl:block text-left">
            <span className="text-xs font-bold text-neutral-800 block leading-tight truncate max-w-[120px]">
              {sellerProfile.ownerName}
            </span>
            <span className="text-[10px] text-neutral-500 block leading-tight">
              Mitra Penyelamat Pangan
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
