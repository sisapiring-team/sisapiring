import React, { useState } from 'react';
import { MessageSquare, Sparkles, Store, X } from 'lucide-react';

interface FloatingChatButtonProps {
  onOpenChat: (mode: 'seller' | 'bot') => void;
  unreadCount?: number;
}

export const FloatingChatButton: React.FC<FloatingChatButtonProps> = ({
  onOpenChat,
  unreadCount = 1,
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-20 md:bottom-6 right-4 sm:right-6 z-40 select-none">
      {/* Expanded Quick Options Menu */}
      {isOpen && (
        <div className="mb-3 w-56 bg-white border border-stone-200/90 rounded-2xl shadow-2xl p-2 space-y-1.5 animate-in fade-in slide-in-from-bottom-3 backdrop-blur-md">
          <div className="px-3 py-1.5 border-b border-stone-100 flex items-center justify-between">
            <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">
              Pusat Pesan
            </span>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="text-stone-400 hover:text-stone-800 p-0.5 rounded cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <button
            type="button"
            onClick={() => {
              setIsOpen(false);
              onOpenChat('seller');
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-stone-800 hover:bg-emerald-50 hover:text-[#16382C] transition-colors cursor-pointer text-left group"
          >
            <div className="w-7 h-7 rounded-lg bg-emerald-100 text-[#16382C] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Store className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="block truncate font-bold text-xs">Chat Penjual UMKM</span>
              <span className="block text-[10px] text-stone-400 truncate">Tanya ketersediaan porsi</span>
            </div>
            {unreadCount > 0 && (
              <span className="w-4 h-4 rounded-full bg-[#EE4D2D] text-white text-[9px] font-bold font-mono flex items-center justify-center shrink-0">
                {unreadCount}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              setIsOpen(false);
              onOpenChat('bot');
            }}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-semibold text-stone-800 hover:bg-emerald-50 hover:text-[#16382C] transition-colors cursor-pointer text-left group"
          >
            <div className="w-7 h-7 rounded-lg bg-[#16382C] text-amber-300 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="block truncate font-bold text-xs">Chat dengan Bot</span>
              <span className="block text-[10px] text-stone-400 truncate">Rekomendasi & Garansi 24/7</span>
            </div>
          </button>
        </div>
      )}

      {/* Main Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="h-12 px-4 rounded-full bg-[#16382C] hover:bg-emerald-900 text-white shadow-xl hover:shadow-2xl border border-white/20 flex items-center gap-2.5 transition-all transform hover:scale-105 cursor-pointer relative"
        title="Buka Chat Penjual & Bot"
        aria-label="Pusat Pesan & Chat Bot"
      >
        <div className="relative">
          <MessageSquare className="w-5 h-5 text-amber-300" />
          {unreadCount > 0 && (
            <span className="absolute -top-1.5 -right-2 w-4 h-4 rounded-full bg-[#EE4D2D] text-white text-[9px] font-bold font-mono flex items-center justify-center ring-2 ring-[#16382C]">
              {unreadCount}
            </span>
          )}
        </div>
        <span className="text-xs font-bold font-sans tracking-wide hidden sm:inline">
          Chat & AI Bot
        </span>
      </button>
    </div>
  );
};
