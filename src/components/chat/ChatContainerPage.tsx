import React, { useState, useEffect } from 'react';
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

  // If initialMerchantName is passed, select it directly; otherwise null so user sees contact list first!
  const [activeConvId, setActiveConvId] = useState<string | null>(() => {
    if (initialMerchantName) {
      const found = INITIAL_SELLER_CONVERSATIONS.find(
        (c) => c.merchantName.toLowerCase() === initialMerchantName.toLowerCase()
      );
      if (found) return found.id;
    }
    return null;
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

    // Simulate realistic seller response after 1.2 seconds
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
    }, 1200);
  };

  return (
    <div className="w-full h-full flex flex-col overflow-hidden bg-white animate-in fade-in duration-150">
      {/* Main Seller Chat View: Contact list on left / thread on right, 100% full screen */}
      <SellerChatView
        conversations={conversations}
        activeConversationId={activeConvId}
        onSelectConversation={setActiveConvId}
        onSendMessage={handleSendSellerMessage}
        onOpenStore={onOpenStore}
        onOpenOrder={onOpenOrder}
        onBackToEtalase={onBack}
      />
    </div>
  );
};
