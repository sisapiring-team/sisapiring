import React, { useState, useEffect, useRef } from 'react';
import {
  Send,
  Sparkles,
  Bot,
  RotateCcw,
  ShoppingBag,
  ExternalLink,
  ShieldCheck,
  Flame,
  Soup,
  QrCode,
  Leaf,
  CheckCircle2,
} from 'lucide-react';
import { ChatMessage, BotQuickPrompt } from './types';
import { BOT_QUICK_PROMPTS, INITIAL_BOT_MESSAGES } from './chatData';
import { generateBotResponse } from './botEngine';
import { SisaPiringItem } from '../../data/sisaPiringCatalog';
import { ResilientImage } from '../ResilientImage';

interface BotChatViewProps {
  catalog: SisaPiringItem[];
  onOpenEtalase?: () => void;
  onOpenOrders?: () => void;
  onOpenSellerChat?: (merchantName?: string) => void;
  onSelectProduct?: (item: SisaPiringItem) => void;
}

export const BotChatView: React.FC<BotChatViewProps> = ({
  catalog,
  onOpenEtalase,
  onOpenOrders,
  onOpenSellerChat,
  onSelectProduct,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>(INITIAL_BOT_MESSAGES);
  const [inputQuery, setInputQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const handleSendMessage = async (text: string) => {
    if (!text.trim() || isTyping) return;

    const userMessage: ChatMessage = {
      id: `usr-msg-${Date.now()}`,
      sender: 'user',
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputQuery('');
    setIsTyping(true);

    // Simulate AI thinking and retrieve intelligent response
    setTimeout(async () => {
      try {
        const botResponse = await generateBotResponse(text, catalog);
        const botMessage: ChatMessage = {
          id: `bot-msg-${Date.now()}`,
          sender: 'bot',
          text: botResponse.text || 'Ada hal lain yang dapat saya bantu terkait penyelamatan makanan?',
          timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
          actionChips: botResponse.actionChips,
          productCard: botResponse.productCard,
        };

        setMessages((prev) => [...prev, botMessage]);
      } catch (err) {
        setMessages((prev) => [
          ...prev,
          {
            id: `bot-err-${Date.now()}`,
            sender: 'bot',
            text: 'Maaf, terjadi sedikit kendala teknis. Namun Anda tetap dapat menjelajahi menu sisa piring langsung di etalase!',
            timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
            actionChips: [{ label: 'Buka Etalase Makanan', action: 'open_etalase' }],
          },
        ]);
      } finally {
        setIsTyping(false);
      }
    }, 800);
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
  };

  const getPromptIcon = (iconName: string) => {
    switch (iconName) {
      case 'Soup':
        return <Soup className="w-4 h-4 text-amber-600" />;
      case 'ShieldCheck':
        return <ShieldCheck className="w-4 h-4 text-emerald-600" />;
      case 'Flame':
        return <Flame className="w-4 h-4 text-rose-500" />;
      case 'QrCode':
        return <QrCode className="w-4 h-4 text-indigo-600" />;
      case 'Leaf':
        return <Leaf className="w-4 h-4 text-emerald-500" />;
      default:
        return <Sparkles className="w-4 h-4 text-amber-500" />;
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] min-h-[580px] max-h-[820px] bg-white rounded-3xl border border-stone-200/90 shadow-xl overflow-hidden font-sans">
      {/* ======================================================== */}
      {/* 1. BOT HEADER */}
      {/* ======================================================== */}
      <div className="px-5 py-3.5 border-b border-stone-200/80 bg-white flex items-center justify-between gap-3 shadow-2xs shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-[#16382C] to-emerald-700 text-amber-300 flex items-center justify-center shadow-xs shrink-0">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h4 className="font-extrabold text-sm sm:text-base text-stone-900 tracking-tight">
                SisaPiring AI Assistant
              </h4>
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-100 text-amber-900 border border-amber-200 shrink-0">
                <Sparkles className="w-2.5 h-2.5 text-amber-600 animate-pulse" />
                AI Penyelamat Pangan
              </span>
            </div>
            <p className="text-[11px] text-stone-500 mt-0.5">
              Siap memandu rekomendasi sisa piring, jaminan garansi 100%, dan tips food safety
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
      <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 bg-[#FAF9F6]">
        {/* Suggested Quick Prompts Grid (When few messages) */}
        {messages.length <= 2 && (
          <div className="mb-4">
            <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider block mb-2 px-1">
              Topik Populer Warga Bandung:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              {BOT_QUICK_PROMPTS.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handleSendMessage(p.query)}
                  className="p-3 bg-white hover:bg-emerald-50/50 border border-stone-200 hover:border-emerald-600/40 rounded-2xl text-left transition-all shadow-2xs hover:shadow-xs cursor-pointer group"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <div className="w-7 h-7 rounded-xl bg-stone-100 group-hover:bg-white flex items-center justify-center shrink-0">
                      {getPromptIcon(p.icon)}
                    </div>
                    <span className="font-bold text-xs text-stone-900 group-hover:text-[#16382C]">
                      {p.title}
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-500 line-clamp-1">{p.subtitle}</p>
                </button>
              ))}
            </div>
          </div>
        )}

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
                    ? 'bg-[#16382C] text-white rounded-br-xs'
                    : 'bg-white text-stone-800 border border-stone-200/90 rounded-bl-xs'
                  }`}
              >
                {!isUser && (
                  <div className="flex items-center gap-1.5 mb-2 pb-1.5 border-b border-stone-100 text-[11px] font-bold text-[#16382C]">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
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
                        <span className="font-bold text-xs text-[#16382C]">
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
                        className="px-3 py-1.5 bg-[#16382C] text-white rounded-xl text-[11px] font-bold hover:bg-emerald-900 transition-colors shrink-0 cursor-pointer shadow-xs"
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
                      className="px-3 py-1 text-[11px] font-semibold bg-white border border-stone-200/90 rounded-full hover:border-[#16382C] hover:bg-emerald-50/70 text-stone-700 hover:text-[#16382C] transition-all shadow-2xs cursor-pointer flex items-center gap-1.5"
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
            <div className="bg-white border border-stone-200/90 rounded-2xl rounded-bl-xs px-4 py-3 shadow-xs flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-bounce" />
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-bounce [animation-delay:0.2s]" />
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-bounce [animation-delay:0.4s]" />
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
        className="p-3.5 bg-white border-t border-stone-200/90 flex items-center gap-2 shrink-0"
      >
        <div className="flex-1 relative">
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            disabled={isTyping}
            placeholder="Tanyakan rekomendasi makanan, garansi refund, atau tips food safety..."
            className="w-full px-4 py-2.5 text-xs sm:text-sm bg-[#FAF9F6] border border-stone-300 rounded-2xl focus:outline-none focus:border-[#16382C] focus:bg-white transition-colors disabled:opacity-50"
          />
        </div>

        <button
          type="submit"
          disabled={!inputQuery.trim() || isTyping}
          className="w-10 h-10 rounded-2xl bg-[#16382C] hover:bg-emerald-900 disabled:opacity-40 disabled:cursor-not-allowed text-white flex items-center justify-center transition-colors shadow-xs cursor-pointer shrink-0"
          aria-label="Kirim Pertanyaan"
        >
          <Send className="w-4 h-4 ml-0.5" />
        </button>
      </form>
    </div>
  );
};

