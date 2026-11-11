import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Check,
  ArrowRight,
  Eye,
  Clock,
  ShieldCheck,
  Package,
  Layers,
  Calendar,
  AlertTriangle,
} from 'lucide-react';
import { ProductCategory, StorageInstruction, SurplusProduct } from '../../types/seller';
import { calculateRecommendedDiscount } from '../../utils/discountEngine';
import { formatRupiah } from '../../utils/formatters';
import { FoodSafetyDeclaration } from './FoodSafetyDeclaration';

interface ProductFormModalProps {
  isOpen: boolean;
  initialProduct?: SurplusProduct | null;
  onClose: () => void;
  onSave: (productData: any) => void;
}

const SAMPLE_FOOD_IMAGES = [
  { label: 'Artisan Bakery & Croissant', url: '/src/assets/images/sisapiring_bakery_1794322284427.jpg' },
  { label: 'Nasi Kotak Ayam Bakar', url: '/src/assets/images/sisapiring_nasi_kotak_1794322285485.jpg' },
  { label: 'Pastry & Cheesecake Slice', url: '/src/assets/images/sisapiring_pastry_cake_1794322285409.jpg' },
  { label: 'Storefront Kala Bakehouse', url: '/src/assets/images/sisapiring_storefront_1794322286782.jpg' },
];

export const ProductFormModal: React.FC<ProductFormModalProps> = ({
  isOpen,
  initialProduct,
  onClose,
  onSave,
}) => {
  if (!isOpen) return null;

  const isEditing = !!initialProduct;

  const [name, setName] = useState(initialProduct?.name || '');
  const [category, setCategory] = useState<ProductCategory>(initialProduct?.category || 'Bakery & Roti');
  const [image, setImage] = useState(initialProduct?.image || SAMPLE_FOOD_IMAGES[0].url);
  const [originalPrice, setOriginalPrice] = useState(initialProduct?.originalPrice || 50000);
  const [discountPercentage, setDiscountPercentage] = useState<50 | 70 | 90 | 100>(
    initialProduct?.discountPercentage || 50
  );
  const [stock, setStock] = useState(initialProduct?.stock || 5);
  const [productionTime, setProductionTime] = useState(initialProduct?.productionTime || 'Hari ini, 08:00 WIB');
  const [safeConsumptionDeadline, setSafeConsumptionDeadline] = useState(
    initialProduct?.safeConsumptionDeadline || 'Hari ini, 22:00 WIB'
  );
  const [pickupScheduleStart, setPickupScheduleStart] = useState(initialProduct?.pickupScheduleStart || '17:30 WIB');
  const [pickupScheduleEnd, setPickupScheduleEnd] = useState(initialProduct?.pickupScheduleEnd || '21:00 WIB');
  const [storageInstruction, setStorageInstruction] = useState<StorageInstruction>(
    initialProduct?.storageInstruction || 'Suhu Ruang (Kering & Sejuk)'
  );
  const [description, setDescription] = useState(
    initialProduct?.description ||
      'Produk surplus segar produksi hari ini. Disiapkan dalam kemasan higienis tertutup rapi.'
  );
  const [isActive, setIsActive] = useState(initialProduct?.isActive ?? true);

  // Food safety checklist
  const [foodSafetyChecklist, setFoodSafetyChecklist] = useState(
    initialProduct?.foodSafetyChecklist || {
      isFitForConsumption: true,
      isProperlyStored: true,
      isCleanPackaging: true,
      isNoAbnormalOdor: true,
      isAccurateInformation: true,
    }
  );

  const [showSafetyWarning, setShowSafetyWarning] = useState(false);
  const [nameError, setNameError] = useState('');
  const [activeTabSection, setActiveTabSection] = useState<'form' | 'preview'>('form');

  // Calculate recommendation based on estimated safe time remaining (simulate 4 hours)
  const discountSuggestion = calculateRecommendedDiscount(3.5, stock, category);

  const discountedPrice =
    discountPercentage === 100 ? 0 : Math.round(originalPrice * (1 - discountPercentage / 100));

  const handleApplySuggestion = () => {
    setDiscountPercentage(discountSuggestion.recommendedDiscount);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setNameError('Nama produk surplus wajib diisi');
      return;
    }

    const isAllChecked =
      foodSafetyChecklist.isFitForConsumption &&
      foodSafetyChecklist.isProperlyStored &&
      foodSafetyChecklist.isCleanPackaging &&
      foodSafetyChecklist.isNoAbnormalOdor &&
      foodSafetyChecklist.isAccurateInformation;

    if (!isAllChecked) {
      setShowSafetyWarning(true);
      return;
    }

    const payload = {
      name,
      category,
      image,
      originalPrice: Number(originalPrice),
      discountPercentage,
      discountedPrice,
      stock: Number(stock),
      productionTime,
      safeConsumptionDeadline,
      safeDeadlineTimestamp: Date.now() + 5 * 3600 * 1000,
      pickupScheduleStart,
      pickupScheduleEnd,
      storageInstruction,
      description,
      isActive,
      foodSafetyChecklist,
    };

    onSave(payload);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-white rounded-2xl shadow-2xl border border-neutral-200 my-4 sm:my-8 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Top Bar */}
        <div className="px-5 py-4 border-b border-neutral-200 flex items-center justify-between bg-[#FAF9F6] shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono uppercase bg-[#16382C] text-[#FFD230] px-2 py-0.5 rounded font-bold">
                Food Rescue UMKM
              </span>
              <h3 className="text-base font-bold text-[#16382C]">
                {isEditing ? 'Perbarui Produk Surplus' : 'Tambah Surplus Makanan Baru'}
              </h3>
            </div>
            <p className="text-xs text-neutral-500 mt-0.5">
              Isi parameter makanan, tetapkan diskon penyelamatan, dan lengkapi deklarasi keamanan pangan.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {/* Mobile Form/Preview Tab Switcher */}
            <div className="flex xl:hidden bg-neutral-200 p-0.5 rounded-lg text-xs font-semibold">
              <button
                type="button"
                onClick={() => setActiveTabSection('form')}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  activeTabSection === 'form' ? 'bg-white text-neutral-900 shadow-xs' : 'text-neutral-600'
                }`}
              >
                Formulir
              </button>
              <button
                type="button"
                onClick={() => setActiveTabSection('preview')}
                className={`px-2.5 py-1 rounded-md transition-colors ${
                  activeTabSection === 'preview' ? 'bg-white text-[#EE4D2D] shadow-xs' : 'text-neutral-600'
                }`}
              >
                Pratinjau
              </button>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 text-neutral-400 hover:text-neutral-700 rounded-lg hover:bg-neutral-100 transition-colors"
              aria-label="Tutup"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Split View */}
        <div className="flex-1 overflow-y-auto grid grid-cols-1 xl:grid-cols-12 divide-y xl:divide-y-0 xl:divide-x divide-neutral-200">
          {/* Form Column (Left 7.5 cols on xl) */}
          <form
            id="product-form"
            onSubmit={handleSave}
            className={`p-5 sm:p-6 space-y-6 ${
              activeTabSection === 'preview' ? 'hidden xl:block' : 'block'
            } xl:col-span-8`}
          >
            {/* Section 1: Product Information */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-neutral-100">
                <span className="w-5 h-5 rounded-full bg-[#16382C] text-white text-xs font-bold flex items-center justify-center font-mono">
                  1
                </span>
                <h4 className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
                  Informasi Produk & Foto
                </h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Nama Menu Surplus <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      if (e.target.value.trim()) setNameError('');
                    }}
                    placeholder="Contoh: Paket 3 Croissant & Pain au Chocolat"
                    className="w-full px-3.5 py-2.5 text-xs bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#16382C]"
                  />
                  {nameError && <p className="text-xs text-red-500 mt-1">{nameError}</p>}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Kategori Kuliner <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as ProductCategory)}
                    className="w-full px-3.5 py-2.5 text-xs bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#16382C]"
                  >
                    <option value="Bakery & Roti">Bakery & Roti</option>
                    <option value="Katering & Nasi Kotak">Katering & Nasi Kotak</option>
                    <option value="Cafe & Minuman">Cafe & Minuman</option>
                    <option value="Kue & Pastry">Kue & Pastry</option>
                    <option value="Resto & Makanan Berat">Resto & Makanan Berat</option>
                    <option value="Buah & Sayur Segar">Buah & Sayur Segar</option>
                  </select>
                </div>
              </div>

              {/* Photo Selector */}
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                  Pilih Foto Kuliner Asli:
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {SAMPLE_FOOD_IMAGES.map((img) => (
                    <div
                      key={img.url}
                      onClick={() => setImage(img.url)}
                      className={`cursor-pointer rounded-xl overflow-hidden border-2 transition-all p-1 bg-neutral-50 ${
                        image === img.url
                          ? 'border-[#16382C] bg-neutral-100'
                          : 'border-neutral-200 hover:border-neutral-300'
                      }`}
                    >
                      <img
                        src={img.url}
                        alt={img.label}
                        className="w-full h-16 object-cover rounded-lg"
                        referrerPolicy="no-referrer"
                      />
                      <p className="text-[10px] font-medium text-neutral-700 truncate mt-1 text-center">
                        {img.label}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1">
                  Deskripsi & Komposisi Menu
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Jelaskan cita rasa, isi porsi, dan rekomendasi penyajian..."
                  className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white"
                />
              </div>
            </div>

            {/* Section 2: Pricing & Stock */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-neutral-100">
                <span className="w-5 h-5 rounded-full bg-[#16382C] text-white text-xs font-bold flex items-center justify-center font-mono">
                  2
                </span>
                <h4 className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
                  Harga & Alokasi Stok Surplus
                </h4>
              </div>

              <div className="bg-[#FAF9F6] p-4 rounded-xl border border-neutral-200 space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">
                      Harga Normal (Rp) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      min={0}
                      step={1000}
                      value={originalPrice}
                      onChange={(e) => setOriginalPrice(Math.max(0, Number(e.target.value)))}
                      className="w-full px-3 py-2 text-xs bg-white border border-neutral-200 rounded-xl font-mono"
                    />
                    <span className="text-[11px] text-neutral-500 font-mono mt-0.5 block">
                      {formatRupiah(originalPrice)}
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">
                      Pilihan Diskon Penyelamatan <span className="text-red-500">*</span>
                    </label>
                    <div className="grid grid-cols-4 gap-1">
                      {([50, 70, 90, 100] as const).map((pct) => (
                        <button
                          key={pct}
                          type="button"
                          onClick={() => setDiscountPercentage(pct)}
                          className={`py-2 text-xs font-bold rounded-lg border transition-all ${
                            discountPercentage === pct
                              ? pct === 100
                                ? 'bg-[#16382C] text-[#FFD230] border-[#16382C]'
                                : 'bg-[#EE4D2D] text-white border-[#EE4D2D]'
                              : 'bg-white text-neutral-700 border-neutral-200 hover:bg-neutral-100'
                          }`}
                        >
                          {pct === 100 ? 'Donasi' : `${pct}%`}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-neutral-700 mb-1">
                      Stok Surplus (Porsi) <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={stock}
                      onChange={(e) => setStock(Math.max(1, Number(e.target.value)))}
                      className="w-full px-3 py-2 text-xs bg-white border border-neutral-200 rounded-xl font-mono"
                    />
                    <span className="text-[11px] text-neutral-600 mt-0.5 block">
                      Harga Final: <strong className="font-mono text-[#16382C]">{formatRupiah(discountedPrice)}</strong>
                    </span>
                  </div>
                </div>

                {/* AI Automatic Discount Suggestion Strip */}
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 flex items-start gap-3">
                  <Sparkles className="w-4 h-4 text-[#EE4D2D] shrink-0 mt-0.5" />
                  <div className="flex-1 text-xs">
                    <p className="font-bold text-neutral-900">
                      Rekomendasi Diskon Sistem: {discountSuggestion.recommendedDiscount}% OFF
                    </p>
                    <p className="text-[11px] text-neutral-600 mt-0.5 leading-relaxed">
                      {discountSuggestion.reason}
                    </p>
                  </div>
                  {discountPercentage !== discountSuggestion.recommendedDiscount && (
                    <button
                      type="button"
                      onClick={handleApplySuggestion}
                      className="px-2.5 py-1.5 bg-[#16382C] hover:bg-[#214F3F] text-white text-[11px] font-semibold rounded-lg shrink-0 transition-colors"
                    >
                      Gunakan Saran
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Section 3: Food Safety Declaration */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-neutral-100">
                <span className="w-5 h-5 rounded-full bg-[#16382C] text-white text-xs font-bold flex items-center justify-center font-mono">
                  3
                </span>
                <h4 className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
                  Informasi & Deklarasi Keamanan Pangan
                </h4>
              </div>

              <FoodSafetyDeclaration
                checklist={foodSafetyChecklist}
                onChangeChecklist={setFoodSafetyChecklist}
                productionTime={productionTime}
                onChangeProductionTime={setProductionTime}
                safeConsumptionDeadline={safeConsumptionDeadline}
                onChangeSafeDeadline={setSafeConsumptionDeadline}
                storageInstruction={storageInstruction}
                onChangeStorageInstruction={setStorageInstruction}
                showValidationWarning={showSafetyWarning}
              />
            </div>

            {/* Section 4: Pickup Schedule */}
            <div className="space-y-4">
              <div className="flex items-center gap-2 pb-2 border-b border-neutral-100">
                <span className="w-5 h-5 rounded-full bg-[#16382C] text-white text-xs font-bold flex items-center justify-center font-mono">
                  4
                </span>
                <h4 className="text-xs font-bold text-neutral-900 uppercase tracking-wider">
                  Jadwal Penjemputan Pesanan (WIB)
                </h4>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Mulai Waktu Pengambilan
                  </label>
                  <input
                    type="text"
                    value={pickupScheduleStart}
                    onChange={(e) => setPickupScheduleStart(e.target.value)}
                    placeholder="17:30 WIB"
                    className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-neutral-700 mb-1">
                    Batas Akhir Penjemputan
                  </label>
                  <input
                    type="text"
                    value={pickupScheduleEnd}
                    onChange={(e) => setPickupScheduleEnd(e.target.value)}
                    placeholder="21:00 WIB"
                    className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-xl"
                  />
                </div>
              </div>

              {/* Status Switch */}
              <div className="flex items-center justify-between p-3.5 bg-neutral-50 rounded-xl border border-neutral-200">
                <div>
                  <span className="text-xs font-bold text-neutral-800 block">
                    Tayangkan Langsung di Etalase Bandung
                  </span>
                  <span className="text-[11px] text-neutral-500">
                    Jika aktif, produk segera dapat dipesan oleh pelanggan sekitar.
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsActive(!isActive)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                    isActive ? 'bg-[#16382C]' : 'bg-neutral-300'
                  }`}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      isActive ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </form>

          {/* Right Column: Live Customer Preview Card (Right 4 cols on xl) */}
          <div
            className={`p-5 sm:p-6 bg-[#FAF9F6] xl:col-span-4 flex flex-col justify-between ${
              activeTabSection === 'form' ? 'hidden xl:flex' : 'flex'
            }`}
          >
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Eye className="w-4 h-4 text-[#EE4D2D]" />
                <h4 className="text-xs font-bold text-neutral-800 uppercase tracking-wider">
                  Pratinjau Etalase Pelanggan
                </h4>
              </div>
              <p className="text-[11px] text-neutral-500 leading-relaxed">
                Tampilan real-time yang akan dilihat pembeli di aplikasi SisaPiring Bandung:
              </p>

              {/* Simulated Customer Product Card */}
              <div className="bg-white rounded-2xl border border-neutral-200 overflow-hidden shadow-xs">
                <div className="relative aspect-4/3 bg-neutral-100">
                  <img
                    src={image}
                    alt={name || 'Produk Baru'}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute top-2.5 left-2.5">
                    <span
                      className={`font-mono font-bold text-xs px-2 py-0.5 rounded shadow-sm ${
                        discountPercentage === 100
                          ? 'bg-[#16382C] text-[#FFD230]'
                          : 'bg-[#EE4D2D] text-white'
                      }`}
                    >
                      {discountPercentage === 100 ? 'Donasi 100%' : `${discountPercentage}% OFF`}
                    </span>
                  </div>
                  <div className="absolute bottom-2.5 left-2.5 right-2.5 bg-black/60 text-white text-[10px] px-2 py-1 rounded flex justify-between items-center">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-[#FFD230]" />
                      <span>{safeConsumptionDeadline}</span>
                    </span>
                    <span className="font-mono">Sisa {stock} porsi</span>
                  </div>
                </div>

                <div className="p-3.5 space-y-1.5">
                  <div className="flex justify-between items-center text-[10px] text-neutral-500">
                    <span>{category}</span>
                    <span className="inline-flex items-center gap-0.5 text-emerald-700 font-medium">
                      <ShieldCheck className="w-3 h-3" />
                      <span>Lulus Uji Pangan</span>
                    </span>
                  </div>

                  <h5 className="font-bold text-xs text-neutral-900 line-clamp-1">
                    {name || 'Nama Produk Surplus'}
                  </h5>

                  <p className="text-[11px] text-neutral-500 line-clamp-2 leading-relaxed">
                    {description || 'Deskripsi makanan surplus...'}
                  </p>

                  <div className="pt-1.5 flex items-baseline gap-2">
                    <span className="font-mono font-bold text-sm text-[#16382C]">
                      {discountedPrice === 0 ? 'Bebas Bayar' : formatRupiah(discountedPrice)}
                    </span>
                    <span className="font-mono text-[11px] text-neutral-400 line-through">
                      {formatRupiah(originalPrice)}
                    </span>
                  </div>

                  <div className="pt-2 border-t border-neutral-100 flex items-center justify-between text-[10px] text-neutral-500">
                    <span>Pickup: {pickupScheduleStart}</span>
                    <span className="bg-[#EE4D2D] text-white px-2 py-1 rounded font-semibold">
                      Pesan
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Verification reminder box */}
            <div className="mt-4 p-3 bg-white rounded-xl border border-neutral-200 text-[11px] text-neutral-600 space-y-1">
              <p className="font-semibold text-neutral-800">Standar Kualitas SisaPiring:</p>
              <p className="leading-relaxed text-neutral-500">
                Setiap produk yang diterbitkan dijamin kebersihannya untuk membangun kepercayaan pembeli kuliner di Bandung.
              </p>
            </div>
          </div>
        </div>

        {/* Modal Bottom Action Bar */}
        <div className="px-5 py-3.5 border-t border-neutral-200 flex items-center justify-end gap-3 bg-white shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-xl transition-colors"
          >
            Batal
          </button>
          <button
            type="submit"
            form="product-form"
            className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-[#EE4D2D] hover:bg-[#D73C1C] text-white text-xs font-bold rounded-xl transition-colors shadow-xs"
          >
            <span>{isEditing ? 'Simpan Perubahan' : 'Terbitkan Produk Surplus'}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
