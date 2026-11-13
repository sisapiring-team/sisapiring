import React, { useState, useEffect, useRef } from 'react';
import {
  Send,
  Sparkles,
  Bot,
  RotateCcw,
  ShoppingBag,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  ArrowLeft,
} from 'lucide-react';
import { ChatMessage } from './types';
import { INITIAL_BOT_MESSAGES } from './chatData';
import { generateBotResponse } from './botEngine';
import { SisaPiringItem } from '../../data/sisaPiringCatalog';
import { ResilientImage } from '../ResilientImage';
import { apiClient } from '../../lib/api';

interface BotChatViewProps {
  catalog: SisaPiringItem[];
  onBack?: () => void;
  onOpenEtalase?: () => void;
  onOpenOrders?: () => void;
  onOpenSellerChat?: (merchantName?: string) => void;
  onSelectProduct?: (item: SisaPiringItem) => void;
}

export const BotChatView: React.FC<BotChatViewProps> = ({
  catalog,
  onBack,
  onOpenEtalase,
  onOpenOrders,
  onOpenSellerChat,
  onSelectProduct,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_BOT_MESSAGES);
  const [inputQuery, setInputQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [conversationId, setConversationId] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isTyping) return;

    const trimmedText = text.trim();
    const userMessage: ChatMessage = {
      id: `usr-msg-${Date.now()}`,
      sender: 'user',
      text: trimmedText,
      timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputQuery('');
    setIsTyping(true);

    try {
      const payload: { message: string; conversation_id?: number } = {
        message: trimmedText,
      };
      if (conversationId) {
        payload.conversation_id = conversationId;
      }

      const response = await apiClient.post<{
        conversationId?: number;
        reply?: string;
        usedFallback?: boolean;
      }>('/assistant/chat', payload, {
        timeout: 8000,
      });

      const data = response.data;

      if (data?.conversationId) {
        setConversationId(data.conversationId);
      }

      // Check if backend used fallback or reply is empty
      if (data?.usedFallback || !data?.reply) {
        const botResponse = await generateBotResponse(trimmedText, catalog);
        const botMessage: ChatMessage = {
          id: `bot-msg-${Date.now()}`,
          sender: 'bot',
          text: botResponse.text || data?.reply || 'Ada hal lain yang dapat saya bantu terkait penyelamatan makanan?',
          timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
          actionChips: botResponse.actionChips,
          productCard: botResponse.productCard,
        };

        setMessages((prev) => [...prev, botMessage]);
      } else {
        // Successful Live Gemini LLM response
        const botMessage: ChatMessage = {
          id: `bot-msg-${Date.now()}`,
          sender: 'bot',
          text: data.reply,
          timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
          actionChips: [
            { label: 'Lihat Semua di Etalase', action: 'open_etalase' },
            { label: 'Cek Status Pesanan', action: 'open_orders' },
            { label: 'Tips Food Safety', action: 'ask', payload: 'Tips panaskan makanan' },
          ],
        };

        setMessages((prev) => [...prev, botMessage]);
      }
    } catch (_error) {
      // Fallback to botEngine if network, timeout (8s), 401, or 500 error occurs
      try {
        const botResponse = await generateBotResponse(trimmedText, catalog);
        const botMessage: ChatMessage = {
          id: `bot-msg-${Date.now()}`,
          sender: 'bot',
          text: botResponse.text || 'Ada hal lain yang dapat saya bantu terkait penyelamatan makanan?',
          timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
          actionChips: botResponse.actionChips,
          productCard: botResponse.productCard,
        };

        setMessages((prev) => [...prev, botMessage]);
      } catch (_fallbackError) {
        setMessages((prev) => [
          ...prev,
          {
            id: `bot-err-${Date.now()}`,
            sender: 'bot',
            text: 'Maaf, terjadi sedikit kendala koneksi. Namun Anda tetap dapat menjelajahi menu sisa piring langsung di etalase!',
            timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
            actionChips: [{ label: 'Buka Etalase Makanan', action: 'open_etalase' }],
          },
        ]);
      }
    } finally {
      setIsTyping(false);
    }
  };

  const handleActionChipClick = (action: string, payload?: string) => {
    if (action === 'open_etalase' && onOpenEtalase) {
      onOpenEtalase();
    } else if (action === 'open_orders' && onOpenOrders) {
      onOpenOrders();
    } else if (action === 'open_seller_chat' && onOpenSellerChat) {
      onOpenSellerChat(payload);
    } else if (action === 'ask' && payload) {
      handleSendMessage(payload);
    }
  };

  const handleResetChat = () => {
    setMessages(INITIAL_BOT_MESSAGES);
    setConversationId(null);
  };

  return (
    <div className="flex flex-col h-full w-full bg-white overflow-hidden font-sans">
      {/* ======================================================== */}
      {/* 1. BOT HEADER */}
      {/* ======================================================== */}
      <div className="px-4 sm:px-6 py-3 border-b border-stone-200/80 bg-white flex items-center justify-between gap-3 shadow-2xs shrink-0">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="p-2 -ml-2 text-stone-600 hover:text-stone-900 rounded-xl hover:bg-stone-100 transition-colors flex items-center gap-1.5 text-xs font-bold cursor-pointer shrink-0"
              title="Kembali ke Etalase"
              aria-label="Kembali"
            >
              <ArrowLeft className="w-5 h-5 text-stone-700" />
            </button>
          )}
          <div className="w-10 h-10 rounded-2xl bg-[#8da249] text-white flex items-center justify-center shadow-xs shrink-0">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-extrabold text-sm sm:text-base text-stone-900 tracking-tight">
                SisaPiring AI Assistant
              </h4>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-[#8da249]/20 text-[#8da249] border border-[#8da249]/30 shrink-0">
                <Sparkles className="w-2.5 h-2.5 text-[#8da249] animate-pulse" />
                AI 24/7
              </span>
            </div>
            <p className="text-[11px] text-stone-500 mt-0.5">
              Konsultasi kuliner hemat, garansi escrow refund 100%, dan panduan food safety
            </p>
          </div>
        </div>

        {/* Reset Chat Button */}
        <button
          type="button"
          onClick={handleResetChat}
          className="p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-xl transition-colors cursor-pointer"
          title="Mulai Ulang Obrolan"
          aria-label="Mulai Ulang Obrolan"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* ======================================================== */}
      {/* 2. CHAT STREAM VIEWPORT */}
      {/* ======================================================== */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 bg-white">
        {/* Messages List */}
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
            >
              <div
                className={`max-w-[90%] sm:max-w-[75%] rounded-3xl p-4 text-xs sm:text-[13px] leading-relaxed shadow-xs relative ${isUser
                    ? 'bg-[#1F281A] text-white border-2 border-[#1F281A] rounded-br-xs'
                    : 'bg-white text-stone-900 border-2 border-[#8da249]/70 rounded-bl-xs shadow-xs'
                  }`}
              >
                {!isUser && (
                  <div className="flex items-center gap-1.5 mb-2 pb-1.5 border-b border-[#8da249]/20 text-[11px] font-bold text-[#1F281A]">
                    <Sparkles className="w-3.5 h-3.5 text-[#8da249]" />
                    <span>SisaPiring AI</span>
                  </div>
                )}

                <div className="prose prose-sm max-w-none text-inherit prose-strong:text-inherit whitespace-pre-wrap">
                  {msg.text}
                </div>

                {/* Optional Embedded Product Card from AI Recommendation */}
                {msg.productCard && (
                  <div className="mt-3 p-3 bg-stone-50 rounded-2xl border border-stone-200 flex items-center gap-3">
                    <div className="w-16 h-16 rounded-xl overflow-hidden bg-stone-200 shrink-0">
                      <ResilientImage
                        src={msg.productCard.imageUrl}
                        alt={msg.productCard.title}
                        fallbackTitle={msg.productCard.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className="font-bold text-xs text-stone-900 block truncate">
                        {msg.productCard.title}
                      </span>
                      <span className="text-[10px] text-stone-500 block truncate">
                        {msg.productCard.merchantName}
                      </span>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="font-bold text-xs text-[#1F281A]">
                          Rp {msg.productCard.price.toLocaleString('id-ID')}
                        </span>
                        <span className="text-[10px] line-through text-stone-400">
                          Rp {msg.productCard.originalPrice.toLocaleString('id-ID')}
                        </span>
                      </div>
                    </div>
                    {onSelectProduct && (
                      <button
                        type="button"
                        onClick={() => {
                          const item = catalog.find((c) => c.id === msg.productCard?.id);
                          if (item) onSelectProduct(item);
                        }}
                        className="px-3 py-1.5 bg-[#1F281A] text-white rounded-xl text-[11px] font-bold hover:bg-emerald-900 transition-colors shrink-0 cursor-pointer shadow-xs"
                      >
                        Pesan
                      </button>
                    )}
                  </div>
                )}

                <div
                  className={`flex items-center justify-end gap-1 mt-2 text-[10px] font-mono ${isUser ? 'text-emerald-200' : 'text-stone-400'
                    }`}
                >
                  <span>{msg.timestamp}</span>
                </div>
              </div>

              {/* Action Chips Under Bot Message */}
              {msg.actionChips && msg.actionChips.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mt-2 ml-1">
                  {msg.actionChips.map((chip, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleActionChipClick(chip.action, chip.payload)}
                      className="px-3 py-1 text-[11px] font-semibold bg-white border border-stone-200/90 rounded-full hover:border-[#1F281A] hover:bg-emerald-50/70 text-stone-700 hover:text-[#1F281A] transition-all shadow-2xs cursor-pointer flex items-center gap-1.5"
                    >
                      <span>{chip.label}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}

        {/* Typing indicator bubble */}
        {isTyping && (
          <div className="flex items-start">
            <div className="bg-white border-2 border-[#8da249]/70 rounded-2xl rounded-bl-xs px-4 py-3 shadow-xs flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#8da249] animate-bounce" />
              <span className="w-2 h-2 rounded-full bg-[#8da249] animate-bounce [animation-delay:0.2s]" />
              <span className="w-2 h-2 rounded-full bg-[#8da249] animate-bounce [animation-delay:0.4s]" />
              <span className="text-[11px] text-stone-400 font-medium ml-1">
                SisaPiring AI sedang mencari jawaban...
              </span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* ======================================================== */}
      {/* 3. INPUT BAR */}
      {/* ======================================================== */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSendMessage(inputQuery);
        }}
        className="p-3 sm:p-3.5 bg-white border-t border-stone-200/90 shadow-[0_-2px_10px_rgba(0,0,0,0.04)] sticky bottom-0 z-20 flex items-center gap-2 shrink-0"
      >
        <div className="flex-1 relative">
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            disabled={isTyping}
            placeholder="Tanya rekomendasi sisa piring, garansi refund, tips food safety..."
            className="w-full px-4 py-2.5 sm:py-3 text-xs sm:text-sm bg-stone-50 hover:bg-white focus:bg-white border border-stone-300 focus:border-[#8da249] rounded-2xl focus:outline-none transition-colors disabled:opacity-50 text-stone-900 placeholder:text-stone-400 shadow-inner"
          />
        </div>

        <button
          type="submit"
          disabled={!inputQuery.trim() || isTyping}
          className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-[#1F281A] hover:bg-emerald-900 disabled:opacity-40 disabled:cursor-not-allowed text-white flex items-center justify-center transition-colors shadow-sm cursor-pointer shrink-0"
          aria-label="Kirim Pertanyaan"
        >
          <Send className="w-4 h-4 ml-0.5" />
        </button>
      </form>
    </div>
  );
};

