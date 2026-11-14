import React, { useState, useRef, useEffect } from 'react';
import {
  Menu,
  MessageSquare,
  ShoppingBag,
  User,
  ChevronDown,
  LogOut,
  Store,
  ShieldCheck,
  MapPin,
  Settings,
  Receipt,
  Clock,
  Home,
  Sparkles,
} from 'lucide-react';
import { UserAccount } from '../AuthPage';

export interface PublicFloatingNavbarProps {
  activePage: string;
  currentUser: UserAccount | null;
  totalCartItems: number;
  activeOrdersCount: number;
  onOpenLanding: () => void;
  onOpenEtalase: () => void;
  onOpenOrders: () => void;
  onOpenChat: () => void;
  onOpenHistory: () => void;
  onOpenCart: () => void;
  onOpenSeller: () => void;
  onOpenAdmin: () => void;
  onOpenAuth: () => void;
  onLogout: () => void;
  onNavigateSection?: (sectionId: string) => void;
  onOpenProfileSettings?: () => void;
  onOpenAddressSettings?: () => void;
  onMobileMenuToggle: () => void;
}

const getInitials = (name?: string): string => {
  const clean = (name || '?').trim();
  const parts = clean.split(' ').filter((w) => /^[\p{L}\p{N}]/u.test(w));
  if (parts.length === 0) return 'SP';
  if (parts.length === 1) return clean.slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

export const PublicFloatingNavbar: React.FC<PublicFloatingNavbarProps> = ({
  activePage,
  currentUser,
  totalCartItems,
  activeOrdersCount,
  onOpenLanding,
  onOpenEtalase,
  onOpenOrders,
  onOpenChat,
  onOpenHistory,
  onOpenCart,
  onOpenSeller,
  onOpenAdmin,
  onOpenAuth,
  onLogout,
  onNavigateSection,
  onOpenProfileSettings,
  onOpenAddressSettings,
  onMobileMenuToggle,
}) => {
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const profileDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click or Escape key
  useEffect(() => {
    if (!profileDropdownOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (
        profileDropdownRef.current &&
        !profileDropdownRef.current.contains(e.target as Node)
      ) {
        setProfileDropdownOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setProfileDropdownOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [profileDropdownOpen]);

  // Determine role badge text
  const roleBadge = currentUser
    ? currentUser.role === 'admin'
      ? 'ADMIN'
      : currentUser.role === 'seller'
      ? 'UMKM'
      : 'PEMBELI'
    : activePage === 'landing'
    ? 'BERANDA'
    : 'KATALOG';

  return (
    <header className="fixed top-3 sm:top-4 left-4 right-4 z-40 flex items-center justify-between pointer-events-none select-none">
      {/* ======================================================== */}
      {/* 1. TOP-LEFT FLOATING PILL (Brand & Role Badge)            */}
      {/* ======================================================== */}
      <div className="flex items-center gap-2 pointer-events-auto">
        {/* Mobile Hamburger (Only visible on screens < lg) */}
        <button
          type="button"
          onClick={onMobileMenuToggle}
          className="lg:hidden p-2 rounded-2xl bg-[#1F281A]/90 border border-white/10 text-white backdrop-blur-md shadow-lg hover:bg-white/10 transition-colors cursor-pointer"
          aria-label="Buka Menu Navigasi"
          title="Buka Navigasi"
        >
          <Menu className="w-5 h-5 text-neutral-200" />
        </button>

        {/* Brand & Context Capsule */}
        <div
          onClick={activePage === 'landing' ? onOpenLanding : onOpenEtalase}
          className="flex items-center gap-2.5 px-3.5 py-2 sm:px-4 sm:py-2 rounded-full bg-[#1F281A]/90 border border-white/10 backdrop-blur-md shadow-2xl cursor-pointer hover:bg-white/10 transition-colors"
          title={activePage === 'landing' ? 'SisaPiring Beranda' : 'Ke Etalase Makanan'}
        >
          <div className="w-2 h-2 rounded-full bg-[#8da249] animate-pulse" />
          <span className="font-extrabold text-sm sm:text-base text-white tracking-tight font-sans">
            SisaPiring
          </span>
          <span className="px-2 py-0.5 rounded-md text-[9px] font-mono font-black tracking-wider bg-[#8da249]/20 text-[#8da249] border border-[#8da249]/30 uppercase">
            {roleBadge}
          </span>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. CENTER FLOATING PILL (Desktop Navigation Links)        */}
      {/* ======================================================== */}
      <nav
        aria-label="Navigasi Utama"
        className="hidden lg:flex items-center gap-1 sm:gap-1.5 px-3 py-1.5 rounded-full bg-[#1F281A]/90 border border-white/10 backdrop-blur-md shadow-2xl pointer-events-auto"
      >
        {activePage === 'landing' ? (
          /* LANDING PAGE NAV ITEMS */
          <>
            <button
              type="button"
              onClick={() => {
                const el = document.getElementById('beranda');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
                else onOpenLanding();
              }}
              className="px-3 py-1.5 rounded-full text-xs font-bold bg-[#8da249] text-white shadow-md shadow-[#8da249]/30 transition-all cursor-pointer"
            >
              Beranda
            </button>
            <button
              type="button"
              onClick={() => onNavigateSection && onNavigateSection('cara-kerja')}
              className="px-3 py-1.5 rounded-full text-xs font-semibold text-neutral-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              Cara Kerja
            </button>
            <button
              type="button"
              onClick={() => onNavigateSection && onNavigateSection('dampak-umkm')}
              className="px-3 py-1.5 rounded-full text-xs font-semibold text-neutral-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              Fakta Limbah
            </button>
            <button
              type="button"
              onClick={onOpenEtalase}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold text-[#8da249] hover:text-white hover:bg-[#8da249]/20 transition-all cursor-pointer"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Etalase Makanan</span>
            </button>
          </>
        ) : (
          /* INSIDE APP NAV ITEMS */
          <>
            <button
              type="button"
              onClick={onOpenEtalase}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                activePage === 'etalase'
                  ? 'bg-[#8da249] text-white font-bold shadow-md shadow-[#8da249]/30 scale-102'
                  : 'text-neutral-300 hover:text-white hover:bg-white/10'
              }`}
            >
              Etalase Makanan
            </button>

            <button
              type="button"
              onClick={onOpenOrders}
              className={`relative px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                activePage === 'pesanan'
                  ? 'bg-[#8da249] text-white font-bold shadow-md shadow-[#8da249]/30 scale-102'
                  : 'text-neutral-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <span>Pesanan</span>
              {activeOrdersCount > 0 && (
                <span className="min-w-[16px] h-4 px-1 rounded-full bg-[#f89254] text-white text-[9px] font-mono font-bold flex items-center justify-center">
                  {activeOrdersCount}
                </span>
              )}
            </button>

            <button
              type="button"
              onClick={onOpenChat}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                activePage === 'chat' || activePage === 'chat-bot'
                  ? 'bg-[#8da249] text-white font-bold shadow-md shadow-[#8da249]/30 scale-102'
                  : 'text-neutral-300 hover:text-white hover:bg-white/10'
              }`}
            >
              Chat Penjual
            </button>

            <button
              type="button"
              onClick={onOpenHistory}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                activePage === 'history'
                  ? 'bg-[#8da249] text-white font-bold shadow-md shadow-[#8da249]/30 scale-102'
                  : 'text-neutral-300 hover:text-white hover:bg-white/10'
              }`}
            >
              History
            </button>
          </>
        )}
      </nav>

      {/* ======================================================== */}
      {/* 3. TOP-RIGHT FLOATING PILL (Controls & User Profile)       */}
      {/* ======================================================== */}
      <div className="relative pointer-events-auto flex items-center gap-2" ref={profileDropdownRef}>
        <div className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-full bg-[#1F281A]/90 border border-white/10 backdrop-blur-md shadow-2xl text-white">
          {/* Chat / Message Button */}
          {activePage !== 'landing' && (
            <button
              type="button"
              onClick={onOpenChat}
              className={`p-1.5 rounded-full transition-colors cursor-pointer relative ${
                activePage === 'chat' || activePage === 'chat-bot'
                  ? 'bg-white/20 text-[#8da249]'
                  : 'text-neutral-300 hover:text-white hover:bg-white/10'
              }`}
              title="Pusat Pesan & Chat Penjual"
              aria-label="Pusat Pesan & Chat Penjual"
            >
              <MessageSquare className="w-4 h-4 text-[#8da249]" />
              <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#f89254] ring-2 ring-[#1F281A] animate-pulse" />
            </button>
          )}

          {/* Cart Bag Button (Visible inside app when logged in or has items) */}
          {activePage !== 'landing' && currentUser && (
            <button
              type="button"
              onClick={onOpenCart}
              className={`p-1.5 rounded-full transition-colors cursor-pointer relative ${
                activePage === 'kantong'
                  ? 'bg-white/20 text-[#8da249]'
                  : 'text-neutral-300 hover:text-white hover:bg-white/10'
              }`}
              title={`Kantong Belanja (${totalCartItems} item)`}
              aria-label={`Kantong Belanja (${totalCartItems} item)`}
            >
              <ShoppingBag className="w-4 h-4 text-[#8da249]" />
              {totalCartItems > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[17px] h-[17px] px-1 rounded-full bg-[#f89254] text-white text-[9px] font-mono font-bold ring-2 ring-[#1F281A] flex items-center justify-center">
                  {totalCartItems}
                </span>
              )}
            </button>
          )}

          {currentUser && <div className="h-4 w-px bg-white/15 hidden sm:block" />}

          {/* User Profile Capsule Trigger / Login Button */}
          {!currentUser ? (
            <button
              type="button"
              onClick={onOpenAuth}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#8da249] hover:bg-[#9eb455] text-white text-xs font-bold transition-all shadow-md shadow-[#8da249]/20 cursor-pointer"
            >
              <User className="w-3.5 h-3.5" />
              <span>Login</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setProfileDropdownOpen((prev) => !prev)}
              className="flex items-center gap-2 sm:gap-2.5 hover:opacity-90 transition-opacity cursor-pointer text-left pl-0.5"
              aria-label="Menu Profil Pengguna"
              aria-expanded={profileDropdownOpen}
            >
              <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#8da249] border border-white/20 text-white font-extrabold text-xs flex items-center justify-center shadow-xs relative shrink-0">
                {getInitials(currentUser.name)}
                <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-[#8da249] ring-2 ring-[#1F281A]" />
              </div>

              <div className="hidden md:block text-left">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-white leading-tight max-w-[110px] truncate">
                    {currentUser.name}
                  </span>
                  <span className="inline-flex items-center gap-1 text-[9px] font-bold text-[#8da249] bg-[#8da249]/15 border border-[#8da249]/30 px-1.5 py-0.2 rounded-full">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#8da249] animate-pulse" />
                    Online
                  </span>
                </div>
                <span className="text-[10px] text-neutral-400 block leading-tight font-mono max-w-[125px] truncate">
                  {currentUser.email}
                </span>
              </div>

              <ChevronDown
                className={`w-3.5 h-3.5 text-neutral-400 transition-transform ${
                  profileDropdownOpen ? 'rotate-180' : ''
                }`}
              />
            </button>
          )}
        </div>

        {/* Profile Dropdown Menu (Styled matching Admin Floating Navbar) */}
        {profileDropdownOpen && currentUser && (
          <div className="absolute right-0 top-full mt-2 w-72 bg-[#1F281A]/98 border border-white/15 rounded-2xl shadow-2xl p-2.5 text-xs text-white backdrop-blur-xl animate-in fade-in slide-in-from-top-2 z-50">
            {/* User Profile Header */}
            <div className="p-2 border-b border-white/10 mb-1.5">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-full bg-[#8da249] border border-white/20 text-white font-bold flex items-center justify-center text-xs shrink-0">
                  {getInitials(currentUser.name)}
                </div>
                <div className="min-w-0">
                  <span className="font-bold text-white block truncate">
                    {currentUser.name}
                  </span>
                  <span className="text-[10px] text-[#8da249] font-mono block truncate">
                    {currentUser.email}
                  </span>
                  <span className="text-[10px] text-neutral-400 font-mono block truncate">
                    {currentUser.phone}
                  </span>
                </div>
              </div>
            </div>

            {/* Navigational & Profile Actions */}
            <div className="space-y-1">
              <button
                type="button"
                onClick={() => {
                  setProfileDropdownOpen(false);
                  onOpenEtalase();
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-white/10 text-neutral-200 hover:text-white transition-colors cursor-pointer text-left"
              >
                <ShoppingBag className="w-4 h-4 text-[#8da249]" />
                <span>Buka Etalase Makanan</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setProfileDropdownOpen(false);
                  onOpenOrders();
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-white/10 text-neutral-200 hover:text-white transition-colors cursor-pointer text-left"
              >
                <Receipt className="w-4 h-4 text-cyan-400" />
                <span>Pesanan Saya ({activeOrdersCount} aktif)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setProfileDropdownOpen(false);
                  onOpenCart();
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-white/10 text-neutral-200 hover:text-white transition-colors cursor-pointer text-left"
              >
                <ShoppingBag className="w-4 h-4 text-amber-400" />
                <span>Kantong Belanja ({totalCartItems})</span>
              </button>

              {onOpenAddressSettings && (
                <button
                  type="button"
                  onClick={() => {
                    setProfileDropdownOpen(false);
                    onOpenAddressSettings();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-white/10 text-neutral-200 hover:text-white transition-colors cursor-pointer text-left"
                >
                  <MapPin className="w-4 h-4 text-emerald-400" />
                  <div className="truncate">
                    <span className="block">Alamat Pengambilan</span>
                    <span className="text-[10px] text-neutral-400 block truncate">
                      {currentUser.district || 'Coblong (Dago)'}
                    </span>
                  </div>
                </button>
              )}

              {onOpenProfileSettings && (
                <button
                  type="button"
                  onClick={() => {
                    setProfileDropdownOpen(false);
                    onOpenProfileSettings();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-white/10 text-neutral-200 hover:text-white transition-colors cursor-pointer text-left"
                >
                  <Settings className="w-4 h-4 text-neutral-300" />
                  <span>Pengaturan Profil & Kontak</span>
                </button>
              )}
            </div>

            {/* Logout Action */}
            <div className="pt-1.5 mt-1.5 border-t border-white/10">
              <button
                type="button"
                onClick={() => {
                  setProfileDropdownOpen(false);
                  onLogout();
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-rose-500/20 text-rose-300 hover:text-rose-200 transition-colors cursor-pointer text-left font-semibold"
              >
                <LogOut className="w-4 h-4 text-rose-400" />
                <span>Keluar dari Akun (Logout)</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};
