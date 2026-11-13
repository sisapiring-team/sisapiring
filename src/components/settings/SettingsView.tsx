import React, { useState } from 'react';
import {
  Bell,
  Sparkles,
  RefreshCw,
  Shield,
  Smartphone,
  Volume2,
  Clock,
  Check,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ConfirmationModal } from '../common/ConfirmationModal';

export const SettingsView: React.FC = () => {
  const { resetAllDemoData, showToast } = useApp();

  const [whatsappAlerts, setWhatsappAlerts] = useState(true);
  const [audioChime, setAudioChime] = useState(true);
  const [autoDiscountSuggestion, setAutoDiscountSuggestion] = useState(true);
  const [autoCloseWhenSoldOut, setAutoCloseWhenSoldOut] = useState(true);
  const [safetyReminderHours, setSafetyReminderHours] = useState(2);

  const [showResetModal, setShowResetModal] = useState(false);

  const handleSavePreferences = () => {
    showToast('Pengaturan Disimpan', 'Preferensi operasional toko Anda telah diperbarui.', 'success');
  };

  const handleReset = () => {
    resetAllDemoData();
    setShowResetModal(false);
  };

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-[#1F281A] tracking-tight">
          Pengaturan Toko & Operasional
        </h1>
        <p className="text-xs text-neutral-500 mt-1">
          Konfigurasikan otomatisasi diskon, notifikasi pesanan masuk, dan preferensi dashboard mitra.
        </p>
      </div>

      <div className="space-y-5">
        {/* Notifications Setting */}
        <div className="bg-white rounded-2xl p-5 md:p-6 border border-neutral-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-neutral-100">
            <Bell className="w-5 h-5 text-[#1F281A]" />
            <h3 className="text-sm font-bold text-neutral-800">Notifikasi & Peringatan Masuk</h3>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="font-semibold text-neutral-800">Notifikasi Pesanan WhatsApp Instan</p>
                <p className="text-neutral-500 text-[11px]">
                  Kirim pesan ringkasan otomatis ke nomor WhatsApp pemilik setiap ada pesanan baru.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setWhatsappAlerts(!whatsappAlerts)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  whatsappAlerts ? 'bg-[#1F281A]' : 'bg-neutral-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    whatsappAlerts ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between py-2 border-t border-neutral-100">
              <div>
                <p className="font-semibold text-neutral-800">Bunyi Suara Notifikasi Kasir (Audio Chime)</p>
                <p className="text-neutral-500 text-[11px]">
                  Putar audio bel saat pesanan baru masuk atau scan QR berhasil di meja kasir.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setAudioChime(!audioChime)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  audioChime ? 'bg-[#1F281A]' : 'bg-neutral-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    audioChime ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Automation Settings */}
        <div className="bg-white rounded-2xl p-5 md:p-6 border border-neutral-200 shadow-xs space-y-4">
          <div className="flex items-center gap-2.5 pb-3 border-b border-neutral-100">
            <Sparkles className="w-5 h-5 text-[#f89254]" />
            <h3 className="text-sm font-bold text-neutral-800">Otomatisasi Sisa Piring Rescue</h3>
          </div>

          <div className="space-y-3 text-xs">
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="font-semibold text-neutral-800">Aktifkan Rekomendasi Diskon Pintar</p>
                <p className="text-neutral-500 text-[11px]">
                  Tampilkan notifikasi saran naikkan diskon (70%-90%) otomatis saat mendekati batas aman konsumsi.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setAutoDiscountSuggestion(!autoDiscountSuggestion)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  autoDiscountSuggestion ? 'bg-[#1F281A]' : 'bg-neutral-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    autoDiscountSuggestion ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between py-2 border-t border-neutral-100">
              <div>
                <p className="font-semibold text-neutral-800">Tutup Etalase Otomatis Bila Stok Habis</p>
                <p className="text-neutral-500 text-[11px]">
                  Ubah status toko menjadi nonaktif sementara jika seluruh stok sisa piring sudah habis terjual.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setAutoCloseWhenSoldOut(!autoCloseWhenSoldOut)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  autoCloseWhenSoldOut ? 'bg-[#1F281A]' : 'bg-neutral-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    autoCloseWhenSoldOut ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>
        </div>

        {/* Demo Data Reset */}
        <div className="bg-white rounded-2xl p-5 md:p-6 border border-neutral-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <RefreshCw className="w-5 h-5 text-neutral-500" />
              <div>
                <h3 className="text-sm font-bold text-neutral-800">Reset Data Demo SisaPiring</h3>
                <p className="text-xs text-neutral-500">
                  Kembalikan produk dan pesanan contoh ke kondisi awal untuk presentasi atau pengujian ulang.
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setShowResetModal(true)}
              className="px-4 py-2 text-xs font-semibold text-neutral-700 bg-neutral-100 hover:bg-neutral-200 rounded-xl transition-colors shrink-0"
            >
              Reset Data
            </button>
          </div>
        </div>

        {/* Save button */}
        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleSavePreferences}
            className="px-5 py-2.5 bg-[#1F281A] hover:bg-[#2D3A26] text-white text-xs font-bold rounded-xl transition-colors shadow-xs"
          >
            Simpan Preferensi Pengaturan
          </button>
        </div>
      </div>

      <ConfirmationModal
        isOpen={showResetModal}
        title="Reset Semua Data Demo?"
        message="Tindakan ini akan mengembalikan seluruh produk sisa piring, pesanan, dan profil UMKM ke data awal bawaan sistem."
        confirmLabel="Reset Sekarang"
        cancelLabel="Batal"
        isDestructive={true}
        onConfirm={handleReset}
        onCancel={() => setShowResetModal(false)}
      />
    </div>
  );
};
