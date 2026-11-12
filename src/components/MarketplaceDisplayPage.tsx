import React, { useState, useMemo, useEffect } from 'react';
import {
  Search,
  SlidersHorizontal,
  Store,
  LayoutGrid,
  Plus,
  Minus,
  MapPin,
  Clock,
  RotateCcw,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import {
  SisaPiringItem,
  FoodCategory,
  FoodTag,
  ALL_FOOD_TAGS,
  CULINARY_CATEGORIES,
  formatRupiah,
} from '../data/sisaPiringCatalog';
import { ResilientImage } from './ResilientImage';
import { CartEntry } from './RescueModals';

interface MarketplaceDisplayPageProps {
  items: SisaPiringItem[];
  cart: CartEntry[];
  onAddToCart: (item: SisaPiringItem, qty?: number) => void;
  onUpdateCartQty: (id: string, delta: number) => void;
  onOpenDetail: (item: SisaPiringItem) => void;
  onOpenCart: () => void;
}

const PRICE_OPTIONS = [
  { label: 'Semua Harga', value: 60000 },
  { label: '≤ Rp 25.000', value: 25000 },
  { label: '≤ Rp 30.000', value: 30000 },
  { label: '≤ Rp 35.000', value: 35000 },
  { label: '≤ Rp 45.000', value: 45000 },
];

const PROMO_BANNERS = [
  {
    id: 'banner-1',
    tag: 'Spesial Sore Bandung · Diskon s/d 63%',
    title: 'Selamatkan Kuliner UMKM Segar Mulai Rp 25.000',
    subtitle: 'Jemput langsung di toko roti, kafe & warung sekitar Dago, Braga, dan Buahbatu.',
    imageUrl: '/assets/images/hero_umkm_bakery_1794295650050.jpg',
    ctaLabel: 'Lihat Paket ≤ Rp 30rb',
    actionType: 'price30k' as const,
  },
  {
    id: 'banner-2',
    tag: 'Artisan Bakery & Roti Kampung',
    title: 'Kotak Kejutan Croissant & Sourdough Hemat 60%',
    subtitle: 'Dipanggang segar pagi ini tanpa bahan pengawet, siap dijemput pukul 18.00 WIB.',
    imageUrl: '/assets/images/food_artisan_pastry_box_1794295651168.jpg',
    ctaLabel: 'Pilih Kategori Roti',
    actionType: 'catRoti' as const,
  },
  {
    id: 'banner-3',
    tag: 'Menu Favorit Keluarga Bandung',
    title: 'Martabak Legit, Bakso Urat & Nasi Kapau Sore',
    subtitle: 'Porsi lengkap hangat dengan harga kurang dari separuh harga etalase.',
    imageUrl: '/assets/images/food_nasi_kapau_bowl_1794295653656.jpg',
    ctaLabel: 'Semua Kuliner Hemat',
    actionType: 'all' as const,
  },
];

function formatNominal(amount: number): string {
  return new Intl.NumberFormat('id-ID', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export const MarketplaceDisplayPage: React.FC<MarketplaceDisplayPageProps> = ({
  items,
  cart,
  onAddToCart,
  onUpdateCartQty,
  onOpenDetail,
}) => {
  const [displayLayout, setDisplayLayout] = useState<'rak-menu' | 'per-toko'>('rak-menu');
  const [selectedCategory, setSelectedCategory] = useState<FoodCategory>('Semua');
  const [showAllCategories, setShowAllCategories] = useState<boolean>(false);
  const [selectedTags, setSelectedTags] = useState<FoodTag[]>([]);
  const [maxPrice, setMaxPrice] = useState<number>(60000);
  const [isPriceDropdownOpen, setIsPriceDropdownOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'discount' | 'price-asc' | 'distance' | 'stock'>('discount');
  const [activeBannerIdx, setActiveBannerIdx] = useState<number>(0);

  // Auto-slide banner left/right every 4.5 seconds
  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveBannerIdx((prev) => (prev + 1) % PROMO_BANNERS.length);
    }, 4500);
    return () => window.clearInterval(timer);
  }, []);

  const prevBanner = () => {
    setActiveBannerIdx((prev) =>
      prev === 0 ? PROMO_BANNERS.length - 1 : prev - 1
    );
  };

  const nextBanner = () => {
    setActiveBannerIdx((prev) => (prev + 1) % PROMO_BANNERS.length);
  };

  const handleBannerAction = (actionType: 'price30k' | 'catRoti' | 'all') => {
    if (actionType === 'price30k') {
      setMaxPrice(30000);
      setSelectedCategory('Semua');
    } else if (actionType === 'catRoti') {
      setSelectedCategory('Roti');
      setMaxPrice(60000);
    } else {
      resetAllFilters();
    }
  };

  const visibleCulinaryCategories = useMemo(
    () => (showAllCategories ? CULINARY_CATEGORIES : CULINARY_CATEGORIES.slice(0, 6)),
    [showAllCategories]
  );

  const toggleTag = (tag: FoodTag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    );
  };

  const resetAllFilters = () => {
    setSelectedCategory('Semua');
    setSelectedTags([]);
    setMaxPrice(60000);
    setSearchQuery('');
    setSortBy('discount');
    setIsPriceDropdownOpen(false);
  };

  const hasActiveFilters =
    selectedCategory !== 'Semua' ||
    selectedTags.length > 0 ||
    maxPrice < 60000 ||
    searchQuery.trim() !== '';

  const filteredItems = useMemo(() => {
    return items
      .filter((item) => {
        const matchesCat =
          selectedCategory === 'Semua' || item.category === selectedCategory;
        const matchesPrice = item.rescuePrice <= maxPrice;
        const matchesTags =
          selectedTags.length === 0 ||
          selectedTags.every((t) => item.tags.includes(t));

        const q = searchQuery.trim().toLowerCase();
        const matchesQuery =
          !q ||
          item.title.toLowerCase().includes(q) ||
          item.merchantName.toLowerCase().includes(q) ||
          item.merchantOwner.toLowerCase().includes(q) ||
          item.shortDescription.toLowerCase().includes(q) ||
          item.district.toLowerCase().includes(q) ||
          item.category.toLowerCase().includes(q) ||
          item.tags.some((t) => t.toLowerCase().includes(q));

        return matchesCat && matchesPrice && matchesTags && matchesQuery;
      })
      .sort((a, b) => {
        if (sortBy === 'price-asc') return a.rescuePrice - b.rescuePrice;
        if (sortBy === 'distance') return a.distanceKm - b.distanceKm;
        if (sortBy === 'stock') return b.remainingStock - a.remainingStock;
        return b.discountPercent - a.discountPercent;
      });
  }, [items, selectedCategory, maxPrice, selectedTags, searchQuery, sortBy]);

  const groupedByStore = useMemo(() => {
    const groups: Record<
      string,
      {
        merchantName: string;
        merchantOwner: string;
        merchantRole: string;
        city: string;
        district: string;
        address: string;
        pickupWindow: string;
        rating: number;
        items: SisaPiringItem[];
      }
    > = {};

    filteredItems.forEach((item) => {
      if (!groups[item.merchantName]) {
        groups[item.merchantName] = {
          merchantName: item.merchantName,
          merchantOwner: item.merchantOwner,
          merchantRole: item.merchantRole,
          city: item.city,
          district: item.district,
          address: item.address,
          pickupWindow: item.pickupWindow,
          rating: item.rating,
          items: [],
        };
      }
      groups[item.merchantName].items.push(item);
    });

    return Object.values(groups);
  }, [filteredItems]);

  const getCartQuantity = (id: string): number => {
    const found = cart.find((c) => c.item.id === id);
    return found ? found.quantity : 0;
  };

  return (
    <div className="min-h-screen bg-white pb-24">
      {/* FULL-WIDTH SLIDING BANNER DISPLAY (Moves Left & Right Above Search Bar & Filter) */}
      <div className="relative w-full overflow-hidden bg-stone-900 border-b border-stone-200/80">
        <div
          className="flex transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${activeBannerIdx * 100}%)` }}
        >
          {PROMO_BANNERS.map((banner) => (
            <div
              key={banner.id}
              className="w-full shrink-0 relative h-44 sm:h-56 md:h-64 overflow-hidden"
            >
              <ResilientImage
                src={banner.imageUrl}
                alt={banner.title}
                fallbackTitle={banner.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/85 via-black/55 to-black/20 flex items-center">
                <div className="w-full max-w-5xl mx-auto px-11 sm:px-14 md:px-16">
                  <span className="inline-block text-[10px] sm:text-xs font-semibold text-amber-300 tracking-wide uppercase mb-1">
                    {banner.tag}
                  </span>
                  <h2 className="text-base sm:text-2xl md:text-3xl font-bold text-white font-display max-w-lg leading-snug">
                    {banner.title}
                  </h2>
                  <p className="hidden sm:block text-xs sm:text-sm text-stone-200 mt-1.5 max-w-lg line-clamp-1">
                    {banner.subtitle}
                  </p>
                  <div className="mt-3 sm:mt-4">
                    <button
                      type="button"
                      onClick={() => handleBannerAction(banner.actionType)}
                      className="px-4 py-2 bg-[#8DA249] hover:bg-[#7b8e3d] text-white text-xs sm:text-sm font-semibold rounded-lg transition-colors cursor-pointer shadow-md shadow-[#8DA249]/30"
                    >
                      {banner.ctaLabel}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Left & Right Slide Controls */}
        <button
          type="button"
          onClick={prevBanner}
          aria-label="Banner sebelumnya"
          className="absolute left-2.5 sm:left-4 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-black/45 hover:bg-black/75 text-white flex items-center justify-center backdrop-blur-xs transition-colors cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>
        <button
          type="button"
          onClick={nextBanner}
          aria-label="Banner selanjutnya"
          className="absolute right-2.5 sm:right-4 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-black/45 hover:bg-black/75 text-white flex items-center justify-center backdrop-blur-xs transition-colors cursor-pointer"
        >
          <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
        </button>

        {/* Bottom Slide Indicator Dots */}
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
          {PROMO_BANNERS.map((b, idx) => (
            <button
              key={b.id}
              type="button"
              onClick={() => setActiveBannerIdx(idx)}
              aria-label={`Slide banner ${idx + 1}`}
              className={`h-1.5 rounded-full transition-all cursor-pointer ${
                activeBannerIdx === idx
                  ? 'w-6 bg-[#8DA249]'
                  : 'w-1.5 bg-white/60 hover:bg-white'
              }`}
            />
          ))}
        </div>
      </div>

      {/* SEARCH + PRICE FILTER & CIRCULAR CULINARY CATEGORY SELECTOR */}
      <section className="bg-[#F4F6EC] border-b border-[#8DA249]/20 pt-4 pb-5 sm:pt-5 sm:pb-6">
        <div className="max-w-5xl mx-auto px-3.5 sm:px-6 space-y-4 sm:space-y-5">
          {/* Row 1: Search Input + Price Filter Side-by-Side */}
          <div className="relative">
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Search Bar */}
              <div className="relative flex-1 min-w-0">
                <Search className="w-4 h-4 sm:w-5 sm:h-5 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Cari Martabak, Bakso, Croissant, atau toko di Bandung..."
                  aria-label="Cari makanan di etalase Bandung"
                  className="w-full h-11 sm:h-12 pl-10 sm:pl-11 pr-14 text-xs sm:text-sm bg-white border border-stone-300 rounded-xl focus:outline-none focus:border-[#8DA249] focus:bg-white transition-colors"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2 top-1/2 -translate-y-1/2 px-2 py-1 text-[11px] font-medium text-stone-600 hover:text-stone-900 bg-stone-200/70 rounded-lg cursor-pointer"
                  >
                    Hapus
                  </button>
                )}
              </div>

              {/* Filter Harga Button Placed Directly Beside Search Bar */}
              <div className="relative shrink-0">
                <button
                  type="button"
                  onClick={() => setIsPriceDropdownOpen((prev) => !prev)}
                  aria-expanded={isPriceDropdownOpen}
                  aria-label="Filter Harga Maksimal"
                  className={`h-11 sm:h-12 px-3 sm:px-4 rounded-xl border text-xs sm:text-sm font-medium inline-flex items-center gap-1.5 sm:gap-2 transition-colors whitespace-nowrap cursor-pointer ${
                    maxPrice < 60000
                      ? 'bg-[#8DA249] text-white border-[#8DA249]'
                      : 'bg-white text-stone-800 border-stone-300 hover:bg-stone-100'
                  }`}
                >
                  <SlidersHorizontal className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" />
                  <span>
                    {maxPrice < 60000
                      ? `≤ Rp ${Math.round(maxPrice / 1000)}rb`
                      : 'Filter Harga'}
                  </span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 transition-transform ${
                      isPriceDropdownOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {/* Price Filter Popover Right Below the Price Filter Button */}
                {isPriceDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-white border border-stone-200 rounded-2xl shadow-xl p-4 z-30 space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-stone-900">
                        Filter Batas Harga
                      </span>
                      <span className="text-xs font-mono-tabular font-bold text-emerald-900">
                        {maxPrice >= 60000 ? 'Semua Harga' : `Maks ${formatRupiah(maxPrice)}`}
                      </span>
                    </div>

                    {/* Quick Price Options */}
                    <div className="grid grid-cols-2 gap-1.5">
                      {PRICE_OPTIONS.map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => {
                            setMaxPrice(opt.value);
                            setIsPriceDropdownOpen(false);
                          }}
                          className={`min-h-[36px] px-2.5 py-1.5 text-xs rounded-lg border text-center transition-colors cursor-pointer ${
                            maxPrice === opt.value
                              ? 'bg-[#1F281A] text-white border-[#1F281A] font-semibold'
                              : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>

                    {/* Fine-Grained Price Slider */}
                    <div className="pt-2 border-t border-stone-100 space-y-1.5">
                      <div className="flex justify-between text-[11px] text-stone-500">
                        <span>Geser batas harga:</span>
                        <span className="font-mono-tabular font-semibold text-stone-800">
                          {formatRupiah(maxPrice)}
                        </span>
                      </div>
                      <input
                        type="range"
                        min={25000}
                        max={60000}
                        step={1000}
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(Number(e.target.value))}
                        aria-label="Geser batas harga maksimal"
                        className="w-full accent-emerald-900 cursor-pointer h-1.5 bg-stone-200 rounded-lg"
                      />
                      <div className="flex justify-between text-[10px] text-stone-400 font-mono-tabular">
                        <span>Rp 25rb</span>
                        <span>Rp 35rb</span>
                        <span>Rp 60rb</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Row 2: "Aneka kuliner menarik" Circular Food Type Selector */}
          <div className="pt-1 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base sm:text-lg font-bold text-stone-900 tracking-tight">
                Aneka kuliner menarik
              </h2>
              {selectedCategory !== 'Semua' && (
                <button
                  type="button"
                  onClick={() => setSelectedCategory('Semua')}
                  className="text-xs font-semibold text-[#8DA249] hover:underline cursor-pointer"
                >
                  Lihat Semua Kuliner
                </button>
              )}
            </div>

            {/* Circular Plate Icons Grid: 3 cols on mobile, 6 cols on desktop */}
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-y-5 gap-x-4">
              {visibleCulinaryCategories.map((cat) => {
                const isSelected = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() =>
                      setSelectedCategory((prev) =>
                        prev === cat.id ? 'Semua' : cat.id
                      )
                    }
                    className="group flex flex-col items-center text-center focus:outline-none cursor-pointer"
                  >
                    <div
                      className={`w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden bg-white transition-all duration-150 ${
                        isSelected
                          ? 'ring-3 ring-[#8DA249] ring-offset-2 scale-[1.03] shadow-sm'
                          : 'border border-[#8DA249]/20 group-hover:scale-[1.03] group-hover:shadow-xs'
                      }`}
                    >
                      <ResilientImage
                        src={cat.imageUrl}
                        alt={cat.label}
                        fallbackTitle={cat.label}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <span
                      className={`mt-2 text-xs sm:text-sm leading-tight transition-colors ${
                        isSelected
                          ? 'font-bold text-[#8DA249]'
                          : 'font-medium text-stone-800 group-hover:text-[#1F281A]'
                      }`}
                    >
                      {cat.label}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Soft Green Full-Width Pill Button at the Bottom of Categories */}
            <button
              type="button"
              onClick={() => setShowAllCategories((prev) => !prev)}
              className="w-full min-h-[40px] py-2.5 px-4 bg-[#E7F7EC] hover:bg-[#D5F0DD] text-[#00880C] text-xs sm:text-sm font-semibold rounded-full transition-colors cursor-pointer"
            >
              {showAllCategories
                ? 'Sembunyikan sebagian kuliner'
                : 'Tampilkan kuliner lainnya'}
            </button>
          </div>

          {/* Row 3: Horizontal Scrollable Tag Filter Bar */}
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar -mx-3.5 px-3.5 sm:mx-0 sm:px-0 pt-1">
            <span className="text-[11px] font-medium text-stone-400 whitespace-nowrap shrink-0 mr-1">
              Tag:
            </span>
            {ALL_FOOD_TAGS.map((tag) => {
              const isActive = selectedTags.includes(tag);
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  className={`min-h-[34px] px-3 py-1 text-xs font-medium rounded-lg border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    isActive
                      ? 'bg-emerald-900 text-white border-emerald-900'
                      : 'bg-stone-50 text-stone-700 border-stone-200 hover:border-stone-300'
                  }`}
                >
                  {tag}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* MAIN PRODUCT DISPLAY CONTAINER (2-COLUMN MARKETPLACE GRID LIKE REFERENCE) */}
      <div className="max-w-5xl mx-auto px-2.5 sm:px-6 pt-3 sm:pt-5 space-y-3 sm:space-y-4">
        {/* Compact Status, Sort & Display Mode Bar */}
        <div className="bg-white border border-stone-200/80 rounded-xl p-2 sm:px-4 sm:py-2.5 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-1.5 text-xs text-stone-600 pl-1">
            <span>
              <strong className="font-mono-tabular text-stone-900">
                {filteredItems.length}
              </strong>{' '}
              makanan tersedia
            </span>
            {selectedCategory !== 'Semua' && (
              <>
                <span aria-hidden="true">·</span>
                <span className="font-semibold text-emerald-900">
                  {selectedCategory}
                </span>
              </>
            )}
            {maxPrice < 60000 && (
              <>
                <span aria-hidden="true">·</span>
                <span className="font-mono-tabular font-semibold text-emerald-900">
                  ≤ {formatRupiah(maxPrice)}
                </span>
              </>
            )}
            {hasActiveFilters && (
              <button
                type="button"
                onClick={resetAllFilters}
                className="inline-flex items-center gap-1 text-xs font-semibold text-[#1F281A] underline ml-1 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Reset</span>
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5 ml-auto">
            <select
              value={sortBy}
              onChange={(e) =>
                setSortBy(
                  e.target.value as 'discount' | 'price-asc' | 'distance' | 'stock'
                )
              }
              aria-label="Urutkan tampilan makanan"
              className="min-h-[34px] px-2 py-1 text-xs bg-stone-50 border border-stone-200 rounded-lg text-stone-800 font-medium focus:outline-none focus:border-emerald-900 cursor-pointer"
            >
              <option value="discount">Diskon Terbesar</option>
              <option value="price-asc">Harga Termurah</option>
              <option value="distance">Jarak Terdekat</option>
              <option value="stock">Stok Terbanyak</option>
            </select>

            <div className="flex items-center bg-stone-100 p-0.5 rounded-lg shrink-0">
              <button
                type="button"
                onClick={() => setDisplayLayout('rak-menu')}
                className={`min-h-[30px] px-2 py-1 text-xs font-medium flex items-center gap-1 rounded-md cursor-pointer transition-colors ${
                  displayLayout === 'rak-menu'
                    ? 'bg-white text-stone-900 shadow-xs'
                    : 'text-stone-500 hover:text-stone-900'
                }`}
                aria-label="Tampilan Grid Produk"
              >
                <LayoutGrid className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setDisplayLayout('per-toko')}
                className={`min-h-[30px] px-2 py-1 text-xs font-medium flex items-center gap-1 rounded-md cursor-pointer transition-colors ${
                  displayLayout === 'per-toko'
                    ? 'bg-white text-stone-900 shadow-xs'
                    : 'text-stone-500 hover:text-stone-900'
                }`}
                aria-label="Tampilan Per Toko UMKM"
              >
                <Store className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Empty State */}
        {filteredItems.length === 0 ? (
          <div className="bg-white border border-stone-200 rounded-xl p-10 text-center space-y-3">
            <p className="text-sm sm:text-base font-semibold text-stone-900">
              Tidak ada hidangan yang cocok dengan filter Anda.
            </p>
            <p className="text-xs text-stone-500 max-w-md mx-auto">
              Coba pilih tipe kuliner lain atau naikkan batas harga di samping kolom pencarian untuk melihat hidangan UMKM Bandung sore ini.
            </p>
            <button
              type="button"
              onClick={resetAllFilters}
              className="min-h-[40px] px-4 py-2 text-xs font-medium bg-stone-900 text-white rounded-lg hover:bg-stone-800 transition-colors cursor-pointer"
            >
              Reset Filter
            </button>
          </div>
        ) : displayLayout === 'rak-menu' ? (
          /* MODE 1: 2-COLUMN COMPACT MARKETPLACE DISPLAY GRID (MATCHING REFERENCE SCREENSHOT) */
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3">
            {filteredItems.map((item) => {
              const inCartQty = getCartQuantity(item.id);

              return (
                <article
                  key={item.id}
                  onClick={() => onOpenDetail(item)}
                  className="group bg-white border border-stone-200/80 rounded-lg overflow-hidden flex flex-col justify-between shadow-2xs hover:shadow-md transition-shadow cursor-pointer"
                >
                  {/* 1:1 Square Product Image with Corner Discount Tag */}
                  <div className="aspect-square w-full bg-stone-100 relative overflow-hidden">
                    <ResilientImage
                      src={item.imageUrl}
                      alt={item.title}
                      fallbackTitle={item.title}
                      className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-[1.03]"
                    />

                    {/* Top-Right Discount Tag (-60%) like Marketplace Reference */}
                    <div className="absolute top-0 right-0 bg-[#fbe1b5] text-[#e57d3d] font-mono-tabular font-bold text-[10px] sm:text-[11px] px-1.5 py-0.5 rounded-bl-md">
                      -{item.discountPercent}%
                    </div>

                    {/* Bottom-Left Compact Stock & Pickup Time Strip */}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent px-2 pt-4 pb-1.5 flex items-center justify-between text-[10px] text-white">
                      <span className="font-semibold bg-[#1F281A]/90 px-1.5 py-0.5 rounded-xs">
                        Sisa {item.remainingStock}
                      </span>
                      <span className="truncate ml-1 drop-shadow-xs">
                        {item.pickupWindow.replace(' WIB', '')}
                      </span>
                    </div>
                  </div>

                  {/* Compact Marketplace Card Details */}
                  <div className="p-2.5 flex-1 flex flex-col justify-between space-y-2">
                    {/* Title */}
                    <h3 className="text-xs sm:text-[13px] text-stone-800 font-normal leading-snug line-clamp-2">
                      {item.title}
                    </h3>

                    {/* Bottom Price + Quick Add (No Location on Card) */}
                    <div className="pt-1 flex items-center justify-between gap-1.5">
                      <div className="min-w-0">
                        <div className="text-[#1F281A] font-bold font-mono-tabular leading-none truncate">
                          <span className="text-[11px] font-normal mr-0.5">Rp</span>
                          <span className="text-sm sm:text-base">
                            {formatNominal(item.rescuePrice)}
                          </span>
                        </div>
                        <div className="text-[10px] text-stone-400 line-through font-mono-tabular mt-0.5">
                          Rp{formatNominal(item.originalPrice)}
                        </div>
                      </div>

                      {/* Stop-propagation Quick Add / Quantity Stepper */}
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
                            aria-label={`Tambah ${item.title} ke kantong`}
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
        ) : (
          /* MODE 2: DISPLAY PER TOKO UMKM (GROUPED BY SHOP OWNER WITH 2-COL GRID) */
          <div className="space-y-4 sm:space-y-6">
            {groupedByStore.map((store) => (
              <section
                key={store.merchantName}
                className="bg-white border border-stone-200/80 rounded-xl p-3.5 sm:p-5 space-y-3.5"
              >
                {/* Storefront Owner Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-stone-100">
                  <div>
                    <div className="text-[11px] text-stone-500 flex flex-wrap items-center gap-x-1.5">
                      <span>{store.merchantRole}</span>
                      <span aria-hidden="true">·</span>
                      <span>
                        Pemilik: <strong className="text-stone-800">{store.merchantOwner}</strong>
                      </span>
                    </div>
                    <h2 className="text-base sm:text-lg font-bold text-stone-900">
                      {store.merchantName}
                    </h2>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-[11px] text-stone-500 mt-0.5">
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-stone-400 shrink-0" />
                        {store.address}
                      </span>
                      <span className="inline-flex items-center gap-1 text-emerald-900 font-medium">
                        <Clock className="w-3 h-3 shrink-0" />
                        Ambil {store.pickupWindow}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Store's 2-Column Compact Product Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3">
                  {store.items.map((item) => {
                    const inCartQty = getCartQuantity(item.id);
                    return (
                      <article
                        key={item.id}
                        onClick={() => onOpenDetail(item)}
                        className="group bg-white border border-stone-200/80 rounded-lg overflow-hidden flex flex-col justify-between cursor-pointer"
                      >
                        <div className="aspect-square w-full bg-stone-100 relative overflow-hidden">
                          <ResilientImage
                            src={item.imageUrl}
                            alt={item.title}
                            fallbackTitle={item.title}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute top-0 right-0 bg-[#fbe1b5] text-[#e57d3d] font-mono-tabular font-bold text-[10px] px-1.5 py-0.5 rounded-bl-md">
                            -{item.discountPercent}%
                          </div>
                        </div>

                        <div className="p-2.5 flex-1 flex flex-col justify-between space-y-2">
                          <h3 className="text-xs text-stone-800 font-normal leading-snug line-clamp-2">
                            {item.title}
                          </h3>

                          <div className="space-y-1">
                            <div className="text-[#1F281A] font-bold font-mono-tabular leading-none">
                              <span className="text-[11px] font-normal mr-0.5">Rp</span>
                              <span className="text-sm">{formatNominal(item.rescuePrice)}</span>
                            </div>

                            <div className="flex items-center justify-between gap-1 pt-0.5">
                              <span className="text-[10px] text-stone-400 uppercase truncate">
                                Sisa {item.remainingStock} porsi
                              </span>
                              <div onClick={(e) => e.stopPropagation()}>
                                {inCartQty > 0 ? (
                                  <span className="text-[10px] font-bold text-[#1F281A] font-mono-tabular">
                                    {inCartQty}x di Kantong
                                  </span>
                                ) : (
                                  <button
                                    type="button"
                                    onClick={() => onAddToCart(item, 1)}
                                    className="h-6 px-2 bg-[#1F281A] hover:bg-emerald-900 text-white text-[10px] font-semibold rounded-md cursor-pointer"
                                  >
                                    + Beli
                                  </button>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      </article>
                    );
                  })}
                </div>
              </section>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
