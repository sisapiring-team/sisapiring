import React, { useState, useRef, useEffect } from 'react';
import { User, LogOut, MapPin, Settings, ChevronDown, ClipboardList, History, Store } from 'lucide-react';

export type UserPage =
  | 'landing'
  | 'etalase'
  | 'kantong'
  | 'kantong-confirmation'
  | 'pesanan'
  | 'history'
  | 'store'
  | 'chat'
  | 'chat-bot'
  | 'auth'
  | 'admin';

export interface UserNavbarUser {
  name: string;
  email: string;
  phone?: string;
  role?: string;
  defaultAddress?: string;
}

interface UserNavbarProps {
  activePage: UserPage;
  totalCartItems?: number;
  currentUser?: UserNavbarUser | null;
  currentUserName?: string | null;
  activeOrdersCount?: number;
  onGoHome: () => void;
  onGoCart?: () => void;
  onGoAuth: () => void;
  onLogout?: () => void;
  onOpenAddressModal?: () => void;
  onOpenProfileModal?: () => void;
  onGoEtalase?: () => void;
  onGoOrders?: () => void;
  onGoHistory?: () => void;
}

export const UserNavbar: React.FC<UserNavbarProps> = ({
  activePage: _activePage,
  totalCartItems: _totalCartItems,
  currentUser,
  currentUserName,
  activeOrdersCount,
  onGoHome,
  onGoCart: _onGoCart,
  onGoAuth,
  onLogout,
  onOpenAddressModal,
  onOpenProfileModal,
  onGoEtalase,
  onGoOrders,
  onGoHistory,
}) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const activeUser = currentUser || (currentUserName ? { name: currentUserName, email: '' } : null);

  // Close dropdown when clicking outside
  useEffect(() => {
    if (!dropdownOpen) return;
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [dropdownOpen]);

  const initials = activeUser?.name
    ? activeUser.name
        .split(' ')
        .filter((w) => /^[\p{L}\p{N}]/u.test(w))
        .slice(0, 2)
        .map((w) => w[0])
        .join('')
        .toUpperCase()
    : 'U';

  return (
    <header className="sticky top-0 z-30 h-14 md:h-16 bg-[#1F281A] text-white border-b border-white/10">
      <div className="max-w-7xl mx-auto w-full h-full flex items-center justify-between px-3 sm:px-6 relative">

        {/* Kiri: spacer */}
        <div className="flex-1" />

        {/* Tengah: Logo + Nama (absolute center) */}
        <button
          type="button"
          onClick={onGoHome}
          className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2.5 sm:gap-3 cursor-pointer group"
          aria-label="Ke halaman beranda"
        >
          <img
            src="/assets/images/logo_full.png"
            alt="Logo SisaPiring"
            className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl object-cover shrink-0 transition-transform group-hover:scale-105 shadow-xs"
          />
          <span className="text-xl sm:text-2xl font-bold tracking-tight text-white group-hover:text-stone-100 transition-colors">
            SisaPiring
          </span>
        </button>

        {/* Kanan: Profile / Login */}
        <div className="flex-1 flex items-center justify-end gap-2 relative" ref={dropdownRef}>
          {activeUser ? (
            <>
              <button
                type="button"
                onClick={() => setDropdownOpen((prev) => !prev)}
                aria-label={`Akun: ${activeUser.name}`}
                aria-expanded={dropdownOpen}
                className="relative h-9 px-2 sm:px-2.5 inline-flex items-center gap-1.5 border border-white/25 bg-white/10 hover:bg-white/20 rounded-xl transition-colors cursor-pointer select-none"
              >
                <div className="w-6 h-6 rounded-lg bg-[#8da249] text-[#1F281A] text-[11px] font-bold flex items-center justify-center">
                  {initials}
                </div>
                <span className="hidden sm:inline-block max-w-[100px] truncate text-xs font-semibold text-white">
                  {activeUser.name.split(' ')[0]}
                </span>
                <ChevronDown className={`w-3.5 h-3.5 text-stone-300 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#8da249] ring-2 ring-[#1F281A]" />
              </button>

              {/* User Account Dropdown */}
              {dropdownOpen && (
                <div className="absolute right-0 top-[calc(100%+8px)] w-64 rounded-2xl bg-white text-stone-800 shadow-2xl border border-stone-200 overflow-hidden z-50">
                  {/* User Header */}
                  <div className="p-4 bg-stone-50 border-b border-stone-100">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="text-sm font-bold text-stone-900 truncate">
                        {activeUser.name}
                      </p>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 shrink-0">
                        {activeUser.role === 'buyer' ? 'Pembeli' : activeUser.role || 'User'}
                      </span>
                    </div>
                    {activeUser.email && (
                      <p className="text-xs text-stone-500 truncate">
                        {activeUser.email}
                      </p>
                    )}
                    {activeUser.phone && (
                      <p className="text-[11px] text-stone-400 mt-0.5 font-mono">
                        {activeUser.phone}
                      </p>
                    )}
                  </div>

                  {/* User Navigation Links (Etalase, Pesanan, Riwayat) */}
                  <div className="p-2 space-y-1 text-xs border-b border-stone-100">
                    {onGoEtalase && (
                      <button
                        type="button"
                        onClick={() => {
                          setDropdownOpen(false);
                          onGoEtalase();
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-colors cursor-pointer text-left font-medium ${
                          _activePage === 'etalase' ? 'bg-[#1F281A] text-white' : 'text-stone-700 hover:bg-stone-100'
                        }`}
                      >
                        <span className="flex items-center gap-2.5">
                          <Store className="w-4 h-4 shrink-0 text-[#8da249]" />
                          <span>Etalase Makanan</span>
                        </span>
                      </button>
                    )}

                    {onGoOrders && (
                      <button
                        type="button"
                        onClick={() => {
                          setDropdownOpen(false);
                          onGoOrders();
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-colors cursor-pointer text-left font-medium ${
                          _activePage === 'pesanan' ? 'bg-[#1F281A] text-white' : 'text-stone-700 hover:bg-stone-100'
                        }`}
                      >
                        <span className="flex items-center gap-2.5">
                          <ClipboardList className="w-4 h-4 shrink-0 text-[#8da249]" />
                          <span>Pesanan Aktif</span>
                        </span>
                        {typeof activeOrdersCount === 'number' && activeOrdersCount > 0 ? (
                          <span className="px-1.5 py-0.5 rounded-full bg-[#f89254] text-white text-[10px] font-bold font-mono-tabular">
                            {activeOrdersCount}
                          </span>
                        ) : null}
                      </button>
                    )}

                    {onGoHistory && (
                      <button
                        type="button"
                        onClick={() => {
                          setDropdownOpen(false);
                          onGoHistory();
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2 rounded-xl transition-colors cursor-pointer text-left font-medium ${
                          _activePage === 'history' ? 'bg-[#1F281A] text-white' : 'text-stone-700 hover:bg-stone-100'
                        }`}
                      >
                        <span className="flex items-center gap-2.5">
                          <History className="w-4 h-4 shrink-0 text-[#8da249]" />
                          <span>Riwayat Penyelamatan</span>
                        </span>
                      </button>
                    )}
                  </div>

                  {/* Account Actions */}
                  <div className="p-2 space-y-1 text-xs">
                    {onOpenAddressModal && (
                      <button
                        type="button"
                        onClick={() => {
                          setDropdownOpen(false);
                          onOpenAddressModal();
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-stone-700 hover:bg-stone-100 hover:text-stone-900 transition-colors cursor-pointer text-left font-medium"
                      >
                        <MapPin className="w-4 h-4 text-emerald-700 shrink-0" />
                        <span className="truncate">Alamat Default Pengiriman</span>
                      </button>
                    )}

                    {onOpenProfileModal && (
                      <button
                        type="button"
                        onClick={() => {
                          setDropdownOpen(false);
                          onOpenProfileModal();
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-stone-700 hover:bg-stone-100 hover:text-stone-900 transition-colors cursor-pointer text-left font-medium"
                      >
                        <Settings className="w-4 h-4 text-stone-500 shrink-0" />
                        <span>Pengaturan Akun & Kontak</span>
                      </button>
                    )}
                  </div>

                  {/* Logout Button */}
                  {onLogout && (
                    <div className="p-2 border-t border-stone-100">
                      <button
                        type="button"
                        onClick={() => {
                          setDropdownOpen(false);
                          onLogout();
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-red-600 hover:bg-red-50 transition-colors cursor-pointer text-left font-semibold text-xs"
                      >
                        <LogOut className="w-4 h-4 text-red-500 shrink-0" />
                        <span>Keluar dari Akun</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </>
          ) : (
            <button
              type="button"
              onClick={onGoAuth}
              className="h-9 px-3 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5 border bg-white text-[#1F281A] border-white hover:bg-stone-100 transition-colors cursor-pointer"
            >
              <User className="w-3.5 h-3.5 shrink-0" />
              <span>Login</span>
            </button>
          )}
        </div>

      </div>
    </header>
  );
};
