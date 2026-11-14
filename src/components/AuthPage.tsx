import React, { useState } from 'react';
import { apiErrorMessage, loginRemote, registerRemote } from '../lib/api';
import {
  ArrowLeft,
  ArrowRight,
  Lock,
  Mail,
  User,
  Phone,
  Eye,
  EyeOff,
  CheckCircle2,
  MapPin,
  Store,
  Upload,
  FileText,
  Image as ImageIcon,
  X,
} from 'lucide-react';

export interface UserAccount {
  name: string;
  email: string;
  phone: string;
  role?: 'buyer' | 'seller' | 'admin' | string;
  district?: string;
  defaultAddress?: string;
}

interface AuthPageProps {
  initialMode?: 'login' | 'register';
  onSuccessLogin: (user: UserAccount) => void;
  onBack: () => void;
}

const BANDUNG_DISTRICTS = [
  'Coblong (Dago / Dipatiukur)',
  'Sumur Bandung (Braga)',
  'Bandung Wetan (Riau / Citarum)',
  'Lengkong (Burangrang)',
  'Buahbatu',
  'Sukasari (Setiabudi)',
  'Cicendo (Pasirkaliki)',
];

const UMKM_BUSINESS_CATEGORIES = [
  'Roti, Kue & Pastry',
  'Nasi, Lauk & Warung Makan',
  'Martabak & Jajanan Sore',
  'Bakso, Soto & Bakmie',
  'Kopi, Teh & Minuman Segar',
  'Katering & Dapur Rumahan',
];

const UMKM_DOC_TYPES = [
  'KTP Penanggung Jawab',
  'NIB (Nomor Induk Berusaha)',
  'Surat Keterangan Usaha (SKU)',
  'Sertifikat Halal / PIRT',
];

export const AuthPage: React.FC<AuthPageProps> = ({
  initialMode = 'login',
  onSuccessLogin,
  onBack,
}) => {
  const [mode, setMode] = useState<'login' | 'register' | 'register-umkm'>(initialMode);
  // Sequential Registration Pages (invisible step state):
  // 1 = Isi Nomor Telepon
  // 2 = Isi Nama, Email & Kata Sandi
  // 3 = Isi Alamat Default (setelah pendaftaran akun selesai)
  const [registerStep, setRegisterStep] = useState<1 | 2 | 3>(1);

  // Login Form States
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // Register Form States (Sequential)
  const [phone, setPhone] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [district, setDistrict] = useState(BANDUNG_DISTRICTS[0]);
  const [streetAddress, setStreetAddress] = useState('');
  const [addressLandmark, setAddressLandmark] = useState('');

  // UMKM Registration Sequential States (3 Pages):
  // Page 1: Nama pemilik/penanggung jawab, Nomor telepon aktif, Email
  // Page 2: Identitas Usaha Bagian 1 (Nama usaha, Kategori usaha, Alamat usaha)
  // Page 3: Identitas Usaha Bagian 2 (Foto usaha & Dokumen pendukung usaha)
  const [umkmStep, setUmkmStep] = useState<1 | 2 | 3>(1);
  const [umkmOwnerName, setUmkmOwnerName] = useState('');
  const [umkmPhone, setUmkmPhone] = useState('');
  const [umkmEmail, setUmkmEmail] = useState('');
  const [umkmStoreName, setUmkmStoreName] = useState('');
  const [umkmCategory, setUmkmCategory] = useState(UMKM_BUSINESS_CATEGORIES[0]);
  const [umkmDistrict, setUmkmDistrict] = useState(BANDUNG_DISTRICTS[0]);
  const [umkmAddress, setUmkmAddress] = useState('');
  const [umkmPhotoName, setUmkmPhotoName] = useState('');
  const [umkmPhotoPreview, setUmkmPhotoPreview] = useState<string | null>(null);
  const [umkmDocType, setUmkmDocType] = useState(UMKM_DOC_TYPES[0]);
  const [umkmDocName, setUmkmDocName] = useState('');
  const [umkmSubmitted, setUmkmSubmitted] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [showSuccessRegisterPopup, setShowSuccessRegisterPopup] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const switchMode = (nextMode: 'login' | 'register' | 'register-umkm') => {
    setMode(nextMode);
    setRegisterStep(1);
    setUmkmStep(1);
    setUmkmSubmitted(false);
    setErrorMsg('');
  };

  // Handler for Single-Page Login (Email + Password)
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!loginIdentifier.trim()) {
      setErrorMsg('Mohon masukkan alamat email Anda.');
      return;
    }
    if (!loginIdentifier.includes('@')) {
      setErrorMsg('Masuk menggunakan alamat email yang terdaftar.');
      return;
    }
    if (!loginPassword) {
      setErrorMsg('Mohon masukkan kata sandi Anda.');
      return;
    }

    setIsSubmitting(true);
    try {
      const { user } = await loginRemote(loginIdentifier.trim(), loginPassword);
      onSuccessLogin({
        name: user.name,
        email: user.email,
        phone: user.phone || '081234567890',
        role: user.role,
        district: user.district || 'Coblong (Dago / Dipatiukur)',
        defaultAddress: user.defaultAddress || '',
      });
    } catch (error) {
      setErrorMsg(apiErrorMessage(error, 'Email atau kata sandi tidak sesuai.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  // Page 1 Registration: Validate Phone Number -> Go to Page 2
  const handleStep1PhoneSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    const cleanPhone = phone.replace(/\D/g, '');
    if (cleanPhone.length < 9) {
      setErrorMsg('Mohon masukkan nomor telepon / WhatsApp aktif (minimal 9 digit).');
      return;
    }

    setRegisterStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Page 2 Registration: Validate Name, Email & Password -> Go to Page 3 (Default Address Page)
  const handleStep2AccountSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!name.trim() || name.trim().length < 2) {
      setErrorMsg('Mohon masukkan nama lengkap Anda.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setErrorMsg('Mohon masukkan alamat email yang valid.');
      return;
    }
    if (password.length < 8) {
      setErrorMsg('Kata sandi minimal terdiri dari 8 karakter.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg('Konfirmasi kata sandi tidak cocok.');
      return;
    }

    setRegisterStep(3);
    setShowSuccessRegisterPopup(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Page 3 Registration: Save Default Address -> Complete Registration & Login
  const handleStep3AddressSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!streetAddress.trim() || streetAddress.trim().length < 5) {
      setErrorMsg('Mohon isi alamat lengkap default Anda di Bandung.');
      return;
    }

    const fullDefaultAddress = addressLandmark.trim()
      ? `${streetAddress.trim()} (${addressLandmark.trim()}), ${district}, Bandung`
      : `${streetAddress.trim()}, ${district}, Bandung`;

    setIsSubmitting(true);
    try {
      const { user } = await registerRemote({
        name: name.trim(),
        email: email.trim(),
        phone: phone.trim(),
        district,
        default_address: fullDefaultAddress,
        password,
        password_confirmation: confirmPassword,
        role: 'buyer',
      });

      onSuccessLogin({
        name: user.name,
        email: user.email,
        phone: user.phone || phone.trim(),
        role: user.role,
        district: user.district || district,
        defaultAddress: user.defaultAddress || fullDefaultAddress,
      });
    } catch (error) {
      setErrorMsg(apiErrorMessage(error, 'Pendaftaran gagal. Silakan periksa data Anda.'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleHeaderBack = () => {
    setErrorMsg('');
    if (mode === 'register' && registerStep === 2) {
      setRegisterStep(1);
      return;
    }
    if (mode === 'register' && registerStep === 3) {
      setRegisterStep(2);
      return;
    }
    if (mode === 'register-umkm' && !umkmSubmitted && umkmStep === 3) {
      setUmkmStep(2);
      return;
    }
    if (mode === 'register-umkm' && !umkmSubmitted && umkmStep === 2) {
      setUmkmStep(1);
      return;
    }
    if (mode === 'register-umkm') {
      switchMode('login');
      return;
    }
    if (mode === 'register' && registerStep === 1) {
      switchMode('login');
      return;
    }
    onBack();
  };

  // UMKM Page 1: Nama Pemilik/Penanggung Jawab, Nomor Telepon Aktif & Email
  const handleUmkmStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!umkmOwnerName.trim() || umkmOwnerName.trim().length < 2) {
      setErrorMsg('Mohon masukkan nama pemilik atau penanggung jawab usaha.');
      return;
    }
    if (umkmPhone.replace(/\D/g, '').length < 9) {
      setErrorMsg('Mohon masukkan nomor telepon / WhatsApp aktif (minimal 9 digit).');
      return;
    }
    if (!umkmEmail.trim() || !umkmEmail.includes('@')) {
      setErrorMsg('Mohon masukkan alamat email aktif pemilik atau usaha.');
      return;
    }

    setUmkmStep(2);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // UMKM Page 2: Identitas Usaha Bagian 1 (Nama Usaha, Kategori Usaha, Alamat Usaha)
  const handleUmkmStep2Submit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!umkmStoreName.trim() || umkmStoreName.trim().length < 2) {
      setErrorMsg('Mohon masukkan nama usaha UMKM Anda.');
      return;
    }
    if (!umkmCategory.trim()) {
      setErrorMsg('Mohon pilih kategori usaha UMKM Anda.');
      return;
    }
    if (!umkmAddress.trim() || umkmAddress.trim().length < 5) {
      setErrorMsg('Mohon masukkan alamat lengkap lokasi usaha di Bandung.');
      return;
    }

    setUmkmStep(3);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // UMKM Page 3: Identitas Usaha Bagian 2 (Foto & Dokumen Pendukung Usaha)
  const handleUmkmStep3Submit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!umkmPhotoName && !umkmDocName) {
      setErrorMsg('Mohon unggah minimal foto tempat/produk usaha atau dokumen pendukung usaha.');
      return;
    }

    setUmkmSubmitted(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handlePhotoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUmkmPhotoName(file.name);
    setErrorMsg('');
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setUmkmPhotoPreview(reader.result);
        }
      };
      reader.readAsDataURL(file);
    } else {
      setUmkmPhotoPreview(null);
    }
  };

  const handleDocFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUmkmDocName(file.name);
    setErrorMsg('');
  };

  return (
    <div className="min-h-screen bg-white pb-12 flex flex-col">
      {/* Top Sub-Header with Back Button */}
      <section className="bg-white border-b border-stone-200/90 py-3.5 sm:py-4">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleHeaderBack}
              aria-label="Kembali"
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-stone-100 hover:bg-stone-200/70 flex items-center justify-center text-stone-800 transition-colors cursor-pointer shrink-0"
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            <div>
              <h1 className="text-base sm:text-lg font-bold text-stone-900 tracking-tight">
                {mode === 'login'
                  ? 'Masuk ke SisaPiring'
                  : mode === 'register-umkm'
                  ? 'Pendaftaran Mitra UMKM'
                  : registerStep === 3
                  ? 'Atur Alamat Default'
                  : 'Daftar Akun SisaPiring'}
              </h1>
              <p className="text-[11px] sm:text-xs text-stone-500">
                {mode === 'login'
                  ? 'Masukkan nama/email dan kata sandi Anda'
                  : mode === 'register-umkm'
                  ? umkmSubmitted
                    ? 'Pendaftaran usaha berhasil dikirim'
                    : umkmStep === 1
                    ? 'Data pemilik atau penanggung jawab usaha'
                    : umkmStep === 2
                    ? 'Identitas nama, kategori, dan alamat usaha'
                    : 'Unggah foto & dokumen pendukung usaha'
                  : registerStep === 1
                  ? 'Masukkan nomor telepon aktif Anda'
                  : registerStep === 2
                  ? 'Lengkapi nama, email, dan kata sandi akun'
                  : 'Simpan alamat default Bandung Anda'}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Centered Auth Card + Below-Card Button */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-6 sm:py-12">
        <div className="w-full max-w-md space-y-3.5">
          <div className="bg-white border border-stone-200/90 rounded-2xl shadow-xs overflow-hidden">
          {mode === 'login' ? (
            /* ================= LOGIN PAGE: DIRECT NAMA/EMAIL & PASSWORD ================= */
            <form onSubmit={handleLoginSubmit} className="p-5 sm:p-7 space-y-4">
              <div className="space-y-1">
                <h2 className="text-lg sm:text-xl font-bold text-stone-900 font-display">
                  Selamat Datang Kembali
                </h2>
                <p className="text-xs text-stone-500 leading-relaxed">
                  Masukkan email terdaftar beserta kata sandi Anda untuk langsung masuk.
                </p>
              </div>

              <div>
                <label
                  htmlFor="login-identifier"
                  className="block text-xs font-medium text-stone-700 mb-1"
                >
                  Email
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="login-identifier"
                    type="email"
                    value={loginIdentifier}
                    onChange={(e) => setLoginIdentifier(e.target.value)}
                    placeholder="nama@email.com"
                    className="w-full h-11 pl-10 pr-3.5 text-xs sm:text-sm bg-white border border-stone-300 rounded-xl focus:outline-none focus:border-emerald-900 focus:bg-white transition-colors"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="login-password"
                  className="block text-xs font-medium text-stone-700 mb-1"
                >
                  Kata Sandi
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Masukkan kata sandi"
                    className="w-full h-11 pl-10 pr-10 text-xs sm:text-sm bg-white border border-stone-300 rounded-xl focus:outline-none focus:border-emerald-900 focus:bg-white transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 cursor-pointer"
                    aria-label="Tampilkan kata sandi"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {errorMsg && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-medium">
                  {errorMsg}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-12 bg-[#1F281A] hover:bg-emerald-900 active:scale-[0.99] text-white text-xs sm:text-sm font-semibold rounded-xl transition-all cursor-pointer shadow-xs disabled:opacity-60 disabled:cursor-wait"
              >
                {isSubmitting ? 'Memproses...' : 'Masuk Sekarang'}
              </button>

              <div className="pt-2 border-t border-stone-100 text-center">
                <p className="text-xs text-stone-600">
                  Belum punya akun SisaPiring?{' '}
                  <button
                    type="button"
                    onClick={() => switchMode('register')}
                    className="font-semibold text-[#1F281A] underline underline-offset-2 cursor-pointer"
                  >
                    Daftar di sini
                  </button>
                </p>
              </div>
            </form>
          ) : mode === 'register' && registerStep === 1 ? (
            /* ================= REGISTER PAGE 1: ISI NOMOR TELEPON ================= */
            <form onSubmit={handleStep1PhoneSubmit} className="p-5 sm:p-7 space-y-4">
              <div className="space-y-1">
                <h2 className="text-lg sm:text-xl font-bold text-stone-900 font-display">
                  Masukkan Nomor Telepon
                </h2>
                <p className="text-xs text-stone-500 leading-relaxed">
                  Masukkan nomor telepon / WhatsApp aktif Anda untuk memulai pendaftaran akun baru.
                </p>
              </div>

              <div>
                <label
                  htmlFor="reg-phone"
                  className="block text-xs font-medium text-stone-700 mb-1"
                >
                  Nomor Telepon / WhatsApp
                </label>
                <div className="relative">
                  <Phone className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="reg-phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="Contoh: 081234567890"
                    autoFocus
                    className="w-full h-11 pl-10 pr-3.5 text-xs sm:text-sm bg-white border border-stone-300 rounded-xl focus:outline-none focus:border-emerald-900 focus:bg-white font-mono-tabular transition-colors"
                  />
                </div>
                <p className="text-[11px] text-stone-400 mt-1.5">
                  Nomor ini akan digunakan untuk pengiriman kode tiket pengambilan makanan UMKM.
                </p>
              </div>

              {errorMsg && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-medium">
                  {errorMsg}
                </div>
              )}

              <button
                type="submit"
                className="w-full h-12 bg-[#1F281A] hover:bg-emerald-900 active:scale-[0.99] text-white text-xs sm:text-sm font-semibold rounded-xl transition-all inline-flex items-center justify-center gap-2 cursor-pointer shadow-xs"
              >
                <span>Lanjut</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="pt-2 border-t border-stone-100 text-center">
                <p className="text-xs text-stone-600">
                  Sudah punya akun?{' '}
                  <button
                    type="button"
                    onClick={() => switchMode('login')}
                    className="font-semibold text-[#1F281A] underline underline-offset-2 cursor-pointer"
                  >
                    Login di sini
                  </button>
                </p>
              </div>
            </form>
          ) : mode === 'register' && registerStep === 2 ? (
            /* ================= REGISTER PAGE 2: ISI NAMA, EMAIL & KATA SANDI ================= */
            <form onSubmit={handleStep2AccountSubmit} className="p-5 sm:p-7 space-y-4">
              <div className="space-y-1">
                <h2 className="text-lg sm:text-xl font-bold text-stone-900 font-display">
                  Lengkapi Profil & Kata Sandi
                </h2>
                <p className="text-xs text-stone-500 leading-relaxed">
                  Isi nama lengkap, alamat email, dan buat kata sandi untuk akun SisaPiring Anda.
                </p>
              </div>

              <div>
                <label
                  htmlFor="reg-name"
                  className="block text-xs font-medium text-stone-700 mb-1"
                >
                  Nama Lengkap
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="reg-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Contoh: Nabil Rachman"
                    autoFocus
                    className="w-full h-11 pl-10 pr-3.5 text-xs sm:text-sm bg-white border border-stone-300 rounded-xl focus:outline-none focus:border-emerald-900 focus:bg-white transition-colors"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="reg-email"
                  className="block text-xs font-medium text-stone-700 mb-1"
                >
                  Alamat Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="reg-email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Contoh: nama@email.com"
                    className="w-full h-11 pl-10 pr-3.5 text-xs sm:text-sm bg-white border border-stone-300 rounded-xl focus:outline-none focus:border-emerald-900 focus:bg-white transition-colors"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="reg-password"
                  className="block text-xs font-medium text-stone-700 mb-1"
                >
                  Kata Sandi
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="reg-password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Minimal 6 karakter"
                    className="w-full h-11 pl-10 pr-10 text-xs sm:text-sm bg-white border border-stone-300 rounded-xl focus:outline-none focus:border-emerald-900 focus:bg-white transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 cursor-pointer"
                    aria-label="Tampilkan kata sandi"
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label
                  htmlFor="reg-confirm-password"
                  className="block text-xs font-medium text-stone-700 mb-1"
                >
                  Konfirmasi Kata Sandi
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="reg-confirm-password"
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Ulangi kata sandi"
                    className="w-full h-11 pl-10 pr-3.5 text-xs sm:text-sm bg-white border border-stone-300 rounded-xl focus:outline-none focus:border-emerald-900 focus:bg-white transition-colors"
                  />
                </div>
              </div>

              {errorMsg && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-medium">
                  {errorMsg}
                </div>
              )}

              <button
                type="submit"
                className="w-full h-12 bg-[#1F281A] hover:bg-emerald-900 active:scale-[0.99] text-white text-xs sm:text-sm font-semibold rounded-xl transition-all inline-flex items-center justify-center gap-2 cursor-pointer shadow-xs"
              >
                <span>Daftarkan Akun</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          ) : mode === 'register' ? (
            /* ================= REGISTER PAGE 3: ISI ALAMAT DEFAULT (FULL ADDRESS CARD) ================= */
            <form onSubmit={handleStep3AddressSubmit} className="p-5 sm:p-7 space-y-4">
              <div className="space-y-1">
                <h2 className="text-lg sm:text-xl font-bold text-stone-900 font-display">
                  Atur Alamat Default
                </h2>
                <p className="text-xs text-stone-500 leading-relaxed">
                  Alamat ini digunakan sebagai lokasi utama Anda saat memesan paket penyelamatan makanan UMKM Bandung.
                </p>
              </div>

              <div>
                <label
                  htmlFor="reg-district"
                  className="block text-xs font-medium text-stone-700 mb-1"
                >
                  Kecamatan di Kota Bandung
                </label>
                <select
                  id="reg-district"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  className="w-full h-11 px-3 text-xs sm:text-sm bg-white border border-stone-300 rounded-xl focus:outline-none focus:border-emerald-900 focus:bg-white cursor-pointer"
                >
                  {BANDUNG_DISTRICTS.map((d) => (
                    <option key={d} value={d}>
                      {d}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="reg-street"
                  className="block text-xs font-medium text-stone-700 mb-1"
                >
                  Alamat Lengkap (Nama Jalan, No. Rumah / Kos, RT/RW)
                </label>
                <div className="relative">
                  <MapPin className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5 pointer-events-none" />
                  <textarea
                    id="reg-street"
                    rows={3}
                    value={streetAddress}
                    onChange={(e) => setStreetAddress(e.target.value)}
                    placeholder="Contoh: Jl. Tubagus Ismail Dalam No. 14, RT 02 / RW 05"
                    autoFocus
                    className="w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm bg-white border border-stone-300 rounded-xl focus:outline-none focus:border-emerald-900 focus:bg-white transition-colors"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="reg-landmark"
                  className="block text-xs font-medium text-stone-700 mb-1"
                >
                  Detail Patokan Lokasi (Opsional)
                </label>
                <input
                  id="reg-landmark"
                  type="text"
                  value={addressLandmark}
                  onChange={(e) => setAddressLandmark(e.target.value)}
                  placeholder="Contoh: Pagar hitam sebelah warkop"
                  className="w-full h-11 px-3.5 text-xs sm:text-sm bg-white border border-stone-300 rounded-xl focus:outline-none focus:border-emerald-900 focus:bg-white transition-colors"
                />
              </div>

              {errorMsg && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-medium">
                  {errorMsg}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-12 bg-[#f89254] hover:bg-[#e57d3d] active:scale-[0.99] text-white text-xs sm:text-sm font-semibold rounded-xl transition-all cursor-pointer shadow-xs disabled:opacity-60 disabled:cursor-wait"
              >
                {isSubmitting ? 'Mendaftarkan...' : 'Simpan Alamat Default & Mulai Belanja'}
              </button>
            </form>
          ) : (
            /* ================= REGISTER UMKM VIEW (3 SEQUENTIAL PAGES) ================= */
            <div className="p-5 sm:p-7 space-y-4">
              {umkmSubmitted ? (
                <div className="py-3 text-center space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-950/10 text-[#1F281A] flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div className="space-y-1.5">
                    <h2 className="text-base sm:text-lg font-bold text-stone-900 font-display">
                      Pendaftaran UMKM "{umkmStoreName}" Diterima!
                    </h2>
                    <p className="text-xs text-stone-600 leading-relaxed">
                      Terima kasih, <strong>{umkmOwnerName}</strong>. Tim verifikasi mitra SisaPiring Bandung akan menghubungi nomor <strong>{umkmPhone}</strong> dan email <strong>{umkmEmail}</strong>.
                    </p>
                  </div>

                  <div className="bg-white border border-stone-200 rounded-xl p-3.5 text-left space-y-1.5 text-xs text-stone-700">
                    <p>
                      <span className="text-stone-400">Penanggung Jawab:</span>{' '}
                      <strong className="text-stone-900">{umkmOwnerName}</strong>
                    </p>
                    <p>
                      <span className="text-stone-400">Nama & Kategori Usaha:</span>{' '}
                      <strong className="text-stone-900">{umkmStoreName}</strong> ({umkmCategory})
                    </p>
                    <p>
                      <span className="text-stone-400">Lokasi Usaha:</span>{' '}
                      <span>{umkmAddress}, {umkmDistrict}</span>
                    </p>
                    <p>
                      <span className="text-stone-400">Dokumen Terlampir:</span>{' '}
                      <span>
                        {[umkmPhotoName && `Foto: ${umkmPhotoName}`, umkmDocName && `${umkmDocType}: ${umkmDocName}`]
                          .filter(Boolean)
                          .join(' · ')}
                      </span>
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => switchMode('login')}
                    className="w-full h-11 bg-[#1F281A] hover:bg-emerald-900 text-white text-xs sm:text-sm font-semibold rounded-xl transition-colors cursor-pointer"
                  >
                    Kembali ke Halaman Login
                  </button>
                </div>
              ) : umkmStep === 1 ? (
                /* -------- UMKM PAGE 1: NAMA PEMILIK, NOMOR TELEPON AKTIF & EMAIL -------- */
                <form onSubmit={handleUmkmStep1Submit} className="space-y-4">
                  <div className="space-y-1">
                    <h2 className="text-lg sm:text-xl font-bold text-stone-900 font-display">
                      Data Pemilik / Penanggung Jawab
                    </h2>
                    <p className="text-xs text-stone-500 leading-relaxed">
                      Lengkapi identitas pemilik atau penanggung jawab beserta kontak aktif untuk proses verifikasi mitra UMKM.
                    </p>
                  </div>

                  <div>
                    <label
                      htmlFor="umkm-owner"
                      className="block text-xs font-medium text-stone-700 mb-1"
                    >
                      Nama Pemilik atau Penanggung Jawab
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        id="umkm-owner"
                        type="text"
                        value={umkmOwnerName}
                        onChange={(e) => setUmkmOwnerName(e.target.value)}
                        placeholder="Contoh: Bapak Sudarto"
                        autoFocus
                        className="w-full h-11 pl-10 pr-3.5 text-xs sm:text-sm bg-white border border-stone-300 rounded-xl focus:outline-none focus:border-emerald-900 focus:bg-white transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="umkm-phone"
                      className="block text-xs font-medium text-stone-700 mb-1"
                    >
                      Nomor Telepon / WhatsApp Aktif
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        id="umkm-phone"
                        type="tel"
                        value={umkmPhone}
                        onChange={(e) => setUmkmPhone(e.target.value)}
                        placeholder="Contoh: 081234567890"
                        className="w-full h-11 pl-10 pr-3.5 text-xs sm:text-sm bg-white border border-stone-300 rounded-xl focus:outline-none focus:border-emerald-900 focus:bg-white font-mono-tabular transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="umkm-email"
                      className="block text-xs font-medium text-stone-700 mb-1"
                    >
                      Alamat Email Aktif
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        id="umkm-email"
                        type="email"
                        value={umkmEmail}
                        onChange={(e) => setUmkmEmail(e.target.value)}
                        placeholder="Contoh: pemilik@usahaumkm.com"
                        className="w-full h-11 pl-10 pr-3.5 text-xs sm:text-sm bg-white border border-stone-300 rounded-xl focus:outline-none focus:border-emerald-900 focus:bg-white transition-colors"
                      />
                    </div>
                  </div>

                  {errorMsg && (
                    <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-medium">
                      {errorMsg}
                    </div>
                  )}

                  <button
                    type="submit"
                    className="w-full h-12 bg-[#1F281A] hover:bg-emerald-900 active:scale-[0.99] text-white text-xs sm:text-sm font-semibold rounded-xl transition-all inline-flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                  >
                    <span>Lanjut ke Identitas Usaha</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              ) : umkmStep === 2 ? (
                /* -------- UMKM PAGE 2: IDENTITAS USAHA BAGIAN 1 (NAMA, KATEGORI & ALAMAT) -------- */
                <form onSubmit={handleUmkmStep2Submit} className="space-y-4">
                  <div className="space-y-1">
                    <h2 className="text-lg sm:text-xl font-bold text-stone-900 font-display">
                      Identitas & Lokasi Usaha
                    </h2>
                    <p className="text-xs text-stone-500 leading-relaxed">
                      Masukkan nama usaha kuliner, kategori usaha, serta alamat lengkap lokasi operasional di Bandung.
                    </p>
                  </div>

                  <div>
                    <label
                      htmlFor="umkm-store-name"
                      className="block text-xs font-medium text-stone-700 mb-1"
                    >
                      Nama Usaha
                    </label>
                    <div className="relative">
                      <Store className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        id="umkm-store-name"
                        type="text"
                        value={umkmStoreName}
                        onChange={(e) => setUmkmStoreName(e.target.value)}
                        placeholder="Contoh: Martabak Legit Burangrang"
                        autoFocus
                        className="w-full h-11 pl-10 pr-3.5 text-xs sm:text-sm bg-white border border-stone-300 rounded-xl focus:outline-none focus:border-emerald-900 focus:bg-white transition-colors"
                      />
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="umkm-category"
                      className="block text-xs font-medium text-stone-700 mb-1"
                    >
                      Kategori Usaha
                    </label>
                    <select
                      id="umkm-category"
                      value={umkmCategory}
                      onChange={(e) => setUmkmCategory(e.target.value)}
                      className="w-full h-11 px-3.5 text-xs sm:text-sm bg-white border border-stone-300 rounded-xl focus:outline-none focus:border-emerald-900 focus:bg-white cursor-pointer"
                    >
                      {UMKM_BUSINESS_CATEGORIES.map((cat) => (
                        <option key={cat} value={cat}>
                          {cat}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="umkm-district"
                      className="block text-xs font-medium text-stone-700 mb-1"
                    >
                      Kecamatan Usaha di Kota Bandung
                    </label>
                    <select
                      id="umkm-district"
                      value={umkmDistrict}
                      onChange={(e) => setUmkmDistrict(e.target.value)}
                      className="w-full h-11 px-3.5 text-xs sm:text-sm bg-white border border-stone-300 rounded-xl focus:outline-none focus:border-emerald-900 focus:bg-white cursor-pointer"
                    >
                      {BANDUNG_DISTRICTS.map((d) => (
                        <option key={d} value={d}>
                          {d}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="umkm-address"
                      className="block text-xs font-medium text-stone-700 mb-1"
                    >
                      Alamat Lengkap Usaha
                    </label>
                    <div className="relative">
                      <MapPin className="w-4 h-4 text-stone-400 absolute left-3.5 top-3.5 pointer-events-none" />
                      <textarea
                        id="umkm-address"
                        rows={3}
                        value={umkmAddress}
                        onChange={(e) => setUmkmAddress(e.target.value)}
                        placeholder="Contoh: Jl. Burangrang No. 34, Seberang SMA 7 Bandung"
                        className="w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm bg-white border border-stone-300 rounded-xl focus:outline-none focus:border-emerald-900 focus:bg-white transition-colors"
                      />
                    </div>
                  </div>

                  {errorMsg && (
                    <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-medium">
                      {errorMsg}
                    </div>
                  )}

                  <div className="flex items-center gap-2.5 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setErrorMsg('');
                        setUmkmStep(1);
                      }}
                      className="h-12 px-4 rounded-xl border border-stone-300 bg-white hover:bg-stone-100 text-stone-700 text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
                    >
                      Kembali
                    </button>
                    <button
                      type="submit"
                      className="flex-1 h-12 bg-[#1F281A] hover:bg-emerald-900 active:scale-[0.99] text-white text-xs sm:text-sm font-semibold rounded-xl transition-all inline-flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                    >
                      <span>Lanjut ke Dokumen Usaha</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  </div>
                </form>
              ) : (
                /* -------- UMKM PAGE 3: IDENTITAS USAHA BAGIAN 2 (FOTO & DOKUMEN PENDUKUNG) -------- */
                <form onSubmit={handleUmkmStep3Submit} className="space-y-4">
                  <div className="space-y-1">
                    <h2 className="text-lg sm:text-xl font-bold text-stone-900 font-display">
                      Foto & Dokumen Pendukung Usaha
                    </h2>
                    <p className="text-xs text-stone-500 leading-relaxed">
                      Unggah foto tempat usaha/produk beserta dokumen pendukung untuk verifikasi mitra UMKM SisaPiring.
                    </p>
                  </div>

                  {/* Upload Foto Tempat Usaha / Produk */}
                  <div>
                    <label className="block text-xs font-medium text-stone-700 mb-1.5">
                      Foto Tempat Usaha / Etalase Produk
                    </label>
                    <label
                      htmlFor="umkm-photo-upload"
                      className="flex flex-col items-center justify-center border-2 border-dashed border-stone-300 hover:border-[#1F281A] bg-white rounded-xl p-4 text-center cursor-pointer transition-colors"
                    >
                      {umkmPhotoPreview ? (
                        <div className="space-y-2 w-full">
                          <img
                            src={umkmPhotoPreview}
                            alt="Preview Foto Usaha"
                            className="w-full h-32 object-cover rounded-lg border border-stone-200"
                          />
                          <p className="text-xs font-medium text-[#1F281A] truncate">
                            {umkmPhotoName}
                          </p>
                          <span className="inline-block text-[11px] text-stone-500 underline">
                            Ganti foto usaha
                          </span>
                        </div>
                      ) : (
                        <div className="space-y-1.5 py-2">
                          <div className="w-9 h-9 rounded-xl bg-stone-200/70 text-stone-700 flex items-center justify-center mx-auto">
                            <ImageIcon className="w-4 h-4" />
                          </div>
                          <p className="text-xs font-semibold text-stone-800">
                            {umkmPhotoName || 'Klik untuk unggah foto tampak depan toko / produk'}
                          </p>
                          <p className="text-[11px] text-stone-500">
                            Format JPG, PNG, atau WEBP (Maks. 5MB)
                          </p>
                        </div>
                      )}
                      <input
                        id="umkm-photo-upload"
                        type="file"
                        accept="image/*"
                        onChange={handlePhotoFileChange}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {/* Pilih & Upload Dokumen Pendukung */}
                  <div className="space-y-2.5">
                    <div>
                      <label
                        htmlFor="umkm-doc-type"
                        className="block text-xs font-medium text-stone-700 mb-1"
                      >
                        Jenis Dokumen Pendukung Usaha
                      </label>
                      <select
                        id="umkm-doc-type"
                        value={umkmDocType}
                        onChange={(e) => setUmkmDocType(e.target.value)}
                        className="w-full h-11 px-3.5 text-xs sm:text-sm bg-white border border-stone-300 rounded-xl focus:outline-none focus:border-emerald-900 focus:bg-white cursor-pointer"
                      >
                        {UMKM_DOC_TYPES.map((doc) => (
                          <option key={doc} value={doc}>
                            {doc}
                          </option>
                        ))}
                      </select>
                    </div>

                    <label
                      htmlFor="umkm-doc-upload"
                      className="flex items-center justify-between gap-3 border border-stone-300 hover:border-[#1F281A] bg-white rounded-xl px-3.5 py-3 cursor-pointer transition-colors"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-lg bg-emerald-950/10 text-[#1F281A] flex items-center justify-center shrink-0">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-stone-800 truncate">
                            {umkmDocName || `Unggah ${umkmDocType}`}
                          </p>
                          <p className="text-[11px] text-stone-500">
                            Foto dokumen atau PDF
                          </p>
                        </div>
                      </div>
                      <span className="px-2.5 py-1.5 rounded-lg bg-white border border-stone-300 text-[11px] font-semibold text-stone-700 shrink-0 inline-flex items-center gap-1">
                        <Upload className="w-3.5 h-3.5" />
                        <span>Pilih File</span>
                      </span>
                      <input
                        id="umkm-doc-upload"
                        type="file"
                        accept="image/*,.pdf"
                        onChange={handleDocFileChange}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {errorMsg && (
                    <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-medium">
                      {errorMsg}
                    </div>
                  )}

                  <div className="flex items-center gap-2.5 pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        setErrorMsg('');
                        setUmkmStep(2);
                      }}
                      className="h-12 px-4 rounded-xl border border-stone-300 bg-white hover:bg-stone-100 text-stone-700 text-xs sm:text-sm font-semibold transition-colors cursor-pointer"
                    >
                      Kembali
                    </button>
                    <button
                      type="submit"
                      className="flex-1 h-12 bg-[#1F281A] hover:bg-emerald-900 active:scale-[0.99] text-white text-xs sm:text-sm font-semibold rounded-xl transition-colors cursor-pointer shadow-xs"
                    >
                      Kirim Pendaftaran UMKM
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
          </div>

          {/* TOMBOL "DAFTAR UMKM" DI BAWAH CARD LOGIN */}
          {mode === 'login' && (
            <button
              type="button"
              onClick={() => switchMode('register-umkm')}
              className="w-full h-12 bg-white hover:bg-stone-100 text-[#1F281A] border border-[#1F281A]/30 rounded-2xl text-xs sm:text-sm font-semibold inline-flex items-center justify-center gap-2 transition-colors shadow-2xs cursor-pointer"
            >
              <Store className="w-4 h-4 text-[#1F281A]" />
              <span>Daftar UMKM</span>
            </button>
          )}
        </div>
      </div>

      {/* POP-UP NOTIFIKASI PENDAFTARAN AKUN BERHASIL */}
      {showSuccessRegisterPopup && mode === 'register' && registerStep === 3 && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 backdrop-blur-xs p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="popup-reg-success-title"
        >
          <div className="bg-white border border-stone-200 rounded-2xl max-w-sm w-full p-6 text-center space-y-4 shadow-xl relative">
            <button
              type="button"
              onClick={() => setShowSuccessRegisterPopup(false)}
              className="absolute top-3.5 right-3.5 w-8 h-8 rounded-lg flex items-center justify-center text-stone-400 hover:text-stone-700 cursor-pointer"
              aria-label="Tutup pop up"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-emerald-950/10 text-[#1F281A] flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>

            <div className="space-y-1.5">
              <h3
                id="popup-reg-success-title"
                className="text-base sm:text-lg font-bold text-stone-900 font-display"
              >
                Data Akun Lengkap, {name}!
              </h3>
              <p className="text-xs text-stone-600 leading-relaxed">
                Satu langkah lagi: lengkapi alamat default Anda di Kota Bandung untuk menyelesaikan pendaftaran.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowSuccessRegisterPopup(false)}
              className="w-full h-11 bg-[#1F281A] hover:bg-emerald-900 text-white text-xs sm:text-sm font-semibold rounded-xl transition-colors cursor-pointer"
            >
              Lanjut Isi Alamat Default
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
