import React, { useState } from 'react';
import {
  Scale,
  DollarSign,
  Users,
  Flame,
  PieChart,
  ShoppingBag,
  ChevronRight,
  Info,
  Layers,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';

interface FoodWasteFunFactsProps {
  onOpenEtalase?: () => void;
  onOpenPartnerForm?: () => void;
}

type TabKey = 'all' | 'volume' | 'komposisi' | 'ekonomi' | 'sosial';

export const FoodWasteFunFacts: React.FC<FoodWasteFunFactsProps> = ({
  onOpenEtalase,
  onOpenPartnerForm,
}) => {
  const [activeTab, setActiveTab] = useState<TabKey>('all');
  const [householdMembers, setHouseholdMembers] = useState<number>(3);

  // Per capita waste according to Bappenas: 9.6 - 15.3 kg / month (avg 12.5 kg)
  const monthlyHouseholdWasteKg = (householdMembers * 12.5).toFixed(1);
  const annualHouseholdWasteKg = (householdMembers * 150).toFixed(0);
  const estimatedRupiahValue = new Intl.NumberFormat('id-ID').format(
    householdMembers * 150 * 25000
  );

  return (
    <div className="space-y-8 sm:space-y-12">
      {/* SECTION HEADER (CENTERED) */}
      <div className="max-w-3xl mx-auto text-center space-y-2.5 sm:space-y-3 px-2">
        <div className="inline-flex items-center gap-1.5 sm:gap-2 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full bg-[#8DA249]/15 border border-[#8DA249]/30 text-[#1F281A] text-[11px] sm:text-xs font-bold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5 text-[#8DA249]" />
          <span>Menu Fun Fact & Riset Ilmiah Resmi</span>
        </div>

        <h2
          className="text-xl xs:text-2xl sm:text-3xl md:text-4xl font-bold text-stone-900 tracking-tight font-display"
          style={{ textWrap: 'balance' }}
        >
          Fakta Nyata Dampak Pembuangan Makanan di Indonesia
        </h2>

        <p className="text-xs sm:text-sm text-stone-600 leading-relaxed max-w-2xl mx-auto text-center">
          Kumpulan data komprehensif dari Kajian Food Loss & Waste Bappenas (2021), SIPSN KLHK (2023), dan UNEP Food Waste Index (2024) yang menjadi alasan utama lahirnya gerakan SisaPiring.
        </p>
      </div>

      {/* INTERACTIVE MENU TABS (TOUCH-SCROLLABLE ON MOBILE, CENTERED ON DESKTOP) */}
      <div className="w-full overflow-hidden">
        <div className="flex sm:flex-wrap items-center justify-start sm:justify-center gap-2 sm:gap-2.5 max-w-4xl mx-auto px-4 sm:px-2 overflow-x-auto no-scrollbar scroll-smooth py-1">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`min-h-[38px] sm:min-h-[40px] px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer flex items-center gap-1.5 sm:gap-2 shrink-0 select-none ${
              activeTab === 'all'
                ? 'bg-[#1F281A] text-white shadow-xs'
                : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50 hover:text-stone-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#8DA249]" />
            <span>Semua Fakta</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('volume')}
            className={`min-h-[38px] sm:min-h-[40px] px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer flex items-center gap-1.5 sm:gap-2 shrink-0 select-none ${
              activeTab === 'volume'
                ? 'bg-[#1F281A] text-white shadow-xs'
                : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50 hover:text-stone-900'
            }`}
          >
            <Scale className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#8DA249]" />
            <span>1. Volume Timbulan</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('komposisi')}
            className={`min-h-[38px] sm:min-h-[40px] px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer flex items-center gap-1.5 sm:gap-2 shrink-0 select-none ${
              activeTab === 'komposisi'
                ? 'bg-[#1F281A] text-white shadow-xs'
                : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50 hover:text-stone-900'
            }`}
          >
            <PieChart className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#8DA249]" />
            <span>2. Komposisi Sampah</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('ekonomi')}
            className={`min-h-[38px] sm:min-h-[40px] px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer flex items-center gap-1.5 sm:gap-2 shrink-0 select-none ${
              activeTab === 'ekonomi'
                ? 'bg-[#1F281A] text-white shadow-xs'
                : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50 hover:text-stone-900'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#8DA249]" />
            <span>3. Ekonomi & Iklim</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('sosial')}
            className={`min-h-[38px] sm:min-h-[40px] px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer flex items-center gap-1.5 sm:gap-2 shrink-0 select-none ${
              activeTab === 'sosial'
                ? 'bg-[#1F281A] text-white shadow-xs'
                : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50 hover:text-stone-900'
            }`}
          >
            <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#8DA249]" />
            <span>4. Dampak Sosial</span>
          </button>
        </div>
      </div>

      {/* 4 FUN FACT CARDS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 lg:gap-8 items-stretch">
        {/* CARD 1: VOLUME DAN AKUMULASI TIMBULAN */}
        {(activeTab === 'all' || activeTab === 'volume') && (
          <div className="bg-white border border-[#8DA249]/30 rounded-2xl sm:rounded-3xl p-5 sm:p-7 shadow-xs flex flex-col justify-between space-y-5 sm:space-y-6 hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#8DA249]/10 rounded-full blur-2xl pointer-events-none" />

            <div className="space-y-3.5 sm:space-y-4 relative z-10">
              <div className="flex items-center justify-between gap-2">
                <span className="px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-[#1F281A] text-white text-[10px] sm:text-[11px] font-mono font-bold">
                  FAKTA 01
                </span>
                <span className="text-[10px] sm:text-[11px] font-semibold text-stone-500 flex items-center gap-1">
                  <Info className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#8DA249]" />
                  <span>Kajian Bappenas & UNEP</span>
                </span>
              </div>

              <h3 className="text-base sm:text-xl font-bold text-stone-900 font-display">
                Volume dan Akumulasi Timbulan Pangan
              </h3>

              {/* Big Stat Callout */}
              <div className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-[#F4F6EC] border border-[#8DA249]/25 flex items-baseline justify-between gap-2">
                <div>
                  <span className="text-xl xs:text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#1F281A] font-mono-tabular tracking-tight block">
                    23 – 48 Juta Ton
                  </span>
                  <span className="text-[11px] sm:text-xs font-semibold text-[#8DA249]">
                    Sisa makanan terbuang per tahun di Indonesia
                  </span>
                </div>
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white text-[#1F281A] flex items-center justify-center shrink-0 shadow-2xs">
                  <Scale className="w-4 h-4 sm:w-5 sm:h-5 text-[#8DA249]" />
                </div>
              </div>

              {/* Breakdown Data Points */}
              <div className="space-y-2.5 sm:space-y-3 pt-1">
                <div className="flex items-start gap-2.5 sm:gap-3 p-3 rounded-xl bg-stone-50 border border-stone-200/70">
                  <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-[#8DA249]/20 text-[#1F281A] flex items-center justify-center shrink-0 font-bold text-xs mt-0.5">
                    👤
                  </div>
                  <div className="text-xs sm:text-sm text-stone-700 leading-relaxed">
                    <strong className="text-stone-900 block font-semibold mb-0.5">
                      Rata-Rata 115 – 184 kg / Penduduk / Tahun
                    </strong>
                    Jika dikonversi per individu, setiap warga Indonesia membuang sekitar <strong>9,6 hingga 15,3 kg</strong> makanan per bulan (setara 2 karung beras keluarga).
                  </div>
                </div>

                <div className="flex items-start gap-2.5 sm:gap-3 p-3 rounded-xl bg-stone-50 border border-stone-200/70">
                  <div className="w-6 h-6 sm:w-7 sm:h-7 rounded-lg bg-[#8DA249]/20 text-[#1F281A] flex items-center justify-center shrink-0 font-bold text-xs mt-0.5">
                    🏪
                  </div>
                  <div className="text-xs sm:text-sm text-stone-700 leading-relaxed">
                    <strong className="text-stone-900 block font-semibold mb-0.5">
                      14,73 Juta Ton di Tingkat Konsumen (UNEP 2024)
                    </strong>
                    Laporan resmi <em>UNEP Food Waste Index Report (2024)</em> mencatat sampah makanan khusus di sektor ritel, restoran, dan rumah tangga mencapai 14,73 juta ton per tahun.
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-[10px] sm:text-[11px] text-stone-500">
              <span className="font-mono">Sumber: Bappenas (2021) & UNEP (2024)</span>
              <span className="text-[#8DA249] font-semibold flex items-center gap-0.5 sm:gap-1">
                Penyelamatan Pangan <ChevronRight className="w-3 h-3" />
              </span>
            </div>
          </div>
        )}

        {/* CARD 2: KOMPOSISI SAMPAH NASIONAL */}
        {(activeTab === 'all' || activeTab === 'komposisi') && (
          <div className="bg-white border border-[#8DA249]/30 rounded-2xl sm:rounded-3xl p-5 sm:p-7 shadow-xs flex flex-col justify-between space-y-5 sm:space-y-6 hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

            <div className="space-y-3.5 sm:space-y-4 relative z-10">
              <div className="flex items-center justify-between gap-2">
                <span className="px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-[#1F281A] text-white text-[10px] sm:text-[11px] font-mono font-bold">
                  FAKTA 02
                </span>
                <span className="text-[10px] sm:text-[11px] font-semibold text-stone-500 flex items-center gap-1">
                  <Info className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#8DA249]" />
                  <span>SIPSN KLHK 2023</span>
                </span>
              </div>

              <h3 className="text-base sm:text-xl font-bold text-stone-900 font-display">
                Komposisi Sampah Nasional: Sisa Makanan Juara 1
              </h3>

              {/* Big Stat Callout with 2x Badge */}
              <div className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-[#F4F6EC] border border-[#8DA249]/25 space-y-1.5 sm:space-y-2">
                <div className="flex items-baseline justify-between gap-2">
                  <span className="text-xl xs:text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#1F281A] font-mono-tabular tracking-tight">
                    40,33% – 41,4%
                  </span>
                  <span className="px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg bg-red-100 text-red-700 text-[10px] sm:text-[11px] font-bold shrink-0">
                    2x Sampah Plastik
                  </span>
                </div>
                <p className="text-xs text-stone-600 leading-relaxed">
                  Sisa makanan menjadi <strong>komponen sampah terbesar</strong> di TPA seluruh Indonesia, melampaui gabungan beberapa jenis limbah lainnya.
                </p>
              </div>

              {/* Visual Horizontal Comparison Bar Chart */}
              <div className="space-y-2.5 sm:space-y-3 pt-1">
                <div>
                  <div className="flex items-center justify-between text-[11px] sm:text-xs font-semibold mb-1">
                    <span className="text-[#1F281A] flex items-center gap-1.5 truncate pr-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-[#1F281A] shrink-0" />
                      Sisa Makanan (Porsi Terbesar RI)
                    </span>
                    <span className="font-mono font-bold text-[#1F281A] shrink-0">41,4%</span>
                  </div>
                  <div className="h-2.5 sm:h-3 w-full bg-stone-100 rounded-full overflow-hidden">
                    <div className="h-full bg-[#1F281A] rounded-full transition-all duration-700" style={{ width: '41.4%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between text-[11px] sm:text-xs font-semibold mb-1">
                    <span className="text-stone-600 flex items-center gap-1.5 truncate pr-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-sky-600 shrink-0" />
                      Sampah Plastik
                    </span>
                    <span className="font-mono font-bold text-stone-600 shrink-0">20,14%</span>
                  </div>
                  <div className="h-2.5 sm:h-3 w-full bg-stone-100 rounded-full overflow-hidden">
                    <div className="h-full bg-sky-600 rounded-full transition-all duration-700" style={{ width: '20.14%' }} />
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between text-[11px] sm:text-xs font-semibold mb-1">
                    <span className="text-stone-500 flex items-center gap-1.5 truncate pr-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shrink-0" />
                      Kertas & Karton
                    </span>
                    <span className="font-mono text-stone-500 shrink-0">11,2%</span>
                  </div>
                  <div className="h-2 sm:h-2.5 w-full bg-stone-100 rounded-full overflow-hidden">
                    <div className="h-full bg-amber-500 rounded-full transition-all duration-700" style={{ width: '11.2%' }} />
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-[10px] sm:text-[11px] text-stone-500">
              <span className="font-mono">Sumber: Data Resmi SIPSN KLHK RI (2023)</span>
              <span className="text-[#8DA249] font-semibold flex items-center gap-0.5 sm:gap-1">
                Tantangan Utama TPA <ChevronRight className="w-3 h-3" />
              </span>
            </div>
          </div>
        )}

        {/* CARD 3: DAMPAK EKONOMI DAN LINGKUNGAN */}
        {(activeTab === 'all' || activeTab === 'ekonomi') && (
          <div className="bg-white border border-[#8DA249]/30 rounded-2xl sm:rounded-3xl p-5 sm:p-7 shadow-xs flex flex-col justify-between space-y-5 sm:space-y-6 hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

            <div className="space-y-3.5 sm:space-y-4 relative z-10">
              <div className="flex items-center justify-between gap-2">
                <span className="px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-[#1F281A] text-white text-[10px] sm:text-[11px] font-mono font-bold">
                  FAKTA 03
                </span>
                <span className="text-[10px] sm:text-[11px] font-semibold text-stone-500 flex items-center gap-1">
                  <Info className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#8DA249]" />
                  <span>Kajian Valuasi Bappenas</span>
                </span>
              </div>

              <h3 className="text-base sm:text-xl font-bold text-stone-900 font-display">
                Dampak Ekonomi & Jejak Emisi Lingkungan
              </h3>

              {/* 2-Column Split: Financial & Climate */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                {/* Financial Loss */}
                <div className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-[#F4F6EC] border border-[#8DA249]/25 space-y-1.5 sm:space-y-2">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-white text-[#1F281A] flex items-center justify-center shadow-2xs">
                    <DollarSign className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#8DA249]" />
                  </div>
                  <div>
                    <span className="text-lg xs:text-xl sm:text-2xl font-extrabold text-[#1F281A] font-mono-tabular block">
                      Rp 213 – 551 T
                    </span>
                    <span className="text-[10px] sm:text-[11px] font-semibold text-stone-600 block mt-0.5">
                      Kerugian Ekonomi per Tahun
                    </span>
                  </div>
                  <p className="text-[10px] sm:text-[11px] text-stone-500 leading-snug">
                    Nilai makanan terbuang setara dengan <strong>4% hingga 5% PDB</strong> Indonesia.
                  </p>
                </div>

                {/* Greenhouse Gas Emission */}
                <div className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-[#F4F6EC] border border-[#8DA249]/25 space-y-1.5 sm:space-y-2">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-white text-orange-600 flex items-center justify-center shadow-2xs">
                    <Flame className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-orange-500" />
                  </div>
                  <div>
                    <span className="text-lg xs:text-xl sm:text-2xl font-extrabold text-orange-600 font-mono-tabular block">
                      7,3% Emisi RI
                    </span>
                    <span className="text-[10px] sm:text-[11px] font-semibold text-stone-600 block mt-0.5">
                      Pelepasan Gas Metana (CH₄)
                    </span>
                  </div>
                  <p className="text-[10px] sm:text-[11px] text-stone-500 leading-snug">
                    Pembusukan sisa makanan di TPA menyumbang <strong>7,3% total emisi gas rumah kaca</strong>.
                  </p>
                </div>
              </div>

              <div className="p-3 sm:p-3.5 rounded-xl bg-stone-50 border border-stone-200/70 text-[11px] sm:text-xs text-stone-700 leading-relaxed">
                💡 <strong>Mengapa ini penting?</strong> Mengurangi makanan berlebih adalah langkah paling cepat memulihkan ekonomi UMKM sekaligus menurunkan emisi perkotaan.
              </div>
            </div>

            <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-[10px] sm:text-[11px] text-stone-500">
              <span className="font-mono">Sumber: Perhitungan Kajian Bappenas</span>
              <span className="text-[#8DA249] font-semibold flex items-center gap-0.5 sm:gap-1">
                Dompet & Iklim <ChevronRight className="w-3 h-3" />
              </span>
            </div>
          </div>
        )}

        {/* CARD 4: DAMPAK SOSIAL (NUTRISI YANG HILANG) */}
        {(activeTab === 'all' || activeTab === 'sosial') && (
          <div className="bg-white border border-[#8DA249]/30 rounded-2xl sm:rounded-3xl p-5 sm:p-7 shadow-xs flex flex-col justify-between space-y-5 sm:space-y-6 hover:shadow-md transition-shadow relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/10 rounded-full blur-2xl pointer-events-none" />

            <div className="space-y-3.5 sm:space-y-4 relative z-10">
              <div className="flex items-center justify-between gap-2">
                <span className="px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-[#1F281A] text-white text-[10px] sm:text-[11px] font-mono font-bold">
                  FAKTA 04
                </span>
                <span className="text-[10px] sm:text-[11px] font-semibold text-stone-500 flex items-center gap-1">
                  <Info className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-[#8DA249]" />
                  <span>Kandungan Kalori & Nutrisi</span>
                </span>
              </div>

              <h3 className="text-base sm:text-xl font-bold text-stone-900 font-display">
                Dampak Sosial: Nutrisi Makanan yang Hilang
              </h3>

              {/* Big Stat Callout */}
              <div className="p-3.5 sm:p-4 rounded-xl sm:rounded-2xl bg-[#F4F6EC] border border-[#8DA249]/25 flex items-baseline justify-between gap-2">
                <div>
                  <span className="text-xl xs:text-2xl sm:text-3xl lg:text-4xl font-extrabold text-[#1F281A] font-mono-tabular tracking-tight block">
                    61 – 125 Juta Jiwa
                  </span>
                  <span className="text-[11px] sm:text-xs font-semibold text-[#8DA249]">
                    Kecukupan pangan bergizi yang terbuang sia-sia
                  </span>
                </div>
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white text-[#1F281A] flex items-center justify-center shrink-0 shadow-2xs">
                  <Users className="w-4 h-4 sm:w-5 sm:h-5 text-[#8DA249]" />
                </div>
              </div>

              <div className="space-y-2.5 sm:space-y-3 pt-1">
                <div className="flex items-start gap-2.5 sm:gap-3 p-3 rounded-xl bg-stone-50 border border-stone-200/70">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-[#8DA249]/20 text-[#1F281A] flex items-center justify-center shrink-0 font-bold text-xs mt-0.5">
                    🥣
                  </div>
                  <div className="text-xs sm:text-sm text-stone-700 leading-relaxed">
                    <strong className="text-stone-900 block font-semibold mb-0.5">
                      Mencukupi 29% Hingga 47% Populasi Warga Indonesia
                    </strong>
                    Kandungan energi dan nutrisi dari makanan yang terbuang sepanjang rantai pasok sebenarnya sanggup memberi makan hampir separuh rakyat Indonesia.
                  </div>
                </div>

                <div className="p-3 sm:p-3.5 rounded-xl bg-[#8DA249]/10 border border-[#8DA249]/25 text-[11px] sm:text-xs text-stone-800 leading-relaxed">
                  🤝 <strong>Solusi Nyata SisaPiring:</strong> Makanan yang kami selamatkan dari mitra UMKM adalah makanan segar baru hari ini yang dialirkan ke warga dengan harga terjangkau.
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-stone-100 flex items-center justify-between text-[10px] sm:text-[11px] text-stone-500">
              <span className="font-mono">Sumber: Analisis Ketahanan Pangan Bappenas</span>
              <span className="text-[#8DA249] font-semibold flex items-center gap-0.5 sm:gap-1">
                Keadilan Pangan <ChevronRight className="w-3 h-3" />
              </span>
            </div>
          </div>
        )}
      </div>

      {/* INTERACTIVE MINI CALCULATOR: FUN FACT SKALA RUMAH TANGGA */}
      <div className="bg-white border border-[#8DA249]/25 rounded-2xl sm:rounded-3xl p-4.5 sm:p-8 shadow-xs max-w-4xl mx-auto space-y-4 sm:space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 sm:pb-4 border-b border-stone-100">
          <div>
            <h4 className="text-sm sm:text-lg font-bold text-stone-900 font-display flex items-center gap-1.5 sm:gap-2">
              <span>🎯 Simulasi Interaktif: Berapa Banyak Makanan di Rumah Anda?</span>
            </h4>
            <p className="text-[11px] sm:text-xs text-stone-500 mt-0.5">
              Gunakan data rata-rata Bappenas (12,5 kg/orang/bulan) untuk melihat estimasi skala keluarga Anda.
            </p>
          </div>
          <div className="inline-flex items-center gap-1.5 self-start sm:self-auto bg-[#F4F6EC] px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-xl border border-[#8DA249]/30 text-[11px] sm:text-xs font-semibold text-[#1F281A]">
            <span>{householdMembers} Orang di Rumah</span>
          </div>
        </div>

        {/* Member Slider */}
        <div className="space-y-1.5 sm:space-y-2">
          <div className="flex items-center justify-between text-xs text-stone-600 font-medium">
            <span>Pilih Jumlah Anggota Keluarga:</span>
            <span className="font-bold text-[#8DA249]">{householdMembers} Anggota Keluarga</span>
          </div>
          <div className="py-1">
            <input
              type="range"
              min={1}
              max={8}
              step={1}
              value={householdMembers}
              onChange={(e) => setHouseholdMembers(Number(e.target.value))}
              className="w-full accent-[#8DA249] h-2.5 sm:h-2 bg-stone-100 rounded-lg cursor-pointer"
            />
          </div>
          <div className="flex justify-between text-[10px] sm:text-[11px] text-stone-400 font-mono">
            <span>1 Orang (Kost)</span>
            <span>4 Orang (Standar)</span>
            <span>8+ Orang (Besar)</span>
          </div>
        </div>

        {/* Calculated Result: 3-column on mobile & desktop */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4 pt-1 sm:pt-2">
          <div className="p-2.5 sm:p-4 rounded-xl sm:rounded-2xl bg-[#F4F6EC]/80 border border-[#8DA249]/20 text-center flex flex-col justify-between">
            <span className="block text-[10px] sm:text-[11px] text-stone-600 font-medium leading-tight mb-1">
              Potensi Terbuang / Bulan
            </span>
            <span className="text-sm xs:text-base sm:text-2xl font-extrabold text-[#1F281A] font-mono-tabular">
              {monthlyHouseholdWasteKg} kg
            </span>
            <span className="block text-[9px] sm:text-[10px] text-stone-500 mt-0.5 leading-tight">/ bulan di rumah</span>
          </div>

          <div className="p-2.5 sm:p-4 rounded-xl sm:rounded-2xl bg-[#F4F6EC]/80 border border-[#8DA249]/20 text-center flex flex-col justify-between">
            <span className="block text-[10px] sm:text-[11px] text-stone-600 font-medium leading-tight mb-1">
              Potensi Terbuang / Tahun
            </span>
            <span className="text-sm xs:text-base sm:text-2xl font-extrabold text-[#1F281A] font-mono-tabular">
              {annualHouseholdWasteKg} kg
            </span>
            <span className="block text-[9px] sm:text-[10px] text-stone-500 mt-0.5 leading-tight">/ tahun konsumsi</span>
          </div>

          <div className="p-2.5 sm:p-4 rounded-xl sm:rounded-2xl bg-[#F4F6EC]/80 border border-[#8DA249]/20 text-center flex flex-col justify-between">
            <span className="block text-[10px] sm:text-[11px] text-stone-600 font-medium leading-tight mb-1">
              Estimasi Valuasi Belanja
            </span>
            <span className="text-xs xs:text-sm sm:text-2xl font-extrabold text-[#8DA249] font-mono-tabular">
              Rp {estimatedRupiahValue}
            </span>
            <span className="block text-[9px] sm:text-[10px] text-stone-500 mt-0.5 leading-tight">dapat dihemat</span>
          </div>
        </div>
      </div>

      {/* CALL TO ACTION BUTTONS (FULL WIDTH ON MOBILE, INLINE ON DESKTOP) */}
      <div className="text-center pt-1 sm:pt-2 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-2.5 sm:gap-3 max-w-lg mx-auto sm:max-w-none">
        {onOpenEtalase && (
          <button
            type="button"
            onClick={onOpenEtalase}
            className="w-full sm:w-auto min-h-[46px] px-6 py-3 bg-[#1F281A] hover:bg-emerald-950 text-white text-xs sm:text-sm font-semibold rounded-full shadow-md transition-colors cursor-pointer inline-flex items-center justify-center gap-2"
          >
            <ShoppingBag className="w-4 h-4 text-[#8DA249]" />
            <span>Mulai Selamatkan Makanan di Etalase</span>
          </button>
        )}

        {onOpenPartnerForm && (
          <button
            type="button"
            onClick={onOpenPartnerForm}
            className="w-full sm:w-auto min-h-[46px] px-6 py-3 bg-white hover:bg-stone-50 border border-stone-300 text-stone-800 text-xs sm:text-sm font-semibold rounded-full shadow-xs transition-colors cursor-pointer inline-flex items-center justify-center gap-2"
          >
            <CheckCircle2 className="w-4 h-4 text-[#8DA249]" />
            <span>Daftarkan Usaha Kuliner / Warga</span>
          </button>
        )}
      </div>
    </div>
  );
};
