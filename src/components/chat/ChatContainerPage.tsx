import React, { useState, useEffect } from 'react';
import {
  Store,
  ArrowLeft,
  Users,
  ShieldCheck,
} from 'lucide-react';
import { SellerChatView } from './SellerChatView';
import { SellerConversation, ChatMessage } from './types';
import { INITIAL_SELLER_CONVERSATIONS } from './chatData';
import { SisaPiringItem } from '../../data/sisaPiringCatalog';

interface ChatContainerPageProps {
  initialMerchantName?: string;
  catalog: SisaPiringItem[];
  onBack: () => void;
  onOpenStore?: (merchantName: string) => void;
  onOpenOrder?: (orderCode: string) => void;
  onOpenEtalase?: () => void;
  onSelectProduct?: (item: SisaPiringItem) => void;
}

export const ChatContainerPage: React.FC<ChatContainerPageProps> = ({
  initialMerchantName,
  catalog,
  onBack,
  onOpenStore,
  onOpenOrder,
}) => {
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

  // If initialMerchantName is passed (e.g. from store detail/product modal), select it directly;
  // otherwise null so user sees the seller contact list first!
  const [activeConvId, setActiveConvId] = useState<string | null>(() => {
    if (initialMerchantName) {
      const found = INITIAL_SELLER_CONVERSATIONS.find(
        (c) => c.merchantName.toLowerCase() === initialMerchantName.toLowerCase()
      );
      if (found) return found.id;
    }
    return null; // Start with contact list!
  });

  // When initialMerchantName changes
  useEffect(() => {
    if (initialMerchantName) {
      const found = conversations.find(
        (c) => c.merchantName.toLowerCase() === initialMerchantName.toLowerCase()
      );
      if (found) {
        setActiveConvId(found.id);
      }
    }
  }, [initialMerchantName]);

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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 sm:py-6 space-y-4 animate-in fade-in duration-200">
      {/* Top Banner Navigation (Dedicated to Seller Chat Only) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 sm:p-5 rounded-3xl border border-stone-200/90 shadow-xs">
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
              <Store className="w-5 h-5 text-[#16382C]" />
              <span>Chat Penjual Mitra UMKM</span>
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              Hubungi gerai makanan langsung untuk memastikan porsi sisa piring dan waktu pengambilan
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold text-emerald-950 bg-emerald-50 px-3.5 py-1.5 rounded-2xl border border-emerald-200/80 self-start sm:self-auto">
          <ShieldCheck className="w-4 h-4 text-emerald-700" />
          <span>Mitra Kuliner Terverifikasi Kota Bandung</span>
        </div>
      </div>

      {/* Main Seller Chat View: Contact list first, then thread when clicked */}
      <SellerChatView
        conversations={conversations}
        activeConversationId={activeConvId}
        onSelectConversation={setActiveConvId}
        onSendMessage={handleSendSellerMessage}
        onOpenStore={onOpenStore}
        onOpenOrder={onOpenOrder}
      />
    </div>
  );
};
