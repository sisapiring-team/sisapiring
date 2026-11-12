import React, { useState } from 'react';
import {
  CheckCircle2,
  Clock,
  XCircle,
  Building2,
  FileText,
  Upload,
  ArrowRight,
  ArrowLeft,
  Check,
  ShieldCheck,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { BANDUNG_DISTRICTS } from '../../data/bandungDistricts';
import { BandungDistrict, ProductCategory, SellerProfile, VerificationStatus } from '../../types/seller';
import { useApp } from '../../context/AppContext';

export const SellerRegistrationView: React.FC = () => {
  const { sellerProfile, updateSellerProfile, setVerificationStatus, showToast, setActiveTab } = useApp();

  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Form state initialized from current profile
  const [formData, setFormData] = useState({
    ownerName: sellerProfile.ownerName,
    ownerPhone: sellerProfile.ownerPhone,
    ownerEmail: sellerProfile.ownerEmail,
    businessName: sellerProfile.businessName,
    businessCategory: sellerProfile.businessCategory,
    businessAddress: sellerProfile.businessAddress,
    district: sellerProfile.district,
    businessPhoto: sellerProfile.businessPhoto,
    businessDocumentName: sellerProfile.businessDocumentName,
    operatingHours: sellerProfile.operatingHours,
    pickupWindow: sellerProfile.pickupWindow,
    storeBio: sellerProfile.storeBio,
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateStep1 = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.ownerName.trim()) newErrors.ownerName = 'Nama lengkap pemilik wajib diisi';
    if (!formData.ownerPhone.trim()) newErrors.ownerPhone = 'Nomor WhatsApp aktif wajib diisi';
    if (!formData.ownerEmail.trim() || !formData.ownerEmail.includes('@'))
      newErrors.ownerEmail = 'Alamat email valid wajib diisi';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.businessName.trim()) newErrors.businessName = 'Nama usaha UMKM wajib diisi';
    if (!formData.businessAddress.trim()) newErrors.businessAddress = 'Alamat usaha di Bandung wajib diisi';
    if (!formData.district) newErrors.district = 'Pilih kecamatan di Kota Bandung';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep3 = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.businessDocumentName) newErrors.businessDocumentName = 'Dokumen legalitas/SKU wajib diunggah';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (step === 1 && validateStep1()) setStep(2);
    else if (step === 2 && validateStep2()) setStep(3);
    else if (step === 3 && validateStep3()) setStep(4);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSellerProfile({
      ownerName: formData.ownerName,
      ownerPhone: formData.ownerPhone,
      ownerEmail: formData.ownerEmail,
      businessName: formData.businessName,
      businessCategory: formData.businessCategory as ProductCategory,
      businessAddress: formData.businessAddress,
      district: formData.district as BandungDistrict,
      businessPhoto: formData.businessPhoto,
      businessDocumentName: formData.businessDocumentName,
      operatingHours: formData.operatingHours,
      pickupWindow: formData.pickupWindow,
      storeBio: formData.storeBio,
      verificationStatus: 'pending_review',
      verificationNotes: 'Pengajuan berkas sedang dalam antrean verifikasi kurator SisaPiring Bandung (Est. 1x24 jam kerja).',
    });
    showToast(
      'Pendaftaran Berhasil Dikirim',
      'Berkas verifikasi UMKM Anda sedang ditinjau kurator SisaPiring Bandung.',
      'success'
    );
    setStep(4);
  };

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-6">
      {/* Current Verification Banner */}
      <div className="bg-white rounded-2xl p-5 border border-neutral-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
              sellerProfile.verificationStatus === 'verified'
                ? 'bg-emerald-100 text-emerald-800'
                : sellerProfile.verificationStatus === 'pending_review'
                ? 'bg-amber-100 text-amber-800'
                : 'bg-rose-100 text-rose-800'
            }`}
          >
            {sellerProfile.verificationStatus === 'verified' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-700" />
            ) : sellerProfile.verificationStatus === 'pending_review' ? (
              <Clock className="w-5 h-5 text-amber-700" />
            ) : (
              <XCircle className="w-5 h-5 text-rose-700" />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-neutral-500 uppercase tracking-wider">
                Status Verifikasi Usaha
              </span>
              <span
                className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                  sellerProfile.verificationStatus === 'verified'
                    ? 'bg-emerald-100 text-emerald-800'
                    : sellerProfile.verificationStatus === 'pending_review'
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-rose-100 text-rose-800'
                }`}
              >
                {sellerProfile.verificationStatus === 'verified'
                  ? 'Terverifikasi Resmi'
                  : sellerProfile.verificationStatus === 'pending_review'
                  ? 'Menunggu Peninjauan (Pending)'
                  : 'Verifikasi Ditolak'}
              </span>
            </div>
            <p className="text-sm font-semibold text-[#292929] mt-0.5">
              {sellerProfile.businessName} · Kec. {sellerProfile.district}, Bandung
            </p>
            {sellerProfile.verificationNotes && (
              <p className="text-xs text-neutral-600 mt-1 leading-relaxed">
                {sellerProfile.verificationNotes}
              </p>
            )}
          </div>
        </div>

        {/* Demo Simulator switcher */}
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-neutral-100 rounded-xl border border-neutral-200 self-start md:self-center">
          <span className="text-[11px] font-medium text-neutral-500 px-2">Uji Status:</span>
          <button
            type="button"
            onClick={() =>
              setVerificationStatus(
                'verified',
                'Terverifikasi resmi oleh Kurator SisaPiring Bandung (Standar Higienitas & Izin Usaha Terpenuhi).'
              )
            }
            className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors ${
              sellerProfile.verificationStatus === 'verified'
                ? 'bg-white text-emerald-800 shadow-xs'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            Verified
          </button>
          <button
            type="button"
            onClick={() =>
              setVerificationStatus(
                'pending_review',
                'Dokumen legalitas dan sertifikasi higienitas sedang ditinjau tim kurasi SisaPiring Bandung.'
              )
            }
            className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors ${
              sellerProfile.verificationStatus === 'pending_review'
                ? 'bg-white text-amber-800 shadow-xs'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            Pending
          </button>
          <button
            type="button"
            onClick={() =>
              setVerificationStatus(
                'rejected',
                'Foto izin usaha/SKU tidak terbaca jelas. Mohon unggah ulang scan dokumen asli beresolusi tinggi.'
              )
            }
            className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-colors ${
              sellerProfile.verificationStatus === 'rejected'
                ? 'bg-white text-rose-800 shadow-xs'
                : 'text-neutral-600 hover:text-neutral-900'
            }`}
          >
            Rejected
          </button>
        </div>
      </div>

      {/* Multi-Step Registration Form Container */}
      <div className="bg-white rounded-2xl border border-neutral-200 shadow-xs overflow-hidden">
        {/* Step Progress Header */}
        <div className="p-6 border-b border-neutral-200 bg-neutral-50/50">
          <h2 className="text-lg font-bold text-[#16382C]">Formulir Pendaftaran & Verifikasi Mitra UMKM</h2>
          <p className="text-xs text-neutral-600 mt-0.5">
            Khusus usaha kuliner lokal berdomisili di Kota Bandung untuk bergabung dalam gerakan penyelamatan pangan.
          </p>

          <div className="grid grid-cols-4 gap-2 mt-6">
            {[
              { num: 1, label: 'Data Pemilik' },
              { num: 2, label: 'Info Usaha & Lokasi' },
              { num: 3, label: 'Legalitas & Foto' },
              { num: 4, label: 'Tinjauan & Status' },
            ].map((s) => (
              <div
                key={s.num}
                onClick={() => setStep(s.num as 1 | 2 | 3 | 4)}
                className={`cursor-pointer transition-all ${
                  step === s.num
                    ? 'border-b-2 border-[#16382C] pb-2'
                    : step > s.num
                    ? 'border-b-2 border-emerald-600 pb-2 text-emerald-800'
                    : 'border-b-2 border-neutral-200 pb-2 text-neutral-400'
                }`}
              >
                <div className="flex items-center gap-1.5 text-xs font-bold">
                  <span
                    className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                      step === s.num
                        ? 'bg-[#16382C] text-white'
                        : step > s.num
                        ? 'bg-emerald-600 text-white'
                        : 'bg-neutral-200 text-neutral-600'
                    }`}
                  >
                    {step > s.num ? <Check className="w-3 h-3" /> : s.num}
                  </span>
                  <span className="hidden sm:inline truncate">{s.label}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Step 1: Owner Information */}
        {step === 1 && (
          <div className="p-6 space-y-5">
            <div className="flex items-center gap-2 pb-3 border-b border-neutral-100">
              <Building2 className="w-5 h-5 text-[#16382C]" />
              <h3 className="text-sm font-bold text-[#292929]">Langkah 1: Identitas Pemilik / Penanggung Jawab</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                  Nama Lengkap Pemilik / Manager Usaha <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.ownerName}
                  onChange={(e) => setFormData({ ...formData, ownerName: e.target.value })}
                  placeholder="Contoh: Kang Ridwan Sasmita"
                  className="w-full px-3.5 py-2.5 text-sm bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#16382C]/20 focus:border-[#16382C]"
                />
                {errors.ownerName && <p className="text-xs text-red-500 mt-1">{errors.ownerName}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                  Nomor WhatsApp Aktif <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.ownerPhone}
                  onChange={(e) => setFormData({ ...formData, ownerPhone: e.target.value })}
                  placeholder="+62 812-XXXX-XXXX"
                  className="w-full px-3.5 py-2.5 text-sm bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#16382C]/20 focus:border-[#16382C]"
                />
                <span className="text-[11px] text-neutral-500 mt-1 block">
                  Digunakan untuk notifikasi pesanan masuk instan
                </span>
                {errors.ownerPhone && <p className="text-xs text-red-500 mt-1">{errors.ownerPhone}</p>}
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                  Alamat Email Resmi <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  value={formData.ownerEmail}
                  onChange={(e) => setFormData({ ...formData, ownerEmail: e.target.value })}
                  placeholder="kontak@usahakuliner.id"
                  className="w-full px-3.5 py-2.5 text-sm bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#16382C]/20 focus:border-[#16382C]"
                />
                {errors.ownerEmail && <p className="text-xs text-red-500 mt-1">{errors.ownerEmail}</p>}
              </div>
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="button"
                onClick={handleNext}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#EE4D2D] hover:bg-[#D73C1C] text-white text-sm font-semibold rounded-xl transition-colors shadow-xs"
              >
                <span>Lanjut ke Info Usaha</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Business & Bandung Location */}
        {step === 2 && (
          <div className="p-6 space-y-5">
            <div className="flex items-center gap-2 pb-3 border-b border-neutral-100">
              <Building2 className="w-5 h-5 text-[#16382C]" />
              <h3 className="text-sm font-bold text-[#292929]">Langkah 2: Informasi Bisnis & Lokasi Kota Bandung</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                  Nama Brand / Usaha Kuliner <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.businessName}
                  onChange={(e) => setFormData({ ...formData, businessName: e.target.value })}
                  placeholder="Contoh: Kala Bakehouse & Coffee"
                  className="w-full px-3.5 py-2.5 text-sm bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#16382C]/20 focus:border-[#16382C]"
                />
                {errors.businessName && <p className="text-xs text-red-500 mt-1">{errors.businessName}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                  Kategori Usaha <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.businessCategory}
                  onChange={(e) => setFormData({ ...formData, businessCategory: e.target.value as ProductCategory })}
                  className="w-full px-3.5 py-2.5 text-sm bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#16382C]/20 focus:border-[#16382C]"
                >
                  <option value="Bakery & Roti">Bakery & Roti</option>
                  <option value="Katering & Nasi Kotak">Katering & Nasi Kotak</option>
                  <option value="Cafe & Minuman">Cafe & Minuman</option>
                  <option value="Kue & Pastry">Kue & Pastry</option>
                  <option value="Resto & Makanan Berat">Resto & Makanan Berat</option>
                  <option value="Buah & Sayur Segar">Buah & Sayur Segar</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                  Kecamatan di Kota Bandung <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.district}
                  onChange={(e) => setFormData({ ...formData, district: e.target.value as BandungDistrict })}
                  className="w-full px-3.5 py-2.5 text-sm bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#16382C]/20 focus:border-[#16382C]"
                >
                  {BANDUNG_DISTRICTS.map((dist) => (
                    <option key={dist.name} value={dist.name}>
                      Kec. {dist.name} ({dist.popularArea})
                    </option>
                  ))}
                </select>
                <span className="text-[11px] text-neutral-500 mt-1 block">
                  Cakupan terbatas khusus wilayah Kota Bandung
                </span>
                {errors.district && <p className="text-xs text-red-500 mt-1">{errors.district}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                  Jam Buka Operasional & Jendela Pickup
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    value={formData.operatingHours}
                    onChange={(e) => setFormData({ ...formData, operatingHours: e.target.value })}
                    placeholder="08:00 - 21:00 WIB"
                    className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-xl"
                  />
                  <input
                    type="text"
                    value={formData.pickupWindow}
                    onChange={(e) => setFormData({ ...formData, pickupWindow: e.target.value })}
                    placeholder="18:00 - 21:30 WIB"
                    className="w-full px-3 py-2 text-xs bg-neutral-50 border border-neutral-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                  Alamat Lengkap Toko / Dapur <span className="text-red-500">*</span>
                </label>
                <textarea
                  rows={2}
                  value={formData.businessAddress}
                  onChange={(e) => setFormData({ ...formData, businessAddress: e.target.value })}
                  placeholder="Contoh: Jl. Progo No. 14, Kel. Citarum, Kec. Bandung Wetan, Kota Bandung, 40115"
                  className="w-full px-3.5 py-2.5 text-sm bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#16382C]/20 focus:border-[#16382C]"
                />
                {errors.businessAddress && <p className="text-xs text-red-500 mt-1">{errors.businessAddress}</p>}
              </div>
            </div>

            <div className="pt-4 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-neutral-600 hover:text-neutral-900"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Kembali</span>
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#EE4D2D] hover:bg-[#D73C1C] text-white text-sm font-semibold rounded-xl transition-colors shadow-xs"
              >
                <span>Lanjut ke Legalitas & Foto</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Legal Documents & Store Photo */}
        {step === 3 && (
          <div className="p-6 space-y-5">
            <div className="flex items-center gap-2 pb-3 border-b border-neutral-100">
              <FileText className="w-5 h-5 text-[#16382C]" />
              <h3 className="text-sm font-bold text-[#292929]">Langkah 3: Dokumen Legalitas & Foto Usaha</h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                  Dokumen Legalitas Usaha (NIB / SIUP / Surat Keterangan Usaha Kelurahan) <span className="text-red-500">*</span>
                </label>
                <div className="border-2 border-dashed border-neutral-300 rounded-xl p-5 text-center bg-neutral-50/50 hover:bg-neutral-50 transition-colors">
                  <Upload className="w-7 h-7 mx-auto text-neutral-400 mb-2" />
                  <p className="text-xs font-semibold text-neutral-700">
                    File Terlampir: <span className="font-mono text-[#16382C]">{formData.businessDocumentName}</span>
                  </p>
                  <p className="text-[11px] text-neutral-500 mt-1">
                    Format didukung: PDF, JPG, PNG (Maksimal 5MB)
                  </p>
                  <div className="mt-3 flex justify-center gap-2">
                    <button
                      type="button"
                      onClick={() =>
                        setFormData({
                          ...formData,
                          businessDocumentName: 'NIB_02847291038_KalaBakehouse.pdf',
                        })
                      }
                      className="px-3 py-1 bg-white border border-neutral-200 rounded-lg text-xs font-medium text-neutral-700 hover:bg-neutral-100"
                    >
                      Gunakan Sampel NIB Resmi
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setFormData({
                          ...formData,
                          businessDocumentName: 'SKU_Kelurahan_Citarum_Bandung.pdf',
                        })
                      }
                      className="px-3 py-1 bg-white border border-neutral-200 rounded-lg text-xs font-medium text-neutral-700 hover:bg-neutral-100"
                    >
                      Gunakan Sampel SKU
                    </button>
                  </div>
                </div>
                {errors.businessDocumentName && (
                  <p className="text-xs text-red-500 mt-1">{errors.businessDocumentName}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                  Foto Depan Toko / Dapur Produksi
                </label>
                <div className="flex items-center gap-4">
                  <img
                    src={formData.businessPhoto}
                    alt="Preview Toko"
                    className="w-24 h-24 rounded-xl object-cover border border-neutral-200 shrink-0"
                    referrerPolicy="no-referrer"
                  />
                  <div className="flex-1 text-xs text-neutral-600">
                    <p className="font-semibold text-neutral-800">Foto Etalase Terpasang</p>
                    <p className="mt-0.5">
                      Foto ini akan dilihat oleh pelanggan saat menjemput sisa piring di lokasi Anda.
                    </p>
                    <div className="mt-2 flex gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          setFormData({
                            ...formData,
                            businessPhoto: '/assets/images/sisapiring_storefront_1794322286782.jpg',
                          })
                        }
                        className="px-2.5 py-1 bg-neutral-100 rounded text-[11px] font-medium text-neutral-700 hover:bg-neutral-200"
                      >
                        Pilih Storefront Bandung
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setFormData({
                            ...formData,
                            businessPhoto: '/assets/images/sisapiring_bakery_1794322284427.jpg',
                          })
                        }
                        className="px-2.5 py-1 bg-neutral-100 rounded text-[11px] font-medium text-neutral-700 hover:bg-neutral-200"
                      >
                        Pilih Display Bakery
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                  Deskripsi / Komitmen Penyelamatan Makanan
                </label>
                <textarea
                  rows={2}
                  value={formData.storeBio}
                  onChange={(e) => setFormData({ ...formData, storeBio: e.target.value })}
                  placeholder="Ceritakan profil usaha dan komitmen zero food waste toko Anda..."
                  className="w-full px-3.5 py-2.5 text-sm bg-neutral-50 border border-neutral-200 rounded-xl"
                />
              </div>
            </div>

            <div className="pt-4 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-medium text-neutral-600 hover:text-neutral-900"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Kembali</span>
              </button>
              <button
                type="button"
                onClick={handleNext}
                className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#EE4D2D] hover:bg-[#D73C1C] text-white text-sm font-semibold rounded-xl transition-colors shadow-xs"
              >
                <span>Tinjau Ringkasan</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Review & Submit */}
        {step === 4 && (
          <div className="p-6 space-y-6">
            <div className="flex items-center gap-2 pb-3 border-b border-neutral-100">
              <ShieldCheck className="w-5 h-5 text-[#16382C]" />
              <h3 className="text-sm font-bold text-[#292929]">Langkah 4: Konfirmasi Berkas Pendaftaran Mitra</h3>
            </div>

            <div className="bg-neutral-50 rounded-xl p-4 border border-neutral-200 space-y-3 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <span className="text-neutral-400 block">Nama Pemilik</span>
                  <span className="font-semibold text-neutral-800 text-sm">{formData.ownerName}</span>
                </div>
                <div>
                  <span className="text-neutral-400 block">Kontak WhatsApp</span>
                  <span className="font-semibold text-neutral-800 text-sm">{formData.ownerPhone}</span>
                </div>
                <div>
                  <span className="text-neutral-400 block">Nama Usaha UMKM</span>
                  <span className="font-semibold text-[#16382C] text-sm">{formData.businessName}</span>
                </div>
                <div>
                  <span className="text-neutral-400 block">Kategori</span>
                  <span className="font-semibold text-neutral-800 text-sm">{formData.businessCategory}</span>
                </div>
                <div>
                  <span className="text-neutral-400 block">Wilayah Bandung</span>
                  <span className="font-semibold text-neutral-800 text-sm">Kec. {formData.district}</span>
                </div>
                <div>
                  <span className="text-neutral-400 block">Dokumen Legalitas</span>
                  <span className="font-semibold text-neutral-800 text-sm font-mono">{formData.businessDocumentName}</span>
                </div>
                <div className="sm:col-span-2">
                  <span className="text-neutral-400 block">Alamat Lengkap</span>
                  <span className="font-medium text-neutral-800">{formData.businessAddress}</span>
                </div>
              </div>
            </div>

            {/* Terms confirmation */}
            <div className="p-4 bg-emerald-50/50 rounded-xl border border-emerald-100 flex items-start gap-3">
              <CheckCircle2 className="w-5 h-5 text-[#16382C] shrink-0 mt-0.5" />
              <div className="text-xs text-neutral-700 leading-relaxed">
                <p className="font-semibold text-[#16382C]">Pernyataan Komitmen Kualitas & Higienitas</p>
                <p className="mt-1">
                  Dengan mengirimkan formulir ini, pemilik UMKM menyatakan seluruh data benar dan berkomitmen memenuhi
                  standar keamanan pangan SisaPiring, menjaga rantai dingin/kebersihan kemasan, serta menghormati jadwal
                  pengambilan pesanan warga Bandung.
                </p>
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setStep(3)}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 text-sm font-medium text-neutral-600 hover:text-neutral-900"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Ubah Data</span>
              </button>

              <div className="w-full sm:w-auto flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setActiveTab('dashboard')}
                  className="w-full sm:w-auto px-4 py-2.5 text-xs font-semibold text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-xl"
                >
                  Kembali ke Dashboard
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-[#16382C] hover:bg-[#214F3F] text-white text-sm font-semibold rounded-xl transition-colors shadow-xs"
                >
                  <Check className="w-4 h-4 text-[#FFD230]" />
                  <span>Kirim Berkas Verifikasi</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
