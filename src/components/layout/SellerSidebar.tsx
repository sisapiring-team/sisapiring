import React, { useLayoutEffect, useRef, useState } from 'react';
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
  CheckCircle2,
  Clock,
  XCircle,
  FileCheck,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';
import { ActiveTab, useApp } from '../../context/AppContext';
import { ConfirmationModal } from '../common/ConfirmationModal';
import { pushRoute } from '../../utils/navigation';

/**
 * Warna cadangan tab aktif (dipakai sebelum warna halaman berhasil dibaca).
 * Nilai aslinya dibaca otomatis dari area konten di sebelah kanan sidebar,
 * jadi tab aktif selalu menyatu, apa pun warna latar halamannya.
 */
const FALLBACK_BG = '#ECEFEC';

let probeCtx: CanvasRenderingContext2D | null = null;

/** Ubah warna CSS apa pun (hex, rgb, oklch, ...) jadi rgb() solid. Null kalau transparan/tidak valid. */
function toOpaqueRgb(css: string): string | null {
  if (!css || css === 'transparent') return null;
  if (!probeCtx) {
    probeCtx = document.createElement('canvas').getContext('2d', { willReadFrequently: true });
  }
  const ctx = probeCtx;
  if (!ctx) return null;
  ctx.clearRect(0, 0, 1, 1);
  ctx.fillStyle = '#010203';
  ctx.fillStyle = css;
  if (ctx.fillStyle === '#010203') return null; // format tidak dikenali
  ctx.fillRect(0, 0, 1, 1);
  const [r, g, b, a] = ctx.getImageData(0, 0, 1, 1).data;
  return a === 255 ? `rgb(${r}, ${g}, ${b})` : null;
}

interface NavItem {
  id: ActiveTab;
  label: string;
  icon: React.ElementType;
  badge?: number | string;
}

export const SellerSidebar: React.FC = () => {
  const { activeTab, setActiveTab, orders, products, sellerProfile, showToast, setIsVerificationModalOpen } = useApp();
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const asideRef = useRef<HTMLElement>(null);
  const [tabBg, setTabBg] = useState(FALLBACK_BG);

  // Baca warna latar halaman tepat di sebelah kanan sidebar, supaya tab aktif sewarna
  useLayoutEffect(() => {
    const measure = () => {
      const el = asideRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      let node = document.elementFromPoint(rect.right + 6, rect.top + rect.height / 2) as HTMLElement | null;
      while (node) {
        const color = toOpaqueRgb(getComputedStyle(node).backgroundColor);
        if (color) {
          setTabBg(color);
          return;
        }
        node = node.parentElement;
      }
    };
    measure();
    const t = window.setTimeout(measure, 200); // ukur ulang setelah transisi halaman
    window.addEventListener('resize', measure);
    return () => {
      window.clearTimeout(t);
      window.removeEventListener('resize', measure);
    };
  }, [activeTab]);

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
    { id: 'registration', label: 'Verifikasi UMKM', icon: FileCheck, badge: 'Flow' },
  ];

  const handleLogout = () => {
    setShowLogoutModal(false);
    showToast('Keluar Berhasil', 'Sesi sesi portal mitra telah ditutup.', 'info');
  };

  // Inisial usaha untuk avatar (tidak ada field foto di data, jadi pakai huruf)
  const initials = sellerProfile.businessName
    .split(' ')
    .filter((w) => /^[\p{L}\p{N}]/u.test(w))
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();

  const status =
    sellerProfile.verificationStatus === 'verified'
      ? { label: 'Terverifikasi', Icon: CheckCircle2, color: 'text-[#fbe1b5]' }
      : sellerProfile.verificationStatus === 'pending_review'
        ? { label: 'Dalam tinjauan', Icon: Clock, color: 'text-amber-300' }
        : { label: 'Ditolak', Icon: XCircle, color: 'text-rose-300' };
  const StatusIcon = status.Icon;

  // Tab aktif + lengkungan di kiri atas & kiri bawah supaya menyatu dengan konten
  const activeTabShape =
    'bg-[var(--tab-bg)] text-[#1F281A] ' +
    "before:absolute before:right-0 before:-top-5 before:h-5 before:w-5 before:content-[''] " +
    'before:rounded-br-[20px] before:shadow-[10px_10px_0_10px_var(--tab-bg)] ' +
    "after:absolute after:right-0 after:-bottom-5 after:h-5 after:w-5 after:content-[''] " +
    'after:rounded-tr-[20px] after:shadow-[10px_-10px_0_10px_var(--tab-bg)]';

  return (
    <>
      <aside
        ref={asideRef}
        className="relative my-4 ml-4 flex w-64 shrink-0 select-none flex-col overflow-hidden rounded-[28px] bg-[#1F281A] text-white"
      >
        {/* Profil usaha */}
        <div className="bg-black/20 px-5 pb-4 pt-5 text-center">
          <p className="mb-3 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/40">
            SisaPiring · Portal Mitra
          </p>

          <div className="mx-auto w-fit rounded-full p-1 ring-2 ring-[#f89254]/70">
            <div className="grid h-16 w-16 place-items-center rounded-full bg-[#fbe1b5] text-xl font-bold text-[#1F281A]">
              {initials}
            </div>
          </div>

          {/* Sengaja <div> + warna inline: stylesheet global bisa mewarnai <h1>-<h6> jadi gelap */}
          <div
            className="mt-2.5 truncate text-[13px] font-bold uppercase tracking-wide"
            style={{ color: '#ffffff' }}
            title={sellerProfile.businessName}
          >
            {sellerProfile.businessName}
          </div>
          <p className="mt-0.5 text-[11px] text-white/60">Kec. {sellerProfile.district} · Kota Bandung</p>

          <button
            onClick={() => setIsVerificationModalOpen(true)}
            title="Klik untuk melihat rincian verifikasi resmi"
            className={`mt-2.5 inline-flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-[11px] font-medium transition-colors hover:bg-white/15 ${status.color}`}
          >
            <StatusIcon className="h-3.5 w-3.5" />
            {status.label}
          </button>
        </div>

        {/* Menu. Tanpa padding kanan supaya tab aktif sampai ke tepi sidebar; scrollbar disembunyikan */}
        <nav
          className="flex-1 space-y-1 overflow-y-auto py-5 pl-3 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
          style={{ '--tab-bg': tabBg } as React.CSSProperties}
        >
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  pushRoute(item.id !== 'dashboard' ? `/penjual/${item.id}` : '/penjual');
                  setActiveTab(item.id);
                }}
                className={`relative flex w-full items-center justify-between rounded-l-full py-3 pl-4 pr-5 text-left text-[12px] font-semibold uppercase tracking-wider transition-colors ${isActive ? activeTabShape : 'text-white/70 hover:text-white'
                  }`}
              >
                <span className="flex min-w-0 items-center gap-3">
                  <Icon className={`h-[18px] w-[18px] shrink-0 ${isActive ? 'text-[#f89254]' : 'text-white/50'}`} />
                  <span className="truncate">{item.label}</span>
                </span>
                {Boolean(item.badge) && (
                  <span
                    className={`ml-2 shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold normal-case tracking-normal ${isActive
                      ? 'bg-[#1F281A] text-white'
                      : typeof item.badge === 'string' && item.badge.includes('baru')
                        ? 'bg-[#f89254] text-white'
                        : 'bg-white/10 text-white/80'
                      }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Akses lain */}
        <div className="px-5 pb-4 pt-2">
          <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-[#f89254]">Akses lain</p>
          <div className="space-y-0.5">
            <button
              onClick={() => {
                pushRoute('/etalase');
                setActiveTab('marketplace');
              }}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-1.5 text-xs font-medium text-white/70 transition-colors hover:bg-white/10 hover:text-white"
            >
              <ExternalLink className="h-4 w-4 text-white/50" />
              <span>Etalase Pembeli</span>
            </button>
            <button
              onClick={() => {
                pushRoute('/admin');
                setActiveTab('admin');
              }}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-1.5 text-xs font-medium text-white/70 transition-colors hover:bg-white/10 hover:text-white"
            >
              <ShieldCheck className="h-4 w-4 text-white/50" />
              <span>Panel Admin</span>
            </button>
            <button
              onClick={() => setShowLogoutModal(true)}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-1.5 text-xs font-medium text-white/50 transition-colors hover:bg-white/10 hover:text-white"
            >
              <LogOut className="h-4 w-4" />
              <span>Keluar Portal</span>
            </button>
          </div>
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