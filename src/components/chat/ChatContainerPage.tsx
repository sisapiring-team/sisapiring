import React from 'react';
import { SellerChatView } from './SellerChatView';
import { SisaPiringItem } from '../../data/sisaPiringCatalog';

interface ChatContainerPageProps {
  initialMerchantName?: string;
  initialProduct?: SisaPiringItem | null;
  catalog: SisaPiringItem[];
  onBack: () => void;
  onOpenStore?: (merchantName: string) => void;
  onOpenOrder?: (orderCode: string) => void;
  onOpenEtalase?: () => void;
  onSelectProduct?: (item: SisaPiringItem) => void;
}

export const ChatContainerPage: React.FC<ChatContainerPageProps> = ({
  initialMerchantName,
  initialProduct,
  catalog,
  onBack,
  onOpenStore,
  onOpenOrder,
  onSelectProduct,
}) => {
  const targetMerchant =
    initialMerchantName ||
    initialProduct?.merchantName ||
    catalog[0]?.merchantName ||
    'Kala Bakehouse & Artisan Cafe';

  return (
    <div className="w-full h-full flex flex-col overflow-hidden bg-white animate-in fade-in duration-150">
      <SellerChatView
        merchantName={targetMerchant}
        product={initialProduct}
        catalog={catalog}
        onBackToEtalase={onBack}
        onOpenStore={onOpenStore}
        onOpenOrder={onOpenOrder}
        onSelectProduct={onSelectProduct}
      />
    </div>
  );
};
