import React, { useState } from 'react';
import {
  TrendingUp,
  Leaf,
  ShoppingBag,
  Award,
  Download,
  Calendar,
  ArrowUpRight,
  Sparkles,
} from 'lucide-react';
import { formatRupiah, calculateCO2Saved } from '../../utils/formatters';
import { useApp } from '../../context/AppContext';

export const SalesAnalyticsView: React.FC = () => {
  const { products, orders, sellerProfile, showToast } = useApp();

  const [period, setPeriod] = useState<'week' | 'month' | 'year'>('month');

  const completedOrders = orders.filter((o) => o.status === 'completed');
  const totalSales = completedOrders.reduce((acc, o) => acc + o.totalPayment, 0);
  const totalTransactions = completedOrders.length;

  const totalPortions = products.reduce((acc, p) => acc + p.portionsRescuedCount, 0);

  // Weekly trend data for clean SVG visualization
  const weeklyData = [
    { day: 'Sen', amount: 145000, portions: 8 },
    { day: 'Sel', amount: 190000, portions: 11 },
    { day: 'Rab', amount: 220000, portions: 14 },
    { day: 'Kam', amount: 185000, portions: 10 },
    { day: 'Jum', amount: 310000, portions: 18 },
    { day: 'Sab', amount: 420000, portions: 25 },
    { day: 'Min', amount: 380000, portions: 22 },
  ];

  const maxAmount = Math.max(...weeklyData.map((d) => d.amount));

  const handleExport = () => {
    showToast(
      'Laporan Berhasil Diunduh',
      `Laporan dampak food rescue ${sellerProfile.businessName} periode ${period} telah diekspor (CSV/PDF).`,
      'success'
    );
  };

  // Top products sorted by portions rescued
  const topProducts = [...products].sort((a, b) => b.portionsRescuedCount - a.portionsRescuedCount);

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-[#16382C] tracking-tight">
            Statistik Penjualan & Dampak Pangan
          </h1>
          <p className="text-xs text-neutral-500 mt-1">
            Transparansi omzet surplus dan kontribusi nyata UMKM terhadap pengurangan limbah makanan di Kota Bandung.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Period selector */}
          <div className="flex items-center bg-white border border-neutral-200 rounded-xl p-1 text-xs font-semibold">
            <button
              onClick={() => setPeriod('week')}
              className={`px-3 py-1 rounded-lg transition-colors ${
                period === 'week' ? 'bg-[#16382C] text-white shadow-xs' : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              7 Hari
            </button>
            <button
              onClick={() => setPeriod('month')}
              className={`px-3 py-1 rounded-lg transition-colors ${
                period === 'month' ? 'bg-[#16382C] text-white shadow-xs' : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              Bulan Ini
            </button>
            <button
              onClick={() => setPeriod('year')}
              className={`px-3 py-1 rounded-lg transition-colors ${
                period === 'year' ? 'bg-[#16382C] text-white shadow-xs' : 'text-neutral-600 hover:text-neutral-900'
              }`}
            >
              Tahun 2026
            </button>
          </div>

          <button
            type="button"
            onClick={handleExport}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-xs font-semibold rounded-xl border border-neutral-200 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Ekspor Data</span>
          </button>
        </div>
      </div>

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 md:gap-4">
        {/* Total Sales */}
        <div className="bg-white rounded-2xl p-5 border border-neutral-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-neutral-500">
            <span className="text-xs font-semibold">Total Omzet Rescue</span>
            <TrendingUp className="w-4 h-4 text-emerald-700" />
          </div>
          <p className="text-2xl md:text-3xl font-bold font-mono text-[#16382C]">
            {formatRupiah(totalSales)}
          </p>
          <div className="flex items-center gap-1 text-[11px] text-emerald-700 font-semibold">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>+24.8% dari bulan lalu</span>
          </div>
        </div>

        {/* Completed Transactions */}
        <div className="bg-white rounded-2xl p-5 border border-neutral-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-neutral-500">
            <span className="text-xs font-semibold">Transaksi Berhasil</span>
            <ShoppingBag className="w-4 h-4 text-[#EE4D2D]" />
          </div>
          <p className="text-2xl md:text-3xl font-bold font-mono text-neutral-900">
            {totalTransactions}
          </p>
          <p className="text-[11px] text-neutral-500">Penjemputan selesai diverifikasi</p>
        </div>

        {/* Portions Rescued */}
        <div className="bg-white rounded-2xl p-5 border border-neutral-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-neutral-500">
            <span className="text-xs font-semibold">Porsi Makanan Diselamatkan</span>
            <Leaf className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl md:text-3xl font-bold font-mono text-emerald-800">
            {totalPortions}
          </p>
          <p className="text-[11px] text-emerald-700 font-semibold">Porsi kuliner layak konsumsi</p>
        </div>

        {/* CO2 Emissions Saved */}
        <div className="bg-white rounded-2xl p-5 border border-neutral-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between text-neutral-500">
            <span className="text-xs font-semibold">Pencegahan Emisi Karbon</span>
            <Award className="w-4 h-4 text-[#FFD230]" />
          </div>
          <p className="text-2xl md:text-3xl font-bold font-mono text-[#16382C]">
            {calculateCO2Saved(totalPortions)}
          </p>
          <p className="text-[11px] text-neutral-500">Dihindari dari TPA Sarimukti</p>
        </div>
      </div>

      {/* Clean SVG Trend Chart */}
      <div className="bg-white rounded-2xl p-5 md:p-6 border border-neutral-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-[#16382C]">Tren Penjualan Surplus Mingguan</h3>
            <p className="text-xs text-neutral-500">
              Puncak transaksi penjemputan warga biasanya terjadi pada akhir pekan (Jumat–Minggu)
            </p>
          </div>
          <div className="text-right text-xs">
            <span className="text-neutral-400">Rata-rata Harian:</span>{' '}
            <strong className="font-mono text-[#16382C]">Rp 264 rb</strong>
          </div>
        </div>

        {/* SVG Bar Chart */}
        <div className="pt-4 pb-2">
          <div className="h-48 flex items-end justify-between gap-2 sm:gap-6 px-2">
            {weeklyData.map((d, idx) => {
              const heightPct = Math.round((d.amount / maxAmount) * 100);
              return (
                <div key={idx} className="flex-1 flex flex-col items-center gap-2 group">
                  <div className="text-[10px] font-mono text-neutral-500 opacity-0 group-hover:opacity-100 transition-opacity">
                    {formatRupiah(d.amount)}
                  </div>
                  <div className="w-full max-w-[48px] bg-neutral-100 rounded-t-xl overflow-hidden flex items-end h-36">
                    <div
                      style={{ height: `${heightPct}%` }}
                      className="w-full bg-[#16382C] group-hover:bg-[#EE4D2D] transition-all rounded-t-lg"
                    />
                  </div>
                  <span className="text-xs font-semibold text-neutral-700">{d.day}</span>
                  <span className="text-[10px] font-mono text-neutral-400">{d.portions} porsi</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Top Rescued Products Table */}
      <div className="bg-white rounded-2xl p-5 md:p-6 border border-neutral-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-[#16382C]">Produk Paling Banyak Terselamatkan</h3>
            <p className="text-xs text-neutral-500">
              Peringkat menu surplus yang paling diminati oleh warga Kota Bandung
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-neutral-50 border-b border-neutral-200 text-neutral-500 font-semibold uppercase">
              <tr>
                <th className="py-3 px-4">Nama Produk</th>
                <th className="py-3 px-4">Kategori</th>
                <th className="py-3 px-4 text-center">Porsi Terselamatkan</th>
                <th className="py-3 px-4 text-right">Harga Normal</th>
                <th className="py-3 px-4 text-right">Harga Rescue</th>
                <th className="py-3 px-4 text-center">Tingkat Penyelamatan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-100">
              {topProducts.map((p, idx) => (
                <tr key={p.id} className="hover:bg-neutral-50/70 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2.5">
                      <span className="font-mono font-bold text-neutral-400 text-xs w-4">
                        #{idx + 1}
                      </span>
                      <img
                        src={p.image}
                        alt={p.name}
                        className="w-8 h-8 rounded-lg object-cover border border-neutral-200 shrink-0"
                        referrerPolicy="no-referrer"
                      />
                      <span className="font-bold text-neutral-800 truncate max-w-xs">{p.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-neutral-600">{p.category}</td>
                  <td className="py-3 px-4 text-center font-mono font-bold text-emerald-800 text-sm">
                    {p.portionsRescuedCount} porsi
                  </td>
                  <td className="py-3 px-4 text-right font-mono text-neutral-400 line-through">
                    {formatRupiah(p.originalPrice)}
                  </td>
                  <td className="py-3 px-4 text-right font-mono font-bold text-[#16382C]">
                    {p.discountedPrice === 0 ? 'Bebas Bayar' : formatRupiah(p.discountedPrice)}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="text-[11px] font-mono text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded font-semibold">
                      94% Terjual
                    </span>
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
