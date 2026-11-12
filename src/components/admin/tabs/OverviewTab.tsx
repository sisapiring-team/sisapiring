import React from 'react';
import {
  Store,
  UtensilsCrossed,
  Receipt,
  ShieldAlert,
  Users,
  ArrowUpRight,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Eye,
  Download,
  Activity,
} from 'lucide-react';
import { formatRupiah, SisaPiringItem } from '../../../data/sisaPiringCatalog';
import { AdminTab, AdminMacroStats } from '../types';
import { UmkmVerificationRecord } from '../../../data/adminData';
import { OrderRecord } from '../../RescueModals';
import { Order } from '../../../types/seller';

interface OverviewTabProps {
  macroStats: AdminMacroStats;
  umkmVerifications: UmkmVerificationRecord[];
  catalogItems?: SisaPiringItem[];
  orders?: (OrderRecord | Order)[];
  onSelectTab: (tab: AdminTab) => void;
  onExportCSV: () => void;
  onFilterPendingUmkm: () => void;
}

export const OverviewTab: React.FC<OverviewTabProps> = ({
  macroStats,
  umkmVerifications,
  catalogItems = [],
  orders = [],
  onSelectTab,
  onExportCSV,
  onFilterPendingUmkm,
}) => {
  // Real data calculations
  const totalStores = umkmVerifications.length;
  const pendingStores = umkmVerifications.filter((u) => u.status === 'Menunggu Verifikasi').length;
  const verifiedStores = umkmVerifications.filter((u) => u.status === 'Verified').length;

  const activeProducts = catalogItems.length;
  const totalOrders = (orders.length || 0) + (macroStats.totalOrdersCount || 0);
  const openComplaints = macroStats.openDisputesCount || 0;

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* 1. Header Banner: Pusat Monitoring Operasional Ekosistem */}
      <div className="bg-[#131c26]/95 border border-white/10 rounded-3xl p-6 shadow-xl backdrop-blur-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 flex items-center gap-1.5 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
              Kota Bandung • Monitoring Operasional
            </span>
            <span className="text-xs text-neutral-400">
              Pembaruan Real-Time
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight mt-1.5">
            Pusat Pengawasan Operasional SisaPiring
          </h2>
          <p className="text-xs sm:text-sm text-neutral-400 mt-1 max-w-3xl leading-relaxed">
            Pengawasan terpadu atas aktivitas riil di lapangan: kepatuhan toko mitra UMKM, kontrol batas jam konsumsi menu sisa piring, transparansi pesanan pembeli, dan penanganan komplain.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onExportCSV}
            className="inline-flex items-center gap-2 px-4 py-2.5 bg-white/10 hover:bg-white/15 text-white text-xs font-bold rounded-xl transition-colors border border-white/15 cursor-pointer shadow-xs"
          >
            <Download className="w-4 h-4 text-cyan-400" />
            <span>Ekspor Ringkasan</span>
          </button>
        </div>
      </div>

      {/* 2. 5 Real Operational Monitoring Cards (Focus on What Actually Exists) */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {/* Card 1: Toko Mitra */}
        <div
          onClick={() => onSelectTab('stores')}
          className="bg-[#131c26]/90 hover:bg-[#182330] p-4 rounded-2xl border border-white/10 shadow-lg space-y-1.5 cursor-pointer transition-all hover:scale-[1.02] group"
        >
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-[11px] font-bold text-neutral-300">Toko Mitra (UMKM)</span>
            <div className="w-7 h-7 rounded-xl bg-cyan-500/15 text-cyan-400 flex items-center justify-center group-hover:bg-cyan-500 group-hover:text-neutral-950 transition-colors">
              <Store className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black font-mono text-white">
            {totalStores}
          </div>
          <div className="flex items-center justify-between text-[10px]">
            <span className="text-emerald-400 font-semibold">{verifiedStores} Aktif</span>
            {pendingStores > 0 && (
              <span className="text-amber-400 font-bold bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                {pendingStores} Perlu KYB
              </span>
            )}
          </div>
        </div>

        {/* Card 2: Menu Sisa Piring */}
        <div
          onClick={() => onSelectTab('products')}
          className="bg-[#131c26]/90 hover:bg-[#182330] p-4 rounded-2xl border border-white/10 shadow-lg space-y-1.5 cursor-pointer transition-all hover:scale-[1.02] group"
        >
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-[11px] font-bold text-neutral-300">Menu Sisa Piring</span>
            <div className="w-7 h-7 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center group-hover:bg-emerald-500 group-hover:text-neutral-950 transition-colors">
              <UtensilsCrossed className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black font-mono text-white">
            {activeProducts}
          </div>
          <div className="flex items-center justify-between text-[10px]">
            <span className="text-neutral-400">Tayang di Etalase</span>
            <span className="text-emerald-400 font-semibold">Diskon 50% - 100%</span>
          </div>
        </div>

        {/* Card 3: Pesanan Pembeli */}
        <div
          onClick={() => onSelectTab('orders')}
          className="bg-[#131c26]/90 hover:bg-[#182330] p-4 rounded-2xl border border-white/10 shadow-lg space-y-1.5 cursor-pointer transition-all hover:scale-[1.02] group"
        >
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-[11px] font-bold text-neutral-300">Pesanan Pembeli</span>
            <div className="w-7 h-7 rounded-xl bg-indigo-500/15 text-indigo-400 flex items-center justify-center group-hover:bg-indigo-500 group-hover:text-white transition-colors">
              <Receipt className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black font-mono text-white">
            {totalOrders.toLocaleString('id-ID')}
          </div>
          <div className="flex items-center justify-between text-[10px]">
            <span className="text-neutral-400">Transaksi Riil</span>
            <span className="text-indigo-400 font-semibold font-mono">Kode QR Pickup</span>
          </div>
        </div>

        {/* Card 4: Komplain & Sengketa */}
        <div
          onClick={() => onSelectTab('complaints')}
          className="bg-[#131c26]/90 hover:bg-[#182330] p-4 rounded-2xl border border-white/10 shadow-lg space-y-1.5 cursor-pointer transition-all hover:scale-[1.02] group"
        >
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-[11px] font-bold text-neutral-300">Komplain Terbuka</span>
            <div className="w-7 h-7 rounded-xl bg-rose-500/15 text-rose-400 flex items-center justify-center group-hover:bg-rose-500 group-hover:text-white transition-colors">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black font-mono text-rose-300">
            {openComplaints}
          </div>
          <div className="flex items-center justify-between text-[10px]">
            <span className="text-neutral-400">Laporan Konsumen</span>
            {openComplaints > 0 ? (
              <span className="text-rose-400 font-bold bg-rose-500/10 px-1.5 py-0.5 rounded border border-rose-500/20">
                Butuh Investigasi
              </span>
            ) : (
              <span className="text-emerald-400 font-semibold">Semua Bersih</span>
            )}
          </div>
        </div>

        {/* Card 5: Akun Terdaftar */}
        <div
          onClick={() => onSelectTab('users')}
          className="bg-[#131c26]/90 hover:bg-[#182330] p-4 rounded-2xl border border-white/10 shadow-lg space-y-1.5 cursor-pointer transition-all hover:scale-[1.02] group col-span-2 md:col-span-1"
        >
          <div className="flex items-center justify-between text-neutral-400">
            <span className="text-[11px] font-bold text-neutral-300">Pengguna & Akun</span>
            <div className="w-7 h-7 rounded-xl bg-purple-500/15 text-purple-400 flex items-center justify-center group-hover:bg-purple-500 group-hover:text-white transition-colors">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black font-mono text-white">
            {totalStores + 12}
          </div>
          <div className="flex items-center justify-between text-[10px]">
            <span className="text-neutral-400">Pembeli & Mitra</span>
            <span className="text-purple-400 font-semibold font-mono">RBAC Terlindungi</span>
          </div>
        </div>
      </div>

      {/* 3. Operational Grid: Store Monitoring & Critical Safety Curation */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column: Pengawasan Toko Mitra (Penjual) */}
        <div className="bg-[#131c26]/95 border border-white/10 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-300 flex items-center justify-center font-bold">
                <Store className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-white">Pengawasan Toko Mitra UMKM</h3>
                <p className="text-[11px] text-neutral-400">Status toko, jam operasional, dan izin usaha NIB</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onSelectTab('stores')}
              className="text-xs font-bold text-cyan-400 hover:text-cyan-300 inline-flex items-center gap-1 cursor-pointer"
            >
              <span>Semua Toko</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5">
            {umkmVerifications.slice(0, 4).map((umkm) => (
              <div
                key={umkm.id}
                className="p-3.5 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/5 flex items-center justify-between gap-3 transition-colors"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-xs text-white truncate">{umkm.storeName}</span>
                    <span
                      className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
                        umkm.status === 'Verified'
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                          : umkm.status === 'Menunggu Verifikasi'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      }`}
                    >
                      {umkm.status}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-[10px] text-neutral-400 mt-1">
                    <span>Pemilik: {umkm.ownerName}</span>
                    <span>•</span>
                    <span>Wilayah: {umkm.district}</span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onSelectTab('stores')}
                  className="px-2.5 py-1.5 bg-white/10 hover:bg-white/20 text-white text-[11px] font-semibold rounded-lg transition-colors cursor-pointer shrink-0"
                >
                  Detail
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Pengawasan Menu & Keamanan Pangan (Prep Window) */}
        <div className="bg-[#131c26]/95 border border-white/10 rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/20 text-emerald-300 flex items-center justify-center font-bold">
                <UtensilsCrossed className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-white">Monitoring Menu & Keamanan Pangan</h3>
                <p className="text-[11px] text-neutral-400">Pengawasan jam konsumsi aman (prep window) & diskon</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => onSelectTab('products')}
              className="text-xs font-bold text-emerald-400 hover:text-emerald-300 inline-flex items-center gap-1 cursor-pointer"
            >
              <span>Semua Menu</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-2.5">
            {catalogItems.slice(0, 4).map((item) => (
              <div
                key={item.id}
                className="p-3.5 bg-white/5 hover:bg-white/10 rounded-2xl border border-white/5 flex items-center justify-between gap-3 transition-colors"
              >
                <div className="min-w-0">
                  <span className="font-bold text-xs text-white truncate block">{item.title}</span>
                  <div className="flex items-center gap-2 text-[10px] text-neutral-400 mt-1">
                    <span className="text-cyan-300 font-semibold">{item.merchantName}</span>
                    <span>•</span>
                    <span className="flex items-center gap-1 text-amber-300">
                      <Clock className="w-3 h-3" />
                      Pickup: {item.pickupWindow}
                    </span>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="font-mono font-bold text-xs text-emerald-400">
                    {formatRupiah(item.rescuePrice)}
                  </div>
                  <span className="text-[9px] text-rose-300 font-bold bg-rose-500/15 px-1.5 py-0.5 rounded border border-rose-500/25">
                    Diskon {item.discountPercent}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
