import React from 'react';
import { Sparkles, Bot } from 'lucide-react';

interface FloatingChatButtonProps {
  onOpenChatBot: () => void;
}

export const FloatingChatButton: React.FC<FloatingChatButtonProps> = ({
  onOpenChatBot,
}) => {
  return (
    <div className="fixed bottom-20 md:bottom-6 right-4 sm:right-6 z-40 select-none">
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
    </div>
  );
};
