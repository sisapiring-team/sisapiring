import React, { useState, useMemo } from 'react';
import {
  ArrowLeft,
  Store,
  MapPin,
  Clock,
  Star,
  ShieldAlert,
  CheckCircle2,
  MessageSquare,
  MessageSquarePlus,
  Plus,
  Minus,
  Upload,
  AlertTriangle,
} from 'lucide-react';
import {
  SisaPiringItem,
  StoreReview,
  ComplaintReport,
  formatRupiah,
} from '../data/sisaPiringCatalog';
import { ResilientImage } from './ResilientImage';
import { CartEntry } from './RescueModals';
import { UserAccount } from './AuthPage';

interface StoreCatalogPageProps {
  merchantName: string;
  allItems: SisaPiringItem[];
  cart: CartEntry[];
  currentUser: UserAccount | null;
  reviews: StoreReview[];
  complaints: ComplaintReport[];
  initialTab?: 'katalog' | 'ulasan';
  onBack: () => void;
  onAddToCart: (item: SisaPiringItem, qty?: number) => void;
  onUpdateCartQty: (id: string, delta: number) => void;
  onOpenDetail: (item: SisaPiringItem) => void;
  onAddReview: (review: Omit<StoreReview, 'id' | 'date'>) => void;
  onAddComplaint: (
    complaint: Omit<ComplaintReport, 'id' | 'ticketCode' | 'createdAt' | 'status'>
  ) => void;
  onChatStore?: (merchantName: string) => void;
}

const REVIEW_TAG_OPTIONS = [
  'Sesuai Deskripsi',
  'Masih Hangat & Segar',
  'Porsi Melimpah',
  'Kemasan Rapi & Higienis',
  'Pelayanan Ramah',
];

const COMPLAINT_CATEGORIES: ComplaintReport['category'][] = [
  'Makanan Tidak Sesuai Deskripsi',
  'Kualitas / Kesegaran Kurang Baik',
  'Porsi Tidak Sesuai Ketentuan',
  'Kendala Saat Pengambilan di Toko',
];

function formatNominal(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export const StoreCatalogPage: React.FC<StoreCatalogPageProps> = ({
  merchantName,
  allItems,
  cart,
  currentUser,
  reviews,
  complaints,
  initialTab = 'katalog',
  onBack,
  onAddToCart,
  onUpdateCartQty,
  onOpenDetail,
  onAddReview,
  onAddComplaint,
  onChatStore,
}) => {
  const [activeTab, setActiveTab] = useState<'katalog' | 'ulasan'>(initialTab);
  const [showReviewForm, setShowReviewForm] = useState<boolean>(false);
  const [showComplaintForm, setShowComplaintForm] = useState<boolean>(false);

  // Review Form States
  const [ratingInput, setRatingInput] = useState<number>(5);
  const [selectedReviewTags, setSelectedReviewTags] = useState<string[]>([
    'Sesuai Deskripsi',
    'Masih Hangat & Segar',
  ]);
  const [reviewComment, setReviewComment] = useState<string>('');
  const [reviewError, setReviewError] = useState<string>('');
  const [reviewSuccess, setReviewSuccess] = useState<boolean>(false);

  // Complaint / Report Form States
  const [complaintCategory, setComplaintCategory] = useState<
    ComplaintReport['category']
  >('Makanan Tidak Sesuai Deskripsi');
  const [complaintDescription, setComplaintDescription] = useState<string>('');
  const [complaintFileName, setComplaintFileName] = useState<string>('');
  const [complaintError, setComplaintError] = useState<string>('');
  const [complaintSuccess, setComplaintSuccess] = useState<boolean>(false);

  const storeItems = useMemo(
    () => allItems.filter((item) => item.merchantName === merchantName),
    [allItems, merchantName]
  );

  const primaryStoreItem = storeItems[0] || allItems[0];

  const storeReviews = useMemo(
    () => reviews.filter((r) => r.merchantName === merchantName),
    [reviews, merchantName]
  );

  const storeComplaints = useMemo(
    () => complaints.filter((c) => c.merchantName === merchantName),
    [complaints, merchantName]
  );

  const averageRating = useMemo(() => {
    if (storeReviews.length === 0) return primaryStoreItem.rating;
    const sum = storeReviews.reduce((acc, r) => acc + r.rating, 0);
    return Number((sum / storeReviews.length).toFixed(1));
  }, [storeReviews, primaryStoreItem.rating]);

  const getCartQuantity = (id: string): number => {
    const found = cart.find((c) => c.item.id === id);
    return found ? found.quantity : 0;
  };

  const toggleReviewTag = (tag: string) => {
    setSelectedReviewTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setReviewError('');

    if (!reviewComment.trim() || reviewComment.trim().length < 5) {
      setReviewError('Mohon tulis ulasan singkat mengenai pengalaman Anda (minimal 5 karakter).');
      return;
    }

    onAddReview({
      merchantName,
      reviewerName: currentUser?.name || 'Warga Bandung',
      rating: ratingInput,
      itemName: primaryStoreItem.title,
      comment: reviewComment.trim(),
      tags: selectedReviewTags,
    });

    setReviewComment('');
    setShowReviewForm(false);
    setReviewSuccess(true);
    window.setTimeout(() => setReviewSuccess(false), 3500);
  };

  const handleComplaintSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setComplaintError('');

    if (!complaintDescription.trim() || complaintDescription.trim().length < 8) {
      setComplaintError(
        'Mohon jelaskan detail kendala atau ketidaksesuaian makanan secara jelas.'
      );
      return;
    }

    onAddComplaint({
      merchantName,
      itemName: primaryStoreItem.title,
      reporterName: currentUser?.name || 'Pembeli SisaPiring',
      category: complaintCategory,
      description: complaintDescription.trim(),
      evidenceFileName: complaintFileName || undefined,
    });

    setComplaintDescription('');
    setComplaintFileName('');
    setShowComplaintForm(false);
    setComplaintSuccess(true);
    window.setTimeout(() => setComplaintSuccess(false), 4000);
  };

  return (
    <div className="min-h-screen bg-white pb-24">
      {/* STORE BANNER & HEADER */}
      <section className="bg-white border-b border-stone-200/90">
        {/* Top Cover Strip */}
        <div className="relative h-36 sm:h-48 w-full overflow-hidden bg-stone-900">
          <ResilientImage
            src={primaryStoreItem.imageUrl}
            alt={merchantName}
            fallbackTitle={merchantName}
            className="w-full h-full object-cover opacity-65"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/45 to-black/25" />

          <div className="absolute top-3.5 left-3.5 sm:top-5 sm:left-6">
            <button
              type="button"
              onClick={onBack}
              className="h-9 sm:h-10 px-3 sm:px-3.5 rounded-xl bg-black/55 hover:bg-black/75 text-white text-xs font-semibold backdrop-blur-xs inline-flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Kembali</span>
            </button>
          </div>
        </div>

        {/* Store Profile Details */}
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 sm:py-6">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-md bg-emerald-950/10 text-[#1F281A] text-[11px] font-semibold inline-flex items-center gap-1">
                  <Store className="w-3 h-3" />
                  <span>Mitra UMKM Terverifikasi</span>
                </span>
                <span className="text-xs text-stone-500">
                  {primaryStoreItem.merchantRole} · Pemilik:{' '}
                  <strong className="text-stone-800">
                    {primaryStoreItem.merchantOwner}
                  </strong>
                </span>
              </div>

              <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-stone-900 font-display tracking-tight">
                {merchantName}
              </h1>

              <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-stone-600 pt-0.5">
                <span className="inline-flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[#1F281A] shrink-0" />
                  <span>{primaryStoreItem.address}</span>
                </span>
                <span className="inline-flex items-center gap-1 text-[#1F281A] font-semibold">
                  <Clock className="w-3.5 h-3.5 shrink-0" />
                  <span>Jam Ambil: {primaryStoreItem.pickupWindow}</span>
                </span>
              </div>
            </div>

            {/* Store Rating, Rescued Stats & Chat Action */}
            <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 shrink-0 self-start">
              <div className="flex items-center gap-3 sm:gap-4 bg-white border border-stone-200/90 rounded-2xl p-3.5 sm:px-5 shrink-0">
                <div className="text-center pr-3 sm:pr-4 border-r border-stone-200">
                  <div className="flex items-center justify-center gap-1 text-base sm:text-lg font-bold text-stone-900 font-mono-tabular">
                    <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    <span>{averageRating}</span>
                  </div>
                  <p className="text-[11px] text-stone-500">
                    {storeReviews.length} Ulasan
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-base sm:text-lg font-bold text-[#1F281A] font-mono-tabular">
                    {primaryStoreItem.rescuedTotalCount}+
                  </p>
                  <p className="text-[11px] text-stone-500">Paket Terselamatkan</p>
                </div>
              </div>

              {onChatStore && (
                <button
                  type="button"
                  onClick={() => onChatStore(merchantName)}
                  className="h-14 px-4 sm:px-5 rounded-2xl bg-[#1F281A] hover:bg-emerald-900 text-white text-xs font-bold inline-flex items-center gap-2.5 transition-all shadow-xs hover:shadow-md cursor-pointer shrink-0"
                  title={`Chat langsung dengan ${merchantName}`}
                >
                  <MessageSquare className="w-4 h-4 text-amber-300" />
                  <div className="text-left">
                    <span className="block leading-tight">Chat Penjual</span>
                    <span className="block text-[10px] text-emerald-200 font-normal">Tanya ketersediaan</span>
                  </div>
                </button>
              )}
            </div>
          </div>

          {/* Navigation Tabs: Katalog Makanan vs Ulasan & Keamanan */}
          <div className="flex items-center justify-between gap-2 mt-5 pt-4 border-t border-stone-200/80">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setActiveTab('katalog')}
                className={`h-10 px-4 rounded-xl text-xs sm:text-sm font-semibold transition-colors cursor-pointer ${
                  activeTab === 'katalog'
                    ? 'bg-[#1F281A] text-white'
                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200/70'
                }`}
              >
                Katalog Toko ({storeItems.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('ulasan')}
                className={`h-10 px-4 rounded-xl text-xs sm:text-sm font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer ${
                  activeTab === 'ulasan'
                    ? 'bg-[#1F281A] text-white'
                    : 'bg-stone-100 text-stone-700 hover:bg-stone-200/70'
                }`}
              >
                <Star className="w-3.5 h-3.5" />
                <span>Ulasan & Keamanan ({storeReviews.length})</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => {
                setActiveTab('ulasan');
                setShowComplaintForm(true);
                setShowReviewForm(false);
              }}
              className="h-10 px-3 sm:px-3.5 rounded-xl border border-red-200 bg-red-50/70 hover:bg-red-100/80 text-red-700 text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer shrink-0"
            >
              <ShieldAlert className="w-3.5 h-3.5 shrink-0" />
              <span className="hidden sm:inline">Ajukan Laporan / Komplain</span>
              <span className="sm:hidden">Lapor / Komplain</span>
            </button>
          </div>
        </div>
      </section>

      {/* MAIN TAB CONTENT */}
      <div className="max-w-5xl mx-auto px-3.5 sm:px-6 pt-5 sm:pt-6">
        {activeTab === 'katalog' ? (
          /* ================= TAB 1: KATALOG MAKANAN TOKO ================= */
          <div className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm sm:text-base font-bold text-stone-900 font-display">
                  Etalase Sisa Piring Hari Ini di {merchantName}
                </h2>
                <span className="text-xs text-stone-500">
                  Klik produk untuk detail lengkap
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2.5 sm:gap-3.5">
                {storeItems.map((item) => {
                  const inCartQty = getCartQuantity(item.id);
                  return (
                    <article
                      key={item.id}
                      onClick={() => onOpenDetail(item)}
                      className="group bg-white border border-stone-200/80 rounded-xl overflow-hidden flex flex-col justify-between shadow-2xs hover:shadow-md transition-shadow cursor-pointer"
                    >
                      <div className="aspect-square w-full bg-stone-100 relative overflow-hidden">
                        <ResilientImage
                          src={item.imageUrl}
                          alt={item.title}
                          fallbackTitle={item.title}
                          className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-[1.03]"
                        />
                        <div className="absolute top-0 right-0 bg-[#fbe1b5] text-[#e57d3d] font-mono-tabular font-bold text-[10px] sm:text-[11px] px-1.5 py-0.5 rounded-bl-md">
                          -{item.discountPercent}%
                        </div>
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent px-2 pt-4 pb-1.5 flex items-center justify-between text-[10px] text-white">
                          <span className="font-semibold bg-[#1F281A]/90 px-1.5 py-0.5 rounded-xs">
                            Sisa {item.remainingStock}
                          </span>
                          <span className="truncate ml-1">
                            {item.pickupWindow.replace(' WIB', '')}
                          </span>
                        </div>
                      </div>

                      <div className="p-2.5 sm:p-3 flex-1 flex flex-col justify-between space-y-2">
                        <h3 className="text-xs sm:text-[13px] text-stone-800 font-medium leading-snug line-clamp-2">
                          {item.title}
                        </h3>

                        <div className="pt-1 flex items-center justify-between gap-1.5">
                          <div className="min-w-0">
                            <div className="text-[#1F281A] font-bold font-mono-tabular leading-none truncate">
                              <span className="text-[11px] font-normal mr-0.5">
                                Rp
                              </span>
                              <span className="text-sm sm:text-base">
                                {formatNominal(item.rescuePrice)}
                              </span>
                            </div>
                            <div className="text-[10px] text-stone-400 line-through font-mono-tabular mt-0.5">
                              Rp{formatNominal(item.originalPrice)}
                            </div>
                          </div>

                          <div
                            onClick={(e) => e.stopPropagation()}
                            className="shrink-0"
                          >
                            {inCartQty > 0 ? (
                              <div className="flex items-center border border-[#1F281A] bg-emerald-950/5 rounded-md h-6">
                                <button
                                  type="button"
                                  onClick={() => onUpdateCartQty(item.id, -1)}
                                  className="w-5 h-full flex items-center justify-center text-[#1F281A] cursor-pointer"
                                  aria-label="Kurangi"
                                >
                                  <Minus className="w-2.5 h-2.5" />
                                </button>
                                <span className="px-1 text-[10px] font-bold font-mono-tabular text-[#1F281A]">
                                  {inCartQty}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => onUpdateCartQty(item.id, 1)}
                                  disabled={inCartQty >= item.remainingStock}
                                  className="w-5 h-full flex items-center justify-center text-[#1F281A] disabled:opacity-40 cursor-pointer"
                                  aria-label="Tambah"
                                >
                                  <Plus className="w-2.5 h-2.5" />
                                </button>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => onAddToCart(item, 1)}
                                className="h-6 px-2 bg-[#1F281A] hover:bg-emerald-900 text-white text-[10px] font-semibold rounded-md flex items-center gap-0.5 transition-colors cursor-pointer"
                              >
                                <Plus className="w-2.5 h-2.5" />
                                <span>Beli</span>
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>

            {/* Store Quality & Hygiene Commitment Box */}
            <div className="bg-white border border-stone-200/90 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <h3 className="text-xs sm:text-sm font-bold text-stone-900">
                  Jaminan Kualitas & Keamanan Pangan {merchantName}
                </h3>
                <p className="text-xs text-stone-600 leading-relaxed">
                  {primaryStoreItem.sisaPiringReason} ({primaryStoreItem.dietaryNotes})
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveTab('ulasan')}
                className="h-10 px-4 rounded-xl border border-[#1F281A] text-[#1F281A] hover:bg-emerald-950/5 text-xs font-semibold whitespace-nowrap shrink-0 cursor-pointer"
              >
                Lihat {storeReviews.length} Ulasan Pembeli
              </button>
            </div>
          </div>
        ) : (
          /* ================= TAB 2: ULASAN & KEAMANAN (REPORT & COMPLAINT) ================= */
          <div className="space-y-5">
            {/* Top Rating Summary + Action Buttons */}
            <div className="bg-white border border-stone-200/90 rounded-2xl p-4 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-[#1F281A] text-white flex flex-col items-center justify-center shrink-0">
                  <span className="text-xl sm:text-2xl font-bold font-mono-tabular">
                    {averageRating}
                  </span>
                  <span className="text-[10px] text-emerald-200">dari 5.0</span>
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-4 h-4 ${
                          star <= Math.round(averageRating)
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-stone-300'
                        }`}
                      />
                    ))}
                    <span className="text-xs font-semibold text-stone-700 ml-1">
                      ({storeReviews.length} Ulasan Terverifikasi)
                    </span>
                  </div>
                  <p className="text-xs text-stone-600">
                    98% pembeli menyatakan paket makanan dari{' '}
                    <strong>{merchantName}</strong> sesuai deskripsi & layak santap.
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    setShowReviewForm((prev) => !prev);
                    setShowComplaintForm(false);
                  }}
                  className="h-10 px-4 rounded-xl bg-[#1F281A] hover:bg-emerald-900 text-white text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <MessageSquarePlus className="w-4 h-4" />
                  <span>Beri Rating & Ulasan</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowComplaintForm((prev) => !prev);
                    setShowReviewForm(false);
                  }}
                  className="h-10 px-4 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 text-red-700 text-xs font-semibold inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <ShieldAlert className="w-4 h-4" />
                  <span>Laporkan Kendala / Komplain</span>
                </button>
              </div>
            </div>

            {/* Feedback Banner after Submitting Review or Complaint */}
            {reviewSuccess && (
              <div className="p-4 rounded-2xl bg-emerald-950/10 border border-[#1F281A]/30 text-[#1F281A] text-xs sm:text-sm font-medium flex items-center gap-2.5">
                <CheckCircle2 className="w-5 h-5 shrink-0" />
                <span>
                  Terima kasih! Rating dan ulasan Anda telah ditambahkan ke halaman toko{' '}
                  <strong>{merchantName}</strong>.
                </span>
              </div>
            )}

            {complaintSuccess && (
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-300 text-amber-950 text-xs sm:text-sm font-medium flex items-center gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-amber-700 shrink-0" />
                <span>
                  Laporan / komplain Anda terhadap <strong>{merchantName}</strong> telah diterima oleh Tim Keamanan Pangan SisaPiring dan sedang ditinjau untuk pengembalian dana / teguran mitra.
                </span>
              </div>
            )}

            {/* Interactive Write Review Form */}
            {showReviewForm && (
              <form
                onSubmit={handleReviewSubmit}
                className="bg-white border border-stone-200 rounded-2xl p-4 sm:p-6 space-y-4 shadow-xs"
              >
                <div className="flex items-center justify-between pb-2 border-b border-stone-100">
                  <h3 className="text-sm sm:text-base font-bold text-stone-900 font-display">
                    Beri Rating & Ulasan untuk {merchantName}
                  </h3>
                  <button
                    type="button"
                    onClick={() => setShowReviewForm(false)}
                    className="text-xs text-stone-500 hover:text-stone-800 cursor-pointer"
                  >
                    Tutup
                  </button>
                </div>

                <div>
                  <span className="block text-xs font-medium text-stone-700 mb-1.5">
                    Pilih Rating Bintang
                  </span>
                  <div className="flex items-center gap-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setRatingInput(star)}
                        className="p-1.5 rounded-lg hover:bg-stone-100 transition-colors cursor-pointer"
                        aria-label={`Beri ${star} bintang`}
                      >
                        <Star
                          className={`w-6 h-6 ${
                            star <= ratingInput
                              ? 'fill-amber-400 text-amber-400'
                              : 'text-stone-300'
                          }`}
                        />
                      </button>
                    ))}
                    <span className="text-xs font-bold text-stone-800 ml-1">
                      {ratingInput} / 5 Bintang
                    </span>
                  </div>
                </div>

                <div>
                  <span className="block text-xs font-medium text-stone-700 mb-1.5">
                    Tag Kualitas Makanan (Pilih yang sesuai)
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {REVIEW_TAG_OPTIONS.map((tag) => {
                      const active = selectedReviewTags.includes(tag);
                      return (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => toggleReviewTag(tag)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                            active
                              ? 'bg-[#1F281A] text-white border-[#1F281A]'
                              : 'bg-white text-stone-700 border-stone-300 hover:border-stone-400'
                          }`}
                        >
                          {tag}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="store-review-comment"
                    className="block text-xs font-medium text-stone-700 mb-1"
                  >
                    Ulasan Anda
                  </label>
                  <textarea
                    id="store-review-comment"
                    rows={3}
                    value={reviewComment}
                    onChange={(e) => setReviewComment(e.target.value)}
                    placeholder="Ceritakan kesegaran makanan, kesesuaian deskripsi, dan keramahan pelayanan UMKM..."
                    className="w-full p-3 text-xs sm:text-sm bg-white border border-stone-300 rounded-xl focus:outline-none focus:border-emerald-900 focus:bg-white"
                  />
                </div>

                {reviewError && (
                  <p className="text-xs text-red-700 font-medium">{reviewError}</p>
                )}

                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowReviewForm(false)}
                    className="h-10 px-4 rounded-xl border border-stone-300 text-xs font-semibold text-stone-700 cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="h-10 px-5 rounded-xl bg-[#1F281A] hover:bg-emerald-900 text-white text-xs font-semibold cursor-pointer"
                  >
                    Kirim Ulasan
                  </button>
                </div>
              </form>
            )}

            {/* Interactive Report & Complaint Form */}
            {showComplaintForm && (
              <form
                onSubmit={handleComplaintSubmit}
                className="bg-white border border-red-200 rounded-2xl p-4 sm:p-6 space-y-4 shadow-xs"
              >
                <div className="flex items-start justify-between gap-2 pb-2.5 border-b border-red-100">
                  <div className="flex items-center gap-2 text-red-700">
                    <AlertTriangle className="w-5 h-5 shrink-0" />
                    <div>
                      <h3 className="text-sm sm:text-base font-bold font-display">
                        Formulir Laporan & Komplain Keamanan Pangan
                      </h3>
                      <p className="text-[11px] text-stone-500">
                        Laporkan jika makanan tidak sesuai deskripsi, kualitas kurang layak, atau ada kendala saat pengambilan di {merchantName}.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowComplaintForm(false)}
                    className="text-xs text-stone-500 hover:text-stone-800 cursor-pointer"
                  >
                    Tutup
                  </button>
                </div>

                <div>
                  <label
                    htmlFor="store-complaint-cat"
                    className="block text-xs font-medium text-stone-700 mb-1"
                  >
                    Kategori Laporan / Kendala
                  </label>
                  <select
                    id="store-complaint-cat"
                    value={complaintCategory}
                    onChange={(e) =>
                      setComplaintCategory(
                        e.target.value as ComplaintReport['category']
                      )
                    }
                    className="w-full h-11 px-3.5 text-xs sm:text-sm bg-white border border-stone-300 rounded-xl focus:outline-none focus:border-red-600 cursor-pointer"
                  >
                    {COMPLAINT_CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="store-complaint-desc"
                    className="block text-xs font-medium text-stone-700 mb-1"
                  >
                    Detail Kronologi / Ketidaksesuaian Makanan
                  </label>
                  <textarea
                    id="store-complaint-desc"
                    rows={3}
                    value={complaintDescription}
                    onChange={(e) => setComplaintDescription(e.target.value)}
                    placeholder="Contoh: Isi paket kurang dari yang tertulis di deskripsi atau kondisi kemasan rusak saat diterima..."
                    className="w-full p-3 text-xs sm:text-sm bg-white border border-stone-300 rounded-xl focus:outline-none focus:border-red-600 focus:bg-white"
                  />
                </div>

                <div>
                  <label
                    htmlFor="store-complaint-file"
                    className="flex items-center justify-between gap-3 border border-dashed border-stone-300 hover:border-red-500 bg-white rounded-xl px-3.5 py-2.5 cursor-pointer transition-colors"
                  >
                    <span className="text-xs text-stone-600 truncate">
                      {complaintFileName
                        ? `Bukti terlampir: ${complaintFileName}`
                        : 'Unggah Foto Bukti Makanan / Kemasan (Opsional)'}
                    </span>
                    <span className="px-2.5 py-1 rounded-lg bg-white border border-stone-300 text-[11px] font-semibold text-stone-700 inline-flex items-center gap-1 shrink-0">
                      <Upload className="w-3.5 h-3.5" />
                      <span>Pilih Foto</span>
                    </span>
                    <input
                      id="store-complaint-file"
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const f = e.target.files?.[0];
                        if (f) setComplaintFileName(f.name);
                      }}
                      className="hidden"
                    />
                  </label>
                </div>

                {complaintError && (
                  <p className="text-xs text-red-700 font-medium">
                    {complaintError}
                  </p>
                )}

                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowComplaintForm(false)}
                    className="h-10 px-4 rounded-xl border border-stone-300 text-xs font-semibold text-stone-700 cursor-pointer"
                  >
                    Batal
                  </button>
                  <button
                    type="submit"
                    className="h-10 px-5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-semibold cursor-pointer"
                  >
                    Kirim Laporan Komplain
                  </button>
                </div>
              </form>
            )}

            {/* Submitted Complaints for this Store (if any) */}
            {storeComplaints.length > 0 && (
              <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-4 sm:p-5 space-y-3">
                <h3 className="text-xs sm:text-sm font-bold text-amber-950 flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-amber-700" />
                  <span>Status Laporan / Komplain Anda di Toko Ini</span>
                </h3>
                <div className="space-y-2.5">
                  {storeComplaints.map((comp) => (
                    <div
                      key={comp.id}
                      className="bg-white border border-amber-200/90 rounded-xl p-3.5 text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-bold text-stone-900 font-mono-tabular">
                          Tiket #{comp.ticketCode} · {comp.category}
                        </span>
                        <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 text-[10px] font-semibold">
                          {comp.status}
                        </span>
                      </div>
                      <p className="text-stone-600 leading-relaxed">
                        “{comp.description}”
                      </p>
                      <p className="text-[11px] text-stone-400">
                        Dilaporkan {comp.createdAt}
                        {comp.evidenceFileName
                          ? ` · Bukti: ${comp.evidenceFileName}`
                          : ''}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* List of Customer Reviews */}
            <div className="space-y-3">
              <h3 className="text-sm sm:text-base font-bold text-stone-900 font-display">
                Ulasan Pembeli ({storeReviews.length})
              </h3>

              {storeReviews.length === 0 ? (
                <div className="bg-white border border-stone-200 rounded-2xl p-8 text-center text-xs text-stone-500">
                  Belum ada ulasan tertulis untuk toko ini. Jadilah yang pertama memberikan ulasan!
                </div>
              ) : (
                storeReviews.map((rev) => (
                  <div
                    key={rev.id}
                    className="bg-white border border-stone-200/90 rounded-2xl p-4 sm:p-5 space-y-2.5 shadow-2xs"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <p className="text-xs sm:text-sm font-bold text-stone-900">
                          {rev.reviewerName}
                        </p>
                        <p className="text-[11px] text-stone-400">
                          {rev.date} · Membeli {rev.itemName}
                        </p>
                      </div>
                      <div className="flex items-center gap-0.5 bg-amber-50 border border-amber-200/80 px-2 py-1 rounded-lg">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            className={`w-3.5 h-3.5 ${
                              s <= rev.rating
                                ? 'fill-amber-400 text-amber-400'
                                : 'text-stone-300'
                            }`}
                          />
                        ))}
                      </div>
                    </div>

                    {rev.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {rev.tags.map((t) => (
                          <span
                            key={t}
                            className="px-2 py-0.5 rounded-md bg-emerald-950/8 text-[#1F281A] text-[10px] font-semibold"
                          >
                            ✓ {t}
                          </span>
                        ))}
                      </div>
                    )}

                    <p className="text-xs sm:text-sm text-stone-700 leading-relaxed">
                      “{rev.comment}”
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
