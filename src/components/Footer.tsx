import React from 'react';
import {
  ShoppingBag,
  Leaf,
  ShieldCheck,
  MapPin,
  Clock,
  Mail,
  MessageCircle,
  ArrowUp,
  Store,
} from 'lucide-react';
import { scrollToElement, scrollToTop } from '../lib/smoothScroll';

export interface FooterProps {
  onNavigateHome?: () => void;
  onNavigateSection?: (sectionId: string) => void;
  onNavigateEtalase?: () => void;
  onNavigateOrders?: () => void;
  onNavigateChat?: () => void;
  extraPaddingBottom?: boolean;
}

export const Footer: React.FC<FooterProps> = ({
  onNavigateHome,
  onNavigateSection,
  onNavigateEtalase,
  onNavigateOrders,
  onNavigateChat,
  extraPaddingBottom = false,
}) => {
  const handleSectionClick = (sectionId: string) => {
    if (onNavigateSection) {
      onNavigateSection(sectionId);
    } else {
      const el = document.getElementById(sectionId);
      if (el) {
        scrollToElement(el);
      } else {
        scrollToTop();
      }
    }
  };

  return (
    <footer
      className={`w-full bg-[#162013] text-stone-300 border-t border-[#8DA249]/20 relative z-10 transition-all ${
        extraPaddingBottom ? 'pb-24 sm:pb-28' : 'pb-12 sm:pb-16'
      }`}
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-12 sm:pt-16 flex flex-col items-center justify-center text-center space-y-8 sm:space-y-10">
        {/* 1. BRAND IDENTITY & MISSION (CENTERED) */}
        <div className="flex flex-col items-center justify-center text-center space-y-3 max-w-2xl mx-auto">
          {/* Logo Badge */}
          <div className="inline-flex items-center justify-center gap-2.5 px-4 py-2 rounded-2xl bg-white/5 border border-white/10 shadow-xs">
            <span className="w-8 h-8 rounded-xl bg-[#8DA249] text-white flex items-center justify-center shadow-xs">
              <ShoppingBag className="w-4 h-4" />
            </span>
            <span className="text-xl sm:text-2xl font-bold tracking-tight text-white font-display">
              SisaPiring
            </span>
          </div>

          <p className="text-xs font-bold uppercase tracking-widest text-[#8DA249] font-display">
            Gerakan Penyelamatan Kuliner & Dampak Nyata UMKM Indonesia
          </p>

          <p className="text-xs sm:text-sm text-stone-300/90 leading-relaxed text-center">
            Platform berbasis komunitas yang menghubungkan warga dengan toko roti, kafe, resto, dan warung lokal di Bandung untuk menyelamatkan makanan berlebih berkualitas prima dengan potongan harga hemat sebelum jam tutup toko.
          </p>
        </div>

        {/* 2. PILLARS & BADGES (CENTERED) */}
        <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3 text-center max-w-3xl mx-auto">
          <div className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-[11px] sm:text-xs text-stone-300">
            <Leaf className="w-3.5 h-3.5 text-[#8DA249]" />
            <span>Cegah Food Loss & Waste</span>
          </div>

          <div className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-[11px] sm:text-xs text-stone-300">
            <Store className="w-3.5 h-3.5 text-[#8DA249]" />
            <span>100% Mitra UMKM Terverifikasi</span>
          </div>

          <div className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-[11px] sm:text-xs text-stone-300">
            <ShieldCheck className="w-3.5 h-3.5 text-[#8DA249]" />
            <span>Standar Higienis Produksi Baru</span>
          </div>

          <div className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-[11px] sm:text-xs text-stone-300">
            <span className="w-2 h-2 rounded-full bg-[#f89254]" />
            <span>QRIS Instan Bebas Biaya Admin</span>
          </div>
        </div>

        {/* 3. NAVIGATION LINKS (CENTERED) */}
        <nav
          aria-label="Navigasi Footer"
          className="flex flex-wrap items-center justify-center gap-x-5 sm:gap-x-8 gap-y-2.5 text-xs sm:text-sm font-medium text-stone-300 text-center"
        >
          <button
            type="button"
            onClick={onNavigateHome ? onNavigateHome : scrollToTop}
            className="hover:text-[#8DA249] transition-colors cursor-pointer"
          >
            Beranda
          </button>
          <span className="text-stone-600 select-none" aria-hidden="true">·</span>

          <button
            type="button"
            onClick={() => handleSectionClick('cara-kerja')}
            className="hover:text-[#8DA249] transition-colors cursor-pointer"
          >
            Cara Kerja
          </button>
          <span className="text-stone-600 select-none" aria-hidden="true">·</span>

          <button
            type="button"
            onClick={() => handleSectionClick('dampak-umkm')}
            className="hover:text-[#8DA249] transition-colors cursor-pointer"
          >
            Fakta Limbah Pangan
          </button>
          <span className="text-stone-600 select-none" aria-hidden="true">·</span>

          <button
            type="button"
            onClick={onNavigateEtalase ? onNavigateEtalase : () => handleSectionClick('katalog-makanan')}
            className="hover:text-[#8DA249] transition-colors cursor-pointer"
          >
            Etalase Makanan
          </button>
          <span className="text-stone-600 select-none" aria-hidden="true">·</span>

          <button
            type="button"
            onClick={() => handleSectionClick('dampak-umkm')}
            className="hover:text-[#8DA249] transition-colors cursor-pointer"
          >
            Kemitraan UMKM
          </button>

          {onNavigateOrders && (
            <>
              <span className="text-stone-600 select-none" aria-hidden="true">·</span>
              <button
                type="button"
                onClick={onNavigateOrders}
                className="hover:text-[#8DA249] transition-colors cursor-pointer"
              >
                Lacak Pesanan
              </button>
            </>
          )}

          {onNavigateChat && (
            <>
              <span className="text-stone-600 select-none" aria-hidden="true">·</span>
              <button
                type="button"
                onClick={onNavigateChat}
                className="hover:text-[#8DA249] transition-colors cursor-pointer"
              >
                Pusat Pesan
              </button>
            </>
          )}
        </nav>

        {/* 4. CONTACT, HOURS & OPERATIONAL COVERAGE (CENTERED) */}
        <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center gap-x-6 sm:gap-x-8 gap-y-2.5 sm:gap-y-3 text-xs text-stone-400 text-center max-w-4xl mx-auto px-2">
          <div className="inline-flex items-center justify-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-[#8DA249] shrink-0" />
            <span>Kawasan Aktif: Coblong, Dago, Braga, Buahbatu & Sekitar Kota Bandung</span>
          </div>

          <div className="inline-flex items-center justify-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-[#8DA249] shrink-0" />
            <span>Jam Penyelamatan: Setiap Hari Pukul 15.00 – 21.30 WIB</span>
          </div>

          <div className="inline-flex items-center justify-center gap-1.5">
            <Mail className="w-3.5 h-3.5 text-[#8DA249] shrink-0" />
            <span>Email: halo@sisapiring.id</span>
          </div>

          <div className="inline-flex items-center justify-center gap-1.5">
            <MessageCircle className="w-3.5 h-3.5 text-[#8DA249] shrink-0" />
            <span>WhatsApp Bantuan: +62 821-2345-6789</span>
          </div>
        </div>

        {/* 5. BACK TO TOP BUTTON (CENTERED) */}
        <div className="flex justify-center items-center text-center">
          <button
            type="button"
            onClick={scrollToTop}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full bg-white/10 hover:bg-[#8DA249] text-stone-200 hover:text-white text-xs font-semibold transition-all shadow-xs cursor-pointer"
            aria-label="Kembali ke bagian atas halaman"
          >
            <ArrowUp className="w-3.5 h-3.5" />
            <span>Kembali ke Atas</span>
          </button>
        </div>

        {/* 6. DIVIDER LINE & COPYRIGHT (CENTERED) */}
        <div className="w-full pt-6 border-t border-white/10 flex flex-col items-center justify-center text-center space-y-2">
          <p className="text-xs text-stone-400 text-center">
            &copy; {new Date().getFullYear()} SisaPiring Indonesia · Inisiatif Penyelamatan Pangan Berkelanjutan & Pemberdayaan UMKM Lokal.
          </p>
          <p className="text-[11px] text-stone-500 text-center max-w-xl mx-auto">
            Semua produk makanan yang terdaftar adalah stok harian baru terverifikasi yang aman dikonsumsi dan dikemas secara higienis oleh mitra pemilik usaha.
          </p>
        </div>
      </div>
    </footer>
  );
};

