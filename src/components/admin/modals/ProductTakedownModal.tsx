import React from 'react';
import { AlertTriangle } from 'lucide-react';
import { SisaPiringItem } from '../../../data/sisaPiringCatalog';

interface ProductTakedownModalProps {
  item: SisaPiringItem | null;
  reason: string;
  onReasonChange: (reason: string) => void;
  onClose: () => void;
  onConfirmTakedown: (item: SisaPiringItem, reason: string) => void;
}

export const ProductTakedownModal: React.FC<ProductTakedownModalProps> = ({
  item,
  reason,
  onReasonChange,
  onClose,
  onConfirmTakedown,
}) => {
  if (!item) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 animate-in zoom-in-95">
        <div className="flex items-center gap-3 text-rose-700">
          <div className="w-10 h-10 rounded-2xl bg-rose-100 flex items-center justify-center font-bold">
            <AlertTriangle className="w-5 h-5 text-rose-700" />
          </div>
          <div>
            <h3 className="font-extrabold text-sm text-neutral-900">Konfirmasi Take Down Menu</h3>
            <p className="text-xs text-neutral-500">Produk akan langsung dicabut dari etalase pembeli</p>
          </div>
        </div>

        <div className="p-3 bg-neutral-50 rounded-2xl text-xs space-y-1">
          <span className="font-bold text-neutral-900 block">{item.title}</span>
          <span className="text-neutral-500 block">{item.merchantName}</span>
        </div>

        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-neutral-700">
            Alasan Resmi Penarikan Produk:
          </label>
          <textarea
            value={reason}
            onChange={(e) => onReasonChange(e.target.value)}
            rows={3}
            className="w-full p-3 text-xs bg-neutral-50 border border-neutral-200 rounded-xl focus:outline-none focus:border-rose-600"
          />
        </div>

        <div className="flex items-center justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-neutral-600 hover:bg-neutral-100 rounded-xl cursor-pointer"
          >
            Batal
          </button>
          <button
            type="button"
            onClick={() => onConfirmTakedown(item, reason)}
            className="px-4 py-2 text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white rounded-xl shadow-xs cursor-pointer"
          >
            Eksekusi Take Down
          </button>
        </div>
      </div>
    </div>
  );
};
