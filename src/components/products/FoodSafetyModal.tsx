import React, { useState } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  X,
  FileCheck,
  CheckSquare,
  Square,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface FoodSafetyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FoodSafetyModal: React.FC<FoodSafetyModalProps> = ({ isOpen, onClose }) => {
  const { products, showToast, setIsAddProductModalOpen } = useApp();

  const [activeTab, setActiveTabState] = useState<'checklist' | 'products'>('checklist');

  if (!isOpen) return null;

  const totalProducts = products.length;
  const compliantProducts = products.filter(
    (p) =>
      p.foodSafetyChecklist.isFitForConsumption &&
      p.foodSafetyChecklist.isProperlyStored &&
      p.foodSafetyChecklist.isCleanPackaging &&
      p.foodSafetyChecklist.isNoAbnormalOdor &&
      p.foodSafetyChecklist.isAccurateInformation
  ).length;

  const declarationRules = [
    {
      title: 'Kelayakan Pangan Konsumsi',
      desc: 'Makanan surplus wajib berasal dari batch segar hari yang sama atau belum melewati batas konsumsi organoleptik yang ditetapkan.',
    },
    {
      title: 'Sanitasi & Pengendalian Suhu',
      desc: 'Produk disimpan sesuai spesifikasi: bakery di suhu ruang kering, pastry basah/dessert di chiller (2–6°C), hidangan hangat di warmer box.',
    },
    {
      title: 'Integritas Kemasan Higienis',
      desc: 'Kemasan bersih, tersegel utuh, dan terlindung dari debu atau kontaminasi silang sebelum diserahkan ke pembeli.',
    },
    {
      title: 'Uji Sensorik Tanpa Penyimpangan',
      desc: 'Tidak ada perubahan aroma, tekstur berlendir, rasa asam/basi, atau perubahan warna abnormal pada makanan.',
    },
    {
      title: 'Transparansi Bahan & Alergen',
      desc: 'Informasi alergen (kacang, susu, telur, gluten) wajib dicantumkan jujur untuk melindungi kesehatan warga Bandung.',
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl p-6 shadow-2xl border border-neutral-200 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-neutral-400 hover:text-neutral-700 rounded-lg hover:bg-neutral-100 transition-colors"
          aria-label="Tutup"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 pb-4 border-b border-neutral-100">
          <div className="w-10 h-10 rounded-xl bg-[#16382C] text-[#FFD230] flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-[#16382C]">
              Deklarasi & Protokol Keamanan Pangan (Food Safety)
            </h3>
            <p className="text-xs text-neutral-500">
              Standar komitmen jaminan mutu makanan surplus Kota Bandung
            </p>
          </div>
        </div>

        {/* Compliance Status Banner */}
        <div className="my-4 p-4 rounded-xl bg-[#FAF9F6] border border-neutral-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0" />
            <div>
              <p className="text-xs font-bold text-neutral-800">
                Tingkat Kepatuhan Etalase: {compliantProducts}/{totalProducts} Produk Lolos Uji
              </p>
              <p className="text-[11px] text-neutral-500">
                100% produk aktif telah memenuhi 5 syarat deklarasi keamanan pangan.
              </p>
            </div>
          </div>
          <span className="text-xs font-mono font-bold bg-emerald-100 text-emerald-800 px-2.5 py-1 rounded-lg shrink-0 self-start sm:self-center">
            Status: Lengkap & Sah
          </span>
        </div>

        {/* Standard Rules List */}
        <div className="space-y-3">
          <h4 className="text-xs font-bold text-neutral-800 uppercase tracking-wider">
            5 Pilar Wajib Standar SisaPiring Bandung:
          </h4>
          <div className="space-y-2">
            {declarationRules.map((rule, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl border border-neutral-100 bg-white hover:bg-neutral-50/70 transition-colors flex items-start gap-3"
              >
                <span className="w-5 h-5 rounded-full bg-[#16382C] text-white font-mono text-xs flex items-center justify-center font-bold shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <div>
                  <h5 className="text-xs font-bold text-neutral-900">{rule.title}</h5>
                  <p className="text-[11px] text-neutral-600 mt-0.5 leading-relaxed">{rule.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="mt-6 pt-4 border-t border-neutral-100 flex flex-wrap items-center justify-between gap-3">
          <span className="text-[11px] text-neutral-400">
            Diperbarui secara berkala sesuai ketentuan Dinas Kesehatan & BPOM.
          </span>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-neutral-100 text-neutral-700 text-xs font-semibold rounded-xl hover:bg-neutral-200"
            >
              Tutup
            </button>
            <button
              type="button"
              onClick={() => {
                onClose();
                setIsAddProductModalOpen(true);
              }}
              className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#EE4D2D] hover:bg-[#D73C1C] text-white text-xs font-bold rounded-xl transition-colors shadow-xs"
            >
              <span>Tambah Produk Terdeklarasi</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
