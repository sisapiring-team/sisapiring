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
  payment: 'qris' | 'cod';
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
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  item,
  onClose,
  onAddToCart,
  onOpenStore,
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

              {/* Store Information Card + Button to View Store Catalog & Reviews */}
              <div className="mb-4 p-3.5 rounded-xl bg-[#FAF9F6] border border-stone-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-2.5 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-emerald-950/10 text-[#16382C] flex items-center justify-center shrink-0 mt-0.5">
                    <Store className="w-4 h-4" />
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

                {onOpenStore && (
                  <button
                    type="button"
                    onClick={() => {
                      const targetMerchant = item.merchantName;
                      onClose();
                      onOpenStore(targetMerchant);
                    }}
                    className="h-9 px-3.5 rounded-lg bg-[#16382C] hover:bg-emerald-900 text-white text-xs font-semibold inline-flex items-center justify-center gap-1.5 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    <Store className="w-3.5 h-3.5" />
                    <span>Lihat Katalog Toko</span>
                  </button>
                )}
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

interface RescueCartPageProps {
  cart: CartEntry[];
  currentUser: UserAccount | null;
  onUpdateQty: (id: string, delta: number) => void;
  onRemove: (id: string) => void;
  onClearCart: () => void;
  onBackToEtalase: () => void;
  onNavigateToAuth: () => void;
  onOrderCreated?: (order: OrderRecord) => void;
  onGoToPesanan?: () => void;
}

export const RescueCartPage: React.FC<RescueCartPageProps> = ({
  cart,
  currentUser,
  onUpdateQty,
  onRemove,
  onClearCart,
  onBackToEtalase,
  onNavigateToAuth,
  onOrderCreated,
  onGoToPesanan,
}) => {
  const [customerName, setCustomerName] = useState(currentUser?.name || '');
  const [customerPhone, setCustomerPhone] = useState(currentUser?.phone || '');
  const [paymentMethod, setPaymentMethod] = useState<'qris' | 'cod'>('qris');
  const [formError, setFormError] = useState('');
  const [confirmedOrder, setConfirmedOrder] = useState<OrderRecord | null>(null);

  useEffect(() => {
    if (currentUser) {
      setCustomerName((prev) => prev || currentUser.name);
      setCustomerPhone((prev) => prev || currentUser.phone);
    }
  }, [currentUser]);

  const totalRescuePrice = cart.reduce(
    (sum, entry) => sum + entry.item.rescuePrice * entry.quantity,
    0
  );
  const totalOriginalPrice = cart.reduce(
    (sum, entry) => sum + entry.item.originalPrice * entry.quantity,
    0
  );
  const totalSavings = totalOriginalPrice - totalRescuePrice;

  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || customerName.trim().length < 2) {
      setFormError('Mohon isi nama lengkap pengambil paket.');
      return;
    }
    const cleanPhone = customerPhone.replace(/\D/g, '');
    if (cleanPhone.length < 9) {
      setFormError(
        'Mohon masukkan nomor WhatsApp aktif (minimal 9 digit) untuk kode ambil.'
      );
      return;
    }

    setFormError('');
    const randomCode = `SP-${Math.floor(1000 + Math.random() * 9000)}`;
    const newOrder: OrderRecord = {
      orderCode: randomCode,
      createdAt: 'Hari ini · Baru saja',
      name: customerName.trim(),
      phone: customerPhone.trim(),
      payment: paymentMethod,
      totalPaid: totalRescuePrice,
      totalSaved: totalSavings,
      status: 'siap-diambil',
      deliveryStage: 'diterima',
      items: [...cart],
    };
    setConfirmedOrder(newOrder);
    if (onOrderCreated) {
      onOrderCreated(newOrder);
    }
    onClearCart();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5] pb-24">
      {/* Page Header Bar */}
      <section className="bg-white border-b border-stone-200/90 py-4 sm:py-5">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => {
                setConfirmedOrder(null);
                onBackToEtalase();
              }}
              aria-label="Kembali ke Etalase"
              className="w-10 h-10 rounded-xl bg-stone-100 hover:bg-stone-200/70 flex items-center justify-center text-stone-800 transition-colors cursor-pointer shrink-0"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-base sm:text-xl font-bold text-stone-900 tracking-tight">
                Kantong Penyelamatan Anda
              </h1>
              <p className="text-xs text-stone-500">
                Ambil langsung di kasir UMKM Bandung sesuai jam sore
              </p>
            </div>
          </div>

          {cart.length > 0 && !confirmedOrder && (
            <button
              type="button"
              onClick={onClearCart}
              className="text-xs font-medium text-stone-500 hover:text-red-700 underline underline-offset-2 cursor-pointer shrink-0"
            >
              Kosongkan
            </button>
          )}
        </div>
      </section>

      {/* Main Page Body */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-5 sm:pt-8">
        {confirmedOrder ? (
          /* CONFIRMED ORDER TICKET VIEW */
          <div className="max-w-xl mx-auto bg-white border border-stone-200 rounded-2xl p-5 sm:p-8 space-y-6 shadow-xs">
            <div className="p-5 bg-emerald-950/5 border border-emerald-900/20 rounded-2xl space-y-3">
              <div className="flex items-center gap-2 text-emerald-900 font-semibold text-base">
                <CheckCircle2 className="w-5 h-5 shrink-0" />
                <span>Pesanan #{confirmedOrder.orderCode} Terkonfirmasi</span>
              </div>
              <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
                Tunjukkan kode tiket ini kepada kasir mitra UMKM saat jam pengambilan. Bukti pesanan disiapkan untuk{' '}
                <strong>{confirmedOrder.name}</strong> ({confirmedOrder.phone}).
              </p>
              <div className="pt-3 border-t border-stone-200/80 flex items-center justify-between text-xs sm:text-sm">
                <span className="text-stone-500">Kode Tiket Pengambilan</span>
                <span className="font-mono-tabular font-bold text-lg text-stone-900">
                  {confirmedOrder.orderCode}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs sm:text-sm">
                <span className="text-stone-500">Metode Pembayaran</span>
                <span className="font-medium text-stone-900">
                  {confirmedOrder.payment === 'qris'
                    ? 'QRIS Instan (Lunas)'
                    : 'Bayar di Kasir UMKM Saat Ambil (COD)'}
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <h2 className="text-xs sm:text-sm font-semibold text-stone-900">
                Rincian Lokasi & Waktu Pengambilan:
              </h2>
              {confirmedOrder.items.map(({ item, quantity }) => (
                <div
                  key={item.id}
                  className="p-4 bg-[#FAF9F6] border border-stone-200 rounded-xl text-xs space-y-1.5"
                >
                  <div className="flex justify-between font-semibold text-stone-900 gap-2 text-sm">
                    <span>
                      {quantity}x {item.title}
                    </span>
                    <span className="font-mono-tabular shrink-0 text-[#EE4D2D]">
                      {formatRupiah(item.rescuePrice * quantity)}
                    </span>
                  </div>
                  <p className="text-stone-600">
                    {item.merchantName} · {item.address}
                  </p>
                  <p className="text-emerald-900 font-medium">
                    Jam Ambil: {item.pickupWindow}
                  </p>
                </div>
              ))}
            </div>

            <div className="p-4 bg-stone-50 border border-stone-200 rounded-xl space-y-2 text-xs sm:text-sm">
              <div className="flex justify-between text-stone-600">
                <span>Total Penghematan Anda</span>
                <span className="font-mono-tabular font-semibold text-emerald-900">
                  {formatRupiah(confirmedOrder.totalSaved)}
                </span>
              </div>
              <div className="flex justify-between text-base font-bold text-stone-900 pt-2 border-t border-stone-200">
                <span>Total Tebus Hidangan</span>
                <span className="font-mono-tabular text-[#EE4D2D]">
                  {formatRupiah(confirmedOrder.totalPaid)}
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2.5">
              {onGoToPesanan && (
                <button
                  type="button"
                  onClick={() => {
                    setConfirmedOrder(null);
                    onGoToPesanan();
                  }}
                  className="flex-1 h-12 px-4 bg-[#EE4D2D] hover:bg-[#D73211] text-white text-xs sm:text-sm font-semibold rounded-xl transition-colors cursor-pointer"
                >
                  Lihat di Menu Pesanan
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  setConfirmedOrder(null);
                  onBackToEtalase();
                }}
                className="flex-1 h-12 px-4 bg-[#16382C] text-white text-xs sm:text-sm font-semibold rounded-xl hover:bg-emerald-900 transition-colors cursor-pointer"
              >
                Kembali ke Menu Utama
              </button>
            </div>
          </div>
        ) : cart.length === 0 ? (
          /* EMPTY CART PAGE STATE */
          <div className="max-w-lg mx-auto bg-white border border-stone-200 rounded-2xl p-10 sm:p-14 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-stone-100 text-stone-500 flex items-center justify-center mx-auto">
              <ShoppingBag className="w-7 h-7" />
            </div>
            <div className="space-y-1.5">
              <h2 className="text-base sm:text-lg font-semibold text-stone-900">
                Kantong penyelamatan Anda masih kosong
              </h2>
              <p className="text-xs sm:text-sm text-stone-500 max-w-xs mx-auto leading-relaxed">
                Pilih paket sisa piring dari toko roti, warung makan, atau kafe UMKM Bandung untuk ditebus dengan harga hemat sore ini.
              </p>
            </div>
            <button
              type="button"
              onClick={onBackToEtalase}
              className="min-h-[44px] px-6 py-2.5 bg-[#16382C] text-white text-xs sm:text-sm font-semibold rounded-xl hover:bg-emerald-900 transition-colors cursor-pointer"
            >
              Jelajahi Etalase Makanan
            </button>
          </div>
        ) : (
          /* ACTIVE CART ITEMS + CHECKOUT FORM GRID */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Left 7 Columns: List of Cart Items */}
            <div className="lg:col-span-7 space-y-3">
              <div className="bg-white border border-stone-200/90 rounded-2xl divide-y divide-stone-200/80 overflow-hidden">
                {cart.map(({ item, quantity }) => (
                  <div key={item.id} className="p-4 sm:p-5 flex gap-3.5 sm:gap-4">
                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden bg-stone-100 shrink-0">
                      <ResilientImage
                        src={item.imageUrl}
                        alt={item.title}
                        fallbackTitle={item.title}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="flex-1 min-w-0 flex flex-col justify-between">
                      <div>
                        <p className="text-[11px] sm:text-xs text-stone-500 truncate">
                          {item.merchantName} · Ambil {item.pickupWindow}
                        </p>
                        <h3 className="text-xs sm:text-sm font-semibold text-stone-900 leading-snug line-clamp-2 mt-0.5">
                          {item.title}
                        </h3>
                        <div className="flex items-baseline gap-2 mt-1.5">
                          <span className="text-sm sm:text-base font-bold text-[#EE4D2D] font-mono-tabular">
                            {formatRupiah(item.rescuePrice * quantity)}
                          </span>
                          <span className="text-[11px] text-stone-400 line-through font-mono-tabular">
                            {formatRupiah(item.originalPrice * quantity)}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between mt-3 pt-2 border-t border-stone-100">
                        <div className="flex items-center border border-stone-200 rounded-lg h-8 sm:h-9 bg-[#FAF9F6]">
                          <button
                            type="button"
                            onClick={() => onUpdateQty(item.id, -1)}
                            className="min-w-[34px] h-full flex items-center justify-center text-stone-700 hover:bg-stone-200/60 cursor-pointer"
                            aria-label="Kurangi jumlah"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="px-2.5 text-xs font-bold font-mono-tabular text-stone-900">
                            {quantity}
                          </span>
                          <button
                            type="button"
                            onClick={() => onUpdateQty(item.id, 1)}
                            disabled={quantity >= item.remainingStock}
                            className="min-w-[34px] h-full flex items-center justify-center text-stone-700 hover:bg-stone-200/60 disabled:opacity-40 cursor-pointer"
                            aria-label="Tambah jumlah"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => onRemove(item.id)}
                          className="min-h-[34px] px-2.5 text-xs text-stone-400 hover:text-red-700 inline-flex items-center gap-1 cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Hapus</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right 5 Columns: Customer Pickup Form & Payment Summary */}
            <div className="lg:col-span-5 relative bg-white border border-stone-200/90 rounded-2xl p-5 sm:p-6 space-y-5 lg:sticky lg:top-20 overflow-hidden">
              {/* "Mohon Login" Overlay Covering the Data Pengambil Card when Not Logged In */}
              {!currentUser && (
                <div className="absolute inset-0 z-10 bg-white/85 backdrop-blur-[3px] flex flex-col items-center justify-center p-6 text-center space-y-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-[#16382C]/10 text-[#16382C] flex items-center justify-center">
                    <Lock className="w-6 h-6" />
                  </div>
                  <div className="space-y-1 max-w-xs">
                    <h3 className="text-base font-bold text-stone-900">
                      Mohon Login Terlebih Dahulu
                    </h3>
                    <p className="text-xs text-stone-600 leading-relaxed">
                      Silakan login atau daftar akun untuk mengisi Data Pengambil Paket dan menerbitkan tiket pengambilan di kasir UMKM.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={onNavigateToAuth}
                    className="min-h-[44px] px-6 py-2.5 bg-[#16382C] hover:bg-emerald-900 text-white text-xs sm:text-sm font-semibold rounded-xl transition-colors cursor-pointer shadow-xs"
                  >
                    Login / Register Sekarang
                  </button>
                </div>
              )}

              <form
                id="rescue-checkout-form"
                onSubmit={handleCheckoutSubmit}
                className={`space-y-4 ${!currentUser ? 'pointer-events-none select-none opacity-45' : ''}`}
              >
                <h2 className="text-sm sm:text-base font-bold text-stone-900 pb-2 border-b border-stone-200">
                  Data Pengambil Paket di Lokasi UMKM
                </h2>

                <div>
                  <label
                    htmlFor="checkout-name"
                    className="block text-xs font-medium text-stone-700 mb-1"
                  >
                    Nama Lengkap Pengambil
                  </label>
                  <input
                    id="checkout-name"
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Contoh: Budi Santoso"
                    className="w-full h-11 px-3.5 text-xs sm:text-sm bg-[#FAF9F6] border border-stone-300 rounded-xl focus:outline-none focus:border-emerald-900 focus:bg-white"
                  />
                </div>

                <div>
                  <label
                    htmlFor="checkout-phone"
                    className="block text-xs font-medium text-stone-700 mb-1"
                  >
                    Nomor WhatsApp (untuk Tiket Pengambilan)
                  </label>
                  <input
                    id="checkout-phone"
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="Contoh: 081234567890"
                    className="w-full h-11 px-3.5 text-xs sm:text-sm bg-[#FAF9F6] border border-stone-300 rounded-xl focus:outline-none focus:border-emerald-900 focus:bg-white font-mono-tabular"
                  />
                </div>

                {currentUser?.defaultAddress && (
                  <div className="p-3 bg-[#FAF9F6] border border-stone-200/80 rounded-xl text-xs space-y-0.5">
                    <span className="font-semibold text-stone-800 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-[#16382C]" />
                      Alamat Default Anda:
                    </span>
                    <p className="text-stone-600 leading-relaxed pl-4">
                      {currentUser.defaultAddress}
                    </p>
                  </div>
                )}

                <div>
                  <span className="block text-xs font-medium text-stone-700 mb-1.5">
                    Pilih Metode Pembayaran
                  </span>
                  <div className="grid grid-cols-2 gap-2.5">
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('qris')}
                      className={`min-h-[52px] px-3 py-2 text-xs font-semibold rounded-xl border text-left transition-colors cursor-pointer ${
                        paymentMethod === 'qris'
                          ? 'border-emerald-900 bg-emerald-950/5 text-emerald-950'
                          : 'border-stone-200 text-stone-600 hover:border-stone-300'
                      }`}
                    >
                      QRIS Instan
                      <span className="block text-[11px] font-normal text-stone-500">
                        Bebas biaya admin
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setPaymentMethod('cod')}
                      className={`min-h-[52px] px-3 py-2 text-xs font-semibold rounded-xl border text-left transition-colors cursor-pointer ${
                        paymentMethod === 'cod'
                          ? 'border-emerald-900 bg-emerald-950/5 text-emerald-950'
                          : 'border-stone-200 text-stone-600 hover:border-stone-300'
                      }`}
                    >
                      Bayar Saat Ambil
                      <span className="block text-[11px] font-normal text-stone-500">
                        Tunai di kasir UMKM
                      </span>
                    </button>
                  </div>
                </div>

                {formError && (
                  <p className="text-xs text-red-700 font-medium">{formError}</p>
                )}

                {/* Order Cost & Savings Breakdown */}
                <div className="pt-4 border-t border-stone-200 space-y-2 text-xs sm:text-sm">
                  <div className="flex justify-between text-stone-500">
                    <span>Total Harga Normal di Toko</span>
                    <span className="line-through font-mono-tabular">
                      {formatRupiah(totalOriginalPrice)}
                    </span>
                  </div>
                  <div className="flex justify-between text-emerald-900 font-medium">
                    <span>Total Penghematan Anda</span>
                    <span className="font-mono-tabular">
                      -{formatRupiah(totalSavings)}
                    </span>
                  </div>
                  <div className="flex justify-between text-base font-bold text-stone-900 pt-2 border-t border-stone-200">
                    <span>Total Bayar</span>
                    <span className="font-mono-tabular text-[#EE4D2D]">
                      {formatRupiah(totalRescuePrice)}
                    </span>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full h-12 px-4 bg-[#EE4D2D] hover:bg-[#D73211] text-white text-xs sm:text-sm font-semibold rounded-xl active:scale-[0.99] transition-all cursor-pointer whitespace-nowrap"
                >
                  Konfirmasi & Terbitkan Tiket Ambil
                </button>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
