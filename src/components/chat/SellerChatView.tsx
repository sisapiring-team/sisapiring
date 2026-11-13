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
  onBackToEtalase?: () => void;
}

export const SellerChatView: React.FC<SellerChatViewProps> = ({
  conversations,
  activeConversationId,
  onSelectConversation,
  onSendMessage,
  onOpenStore,
  onOpenOrder,
  onBackToEtalase,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'active_order' | 'coblong' | 'bandung_wetan'>('all');
  const [inputText, setInputText] = useState('');
  const [selectedAttachment, setSelectedAttachment] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Active conversation object (null if viewing contact list on mobile or unselected on desktop)
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
    const matchesSearch =
      c.merchantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.merchantDistrict.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;

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

  return (
    <div className="w-full h-full flex flex-col md:flex-row overflow-hidden bg-white font-sans">
      {/* ======================================================== */}
      {/* COLUMN 1: DAFTAR KONTAK PENJUAL MITRA UMKM               */}
      {/* Visible always on desktop (md:flex), and on mobile when  */}
      {/* no conversation is actively selected (!activeConv)       */}
      {/* ======================================================== */}
      <div
        className={`${
          activeConv ? 'hidden md:flex' : 'flex'
        } flex-col w-full md:w-80 lg:w-96 border-r border-stone-200 h-full shrink-0 bg-white overflow-hidden`}
      >
        {/* Contact List Header */}
        <div className="p-3.5 sm:p-4 border-b border-stone-200 bg-white space-y-3 shrink-0">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              {onBackToEtalase && (
                <button
                  type="button"
                  onClick={onBackToEtalase}
                  className="p-1.5 -ml-1 text-stone-500 hover:text-stone-900 rounded-lg hover:bg-stone-100 transition-colors md:hidden cursor-pointer"
                  title="Kembali ke Etalase"
                  aria-label="Kembali ke Etalase"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
              )}
              <div className="w-8 h-8 rounded-xl bg-[#1F281A]/10 text-[#1F281A] flex items-center justify-center font-bold">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm sm:text-base text-stone-900 tracking-tight">
                  Chat Penjual UMKM
                </h3>
                <p className="text-[11px] text-stone-500">
                  {conversations.length} Toko Mitra Tersedia
                </p>
              </div>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-[#1F281A] border border-emerald-200">
              Online
            </span>
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari toko atau kecamatan..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:border-[#8da249] focus:bg-white transition-colors"
            />
          </div>

          {/* Quick Filters */}
          <div className="flex items-center gap-1 overflow-x-auto pb-0.5 scrollbar-none">
            <button
              type="button"
              onClick={() => setSelectedFilter('all')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors cursor-pointer shrink-0 ${
                selectedFilter === 'all'
                  ? 'bg-[#1F281A] text-white'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              Semua
            </button>
            <button
              type="button"
              onClick={() => setSelectedFilter('active_order')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors cursor-pointer shrink-0 ${
                selectedFilter === 'active_order'
                  ? 'bg-[#1F281A] text-white'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              Ada Pesanan
            </button>
            <button
              type="button"
              onClick={() => setSelectedFilter('coblong')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors cursor-pointer shrink-0 ${
                selectedFilter === 'coblong'
                  ? 'bg-[#1F281A] text-white'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              Coblong
            </button>
            <button
              type="button"
              onClick={() => setSelectedFilter('bandung_wetan')}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition-colors cursor-pointer shrink-0 ${
                selectedFilter === 'bandung_wetan'
                  ? 'bg-[#1F281A] text-white'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              Bd. Wetan
            </button>
          </div>
        </div>

        {/* Contacts List Scrollable */}
        <div className="flex-1 overflow-y-auto divide-y divide-stone-100">
          {/* Mobile Quick Hint Banner */}
          <div className="md:hidden px-3.5 py-2.5 bg-emerald-50/70 border-b border-emerald-100/80 flex items-center justify-between text-[11px] text-stone-700">
            <span className="flex items-center gap-1.5 font-medium truncate">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 animate-pulse" />
              Pilih toko untuk mulai kirim pesan:
            </span>
            <button
              type="button"
              onClick={() => onSelectConversation(conversations[0]?.id)}
              className="text-[11px] font-bold text-[#1F281A] hover:underline cursor-pointer shrink-0 ml-2"
            >
              Buka Chat Pertama →
            </button>
          </div>

          {filteredConversations.length === 0 ? (
            <div className="p-8 text-center text-stone-400 space-y-2">
              <Store className="w-8 h-8 text-stone-300 mx-auto" />
              <p className="text-xs font-semibold">Toko tidak ditemukan.</p>
            </div>
          ) : (
            filteredConversations.map((conv) => {
              const isSelected = activeConv?.id === conv.id;
              return (
                <div
                  key={conv.id}
                  onClick={() => onSelectConversation(conv.id)}
                  className={`p-3.5 flex items-start gap-3 transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-[#8da249]/10 border-l-4 border-l-[#8da249]'
                      : 'hover:bg-stone-50 border-l-4 border-l-transparent'
                  }`}
                >
                  {/* Store Avatar with Online Status */}
                  <div className="relative shrink-0">
                    <div className="w-11 h-11 rounded-xl overflow-hidden bg-stone-200 border border-stone-300/80">
                      {conv.merchantAvatar ? (
                        <ResilientImage
                          src={conv.merchantAvatar}
                          alt={conv.merchantName}
                          fallbackTitle={conv.merchantName}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center font-bold text-[#1F281A] text-sm">
                          {conv.merchantName.slice(0, 2).toUpperCase()}
                        </div>
                      )}
                    </div>
                    {conv.isOnline && (
                      <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 border-2 border-white rounded-full" />
                    )}
                  </div>

                  {/* Store Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1 mb-0.5">
                      <div className="flex items-center gap-1 min-w-0">
                        <h4
                          className={`font-bold text-xs truncate ${
                            isSelected ? 'text-[#1F281A]' : 'text-stone-900'
                          }`}
                        >
                          {conv.merchantName}
                        </h4>
                        {conv.isVerified && (
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                        )}
                      </div>
                      <span className="text-[10px] text-stone-400 font-mono shrink-0">
                        {conv.lastMessageTime}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 text-[11px] text-stone-500 truncate mb-1">
                      <MapPin className="w-3 h-3 text-stone-400 shrink-0" />
                      <span className="truncate">{conv.merchantDistrict}</span>
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <p className="text-[11px] text-stone-600 truncate flex-1">
                        {conv.lastMessage}
                      </p>
                      {conv.unreadCount > 0 && (
                        <span className="w-4 h-4 rounded-full bg-[#f89254] text-white text-[9px] font-mono font-bold flex items-center justify-center shrink-0">
                          {conv.unreadCount}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ======================================================== */}
      {/* COLUMN 2: RUANG OBROLAN AKTIF (ACTIVE CHAT THREAD)       */}
      {/* Visible always on desktop (md:flex), and on mobile when  */}
      {/* an active conversation is selected (activeConv !== null) */}
      {/* ======================================================== */}
      <div
        className={`${
          activeConv ? 'flex' : 'hidden md:flex'
        } flex-1 flex-col h-full overflow-hidden bg-white`}
      >
        {activeConv ? (
          <div className="flex flex-col h-full w-full overflow-hidden">
            {/* 1. Header Obrolan Toko */}
            <div className="px-4 py-3 border-b border-stone-200 bg-white flex items-center justify-between gap-3 shadow-2xs shrink-0">
              <div className="flex items-center gap-3 min-w-0">
                {/* Back button to return to Contact List (visible on mobile) */}
                <button
                  type="button"
                  onClick={() => onSelectConversation(null)}
                  className="p-1.5 -ml-1 text-stone-600 hover:text-stone-900 rounded-xl hover:bg-stone-100 transition-colors flex items-center gap-1 text-xs font-bold cursor-pointer shrink-0"
                  title="Kembali ke Daftar Kontak Penjual"
                  aria-label="Kembali ke Daftar Kontak"
                >
                  <ArrowLeft className="w-5 h-5 text-stone-700" />
                  <span className="hidden sm:inline">Daftar Kontak</span>
                </button>

                <div className="h-6 w-px bg-stone-200" />

                {/* Store Avatar */}
                <div className="w-9 h-9 rounded-xl overflow-hidden bg-stone-200 border border-stone-300/80 shrink-0">
                  {activeConv.merchantAvatar ? (
                    <ResilientImage
                      src={activeConv.merchantAvatar}
                      alt={activeConv.merchantName}
                      fallbackTitle={activeConv.merchantName}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center font-bold text-[#1F281A] text-xs">
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
              <div className="px-4 py-2 bg-amber-50/90 border-b border-amber-200/70 flex items-center justify-between gap-2 shrink-0">
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
            <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-3.5 bg-stone-50/40">
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
                          ? 'bg-[#1F281A] text-white border-2 border-[#1F281A] rounded-br-xs'
                          : 'bg-white text-stone-900 border-2 border-[#8da249]/70 rounded-bl-xs shadow-xs'
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
            <div className="px-4 py-2 bg-white border-t border-stone-200/70 overflow-x-auto flex items-center gap-1.5 shrink-0 scrollbar-none">
              <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider shrink-0 mr-1">
                Pintas:
              </span>
              {SELLER_QUICK_QUESTIONS.map((q, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleQuickQuestionClick(q)}
                  className="px-3 py-1 rounded-full bg-stone-100 hover:bg-stone-200 border border-stone-200 hover:border-[#1F281A] text-stone-700 hover:text-[#1F281A] text-[11px] whitespace-nowrap transition-colors shadow-2xs shrink-0 cursor-pointer"
                >
                  {q}
                </button>
              ))}
            </div>

            {/* 4. Message Input Form */}
            <form
              onSubmit={handleSend}
              className="p-3 sm:p-3.5 bg-white border-t border-stone-200/90 shadow-[0_-2px_10px_rgba(0,0,0,0.04)] sticky bottom-0 z-20 flex items-center gap-2 shrink-0"
            >
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-2 sm:p-2.5 text-stone-500 hover:text-[#1F281A] hover:bg-stone-100 rounded-xl transition-colors cursor-pointer shrink-0"
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

              <div className="flex-1 relative">
                {selectedAttachment && (
                  <div className="absolute -top-9 left-0 right-0 bg-emerald-50 border border-emerald-200 rounded-lg px-2.5 py-1 text-[11px] text-[#1F281A] flex items-center justify-between shadow-xs">
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
                  placeholder={`Ketik pesan ke ${activeConv.merchantName}...`}
                  className="w-full px-4 py-2.5 sm:py-3 text-xs sm:text-sm bg-stone-50 hover:bg-white focus:bg-white border border-stone-300 focus:border-[#8da249] rounded-2xl focus:outline-none transition-colors text-stone-900 placeholder:text-stone-400 shadow-inner"
                />
              </div>

              <button
                type="submit"
                disabled={!inputText.trim() && !selectedAttachment}
                className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-[#1F281A] hover:bg-emerald-900 disabled:opacity-40 disabled:cursor-not-allowed text-white flex items-center justify-center transition-colors shadow-sm cursor-pointer shrink-0"
                aria-label="Kirim Pesan"
              >
                <Send className="w-4 h-4 ml-0.5" />
              </button>
            </form>
          </div>
        ) : (
          /* Empty State when no conversation selected yet (Desktop Placeholder) */
          <div className="h-full w-full flex flex-col items-center justify-center p-8 text-center bg-stone-50/50">
            <div className="w-16 h-16 rounded-3xl bg-[#8da249]/15 text-[#1F281A] flex items-center justify-center mb-4 shadow-xs">
              <MessageSquare className="w-8 h-8 text-[#8da249]" />
            </div>
            <h3 className="text-base sm:text-lg font-extrabold text-stone-900 mb-1">
              Pusat Chat Mitra UMKM
            </h3>
            <p className="text-xs text-stone-500 max-w-sm mb-4 leading-relaxed">
              Pilih salah satu toko mitra di daftar sebelah kiri untuk menanyakan stok sisa piring, konfirmasi pesanan, atau koordinasi waktu ambil langsung.
            </p>
            {conversations.length > 0 && (
              <button
                type="button"
                onClick={() => onSelectConversation(conversations[0]?.id)}
                className="mb-6 px-5 py-2.5 bg-[#1F281A] text-white text-xs font-bold rounded-xl hover:bg-emerald-900 transition-colors shadow-xs cursor-pointer flex items-center gap-2"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Mulai Chat dengan {conversations[0]?.merchantName}</span>
              </button>
            )}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-md w-full text-left">
              <div className="p-3 bg-white border border-stone-200/80 rounded-2xl shadow-2xs">
                <div className="flex items-center gap-2 mb-1">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span className="text-xs font-bold text-stone-900">Garansi Escrow</span>
                </div>
                <p className="text-[11px] text-stone-500">
                  Dana Anda aman di escrow hingga pesanan diterima dengan baik.
                </p>
              </div>
              <div className="p-3 bg-white border border-stone-200/80 rounded-2xl shadow-2xs">
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="w-4 h-4 text-amber-600" />
                  <span className="text-xs font-bold text-stone-900">Respon Cepat</span>
                </div>
                <p className="text-[11px] text-stone-500">
                  Dapur mitra siap merespons pertanyaan ketersediaan porsi sore.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
