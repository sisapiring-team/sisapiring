import React, { useState } from 'react';
import {
  MessageSquare,
  Bot,
  Store,
  ArrowLeft,
  Sparkles,
  ShieldCheck,
} from 'lucide-react';
import { SellerChatView } from './SellerChatView';
import { BotChatView } from './BotChatView';
import { SellerConversation, ChatMessage } from './types';
import { INITIAL_SELLER_CONVERSATIONS } from './chatData';
import { SisaPiringItem } from '../../data/sisaPiringCatalog';

interface ChatContainerPageProps {
  initialMode?: 'seller' | 'bot';
  initialMerchantName?: string;
  catalog: SisaPiringItem[];
  onBack: () => void;
  onOpenStore?: (merchantName: string) => void;
  onOpenOrder?: (orderCode: string) => void;
  onOpenEtalase?: () => void;
  onSelectProduct?: (item: SisaPiringItem) => void;
}

export const ChatContainerPage: React.FC<ChatContainerPageProps> = ({
  initialMode = 'seller',
  initialMerchantName,
  catalog,
  onBack,
  onOpenStore,
  onOpenOrder,
  onOpenEtalase,
  onSelectProduct,
}) => {
  const [chatMode, setChatMode] = useState<'seller' | 'bot'>(initialMode);
  const [conversations, setConversations] = useState<SellerConversation[]>(() => {
    // If opened for a specific merchant not yet in conversation list, add or activate them
    if (initialMerchantName) {
      const exists = INITIAL_SELLER_CONVERSATIONS.find(
        (c) => c.merchantName.toLowerCase() === initialMerchantName.toLowerCase()
      );
      if (!exists) {
        const matchingCatalog = catalog.find(
          (c) => c.merchantName.toLowerCase() === initialMerchantName.toLowerCase()
        );
        const newConv: SellerConversation = {
          id: `conv-${Date.now()}`,
          merchantName: initialMerchantName,
          merchantDistrict: matchingCatalog?.district || 'Bandung',
          merchantAddress: matchingCatalog?.address || 'Bandung',
          merchantAvatar: matchingCatalog?.imageUrl,
          isVerified: true,
          pickupWindow: matchingCatalog?.pickupWindow || '17:00 – 21:30 WIB',
          unreadCount: 0,
          lastMessage: 'Halo Kak, ada yang bisa kami bantu terkait pesanan sisa piring?',
          lastMessageTime: 'Baru saja',
          isOnline: true,
          messages: [
            {
              id: `init-${Date.now()}`,
              sender: 'seller',
              text: `Halo Kak! Selamat datang di gerai ${initialMerchantName}. Silakan tanyakan ketersediaan porsi atau detail waktu pengambilan.`,
              timestamp: 'Baru saja',
              status: 'read',
            },
          ],
        };
        return [newConv, ...INITIAL_SELLER_CONVERSATIONS];
      }
    }
    return INITIAL_SELLER_CONVERSATIONS;
  });

  const [activeConvId, setActiveConvId] = useState<string>(() => {
    if (initialMerchantName) {
      const found = conversations.find(
        (c) => c.merchantName.toLowerCase() === initialMerchantName.toLowerCase()
      );
      if (found) return found.id;
    }
    return conversations[0]?.id || 'conv-kala-bakehouse';
  });

  // Total unread messages across seller conversations
  const totalSellerUnread = conversations.reduce((acc, c) => acc + c.unreadCount, 0);

  // Send message to seller with realistic auto-reply simulation
  const handleSendSellerMessage = (
    conversationId: string,
    text: string,
    attachmentName?: string
  ) => {
    const timestamp = new Date().toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
    });

    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      sender: 'user',
      text,
      timestamp,
      status: 'sent',
      attachmentName,
    };

    setConversations((prev) =>
      prev.map((c) => {
        if (c.id === conversationId) {
          return {
            ...c,
            lastMessage: text,
            lastMessageTime: timestamp,
            messages: [...c.messages, newMsg],
          };
        }
        return c;
      })
    );

    // Simulate realistic seller response after 1.5 seconds
    setTimeout(() => {
      const targetConv = conversations.find((c) => c.id === conversationId);
      const merchantName = targetConv?.merchantName || 'Mitra UMKM';

      let replyText = `Terima kasih infonya Kak! Pesanan Anda di ${merchantName} kami siapkan dengan standar higienis terbaik. Sampai jumpa di gerai!`;

      const lower = text.toLowerCase();
      if (lower.includes('siap') || lower.includes('ambil')) {
        replyText = `Halo Kak! Porsi sisa piring Anda sudah dikemas rapi dalam kemasan ramah lingkungan. Silakan langsung ke bagian kasir/barista saat tiba ya.`;
      } else if (lower.includes('10 menit') || lower.includes('tiba') || lower.includes('jalan')) {
        replyText = `Baik Kak, kami tunggu kedatangannya! Hati-hati di jalan ya Kak.`;
      } else if (lower.includes('sambal') || lower.includes('saus') || lower.includes('pisah')) {
        replyText = `Siap Kak! Sambal dan bumbu pelengkap sudah kami pisahkan di wadah khusus agar tetap segar.`;
      } else if (lower.includes('motor') || lower.includes('kemasan')) {
        replyText = `Tenang Kak, kemasan kami menggunakan box tebal bersegel higienis, sangat aman dibawa berkendara motor.`;
      }

      const replyMsg: ChatMessage = {
        id: `reply-${Date.now()}`,
        sender: 'seller',
        text: replyText,
        timestamp: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
        status: 'read',
      };

      setConversations((prev) =>
        prev.map((c) => {
          if (c.id === conversationId) {
            return {
              ...c,
              lastMessage: replyText,
              lastMessageTime: replyMsg.timestamp,
              messages: [...c.messages, replyMsg],
            };
          }
          return c;
        })
      );
    }, 1500);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6 space-y-4 animate-in fade-in duration-200">
      {/* ======================================================== */}
      {/* 1. TOP HEADER & NAVIGATION BAR */}
      {/* ======================================================== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-3xl border border-stone-200/90 shadow-xs">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="p-2 -ml-1 text-stone-500 hover:text-stone-900 rounded-xl hover:bg-stone-100 transition-colors cursor-pointer"
            title="Kembali ke Halaman Sebelumnya"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h2 className="text-lg sm:text-xl font-extrabold text-stone-900 tracking-tight flex items-center gap-2">
              Pusat Pesan & Bantuan
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              Komunikasi langsung dengan Mitra UMKM dan panduan cerdas Asisten AI
            </p>
          </div>
        </div>

        {/* 2-Option Segmented Tab Switcher (Chat Penjual vs Chat AI Bot) */}
        <div className="flex items-center bg-stone-100/90 p-1.5 rounded-2xl border border-stone-200/80 self-start sm:self-auto">
          {/* Tab 1: Chat Penjual */}
          <button
            type="button"
            onClick={() => setChatMode('seller')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              chatMode === 'seller'
                ? 'bg-white text-[#16382C] shadow-sm'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Store className="w-4 h-4 text-emerald-800" />
            <span>Chat Penjual</span>
            {totalSellerUnread > 0 && (
              <span className="w-4 h-4 rounded-full bg-[#EE4D2D] text-white text-[9px] font-mono font-bold flex items-center justify-center">
                {totalSellerUnread}
              </span>
            )}
          </button>

          {/* Tab 2: Chat AI Bot */}
          <button
            type="button"
            onClick={() => setChatMode('bot')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              chatMode === 'bot'
                ? 'bg-[#16382C] text-white shadow-sm'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>Chat dengan Bot</span>
            <span className="px-1.5 py-0.2 rounded-full text-[9px] font-bold bg-amber-400/20 text-amber-300 border border-amber-400/30">
              AI 24/7
            </span>
          </button>
        </div>
      </div>

      {/* ======================================================== */}
      {/* 2. CHAT VIEW CONTENT (SWITCHABLE) */}
      {/* ======================================================== */}
      {chatMode === 'seller' ? (
        <SellerChatView
          conversations={conversations}
          activeConversationId={activeConvId}
          onSelectConversation={setActiveConvId}
          onSendMessage={handleSendSellerMessage}
          onOpenStore={onOpenStore}
          onOpenOrder={onOpenOrder}
        />
      ) : (
        <BotChatView
          catalog={catalog}
          onOpenEtalase={onOpenEtalase}
          onOpenOrders={() => onOpenOrder && onOpenOrder('list')}
          onOpenSellerChat={(merchantName) => {
            if (merchantName) {
              const target = conversations.find(
                (c) => c.merchantName.toLowerCase() === merchantName.toLowerCase()
              );
              if (target) setActiveConvId(target.id);
            }
            setChatMode('seller');
          }}
          onSelectProduct={onSelectProduct}
        />
      )}
    </div>
  );
};
