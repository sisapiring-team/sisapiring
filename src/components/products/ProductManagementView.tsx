import React, { useState } from 'react';
import {
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  ShieldCheck,
  AlertTriangle,
  Clock,
  CheckCircle2,
  Package,
} from 'lucide-react';
import { SisaPiringProduct } from '../../types/seller';
import { formatRupiah } from '../../utils/formatters';
import { useApp } from '../../context/AppContext';
import { ConfirmationModal } from '../common/ConfirmationModal';
import { ProductFormModal } from './ProductFormModal';

export const ProductManagementView: React.FC = () => {
  const { products, addProduct, updateProduct, deleteProduct, toggleProductStatus, updateStock } = useApp();

  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'inactive' | 'critical'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<SisaPiringProduct | null>(null);
  const [deletingProductId, setDeletingProductId] = useState<string | null>(null);

  // Filter products
  const filteredProducts = products.filter((p) => {
    // Search
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match = p.name.toLowerCase().includes(q) || p.category.toLowerCase().includes(q);
      if (!match) return false;
    }

    // Category
    if (categoryFilter !== 'all' && p.category !== categoryFilter) {
      return false;
    }

    // Tab state
    if (activeTab === 'active') return p.isActive && p.stock > 0;
    if (activeTab === 'inactive') return !p.isActive || p.stock === 0;
    if (activeTab === 'critical') {
      return p.stock > 0 && p.discountPercentage >= 70;
    }

    return true;
  });

  const handleOpenAdd = () => {
    setEditingProduct(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (p: SisaPiringProduct) => {
    setEditingProduct(p);
    setIsModalOpen(true);
  };

  const handleSaveProduct = (formData: any) => {
    if (editingProduct) {
      updateProduct(editingProduct.id, formData);
    } else {
      addProduct(formData);
    }
  };

  const confirmDelete = () => {
    if (deletingProductId) {
      deleteProduct(deletingProductId);
      setDeletingProductId(null);
    }
  };

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-[#1F281A] tracking-tight">
            Katalog Produk Sisa Piring
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Kelola menu sisa piring harian, stok tersedia, dan deklarasi keamanan pangan untuk pembeli di Bandung.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAdd}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#f89254] hover:bg-[#e57d3d] text-white text-xs font-bold rounded-xl transition-colors shadow-xs shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Produk Sisa Piring</span>
        </button>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-neutral-200 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Segmented Filter Tabs */}
          <div className="flex items-center gap-1 p-1 bg-neutral-100 rounded-xl overflow-x-auto">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${activeTab === 'all'
                  ? 'bg-white text-[#1F281A] shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900'
                }`}
            >
              Semua ({products.length})
            </button>
            <button
              onClick={() => setActiveTab('active')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${activeTab === 'active'
                  ? 'bg-white text-[#1F281A] shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900'
                }`}
            >
              Aktif ({products.filter((p) => p.isActive && p.stock > 0).length})
            </button>
            <button
              onClick={() => setActiveTab('critical')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${activeTab === 'critical'
                  ? 'bg-white text-[#f89254] shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900'
                }`}
            >
              Rescue Prioritas ({products.filter((p) => p.stock > 0 && p.discountPercentage >= 70).length})
            </button>
            <button
              onClick={() => setActiveTab('inactive')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap ${activeTab === 'inactive'
                  ? 'bg-white text-neutral-800 shadow-xs'
                  : 'text-neutral-600 hover:text-neutral-900'
                }`}
            >
              Habis / Nonaktif ({products.filter((p) => !p.isActive || p.stock === 0).length})
            </button>
          </div>

          {/* Search & Category Filter */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1 md:w-64">
              <Search className="w-4 h-4 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari nama produk..."
                className="w-full pl-9 pr-3 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#1F281A]"
              />
            </div>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:outline-none focus:ring-1 focus:ring-[#1F281A]"
            >
              <option value="all">Semua Kategori</option>
              <option value="Bakery & Roti">Bakery & Roti</option>
              <option value="Katering & Nasi Kotak">Katering & Nasi Kotak</option>
              <option value="Cafe & Minuman">Cafe & Minuman</option>
              <option value="Kue & Pastry">Kue & Pastry</option>
              <option value="Resto & Makanan Berat">Resto & Makanan Berat</option>
            </select>
          </div>
        </div>
      </div>

      {/* Product List: Responsive Table for Desktop, Cards for Mobile */}
      {filteredProducts.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-neutral-200 shadow-xs space-y-3">
          <div className="w-12 h-12 bg-neutral-100 rounded-full flex items-center justify-center mx-auto text-neutral-400">
            <Package className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-neutral-800">Tidak ada produk ditemukan</h3>
          <p className="text-xs text-neutral-500 max-w-sm mx-auto">
            {searchQuery
              ? `Tidak ada produk yang cocok dengan "${searchQuery}". Coba kata kunci lain.`
              : 'Belum ada produk sisa piring yang masuk dalam filter ini.'}
          </p>
          <button
            type="button"
            onClick={handleOpenAdd}
            className="px-4 py-2 bg-[#1F281A] text-white text-xs font-semibold rounded-xl hover:bg-[#2D3A26] transition-colors"
          >
            Terbitkan Produk Baru
          </button>
        </div>
      ) : (
        <>
          {/* Desktop Table View */}
          <div className="hidden lg:block bg-white rounded-2xl border border-neutral-200 shadow-xs overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-500 font-semibold uppercase tracking-wider">
                <tr>
                  <th className="py-3.5 px-4">Produk & Kategori</th>
                  <th className="py-3.5 px-4 text-right">Harga Normal</th>
                  <th className="py-3.5 px-4 text-center">Diskon Rescue</th>
                  <th className="py-3.5 px-4 text-right">Harga Final</th>
                  <th className="py-3.5 px-4 text-center">Stok</th>
                  <th className="py-3.5 px-4">Batas Konsumsi & Pickup</th>
                  <th className="py-3.5 px-4 text-center">Food Safety</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-100">
                {filteredProducts.map((p) => {
                  const isCritical = p.discountPercentage >= 70;
                  return (
                    <tr key={p.id} className="hover:bg-neutral-50/70 transition-colors">
                      {/* Product Name & Photo */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <img
                            src={p.image}
                            alt={p.name}
                            className="w-11 h-11 rounded-xl object-cover border border-neutral-200 shrink-0"
                            referrerPolicy="no-referrer"
                          />
                          <div className="min-w-0 max-w-[220px]">
                            <p className="font-bold text-neutral-800 truncate" title={p.name}>
                              {p.name}
                            </p>
                            <div className="flex items-center gap-1.5 text-[11px] text-neutral-500 mt-0.5">
                              <span>{p.category}</span>
                              <span>·</span>
                              <span className="font-mono text-[10px] text-neutral-400">{p.id}</span>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Original Price */}
                      <td className="py-3.5 px-4 text-right font-mono text-neutral-400 line-through">
                        {formatRupiah(p.originalPrice)}
                      </td>

                      {/* Discount Percentage */}
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className={`font-mono font-bold text-xs px-2 py-0.5 rounded ${p.discountPercentage === 100
                              ? 'bg-[#1F281A] text-[#fbe1b5]'
                              : isCritical
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                        >
                          {p.discountPercentage === 100 ? 'Donasi 100%' : `${p.discountPercentage}% OFF`}
                        </span>
                      </td>

                      {/* Final Price */}
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-[#1F281A] text-sm">
                        {p.discountedPrice === 0 ? 'Bebas Bayar' : formatRupiah(p.discountedPrice)}
                      </td>

                      {/* Stock Adjuster */}
                      <td className="py-3.5 px-4 text-center">
                        <div className="inline-flex items-center gap-1.5 bg-neutral-100 rounded-lg p-1 border border-neutral-200">
                          <button
                            type="button"
                            onClick={() => updateStock(p.id, -1)}
                            disabled={p.stock <= 0}
                            className="w-5 h-5 flex items-center justify-center rounded bg-white text-neutral-700 font-bold hover:bg-neutral-200 disabled:opacity-40"
                          >
                            -
                          </button>
                          <span className="w-7 text-center font-mono font-bold text-neutral-800">
                            {p.stock}
                          </span>
                          <button
                            type="button"
                            onClick={() => updateStock(p.id, 1)}
                            className="w-5 h-5 flex items-center justify-center rounded bg-white text-neutral-700 font-bold hover:bg-neutral-200"
                          >
                            +
                          </button>
                        </div>
                      </td>

                      {/* Safe time & pickup */}
                      <td className="py-3.5 px-4">
                        <div className="text-[11px] space-y-0.5">
                          <div className="flex items-center gap-1 text-neutral-700">
                            <Clock className="w-3 h-3 text-[#f89254] shrink-0" />
                            <span className="font-semibold">{p.safeConsumptionDeadline}</span>
                          </div>
                          <p className="text-neutral-500">
                            Pickup: {p.pickupScheduleStart} - {p.pickupScheduleEnd}
                          </p>
                        </div>
                      </td>

                      {/* Food Safety */}
                      <td className="py-3.5 px-4 text-center">
                        <span
                          className="inline-flex items-center gap-1 text-[11px] text-emerald-700 font-medium bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200"
                          title="5 Standar Keamanan Pangan Lengkap & Terverifikasi"
                        >
                          <ShieldCheck className="w-3.5 h-3.5" />
                          <span>5/5 Lulus</span>
                        </span>
                      </td>

                      {/* Status Toggle */}
                      <td className="py-3.5 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => toggleProductStatus(p.id)}
                          className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${p.isActive && p.stock > 0 ? 'bg-[#1F281A]' : 'bg-neutral-300'
                            }`}
                        >
                          <span
                            className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${p.isActive && p.stock > 0 ? 'translate-x-4' : 'translate-x-0.5'
                              }`}
                          />
                        </button>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(p)}
                            className="p-1.5 text-neutral-500 hover:text-neutral-900 rounded-lg hover:bg-neutral-100 transition-colors"
                            title="Edit Produk"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeletingProductId(p.id)}
                            className="p-1.5 text-neutral-500 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                            title="Hapus Produk"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile Responsive Cards View */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:hidden gap-3.5">
            {filteredProducts.map((p) => (
              <div
                key={p.id}
                className="bg-white rounded-2xl p-4 border border-neutral-200 shadow-xs space-y-3"
              >
                <div className="flex items-start gap-3">
                  <img
                    src={p.image}
                    alt={p.name}
                    className="w-16 h-16 rounded-xl object-cover border border-neutral-200 shrink-0"
                    referrerPolicy="no-referrer"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-[11px] text-neutral-500 uppercase tracking-wider font-semibold">
                        {p.category}
                      </span>
                      <span
                        className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded ${p.discountPercentage === 100
                            ? 'bg-[#1F281A] text-[#fbe1b5]'
                            : 'bg-[#f89254]/10 text-[#f89254]'
                          }`}
                      >
                        {p.discountPercentage === 100 ? 'Donasi 100%' : `${p.discountPercentage}% OFF`}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-neutral-800 line-clamp-1 mt-0.5">{p.name}</h4>
                    <div className="flex items-baseline gap-2 mt-1">
                      <span className="text-sm font-bold font-mono text-[#1F281A]">
                        {p.discountedPrice === 0 ? 'Bebas Bayar' : formatRupiah(p.discountedPrice)}
                      </span>
                      <span className="text-xs font-mono text-neutral-400 line-through">
                        {formatRupiah(p.originalPrice)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="pt-2 border-t border-neutral-100 flex items-center justify-between text-xs text-neutral-600">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-[#f89254]" />
                    <span>Aman s/d: {p.safeConsumptionDeadline}</span>
                  </div>

                  <div className="flex items-center gap-1 bg-neutral-100 rounded-lg p-0.5">
                    <button
                      type="button"
                      onClick={() => updateStock(p.id, -1)}
                      disabled={p.stock <= 0}
                      className="w-5 h-5 flex items-center justify-center rounded bg-white text-xs font-bold disabled:opacity-40"
                    >
                      -
                    </button>
                    <span className="font-mono font-bold px-1.5">{p.stock}</span>
                    <button
                      type="button"
                      onClick={() => updateStock(p.id, 1)}
                      className="w-5 h-5 flex items-center justify-center rounded bg-white text-xs font-bold"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-neutral-100">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => toggleProductStatus(p.id)}
                      className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${p.isActive && p.stock > 0 ? 'bg-[#1F281A]' : 'bg-neutral-300'
                        }`}
                    >
                      <span
                        className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform ${p.isActive && p.stock > 0 ? 'translate-x-4' : 'translate-x-0.5'
                          }`}
                      />
                    </button>
                    <span className="text-[11px] text-neutral-500">
                      {p.isActive && p.stock > 0 ? 'Aktif' : 'Nonaktif'}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(p)}
                      className="p-1.5 text-neutral-600 hover:text-neutral-900 rounded-lg hover:bg-neutral-100"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeletingProductId(p.id)}
                      className="p-1.5 text-neutral-600 hover:text-red-600 rounded-lg hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* Product Add/Edit Modal */}
      <ProductFormModal
        isOpen={isModalOpen}
        initialProduct={editingProduct}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveProduct}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={!!deletingProductId}
        title="Hapus Produk Sisa Piring?"
        message="Produk ini akan dihapus dari etalase SisaPiring Bandung. Pelanggan tidak akan dapat memesan produk ini lagi."
        confirmLabel="Hapus Produk"
        cancelLabel="Batal"
        isDestructive={true}
        onConfirm={confirmDelete}
        onCancel={() => setDeletingProductId(null)}
      />
    </div>
  );
};
