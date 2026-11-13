import React, { useEffect, useRef, useState } from 'react';
import { Menu, Bell, ChevronRight } from 'lucide-react';
import { ActiveTab, useApp } from '../../context/AppContext';

/* header: judul pendek + status toko + notifikasi.
   Semua aksi yang sudah ada di sidebar ("Akses lain") dibuang dari sini
   supaya tidak ada tombol dobel. Tanpa garis tepi; latar menyatu kanvas,
   baru putih + bayangan waktu halaman sudah di-scroll. */

const INK = '#1F281A';
const MUTE = '#8A968C';
const ORANGE = '#F8925D';

const TAB_TITLE: Record<ActiveTab, string> = {
  dashboard: 'Dashboard',
  products: 'Produk',
  orders: 'Pesanan',
  rescue_deals: 'Rescue Deals',
  qr_pickup: 'Ambil QR',
  analytics: 'Statistik',
  profile: 'Profil Usaha',
  settings: 'Pengaturan',
  registration: 'Verifikasi UMKM',
  marketplace: 'Etalase Pembeli',
  admin: 'Panel Admin',
};

/** waktu singkat untuk daftar notifikasi: "baru", "12 mnt", "2 jam", "Kemarin", "3 Nov" */
function since(iso: string): string {
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return '';
  const m = Math.round((Date.now() - t) / 60000);
  if (m < 1) return 'baru';
  if (m < 60) return `${m} mnt`;
  const h = Math.round(m / 60);
  if (h < 24) return `${h} jam`;
  if (h < 48) return 'Kemarin';
  return new Date(t).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
}

const initialsOf = (name: string) => {
  const clean = (name || '?').trim();
  const parts = clean.split(' ').filter((w) => /^[\p{L}\p{N}]/u.test(w));
  if (parts.length <= 1) return clean.slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

interface SellerHeaderProps {
  onMobileMenuToggle: () => void;
}

export const SellerHeader: React.FC<SellerHeaderProps> = ({ onMobileMenuToggle }) => {
  const { activeTab, setActiveTab, sellerProfile, updateSellerProfile, orders, showToast } =
    useApp();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const pending = orders.filter((o) => o.status === 'waiting_confirmation');

  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => setScrolled(window.scrollY > 8));
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  // tutup panel saat klik di luar atau Escape
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onDown);
    window.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDown);
      window.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const toggleOpen = () => {
    const next = !sellerProfile.isOpenToday;
    updateSellerProfile({ isOpenToday: next });
    showToast(
      next ? 'Toko buka' : 'Toko ditutup',
      next ? 'Etalase menerima pesanan penjemputan.' : 'Pesanan penjemputan dijeda.',
      'info'
    );
  };

  const gotoOrders = () => {
    setActiveTab('orders');
    setOpen(false);
  };

  return (
    <header
      className={`sticky top-0 z-30 h-16 shrink-0 px-4 transition-colors duration-200 md:px-6 ${scrolled ? 'bg-white shadow-[0_10px_24px_-20px_rgba(31,40,26,0.55)]' : 'bg-transparent'
        }`}
    >
      <div className="flex h-full items-center justify-between gap-4">
        {/* kiri: menu HP + judul tab */}
        <div className="flex min-w-0 items-center gap-2.5">
          <button
            type="button"
            onClick={onMobileMenuToggle}
            aria-label="Buka menu"
            className="-ml-2 rounded-xl p-2 transition-colors hover:bg-black/5 lg:hidden"
            style={{ color: INK }}
          >
            <Menu className="h-5 w-5" />
          </button>

          <div key={activeTab} className="min-w-0">
            <p
              className="truncate text-[15px] font-bold leading-tight tracking-tight"
              style={{ color: INK }}
            >
              {TAB_TITLE[activeTab] ?? 'Dashboard'}
            </p>
          </div>

          {!!pending.length && (
            <button
              type="button"
              onClick={() => setActiveTab('orders')}
              className="hidden shrink-0 items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] transition-colors sm:inline-flex"
              style={{ background: 'rgba(248,146,93,0.14)', color: '#B4551F' }}
            >
              <span className="h-1.5 w-1.5 rounded-full" style={{ background: ORANGE }} />
              {pending.length} menunggu
            </button>
          )}
        </div>

        {/* kanan: status, notifikasi, akun */}
        <div className="flex shrink-0 items-center gap-2.5">
          <button
            type="button"
            onClick={toggleOpen}
            title={sellerProfile.isOpenToday ? 'Tutup toko sementara' : 'Buka toko'}
            className="hidden items-center gap-2 rounded-full px-3 py-2 text-xs font-bold transition-colors sm:inline-flex"
            style={
              sellerProfile.isOpenToday
                ? { background: 'rgba(248,146,93,0.14)', color: '#B4551F' }
                : { background: '#F0F1EC', color: MUTE }
            }
          >
            <span
              className="h-2 w-2 rounded-full"
              style={{ background: sellerProfile.isOpenToday ? ORANGE : '#C3CBC2' }}
            />
            {sellerProfile.isOpenToday ? 'Buka' : 'Tutup'}
          </button>

          <div className="relative" ref={panelRef}>
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              aria-label="Notifikasi pesanan"
              aria-expanded={open}
              className="relative rounded-xl p-2 transition-colors hover:bg-black/5"
              style={{ color: open ? INK : '#5C6B60' }}
            >
              <Bell className="h-5 w-5" />
              {!!pending.length && (
                <span
                  className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full ring-2 ring-white"
                  style={{ background: ORANGE }}
                />
              )}
            </button>

            {open && (
              <div className="absolute right-0 top-[calc(100%+10px)] w-[336px] origin-top-right overflow-hidden rounded-[20px] bg-white shadow-[0_2px_6px_rgba(31,40,26,0.06),0_28px_60px_-24px_rgba(31,40,26,0.45)]">
                <div className="flex items-center justify-between px-4 pb-2.5 pt-3.5">
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em]" style={{ color: MUTE }}>
                    Pesanan menunggu
                  </p>
                  <span className="font-mono text-[11px] font-bold tabular-nums" style={{ color: INK }}>
                    {pending.length}
                  </span>
                </div>

                {pending.length === 0 ? (
                  <p className="px-4 pb-6 pt-1 text-center text-xs" style={{ color: '#B6BEB6' }}>
                    Semua pesanan sudah terkonfirmasi.
                  </p>
                ) : (
                  <ul className="max-h-[286px] divide-y divide-[#EFF1EB] overflow-y-auto">
                    {pending.map((o) => (
                      <li key={o.id}>
                        <button
                          type="button"
                          onClick={gotoOrders}
                          className="grid w-full grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-[#F7F8F4]"
                        >
                          <span className="min-w-0">
                            <span className="flex items-baseline gap-2">
                              <span className="truncate text-[13px] font-semibold" style={{ color: INK }}>
                                {o.customerName}
                              </span>
                              <span className="font-mono text-[10px]" style={{ color: '#B6BEB6' }}>
                                {since(o.orderDate)}
                              </span>
                            </span>
                            <span className="mt-0.5 block truncate font-mono text-[11px]" style={{ color: MUTE }}>
                              {o.id} · {o.items.length} menu · kode{' '}
                              <span style={{ color: INK }}>{o.pickupCode}</span>
                            </span>
                          </span>
                          <ChevronRight className="h-4 w-4" style={{ color: '#C3CBC2' }} />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}

                <button
                  type="button"
                  onClick={gotoOrders}
                  className="flex w-full items-center justify-between border-t border-[#EFF1EB] px-4 py-3 text-[11px] font-bold uppercase tracking-[0.12em] transition-colors hover:bg-[#F7F8F4]"
                  style={{ color: INK }}
                >
                  Semua pesanan
                  <ChevronRight className="h-3.5 w-3.5" style={{ color: ORANGE }} />
                </button>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            title={`${sellerProfile.ownerName} · Profil Usaha`}
            className="flex items-center gap-2.5 rounded-full py-1 pl-1 pr-1 transition-colors hover:bg-black/5 sm:pl-3"
          >
            <span className="hidden text-right sm:block">
              <span className="block max-w-[110px] truncate text-xs font-bold leading-tight" style={{ color: INK }}>
                {sellerProfile.ownerName}
              </span>
              <span className="block text-[10px] leading-tight" style={{ color: MUTE }}>
                {sellerProfile.district}
              </span>
            </span>
            <span
              className="grid h-8 w-8 place-items-center rounded-full text-[11px] font-bold"
              style={{ background: '#FBE1B5', color: INK, boxShadow: '0 0 0 1px rgba(248,146,93,0.55)' }}
            >
              {initialsOf(sellerProfile.businessName)}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};