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
} from 'lucide-react';
import { AdminMacroStats } from './types';

interface AdminFloatingNavbarProps {
  macroStats: AdminMacroStats;
  onMobileMenuToggle: () => void;
  onSwitchToPublicEtalase: () => void;
  onSwitchToSellerPortal?: () => void;
}

export const AdminFloatingNavbar: React.FC<AdminFloatingNavbarProps> = ({
  macroStats,
  onMobileMenuToggle,
  onSwitchToPublicEtalase,
  onSwitchToSellerPortal,
}) => {
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(true);

  const pendingAlertsCount =
    (macroStats.pendingUmkmCount || 0) + (macroStats.openDisputesCount || 0);

  return (
    <header className="fixed top-3 sm:top-4 left-4 right-4 z-40 flex items-center justify-between pointer-events-none">
      {/* 1. TOP-LEFT FLOATING PILL (Brand & Admin Badge) */}
      <div className="flex items-center gap-2 pointer-events-auto">
        {/* Mobile Hamburger (Only visible on small screens) */}
        <button
          type="button"
          onClick={onMobileMenuToggle}
          className="lg:hidden p-2 rounded-2xl bg-[#131c26]/90 border border-white/10 text-white backdrop-blur-md shadow-lg hover:bg-white/10 transition-colors cursor-pointer"
          aria-label="Buka Menu"
        >
          <Menu className="w-5 h-5 text-neutral-200" />
        </button>

        <div className="flex items-center gap-2.5 px-4 py-2 rounded-full bg-[#131c26]/90 border border-white/10 backdrop-blur-md shadow-2xl">
          <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
          <span className="font-extrabold text-sm sm:text-base text-white tracking-tight">
            SisaPiring
          </span>
          <span className="px-2 py-0.5 rounded-md text-[9px] font-mono font-black tracking-wider bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 uppercase">
            ADMIN
          </span>
        </div>
      </div>

      {/* 2. TOP-RIGHT FLOATING PILL (Controls & Operator Profile) */}
      <div className="relative pointer-events-auto">
        <div className="flex items-center gap-2 sm:gap-3 px-3 sm:px-4 py-1.5 rounded-full bg-[#131c26]/90 border border-white/10 backdrop-blur-md shadow-2xl">
          {/* Light / Dark Mode Toggle */}
          <button
            type="button"
            onClick={() => setIsDarkMode(!isDarkMode)}
            className="p-1.5 rounded-full text-amber-300 hover:bg-white/10 transition-colors cursor-pointer"
            title="Mode Tampilan"
            aria-label="Toggle Theme"
          >
            {isDarkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4 text-cyan-300" />}
          </button>

          {/* Notification Bell with Badge */}
          <div className="relative">
            <button
              type="button"
              className="p-1.5 rounded-full text-neutral-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer relative"
              title="Notifikasi & Peringatan Sistem"
              aria-label="Notifikasi"
            >
              <Bell className="w-4 h-4" />
              {pendingAlertsCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-cyan-400 ring-2 ring-[#131c26]" />
              )}
            </button>
          </div>

          <div className="h-4 w-px bg-white/15 hidden sm:block" />

          {/* User Profile Capsule Trigger */}
          <button
            type="button"
            onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
            className="flex items-center gap-2.5 hover:opacity-90 transition-opacity cursor-pointer text-left"
          >
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-cyan-600/80 border border-cyan-400/50 text-cyan-100 font-extrabold text-xs flex items-center justify-center shadow-xs">
              SA
            </div>

            <div className="hidden md:block text-left">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-white leading-tight">
                  Super Administrator
                </span>
                <span className="inline-flex items-center gap-1 text-[9px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-1.5 py-0.2 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Online
                </span>
              </div>
              <span className="text-[10px] text-neutral-400 block leading-tight font-mono">
                admin@sisapiring.id
              </span>
            </div>

            <ChevronDown
              className={`w-3.5 h-3.5 text-neutral-400 transition-transform ${
                profileDropdownOpen ? 'rotate-180' : ''
              }`}
            />
          </button>
        </div>

        {/* Profile Dropdown Menu */}
        {profileDropdownOpen && (
          <div className="absolute right-0 mt-2 w-64 bg-[#111923]/98 border border-white/15 rounded-2xl shadow-2xl p-2.5 text-xs text-white backdrop-blur-xl animate-in fade-in slide-in-from-top-2 z-50">
            <div className="p-2 border-b border-white/10 mb-1.5">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-cyan-600/80 border border-cyan-400/50 text-white font-bold flex items-center justify-center text-xs">
                  SA
                </div>
                <div>
                  <span className="font-bold text-white block">Super Administrator</span>
                  <span className="text-[10px] text-cyan-300 font-mono block">Kota Bandung (Diskominfokot)</span>
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
