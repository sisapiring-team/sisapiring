import React from 'react';
import {
  Download,
  ShoppingBag,
  Leaf,
  TrendingUp,
  Droplets,
  Coins,
  Receipt,
  Store,
  ArrowUpRight,
  MapPin,
} from 'lucide-react';
import { formatRupiah } from '../../../data/sisaPiringCatalog';
import { AdminTab, AdminMacroStats } from '../types';
import { UmkmVerificationRecord } from '../../../data/adminData';

interface OverviewTabProps {
  macroStats: AdminMacroStats;
  umkmVerifications: UmkmVerificationRecord[];
  onSelectTab: (tab: AdminTab) => void;
  onExportCSV: () => void;
  onFilterPendingUmkm: () => void;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({
  macroStats,
  umkmVerifications,
  onSelectTab,
  onExportCSV,
  onFilterPendingUmkm,
}) => {
  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Welcome & Ecosystem Health Banner */}
      <div className="bg-white rounded-3xl p-6 border border-neutral-200/80 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800">
              Kota Bandung • Real-Time
            </span>
            <span className="text-xs text-neutral-400">
              Periode: {macroStats.period.periodLabel}
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-neutral-900 mt-1">
            Pusat Pengawasan Ekosistem SisaPiring
          </h2>
          <p className="text-xs sm:text-sm text-neutral-600 mt-1">
            Sinkronisasi menyeluruh antara transaksi konsumen, katalog sisa piring mitra UMKM, dan kepatuhan standar higienitas.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onExportCSV}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-neutral-900 hover:bg-neutral-800 text-white text-xs font-bold rounded-xl transition-colors shadow-xs cursor-pointer"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>Ekspor Laporan CSV</span>
          </button>
        </div>
      </div>

      {/* 6 Key Macro Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <div className="bg-white p-4 rounded-2xl border border-neutral-200/80 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-[11px] font-semibold">Porsi Diselamatkan</span>
            <ShoppingBag className="w-4 h-4 text-emerald-700" />
          </div>
          <div className="text-xl font-black font-mono text-[#16382C]">
            {macroStats.totalRescuedPortions.toLocaleString('id-ID')}
          </div>
          <span className="text-[10px] text-emerald-600 font-semibold block">+12.4% minggu ini</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-neutral-200/80 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-[11px] font-semibold">Sampah Pangan Dicegah</span>
            <Leaf className="w-4 h-4 text-emerald-700" />
          </div>
          <div className="text-xl font-black font-mono text-neutral-900">
            {macroStats.period.foodWastePreventedKg.toLocaleString('id-ID')} <span className="text-xs">kg</span>
          </div>
          <span className="text-[10px] text-neutral-500 block">TPA Sarimukti</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-neutral-200/80 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-[11px] font-semibold">Reduksi Gas CO2e</span>
            <TrendingUp className="w-4 h-4 text-emerald-700" />
          </div>
          <div className="text-xl font-black font-mono text-emerald-800">
            {macroStats.period.co2EmissionsSavedKg.toLocaleString('id-ID')} <span className="text-xs">kg</span>
          </div>
          <span className="text-[10px] text-neutral-500 block">Gas Metana Tercegah</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-neutral-200/80 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-[11px] font-semibold">Air Bersih Terlindungi</span>
            <Droplets className="w-4 h-4 text-sky-600" />
          </div>
          <div className="text-xl font-black font-mono text-sky-800">
            {macroStats.period.waterSavedLiters.toLocaleString('id-ID')} <span className="text-xs">L</span>
          </div>
          <span className="text-[10px] text-neutral-500 block">Virtual Water Footprint</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-neutral-200/80 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-[11px] font-semibold">Omzet UMKM Pulih</span>
            <Coins className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-xl font-black font-mono text-[#16382C]">
            {formatRupiah(macroStats.period.umkmRevenueRecovered)}
          </div>
          <span className="text-[10px] text-emerald-600 font-semibold block">Dipulihkan ke Pedagang</span>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-neutral-200/80 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-[11px] font-semibold">Dana Escrow Aktif</span>
            <Receipt className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-xl font-black font-mono text-indigo-900">
            {formatRupiah(macroStats.totalEscrowHeld)}
          </div>
          <span className="text-[10px] text-indigo-600 font-semibold block">Terlindungi Pembeli</span>
        </div>
      </div>

      {/* Ecosystem Balance Grid: User Needs vs Seller Needs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Sisi Mitra UMKM (Penjual) */}
        <div className="bg-white rounded-3xl p-6 border border-neutral-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold">
                <Store className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-neutral-900">Sisi Mitra UMKM (Penjual)</h3>
                <p className="text-[11px] text-neutral-500">Legalitas, prep window, dan pelepasan dana penjualan</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onSelectTab('seller-governance')}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 inline-flex items-center gap-1 cursor-pointer"
            >
              <span>Kelola Mitra</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            <div className="p-3.5 bg-neutral-50 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-neutral-800 block">
                  Mitra Aktif & Terverifikasi
                </span>
                <span className="text-[11px] text-neutral-500">
                  {umkmVerifications.filter((u) => u.status === 'Verified').length} Gerai Resmi di 5 Kecamatan
                </span>
              </div>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                Sesuai Standar
              </span>
            </div>

            <div className="p-3.5 bg-neutral-50 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-neutral-800 block">
                  Pengajuan KYB Menunggu Review
                </span>
                <span className="text-[11px] text-neutral-500">
                  {macroStats.pendingUmkmCount} UMKM baru mendaftar NIB & Halal
                </span>
              </div>
              <button
                type="button"
                onClick={onFilterPendingUmkm}
                className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-amber-500 hover:bg-amber-600 text-white cursor-pointer"
              >
                Tinjau Sekarang
              </button>
            </div>

            <div className="p-3.5 bg-neutral-50 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-neutral-800 block">
                  Menu Sisa Piring Tayang
                </span>
                <span className="text-[11px] text-neutral-500">
                  {macroStats.activeProductsCount} menu dalam pengawasan prep window
                </span>
              </div>
              <button
                type="button"
                onClick={() => onSelectTab('product-curation')}
                className="text-xs font-bold text-emerald-700 hover:underline cursor-pointer"
              >
                Buka Kurasi
              </button>
            </div>
          </div>
        </div>

        {/* Right Column: Sisi Konsumen (Pembeli) */}
        <div className="bg-white rounded-3xl p-6 border border-neutral-200/80 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center font-bold">
                <ShoppingBag className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-neutral-900">Sisi Konsumen (Pembeli)</h3>
                <p className="text-[11px] text-neutral-500">Pesanan, kepuasan ulasan, dan jaminan refund komplain</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onSelectTab('disputes-refund')}
              className="text-xs font-bold text-emerald-700 hover:text-emerald-800 inline-flex items-center gap-1 cursor-pointer"
            >
              <span>Pusat Komplain</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            <div className="p-3.5 bg-neutral-50 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-neutral-800 block">
                  Pesanan Masuk & Serah Terima
                </span>
                <span className="text-[11px] text-neutral-500">
                  {macroStats.totalOrdersCount} pesanan konsumen telah terintegrasi
                </span>
              </div>
              <button
                type="button"
                onClick={() => onSelectTab('order-escrow')}
                className="text-xs font-bold text-emerald-700 hover:underline cursor-pointer"
              >
                Cek Pesanan
              </button>
            </div>

            <div className="p-3.5 bg-neutral-50 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-neutral-800 block">
                  Tiket Komplain & Proteksi Refund
                </span>
                <span className="text-[11px] text-neutral-500">
                  {macroStats.openDisputesCount} tiket membutuhkan resolusi cepat
                </span>
              </div>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${macroStats.openDisputesCount > 0
                    ? 'bg-rose-100 text-rose-800 font-bold'
                    : 'bg-emerald-100 text-emerald-800'
                  }`}
              >
                {macroStats.openDisputesCount > 0 ? 'Perlu Ditindak' : 'Semua Beres'}
              </span>
            </div>

            <div className="p-3.5 bg-neutral-50 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-neutral-800 block">
                  Indeks Kepuasan Konsumen
                </span>
                <span className="text-[11px] text-neutral-500">
                  Rata-rata 4.8 / 5.0 dari ulasan pembeli Bandung
                </span>
              </div>
              <button
                type="button"
                onClick={() => onSelectTab('reviews-moderation')}
                className="text-xs font-bold text-emerald-700 hover:underline cursor-pointer"
              >
                Buka Ulasan
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* District Breakdown Table */}
      <div className="bg-white rounded-3xl p-6 border border-neutral-200/80 shadow-xs space-y-4">
        <div>
          <h3 className="font-bold text-sm text-neutral-900">
            Sebaran Penyelamatan Pangan Per Kecamatan di Kota Bandung
          </h3>
          <p className="text-xs text-neutral-500 mt-0.5">
            Memantau serapan konsumsi warga dan kontribusi UMKM di wilayah Bandung
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-neutral-200 text-neutral-400 font-semibold uppercase text-[10px]">
                <th className="py-3 px-3">Kecamatan</th>
                <th className="py-3 px-3">Porsi Diselamatkan</th>
                <th className="py-3 px-3">Sampah Dicegah</th>
                <th className="py-3 px-3">Reduksi CO2</th>
                <th className="py-3 px-3">Air Bersih</th>
                <th className="py-3 px-3">Mitra Aktif</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100 text-neutral-700">
              {macroStats.period.districtStats.map((d) => (
                <tr key={d.district} className="hover:bg-neutral-50/70 transition-colors">
                  <td className="py-3 px-3 font-bold text-neutral-900 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-emerald-700" />
                    <span>{d.district}</span>
                  </td>
                  <td className="py-3 px-3 font-mono font-bold text-[#16382C]">
                    {d.portionsRescued.toLocaleString('id-ID')} porsi
                  </td>
                  <td className="py-3 px-3 font-mono">{d.wasteReducedKg.toLocaleString('id-ID')} kg</td>
                  <td className="py-3 px-3 font-mono text-emerald-700 font-semibold">
                    {Math.round(d.portionsRescued * 0.45).toLocaleString('id-ID')} kg
                  </td>
                  <td className="py-3 px-3 font-mono text-sky-700">
                    {Math.round(d.portionsRescued * 62).toLocaleString('id-ID')} L
                  </td>
                  <td className="py-3 px-3 font-semibold">
                    {d.activeUmkm} Gerai <span className="text-[10px] text-neutral-400">({d.participationRate}%)</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

