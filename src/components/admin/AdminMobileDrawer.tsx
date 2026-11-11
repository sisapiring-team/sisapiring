import React from 'react';
import { X } from 'lucide-react';
import { AdminSidebar } from './AdminSidebar';
import { AdminTab, AdminMacroStats } from './types';

interface AdminMobileDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  activeTab: AdminTab;
  onTabChange: (tab: AdminTab) => void;
  macroStats: AdminMacroStats;
  onSwitchToPublicEtalase: () => void;
  onSwitchToSellerPortal?: () => void;
}

export const AdminMobileDrawer: React.FC<AdminMobileDrawerProps> = ({
  isOpen,
  onClose,
  activeTab,
  onTabChange,
  macroStats,
  onSwitchToPublicEtalase,
  onSwitchToSellerPortal,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 lg:hidden flex">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in"
        onClick={onClose}
      />

      {/* Drawer Container */}
      <div className="relative z-10 h-full flex flex-col animate-in slide-in-from-left duration-200">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 z-20 p-1.5 rounded-lg bg-white/10 text-white hover:bg-white/20 cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <AdminSidebar
          activeTab={activeTab}
          onTabChange={(tab) => {
            onTabChange(tab);
            onClose();
          }}
          macroStats={macroStats}
          onSwitchToPublicEtalase={() => {
            onSwitchToPublicEtalase();
            onClose();
          }}
          onSwitchToSellerPortal={() => {
            if (onSwitchToSellerPortal) onSwitchToSellerPortal();
            onClose();
          }}
        />
      </div>
    </div>
  );
};
