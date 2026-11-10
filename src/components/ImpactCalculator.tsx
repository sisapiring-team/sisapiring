import React, { useState } from 'react';
import { formatRupiah } from '../data/surplusCatalog';

export const ImpactCalculator: React.FC<{ onExploreClick: () => void }> = ({ onExploreClick }) => {
  const [mode, setMode] = useState<'pembeli' | 'umkm'>('pembeli');

  // State for Pembeli (Consumer)
  const [weeklyOrders, setWeeklyOrders] = useState<number>(4);
  const [normalMealPrice, setNormalMealPrice] = useState<number>(65000);

  // State for Mitra UMKM (Merchant)
  const [dailyUnsoldPortions, setDailyUnsoldPortions] = useState<number>(8);
  const [merchantOriginalPrice, setMerchantOriginalPrice] = useState<number>(50000);

  // Consumer calculations (average 58% discount)
  const discountRate = 0.58;
  const rescueMealPrice = Math.round(normalMealPrice * (1 - discountRate));
  const monthlySavedRupiah = Math.round(weeklyOrders * 4.3 * (normalMealPrice - rescueMealPrice));
  const yearlySavedRupiah = monthlySavedRupiah * 12;
  const monthlyFoodSavedKg = (weeklyOrders * 4.3 * 0.45).toFixed(1);

  // Merchant calculations (sold at 45% of original price, 26 active days/month)
  const merchantRescuePrice = Math.round(merchantOriginalPrice * 0.45);
  const monthlyRecoveredRevenue = dailyUnsoldPortions * merchantRescuePrice * 26;
  const monthlyRescuedPortions = dailyUnsoldPortions * 26;

  return (
    <div className="bg-white border border-stone-200/90 rounded-2xl p-6 md:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-6 border-b border-stone-200/80">
        <div>
          <p className="text-xs text-stone-500 mb-1">
            Simulasi Manfaat Finansial · Hitungan Realistis
          </p>
          <h3 className="text-xl font-semibold text-stone-900">
            Kalkulator Nilai Penyelamatan
          </h3>
        </div>

        {/* Interactive Segmented Control */}
        <div className="flex items-center gap-1 p-1 bg-stone-100 rounded-lg self-start">
          <button
            type="button"
            onClick={() => setMode('pembeli')}
            className={`px-3.5 py-2 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              mode === 'pembeli'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Mode Pembeli
          </button>
          <button
            type="button"
            onClick={() => setMode('umkm')}
            className={`px-3.5 py-2 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
              mode === 'umkm'
                ? 'bg-white text-stone-900 shadow-xs'
                : 'text-stone-600 hover:text-stone-900'
            }`}
          >
            Mode Mitra UMKM
          </button>
        </div>
      </div>

      {mode === 'pembeli' ? (
        <div className="pt-6 space-y-6">
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between text-sm mb-2">
                <label htmlFor="weekly-orders" className="font-medium text-stone-700">
                  Frekuensi penyelamatan makanan per minggu
                </label>
                <span className="font-mono-tabular font-semibold text-stone-900">
                  {weeklyOrders} paket / minggu
                </span>
              </div>
              <input
                id="weekly-orders"
                type="range"
                min={1}
                max={14}
                step={1}
                value={weeklyOrders}
                onChange={(e) => setWeeklyOrders(Number(e.target.value))}
                className="w-full accent-emerald-900 cursor-pointer h-2 bg-stone-200 rounded-lg"
              />
              <div className="flex justify-between text-xs text-stone-400 mt-1 font-mono-tabular">
                <span>1x seminggu</span>
                <span>7x seminggu</span>
                <span>14x seminggu</span>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-sm mb-2">
                <label htmlFor="normal-price" className="font-medium text-stone-700">
                  Harga asli rata-rata per paket di toko UMKM
                </label>
                <span className="font-mono-tabular font-semibold text-stone-900">
                  {formatRupiah(normalMealPrice)}
                </span>
              </div>
              <input
                id="normal-price"
                type="range"
                min={35000}
                max={150000}
                step={5000}
                value={normalMealPrice}
                onChange={(e) => setNormalMealPrice(Number(e.target.value))}
                className="w-full accent-emerald-900 cursor-pointer h-2 bg-stone-200 rounded-lg"
              />
              <div className="flex justify-between text-xs text-stone-400 mt-1 font-mono-tabular">
                <span>Rp 35.000</span>
                <span>Rp 90.000</span>
                <span>Rp 150.000</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-stone-200/80 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-stone-500 mb-1">Harga Tebus SisaPiring</p>
              <p className="text-lg font-semibold text-stone-900 font-mono-tabular">
                {formatRupiah(rescueMealPrice)}
                <span className="text-xs font-normal text-stone-500"> / paket</span>
              </p>
            </div>
            <div>
              <p className="text-xs text-stone-500 mb-1">Penghematan per Bulan</p>
              <p className="text-xl font-bold text-emerald-900 font-mono-tabular">
                {formatRupiah(monthlySavedRupiah)}
              </p>
            </div>
            <div>
              <p className="text-xs text-stone-500 mb-1">Pangan Terselamatkan</p>
              <p className="text-lg font-semibold text-stone-900 font-mono-tabular">
                {monthlyFoodSavedKg} kg
                <span className="text-xs font-normal text-stone-500"> / bulan</span>
              </p>
            </div>
          </div>

          <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs text-stone-600">
            <span>
              Setara penghematan <strong className="font-mono-tabular text-stone-900">{formatRupiah(yearlySavedRupiah)}</strong> per tahun untuk anggaran kuliner Anda.
            </span>
            <button
              type="button"
              onClick={onExploreClick}
              className="px-4 py-2 bg-emerald-900 text-white font-medium rounded-lg hover:bg-emerald-800 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Mulai Hemat Sore Ini
            </button>
          </div>
        </div>
      ) : (
        <div className="pt-6 space-y-6">
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between text-sm mb-2">
                <label htmlFor="unsold-portions" className="font-medium text-stone-700">
                  Rata-rata porsi/roti berlebih saat jam tutup harian
                </label>
                <span className="font-mono-tabular font-semibold text-stone-900">
                  {dailyUnsoldPortions} porsi / hari
                </span>
              </div>
              <input
                id="unsold-portions"
                type="range"
                min={3}
                max={30}
                step={1}
                value={dailyUnsoldPortions}
                onChange={(e) => setDailyUnsoldPortions(Number(e.target.value))}
                className="w-full accent-emerald-900 cursor-pointer h-2 bg-stone-200 rounded-lg"
              />
              <div className="flex justify-between text-xs text-stone-400 mt-1 font-mono-tabular">
                <span>3 porsi</span>
                <span>15 porsi</span>
                <span>30 porsi</span>
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between text-sm mb-2">
                <label htmlFor="merchant-price" className="font-medium text-stone-700">
                  Harga jual normal per porsi di etalase UMKM
                </label>
                <span className="font-mono-tabular font-semibold text-stone-900">
                  {formatRupiah(merchantOriginalPrice)}
                </span>
              </div>
              <input
                id="merchant-price"
                type="range"
                min={25000}
                max={120000}
                step={5000}
                value={merchantOriginalPrice}
                onChange={(e) => setMerchantOriginalPrice(Number(e.target.value))}
                className="w-full accent-emerald-900 cursor-pointer h-2 bg-stone-200 rounded-lg"
              />
              <div className="flex justify-between text-xs text-stone-400 mt-1 font-mono-tabular">
                <span>Rp 25.000</span>
                <span>Rp 75.000</span>
                <span>Rp 120.000</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-stone-200/80 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <p className="text-xs text-stone-500 mb-1">Harga Paket Penyelamatan</p>
              <p className="text-lg font-semibold text-stone-900 font-mono-tabular">
                {formatRupiah(merchantRescuePrice)}
                <span className="text-xs font-normal text-stone-500"> / porsi</span>
              </p>
            </div>
            <div>
              <p className="text-xs text-stone-500 mb-1">Tambahan Omzet Bulanan</p>
              <p className="text-xl font-bold text-emerald-900 font-mono-tabular">
                {formatRupiah(monthlyRecoveredRevenue)}
              </p>
            </div>
            <div>
              <p className="text-xs text-stone-500 mb-1">Total Porsi Terselamatkan</p>
              <p className="text-lg font-semibold text-stone-900 font-mono-tabular">
                {monthlyRescuedPortions} porsi
                <span className="text-xs font-normal text-stone-500"> / bulan</span>
              </p>
            </div>
          </div>

          <div className="pt-2 text-xs text-stone-600">
            Ubah potensi kerugian bahan baku harian menjadi arus kas bersih tanpa mengganggu harga reguler di jam operasional utama.
          </div>
        </div>
      )}
    </div>
  );
};
