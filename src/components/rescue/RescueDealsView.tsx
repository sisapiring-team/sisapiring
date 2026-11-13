import React, { useMemo, useState } from 'react';
import { Clock, Sparkles, Check, Undo2 } from 'lucide-react';
import { calculateRecommendedDiscount } from '../../utils/discountEngine';
import { formatRupiah } from '../../utils/formatters';
import { useApp } from '../../context/AppContext';
import { SisaPiringProduct } from '../../types/seller';

/* Halaman diskon: kalimat pendek, tombol besar, dan harga akhir yang
   terlihat langsung. Tidak ada istilah teknis ("algoritma", "AI"). */

const INK = '#2C434F';
const SOFT = '#4E5F68';
const MUTE = '#6B7C83';
const FAINT = '#AEBBBF';
const ORANGE = '#F0935D';
const CREAM = '#FBE1B5';
const GREEN = '#4C7A34';

const CARD =
  'rounded-[22px] bg-white shadow-[0_1px_2px_rgba(44,67,79,0.05),0_14px_34px_-18px_rgba(44,67,79,0.28)]';

const TIERS = [50, 70, 90, 100] as const;

/** "19.30" / "19:30" → jam tersisa dari sekarang. Null kalau tidak terbaca. */
function hoursLeft(deadline: string): number | null {
  const m = /^(\d{1,2})[.:](\d{2})/.exec(deadline?.trim() ?? '');
  if (!m) return null;
  const target = new Date();
  target.setHours(Number(m[1]), Number(m[2]), 0, 0);
  const diff = (target.getTime() - Date.now()) / 3600000;
  return diff <= 0 ? 0 : Math.round(diff * 10) / 10;
}

const priceAt = (p: SisaPiringProduct, tier: number) =>
  Math.round((p.originalPrice * (100 - tier)) / 100 / 500) * 500;

const toneOf = (h: number | null) =>
  h === null ? MUTE : h <= 1.5 ? '#C25B37' : h <= 3 ? '#B9782F' : GREEN;

const urgencyOf = (h: number | null) =>
  h === null ? 'Waktu belum diisi' : h <= 1.5 ? 'Mepet' : h <= 3 ? 'Saatnya cek' : 'Masih longgar';

export const RescueDealsView: React.FC = () => {
  const { products, sellerProfile, applyDiscount, showToast } = useApp();

  const [simHours, setSimHours] = useState(2.5);
  const [simStock, setSimStock] = useState(6);

  const sim = useMemo(
    () => calculateRecommendedDiscount(simHours, simStock, 'Bakery'),
    [simHours, simStock]
  );

  const rows = useMemo(
    () =>
      products
        .filter((p) => p.isActive && p.stock > 0)
        .map((p) => {
          const left = hoursLeft(p.safeConsumptionDeadline);
          const rec = calculateRecommendedDiscount(left ?? 6, p.stock, p.category);
          return { p, left, rec, ok: p.discountPercentage === rec.recommendedDiscount };
        })
        .sort((a, b) => (a.left ?? 99) - (b.left ?? 99)),
    [products]
  );

  const needAction = rows.filter((r) => !r.ok).length;

  const apply = (p: SisaPiringProduct, tier: SisaPiringProduct['discountPercentage']) => {
    applyDiscount(p.id, tier);
    showToast(
      'Diskon dipasang',
      `${p.name} → ${tier === 100 ? 'donasi (gratis)' : `${tier}%`} · pembeli bayar ${formatRupiah(
        priceAt(p, tier)
      )}`,
      'success'
    );
  };

  const applyAll = () => {
    if (!needAction) {
      showToast('Sudah pas', 'Semua produk sudah memakai saran tertinggi.', 'info');
      return;
    }
    rows.filter((r) => !r.ok).forEach((r) => applyDiscount(r.p.id, r.rec.recommendedDiscount));
    showToast(
      'Selesai',
      `${needAction} produk disesuaikan dengan saran tertinggi.`,
      'success'
    );
  };

  return (
    <div className="min-h-full bg-[#ECEFEC] px-4 py-6 sm:px-6 lg:px-10 lg:py-8">
      <div className="mx-auto max-w-[1000px] space-y-5">
        {/* judul + aksi massal */}
        <div className="flex flex-wrap items-end justify-between gap-x-6 gap-y-4 px-1">
          <div className="min-w-0">
            <h1 className="text-[22px] font-bold leading-none tracking-tight" style={{ color: INK }}>
              Diskon penyelamatan
            </h1>
            <p className="mt-2 max-w-[46ch] text-[13px]" style={{ color: MUTE }}>
              Makin sedikit waktunya, makin besar diskon. Kamu yang memilih; saran cuma contoh harga
              yang paling cepat habis.
            </p>
          </div>

          <button
            type="button"
            onClick={applyAll}
            title={needAction ? 'Hanya menaikkan diskon, stok dan produk tidak dihapus' : 'Tidak ada yang perlu diubah'}
            className="inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-3 text-[13px] font-bold transition-opacity hover:opacity-95"
            style={{ background: ORANGE, color: INK }}
          >
            <Sparkles className="h-4 w-4" />
            {needAction ? `Naikkan ${needAction} diskon ke saran` : 'Semua sudah sesuai saran'}
          </button>
        </div>

        {/* status singkat */}
        <div className={`${CARD} flex flex-wrap items-center gap-x-6 gap-y-2 px-5 py-4`}>
          <span className="flex items-center gap-2.5 text-[13px] font-semibold" style={{ color: INK }}>
            <span
              className="grid h-7 w-7 shrink-0 place-items-center rounded-full"
              style={{ background: needAction ? 'rgba(240,147,93,0.16)' : '#EAEEDA' }}
            >
              {needAction ? (
                <Clock className="h-4 w-4" style={{ color: '#C25B37' }} />
              ) : (
                <Check className="h-4 w-4" style={{ color: '#6B8127' }} />
              )}
            </span>
            {needAction
              ? `${needAction} dari ${rows.length} produk belum memakai saran tertinggi`
              : rows.length
                ? 'Semua produk sudah memakai saran tertinggi'
                : 'Belum ada produk yang aktif hari ini'}
          </span>
          <span className="text-[12px]" style={{ color: FAINT }}>
            Diurutkan dari yang paling mepet · jam ambil {sellerProfile.pickupWindow}
          </span>
        </div>

        {/* kotak coba-coba */}
        <section className={`${CARD} p-5`} aria-label="Coba hitung diskon">
          <div className="flex flex-wrap items-baseline justify-between gap-2">
            <h2 className="text-[15px] font-bold" style={{ color: INK }}>
              Coba hitung dulu
            </h2>
            <p className="text-[12px]" style={{ color: MUTE }}>
              Geser saja — tidak ada yang berubah di etalase.
            </p>
          </div>

          <div className="mt-4 grid gap-5 sm:grid-cols-2">
            <label className="block">
              <span className="flex items-center justify-between text-[12px] font-semibold" style={{ color: SOFT }}>
                Sisa waktu sampai habis
                <span className="font-mono tabular-nums" style={{ color: toneOf(simHours) }}>
                  {simHours.toFixed(1)} jam
                </span>
              </span>
              <input
                type="range"
                min={0.5}
                max={12}
                step={0.5}
                value={simHours}
                onChange={(e) => setSimHours(parseFloat(e.target.value))}
                aria-label="Sisa waktu sampai habis, dalam jam"
                className="mt-2.5 w-full"
                style={{ accentColor: ORANGE }}
              />
            </label>

            <label className="block">
              <span className="flex items-center justify-between text-[12px] font-semibold" style={{ color: SOFT }}>
                Sisa porsi
                <span className="font-mono tabular-nums" style={{ color: INK }}>
                  {simStock} porsi
                </span>
              </span>
              <input
                type="range"
                min={1}
                max={20}
                step={1}
                value={simStock}
                onChange={(e) => setSimStock(parseInt(e.target.value, 10))}
                aria-label="Sisa porsi"
                className="mt-2.5 w-full"
                style={{ accentColor: INK }}
              />
            </label>
          </div>

          <div
            className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 rounded-2xl px-4 py-3"
            style={{ background: '#F7F8F3' }}
          >
            <span className="text-[12px]" style={{ color: MUTE }}>
              Saran
            </span>
            <span
              className="rounded-full px-3 py-1 text-[13px] font-bold"
              style={sim.recommendedDiscount === 100 ? { background: INK, color: CREAM } : { background: 'rgba(240,147,93,0.2)', color: '#B4551F' }}
            >
              {sim.recommendedDiscount === 100 ? 'Gratis (donasi)' : `Diskon ${sim.recommendedDiscount}%`}
            </span>
            <p className="min-w-[16ch] flex-1 text-[12px]" style={{ color: SOFT }}>
              {sim.reason}
            </p>
          </div>
        </section>

        {/* daftar produk */}
        {rows.length === 0 ? (
          <div className={`${CARD} px-5 py-12 text-center`}>
            <p className="text-[15px] font-bold" style={{ color: INK }}>
              Belum ada produk yang bisa diselamatkan
            </p>
            <p className="mt-1.5 text-[13px]" style={{ color: MUTE }}>
              Aktifkan produk di halaman Produk, lalu balik lagi ke sini.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {rows.map(({ p, left, rec, ok }) => (
              <article key={p.id} className={`${CARD} p-4 sm:p-5`}>
                <div className="flex items-start gap-3.5">
                  <img
                    src={p.image}
                    alt=""
                    referrerPolicy="no-referrer"
                    className="h-14 w-14 shrink-0 rounded-[14px] object-cover"
                  />
                  <div className="min-w-0 flex-1">
                    <h2
                      className="break-words text-[15px] font-bold leading-snug"
                      style={{ color: INK }}
                      title={p.name}
                    >
                      {p.name}
                    </h2>
                    <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-[12px]" style={{ color: MUTE }}>
                      <span>{p.stock} porsi</span>
                      <span aria-hidden="true">·</span>
                      <span className="inline-flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5" style={{ color: toneOf(left) }} />
                        <span className="font-semibold" style={{ color: toneOf(left) }}>
                          {urgencyOf(left)}
                        </span>
                        {left !== null && <span className="font-mono tabular-nums">({left} jam)</span>}
                      </span>
                      <span aria-hidden="true">·</span>
                      <span>habis {p.safeConsumptionDeadline}</span>
                    </p>
                  </div>
                  <span className="shrink-0 pl-3 text-right">
                    <span className="block text-[10px] uppercase tracking-[0.12em]" style={{ color: FAINT }}>
                      Harga biasa
                    </span>
                    <span className="mt-0.5 block font-mono text-[12px] line-through" style={{ color: FAINT }}>
                      {formatRupiah(p.originalPrice)}
                    </span>
                    <span className="mt-1.5 block text-[10px] uppercase tracking-[0.12em]" style={{ color: MUTE }}>
                      Sekarang
                    </span>
                    <span className="block font-mono text-[15px] font-bold" style={{ color: INK }}>
                      {p.discountedPrice === 0 ? 'Gratis' : formatRupiah(p.discountedPrice)}
                    </span>
                  </span>
                </div>

                <div className="mt-4 border-t border-[#EFF1EB] pt-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-[12px] font-semibold" style={{ color: SOFT }}>
                      Harga yang dibayar pembeli
                    </p>
                    {!ok && (
                      <span className="text-[11px]" style={{ color: MUTE }}>
                        Saran: {rec.recommendedDiscount === 100 ? 'gratis' : `${rec.recommendedDiscount}%`}
                      </span>
                    )}
                  </div>

                  <div className="mt-2.5 grid grid-cols-4 gap-2" role="group" aria-label={`Diskon untuk ${p.name}`}>
                    {TIERS.map((t) => {
                      const selected = p.discountPercentage === t;
                      const suggested = !ok && rec.recommendedDiscount === t;
                      return (
                        <button
                          key={t}
                          type="button"
                          onClick={() => apply(p, t)}
                          aria-pressed={selected}
                          className="flex flex-col items-center gap-0.5 rounded-2xl px-2 py-2.5 transition-colors"
                          style={
                            selected
                              ? { background: INK, color: '#fff' }
                              : suggested
                                ? { background: 'rgba(240,147,93,0.14)', color: '#B4551F', boxShadow: `inset 0 0 0 1.5px ${ORANGE}` }
                                : { background: '#F3F5F0', color: SOFT }
                          }
                        >
                          <span className="text-[13px] font-bold">
                            {t === 100 ? 'Gratis' : `${t}%`}
                          </span>
                          <span className="font-mono text-[10px] tabular-nums opacity-80">
                            {formatRupiah(priceAt(p, t))}
                          </span>
                        </button>
                      );
                    })}
                  </div>

                  <p className="mt-2.5 text-[12px]" style={{ color: MUTE }}>
                    {ok ? (
                      <span className="inline-flex items-center gap-1.5" style={{ color: '#6B8127' }}>
                        <Check className="h-3.5 w-3.5" />
                        Sudah sesuai saran tertinggi
                      </span>
                    ) : (
                      rec.reason
                    )}
                  </p>
                </div>
              </article>
            ))}

            <p className="flex items-start gap-2 px-1 text-[12px]" style={{ color: FAINT }}>
              <Undo2 className="mt-px h-3.5 w-3.5 shrink-0" />
              Pilih “Gratis” hanya untuk porsi yang benar-benar tidak laku — produk tetap tercatat
              sebagai penyelamatan.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};