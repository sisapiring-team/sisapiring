export type ChatSender = 'user' | 'seller' | 'bot';

export interface ChatMessage {
  id: string;
  sender: ChatSender;
  text: string;
  timestamp: string;
  status?: 'sending' | 'sent' | 'read';
  attachmentUrl?: string;
  attachmentName?: string;
  /** Quick interactive actions attached to bot or seller replies */
  actionChips?: {
    label: string;
    action: string;
    payload?: string;
  }[];
  /** Optional linked product or order */
  productCard?: {
    id: string;
    title: string;
    merchantName: string;
    price: number;
    originalPrice: number;
    imageUrl: string;
  };
}

export interface SellerConversation {
  id: string;
  merchantName: string;
  merchantDistrict: string;
  merchantAddress: string;
  merchantAvatar?: string;
  isVerified: boolean;
  pickupWindow: string;
  unreadCount: number;
  lastMessage: string;
  lastMessageTime: string;
  isOnline: boolean;
  activeOrderCode?: string;
  messages: ChatMessage[];
}

export interface BotQuickPrompt {
  id: string;
  title: string;
  subtitle: string;
  icon: string;
  query: string;
}

