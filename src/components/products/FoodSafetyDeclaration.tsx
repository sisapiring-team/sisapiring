import React from 'react';
import { ShieldCheck, AlertTriangle, CheckSquare, Square, Info } from 'lucide-react';
import { FoodSafetyChecklist, StorageInstruction } from '../../types/seller';

interface FoodSafetyDeclarationProps {
  checklist: FoodSafetyChecklist;
  onChangeChecklist: (updated: FoodSafetyChecklist) => void;
  productionTime: string;
  onChangeProductionTime: (val: string) => void;
  safeConsumptionDeadline: string;
  onChangeSafeDeadline: (val: string) => void;
  storageInstruction: StorageInstruction;
  onChangeStorageInstruction: (val: StorageInstruction) => void;
  showValidationWarning?: boolean;
}

export const FoodSafetyDeclaration: React.FC<FoodSafetyDeclarationProps> = ({
  checklist,
  onChangeChecklist,
  productionTime,
  onChangeProductionTime,
  safeConsumptionDeadline,
  onChangeSafeDeadline,
  storageInstruction,
  onChangeStorageInstruction,
  showValidationWarning = false,
}) => {
  const allChecked =
    checklist.isFitForConsumption &&
    checklist.isProperlyStored &&
    checklist.isCleanPackaging &&
    checklist.isNoAbnormalOdor &&
    checklist.isAccurateInformation;

  const toggleCheck = (key: keyof FoodSafetyChecklist) => {
    onChangeChecklist({
      ...checklist,
      [key]: !checklist[key],
    });
  };

  const setCheckAll = (val: boolean) => {
    onChangeChecklist({
      isFitForConsumption: val,
      isProperlyStored: val,
      isCleanPackaging: val,
      isNoAbnormalOdor: val,
      isAccurateInformation: val,
    });
  };

  return (
    <div className="bg-white rounded-2xl p-5 border border-neutral-200 space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-3 pb-3 border-b border-neutral-200">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-[#1F281A] text-[#fbe1b5] flex items-center justify-center shrink-0">
            <ShieldCheck className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-[#1F281A] leading-snug">
              Deklarasi Standar Keamanan Pangan (Food Safety)
            </h4>
            <p className="text-xs text-neutral-500">
              Kewajiban regulasi SisaPiring Bandung untuk menjamin kualitas konsumsi makanan berlebih.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setCheckAll(!allChecked)}
          className="text-xs font-semibold text-[#1F281A] hover:underline shrink-0"
        >
          {allChecked ? 'Batal Centang Semua' : 'Centang Semua'}
        </button>
      </div>

      {/* Production & Safe Time Fields */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div>
          <label className="block text-xs font-semibold text-neutral-700 mb-1">
            Waktu Produksi / Panggang <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={productionTime}
            onChange={(e) => onChangeProductionTime(e.target.value)}
            placeholder="Hari ini, 08:00 WIB"
            className="w-full px-3 py-2 text-xs bg-white border border-neutral-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#1F281A]"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-neutral-700 mb-1">
            Batas Aman Konsumsi <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={safeConsumptionDeadline}
            onChange={(e) => onChangeSafeDeadline(e.target.value)}
            placeholder="Hari ini, 23:00 WIB"
            className="w-full px-3 py-2 text-xs bg-white border border-neutral-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#1F281A]"
          />
        </div>

        <div>
          <label className="block text-xs font-semibold text-neutral-700 mb-1">
            Instruksi Penyimpanan <span className="text-red-500">*</span>
          </label>
          <select
            value={storageInstruction}
            onChange={(e) => onChangeStorageInstruction(e.target.value as StorageInstruction)}
            className="w-full px-3 py-2 text-xs bg-white border border-neutral-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-[#1F281A]"
          >
            <option value="Suhu Ruang (Kering & Sejuk)">Suhu Ruang (Kering & Sejuk)</option>
            <option value="Lemari Pendingin (Chiller 2-6°C)">Lemari Pendingin (Chiller 2-6°C)</option>
            <option value="Freezer Beku (-18°C)">Freezer Beku (-18°C)</option>
            <option value="Penghangat Makanan (Food Warmer)">Penghangat Makanan (Food Warmer)</option>
          </select>
        </div>
      </div>

      {/* Checklist items */}
      <div className="space-y-2 pt-1">
        <span className="block text-xs font-bold text-neutral-800">
          Daftar Periksa Kondisi Pangan (Wajib Disetujui Mitra):
        </span>

        {[
          {
            key: 'isFitForConsumption' as const,
            label: '1. Makanan masih layak, aman, dan higienis untuk dikonsumsi pelanggan',
          },
          {
            key: 'isProperlyStored' as const,
            label: '2. Makanan telah disimpan dengan suhu dan prosedur sanitasi yang sesuai standar',
          },
          {
            key: 'isCleanPackaging' as const,
            label: '3. Kemasan bersih, tertutup rapat, dan utuh bebas dari kontaminasi',
          },
          {
            key: 'isNoAbnormalOdor' as const,
            label: '4. Tidak ada perubahan warna, rasa, lendir, atau bau yang menyimpang',
          },
          {
            key: 'isAccurateInformation' as const,
            label: '5. Informasi bahan baku, porsi, dan alergen tertera jujur tanpa manipulasi',
          },
        ].map((item) => {
          const checked = checklist[item.key];
          return (
            <div
              key={item.key}
              onClick={() => toggleCheck(item.key)}
              className={`flex items-start gap-2.5 p-2.5 rounded-xl cursor-pointer transition-colors border ${
                checked
                  ? 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
                  : 'bg-white border-neutral-200 text-neutral-700 hover:bg-neutral-50'
              }`}
            >
              {checked ? (
                <CheckSquare className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
              ) : (
                <Square className="w-4 h-4 text-neutral-400 shrink-0 mt-0.5" />
              )}
              <span className="text-xs font-medium leading-relaxed select-none">{item.label}</span>
            </div>
          );
        })}
      </div>

      {/* Validation warning when missing */}
      {showValidationWarning && !allChecked && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs text-red-700">
          <AlertTriangle className="w-4 h-4 shrink-0 text-red-600" />
          <span>
            Peringatan: Seluruh 5 poin deklarasi keamanan pangan wajib dicentang sebelum produk dapat diterbitkan!
          </span>
        </div>
      )}

      {/* Note */}
      <div className="flex items-center gap-2 text-[11px] text-neutral-500">
        <Info className="w-3.5 h-3.5 text-neutral-400 shrink-0" />
        <span>
          Pelanggaran standar keamanan pangan dapat mengakibatkan penangguhan akun mitra UMKM SisaPiring.
        </span>
      </div>
    </div>
  );
};
