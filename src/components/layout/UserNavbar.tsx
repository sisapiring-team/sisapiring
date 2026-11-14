import React from 'react';
import { ShoppingBag, User } from 'lucide-react';

export type UserPage =
  | 'landing'
  | 'etalase'
  | 'kantong'
  | 'pesanan'
  | 'history'
  | 'store'
  | 'chat'
  | 'chat-bot'
  | 'auth'
  | 'admin';

interface UserNavbarProps {
  activePage: UserPage;
  totalCartItems: number;
  currentUserName?: string | null;
  onGoHome: () => void;
  onGoCart: () => void;
  onGoAuth: () => void;
}

export const UserNavbar: React.FC<UserNavbarProps> = ({
  activePage,
  totalCartItems,
  currentUserName,
  onGoHome,
  onGoCart,
  onGoAuth,
}) => {
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

        {/* Kanan: Cart + Profile */}
        <div className="flex-1 flex items-center justify-end gap-2">
          {/* Keranjang */}
          {activePage !== 'landing' && (
            <button
              type="button"
              onClick={onGoCart}
              aria-label={`Kantong Belanja (${totalCartItems} item)`}
              className={`relative w-9 h-9 inline-flex items-center justify-center border rounded-xl transition-colors cursor-pointer ${
                activePage === 'kantong'
                  ? 'bg-white/30 border-[#8da249]'
                  : 'bg-white/10 border-white/25 hover:bg-white/20'
              }`}
            >
              <ShoppingBag className="w-4 h-4 text-[#8da249]" />
              {totalCartItems > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-[#f89254] text-white text-[10px] font-bold flex items-center justify-center">
                  {totalCartItems}
                </span>
              )}
            </button>
          )}

          {/* Profile / Login */}
          {currentUserName ? (
            <button
              type="button"
              onClick={onGoAuth}
              aria-label={`Akun: ${currentUserName}`}
              className="relative w-9 h-9 inline-flex items-center justify-center border border-white/25 bg-white/10 hover:bg-white/20 rounded-xl transition-colors cursor-pointer"
            >
              <User className="w-4 h-4 text-[#8da249]" />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-[#8da249] ring-2 ring-[#1F281A]" />
            </button>
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
