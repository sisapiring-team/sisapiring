import React, { useState } from 'react';
import {
  ShoppingBag,
  MapPin,
  Clock,
  Sparkles,
  QrCode,
  ArrowRight,
  ShieldCheck,
  Search,
  CheckCircle2,
  X,
  Store,
  ExternalLink,
} from 'lucide-react';
import { BANDUNG_DISTRICTS } from '../../data/bandungDistricts';
import { BandungDistrict, SisaPiringProduct } from '../../types/seller';
import { formatRupiah } from '../../utils/formatters';
import { useApp } from '../../context/AppContext';

export const CustomerMarketplaceView: React.FC = () => {
  const { products, sellerProfile, createCustomerOrder, setActiveTab, showToast } = useApp();

  const [selectedDistrict, setSelectedDistrict] = useState<string>('all');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Cart state
  const [cart, setCart] = useState<{ [productId: string]: number }>({});
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [customerName, setCustomerName] = useState('Nabila Putri (Warga Dago)');
  const [customerPhone, setCustomerPhone] = useState('+62 812-9876-5432');
  const [lastCreatedOrder, setLastCreatedOrder] = useState<any | null>(null);

  // Active products in inventory
  const availableProducts = products.filter((p) => p.isActive && p.stock > 0);

  const filteredProducts = availableProducts.filter((p) => {
    if (selectedCategory !== 'all' && p.category !== selectedCategory) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      if (!p.name.toLowerCase().includes(q) && !p.category.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const cartCount = Object.values(cart).reduce((a, b) => a + b, 0);

  const addToCart = (p: SisaPiringProduct) => {
    const current = cart[p.id] || 0;
    if (current >= p.stock) {
      showToast('Stok Maksimal', `Stok sisa piring ${p.name} hanya tersisa ${p.stock} porsi.`, 'warning');
      return;
    }
    setCart({ ...cart, [p.id]: current + 1 });
    showToast('Ditambahkan ke Keranjang', `1x ${p.name} ditambahkan.`, 'success');
  };

  const removeFromCart = (productId: string) => {
    const current = cart[productId] || 0;
    if (current <= 1) {
      const next = { ...cart };
      delete next[productId];
      setCart(next);
    } else {
      setCart({ ...cart, [productId]: current - 1 });
    }
  };

  const calculateCartTotal = () => {
    let total = 0;
    Object.entries(cart).forEach(([id, qty]) => {
      const prod = products.find((p) => p.id === id);
      if (prod) {
        total += prod.discountedPrice * qty;
      }
    });
    return total;
  };

  const handleCheckout = (e: React.FormEvent) => {
    e.preventDefault();
    if (cartCount === 0) return;

    const items = Object.entries(cart).map(([productId, quantity]) => ({
      productId,
      quantity,
    }));

    const newOrder = createCustomerOrder(items, customerName, customerPhone);
    setLastCreatedOrder(newOrder);
    setCart({});
  };

  return (
    <div className="min-h-screen bg-[#FAF9F6] text-[#292929]">
      {/* Top Banner informing user this is the Customer View */}
      <div className="bg-[#16382C] text-white px-4 py-2.5 text-xs flex flex-wrap items-center justify-between gap-2 border-b border-white/10 sticky top-0 z-30 shadow-xs">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#FFD230]" />
          <span className="font-medium">
            Pratinjau Etalase Pembeli SisaPiring Bandung — Hubungkan pesanan langsung ke Portal Mitra UMKM
          </span>
        </div>
        <button
          type="button"
          onClick={() => setActiveTab('dashboard')}
          className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#EE4D2D] hover:bg-[#D73C1C] text-white text-[11px] font-bold rounded-lg transition-colors shadow-xs"
        >
          <span>Kembali ke Portal Mitra</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* Customer Header */}
      <header className="bg-white border-b border-neutral-200 px-4 md:px-8 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#EE4D2D] flex items-center justify-center font-bold text-white text-lg">
              S
            </div>
            <div>
              <span className="font-bold text-lg text-[#16382C] tracking-tight block leading-tight">
                SisaPiring
              </span>
              <span className="text-[11px] text-neutral-500 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-[#EE4D2D]" />
                <span>Penyelamatan Makanan Kota Bandung</span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Cart Button */}
            <button
              type="button"
              onClick={() => setIsCheckoutModalOpen(true)}
              className="relative inline-flex items-center gap-2 px-4 py-2 bg-[#16382C] text-white text-xs font-bold rounded-xl hover:bg-[#214F3F] transition-colors shadow-xs"
            >
              <ShoppingBag className="w-4 h-4 text-[#FFD230]" />
              <span>Keranjang</span>
              {cartCount > 0 && (
                <span className="font-mono bg-[#EE4D2D] text-white text-[10px] px-1.5 py-0.2 rounded-full font-bold">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-4 md:p-8 space-y-6">
        {/* Hero Banner */}
        <div className="relative rounded-3xl overflow-hidden bg-[#16382C] text-white p-6 md:p-10 shadow-lg">
          <div className="relative z-10 max-w-xl space-y-3">
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#FFD230] bg-white/10 px-3 py-1 rounded-full">
              <Sparkles className="w-3.5 h-3.5" />
              Sisa Piring Food Rescue — Hemat Hingga 90% & Donasi 100%
            </span>
            <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight leading-tight">
              Selamatkan Makanan Lezat Bandung Dari Berakhir Sia-sia.
            </h1>
            <p className="text-xs md:text-sm text-white/80 leading-relaxed">
              Beli makanan berlebih dari mitra UMKM lokal berkualitas seperti{' '}
              <strong className="text-white">{sellerProfile.businessName}</strong> di Kecamatan{' '}
              {sellerProfile.district} sebelum toko tutup.
            </p>
          </div>

          <div className="absolute -right-10 -bottom-10 w-72 h-72 rounded-full bg-white/5 pointer-events-none" />
        </div>

        {/* Filters */}
        <div className="bg-white rounded-2xl p-4 border border-neutral-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0">
            {['all', 'Bakery & Roti', 'Katering & Nasi Kotak', 'Kue & Pastry', 'Resto & Makanan Berat'].map(
              (cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-colors whitespace-nowrap ${
                    selectedCategory === cat
                      ? 'bg-[#16382C] text-white shadow-xs'
                      : 'bg-neutral-100 text-neutral-600 hover:bg-neutral-200'
                  }`}
                >
                  {cat === 'all' ? 'Semua Menu' : cat}
                </button>
              )
            )}
          </div>

          <div className="relative w-full md:w-64">
            <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari makanan lezat..."
              className="w-full pl-9 pr-3 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#16382C]"
            />
          </div>
        </div>

        {/* Product Grid */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-[#16382C]">
              Menu Sisa Piring Tersedia Hari Ini ({filteredProducts.length} Pilihan)
            </h2>
            <span className="text-xs text-neutral-500">
              Lokasi: Mitra {sellerProfile.businessName} (Kec. {sellerProfile.district})
            </span>
          </div>

          {filteredProducts.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-neutral-200 shadow-xs">
              <p className="text-sm font-semibold text-neutral-700">Belum ada makanan sisa piring pada kategori ini</p>
              <p className="text-xs text-neutral-500 mt-1">Coba pilih kategori lain atau ubah kata kunci pencarian.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredProducts.map((p) => {
                const inCart = cart[p.id] || 0;
                return (
                  <div
                    key={p.id}
                    className="bg-white rounded-2xl border border-neutral-200 shadow-xs hover:border-neutral-300 transition-all overflow-hidden flex flex-col justify-between"
                  >
                    <div>
                      {/* Image + Discount Badge */}
                      <div className="relative aspect-4/3 bg-neutral-100 overflow-hidden">
                        <img
                          src={p.image}
                          alt={p.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute top-3 left-3">
                          <span
                            className={`font-mono font-bold text-xs px-2.5 py-1 rounded-lg shadow-sm ${
                              p.discountPercentage === 100
                                ? 'bg-[#16382C] text-[#FFD230]'
                                : 'bg-[#EE4D2D] text-white'
                            }`}
                          >
                            {p.discountPercentage === 100 ? 'Donasi 100%' : `${p.discountPercentage}% OFF`}
                          </span>
                        </div>
                        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between bg-black/60 backdrop-blur-xs text-white text-[11px] px-2.5 py-1 rounded-lg">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3 text-[#FFD230]" />
                            <span>Aman s/d {p.safeConsumptionDeadline}</span>
                          </span>
                          <span className="font-mono">Sisa {p.stock} porsi</span>
                        </div>
                      </div>

                      {/* Info */}
                      <div className="p-4 space-y-2">
                        <div className="flex items-center justify-between text-[11px] text-neutral-500">
                          <span>{p.category}</span>
                          <span className="inline-flex items-center gap-1 text-emerald-700 font-medium">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            <span>Lulus Uji Pangan</span>
                          </span>
                        </div>

                        <h3 className="text-sm font-bold text-neutral-900 line-clamp-2 leading-snug" title={p.name}>
                          {p.name}
                        </h3>

                        <p className="text-xs text-neutral-500 line-clamp-2 leading-relaxed">
                          {p.description}
                        </p>

                        <div className="pt-2 flex items-baseline gap-2">
                          <span className="text-base font-bold font-mono text-[#16382C]">
                            {p.discountedPrice === 0 ? 'Bebas Bayar (Donasi)' : formatRupiah(p.discountedPrice)}
                          </span>
                          <span className="text-xs font-mono text-neutral-400 line-through">
                            {formatRupiah(p.originalPrice)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Bottom CTA */}
                    <div className="p-4 pt-0">
                      <div className="flex items-center justify-between pt-3 border-t border-neutral-100">
                        <span className="text-[11px] text-neutral-500">
                          Pickup: {p.pickupScheduleStart} - {p.pickupScheduleEnd}
                        </span>

                        <button
                          type="button"
                          onClick={() => addToCart(p)}
                          className="px-3.5 py-2 bg-[#EE4D2D] hover:bg-[#D73C1C] text-white text-xs font-bold rounded-xl transition-colors shadow-xs"
                        >
                          {inCart > 0 ? `+ Tambah (${inCart})` : 'Pesan Sekarang'}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* Checkout / Cart Modal */}
      {isCheckoutModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="relative w-full max-w-lg bg-white rounded-2xl p-6 shadow-2xl border border-neutral-200 max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => {
                setIsCheckoutModalOpen(false);
                setLastCreatedOrder(null);
              }}
              className="absolute top-4 right-4 p-1.5 text-neutral-400 hover:text-neutral-700 rounded-lg hover:bg-neutral-100"
            >
              <X className="w-5 h-5" />
            </button>

            {!lastCreatedOrder ? (
              <form onSubmit={handleCheckout} className="space-y-4">
                <div className="flex items-center gap-2 pb-3 border-b border-neutral-100">
                  <ShoppingBag className="w-5 h-5 text-[#16382C]" />
                  <h3 className="text-base font-bold text-neutral-800">Keranjang Penyelamatan Pangan</h3>
                </div>

                {cartCount === 0 ? (
                  <div className="py-8 text-center text-xs text-neutral-500">
                    Keranjang masih kosong. Pilih menu sisa piring terlebih dahulu!
                  </div>
                ) : (
                  <>
                    <div className="space-y-2 max-h-48 overflow-y-auto">
                      {Object.entries(cart).map(([prodId, qty]) => {
                        const prod = products.find((p) => p.id === prodId);
                        if (!prod) return null;
                        return (
                          <div
                            key={prodId}
                            className="flex items-center justify-between p-2.5 bg-neutral-50 rounded-xl text-xs"
                          >
                            <div className="min-w-0 pr-2">
                              <p className="font-bold text-neutral-800 truncate">{prod.name}</p>
                              <p className="text-neutral-500 font-mono">
                                {prod.discountedPrice === 0 ? 'Donasi' : formatRupiah(prod.discountedPrice)} x {qty}
                              </p>
                            </div>
                            <div className="flex items-center gap-1.5">
                              <button
                                type="button"
                                onClick={() => removeFromCart(prodId)}
                                className="w-6 h-6 rounded bg-white border border-neutral-200 font-bold"
                              >
                                -
                              </button>
                              <span className="font-mono font-bold w-4 text-center">{qty}</span>
                              <button
                                type="button"
                                onClick={() => addToCart(prod)}
                                className="w-6 h-6 rounded bg-white border border-neutral-200 font-bold"
                              >
                                +
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="pt-2 border-t border-neutral-200 flex justify-between font-bold text-sm text-neutral-900">
                      <span>Total Pembayaran:</span>
                      <span className="font-mono text-[#16382C]">
                        {calculateCartTotal() === 0 ? 'Rp 0 (Donasi)' : formatRupiah(calculateCartTotal())}
                      </span>
                    </div>

                    <div className="space-y-3 pt-2">
                      <span className="text-xs font-bold text-neutral-800 block">
                        Informasi Pengambil (Bandung):
                      </span>
                      <div>
                        <label className="block text-[11px] font-semibold text-neutral-600 mb-1">
                          Nama Lengkap
                        </label>
                        <input
                          type="text"
                          value={customerName}
                          onChange={(e) => setCustomerName(e.target.value)}
                          className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-xl"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-semibold text-neutral-600 mb-1">
                          Nomor WhatsApp
                        </label>
                        <input
                          type="text"
                          value={customerPhone}
                          onChange={(e) => setCustomerPhone(e.target.value)}
                          className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-xl"
                          required
                        />
                      </div>
                    </div>

                    <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-[11px] text-amber-900 leading-relaxed">
                      📍 Lokasi Penjemputan Mandiri: <strong>{sellerProfile.businessName}</strong>, {sellerProfile.businessAddress}, Kec. {sellerProfile.district}, Kota Bandung.
                    </div>

                    <div className="pt-2 flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setIsCheckoutModalOpen(false)}
                        className="px-4 py-2 text-xs font-semibold text-neutral-600 bg-neutral-100 rounded-xl"
                      >
                        Kembali Belanja
                      </button>
                      <button
                        type="submit"
                        className="px-5 py-2.5 text-xs font-bold text-white bg-[#EE4D2D] hover:bg-[#D73C1C] rounded-xl shadow-xs"
                      >
                        Konfirmasi & Ambil Tiket QR
                      </button>
                    </div>
                  </>
                )}
              </form>
            ) : (
              /* Post Checkout: Customer Pickup Ticket with QR Code */
              <div className="space-y-4 text-center py-2 animate-in fade-in duration-200">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-neutral-900">Pesanan Berhasil Dibuat!</h3>
                  <p className="text-xs text-neutral-500 mt-0.5">
                    Tunjukkan tiket QR ini kepada staf kasir saat tiba di lokasi.
                  </p>
                </div>

                {/* QR Code Graphic Box */}
                <div className="bg-[#FAF9F6] border-2 border-dashed border-[#16382C]/30 rounded-2xl p-5 max-w-xs mx-auto space-y-2">
                  <div className="w-36 h-36 bg-white p-2 rounded-xl mx-auto shadow-xs border border-neutral-200 flex flex-col items-center justify-center">
                    <QrCode className="w-28 h-28 text-[#16382C]" />
                  </div>
                  <div>
                    <span className="text-[10px] text-neutral-400 uppercase font-semibold block">
                      Kode Pengambilan (PIN Kasir)
                    </span>
                    <span className="font-mono font-extrabold text-xl text-[#EE4D2D] tracking-widest">
                      {lastCreatedOrder.pickupCode}
                    </span>
                  </div>
                  <div className="text-[11px] text-neutral-600 font-mono">
                    ID: {lastCreatedOrder.id}
                  </div>
                </div>

                <div className="text-xs text-neutral-600 text-left bg-neutral-50 p-3 rounded-xl border border-neutral-100 space-y-1">
                  <p>
                    <strong>Toko:</strong> {sellerProfile.businessName} (Kec. {sellerProfile.district})
                  </p>
                  <p>
                    <strong>Pengambil:</strong> {lastCreatedOrder.customerName}
                  </p>
                  <p>
                    <strong>Batas Ambil:</strong> {lastCreatedOrder.pickupDeadline}
                  </p>
                </div>

                {/* Button to verify this order directly in Seller Portal! */}
                <div className="pt-2 flex flex-col sm:flex-row gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsCheckoutModalOpen(false);
                      setLastCreatedOrder(null);
                      setActiveTab('qr_pickup');
                    }}
                    className="flex-1 py-2.5 bg-[#16382C] text-white text-xs font-bold rounded-xl hover:bg-[#214F3F] transition-colors flex items-center justify-center gap-1.5 shadow-xs"
                  >
                    <QrCode className="w-4 h-4 text-[#FFD230]" />
                    <span>Uji Verifikasi di Portal Mitra</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsCheckoutModalOpen(false);
                      setLastCreatedOrder(null);
                    }}
                    className="py-2.5 px-4 bg-neutral-100 text-neutral-700 text-xs font-semibold rounded-xl hover:bg-neutral-200"
                  >
                    Selesai
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
