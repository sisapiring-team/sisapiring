import React from 'react';
import {
  CheckCircle2,
  Clock,
  XCircle,
  X,
  ShieldCheck,
  Building2,
  Calendar,
  FileText,
  MapPin,
  ExternalLink,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface VerificationBadgeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const VerificationBadgeModal: React.FC<VerificationBadgeModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { sellerProfile, setActiveTab } = useApp();

  if (!isOpen) return null;

  const isVerified = sellerProfile.verificationStatus === 'verified';
  const isPending = sellerProfile.verificationStatus === 'pending_review';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="relative w-full max-w-md bg-white rounded-2xl p-6 shadow-2xl border border-neutral-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-neutral-400 hover:text-neutral-700 rounded-lg hover:bg-neutral-100 transition-colors"
          aria-label="Tutup"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header with Solid Background */}
        <div className="flex items-start gap-3.5 pb-4 border-b border-neutral-100">
          <div
            className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
              isVerified
                ? 'bg-[#1F281A] text-[#fbe1b5]'
                : isPending
                ? 'bg-amber-100 text-amber-800'
                : 'bg-rose-100 text-rose-800'
            }`}
          >
            {isVerified ? (
              <ShieldCheck className="w-6 h-6" />
            ) : isPending ? (
              <Clock className="w-6 h-6" />
            ) : (
              <XCircle className="w-6 h-6" />
            )}
          </div>

          <div className="min-w-0 pr-6">
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 font-bold">
                Sertifikasi Legalitas
              </span>
              <span className="text-neutral-300">·</span>
              <span
                className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                  isVerified
                    ? 'bg-emerald-100 text-emerald-800'
                    : isPending
                    ? 'bg-amber-100 text-amber-800'
                    : 'bg-rose-100 text-rose-800'
                }`}
              >
                {isVerified ? 'Resmi' : isPending ? 'Dalam Tinjauan' : 'Ditolak'}
              </span>
            </div>
            <h3 className="text-base font-bold text-[#1F281A] leading-snug mt-0.5">
              {sellerProfile.businessName}
            </h3>
            <p className="text-xs text-neutral-500 flex items-center gap-1 mt-0.5">
              <MapPin className="w-3 h-3 text-[#f89254]" />
              <span>Kec. {sellerProfile.district}, Kota Bandung</span>
            </p>
          </div>
        </div>

        {/* Verification Details */}
        <div className="py-4 space-y-3.5 text-xs">
          <div className="bg-white p-3.5 rounded-xl border border-neutral-200 space-y-2">
            <div className="flex justify-between items-center text-neutral-600">
              <span>Status Kurasi:</span>
              <span className="font-bold text-[#1F281A]">
                {isVerified
                  ? 'Terverifikasi Resmi Mitra UMKM'
                  : isPending
                  ? 'Menunggu Peninjauan Kurator'
                  : 'Verifikasi Membutuhkan Revisi'}
              </span>
            </div>
            <div className="flex justify-between items-center text-neutral-600">
              <span>Tanggal Pengesahan:</span>
              <span className="font-mono font-medium text-neutral-800">{sellerProfile.joinedDate}</span>
            </div>
            <div className="flex justify-between items-center text-neutral-600">
              <span>Nomor Induk Berusaha (NIB):</span>
              <span className="font-mono font-bold text-neutral-800">02847291038</span>
            </div>
            <div className="flex justify-between items-center text-neutral-600">
              <span>Nomor SKU Kelurahan:</span>
              <span className="font-mono text-neutral-800">SKU-BDG-2026/042-Citarum</span>
            </div>
            <div className="flex justify-between items-center text-neutral-600">
              <span>Kategori Kuliner:</span>
              <span className="font-semibold text-neutral-800">{sellerProfile.businessCategory}</span>
            </div>
          </div>

          <div className="space-y-1.5 text-neutral-600">
            <span className="font-bold text-neutral-800 block text-[11px] uppercase tracking-wider">
              Keterangan Kurator SisaPiring:
            </span>
            <p className="leading-relaxed bg-white border border-neutral-100 p-2.5 rounded-xl text-neutral-700">
              {sellerProfile.verificationNotes ||
                'Usaha kuliner ini telah melalui kurasi standar kebersihan, higienitas pengemasan, dan legalitas usaha berdomisili sah di wilayah Kota Bandung.'}
            </p>
          </div>

          <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-100 flex items-start gap-2 text-emerald-900">
            <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
            <p className="text-[11px] leading-relaxed">
              Memenuhi standar protokol Deklarasi Keamanan Pangan & Zero Food Waste SisaPiring Kota Bandung.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="pt-3 border-t border-neutral-100 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => {
              onClose();
              setActiveTab('registration');
            }}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#1F281A] hover:underline"
          >
            <span>Buka Berkas Pendaftaran</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-[#1F281A] text-white text-xs font-bold rounded-xl hover:bg-[#2D3A26] transition-colors"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};
