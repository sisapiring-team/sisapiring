import React from 'react';
import {
  Search,
  Clock,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Ban,
} from 'lucide-react';
import { ResilientImage } from '../../ResilientImage';
import { SisaPiringItem, formatRupiah } from '../../../data/sisaPiringCatalog';
import {
  ProductMonitoringMeta,
  ProductMonitoringStatus,
} from '../../../data/adminData';

interface ProductCurationTabProps {
  displayProducts: SisaPiringItem[];
  productMonitoring: Record<string, ProductMonitoringMeta>;
  productStatusFilter: 'all' | ProductMonitoringStatus;
  onStatusFilterChange: (status: 'all' | ProductMonitoringStatus) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onRestoreProduct: (itemId: string, title: string) => void;
  onRequestTakedown: (item: SisaPiringItem) => void;
}

export const ProductCurationTab: React.FC<ProductCurationTabProps> = ({
  displayProducts,
  productMonitoring,
  productStatusFilter,
  onStatusFilterChange,
  searchQuery,
  onSearchChange,
  onRestoreProduct,
  onRequestTakedown,
}) => {
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-neutral-900 tracking-tight">
            Kurasi Menu & Keamanan Pangan (Sisi Penjual & User)
          </h2>
          <p className="text-xs text-neutral-500 mt-0.5">
            Awasi seluruh menu sisa piring yang diunggah UMKM. Nonaktifkan (Take Down) produk bermasalah secara instan dari etalase pembeli.
          </p>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-neutral-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Cari menu, mitra, kategori..."
              className="pl-8 pr-3 py-2 text-xs bg-white border border-neutral-200 rounded-xl focus:outline-none focus:border-emerald-700 w-52"
            />
          </div>

          <select
            value={productStatusFilter}
            onChange={(e) => onStatusFilterChange(e.target.value as any)}
            className="px-3 py-2 text-xs bg-white border border-neutral-200 rounded-xl focus:outline-none focus:border-emerald-700 font-semibold cursor-pointer"
          >
            <option value="all">Semua Status Menu</option>
            <option value="Aktif & Aman">Aktif & Aman (Tayang)</option>
            <option value="Dalam Tinjauan">Dalam Tinjauan</option>
            <option value="Take Down">Take Down (Dinonaktifkan)</option>
          </select>
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-white rounded-3xl border border-neutral-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-neutral-200 bg-neutral-50/70 text-neutral-400 font-semibold uppercase text-[10px]">
                <th className="py-3 px-4">Menu Sisa Piring</th>
                <th className="py-3 px-4">Mitra UMKM</th>
                <th className="py-3 px-4">Harga Normal vs Hemat</th>
                <th className="py-3 px-4">Stok Porsi</th>
                <th className="py-3 px-4">Batas Konsumsi (Prep Window)</th>
                <th className="py-3 px-4">Status Pengawasan</th>
                <th className="py-3 px-4 text-right">Aksi Kontrol</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 text-neutral-700">
              {displayProducts.map((item) => {
                const meta = productMonitoring[item.id] || {
                  monitoringStatus: 'Aktif & Aman',
                  reportCount: 0,
                };
                const isTakenDown = meta.monitoringStatus === 'Take Down';

                return (
                  <tr
                    key={item.id}
                    className={`hover:bg-neutral-50/70 transition-colors ${
                      isTakenDown ? 'bg-rose-50/40 opacity-80' : ''
                    }`}
                  >
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <ResilientImage
                          src={item.imageUrl}
                          alt={item.title}
                          className="w-11 h-11 rounded-xl object-cover border border-neutral-200 shrink-0"
                        />
                        <div>
                          <span className="font-bold text-neutral-900 block text-xs line-clamp-1">
                            {item.title}
                          </span>
                          <span className="text-[10px] text-neutral-400 block">
                            ID: {item.id} • {item.category}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-neutral-800 block text-xs">
                        {item.merchantName}
                      </span>
                      <span className="text-[11px] text-neutral-500 block">Kec. {item.district}</span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-baseline gap-1.5">
                        <span className="font-bold font-mono text-[#16382C] text-xs">
                          {formatRupiah(item.rescuePrice)}
                        </span>
                        <span className="line-through text-neutral-400 font-mono text-[11px]">
                          {formatRupiah(item.originalPrice)}
                        </span>
                      </div>
                      <span className="text-[10px] font-bold text-[#EE4D2D]">
                        Diskon {item.discountPercent}% OFF
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-bold font-mono text-neutral-900 text-xs">
                        {item.remainingStock} porsi
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5 text-neutral-700">
                        <Clock className="w-3.5 h-3.5 text-neutral-400" />
                        <span className="font-semibold text-[11px]">{item.pickupWindow}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          meta.monitoringStatus === 'Aktif & Aman'
                            ? 'bg-emerald-100 text-emerald-800'
                            : meta.monitoringStatus === 'Dalam Tinjauan'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {meta.monitoringStatus === 'Aktif & Aman' && (
                          <CheckCircle2 className="w-3 h-3 text-emerald-700" />
                        )}
                        {meta.monitoringStatus === 'Take Down' && (
                          <AlertTriangle className="w-3 h-3 text-rose-700" />
                        )}
                        <span>{meta.monitoringStatus}</span>
                      </span>
                      {meta.reportCount > 0 && (
                        <span className="block text-[10px] text-rose-600 font-semibold mt-0.5">
                          {meta.reportCount}x Laporan Pembeli
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {isTakenDown ? (
                        <button
                          type="button"
                          onClick={() => onRestoreProduct(item.id, item.title)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-100 hover:bg-emerald-200 text-emerald-800 font-bold text-xs transition-colors cursor-pointer"
                        >
                          <RotateCcw className="w-3.5 h-3.5 text-emerald-700" />
                          <span>Pulihkan</span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          onClick={() => onRequestTakedown(item)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs transition-colors border border-rose-200 cursor-pointer"
                        >
                          <Ban className="w-3.5 h-3.5 text-rose-600" />
                          <span>Take Down</span>
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
