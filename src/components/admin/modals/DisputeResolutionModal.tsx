import React from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { formatRupiah } from '../../../data/sisaPiringCatalog';
import { AdminDisputeRecord } from '../../../data/adminData';

interface DisputeResolutionModalProps {
  dispute: AdminDisputeRecord | null;
  resolutionNote: string;
  onResolutionNoteChange: (note: string) => void;
  onClose: () => void;
  onProcessRefund: (dispute: AdminDisputeRecord, note: string) => void;
  onIssueSanction: (dispute: AdminDisputeRecord) => void;
}

export const DisputeResolutionModal: React.FC<DisputeResolutionModalProps> = ({
  dispute,
  resolutionNote,
  onResolutionNoteChange,
  onClose,
  onProcessRefund,
  onIssueSanction,
}) => {
  if (!dispute) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95">
        <div className="flex items-center justify-between pb-3 border-b border-neutral-100">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-600" />
            <h3 className="font-extrabold text-base text-neutral-900">
              Resolusi Tiket #{dispute.ticketCode}
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

        <div className="p-3.5 bg-neutral-50 rounded-2xl text-xs space-y-1.5 border border-neutral-100">
          <div className="flex justify-between">
            <span className="text-neutral-500">Pelapor:</span>
            <span className="font-bold text-neutral-900">{dispute.reporterName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-neutral-500">Toko Terkait:</span>
            <span className="font-semibold text-neutral-800">{dispute.merchantName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-neutral-500">Nominal Refund Escrow:</span>
            <span className="font-mono font-bold text-emerald-800">
              {formatRupiah(dispute.amountPaid)}
            </span>
          </div>
          <p className="pt-2 border-t border-neutral-200/60 text-neutral-700 italic">
            "{dispute.description}"
          </p>
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-neutral-700">
            Catatan Resmi Admin & Rekomendasi Solusi:
          </label>
          <textarea
            value={resolutionNote}
            onChange={(e) => onResolutionNoteChange(e.target.value)}
            rows={3}
            className="w-full p-3 text-xs bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:border-emerald-700"
          />
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={() => onProcessRefund(dispute, resolutionNote)}
            className="w-full sm:w-auto px-4 py-2.5 text-xs font-bold rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white transition-colors cursor-pointer"
          >
            Proses Refund 100% Escrow
          </button>

          <button
            type="button"
            onClick={() => onIssueSanction(dispute)}
            className="w-full sm:w-auto px-4 py-2.5 text-xs font-bold rounded-xl bg-neutral-900 hover:bg-neutral-800 text-white transition-colors cursor-pointer"
          >
            Kirim Sanksi Mitra
          </button>
        </div>
      </div>
    </div>
  );
};
