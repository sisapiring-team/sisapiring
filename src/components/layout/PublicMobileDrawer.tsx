import React from 'react';
import {
  X,
  ShoppingBag,
  Receipt,
  MessageSquare,
  Clock,
  Home,
  Store,
  ShieldCheck,
  User,
  LogOut,
  MapPin,
  Settings,
} from 'lucide-react';
import { UserAccount } from '../AuthPage';

export interface PublicMobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
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
}

const getInitials = (name?: string): string => {
  const clean = (name || '?').trim();
  const parts = clean.split(' ').filter((w) => /^[\p{L}\p{N}]/u.test(w));
  if (parts.length === 0) return 'SP';
  if (parts.length === 1) return clean.slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
};

export const PublicMobileDrawer: React.FC<PublicMobileDrawerProps> = ({
  isOpen,
  onClose,
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
}) => {
  if (!isOpen) return null;

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
    <div className="fixed inset-0 z-50 lg:hidden flex">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in"
        onClick={onClose}
      />

      {/* Drawer Container */}
      <aside className="relative z-10 w-72 sm:w-80 bg-[#1F281A] text-white flex flex-col h-full border-r border-white/10 shadow-2xl select-none animate-in slide-in-from-left duration-200">
        {/* Drawer Header */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#8da249]/20 border border-[#8da249]/40 flex items-center justify-center text-[#8da249] font-bold">
              SP
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-sm text-white tracking-tight">
                  SisaPiring
                </span>
                <span className="px-1.5 py-0.2 rounded-md text-[9px] font-mono font-black bg-[#8da249]/20 text-[#8da249] border border-[#8da249]/30 uppercase">
                  {roleBadge}
                </span>
              </div>
              <span className="text-[10px] text-neutral-400 block font-mono">
                Marketplace Pangan Surplus
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors cursor-pointer"
            aria-label="Tutup Navigasi"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Items Scrollable Area */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          {activePage === 'landing' ? (
            /* ON LANDING PAGE */
            <>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  const el = document.getElementById('beranda');
                  if (el) el.scrollIntoView({ behavior: 'smooth' });
                  else onOpenLanding();
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold bg-[#8da249] text-white shadow-md shadow-[#8da249]/30 cursor-pointer"
              >
                <Home className="w-4 h-4" />
                <span>Beranda</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  if (onNavigateSection) onNavigateSection('cara-kerja');
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-neutral-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <Clock className="w-4 h-4 text-[#8da249]" />
                <span>Cara Kerja</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  if (onNavigateSection) onNavigateSection('dampak-umkm');
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-neutral-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4 text-[#8da249]" />
                <span>Fakta Limbah Pangan</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenEtalase();
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-bold text-[#8da249] bg-[#8da249]/15 hover:bg-[#8da249]/25 transition-colors cursor-pointer mt-2"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Jelajahi Etalase Makanan</span>
              </button>
            </>
          ) : (
            /* INSIDE APP */
            <>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenEtalase();
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  activePage === 'etalase'
                    ? 'bg-[#8da249] text-white font-bold shadow-md shadow-[#8da249]/30'
                    : 'text-neutral-300 hover:text-white hover:bg-white/10'
                }`}
              >
                <div className="flex items-center gap-3">
                  <ShoppingBag className="w-4 h-4" />
                  <span>Etalase Makanan</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenOrders();
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  activePage === 'pesanan'
                    ? 'bg-[#8da249] text-white font-bold shadow-md shadow-[#8da249]/30'
                    : 'text-neutral-300 hover:text-white hover:bg-white/10'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Receipt className="w-4 h-4" />
                  <span>Pesanan</span>
                </div>
                {activeOrdersCount > 0 && (
                  <span className="px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#f89254] text-white">
                    {activeOrdersCount}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenChat();
                }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  activePage === 'chat' || activePage === 'chat-bot'
                    ? 'bg-[#8da249] text-white font-bold shadow-md shadow-[#8da249]/30'
                    : 'text-neutral-300 hover:text-white hover:bg-white/10'
                }`}
              >
                <div className="flex items-center gap-3">
                  <MessageSquare className="w-4 h-4" />
                  <span>Chat Penjual</span>
                </div>
                <span className="w-2 h-2 rounded-full bg-[#f89254] animate-pulse" />
              </button>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenHistory();
                }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  activePage === 'history'
                    ? 'bg-[#8da249] text-white font-bold shadow-md shadow-[#8da249]/30'
                    : 'text-neutral-300 hover:text-white hover:bg-white/10'
                }`}
              >
                <Clock className="w-4 h-4" />
                <span>History Pesanan</span>
              </button>

              {currentUser && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenCart();
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    activePage === 'kantong'
                      ? 'bg-[#8da249] text-white font-bold shadow-md shadow-[#8da249]/30'
                      : 'text-neutral-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <ShoppingBag className="w-4 h-4 text-amber-400" />
                    <span>Kantong Belanja</span>
                  </div>
                  {totalCartItems > 0 && (
                    <span className="px-1.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-[#f89254] text-white">
                      {totalCartItems}
                    </span>
                  )}
                </button>
              )}

              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenLanding();
                }}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-neutral-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <Home className="w-4 h-4 text-neutral-400" />
                <span>Beranda (Landing)</span>
              </button>
            </>
          )}

          {/* Special Portals Divider */}
          <div className="pt-3 pb-1 border-t border-white/10 mt-3">
            <span className="px-3 text-[10px] font-mono font-bold uppercase tracking-wider text-neutral-400">
              Portal & Tata Kelola
            </span>
          </div>

          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenSeller();
            }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-[#8da249] bg-[#8da249]/10 hover:bg-[#8da249]/20 transition-colors cursor-pointer"
          >
            <Store className="w-4 h-4" />
            <span>Portal Mitra UMKM</span>
          </button>

          <button
            type="button"
            onClick={() => {
              onClose();
              onOpenAdmin();
            }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-cyan-400 bg-cyan-400/10 hover:bg-cyan-400/20 transition-colors cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4" />
            <span>Panel Tata Kelola Admin</span>
          </button>

          {/* User Settings in Drawer */}
          {currentUser && (
            <>
              {onOpenAddressSettings && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenAddressSettings();
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-neutral-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <MapPin className="w-4 h-4 text-emerald-400" />
                  <span>Alamat Default: {currentUser.district || 'Coblong'}</span>
                </button>
              )}

              {onOpenProfileSettings && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenProfileSettings();
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold text-neutral-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
                >
                  <Settings className="w-4 h-4 text-neutral-400" />
                  <span>Pengaturan Profil</span>
                </button>
              )}
            </>
          )}
        </div>

        {/* Drawer Footer (User Profile or Login CTA) */}
        <div className="p-3 border-t border-white/10 bg-[#1F281A]">
          {currentUser ? (
            <div className="flex items-center justify-between gap-2 p-2 rounded-xl bg-white/5 border border-white/10">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-full bg-[#8da249] text-white font-bold flex items-center justify-center text-xs shrink-0">
                  {getInitials(currentUser.name)}
                </div>
                <div className="min-w-0">
                  <span className="font-bold text-xs text-white block truncate">
                    {currentUser.name}
                  </span>
                  <span className="text-[10px] text-neutral-400 block truncate font-mono">
                    {currentUser.email}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  onLogout();
                }}
                className="p-1.5 rounded-lg text-rose-400 hover:bg-rose-500/20 hover:text-rose-200 transition-colors cursor-pointer shrink-0"
                title="Keluar dari Akun"
                aria-label="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenAuth();
              }}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#8da249] hover:bg-[#9eb455] text-white text-xs font-bold transition-all shadow-md shadow-[#8da249]/20 cursor-pointer"
            >
              <User className="w-4 h-4" />
              <span>Login / Masuk Akun</span>
            </button>
          )}
        </div>
      </aside>
    </div>
  );
};
