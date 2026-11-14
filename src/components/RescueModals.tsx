import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  Minus,
  MapPin,
  Clock,
  CheckCircle2,
  Trash2,
  ArrowLeft,
  ShoppingBag,
  Lock,
  Store,
  Star,
  MessageSquare,
} from 'lucide-react';
import { SisaPiringItem, formatRupiah } from '../data/sisaPiringCatalog';
import { ResilientImage } from './ResilientImage';
import { UserAccount } from './AuthPage';

export interface CartEntry {
  item: SisaPiringItem;
  quantity: number;
}

export interface OrderRecord {
  orderCode: string;
  createdAt: string;
  name: string;
  phone: string;
  payment: 'qris' | 'cod' | 'transfer' | string;
  paymentDetail?: string;
  totalPaid: number;
  totalSaved: number;
  status: 'siap-diambil' | 'selesai';
  deliveryStage: 'diterima' | 'diambil' | 'perjalanan' | 'sampai';
  userRating?: number;
  hasComplaint?: boolean;
  items: CartEntry[];
}

interface ProductDetailModalProps {
  item: SisaPiringItem | null;
  onClose: () => void;
  onAddToCart: (item: SisaPiringItem, qty: number) => void;
  onOpenStore?: (merchantName: string) => void;
  onChatStore?: (merchantName: string, item?: SisaPiringItem) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  item,
  onClose,
  onAddToCart,
  onOpenStore,
  onChatStore,
}) => {
  const [quantity, setQuantity] = useState<number>(1);

  if (!item) return null;

  const maxQty = Math.max(1, item.remainingStock);
  const safeQty = Math.min(quantity, maxQty);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs sm:p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-product-title"
    >
      <div className="bg-white border-t sm:border border-stone-200 rounded-t-3xl sm:rounded-2xl max-w-3xl w-full max-h-[92vh] flex flex-col overflow-hidden">
        {/* Mobile Drag Handle Affordance */}
        <div className="sm:hidden pt-3 pb-1 flex items-center justify-center shrink-0">
          <div className="w-10 h-1.5 bg-stone-300 rounded-full" />
        </div>

        {/* Scrollable Content Area */}
        <div className="overflow-y-auto flex-1 grid grid-cols-1 md:grid-cols-12">
          {/* Left / Top Visual Column */}
          <div className="md:col-span-5 bg-stone-100 relative h-52 sm:h-64 md:h-auto">
            <ResilientImage
              src={item.imageUrl}
              alt={item.title}
              fallbackTitle={item.title}
              className="w-full h-full object-cover"
            />
            <button
              type="button"
              onClick={onClose}
              className="md:hidden absolute top-3 right-3 min-h-[44px] min-w-[44px] flex items-center justify-center bg-black/55 text-white rounded-full backdrop-blur-xs cursor-pointer"
              aria-label="Tutup detail hidangan"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Right Contiguous Purchase Module */}
          <div className="md:col-span-7 p-5 sm:p-6 md:p-8 flex flex-col justify-between">
            <div>
              <div className="flex items-start justify-between gap-4 mb-2">
                <div className="text-xs text-stone-500">
                  <span>{item.category}</span>
                  <span aria-hidden="true"> · </span>
                  <span>{item.merchantName}</span>
                  <span aria-hidden="true"> · </span>
                  <span>
                    {item.district}, {item.city}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="hidden md:flex min-h-[40px] min-w-[40px] items-center justify-center text-stone-500 hover:text-stone-900 rounded-lg transition-colors cursor-pointer"
                  aria-label="Tutup detail hidangan"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <h2
                id="modal-product-title"
                className="text-lg sm:text-xl md:text-2xl font-semibold text-stone-900 mb-3 leading-snug"
              >
                {item.title}
              </h2>

              {/* Price & Availability Row */}
              <div className="flex flex-wrap items-baseline gap-2.5 pb-4 mb-4 border-b border-stone-200/80">
                <span className="text-2xl font-bold text-emerald-900 font-mono-tabular">
                  {formatRupiah(item.rescuePrice)}
                </span>
                <span className="text-sm text-stone-400 line-through font-mono-tabular">
                  {formatRupiah(item.originalPrice)}
                </span>
                <span className="text-xs text-stone-600 font-mono-tabular">
                  Hemat {item.discountPercent}% · Tersisa {item.remainingStock} paket
                </span>
              </div>

              {/* Store Information Card + Chat Penjual Icon Beside Store Icon */}
              <div className="mb-4 p-3.5 rounded-2xl bg-stone-50 border border-stone-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="flex items-center gap-1.5 shrink-0">
                    <div className="w-10 h-10 rounded-xl bg-emerald-950/10 text-[#1F281A] flex items-center justify-center shrink-0">
                      <Store className="w-4 h-4" />
                    </div>
                    {onChatStore && (
                      <button
                        type="button"
                        onClick={() => {
                          onChatStore(item.merchantName, item);
                          onClose();
                        }}
                        className="w-10 h-10 rounded-xl bg-[#8da249] hover:bg-[#7a8e3d] text-white flex items-center justify-center shrink-0 transition-transform active:scale-95 shadow-xs cursor-pointer group"
                        title={`Chat Penjual (${item.merchantName})`}
                        aria-label="Chat Penjual"
                      >
                        <MessageSquare className="w-4 h-4 transition-transform group-hover:scale-110" />
                      </button>
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <p className="text-xs sm:text-sm font-bold text-stone-900 truncate">
                        {item.merchantName}
                      </p>
                      <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-md bg-amber-50 border border-amber-200 text-[10px] font-bold text-stone-800 shrink-0">
                        <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                        <span>{item.rating}</span>
                      </span>
                    </div>
                    <p className="text-[11px] text-stone-500 truncate">
                      {item.merchantOwner} · {item.district}, {item.city}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {onChatStore && (
                    <button
                      type="button"
                      onClick={() => {
                        onChatStore(item.merchantName, item);
                        onClose();
                      }}
                      className="h-9 px-3 rounded-xl bg-[#8da249] hover:bg-[#7a8e3d] text-white text-xs font-bold inline-flex items-center justify-center gap-0 transition-colors whitespace-nowrap shrink-0 cursor-pointer shadow-xs"
                      title={`Chat langsung dengan penjual ${item.merchantName}`}
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      
                    </button>
                  )}
                  {onOpenStore && (
                    <button
                      type="button"
                      onClick={() => {
                        const targetMerchant = item.merchantName;
                        onClose();
                        onOpenStore(targetMerchant);
                      }}
                      className="h-9 px-3 rounded-xl bg-[#1F281A] hover:bg-emerald-900 text-white text-xs font-semibold inline-flex items-center justify-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      <Store className="w-3.5 h-3.5" />
                      <span>Lihat Toko</span>
                    </button>
                  )}
                </div>
              </div>

              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed mb-4">
                {item.shortDescription}
              </p>

              <div className="space-y-3 mb-4">
                <div>
                  <h3 className="text-xs font-semibold text-stone-900 mb-1.5">
                    Isi Paket Penyelamatan:
                  </h3>
                  <ul className="text-xs text-stone-600 space-y-1">
                    {item.contentsList.map((content, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="text-stone-400 select-none">•</span>
                        <span>{content}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-2.5 border-t border-stone-100">
                  <h3 className="text-xs font-semibold text-stone-900 mb-1">
                    Mengapa Hidangan Ini Dijual Hemat?
                  </h3>
                  <p className="text-xs text-stone-600 leading-relaxed">
                    {item.sisaPiringReason}
                  </p>
                </div>

                <div className="pt-2.5 border-t border-stone-100 flex flex-col gap-1.5 text-xs text-stone-600">
                  <div className="flex items-center gap-2">
                    <Clock className="w-3.5 h-3.5 text-stone-500 shrink-0" />
                    <span>
                      Jam Ambil di Toko: <strong>{item.pickupWindow}</strong>
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-stone-500 shrink-0" />
                    <span>
                      {item.address} ({item.distanceKm} km)
                    </span>
                  </div>
                  <div className="text-stone-500 mt-0.5">
                    {item.dietaryNotes} · {item.storageTip}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Pinned Bottom Action Bar (48px Touch Targets) */}
        <div className="p-4 sm:px-6 border-t border-stone-200 bg-white flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center border border-stone-300 rounded-xl h-12">
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className="min-w-[44px] h-full flex items-center justify-center text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
              aria-label="Kurangi jumlah"
            >
              <Minus className="w-4 h-4" />
            </button>
            <span className="px-3 text-sm font-semibold font-mono-tabular text-stone-900">
              {safeQty}
            </span>
            <button
              type="button"
              onClick={() => setQuantity((q) => Math.min(maxQty, q + 1))}
              className="min-w-[44px] h-full flex items-center justify-center text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
              aria-label="Tambah jumlah"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {onChatStore && (
            <button
              type="button"
              onClick={() => {
                onChatStore(item.merchantName, item);
                onClose();
              }}
              className="h-12 px-3.5 bg-[#8da249]/15 hover:bg-[#8da249]/25 text-[#3a4914] text-xs font-bold rounded-xl inline-flex items-center gap-1.5 transition-colors shrink-0 cursor-pointer border border-[#8da249]/30"
              title={`Chat penjual ${item.merchantName}`}
            >
              <MessageSquare className="w-4 h-4 text-[#4a5a18]" />
              <span className="hidden sm:inline">Chat Penjual</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              onAddToCart(item, safeQty);
              onClose();
            }}
            className="flex-1 h-12 px-5 bg-emerald-900 text-white text-xs sm:text-sm font-semibold rounded-xl hover:bg-emerald-800 active:scale-[0.99] transition-all whitespace-nowrap shrink-0 cursor-pointer"
          >
            Beli Paket · {formatRupiah(item.rescuePrice * safeQty)}
          </button>
        </div>
      </div>
    </div>
  );
};

export { RescueCartFlow as RescueCartPage } from './cart/RescueCartFlow';
export type { RescueCartPageProps } from './cart/RescueCartFlow';
