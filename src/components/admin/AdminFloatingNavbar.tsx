import React, { useState } from 'react';
import {
  Sun,
  Moon,
  Bell,
  ChevronDown,
  ShoppingBag,
  Store,
  LogOut,
  ShieldCheck,
  Menu,
  AlertTriangle,
  Sparkles,
  Receipt,
  X,
} from 'lucide-react';
import { AdminTab } from './types';
import { useAdminDashboard } from '../../hooks/useAdminDashboard';

export const AdminFloatingNavbar: React.FC<{
  onMobileMenuToggle: () => void;
  onSwitchToPublicEtalase: () => void;
  onSwitchToSellerPortal?: () => void;
  onSelectTab?: (tab: AdminTab) => void;
}> = ({
  onMobileMenuToggle,
  onSwitchToPublicEtalase,
  onSwitchToSellerPortal,
  onSelectTab,
}) => {
  const { stats } = useAdminDashboard();
  const pendingAlertsCount = (stats?.merchantsPending ?? 0) + (stats?.openDisputes ?? 0);

  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);

  return (
    <header className="fixed top-3 sm:top-4 left-4 right-4 z-40 flex items-center justify-between pointer-events-none select-none">
      {/* 1. TOP-LEFT FLOATING PILL (Brand & Admin Badge - Matching Screenshot) */}
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

        {/* Brand & Admin Capsule */}
        <div
          onClick={() => onSelectTab && onSelectTab('overview')}
          className="flex items-center gap-2.5 px-4 py-2 rounded-full bg-[#1F281A]/90 border border-white/10 backdrop-blur-md shadow-2xl cursor-pointer hover:bg-[#2e434f] transition-colors"
          title="Ke Dashboard Ringkasan"
        >
          <div className="w-2 h-2 rounded-full bg-[#8da249] animate-pulse" />
          <span className="font-extrabold text-sm sm:text-base text-white tracking-tight font-sans">
            SisaPiring
          </span>
          <span className="px-2 py-0.5 rounded-md text-[9px] font-mono font-black tracking-wider bg-[#8da249]/20 text-[#8da249] border border-[#8da249]/30 uppercase">
            ADMIN
          </span>
        </div>
      </div>

      {/* 2. TOP-RIGHT FLOATING PILL (Controls & Operator Profile - Matching Screenshot) */}
      <div className="relative pointer-events-auto flex items-center gap-2">
        <div className="flex items-center gap-1.5 sm:gap-2.5 px-2.5 sm:px-3.5 py-1.5 rounded-full bg-[#1F281A]/90 border border-white/10 backdrop-blur-md shadow-2xl text-white">
          {/* Light / Dark Mode Toggle */}
          <button
            type="button"
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-1.5 rounded-full text-[#fbe1b5] hover:bg-white/10 transition-colors cursor-pointer"
            title={isDarkMode ? 'Mode Gelap Aktif' : 'Mode Terang Aktif'}
            aria-label="Toggle Theme"
          >
            {isDarkMode ? <Sun className="w-4 h-4 text-[#fbe1b5]" /> : <Moon className="w-4 h-4 text-[#8da249]" />}
          </button>

          {/* Notification Bell with Badge */}
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setNotificationsOpen(!notificationsOpen);
                setProfileDropdownOpen(false);
              }}
              className="p-1.5 rounded-full text-neutral-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer relative"
              title="Notifikasi Operasional Platform"
              aria-label="Notifikasi"
            >
              <Bell className="w-4 h-4" />
              {pendingAlertsCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#f89254] ring-2 ring-[#1F281A] animate-pulse" />
              )}
            </button>

            {/* Notifications Dropdown Popover */}
            {notificationsOpen && (
              <div className="absolute right-0 mt-3 w-80 bg-[#1F281A]/98 border border-white/15 rounded-2xl shadow-2xl p-3 text-xs text-white backdrop-blur-xl animate-in fade-in slide-in-from-top-2 z-50">
                <div className="flex items-center justify-between pb-2 border-b border-white/10 mb-2">
                  <div className="flex items-center gap-1.5">
                    <Bell className="w-3.5 h-3.5 text-cyan-400" />
                    <span className="font-bold text-xs text-white">Notifikasi Real-Time</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setNotificationsOpen(false)}
                    className="p-1 text-neutral-400 hover:text-white rounded-lg hover:bg-white/10 cursor-pointer"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="space-y-1.5">
                  {(stats?.openDisputes ?? 0) > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        if (onSelectTab) onSelectTab('disputes-refund');
                        setNotificationsOpen(false);
                      }}
                      className="w-full text-left p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 hover:bg-rose-500/20 transition-colors flex items-start gap-2.5 cursor-pointer"
                    >
                      <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-rose-300 block text-[11px]">
                          {stats?.openDisputes} Komplain Pembeli Terbuka
                        </span>
                        <span className="text-[10px] text-neutral-300 block">
                          Perlu evaluasi klaim garansi sisa piring & refund.
                        </span>
                      </div>
                    </button>
                  )}

                  {(stats?.merchantsPending ?? 0) > 0 && (
                    <button
                      type="button"
                      onClick={() => {
                        if (onSelectTab) onSelectTab('seller-governance');
                        setNotificationsOpen(false);
                      }}
                      className="w-full text-left p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 hover:bg-amber-500/20 transition-colors flex items-start gap-2.5 cursor-pointer"
                    >
                      <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-amber-300 block text-[11px]">
                          {stats?.merchantsPending} Verifikasi KYB Menunggu Review
                        </span>
                        <span className="text-[10px] text-neutral-300 block">
                          Tinjau legalitas NIB & uji higienitas gerai baru.
                        </span>
                      </div>
                    </button>
                  )}

                  <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Receipt className="w-4 h-4 text-indigo-400" />
                      <div>
                        <span className="text-[10px] text-neutral-400 block">Revenue Platform</span>
                        <span className="text-xs font-mono font-bold text-indigo-300">
                          {stats ? new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(stats.revenue) : '—'}
                        </span>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      Lunas
                    </span>
                  </div>

                  <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      <div>
                        <span className="text-[10px] text-neutral-400 block">SOP Mutu & Food Safety</span>
                        <span className="text-xs font-bold text-emerald-300">Operasional Normal</span>
                      </div>
                    </div>
                    <span className="text-[10px] font-mono text-neutral-400">Kota Bandung</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="h-4 w-px bg-white/15 hidden sm:block" />

          {/* User Profile Capsule Trigger (Matching Scamora Super Administrator layout) */}
          <button
            type="button"
            onClick={() => {
              setProfileDropdownOpen(!profileDropdownOpen);
              setNotificationsOpen(false);
            }}
            className="flex items-center gap-2 sm:gap-2.5 hover:opacity-90 transition-opacity cursor-pointer text-left pl-1"
            aria-label="Menu Profil Administrator"
          >
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#8da249] border border-white/20 text-white font-extrabold text-xs flex items-center justify-center shadow-xs relative shrink-0">
              SA
              <span className="absolute -bottom-0.5 -right-0.5 w-2 h-2 rounded-full bg-[#8da249] ring-2 ring-[#1F281A]" />
            </div>

            <div className="hidden md:block text-left">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-white leading-tight">
                  Super Administrator
                </span>
                <span className="inline-flex items-center gap-1 text-[9px] font-bold text-[#8da249] bg-[#8da249]/15 border border-[#8da249]/30 px-1.5 py-0.2 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#8da249] animate-pulse" />
                  Online
                </span>
              </div>
              <span className="text-[10px] text-neutral-400 block leading-tight font-mono">
                admin@sisapiring.id
              </span>
            </div>

            <ChevronDown
              className={`w-3.5 h-3.5 text-neutral-400 transition-transform ${profileDropdownOpen ? 'rotate-180' : ''
                }`}
            />
          </button>
        </div>

        {/* Profile Dropdown Menu */}
        {profileDropdownOpen && (
          <div className="absolute right-0 top-full mt-2 w-64 bg-[#1F281A]/98 border border-white/15 rounded-2xl shadow-2xl p-2.5 text-xs text-white backdrop-blur-xl animate-in fade-in slide-in-from-top-2 z-50">
            <div className="p-2 border-b border-white/10 mb-1.5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[#8da249] border border-white/20 text-white font-bold flex items-center justify-center text-xs shrink-0">
                  SA
                </div>
                <div className="min-w-0">
                  <span className="font-bold text-white block truncate">Super Administrator</span>
                  <span className="text-[10px] text-[#8da249] font-mono block truncate">
                    Kota Bandung (Diskominfokot)
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <button
                type="button"
                onClick={() => {
                  setProfileDropdownOpen(false);
                  onSwitchToPublicEtalase();
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-white/10 text-neutral-200 hover:text-white transition-colors cursor-pointer text-left"
              >
                <ShoppingBag className="w-4 h-4 text-amber-400" />
                <span>Buka Etalase Pembeli</span>
              </button>

              {onSwitchToSellerPortal && (
                <button
                  type="button"
                  onClick={() => {
                    setProfileDropdownOpen(false);
                    onSwitchToSellerPortal();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-white/10 text-neutral-200 hover:text-white transition-colors cursor-pointer text-left"
                >
                  <Store className="w-4 h-4 text-emerald-400" />
                  <span>Buka Portal Mitra UMKM</span>
                </button>
              )}
            </div>

            <div className="pt-1.5 mt-1.5 border-t border-white/10">
              <button
                type="button"
                onClick={() => {
                  setProfileDropdownOpen(false);
                  onSwitchToPublicEtalase();
                }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-rose-500/20 text-rose-300 hover:text-rose-200 transition-colors cursor-pointer text-left font-semibold"
              >
                <LogOut className="w-4 h-4 text-rose-400" />
                <span>Keluar dari Sesi Admin</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

