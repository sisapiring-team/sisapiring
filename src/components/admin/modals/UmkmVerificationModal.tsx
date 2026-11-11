import React from 'react';
import { ShieldCheck, X } from 'lucide-react';
import { ResilientImage } from '../../ResilientImage';
import { UmkmVerificationRecord } from '../../../data/adminData';

interface UmkmVerificationModalProps {
  umkm: UmkmVerificationRecord | null;
  onClose: () => void;
  onApprove: (umkm: UmkmVerificationRecord) => void;
  onReject: (umkm: UmkmVerificationRecord) => void;
}

export const UmkmVerificationModal: React.FC<UmkmVerificationModalProps> = ({
  umkm,
  onClose,
  onApprove,
  onReject,
}) => {
  if (!umkm) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto animate-in zoom-in-95">
        <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-700" />
            <h3 className="font-extrabold text-base text-neutral-900">
              Verifikasi Legalitas & KYB Mitra
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-600 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3 text-xs">
          <div className="flex items-center gap-3">
            <ResilientImage
              src={umkm.storePhotoUrl}
              alt={umkm.storeName}
              className="w-16 h-16 rounded-2xl object-cover border border-neutral-200 shrink-0"
            />
            <div>
              <h4 className="font-extrabold text-sm text-neutral-900">{umkm.storeName}</h4>
              <p className="text-neutral-500">
                Pemilik: {umkm.ownerName} • {umkm.phone}
              </p>
              <p className="text-neutral-500">
                Kec. {umkm.district} • {umkm.address}
              </p>
            </div>
          </div>

          <div className="p-3.5 bg-neutral-50 rounded-2xl space-y-2 border border-neutral-100">
            <div className="flex justify-between">
              <span className="text-neutral-500">Nomor Induk Berusaha (NIB):</span>
              <span className="font-mono font-bold text-neutral-900">{umkm.nibNumber}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-500">Sertifikasi Halal / PIRT:</span>
              <span className="font-mono font-bold text-emerald-800">
                {umkm.halalOrPirtNumber}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-neutral-500">Verifikasi KTP Pemilik:</span>
              <span className="font-mono text-neutral-800">{umkm.ktpMasked}</span>
            </div>
            <div className="flex justify-between items-center pt-1 border-t border-neutral-200/60">
              <span className="text-neutral-500">Deklarasi Higienitas Dapur:</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                ✓ Bertandatangan Digital
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-3 border-t border-neutral-100">
          <button
            type="button"
            onClick={() => onReject(umkm)}
            className="px-4 py-2 text-xs font-bold rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 transition-colors cursor-pointer"
          >
            Minta Perbaikan
          </button>

          <button
            type="button"
            onClick={() => onApprove(umkm)}
            className="px-5 py-2 text-xs font-bold rounded-xl bg-[#16382C] hover:bg-[#214F3F] text-white transition-colors cursor-pointer"
          >
            Setujui Menjadi Mitra Resmi
          </button>
        </div>
      </div>
    </div>
  );
};

