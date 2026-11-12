import React, { useState, useEffect, useRef } from 'react';
import {
  Send,
  Search,
  CheckCheck,
  Check,
  Store,
  MapPin,
  Clock,
  ShieldCheck,
  Image as ImageIcon,
  Paperclip,
  ExternalLink,
  ChevronLeft,
  ShoppingBag,
  Sparkles,
} from 'lucide-react';
import { SellerConversation, ChatMessage } from './types';
import { SELLER_QUICK_QUESTIONS } from './chatData';
import { ResilientImage } from '../ResilientImage';

interface SellerChatViewProps {
  conversations: SellerConversation[];
  activeConversationId?: string;
  onSelectConversation: (id: string) => void;
  onSendMessage: (conversationId: string, text: string, attachmentName?: string) => void;
  onOpenStore?: (merchantName: string) => void;
  onOpenOrder?: (orderCode: string) => void;
}

export const SellerChatView: React.FC<SellerChatViewProps> = ({
  conversations,
  activeConversationId,
  onSelectConversation,
  onSendMessage,
  onOpenStore,
  onOpenOrder,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [inputText, setInputText] = useState('');
  const [selectedAttachment, setSelectedAttachment] = useState<string | null>(null);
  const [mobileThreadOpen, setMobileThreadOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Active conversation object
  const activeConv =
    conversations.find((c) => c.id === activeConversationId) || conversations[0];

  // Auto scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeConv?.messages]);

  // Filter conversations by search
  const filteredConversations = conversations.filter((c) =>
    c.merchantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.merchantDistrict.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSend = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputText.trim() && !selectedAttachment) return;

    if (activeConv) {
      onSendMessage(activeConv.id, inputText.trim(), selectedAttachment || undefined);
      setInputText('');
      setSelectedAttachment(null);
    }
  };

  const handleQuickQuestionClick = (question: string) => {
    if (activeConv) {
      onSendMessage(activeConv.id, question);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedAttachment(file.name);
    }
  };

  return (
    <div className="flex h-[calc(100vh-140px)] min-h-[580px] max-h-[820px] bg-white rounded-3xl border border-stone-200/90 shadow-xl overflow-hidden font-sans">
      {/* ======================================================== */}
      {/* 1. LEFT SIDEBAR: LIST OF MERCHANT CONVERSATIONS */}
      {/* ======================================================== */}
      <div
        className={`w-full md:w-80 lg:w-96 border-r border-stone-200/80 bg-[#FAF9F6] flex flex-col shrink-0 ${
          mobileThreadOpen ? 'hidden md:flex' : 'flex'
        }`}
      >
        {/* Sidebar Header & Search */}
        <div className="p-4 border-b border-stone-200/80 bg-white space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#16382C]/10 text-[#16382C] flex items-center justify-center font-bold">
                <Store className="w-4 h-4" />
              </div>
              <h3 className="font-extrabold text-base text-stone-900 tracking-tight">
                Obrolan Penjual
              </h3>
            </div>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-[#16382C]">
              {conversations.length} Toko
            </span>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari toko mitra di Bandung..."
              className="w-full pl-9 pr-3.5 py-2 text-xs bg-[#FAF9F6] border border-stone-300 rounded-xl focus:outline-none focus:border-[#16382C] focus:bg-white transition-colors"
            />
          </div>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto divide-y divide-stone-100">
          {filteredConversations.length === 0 ? (
            <div className="p-8 text-center text-stone-400 text-xs">
              Tidak ada obrolan dengan toko tersebut.
            </div>
          ) : (
            filteredConversations.map((conv) => {
              const isActive = conv.id === activeConv?.id;
              return (
                <button
                  key={conv.id}
                  type="button"
                  onClick={() => {
                    onSelectConversation(conv.id);
                    setMobileThreadOpen(true);
                  }}
                  className={`w-full p-3.5 flex items-start gap-3 text-left transition-colors cursor-pointer relative ${
                    isActive
                      ? 'bg-emerald-50/70 border-l-4 border-[#16382C]'
                      : 'hover:bg-stone-50'
                  }`}
                >
                  {/* Store Avatar with Online status */}
                  <div className="relative shrink-0">
                    <div className="w-12 h-12 rounded-2xl overflow-hidden bg-stone-200 border border-stone-300/70 shadow-xs">
                      {conv.merchantAvatar ? (
                        <ResilientImage
                          src={conv.merchantAvatar}
                          alt={conv.merchantName}
                          fallbackTitle={conv.merchantName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center font-bold text-[#16382C]">
                          {conv.merchantName.slice(0, 2).toUpperCase()}
                        </div>
                      )}
                    </div>
                    {conv.isOnline && (
                      <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full" />
                    )}
                  </div>

                  {/* Merchant Info & Last Message Snippet */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <div className="flex items-center gap-1 min-w-0">
                        <span className="font-bold text-xs text-stone-900 truncate">
                          {conv.merchantName}
                        </span>
                        {conv.isVerified && (
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                        )}
                      </div>
                      <span className="text-[10px] text-stone-400 font-mono shrink-0">
                        {conv.lastMessageTime}
                      </span>
                    </div>

                    <p className="text-[11px] text-stone-500 line-clamp-1 mb-1">
                      {conv.lastMessage}
                    </p>

                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-stone-400 flex items-center gap-1 truncate">
                        <MapPin className="w-2.5 h-2.5 text-stone-400 shrink-0" />
                        {conv.merchantDistrict}
                      </span>

                      {conv.unreadCount > 0 && (
                        <span className="w-4 h-4 rounded-full bg-[#EE4D2D] text-white text-[9px] font-bold font-mono flex items-center justify-center shrink-0">
                          {conv.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. RIGHT CHAT THREAD VIEWPORT */}
      {/* ======================================================== */}
      <div
        className={`flex-1 flex flex-col h-full bg-white ${
          !mobileThreadOpen ? 'hidden md:flex' : 'flex'
        }`}
      >
        {activeConv ? (
          <>
            {/* Header: Merchant Profile & Actions */}
            <div className="px-4 py-3 border-b border-stone-200/80 bg-white flex items-center justify-between gap-3 shadow-2xs shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                {/* Back button on mobile */}
                <button
                  type="button"
                  onClick={() => setMobileThreadOpen(false)}
                  className="md:hidden p-1.5 -ml-1 text-stone-500 hover:text-stone-900 rounded-lg cursor-pointer"
                  aria-label="Kembali ke Daftar Toko"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>

                <div className="w-10 h-10 rounded-2xl overflow-hidden bg-stone-200 border border-stone-300/80 shrink-0">
                  {activeConv.merchantAvatar ? (
                    <ResilientImage
                      src={activeConv.merchantAvatar}
                      alt={activeConv.merchantName}
                      fallbackTitle={activeConv.merchantName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center font-bold text-[#16382C]">
                      {activeConv.merchantName.slice(0, 2).toUpperCase()}
                    </div>
                  )}
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h4 className="font-extrabold text-xs sm:text-sm text-stone-900 truncate">
                      {activeConv.merchantName}
                    </h4>
                    {activeConv.isVerified && (
                      <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-emerald-100 text-emerald-800 shrink-0">
                        <ShieldCheck className="w-3 h-3" />
                        Verified
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-stone-500 truncate mt-0.5">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-amber-600" />
                      Ambil: <strong className="font-mono text-stone-800">{activeConv.pickupWindow}</strong>
                    </span>
                    <span>•</span>
                    <span className="truncate">{activeConv.merchantDistrict}</span>
                  </div>
                </div>
              </div>

              {/* Action: Open Store in Catalog */}
              {onOpenStore && (
                <button
                  type="button"
                  onClick={() => onOpenStore(activeConv.merchantName)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-700 transition-colors shrink-0 cursor-pointer"
                  title="Lihat Etalase Toko"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-stone-500" />
                  <span className="hidden sm:inline">Katalog Toko</span>
                </button>
              )}
            </div>

            {/* Active Order Banner Notification (if exists) */}
            {activeConv.activeOrderCode && (
              <div className="px-4 py-2 bg-amber-50/80 border-b border-amber-200/70 flex items-center justify-between gap-2 shrink-0">
                <div className="flex items-center gap-2 text-xs">
                  <ShoppingBag className="w-4 h-4 text-amber-700 shrink-0" />
                  <span className="text-amber-900 text-[11px]">
                    Pesanan Aktif: <strong className="font-mono font-bold">#{activeConv.activeOrderCode}</strong>
                  </span>
                </div>
                {onOpenOrder && (
                  <button
                    type="button"
                    onClick={() => onOpenOrder(activeConv.activeOrderCode!)}
                    className="text-[11px] font-bold text-emerald-800 hover:underline cursor-pointer"
                  >
                    Buka Tiket Pesanan & QR
                  </button>
                )}
              </div>
            )}

            {/* Messages Scroll Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3.5 bg-[#FAF9F6]">
              <div className="text-center my-2">
                <span className="px-3 py-1 bg-stone-200/80 text-stone-600 text-[10px] font-medium rounded-full">
                  Obrolan Terenkripsi • Terhubung Langsung ke Dapur Mitra UMKM
                </span>
              </div>

              {activeConv.messages.map((msg) => {
                const isUser = msg.sender === 'user';
                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-[85%] sm:max-w-[70%] rounded-2xl p-3 text-xs leading-relaxed shadow-xs relative ${
                        isUser
                          ? 'bg-[#16382C] text-white rounded-br-xs'
                          : 'bg-white text-stone-800 border border-stone-200/80 rounded-bl-xs'
                      }`}
                    >
                      {msg.attachmentName && (
                        <div className="mb-2 p-2 rounded-xl bg-black/10 flex items-center gap-2 text-[11px]">
                          <ImageIcon className="w-4 h-4 shrink-0" />
                          <span className="truncate">{msg.attachmentName}</span>
                        </div>
                      )}

                      <p className="whitespace-pre-wrap">{msg.text}</p>

                      <div
                        className={`flex items-center justify-end gap-1 mt-1 text-[9px] font-mono ${
                          isUser ? 'text-emerald-200' : 'text-stone-400'
                        }`}
                      >
                        <span>{msg.timestamp}</span>
                        {isUser && (
                          <span>
                            {msg.status === 'read' ? (
                              <CheckCheck className="w-3 h-3 text-emerald-300" />
                            ) : (
                              <Check className="w-3 h-3" />
                            )}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Action chips attached to message */}
                    {msg.actionChips && msg.actionChips.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {msg.actionChips.map((chip, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => {
                              if (chip.action === 'view_order' && onOpenOrder && chip.payload) {
                                onOpenOrder(chip.payload);
                              } else if (chip.action === 'maps') {
                                alert(`Alamat toko: ${activeConv.merchantAddress}`);
                              }
                            }}
                            className="px-2.5 py-1 text-[11px] font-semibold bg-white border border-stone-200 rounded-full hover:bg-stone-100 text-stone-700 transition-colors shadow-2xs cursor-pointer"
                          >
                            {chip.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick Questions Chips Carousel */}
            <div className="px-4 py-2 bg-stone-50/90 border-t border-stone-200/70 overflow-x-auto flex items-center gap-1.5 shrink-0 scrollbar-none">
              <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider shrink-0 mr-1">
                Pintas:
              </span>
              {SELLER_QUICK_QUESTIONS.map((q, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleQuickQuestionClick(q)}
                  className="px-3 py-1 rounded-full bg-white border border-stone-200 hover:border-[#16382C] text-stone-700 hover:text-[#16382C] text-[11px] whitespace-nowrap transition-colors shadow-2xs shrink-0 cursor-pointer"
                >
                  {q}
                </button>
              ))}
            </div>

            {/* Input Bar */}
            <form
              onSubmit={handleSend}
              className="p-3 bg-white border-t border-stone-200/90 flex items-center gap-2 shrink-0"
            >
              {/* Attachment Button */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-2 text-stone-400 hover:text-stone-700 hover:bg-stone-100 rounded-xl transition-colors cursor-pointer shrink-0"
                title="Lampirkan Foto"
                aria-label="Lampirkan Foto"
              >
                <Paperclip className="w-5 h-5" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />

              {/* Message Input */}
              <div className="flex-1 relative">
                {selectedAttachment && (
                  <div className="absolute -top-9 left-0 right-0 bg-emerald-50 border border-emerald-200 rounded-lg px-2.5 py-1 text-[11px] text-emerald-800 flex items-center justify-between">
                    <span className="truncate">Lampiran: {selectedAttachment}</span>
                    <button
                      type="button"
                      onClick={() => setSelectedAttachment(null)}
                      className="text-stone-400 hover:text-stone-800 ml-2 font-bold cursor-pointer"
                    >
                      ×
                    </button>
                  </div>
                )}
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={`Kirim pesan ke ${activeConv.merchantName}...`}
                  className="w-full px-4 py-2.5 text-xs sm:text-sm bg-[#FAF9F6] border border-stone-300 rounded-2xl focus:outline-none focus:border-[#16382C] focus:bg-white transition-colors"
                />
              </div>

              {/* Send Button */}
              <button
                type="submit"
                disabled={!inputText.trim() && !selectedAttachment}
                className="w-10 h-10 rounded-2xl bg-[#16382C] hover:bg-emerald-900 disabled:opacity-40 disabled:cursor-not-allowed text-white flex items-center justify-center transition-colors shadow-xs cursor-pointer shrink-0"
                aria-label="Kirim Pesan"
              >
                <Send className="w-4 h-4 ml-0.5" />
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-stone-400">
            <Store className="w-12 h-12 text-stone-300 mb-2" />
            <p className="text-sm font-semibold">Pilih toko untuk memulai obrolan.</p>
          </div>
        )}
      </div>
    </div>
  );
};
