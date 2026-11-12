import React, { useState } from 'react';
import {
  Bot,
  Sparkles,
  X,
  Minimize2,
  Maximize2,
} from 'lucide-react';
import { BotChatView } from './BotChatView';
import { SisaPiringItem } from '../../data/sisaPiringCatalog';

interface FloatingChatButtonProps {
  catalog: SisaPiringItem[];
  onOpenEtalase?: () => void;
  onOpenOrders?: () => void;
  onOpenSellerChat?: (merchantName?: string) => void;
  onSelectProduct?: (item: SisaPiringItem) => void;
}

export const FloatingChatButton: React.FC<FloatingChatButtonProps> = ({
  catalog,
  onOpenEtalase,
  onOpenOrders,
  onOpenSellerChat,
  onSelectProduct,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <>
      {/* ======================================================== */}
      {/* 1. FLOATING AI BOT CHAT DIALOG / DRAWER WINDOW */}
      {/* ======================================================== */}
      {isOpen && (
        <div
          className={`fixed z-50 transition-all duration-200 animate-in fade-in slide-in-from-bottom-4 ${
            isExpanded
              ? 'inset-2 sm:inset-6 md:inset-10'
              : 'bottom-20 md:bottom-6 right-2 sm:right-6 w-full sm:w-[440px] max-w-[calc(100vw-16px)] h-[620px] max-h-[85vh]'
          }`}
          role="dialog"
          aria-modal="true"
          aria-label="SisaPiring AI Assistant Chat Window"
        >
          <div className="w-full h-full bg-white rounded-3xl border border-stone-200/90 shadow-2xl flex flex-col overflow-hidden">
            {/* Window Top Controls Bar */}
            <div className="bg-[#16382C] text-white px-4 py-3 flex items-center justify-between gap-3 shrink-0 shadow-xs">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-8 h-8 rounded-xl bg-white/10 text-amber-300 flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-extrabold text-xs sm:text-sm text-white truncate">
                      SisaPiring AI Assistant
                    </span>
                    <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30 shrink-0">
                      24/7
                    </span>
                  </div>
                  <span className="text-[10px] text-emerald-200 block truncate">
                    Asisten Rekomendasi & Panduan Food Safety
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                {/* Expand / Minimize Window */}
                <button
                  type="button"
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="p-1.5 text-stone-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer hidden sm:block"
                  title={isExpanded ? 'Kecilkan Jendela' : 'Perbesar Jendela'}
                  aria-label="Ukuran Jendela"
                >
                  {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                </button>

                {/* Close Button */}
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    setIsExpanded(false);
                  }}
                  className="p-1.5 text-stone-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
                  title="Tutup Chat Bot"
                  aria-label="Tutup"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Embedded Bot Chat View (Height flex-1) */}
            <div className="flex-1 overflow-hidden">
              <BotChatView
                catalog={catalog}
                onOpenEtalase={() => {
                  setIsOpen(false);
                  if (onOpenEtalase) onOpenEtalase();
                }}
                onOpenOrders={() => {
                  setIsOpen(false);
                  if (onOpenOrders) onOpenOrders();
                }}
                onOpenSellerChat={(merchantName) => {
                  setIsOpen(false);
                  if (onOpenSellerChat) onOpenSellerChat(merchantName);
                }}
                onSelectProduct={(item) => {
                  setIsOpen(false);
                  if (onSelectProduct) onSelectProduct(item);
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* 2. FLOATING TRIGGER BUTTON (KHUSUS CHAT BOT AI) */}
      {/* ======================================================== */}
      {!isOpen && (
        <div className="fixed bottom-20 md:bottom-6 right-4 sm:right-6 z-40 select-none">
          <button
            type="button"
            onClick={() => setIsOpen(true)}
            className="h-12 px-4 rounded-full bg-gradient-to-tr from-[#16382C] to-emerald-800 hover:from-emerald-950 hover:to-emerald-700 text-white shadow-xl hover:shadow-2xl border border-white/25 flex items-center gap-2.5 transition-all transform hover:scale-105 cursor-pointer group"
            title="Tanya SisaPiring AI Bot (Rekomendasi & Panduan 24/7)"
            aria-label="Buka Chat dengan Bot AI"
          >
            <div className="w-7 h-7 rounded-full bg-white/15 flex items-center justify-center relative">
              <Sparkles className="w-4 h-4 text-amber-300 group-hover:rotate-12 transition-transform" />
              <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-emerald-400 ring-2 ring-[#16382C] animate-pulse" />
            </div>

            <div className="text-left hidden sm:block">
              <span className="text-xs font-bold font-sans tracking-wide block leading-tight">
                Tanya AI Bot
              </span>
              <span className="text-[9px] text-amber-300/90 font-mono block leading-none">
                Bantuan 24/7
              </span>
            </div>
          </button>
        </div>
      )}
    </>
  );
};
