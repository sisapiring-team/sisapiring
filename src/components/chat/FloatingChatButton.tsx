import React from 'react';
import { Sparkles, ShoppingBag } from 'lucide-react';

interface FloatingChatButtonProps {
  onOpenChatBot: () => void;
  totalCartItems?: number;
  onOpenCart?: () => void;
  showCart?: boolean;
  showBot?: boolean;
}

export const FloatingChatButton: React.FC<FloatingChatButtonProps> = ({
  onOpenChatBot,
  totalCartItems = 0,
  onOpenCart,
  showCart = true,
  showBot = true,
}) => {
  if (!showCart && !showBot) return null;

  return (
    <div className="fixed bottom-20 right-4 sm:right-6 z-40 flex flex-col items-end gap-2.5 select-none">
      {/* 1. TOMBOL KANTONG PENYELAMATAN (DI ATAS TOMBOL AI) */}
      {showCart && onOpenCart && (
        <button
          type="button"
          onClick={onOpenCart}
          className="h-12 px-3.5 sm:px-4 rounded-full bg-[#1F281A] hover:bg-[#2D3A26] text-white shadow-xl hover:shadow-2xl shadow-black/25 border border-white/20 flex items-center gap-2.5 transition-all transform hover:scale-105 cursor-pointer group"
          title="Buka Kantong Penyelamatan"
          aria-label={`Buka Kantong Belanja (${totalCartItems} item)`}
        >
          <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center relative">
            <ShoppingBag className="w-4 h-4 text-[#8da249] group-hover:scale-110 transition-transform" />
            {totalCartItems > 0 && (
              <span className="absolute -top-1.5 -right-2 min-w-[19px] h-[19px] px-1 rounded-full bg-[#f89254] text-white text-[10px] font-extrabold flex items-center justify-center shadow-md animate-bounce">
                {totalCartItems}
              </span>
            )}
          </div>

          <div className="text-left hidden sm:block">
            <span className="text-xs font-bold font-sans tracking-wide block leading-tight text-white">
              Kantong
            </span>
            <span className="text-[9px] text-[#fbe1b5] font-mono block leading-none">
              {totalCartItems > 0 ? `${totalCartItems} item` : '0 item'}
            </span>
          </div>
        </button>
      )}

      {/* 2. TOMBOL TANYA AI BOT (DI BAWAH TOMBOL KANTONG) */}
      {showBot && (
        <button
          type="button"
          onClick={onOpenChatBot}
          className="h-12 px-4 rounded-full bg-[#8da249] hover:bg-[#7b8e3d] text-white shadow-xl hover:shadow-2xl shadow-[#8da249]/25 border border-white/25 flex items-center gap-2.5 transition-all transform hover:scale-105 cursor-pointer group"
          title="Tanya SisaPiring AI Bot (Buka Halaman Chat Bot 24/7)"
          aria-label="Buka Halaman Chat dengan Bot AI"
        >
          <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center relative">
            <Sparkles className="w-4 h-4 text-[#fbe1b5] group-hover:rotate-12 transition-transform" />
            <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-[#f89254] ring-2 ring-[#1F281A] animate-pulse" />
          </div>

          <div className="text-left hidden sm:block">
            <span className="text-xs font-bold font-sans tracking-wide block leading-tight text-white">
              Tanya AI Bot
            </span>
            <span className="text-[9px] text-[#fbe1b5] font-mono block leading-none">
              Bantuan 24/7
            </span>
          </div>
        </button>
      )}
    </div>
  );
};
