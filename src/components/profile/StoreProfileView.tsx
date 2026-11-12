import React, { useEffect, useMemo, useState } from 'react';
import {
  MapPin,
  Save,
  Image as ImageIcon,
  CheckCircle2,
  XCircle,
  Eye,
} from 'lucide-react';
import { BANDUNG_DISTRICTS } from '../../data/bandungDistricts';
import { BandungDistrict, ProductCategory } from '../../types/seller';
import { useApp } from '../../context/AppContext';

/* Profil usaha: satu kolom, label di atas field, target sentuh besar,
   error muncul setelah kolom disentuh, dan bar "simpan" selalu ada di
   bawah jempol. Bahasa di layar sehari-hari, bukan istilah sistem. */

const INK = '#2C434F';
const SOFT = '#4E5F68';
const ORANGE = '#F0935D';
const GREEN = '#4C7A34';
const DANGER = '#B3402A';
const CREAM = '#FBE1B5';

const CARD =
  'rounded-[22px] bg-white shadow-[0_1px_2px_rgba(44,67,79,0.05),0_14px_34px_-18px_rgba(44,67,79,0.28)]';

const inputBase = (bad?: boolean) =>
  'w-full rounded-2xl px-4 py-3.5 text-[15px] leading-tight text-[#2C434F] outline-none transition-colors ' +
  'placeholder:text-[#A9B6BA] focus:bg-white ' +
  (bad
    ? 'bg-[#FDF1EE] ring-1 ring-[#E6A08E] focus:ring-2 focus:ring-[#B3402A]/50'
    : 'bg-[#F3F5F0] focus:ring-2 focus:ring-[#2C434F]/30');

const labelCls = 'mb-1.5 block text-[13px] font-semibold';
const hintCls = 'mt-1.5 text-[12px] text-[#5B6B70]';

const CATEGORIES: ProductCategory[] = [
  'Resto & Makanan Berat',
  'Bakery & Roti',
  'Kue & Pastry',
  'Cafe & Minuman',
  'Katering & Nasi Kotak',
  'Buah & Sayur Segar',
];

type Draft = {
  businessName: string;
  businessCategory: ProductCategory;
  district: BandungDistrict;
  businessAddress: string;
  operatingHours: string;
  pickupWindow: string;
  ownerName: string;
  ownerPhone: string;
  ownerEmail: string;
  storeBio: string;
};

const FORM_KEYS: (keyof Draft)[] = [
  'businessName',
  'businessCategory',
  'district',
  'businessAddress',
  'operatingHours',
  'pickupWindow',
  'ownerName',
  'ownerPhone',
  'ownerEmail',
  'storeBio',
];

/** wrapper label + kontrol + hint/error (di luar komponen utama supaya
    input tidak di-remount tiap ketik: fokus & kursor tetap stabil) */
function Row({
  id,
  label,
  hint,
  optional,
  error,
  children,
}: {
  id: keyof Draft;
  label: string;
  hint?: string;
  optional?: boolean;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className={labelCls} htmlFor={`f-${id}`} style={{ color: error ? DANGER : INK }}>
        {label}
        {optional && (
          <span className="ml-1 text-[11px] font-normal text-[#5B6B70]">(boleh dikosongkan)</span>
        )}
      </label>
      {children}
      {error ? (
        <p
          id={`e-${id}`}
          className="mt-1.5 flex items-start gap-1.5 text-[12px] font-medium"
          style={{ color: DANGER }}
        >
          <XCircle className="mt-px h-3.5 w-3.5 shrink-0" />
          {error}
        </p>
      ) : hint ? (
        <p className={hintCls}>{hint}</p>
      ) : null}
    </div>
  );
}

export const StoreProfileView: React.FC = () => {
  const { sellerProfile, updateSellerProfile, showToast } = useApp();

  const readDraft = (): Draft => ({
    businessName: sellerProfile.businessName,
    businessCategory: sellerProfile.businessCategory,
    district: sellerProfile.district,
    businessAddress: sellerProfile.businessAddress,
    operatingHours: sellerProfile.operatingHours,
    pickupWindow: sellerProfile.pickupWindow,
    ownerName: sellerProfile.ownerName,
    ownerPhone: sellerProfile.ownerPhone,
    ownerEmail: sellerProfile.ownerEmail,
    storeBio: sellerProfile.storeBio,
  });

  const [draft, setDraft] = useState<Draft>(readDraft);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [photoFailed, setPhotoFailed] = useState(false);

  const dirty = useMemo(() => FORM_KEYS.some((k) => draft[k] !== sellerProfile[k]), [draft, sellerProfile]);

  // kalau data diperbarui dari tempat lain (wizard verifikasi), ikut terbaru
  useEffect(() => {
    setDraft(readDraft());
    setTouched({});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sellerProfile.businessName, sellerProfile.district, sellerProfile.ownerPhone]);

  const errors = useMemo(() => {
    const e: Partial<Record<keyof Draft, string>> = {};
    if (!draft.businessName.trim()) e.businessName = 'Nama usaha belum diisi.';
    if (!draft.businessAddress.trim()) e.businessAddress = 'Alamat belum diisi.';
    if (!draft.ownerName.trim()) e.ownerName = 'Nama penanggung jawab belum diisi.';

    const digits = draft.ownerPhone.replace(/[^0-9]/g, '');
    if (!digits) e.ownerPhone = 'Nomor WhatsApp belum diisi.';
    else if (digits.length < 9 || digits.length > 14) e.ownerPhone = 'Nomor terlihat belum lengkap.';

    if (!draft.ownerEmail.trim()) e.ownerEmail = 'Email belum diisi.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(draft.ownerEmail.trim()))
      e.ownerEmail = 'Format email belum sesuai (contoh: nama@usaha.com).';

    if (draft.storeBio.length > 240) e.storeBio = 'Cerita usaha terlalu panjang.';
    return e;
  }, [draft]);

  const problems = Object.keys(errors) as (keyof Draft)[];
  const showError = (k: keyof Draft) => (touched[k] ? errors[k] : undefined);
  const firstProblem = problems.find((k) => touched[k]) ?? problems[0];

  const bind = <K extends keyof Draft>(key: K) => {
    const err = showError(key);
    return {
      id: `f-${key}`,
      value: draft[key],
      'aria-invalid': err ? true : undefined,
      'aria-describedby': err ? `e-${key}` : undefined,
      onChange: (ev: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
        setDraft((d) => ({ ...d, [key]: ev.target.value }) as Draft),
      onBlur: () => setTouched((t) => ({ ...t, [key]: true })),
    };
  };

  const submit = (ev: React.FormEvent) => {
    ev.preventDefault();
    if (problems.length) {
      setTouched(Object.fromEntries(FORM_KEYS.map((k) => [k, true])));
      document.getElementById(`f-${firstProblem}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      showToast('Belum tersimpan', `${problems.length} kolom masih perlu diisi.`, 'error');
      return;
    }
    updateSellerProfile({ ...draft });
    showToast('Profil tersimpan', 'Perubahan kamu sudah tampil di aplikasi pembeli.', 'success');
  };

  const reset = () => {
    setDraft(readDraft());
    setTouched({});
  };

  return (
    <div className="min-h-full bg-[#F5F7F4] px-4 py-6 sm:px-6 lg:px-10 lg:py-8">
      <div className="mx-auto max-w-[680px] space-y-5">
        {/* judul */}
        <div className="flex flex-wrap items-start justify-between gap-3 px-1">
          <div>
            <h1 className="text-[22px] font-bold leading-none tracking-tight" style={{ color: INK }}>
              Profil usaha
            </h1>
            <p className="mt-2 text-[13px] text-[#5B6B70]">
              Data ini yang dilihat pembeli di aplikasi SisaPiring Bandung.
            </p>
          </div>
          <span
            className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-bold"
            style={{ background: '#EAEEDA', color: '#3E5320' }}
          >
            <CheckCircle2 className="h-4 w-4" style={{ color: '#6B8127' }} />
            {sellerProfile.verificationStatus === 'verified' ? 'Usaha terverifikasi' : 'Menunggu verifikasi'}
          </span>
        </div>

        {/* apa yang dilihat pembeli */}
        <div className={`${CARD} overflow-hidden`}>
          <div className="relative h-36 bg-[#DCE3D5]">
            {!photoFailed && (
              <img
                src={sellerProfile.businessPhoto}
                alt=""
                referrerPolicy="no-referrer"
                onError={() => setPhotoFailed(true)}
                className="h-full w-full object-cover"
              />
            )}
            {photoFailed && (
              <div className="flex h-full items-center justify-center">
                <ImageIcon className="h-5 w-5 text-[#5B6B70]" />
              </div>
            )}
            <div className="absolute inset-0 bg-[#1F281A]/75" />
            <span className="absolute left-4 top-3 inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.14em]" style={{ color: CREAM }}>
              <Eye className="h-3 w-3" />
              Looks aplikasi pembeli
            </span>
            <div className="absolute inset-x-4 bottom-3.5 text-white">
              <p className="truncate text-[17px] font-bold leading-tight">
                {draft.businessName || 'Nama usahamu'}
              </p>
              <p className="mt-1 flex flex-wrap items-center gap-x-1.5 gap-y-1 text-[12px] text-white/85">
                <span className="inline-flex items-center gap-1.5" style={{ color: CREAM }}>
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  {draft.businessCategory}
                </span>
                <span aria-hidden="true">·</span>
                <span className="inline-flex items-center gap-1.5">
                  <MapPin className="h-3.5 w-3.5" style={{ color: ORANGE }} />
                  Kec. {draft.district || '—'}, Bandung
                </span>
                <span aria-hidden="true">·</span>
                <span>ambil {draft.pickupWindow || 'belum diatur'}</span>
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={submit} noValidate className="space-y-5">
          {/* 1 identitas */}
          <section className={`${CARD} space-y-4 p-5`} aria-labelledby="sec-1">
            <h2 id="sec-1" className="text-[15px] font-bold" style={{ color: INK }}>
              1 · Identitas usaha
            </h2>

            <Row id="businessName" label="Nama brand" error={showError('businessName')}>
              <input
                {...bind('businessName')}
                className={inputBase(!!showError('businessName'))}
                placeholder="Contoh: Dapur Parahyangan"
                autoComplete="organization"
              />
            </Row>

            <Row id="businessCategory" label="Jenis makanan" hint="Pilih yang paling mendekati.">
              <select
                {...bind('businessCategory')}
                className={`${inputBase()} cursor-pointer appearance-none pr-10`}
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </Row>
          </section>

          {/* 2 lokasi & waktu */}
          <section className={`${CARD} space-y-4 p-5`} aria-labelledby="sec-2">
            <h2 id="sec-2" className="text-[15px] font-bold" style={{ color: INK }}>
              2 · Lokasi &amp; jam ambil
            </h2>

            <Row id="district" label="Kecamatan">
              <select
                {...bind('district')}
                className={`${inputBase()} cursor-pointer appearance-none pr-10`}
              >
                {BANDUNG_DISTRICTS.map((d) => (
                  <option key={d.name} value={d.name}>
                    Kec. {d.name} ({d.popularArea})
                  </option>
                ))}
              </select>
            </Row>

            <Row id="businessAddress" label="Alamat dapur / toko" error={showError('businessAddress')}>
              <input
                {...bind('businessAddress')}
                className={inputBase(!!showError('businessAddress'))}
                placeholder="Jalan, nomor, RT/RW, kelurahan"
                autoComplete="street-address"
              />
            </Row>

            <div className="grid gap-4 sm:grid-cols-2">
              <Row id="operatingHours" label="Jam buka dapur" hint="Contoh: 09.00 - 20.00">
                <input
                  {...bind('operatingHours')}
                  className={inputBase()}
                  inputMode="numeric"
                />
              </Row>
              <Row
                id="pickupWindow"
                label="Jam ambil pesanan"
                hint="Pakai titik, bukan titik dua: 19.00 - 21.00 WIB"
              >
                <input {...bind('pickupWindow')} className={inputBase()} inputMode="numeric" />
              </Row>
            </div>
          </section>

          {/* 3 kontak */}
          <section className={`${CARD} space-y-4 p-5`} aria-labelledby="sec-3">
            <h2 id="sec-3" className="text-[15px] font-bold" style={{ color: INK }}>
              3 · Yang bisa dihubungi
            </h2>

            <Row id="ownerName" label="Nama penanggung jawab" error={showError('ownerName')}>
              <input
                {...bind('ownerName')}
                className={inputBase(!!showError('ownerName'))}
                autoComplete="name"
              />
            </Row>

            <Row
              id="ownerPhone"
              label="Nomor WhatsApp"
              hint="Angka saja, contoh 0812 3456 7890"
              error={showError('ownerPhone')}
            >
              <input
                {...bind('ownerPhone')}
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                className={inputBase(!!showError('ownerPhone'))}
                placeholder="0812 3456 7890"
              />
            </Row>

            <Row id="ownerEmail" label="Email" hint="Untuk laporan penjualan." error={showError('ownerEmail')}>
              <input
                {...bind('ownerEmail')}
                type="email"
                inputMode="email"
                autoComplete="email"
                className={inputBase(!!showError('ownerEmail'))}
                placeholder="nama@usaha.com"
              />
            </Row>
          </section>

          {/* 4 cerita */}
          <section className={`${CARD} space-y-4 p-5`} aria-labelledby="sec-4">
            <h2 id="sec-4" className="text-[15px] font-bold" style={{ color: INK }}>
              4 · Cerita singkat
            </h2>

            <Row id="storeBio" label="Deskripsi untuk pembeli" optional error={showError('storeBio')}>
              <textarea
                {...bind('storeBio')}
                rows={4}
                maxLength={240}
                className={`${inputBase(!!showError('storeBio'))} h-auto py-3 leading-relaxed`}
                placeholder="Contoh: Menu rumahan, dimasak pagi, diambil malam."
              />
            </Row>
            <p className="text-right text-[12px] tabular-nums text-[#5B6B70]">
              {draft.storeBio.length}/240
            </p>
          </section>

          <p className="px-1 text-[12px] text-[#5B6B70]">
            Nomor dan email hanya dipakai untuk pesanan ini, tidak ditampilkan ke publik.
          </p>

          {/* bar simpan: nempel di bawah, selalu dalam jangkauan */}
          <div
            className={`${CARD} sticky bottom-[max(14px,env(safe-area-inset-bottom))] z-20 flex flex-wrap items-center justify-between gap-3 px-4 py-3`}
          >
            <span
              className="flex items-center gap-2 text-[13px] font-semibold"
              style={{ color: INK }}
              role="status"
              aria-live="polite"
            >
              <span
                className="h-2.5 w-2.5 shrink-0 rounded-full"
                style={{ background: dirty ? ORANGE : GREEN }}
              />
              {dirty && problems.length
                ? `${problems.length} kolom masih perlu diisi`
                : dirty
                  ? 'Perubahan belum disimpan'
                  : 'Semua perubahan tersimpan'}
            </span>

            <span className="flex flex-1 items-center justify-end gap-2">
              {dirty && (
                <button
                  type="button"
                  onClick={reset}
                  className="rounded-full px-3.5 py-2.5 text-[13px] font-bold transition-colors hover:bg-[#EDF0E9]"
                  style={{ color: SOFT }}
                >
                  Batalkan
                </button>
              )}
              <button
                type="submit"
                disabled={!dirty}
                className="inline-flex items-center gap-2 rounded-full px-5 py-3 text-[14px] font-bold text-white transition-opacity hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-40"
                style={{ background: INK }}
              >
                <Save className="h-[18px] w-[18px]" />
                {dirty ? 'Simpan perubahan' : 'Tersimpan'}
              </button>
            </span>
          </div>
        </form>
      </div>
    </div>
  );
};