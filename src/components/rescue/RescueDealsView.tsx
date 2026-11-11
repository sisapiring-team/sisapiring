import React, { useState } from 'react';
import {
  Sparkles,
  Percent,
  Clock,
  TrendingDown,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Zap,
  HeartHandshake,
} from 'lucide-react';
import { calculateRecommendedDiscount } from '../../utils/discountEngine';
import { formatRupiah } from '../../utils/formatters';
import { useApp } from '../../context/AppContext';

export const RescueDealsView: React.FC = () => {
  const { products, applyDiscount, showToast } = useApp();

  // Simulation test state
  const [simHours, setSimHours] = useState<number>(2.5);
  const [simStock, setSimStock] = useState<number>(6);

  const simRecommendation = calculateRecommendedDiscount(simHours, simStock, 'Bakery');

  const handleApplyBatchRecommended = () => {
    let appliedCount = 0;
    products.forEach((p) => {
      if (p.isActive && p.stock > 0) {
        // Calculate recommended discount based on mock hours remaining (e.g., 2.5 hours)
        const rec = calculateRecommendedDiscount(2.5, p.stock, p.category);
        if (p.discountPercentage !== rec.recommendedDiscount) {
          applyDiscount(p.id, rec.recommendedDiscount);
          appliedCount++;
        }
      }
    });

    if (appliedCount > 0) {
      showToast(
        'Diskon Rekomendasi Diterapkan!',
        `Berhasil menyelaraskan ${appliedCount} produk dengan rekomendasi sistem penyelamatan pangan.`,
        'success'
      );
    } else {
      showToast(
        'Sudah Optimal',
        'Seluruh produk sisa piring Anda sudah menggunakan diskon optimal yang direkomendasikan.',
        'info'
      );
    }
  };

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl md:text-2xl font-bold text-[#16382C] tracking-tight">
              Rescue Deals & Diskon Pintar
            </h1>
            <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#16382C] bg-[#FFD230] px-2.5 py-0.5 rounded-full">
              <Sparkles className="w-3.5 h-3.5 text-[#16382C]" />
              Algoritma Otomatis
            </span>
          </div>
          <p className="text-xs text-neutral-500 mt-1">
            Optimalkan penyelamatan sisa piring makanan Kota Bandung sebelum batas aman kedaluwarsa dengan diskon bertingkat (50%, 70%, 90%, 100% Donasi).
          </p>
        </div>

        <button
          type="button"
          onClick={handleApplyBatchRecommended}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#EE4D2D] hover:bg-[#D73C1C] text-white text-xs font-bold rounded-xl transition-colors shadow-xs shrink-0"
        >
          <Zap className="w-4 h-4" />
          <span>Terapkan Semua Rekomendasi</span>
        </button>
      </div>

      {/* Logic Explanation & Interactive Simulator Banner */}
      <div className="bg-white rounded-2xl p-5 md:p-6 border border-neutral-200 shadow-xs space-y-5">
        <div className="flex items-start justify-between gap-4 border-b border-neutral-100 pb-4">
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-[#16382C] flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-[#EE4D2D]" />
              <span>Prinsip Algoritma Rekomendasi Diskon SisaPiring</span>
            </h3>
            <p className="text-xs text-neutral-600 leading-relaxed max-w-2xl">
              Sistem menghitung parameter: <strong>(1) Sisa jam sebelum batas aman konsumsi</strong>,{' '}
              <strong>(2) Jumlah porsi stok tersisa</strong>, dan <strong>(3) Jam penjemputan warga Bandung</strong>.{' '}
              Mitra tetap memegang kendali penuh atas harga final.
            </p>
          </div>
        </div>

        {/* Interactive Algorithm Sandbox */}
        <div className="bg-[#FAF9F6] rounded-xl p-4 border border-neutral-200 grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="space-y-2">
            <div className="flex justify-between text-xs font-semibold text-neutral-700">
              <span>Simulasi Sisa Waktu Aman:</span>
              <span className="font-mono text-[#EE4D2D]">{simHours.toFixed(1)} Jam</span>
            </div>
            <input
              type="range"
              min="0.5"
              max="12"
              step="0.5"
              value={simHours}
              onChange={(e) => setSimHours(parseFloat(e.target.value))}
              className="w-full accent-[#16382C]"
            />
            <span className="text-[10px] text-neutral-400 block">
              Dari 30 menit (kritis) hingga 12 jam (leluasa)
            </span>
          </div>

          <div className="space-y-2">
            <div className="flex justify-between text-xs font-semibold text-neutral-700">
              <span>Simulasi Sisa Stok:</span>
              <span className="font-mono text-[#16382C]">{simStock} Porsi</span>
            </div>
            <input
              type="range"
              min="1"
              max="20"
              step="1"
              value={simStock}
              onChange={(e) => setSimStock(parseInt(e.target.value))}
              className="w-full accent-[#16382C]"
            />
            <span className="text-[10px] text-neutral-400 block">
              Volume porsi yang perlu diselamatkan
            </span>
          </div>

          <div className="bg-white rounded-xl p-3 border border-neutral-200 flex flex-col justify-between">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-neutral-500 uppercase">
                Hasil Rekomendasi:
              </span>
              <span
                className={`text-xs font-bold font-mono px-2 py-0.5 rounded ${
                  simRecommendation.recommendedDiscount === 100
                    ? 'bg-[#16382C] text-[#FFD230]'
                    : simRecommendation.recommendedDiscount === 90
                    ? 'bg-rose-100 text-rose-800'
                    : 'bg-amber-100 text-amber-800'
                }`}
              >
                {simRecommendation.recommendedDiscount === 100
                  ? 'Donasi 100%'
                  : `${simRecommendation.recommendedDiscount}% OFF`}
              </span>
            </div>
            <p className="text-[11px] text-neutral-700 mt-1 leading-snug">
              {simRecommendation.reason}
            </p>
          </div>
        </div>
      </div>

      {/* Product List with Rescue Deals Controls */}
      <div className="space-y-3.5">
        <h3 className="text-sm font-bold text-neutral-800 uppercase tracking-wider">
          Pengaturan Diskon per Produk ({products.length} Produk)
        </h3>

        <div className="grid grid-cols-1 gap-3.5">
          {products.map((p) => {
            // Simulated remaining hours for demo calculation
            const rec = calculateRecommendedDiscount(3.5, p.stock, p.category);
            const isMatchingRecommendation = p.discountPercentage === rec.recommendedDiscount;

            return (
              <div
                key={p.id}
                className="bg-white rounded-2xl p-4 md:p-5 border border-neutral-200 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4 hover:border-neutral-300 transition-all"
              >
                {/* Product info */}
                <div className="flex items-start gap-3.5 min-w-0">
                  <img
                    src={p.image}
                    alt={p.name}
                    className="w-16 h-16 rounded-xl object-cover border border-neutral-200 shrink-0"
                    referrerPolicy="no-referrer"
                  />
                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-semibold text-neutral-500 uppercase tracking-wider">
                        {p.category}
                      </span>
                      <span className="text-neutral-300">·</span>
                      <span className="text-[11px] text-neutral-500 font-mono">Stok: {p.stock} porsi</span>
                    </div>
                    <h4 className="text-sm font-bold text-neutral-900 truncate" title={p.name}>
                      {p.name}
                    </h4>
                    <div className="flex items-center gap-2 text-xs">
                      <span className="font-mono text-neutral-400 line-through">
                        {formatRupiah(p.originalPrice)}
                      </span>
                      <span className="font-mono font-bold text-[#16382C]">
                        {p.discountedPrice === 0 ? 'Bebas Bayar (Donasi)' : formatRupiah(p.discountedPrice)}
                      </span>
                      <span className="text-[11px] text-neutral-400">
                        (Batas Aman: {p.safeConsumptionDeadline})
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: Recommendation + Manual Selector */}
                <div className="flex flex-col sm:flex-row sm:items-center gap-3 lg:gap-4 shrink-0 pt-3 lg:pt-0 border-t lg:border-t-0 border-neutral-100">
                  {/* Recommendation pill */}
                  <div className="bg-neutral-50 rounded-xl p-2.5 border border-neutral-200 max-w-xs text-xs">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-neutral-800 text-[11px]">Saran AI Rescue:</span>
                      <span className="font-mono font-bold text-[#EE4D2D]">
                        {rec.recommendedDiscount === 100 ? 'Donasi 100%' : `${rec.recommendedDiscount}% OFF`}
                      </span>
                    </div>
                    {!isMatchingRecommendation && (
                      <button
                        type="button"
                        onClick={() => applyDiscount(p.id, rec.recommendedDiscount)}
                        className="mt-1.5 w-full py-1 bg-[#16382C] text-white text-[11px] font-semibold rounded-lg hover:bg-[#214F3F] transition-colors"
                      >
                        Pakai Saran ({rec.recommendedDiscount}%)
                      </button>
                    )}
                    {isMatchingRecommendation && (
                      <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700 font-medium mt-1">
                        <CheckCircle2 className="w-3 h-3" />
                        Diskon rekomendasi aktif
                      </span>
                    )}
                  </div>

                  {/* Manual 4 Tier Buttons: 50%, 70%, 90%, 100% */}
                  <div>
                    <span className="block text-[10px] text-neutral-400 font-semibold uppercase mb-1">
                      Pilihan Manual Mitra:
                    </span>
                    <div className="flex items-center gap-1.5">
                      {([50, 70, 90, 100] as const).map((tier) => (
                        <button
                          key={tier}
                          type="button"
                          onClick={() => applyDiscount(p.id, tier)}
                          className={`px-3 py-1.5 text-xs font-bold rounded-xl border transition-all ${
                            p.discountPercentage === tier
                              ? tier === 100
                                ? 'bg-[#16382C] text-[#FFD230] border-[#16382C] shadow-xs'
                                : 'bg-[#EE4D2D] text-white border-[#EE4D2D] shadow-xs'
                              : 'bg-white text-neutral-700 border-neutral-200 hover:bg-neutral-50'
                          }`}
                        >
                          {tier === 100 ? 'Donasi' : `${tier}%`}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
