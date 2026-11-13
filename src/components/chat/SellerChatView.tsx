import React, { useState, useEffect, useRef } from 'react';
import {
  Send,
  ArrowLeft,
  Store,
  MapPin,
  Clock,
  ShieldCheck,
  Paperclip,
  CheckCheck,
  RotateCcw,
  Sparkles,
  ShoppingBag,
  ExternalLink,
  X,
  Plus,
} from 'lucide-react';
import { ChatMessage } from './types';
import { SisaPiringItem, formatRupiah } from '../../data/sisaPiringCatalog';
import { ResilientImage } from '../ResilientImage';

interface SellerChatViewProps {
  merchantName: string;
  product?: SisaPiringItem | null;
  catalog: SisaPiringItem[];
  onBackToEtalase: () => void;
  onOpenStore?: (merchantName: string) => void;
  onOpenOrder?: (orderCode: string) => void;
  onSelectProduct?: (item: SisaPiringItem) => void;
}

const QUICK_QUESTIONS = [
  'Apakah porsi ini masih hangat & segar?',
  'Bisa diambil jam berapa sekarang?',
  'Apakah kemasan aman untuk dibawa naik motor?',
  'Bisa tolong pisahkan sambal / bumbu pelengkap?',
  'Apakah ada porsi tambahan yang bisa diselamatkan?',
];

export const SellerChatView: React.FC<SellerChatViewProps> = ({
  merchantName,
  product,
  catalog,
  onBackToEtalase,
  onOpenStore,
  onOpenOrder,
  onSelectProduct,
}) => {
  // Find matching catalog items for this merchant to get real metadata
  const storeItems = catalog.filter(
    (c) => c.merchantName.toLowerCase() === merchantName.toLowerCase()
  );
  const primaryItem = product || storeItems[0] || null;
  const merchantDistrict = primaryItem?.district || 'Bandung';
  const merchantAddress = primaryItem?.address || 'Kota Bandung';
  const pickupWindow = primaryItem?.pickupWindow || '17:00 – 21:30 WIB';
  const merchantAvatar = primaryItem?.imageUrl || '';

  // Every time the component mounts, messages are initialized fresh
  const [messages, setMessages] = useState<ChatMessage[]>(() => {
    const greetingText = product
      ? `Halo Kak! Selamat datang di gerai ${merchantName}. Ada yang ingin ditanyakan tentang hidangan sisa piring "${product.title}" atau jadwal pengambilan hari ini?`
      : `Halo Kak! Selamat datang di gerai ${merchantName}. Silakan tanyakan ketersediaan porsi atau detail waktu pengambilan pesanan sisa piring kami ya!`;

    const initialMsg: ChatMessage = {
      id: `init-${Date.now()}`,
      sender: 'seller',
      text: greetingText,
      timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
      status: 'read',
      productCard: product
        ? {
            id: product.id,
            title: product.title,
            merchantName: product.merchantName,
            price: product.rescuePrice,
            originalPrice: product.originalPrice,
            imageUrl: product.imageUrl,
          }
        : undefined,
    };
    return [initialMsg];
  });

  const [inputText, setInputText] = useState('');
  const [selectedAttachment, setSelectedAttachment] = useState<string | null>(null);
  const [isSellerTyping, setIsSellerTyping] = useState(false);
  const [showProductBanner, setShowProductBanner] = useState<boolean>(Boolean(product));
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll to bottom whenever messages or typing changes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isSellerTyping]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSend = (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text && !selectedAttachment) return;

    const timestamp = new Date().toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
    });

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text,
      timestamp,
      status: 'sent',
      attachmentName: selectedAttachment || undefined,
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setSelectedAttachment(null);
    setIsSellerTyping(true);

    // Simulate smart seller reply tailored to question
    setTimeout(() => {
      const lower = text.toLowerCase();
      let replyText = `Terima kasih atas pertanyaannya Kak! Porsi sisa piring di gerai ${merchantName} kami siapkan dengan standar higienitas ketat sesuai komitmen platform.`;

      if (lower.includes('hangat') || lower.includes('segar') || lower.includes('basi')) {
        replyText = `Betul Kak, hidangan kami simpan di etalase bersuhu stabil dan baru selesai batch dapur sore ini. Kondisinya masih sangat segar, higienis, dan layak santap 100%!`;
      } else if (
        lower.includes('jam') ||
        lower.includes('kapan') ||
        lower.includes('ambil') ||
        lower.includes('waktu')
      ) {
        replyText = `Jendela pengambilan kami aktif pukul ${pickupWindow}. Kakak bisa langsung datang dan menyebutkan nama atau menunjukkan kode pesanan ke kasir kami ya.`;
      } else if (
        lower.includes('motor') ||
        lower.includes('kemasan') ||
        lower.includes('bawa') ||
        lower.includes('tumpah')
      ) {
        replyText = `Kemasan kami menggunakan kotak food-grade bersegel kuat dan tertutup rapat Kak, dijamin aman dan tidak mudah tumpah untuk dibawa berkendara motor.`;
      } else if (
        lower.includes('sambal') ||
        lower.includes('saus') ||
        lower.includes('bumbu') ||
        lower.includes('pisah')
      ) {
        replyText = `Siap Kak! Sambal, saus, dan bumbu pelengkap kami sediakan di wadah terpisah agar kerenyahan dan kesegaran hidangan tetap terjaga.`;
      } else if (lower.includes('stok') || lower.includes('porsi') || lower.includes('ada')) {
        replyText = `Stok di aplikasi selalu tersinkronisasi langsung dengan dapur kami Kak. Selama masih bisa diklik di etalase, porsinya masih tersedia!`;
      }

      const sellerReply: ChatMessage = {
        id: `reply-${Date.now()}`,
        sender: 'seller',
        text: replyText,
        timestamp: new Date().toLocaleTimeString('id-ID', {
          hour: '2-digit',
          minute: '2-digit',
        }),
        status: 'read',
      };

      setIsSellerTyping(false);
      setMessages((prev) => [...prev, sellerReply]);
    }, 1100);
  };

  const handleResetChat = () => {
    const greetingText = product
      ? `Halo Kak! Selamat datang di gerai ${merchantName}. Ada yang ingin ditanyakan tentang hidangan sisa piring "${product.title}" atau jadwal pengambilan hari ini?`
      : `Halo Kak! Selamat datang di gerai ${merchantName}. Silakan tanyakan ketersediaan porsi atau detail waktu pengambilan pesanan sisa piring kami ya!`;

    setMessages([
      {
        id: `init-${Date.now()}`,
        sender: 'seller',
        text: greetingText,
        timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
        status: 'read',
        productCard: product
          ? {
              id: product.id,
              title: product.title,
              merchantName: product.merchantName,
              price: product.rescuePrice,
              originalPrice: product.originalPrice,
              imageUrl: product.imageUrl,
            }
          : undefined,
      },
    ]);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedAttachment(file.name);
    }
  };

  return (
    <div className="w-full h-full flex flex-col bg-stone-50 overflow-hidden font-sans select-none">
      {/* 1. TOP HEADER (Sticky, Focused 1-on-1 Seller Bar) */}
      <header className="sticky top-0 z-30 h-16 sm:h-18 bg-white border-b border-stone-200/90 px-3 sm:px-6 flex items-center justify-between gap-3 shrink-0 shadow-xs">
        {/* Left: Back button + Store Avatar + Info */}
        <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
          <button
            type="button"
            onClick={onBackToEtalase}
            className="flex items-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-xl text-stone-700 hover:text-stone-900 hover:bg-stone-100 transition-colors cursor-pointer shrink-0"
            title="Tutup Chat & Kembali ke Etalase"
            aria-label="Kembali ke Etalase"
          >
            <ArrowLeft className="w-5 h-5 text-stone-800" />
            <span className="hidden sm:inline text-xs font-bold">Kembali</span>
          </button>

          <div className="h-6 w-px bg-stone-200 hidden sm:block" />

          {/* Store Avatar */}
          <div className="relative shrink-0">
            {merchantAvatar ? (
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full overflow-hidden border border-stone-200 bg-stone-100">
                <ResilientImage
                  src={merchantAvatar}
                  alt={merchantName}
                  fallbackTitle={merchantName}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-[#1F281A] text-white flex items-center justify-center font-bold text-sm">
                {merchantName.slice(0, 2).toUpperCase()}
              </div>
            )}
            <span className="absolute bottom-0 right-0 w-3 h-3 rounded-full bg-emerald-500 ring-2 ring-white" />
          </div>

          {/* Store Name, District, Online Status */}
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <h1 className="text-sm sm:text-base font-extrabold text-stone-900 truncate tracking-tight">
                {merchantName}
              </h1>
              <span
                className="hidden md:inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded-md bg-[#F4F6EC] text-[#3f4d13] border border-[#8da249]/30 text-[10px] font-bold shrink-0"
                title="Mitra Resmi Terverifikasi SisaPiring"
              >
                <ShieldCheck className="w-3 h-3 text-[#8da249]" />
                <span>Terverifikasi</span>
              </span>
            </div>
            <div className="flex items-center gap-2 text-[11px] text-stone-500 mt-0.5 truncate">
              <span className="flex items-center gap-1 font-medium text-emerald-700">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Online
              </span>
              <span>•</span>
              <span className="truncate flex items-center gap-1">
                <Clock className="w-3 h-3 text-stone-400 shrink-0" />
                Ambil {pickupWindow}
              </span>
              <span className="hidden lg:inline">•</span>
              <span className="hidden lg:inline truncate text-stone-400">
                {merchantDistrict}
              </span>
            </div>
          </div>
        </div>

        {/* Right Action: Open Store Catalog or Reset Chat */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <button
            type="button"
            onClick={handleResetChat}
            className="p-2 sm:px-3 sm:py-1.5 rounded-xl text-stone-500 hover:text-stone-800 hover:bg-stone-100 border border-stone-200/70 transition-colors text-xs font-semibold inline-flex items-center gap-1.5 cursor-pointer"
            title="Mulai Ulang Percakapan"
          >
            <RotateCcw className="w-4 h-4 text-stone-500" />
            <span className="hidden md:inline">Mulai Ulang</span>
          </button>

          {onOpenStore && (
            <button
              type="button"
              onClick={() => onOpenStore(merchantName)}
              className="px-3 sm:px-3.5 py-2 rounded-xl bg-[#1F281A] hover:bg-[#2D3A26] text-white text-xs font-bold inline-flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            >
              <Store className="w-3.5 h-3.5 text-[#8da249]" />
              <span className="hidden sm:inline">Katalog Toko</span>
            </button>
          )}
        </div>
      </header>

      {/* 2. OPTIONAL PINNED PRODUCT CONTEXT BANNER */}
      {primaryItem && showProductBanner && (
        <div className="bg-white border-b border-stone-200/90 px-3 sm:px-6 py-2.5 flex items-center justify-between gap-3 shadow-2xs z-20">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-11 h-11 rounded-xl overflow-hidden bg-stone-100 border border-stone-200 shrink-0">
              <ResilientImage
                src={primaryItem.imageUrl}
                alt={primaryItem.title}
                fallbackTitle={primaryItem.title}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#4a5a18] bg-[#F4F6EC] px-2 py-0.2 rounded border border-[#8da249]/30">
                  Konteks Produk
                </span>
                <span className="text-[11px] text-stone-500 hidden sm:inline">
                  Tersisa {primaryItem.remainingStock} paket
                </span>
              </div>
              <h4 className="text-xs sm:text-sm font-bold text-stone-900 truncate mt-0.5">
                {primaryItem.title}
              </h4>
              <div className="flex items-center gap-2 text-xs font-mono-tabular">
                <strong className="text-emerald-900 font-bold">
                  {formatRupiah(primaryItem.rescuePrice)}
                </strong>
                <span className="text-stone-400 line-through text-[11px]">
                  {formatRupiah(primaryItem.originalPrice)}
                </span>
                <span className="text-[10px] font-bold text-[#8da249]">
                  Hemat {primaryItem.discountPercent}%
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {onSelectProduct && (
              <button
                type="button"
                onClick={() => onSelectProduct(primaryItem)}
                className="hidden sm:inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-stone-100 hover:bg-stone-200 text-stone-800 transition-colors cursor-pointer"
              >
                <span>Lihat Detail</span>
              </button>
            )}
            <button
              type="button"
              onClick={() => setShowProductBanner(false)}
              className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 hover:bg-stone-100 cursor-pointer"
              title="Tutup ringkasan produk"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* 3. CHAT THREAD MESSAGES AREA */}
      <div className="flex-1 overflow-y-auto px-3 sm:px-6 py-4 space-y-4">
        {/* Date Session Divider */}
        <div className="flex items-center justify-center my-2">
          <span className="px-3 py-1 rounded-full bg-stone-200/80 text-stone-600 text-[11px] font-medium">
            Hari ini · Sesi Chat Langsung
          </span>
        </div>

        {/* Security / Food Safety Reassurance Notice */}
        <div className="max-w-md mx-auto p-3 rounded-2xl bg-[#F4F6EC] border border-[#8da249]/30 text-center text-xs text-[#3a4914] flex items-center justify-center gap-2">
          <ShieldCheck className="w-4 h-4 text-[#8da249] shrink-0" />
          <span>
            Percakapan dilindungi SOP higienitas & jaminan penjemputan resmi SisaPiring.
          </span>
        </div>

        {/* Messages Stream */}
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';

          return (
            <div
              key={msg.id}
              className={`flex items-end gap-2.5 ${isUser ? 'justify-end' : 'justify-start'}`}
            >
              {!isUser && (
                <div className="w-8 h-8 rounded-full bg-[#1F281A] text-white flex items-center justify-center text-xs font-bold shrink-0 mb-1">
                  {merchantName[0]}
                </div>
              )}

              <div
                className={`max-w-[85%] sm:max-w-md rounded-2xl px-4 py-3 space-y-2 shadow-xs ${
                  isUser
                    ? 'bg-[#1F281A] text-white rounded-br-xs'
                    : 'bg-white text-stone-900 border border-stone-200/90 rounded-bl-xs'
                }`}
              >
                {/* Linked Product Card Snippet (if message has productCard attached) */}
                {msg.productCard && (
                  <div
                    onClick={() => {
                      if (onSelectProduct && primaryItem) onSelectProduct(primaryItem);
                    }}
                    className={`p-2 rounded-xl flex items-center gap-2.5 cursor-pointer transition-colors ${
                      isUser
                        ? 'bg-white/10 hover:bg-white/15 text-white'
                        : 'bg-stone-50 hover:bg-stone-100 text-stone-900 border border-stone-200/70'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-stone-200">
                      <ResilientImage
                        src={msg.productCard.imageUrl}
                        alt={msg.productCard.title}
                        fallbackTitle={msg.productCard.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="text-xs font-bold block truncate">
                        {msg.productCard.title}
                      </span>
                      <span className="text-[11px] font-mono block opacity-90">
                        {formatRupiah(msg.productCard.price)}
                      </span>
                    </div>
                  </div>
                )}

                {/* Message Body */}
                <p className="text-xs sm:text-[13px] leading-relaxed whitespace-pre-wrap">
                  {msg.text}
                </p>

                {/* Optional Attachment */}
                {msg.attachmentName && (
                  <div
                    className={`p-2 rounded-xl flex items-center gap-2 text-xs ${
                      isUser ? 'bg-white/10 text-white' : 'bg-stone-100 text-stone-800'
                    }`}
                  >
                    <Paperclip className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{msg.attachmentName}</span>
                  </div>
                )}

                {/* Meta: Timestamp & Read Status */}
                <div
                  className={`flex items-center justify-end gap-1 text-[10px] ${
                    isUser ? 'text-neutral-400' : 'text-neutral-400'
                  }`}
                >
                  <span>{msg.timestamp}</span>
                  {isUser && <CheckCheck className="w-3.5 h-3.5 text-[#8da249]" />}
                </div>
              </div>
            </div>
          );
        })}

        {/* Typing indicator */}
        {isSellerTyping && (
          <div className="flex items-center gap-2 text-xs text-stone-500 animate-pulse pl-10">
            <span className="w-2 h-2 rounded-full bg-[#8da249]" />
            <span>{merchantName} sedang mengetik balasan...</span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* 4. QUICK SUGGESTIONS CHIPS (Single-click to send) */}
      <div className="bg-white/95 border-t border-stone-200/80 px-3 sm:px-6 py-2 overflow-x-auto shrink-0 flex items-center gap-2 no-scrollbar">
        <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 shrink-0">
          Tanya Cepat:
        </span>
        {QUICK_QUESTIONS.map((q, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => handleSend(q)}
            className="px-3 py-1.5 rounded-full bg-stone-100 hover:bg-[#F4F6EC] hover:text-[#3f4d13] text-stone-700 text-xs font-semibold whitespace-nowrap border border-stone-200/80 transition-colors shrink-0 cursor-pointer"
          >
            {q}
          </button>
        ))}
      </div>

      {/* 5. BOTTOM INPUT BAR (Sticky, Form-Ready, No Overlap) */}
      <div className="bg-white border-t border-stone-200/90 p-3 sm:p-4 shrink-0">
        {selectedAttachment && (
          <div className="max-w-4xl mx-auto mb-2 px-3 py-1.5 bg-stone-100 rounded-xl text-xs flex items-center justify-between gap-2 border border-stone-200">
            <div className="flex items-center gap-2 min-w-0">
              <Paperclip className="w-3.5 h-3.5 text-stone-500 shrink-0" />
              <span className="truncate text-stone-700 font-medium">{selectedAttachment}</span>
            </div>
            <button
              type="button"
              onClick={() => setSelectedAttachment(null)}
              className="text-stone-400 hover:text-stone-700 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="max-w-4xl mx-auto flex items-center gap-2"
        >
          {/* File input attachment */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileChange}
            className="hidden"
            accept="image/*,.pdf"
          />

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="p-2.5 sm:p-3 rounded-2xl bg-stone-100 hover:bg-stone-200 text-stone-600 hover:text-stone-900 border border-stone-200/80 transition-colors cursor-pointer shrink-0"
            title="Kirim Foto / Berkas"
            aria-label="Kirim Foto / Berkas"
          >
            <Paperclip className="w-4 h-4" />
          </button>

          {/* Text Input */}
          <input
            ref={inputRef}
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder={`Tulis pesan untuk ${merchantName}...`}
            className="flex-1 px-4 py-2.5 sm:py-3 bg-stone-50 border border-stone-300 rounded-2xl text-xs sm:text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#8da249]/40 focus:border-[#8da249]"
          />

          {/* Send Button */}
          <button
            type="submit"
            disabled={!inputText.trim() && !selectedAttachment}
            className="h-10 sm:h-11 px-4 sm:px-5 rounded-2xl bg-[#8da249] hover:bg-[#7b8e3d] disabled:opacity-40 text-white font-bold text-xs inline-flex items-center justify-center gap-1.5 transition-all shadow-sm active:scale-95 cursor-pointer shrink-0"
            aria-label="Kirim Pesan"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">Kirim</span>
          </button>
        </form>
      </div>
    </div>
  );
};
