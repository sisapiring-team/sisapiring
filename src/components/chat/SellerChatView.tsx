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
  ArrowLeft,
  ShoppingBag,
  MessageSquare,
  Users,
} from 'lucide-react';
import { SellerConversation, ChatMessage } from './types';
import { SELLER_QUICK_QUESTIONS } from './chatData';
import { ResilientImage } from '../ResilientImage';

interface SellerChatViewProps {
  conversations: SellerConversation[];
  activeConversationId?: string | null;
  onSelectConversation: (id: string | null) => void;
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
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'active_order' | 'coblong' | 'bandung_wetan'>('all');
  const [inputText, setInputText] = useState('');
  const [selectedAttachment, setSelectedAttachment] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Active conversation object (null if viewing contact list)
  const activeConv = activeConversationId
    ? conversations.find((c) => c.id === activeConversationId) || null
    : null;

  // Auto scroll to bottom of active chat thread
  useEffect(() => {
    if (activeConv) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [activeConv?.messages]);

  // Filter conversations
  const filteredConversations = conversations.filter((c) => {
    // Search query filter
    const matchesSearch =
      c.merchantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.merchantDistrict.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;

    // Category filter
    if (selectedFilter === 'active_order') return !!c.activeOrderCode;
    if (selectedFilter === 'coblong') return c.merchantDistrict.toLowerCase().includes('coblong');
    if (selectedFilter === 'bandung_wetan') return c.merchantDistrict.toLowerCase().includes('bandung wetan');

    return true;
  });

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

  // ========================================================
  // VIEW A: DAFTAR KONTAK PENJUAL (SELLER CONTACT LIST VIEW)
  // Tampil pertama kali ketika pengguna membuka menu chat penjual
  // ========================================================
  if (!activeConv) {
    return (
      <div className="bg-white rounded-3xl border border-stone-200/90 shadow-xl overflow-hidden font-sans">
        {/* Contact List Header & Search */}
        <div className="p-4 sm:p-6 border-b border-stone-200/80 bg-white space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#16382C]/10 text-[#16382C] flex items-center justify-center font-bold">
                  <Users className="w-4 h-4" />
                </div>
                <h3 className="font-extrabold text-base sm:text-lg text-stone-900 tracking-tight">
                  Daftar Kontak Penjual Mitra UMKM
                </h3>
              </div>
              <p className="text-xs text-stone-500 mt-1">
                Pilih salah satu toko mitra untuk memulai obrolan langsung terkait stok sisa piring dan pengambilan.
              </p>
            </div>

            <span className="self-start sm:self-auto text-xs font-bold px-3 py-1 rounded-full bg-emerald-100 text-[#16382C] border border-emerald-200 shrink-0">
              {conversations.length} Kontak Toko Tersedia
            </span>
          </div>

          {/* Search Bar & Quick Filters */}
          <div className="flex flex-col sm:flex-row gap-2.5">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari nama toko, jalan, atau kecamatan di Bandung..."
                className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-[#FAF9F6] border border-stone-300 rounded-2xl focus:outline-none focus:border-[#16382C] focus:bg-white transition-colors"
              />
            </div>

            {/* Quick District Filter Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none shrink-0">
              <button
                type="button"
                onClick={() => setSelectedFilter('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer shrink-0 ${
                  selectedFilter === 'all'
                    ? 'bg-[#16382C] text-white'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                Semua
              </button>
              <button
                type="button"
                onClick={() => setSelectedFilter('active_order')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer shrink-0 ${
                  selectedFilter === 'active_order'
                    ? 'bg-[#16382C] text-white'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                Ada Pesanan
              </button>
              <button
                type="button"
                onClick={() => setSelectedFilter('coblong')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer shrink-0 ${
                  selectedFilter === 'coblong'
                    ? 'bg-[#16382C] text-white'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                Coblong (Dago)
              </button>
              <button
                type="button"
                onClick={() => setSelectedFilter('bandung_wetan')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer shrink-0 ${
                  selectedFilter === 'bandung_wetan'
                    ? 'bg-[#16382C] text-white'
                    : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                }`}
              >
                Bandung Wetan (Riau)
              </button>
            </div>
          </div>
        </div>

        {/* Contact List Cards Grid */}
        <div className="p-4 sm:p-6 bg-[#FAF9F6]">
          {filteredConversations.length === 0 ? (
            <div className="py-16 text-center text-stone-400 space-y-2">
              <Store className="w-10 h-10 text-stone-300 mx-auto" />
              <p className="text-sm font-semibold">Toko mitra tidak ditemukan.</p>
              <p className="text-xs">Coba gunakan kata kunci pencarian yang lain.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {filteredConversations.map((conv) => (
                <div
                  key={conv.id}
                  onClick={() => onSelectConversation(conv.id)}
                  className="bg-white border border-stone-200/90 hover:border-[#16382C] rounded-2xl p-4 transition-all shadow-xs hover:shadow-md cursor-pointer flex flex-col justify-between gap-3 group"
                >
                  <div className="flex items-start gap-3.5">
                    {/* Store Avatar with Status */}
                    <div className="relative shrink-0">
                      <div className="w-14 h-14 rounded-2xl overflow-hidden bg-stone-200 border border-stone-300/80 shadow-xs group-hover:scale-105 transition-transform">
                        {conv.merchantAvatar ? (
                          <ResilientImage
                            src={conv.merchantAvatar}
                            alt={conv.merchantName}
                            fallbackTitle={conv.merchantName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center font-bold text-[#16382C] text-base">
                            {conv.merchantName.slice(0, 2).toUpperCase()}
                          </div>
                        )}
                      </div>
                      {conv.isOnline && (
                        <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full" />
                      )}
                    </div>

                    {/* Store Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <h4 className="font-bold text-sm text-stone-900 group-hover:text-[#16382C] transition-colors truncate">
                            {conv.merchantName}
                          </h4>
                          {conv.isVerified && (
                            <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
                          )}
                        </div>
                        <span className="text-[10px] text-stone-400 font-mono shrink-0">
                          {conv.lastMessageTime}
                        </span>
                      </div>

                      <div className="flex items-center gap-1 text-[11px] text-stone-500 truncate mb-1.5">
                        <MapPin className="w-3 h-3 text-stone-400 shrink-0" />
                        <span className="truncate">{conv.merchantDistrict}</span>
                      </div>

                      <div className="flex items-center gap-1 text-[10px] text-stone-400 truncate">
                        <Clock className="w-3 h-3 text-amber-600 shrink-0" />
                        <span>Sesi Ambil: {conv.pickupWindow}</span>
                      </div>
                    </div>
                  </div>

                  {/* Last message snippet & Open Chat CTA */}
                  <div className="pt-2.5 border-t border-stone-100 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1.5 min-w-0 flex-1">
                      <MessageSquare className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                      <p className="text-[11px] text-stone-600 truncate">
                        {conv.lastMessage}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {conv.unreadCount > 0 && (
                        <span className="w-5 h-5 rounded-full bg-[#EE4D2D] text-white text-[10px] font-mono font-bold flex items-center justify-center">
                          {conv.unreadCount}
                        </span>
                      )}
                      <span className="px-3 py-1 rounded-xl bg-emerald-50 text-[#16382C] group-hover:bg-[#16382C] group-hover:text-white text-xs font-bold transition-colors">
                        Buka Chat →
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ========================================================
  // VIEW B: RUANG OBROLAN AKTIF DENGAN TOKO YANG DIKLIK
  // ========================================================
  return (
    <div className="flex flex-col h-[calc(100vh-140px)] min-h-[580px] max-h-[820px] bg-white rounded-3xl border border-stone-200/90 shadow-xl overflow-hidden font-sans">
      {/* 1. Thread Header with Back button */}
      <div className="px-4 sm:px-5 py-3.5 border-b border-stone-200/80 bg-white flex items-center justify-between gap-3 shadow-2xs shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          {/* Back button to return to Contact List */}
          <button
            type="button"
            onClick={() => onSelectConversation(null)}
            className="p-2 -ml-1 text-stone-600 hover:text-stone-900 rounded-xl hover:bg-stone-100 transition-colors flex items-center gap-1.5 text-xs font-bold cursor-pointer shrink-0"
            title="Kembali ke Daftar Kontak Penjual"
            aria-label="Kembali ke Daftar Kontak"
          >
            <ArrowLeft className="w-5 h-5 text-stone-700" />
            <span className="hidden sm:inline">Daftar Kontak Penjual</span>
          </button>

          <div className="h-6 w-px bg-stone-200 hidden sm:block" />

          {/* Store Avatar */}
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

          {/* Store Info */}
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

        {/* Action: Open Store Catalog */}
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

      {/* Active Order Banner (if exists) */}
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

      {/* 2. Messages Stream */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3.5 bg-[#FAF9F6]">
        <div className="text-center my-2">
          <span className="px-3.5 py-1 bg-stone-200/80 text-stone-600 text-[10px] font-medium rounded-full">
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
                className={`max-w-[85%] sm:max-w-[70%] rounded-2xl p-3 sm:p-3.5 text-xs sm:text-[13px] leading-relaxed shadow-xs relative ${
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

      {/* 3. Quick Questions Chips Carousel */}
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

      {/* 4. Input Bar */}
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
    </div>
  );
};
