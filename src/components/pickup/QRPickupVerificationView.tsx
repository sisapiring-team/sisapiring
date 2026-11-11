import React, { useState } from 'react';
import {
  QrCode,
  Scan,
  CheckCircle2,
  AlertCircle,
  XCircle,
  Search,
  PackageCheck,
  User,
  Clock,
  ArrowRight,
  ShieldAlert,
  Sparkles,
} from 'lucide-react';
import { Order } from '../../types/seller';
import { formatRupiah } from '../../utils/formatters';
import { useApp } from '../../context/AppContext';

export const QRPickupVerificationView: React.FC = () => {
  const { orders, verifyPickupCode, showToast } = useApp();

  const [inputCode, setInputCode] = useState('');
  const [isScanning, setIsScanning] = useState(true);
  const [verificationResult, setVerificationResult] = useState<{
    status: 'idle' | 'success' | 'error' | 'duplicate';
    message: string;
    order?: Order;
  }>({ status: 'idle', message: '' });

  // Get active unverified orders for quick testing
  const unverifiedOrders = orders.filter((o) => o.status !== 'completed' && o.status !== 'cancelled');
  const completedOrders = orders.filter((o) => o.status === 'completed');

  const handleVerify = (codeToTest?: string) => {
    const target = codeToTest || inputCode;
    if (!target.trim()) {
      setVerificationResult({
        status: 'error',
        message: 'Masukkan kode penjemputan (contoh: SP-7842) atau scan QR pelanggan.',
      });
      return;
    }

    const res = verifyPickupCode(target);
    if (res.success && res.order) {
      setVerificationResult({
        status: 'success',
        message: res.message,
        order: res.order,
      });
      setInputCode('');
    } else {
      if (res.message.includes('SUDAH PERNAH DIGUNAKAN')) {
        setVerificationResult({
          status: 'duplicate',
          message: res.message,
          order: res.order,
        });
      } else {
        setVerificationResult({
          status: 'error',
          message: res.message,
          order: res.order,
        });
      }
    }
  };

  const handleSimulateScan = (order: Order) => {
    setInputCode(order.pickupCode);
    handleVerify(order.pickupCode);
  };

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <h1 className="text-xl md:text-2xl font-bold text-[#16382C] tracking-tight">
          Verifikasi Penjemputan Pesanan (QR & PIN)
        </h1>
        <p className="text-xs text-neutral-500 mt-1">
          Validasi tiket penjemputan pembeli sebelum menyerahkan paket surplus food. Mencegah pengambilan ganda atau kode kedaluwarsa.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Scanner Interface & Manual Input */}
        <div className="lg:col-span-7 space-y-5">
          {/* Scanner Card */}
          <div className="bg-white rounded-2xl p-6 border border-neutral-200 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Scan className="w-5 h-5 text-[#EE4D2D]" />
                <h3 className="text-sm font-bold text-[#16382C]">Scanner QR Kasir</h3>
              </div>
              <button
                type="button"
                onClick={() => setIsScanning(!isScanning)}
                className="text-xs font-semibold text-neutral-600 hover:text-neutral-900"
              >
                {isScanning ? 'Jeda Kamera' : 'Aktifkan Kamera'}
              </button>
            </div>

            {/* Interactive Scanner Viewport */}
            <div className="relative aspect-4/3 bg-[#0F261E] rounded-xl overflow-hidden flex flex-col items-center justify-center text-white border-2 border-[#16382C] shadow-inner">
              {/* Scan Reticle */}
              <div className="relative w-48 h-48 sm:w-56 sm:h-56 border-2 border-dashed border-[#FFD230] rounded-2xl flex items-center justify-center p-4">
                {/* Laser animation */}
                {isScanning && (
                  <div className="absolute left-0 right-0 h-0.5 bg-[#EE4D2D] shadow-[0_0_12px_#EE4D2D] animate-pulse top-1/2 -translate-y-1/2" />
                )}

                <div className="text-center p-3">
                  <QrCode className="w-12 h-12 text-[#FFD230] mx-auto opacity-80" />
                  <p className="text-[11px] text-white/80 mt-2 font-medium">
                    Arahkan QR Code Tiket Pembeli SisaPiring ke dalam kotak
                  </p>
                </div>
              </div>

              {/* Status pill overlay */}
              <div className="absolute bottom-3 left-3 right-3 text-center">
                <span className="text-[11px] text-white/90 bg-black/50 backdrop-blur-xs px-3 py-1 rounded-full">
                  Status Scanner: <span className="text-[#FFD230] font-mono">STANDBY / AKTIF</span>
                </span>
              </div>
            </div>

            {/* Manual Code Input Bar */}
            <div className="pt-2">
              <label className="block text-xs font-semibold text-neutral-700 mb-1.5">
                Atau Masukkan Kode Pengambilan 6-Digit (PIN Kasir):
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type="text"
                    value={inputCode}
                    onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                    onKeyDown={(e) => e.key === 'Enter' && handleVerify()}
                    placeholder="Contoh: SP-7842 atau SP-BDG-..."
                    className="w-full px-3.5 py-2.5 text-sm font-mono tracking-wider bg-neutral-50 border border-neutral-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#16382C]/20 focus:border-[#16382C]"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => handleVerify()}
                  className="px-5 py-2.5 bg-[#16382C] hover:bg-[#214F3F] text-white text-xs font-bold rounded-xl transition-colors shadow-xs shrink-0 flex items-center gap-1.5"
                >
                  <PackageCheck className="w-4 h-4 text-[#FFD230]" />
                  <span>Verifikasi</span>
                </button>
              </div>
            </div>
          </div>

          {/* Quick Demo Simulator: Clickable Active Orders */}
          <div className="bg-neutral-50 rounded-2xl p-4 border border-neutral-200 space-y-2.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-neutral-700 uppercase tracking-wider">
                Simulasi Uji Coba Cepat (Pesanan Siap Ambil):
              </span>
              <span className="text-[11px] text-neutral-500 font-mono">
                {unverifiedOrders.length} antrean
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {unverifiedOrders.map((ord) => (
                <div
                  key={ord.id}
                  onClick={() => handleSimulateScan(ord)}
                  className="p-2.5 bg-white rounded-xl border border-neutral-200 hover:border-[#16382C] cursor-pointer transition-all flex items-center justify-between text-xs group"
                >
                  <div className="min-w-0 pr-2">
                    <p className="font-mono font-bold text-[#EE4D2D] group-hover:text-[#16382C]">
                      {ord.pickupCode}
                    </p>
                    <p className="text-[11px] text-neutral-700 truncate">{ord.customerName}</p>
                  </div>
                  <span className="text-[10px] font-semibold bg-neutral-100 group-hover:bg-[#16382C] group-hover:text-white px-2 py-1 rounded transition-colors shrink-0">
                    Scan Ini
                  </span>
                </div>
              ))}
            </div>

            {/* Test duplicate redemption button */}
            {completedOrders.length > 0 && (
              <div className="pt-2 border-t border-neutral-200">
                <span className="text-[11px] text-neutral-500 block mb-1">
                  Uji Proteksi Pengambilan Ganda:
                </span>
                <button
                  type="button"
                  onClick={() => handleSimulateScan(completedOrders[0])}
                  className="w-full text-left p-2 bg-rose-50/70 hover:bg-rose-100 rounded-lg border border-rose-200 text-xs text-rose-800 flex items-center justify-between transition-colors"
                >
                  <span>
                    Coba scan kode lama: <strong>{completedOrders[0].pickupCode}</strong> ({completedOrders[0].customerName})
                  </span>
                  <span className="text-[10px] uppercase font-bold text-rose-600">Tes Error</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Verification Result & Details */}
        <div className="lg:col-span-5 space-y-4">
          {verificationResult.status === 'idle' && (
            <div className="bg-white rounded-2xl p-8 border border-neutral-200 shadow-xs text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-neutral-100 flex items-center justify-center mx-auto text-neutral-400">
                <QrCode className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-neutral-800">Menunggu Pemindaian</h3>
              <p className="text-xs text-neutral-500 max-w-xs mx-auto leading-relaxed">
                Scan QR tiket pembeli atau masukkan kode pengambilan untuk memvalidasi isi paket makanan dan menyelesaikan pesanan.
              </p>
            </div>
          )}

          {/* Success State */}
          {verificationResult.status === 'success' && verificationResult.order && (
            <div className="bg-white rounded-2xl border-2 border-emerald-500 shadow-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
              <div className="bg-emerald-600 text-white p-4 text-center">
                <CheckCircle2 className="w-10 h-10 mx-auto text-[#FFD230] mb-1" />
                <h3 className="text-base font-bold">Verifikasi Berhasil Disahkan!</h3>
                <p className="text-xs text-white/90">
                  Status otomatis diubah menjadi <strong>Selesai (Completed)</strong>
                </p>
              </div>

              <div className="p-5 space-y-4 text-xs">
                <div className="flex justify-between items-center pb-3 border-b border-neutral-100">
                  <div>
                    <span className="text-neutral-400 text-[10px] uppercase font-semibold">ID Pesanan</span>
                    <p className="font-mono font-bold text-sm text-[#16382C]">{verificationResult.order.id}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-neutral-400 text-[10px] uppercase font-semibold">PIN Tiket</span>
                    <p className="font-mono font-bold text-sm text-[#EE4D2D]">
                      {verificationResult.order.pickupCode}
                    </p>
                  </div>
                </div>

                <div className="space-y-1">
                  <span className="text-neutral-400 text-[10px] uppercase font-semibold">Pelanggan</span>
                  <p className="font-bold text-neutral-800 text-sm">
                    {verificationResult.order.customerName}
                  </p>
                  <p className="text-neutral-600">{verificationResult.order.customerPhone}</p>
                </div>

                <div>
                  <span className="text-neutral-400 text-[10px] uppercase font-semibold block mb-1.5">
                    Paket Makanan yang Diserahkan
                  </span>
                  <div className="space-y-1.5 bg-neutral-50 p-3 rounded-xl border border-neutral-100">
                    {verificationResult.order.items.map((it, idx) => (
                      <div key={idx} className="flex justify-between text-neutral-800">
                        <span>
                          {it.quantity}x {it.productName}
                        </span>
                        <span className="font-mono text-neutral-600">
                          {it.pricePerItem === 0 ? 'Donasi' : formatRupiah(it.pricePerItem * it.quantity)}
                        </span>
                      </div>
                    ))}
                    <div className="pt-2 border-t border-neutral-200 flex justify-between font-bold text-neutral-900">
                      <span>Total Bayar</span>
                      <span className="font-mono text-[#16382C]">
                        {verificationResult.order.totalPayment === 0
                          ? 'Rp 0 (Donasi)'
                          : formatRupiah(verificationResult.order.totalPayment)}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-800 text-[11px] leading-relaxed">
                  ✓ Penyerahan paket telah dicatat ke sistem SisaPiring Bandung. Selamatkan makanan, cegah emisi karbon!
                </div>
              </div>
            </div>
          )}

          {/* Duplicate Redemption Error */}
          {verificationResult.status === 'duplicate' && (
            <div className="bg-white rounded-2xl border-2 border-rose-500 shadow-lg overflow-hidden animate-in fade-in duration-200">
              <div className="bg-rose-600 text-white p-4 text-center">
                <ShieldAlert className="w-10 h-10 mx-auto text-amber-300 mb-1" />
                <h3 className="text-base font-bold">Peringatan: Kode Sudah Pernah Digunakan!</h3>
                <p className="text-xs text-white/90">
                  Pengambilan ganda dilarang untuk alasan keamanan pangan.
                </p>
              </div>

              <div className="p-5 space-y-3 text-xs">
                <p className="text-rose-900 font-medium leading-relaxed">
                  {verificationResult.message}
                </p>

                {verificationResult.order && (
                  <div className="p-3 bg-neutral-50 rounded-xl border border-neutral-200 space-y-1">
                    <p className="font-bold text-neutral-800">
                      Pelanggan: {verificationResult.order.customerName}
                    </p>
                    <p className="text-neutral-500">
                      Pesanan: {verificationResult.order.id} (Selesai pada: {verificationResult.order.verifiedAt || 'Selesai'})
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Invalid Code Error */}
          {verificationResult.status === 'error' && (
            <div className="bg-white rounded-2xl border border-neutral-200 p-6 text-center space-y-3 shadow-xs">
              <XCircle className="w-10 h-10 text-rose-500 mx-auto" />
              <h3 className="text-sm font-bold text-neutral-900">Verifikasi Gagal</h3>
              <p className="text-xs text-neutral-600 leading-relaxed max-w-xs mx-auto">
                {verificationResult.message}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
