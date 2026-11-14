import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  QrCode,
  Building2,
  Banknote,
  Copy,
  Check,
  Download,
  Clock,
  MapPin,
  Phone,
  User,
  ShieldCheck,
  Sparkles,
  ExternalLink,
  AlertCircle,
  Loader2,
  Share2,
} from 'lucide-react';
import { formatRupiah, SisaPiringItem } from '../../data/sisaPiringCatalog';
import { ResilientImage } from '../ResilientImage';
import { UserAccount } from '../AuthPage';
import { CartEntry, OrderRecord } from '../RescueModals';

export interface RescueCartPageProps {
  cart: CartEntry[];
  currentUser: UserAccount | null;
  initialStep?: 'cart' | 'confirmation';
  onNavigateStep?: (step: 'cart' | 'confirmation') => void;
  onUpdateQty: (id: string, delta: number) => void;
  onRemove: (id: string) => void;
  onClearCart: () => void;
  onBackToEtalase: () => void;
  onNavigateToAuth: () => void;
  onOrderCreated?: (order: OrderRecord) => void;
  onGoToPesanan?: () => void;
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

type BankKey = 'bca' | 'mandiri' | 'bri';

interface BankDetail {
  name: string;
  vaNumber: string;
  accountName: string;
  code: string;
  guide: string[];
}

const BANK_DETAILS: Record<BankKey, BankDetail> = {
  bca: {
    name: 'BCA Virtual Account',
    vaNumber: '8801 2894 8192 4810',
    accountName: 'SisaPiring Penyelamat Pangan',
    code: '014',
    guide: [
      'Buka aplikasi BCA Mobile / myBCA / KlikBCA.',
      'Pilih m-Transfer > BCA Virtual Account.',
      'Masukkan nomor VA: 8801 2894 8192 4810.',
      'Periksa nominal pembayaran dan konfirmasi PIN Anda.',
    ],
  },
  mandiri: {
    name: 'Mandiri Virtual Account',
    vaNumber: '8920 1938 4820 1839',
    accountName: 'SisaPiring Penyelamat Pangan',
    code: '008',
    guide: [
      'Buka aplikasi Livin\' by Mandiri.',
      'Pilih menu Bayar > Multipayment / Virtual Account.',
      'Masukkan nomor VA: 8920 1938 4820 1839.',
      'Pastikan nominal sesuai tagihan lalu selesaikan transaksi.',
    ],
  },
  bri: {
    name: 'BRI BRIVA',
    vaNumber: '1284 0192 8491 8294',
    accountName: 'SisaPiring Penyelamat Pangan',
    code: '002',
    guide: [
      'Buka aplikasi BRImo.',
      'Pilih menu Tagihan > BRIVA.',
      'Masukkan nomor BRIVA: 1284 0192 8491 8294.',
      'Periksa detail nama & nominal lalu masukkan PIN transaksi.',
    ],
  },
};

export const RescueCartFlow: React.FC<RescueCartPageProps> = ({
  cart,
  currentUser,
  initialStep = 'cart',
  onNavigateStep,
  onUpdateQty,
  onRemove,
  onClearCart,
  onBackToEtalase,
  onNavigateToAuth,
  onOrderCreated,
  onGoToPesanan,
}) => {
  // Step state: 'cart' | 'confirmation' | 'payment-pending' | 'payment-success'
  const [step, setStep] = useState<'cart' | 'confirmation' | 'payment-pending' | 'payment-success'>(
    initialStep === 'confirmation' ? 'confirmation' : 'cart'
  );

  // Sync external step change (e.g. popstate / URL)
  useEffect(() => {
    if (initialStep === 'confirmation' && step === 'cart') {
      setStep('confirmation');
    } else if (initialStep === 'cart' && step === 'confirmation') {
      setStep('cart');
    }
  }, [initialStep]);

  // Checkbox Selection state for Cart Items (Item ID strings)
  const [selectedItemIds, setSelectedItemIds] = useState<Set<string>>(() => {
    return new Set(cart.map((entry) => entry.item.id));
  });

  // Whenever items are added to cart, auto-select newly added items
  useEffect(() => {
    setSelectedItemIds((prev) => {
      const next = new Set(prev);
      cart.forEach((entry) => {
        if (!next.has(entry.item.id)) {
          next.add(entry.item.id);
        }
      });
      // Clean up removed items
      const currentIds = new Set(cart.map((c) => c.item.id));
      for (const id of next) {
        if (!currentIds.has(id)) {
          next.delete(id);
        }
      }
      return next;
    });
  }, [cart]);

  // Selected cart items
  const selectedEntries = useMemo(() => {
    return cart.filter((entry) => selectedItemIds.has(entry.item.id));
  }, [cart, selectedItemIds]);

  // Calculations for selected items
  const totalRescuePrice = useMemo(() => {
    return selectedEntries.reduce(
      (sum, entry) => sum + entry.item.rescuePrice * entry.quantity,
      0
    );
  }, [selectedEntries]);

  const totalOriginalPrice = useMemo(() => {
    return selectedEntries.reduce(
      (sum, entry) => sum + entry.item.originalPrice * entry.quantity,
      0
    );
  }, [selectedEntries]);

  const totalSavings = totalOriginalPrice - totalRescuePrice;
  const isAllSelected = cart.length > 0 && selectedItemIds.size === cart.length;

  // Toggle item selection
  const toggleSelectItem = (id: string) => {
    setSelectedItemIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  // Toggle select all
  const toggleSelectAll = () => {
    if (isAllSelected) {
      setSelectedItemIds(new Set());
    } else {
      setSelectedItemIds(new Set(cart.map((c) => c.item.id)));
    }
  };

  // Form State in Confirmation Step
  const [customerName, setCustomerName] = useState(currentUser?.name || '');
  const [customerPhone, setCustomerPhone] = useState(currentUser?.phone || '');
  const [customerAddress, setCustomerAddress] = useState(currentUser?.defaultAddress || '');
  const [customerDistrict, setCustomerDistrict] = useState(currentUser?.district || BANDUNG_DISTRICTS[0]);
  const [pickupNotes, setPickupNotes] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'qris' | 'transfer' | 'cod'>('qris');
  const [selectedBank, setSelectedBank] = useState<BankKey>('bca');
  const [formError, setFormError] = useState('');

  // Update recipient info if currentUser changes
  useEffect(() => {
    if (currentUser) {
      setCustomerName((prev) => prev || currentUser.name);
      setCustomerPhone((prev) => prev || currentUser.phone);
      if (currentUser.defaultAddress) {
        setCustomerAddress((prev) => prev || currentUser.defaultAddress || '');
      }
      if (currentUser.district) {
        setCustomerDistrict((prev) => prev || currentUser.district || BANDUNG_DISTRICTS[0]);
      }
    }
  }, [currentUser]);

  // Payment Pending & Order Generation State
  const [generatedOrder, setGeneratedOrder] = useState<OrderRecord | null>(null);
  const [paymentTimeLeft, setPaymentTimeLeft] = useState<number>(15 * 60); // 15 minutes countdown
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [isVerifyingPayment, setIsVerifyingPayment] = useState<boolean>(false);
  const [redirectCountdown, setRedirectCountdown] = useState<number>(3);

  // Countdown timer for Payment Pending
  useEffect(() => {
    if (step !== 'payment-pending') return;
    const interval = setInterval(() => {
      setPaymentTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [step]);

  // Auto-redirect timer for Payment Success
  useEffect(() => {
    if (step !== 'payment-success') return;
    setRedirectCountdown(3);
    const interval = setInterval(() => {
      setRedirectCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          // Redirect to orders page
          if (onGoToPesanan) {
            onGoToPesanan();
          } else {
            onBackToEtalase();
          }
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [step, onGoToPesanan, onBackToEtalase]);

  // Format MM:SS for countdown timer
  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  // Copy helper
  const handleCopy = (text: string, label: string) => {
    if (navigator?.clipboard?.writeText) {
      void navigator.clipboard.writeText(text);
      setCopiedText(label);
      setTimeout(() => setCopiedText(null), 2000);
    }
  };

  // Canvas QR Code Generator & Downloader
  const qrCanvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (step !== 'payment-pending' || paymentMethod !== 'qris') return;
    const canvas = qrCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const size = 260;
    canvas.width = size;
    canvas.height = size;

    // Background
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, size, size);

    // Border
    ctx.strokeStyle = '#E5E7EB';
    ctx.lineWidth = 2;
    ctx.strokeRect(4, 4, size - 8, size - 8);

    // Draw stylized QR Matrix
    const moduleCount = 29;
    const cellSize = (size - 32) / moduleCount;
    const offsetX = 16;
    const offsetY = 16;

    ctx.fillStyle = '#1F281A';

    // Helper for Finder Pattern (top-left, top-right, bottom-left)
    const drawFinderPattern = (startX: number, startY: number) => {
      // Outer 7x7
      ctx.fillRect(startX, startY, cellSize * 7, cellSize * 7);
      // Inner 5x5 white
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(startX + cellSize, startY + cellSize, cellSize * 5, cellSize * 5);
      // Center 3x3 black
      ctx.fillStyle = '#1F281A';
      ctx.fillRect(startX + cellSize * 2, startY + cellSize * 2, cellSize * 3, cellSize * 3);
    };

    drawFinderPattern(offsetX, offsetY);
    drawFinderPattern(offsetX + (moduleCount - 7) * cellSize, offsetY);
    drawFinderPattern(offsetX, offsetY + (moduleCount - 7) * cellSize);

    // Random but deterministic dot pattern based on order code
    const seedString = (generatedOrder?.orderCode || 'SP-9999') + totalRescuePrice;
    let seed = 0;
    for (let i = 0; i < seedString.length; i++) {
      seed = (seed * 31 + seedString.charCodeAt(i)) % 100000;
    }

    const pseudoRandom = () => {
      seed = (seed * 9301 + 49297) % 233280;
      return seed / 233280;
    };

    for (let r = 0; r < moduleCount; r++) {
      for (let c = 0; c < moduleCount; c++) {
        // Skip finder zones
        const inTL = r < 8 && c < 8;
        const inTR = r < 8 && c >= moduleCount - 8;
        const inBL = r >= moduleCount - 8 && c < 8;
        // Skip center logo zone (9x9 in center)
        const inCenter =
          r >= Math.floor(moduleCount / 2) - 3 &&
          r <= Math.floor(moduleCount / 2) + 3 &&
          c >= Math.floor(moduleCount / 2) - 3 &&
          c <= Math.floor(moduleCount / 2) + 3;

        if (!inTL && !inTR && !inBL && !inCenter) {
          if (pseudoRandom() > 0.48) {
            ctx.fillStyle = '#1F281A';
            ctx.fillRect(
              offsetX + c * cellSize + 0.5,
              offsetY + r * cellSize + 0.5,
              cellSize - 1,
              cellSize - 1
            );
          }
        }
      }
    }

    // Draw Center Logo Badge (SisaPiring Leaf / Plate)
    const centerSize = cellSize * 7.5;
    const centerPos = (size - centerSize) / 2;
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.roundRect(centerPos, centerPos, centerSize, centerSize, 8);
    ctx.fill();
    ctx.strokeStyle = '#8DA249';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Emblem in center
    ctx.fillStyle = '#1F281A';
    ctx.beginPath();
    ctx.arc(size / 2, size / 2, centerSize * 0.35, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#8DA249';
    ctx.font = 'bold 10px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('SP', size / 2, size / 2);
  }, [step, paymentMethod, generatedOrder, totalRescuePrice]);

  // Download QR Code Function
  const handleDownloadQR = () => {
    const canvas = qrCanvasRef.current;
    if (!canvas) return;
    const dataUrl = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = `QRIS-SisaPiring-${generatedOrder?.orderCode || 'pesanan'}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Download Bank Transfer Receipt / Instructions
  const handleDownloadBankReceipt = () => {
    const bank = BANK_DETAILS[selectedBank];
    const content = `=========================================
PETUNJUK TRANSFER PEMBAYARAN SISAPIRING
=========================================
Kode Pesanan : ${generatedOrder?.orderCode || 'SP-XXXX'}
Waktu        : ${new Date().toLocaleString('id-ID')}
Penerima     : ${bank.accountName}
Bank         : ${bank.name}
No. Rekening : ${bank.vaNumber.replace(/\s+/g, '')}
Total Bayar  : ${formatRupiah(totalRescuePrice)}

Instruksi Pembayaran:
${bank.guide.map((g, i) => `${i + 1}. ${g}`).join('\n')}

Simpan bukti pembayaran ini saat mengambil makanan di kasir mitra UMKM Bandung.
Terima kasih telah menyelamatkan makanan bersama SisaPiring!
=========================================`;

    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Instruksi-Transfer-${generatedOrder?.orderCode || 'SP'}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Go to Confirmation Step
  const handleProceedToConfirmation = () => {
    if (selectedEntries.length === 0) return;
    setStep('confirmation');
    if (onNavigateStep) {
      onNavigateStep('confirmation');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Go back to Cart Step
  const handleBackToCart = () => {
    setStep('cart');
    if (onNavigateStep) {
      onNavigateStep('cart');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Handle Checkout Confirmation Submit -> Generate Pending Payment
  const handleConfirmAndPay = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || customerName.trim().length < 2) {
      setFormError('Mohon masukkan nama lengkap pengambil paket.');
      return;
    }
    const cleanPhone = customerPhone.replace(/\D/g, '');
    if (cleanPhone.length < 9) {
      setFormError('Mohon masukkan nomor WhatsApp aktif (minimal 9 digit) untuk tiket.');
      return;
    }

    setFormError('');
    const randomCode = `SP-${Math.floor(1000 + Math.random() * 9000)}`;
    const newOrder: OrderRecord = {
      orderCode: randomCode,
      createdAt: 'Hari ini · Baru saja',
      name: customerName.trim(),
      phone: customerPhone.trim(),
      payment: paymentMethod,
      paymentDetail:
        paymentMethod === 'transfer'
          ? `${BANK_DETAILS[selectedBank].name} (${BANK_DETAILS[selectedBank].vaNumber})`
          : paymentMethod === 'qris'
          ? 'QRIS Real-Time Terintegrasi'
          : 'Bayar Tunai di Kasir UMKM (COD)',
      totalPaid: totalRescuePrice,
      totalSaved: totalSavings,
      status: 'siap-diambil',
      deliveryStage: 'diterima',
      items: [...selectedEntries],
    };

    setGeneratedOrder(newOrder);

    // If COD, or if user opts to pay directly, proceed to pending payment screen
    setStep('payment-pending');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Simulate Payment Verification -> Success Animation
  const handleVerifyPayment = () => {
    setIsVerifyingPayment(true);
    setTimeout(() => {
      setIsVerifyingPayment(false);
      if (generatedOrder && onOrderCreated) {
        onOrderCreated(generatedOrder);
      }
      // Remove checked items from cart
      selectedItemIds.forEach((id) => onRemove(id));
      setStep('payment-success');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 1400);
  };

  return (
    <div className="min-h-screen bg-stone-50 pb-24 text-stone-800">
      {/* ============================================================== */}
      {/* 1. STEP KANTONG: HANYA PRODUK DENGAN CENTANG & LIST            */}
      {/* ============================================================== */}
      {step === 'cart' && (
        <>
          {/* Header */}
          <section className="bg-white border-b border-stone-200 sticky top-14 md:top-16 z-20">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={onBackToEtalase}
                  aria-label="Kembali ke Etalase"
                  className="w-10 h-10 rounded-xl bg-stone-100 hover:bg-stone-200/80 flex items-center justify-center text-stone-800 transition-colors cursor-pointer shrink-0"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                  <h1 className="text-base sm:text-xl font-bold text-stone-900 tracking-tight">
                    Kantong Penyelamatan
                  </h1>
                  <p className="text-xs text-stone-500">
                    Pilih dan centang hidangan yang ingin Anda checkout sore ini
                  </p>
                </div>
              </div>

              {cart.length > 0 && (
                <button
                  type="button"
                  onClick={onClearCart}
                  className="text-xs font-semibold text-stone-500 hover:text-red-600 transition-colors cursor-pointer shrink-0"
                >
                  Kosongkan Kantong
                </button>
              )}
            </div>
          </section>

          {/* Cart Body */}
          <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-5 sm:pt-8">
            {cart.length === 0 ? (
              /* EMPTY CART STATE */
              <div className="max-w-md mx-auto bg-white border border-stone-200 rounded-3xl p-10 sm:p-14 text-center space-y-5 shadow-xs">
                <div className="w-16 h-16 rounded-3xl bg-stone-100 text-stone-400 flex items-center justify-center mx-auto">
                  <ShoppingBag className="w-8 h-8" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-lg font-bold text-stone-900">
                    Kantong penyelamatan Anda kosong
                  </h2>
                  <p className="text-xs sm:text-sm text-stone-500 leading-relaxed">
                    Belum ada hidangan sisa piring yang dimasukkan. Temukan aneka roti, nasi kotak, dan camilan UMKM Bandung dengan diskon sore hemat!
                  </p>
                </div>
                <button
                  type="button"
                  onClick={onBackToEtalase}
                  className="w-full h-12 bg-[#1F281A] hover:bg-[#2D3A26] text-white text-sm font-semibold rounded-2xl transition-colors cursor-pointer shadow-xs"
                >
                  Jelajahi Etalase Sore Ini
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {/* Select All Checkbox Bar */}
                <div className="bg-white border border-stone-200 rounded-2xl px-4 py-3.5 flex items-center justify-between shadow-xs">
                  <label className="flex items-center gap-3 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={isAllSelected}
                      onChange={toggleSelectAll}
                      className="w-5 h-5 rounded-md accent-[#8da249] text-white border-stone-300 focus:ring-[#8da249] cursor-pointer"
                    />
                    <span className="text-xs sm:text-sm font-semibold text-stone-900">
                      Pilih Semua ({selectedEntries.length}/{cart.length} Produk)
                    </span>
                  </label>

                  {selectedEntries.length > 0 && (
                    <span className="text-xs text-stone-500 hidden sm:inline">
                      {selectedEntries.length} porsi siap ditebus
                    </span>
                  )}
                </div>

                {/* List of Products (Only Product Cards) */}
                <div className="bg-white border border-stone-200 rounded-2xl divide-y divide-stone-100 shadow-xs overflow-hidden">
                  {cart.map(({ item, quantity }) => {
                    const isChecked = selectedItemIds.has(item.id);
                    return (
                      <div
                        key={item.id}
                        className={`p-4 sm:p-5 flex items-start sm:items-center gap-3 sm:gap-4 transition-colors ${
                          isChecked ? 'bg-white' : 'bg-stone-50/70 opacity-75'
                        }`}
                      >
                        {/* Checkbox per Item */}
                        <div className="pt-2 sm:pt-0 shrink-0">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggleSelectItem(item.id)}
                            aria-label={`Pilih ${item.title}`}
                            className="w-5 h-5 rounded-md accent-[#8da249] text-white border-stone-300 focus:ring-[#8da249] cursor-pointer"
                          />
                        </div>

                        {/* Thumbnail */}
                        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden bg-stone-100 shrink-0 border border-stone-100">
                          <ResilientImage
                            src={item.imageUrl}
                            alt={item.title}
                            fallbackTitle={item.title}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        {/* Detail Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-1 sm:gap-2">
                            <div>
                              <p className="text-[11px] sm:text-xs font-medium text-stone-500 truncate flex items-center gap-1.5">
                                <span>{item.merchantName}</span>
                                <span>·</span>
                                <span className="text-[#8da249] font-semibold">
                                  Ambil {item.pickupWindow}
                                </span>
                              </p>
                              <h3 className="text-xs sm:text-sm font-bold text-stone-900 leading-snug line-clamp-2 mt-0.5">
                                {item.title}
                              </h3>
                            </div>

                            <div className="text-left sm:text-right mt-1 sm:mt-0">
                              <div className="text-sm sm:text-base font-extrabold text-[#f89254] font-mono-tabular">
                                {formatRupiah(item.rescuePrice * quantity)}
                              </div>
                              <div className="text-[11px] text-stone-400 line-through font-mono-tabular">
                                {formatRupiah(item.originalPrice * quantity)}
                              </div>
                            </div>
                          </div>

                          {/* Controls: Stepper & Remove */}
                          <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-stone-100">
                            <div className="flex items-center border border-stone-200 rounded-xl bg-white shadow-2xs h-8 sm:h-9">
                              <button
                                type="button"
                                onClick={() => onUpdateQty(item.id, -1)}
                                className="w-8 sm:w-9 h-full flex items-center justify-center text-stone-700 hover:bg-stone-100 rounded-l-xl transition-colors cursor-pointer"
                                aria-label="Kurangi porsi"
                              >
                                <Minus className="w-3.5 h-3.5" />
                              </button>
                              <span className="w-9 text-center text-xs font-bold font-mono-tabular text-stone-900">
                                {quantity}
                              </span>
                              <button
                                type="button"
                                onClick={() => onUpdateQty(item.id, 1)}
                                disabled={quantity >= item.remainingStock}
                                className="w-8 sm:w-9 h-full flex items-center justify-center text-stone-700 hover:bg-stone-100 disabled:opacity-30 rounded-r-xl transition-colors cursor-pointer"
                                aria-label="Tambah porsi"
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            </div>

                            <button
                              type="button"
                              onClick={() => onRemove(item.id)}
                              className="px-2.5 py-1 text-xs text-stone-400 hover:text-red-600 inline-flex items-center gap-1.5 transition-colors cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span className="hidden sm:inline">Hapus</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Bottom Sticky Checkout Bar */}
                <div className="bg-white border border-stone-200 rounded-2xl p-4 sm:p-5 shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2 text-xs text-stone-500">
                      <span>Total Penghematan Makanan:</span>
                      <span className="font-bold text-[#8da249] font-mono-tabular">
                        {formatRupiah(totalSavings)}
                      </span>
                    </div>
                    <div className="flex items-baseline gap-2">
                      <span className="text-xs sm:text-sm font-semibold text-stone-600">
                        Total Tebus ({selectedEntries.length} dipilih):
                      </span>
                      <span className="text-lg sm:text-2xl font-black text-[#f89254] font-mono-tabular">
                        {formatRupiah(totalRescuePrice)}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2.5">
                    <button
                      type="button"
                      onClick={handleProceedToConfirmation}
                      disabled={selectedEntries.length === 0}
                      className="flex-1 sm:flex-none min-w-[220px] h-12 px-6 bg-[#f89254] hover:bg-[#e57d3d] disabled:bg-stone-200 disabled:text-stone-400 disabled:cursor-not-allowed text-white text-xs sm:text-sm font-bold rounded-2xl shadow-sm hover:shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                    >
                      <span>Lanjut ke Pembayaran</span>
                      {selectedEntries.length > 0 && (
                        <span className="px-2 py-0.5 rounded-full bg-white/20 text-[11px] font-bold">
                          {selectedEntries.length}
                        </span>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* ============================================================== */}
      {/* 2. STEP KONFIRMASI: IDENTITAS, ALAMAT & METODE PEMBAYARAN        */}
      {/* ============================================================== */}
      {step === 'confirmation' && (
        <>
          {/* Header */}
          <section className="bg-white border-b border-stone-200 sticky top-14 md:top-16 z-20">
            <div className="max-w-5xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleBackToCart}
                  aria-label="Kembali ke Kantong"
                  className="w-10 h-10 rounded-xl bg-stone-100 hover:bg-stone-200/80 flex items-center justify-center text-stone-800 transition-colors cursor-pointer shrink-0"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                  <h1 className="text-base sm:text-xl font-bold text-stone-900 tracking-tight">
                    Konfirmasi & Pembayaran
                  </h1>
                  <p className="text-xs text-stone-500">
                    Langkah 2 dari 3 · Pastikan identitas, alamat, dan metode bayar
                  </p>
                </div>
              </div>

              {/* Step indicator pills */}
              <div className="hidden sm:flex items-center gap-1.5 text-xs font-semibold">
                <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 flex items-center gap-1">
                  <Check className="w-3 h-3" />
                  <span>Kantong</span>
                </span>
                <span className="text-stone-300">›</span>
                <span className="px-2.5 py-1 rounded-full bg-[#1F281A] text-white">
                  Konfirmasi
                </span>
                <span className="text-stone-300">›</span>
                <span className="px-2.5 py-1 rounded-full bg-stone-100 text-stone-400">
                  Bayar
                </span>
              </div>
            </div>
          </section>

          <div className="max-w-5xl mx-auto px-4 sm:px-6 pt-5 sm:pt-8">
            <form onSubmit={handleConfirmAndPay} className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Left Column: Form Details & Payment Selection (7 cols) */}
              <div className="lg:col-span-7 space-y-5">
                {/* 1. Selected Products Summary Card */}
                <div className="bg-white border border-stone-200 rounded-3xl p-5 sm:p-6 space-y-4 shadow-xs">
                  <div className="flex items-center justify-between pb-3 border-b border-stone-100">
                    <h2 className="text-sm sm:text-base font-bold text-stone-900 flex items-center gap-2">
                      <ShoppingBag className="w-4 h-4 text-[#8da249]" />
                      <span>Produk yang Dipilih ({selectedEntries.length})</span>
                    </h2>
                    <button
                      type="button"
                      onClick={handleBackToCart}
                      className="text-xs font-semibold text-[#8da249] hover:underline cursor-pointer"
                    >
                      Ubah Pilihan
                    </button>
                  </div>

                  <div className="space-y-3">
                    {selectedEntries.map(({ item, quantity }) => (
                      <div
                        key={item.id}
                        className="flex items-center gap-3 p-3 bg-stone-50 rounded-2xl border border-stone-100"
                      >
                        <div className="w-14 h-14 rounded-xl overflow-hidden bg-stone-200 shrink-0">
                          <ResilientImage
                            src={item.imageUrl}
                            alt={item.title}
                            fallbackTitle={item.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs sm:text-sm font-bold text-stone-900 truncate">
                            {item.title}
                          </h4>
                          <p className="text-[11px] text-stone-500">
                            {item.merchantName} · Ambil: {item.pickupWindow}
                          </p>
                          <p className="text-xs text-stone-600 mt-0.5">
                            {quantity} porsi × {formatRupiah(item.rescuePrice)}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <span className="text-xs sm:text-sm font-extrabold text-[#f89254] font-mono-tabular">
                            {formatRupiah(item.rescuePrice * quantity)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 2. Recipient Identity & Address */}
                <div className="bg-white border border-stone-200 rounded-3xl p-5 sm:p-6 space-y-4 shadow-xs">
                  <div className="pb-3 border-b border-stone-100">
                    <h2 className="text-sm sm:text-base font-bold text-stone-900 flex items-center gap-2">
                      <User className="w-4 h-4 text-[#8da249]" />
                      <span>Identitas & Alamat Pengambil Paket</span>
                    </h2>
                    <p className="text-xs text-stone-500 mt-0.5">
                      Data ini dicantumkan pada tiket digital untuk diverifikasi kasir mitra UMKM
                    </p>
                  </div>

                  {!currentUser && (
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-2xl flex items-center justify-between gap-3 text-xs text-amber-900">
                      <span>Sudah punya akun SisaPiring? Login untuk isi otomatis.</span>
                      <button
                        type="button"
                        onClick={onNavigateToAuth}
                        className="px-3 py-1.5 rounded-xl bg-amber-900 text-white font-semibold hover:bg-amber-950 transition-colors cursor-pointer shrink-0"
                      >
                        Login Sekarang
                      </button>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                        Nama Lengkap Pengambil <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={customerName}
                        onChange={(e) => setCustomerName(e.target.value)}
                        placeholder="Contoh: Budi Santoso"
                        required
                        className="w-full h-11 px-3.5 text-xs sm:text-sm bg-white border border-stone-300 rounded-xl focus:outline-none focus:border-[#8da249] focus:ring-1 focus:ring-[#8da249]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                        Nomor WhatsApp (Tiket Ambil) <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="tel"
                        value={customerPhone}
                        onChange={(e) => setCustomerPhone(e.target.value)}
                        placeholder="Contoh: 081234567890"
                        required
                        className="w-full h-11 px-3.5 text-xs sm:text-sm bg-white border border-stone-300 rounded-xl focus:outline-none focus:border-[#8da249] focus:ring-1 focus:ring-[#8da249] font-mono-tabular"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                      Kecamatan / Area Bandung
                    </label>
                    <select
                      value={customerDistrict}
                      onChange={(e) => setCustomerDistrict(e.target.value)}
                      className="w-full h-11 px-3.5 text-xs sm:text-sm bg-white border border-stone-300 rounded-xl focus:outline-none focus:border-[#8da249]"
                    >
                      {BANDUNG_DISTRICTS.map((dist) => (
                        <option key={dist} value={dist}>
                          {dist}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                      Alamat / Domisili Pengambil
                    </label>
                    <textarea
                      rows={2}
                      value={customerAddress}
                      onChange={(e) => setCustomerAddress(e.target.value)}
                      placeholder="Contoh: Jl. Dago No. 45, Bandung"
                      className="w-full p-3 text-xs sm:text-sm bg-white border border-stone-300 rounded-xl focus:outline-none focus:border-[#8da249]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-stone-700 mb-1.5">
                      Catatan Pengambilan (Opsional)
                    </label>
                    <input
                      type="text"
                      value={pickupNotes}
                      onChange={(e) => setPickupNotes(e.target.value)}
                      placeholder="Contoh: Diambil sekitar jam 19.30 WIB oleh kerabat"
                      className="w-full h-11 px-3.5 text-xs sm:text-sm bg-white border border-stone-300 rounded-xl focus:outline-none focus:border-[#8da249]"
                    />
                  </div>
                </div>

                {/* 3. Payment Method Selection */}
                <div className="bg-white border border-stone-200 rounded-3xl p-5 sm:p-6 space-y-4 shadow-xs">
                  <div className="pb-3 border-b border-stone-100">
                    <h2 className="text-sm sm:text-base font-bold text-stone-900 flex items-center gap-2">
                      <Banknote className="w-4 h-4 text-[#8da249]" />
                      <span>Pilih Metode Pembayaran</span>
                    </h2>
                    <p className="text-xs text-stone-500 mt-0.5">
                      Tersedia pembayaran instan bebas biaya admin & opsi bayar tunai
                    </p>
                  </div>

                  <div className="space-y-3">
                    {/* Method 1: QRIS */}
                    <div
                      onClick={() => setPaymentMethod('qris')}
                      className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-start gap-3.5 ${
                        paymentMethod === 'qris'
                          ? 'border-[#8da249] bg-[#8da249]/5'
                          : 'border-stone-200 bg-white hover:border-stone-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        checked={paymentMethod === 'qris'}
                        onChange={() => setPaymentMethod('qris')}
                        className="mt-1 w-4 h-4 accent-[#8da249]"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs sm:text-sm font-bold text-stone-900 flex items-center gap-2">
                            <span>QRIS Instan (Semua E-Wallet & Bank)</span>
                            <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                              Rekomendasi
                            </span>
                          </span>
                          <QrCode className="w-4 h-4 text-[#8da249]" />
                        </div>
                        <p className="text-xs text-stone-500 mt-1">
                          Scan barcode lewat GoPay, BCA, ShopeePay, OVO, Dana, LinkAja, atau mobile banking apapun. Bebas biaya admin.
                        </p>
                      </div>
                    </div>

                    {/* Method 2: Transfer Bank */}
                    <div
                      onClick={() => setPaymentMethod('transfer')}
                      className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-start gap-3.5 ${
                        paymentMethod === 'transfer'
                          ? 'border-[#8da249] bg-[#8da249]/5'
                          : 'border-stone-200 bg-white hover:border-stone-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        checked={paymentMethod === 'transfer'}
                        onChange={() => setPaymentMethod('transfer')}
                        className="mt-1 w-4 h-4 accent-[#8da249]"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs sm:text-sm font-bold text-stone-900">
                            Transfer Bank / Virtual Account
                          </span>
                          <Building2 className="w-4 h-4 text-stone-500" />
                        </div>
                        <p className="text-xs text-stone-500 mt-1">
                          Transfer langsung ke nomor Virtual Account BCA, Mandiri, atau BRI dengan verifikasi otomatis.
                        </p>

                        {paymentMethod === 'transfer' && (
                          <div className="mt-3 pt-3 border-t border-stone-200/80 flex flex-wrap gap-2">
                            {(['bca', 'mandiri', 'bri'] as BankKey[]).map((bank) => (
                              <button
                                key={bank}
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedBank(bank);
                                }}
                                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                                  selectedBank === bank
                                    ? 'bg-[#1F281A] text-white border-[#1F281A]'
                                    : 'bg-white text-stone-700 border-stone-300 hover:bg-stone-50'
                                }`}
                              >
                                {bank.toUpperCase()}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Method 3: COD */}
                    <div
                      onClick={() => setPaymentMethod('cod')}
                      className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-start gap-3.5 ${
                        paymentMethod === 'cod'
                          ? 'border-[#8da249] bg-[#8da249]/5'
                          : 'border-stone-200 bg-white hover:border-stone-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        checked={paymentMethod === 'cod'}
                        onChange={() => setPaymentMethod('cod')}
                        className="mt-1 w-4 h-4 accent-[#8da249]"
                      />
                      <div className="flex-1">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs sm:text-sm font-bold text-stone-900">
                            Bayar Tunai di Kasir UMKM (COD)
                          </span>
                          <Banknote className="w-4 h-4 text-stone-500" />
                        </div>
                        <p className="text-xs text-stone-500 mt-1">
                          Bayar secara langsung di kasir toko saat mengambil paket makanan dengan menunjukkan kode tiket.
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Cost Summary & Submit (5 cols) */}
              <div className="lg:col-span-5 relative bg-white border border-stone-200 rounded-3xl p-5 sm:p-6 space-y-5 lg:sticky lg:top-24 shadow-xs">
                <h3 className="text-sm sm:text-base font-bold text-stone-900 pb-3 border-b border-stone-100">
                  Ringkasan Pembayaran
                </h3>

                <div className="space-y-2.5 text-xs sm:text-sm">
                  <div className="flex justify-between text-stone-500">
                    <span>Harga Asli Hidangan</span>
                    <span className="line-through font-mono-tabular">
                      {formatRupiah(totalOriginalPrice)}
                    </span>
                  </div>

                  <div className="flex justify-between text-[#8da249] font-semibold">
                    <span>Diskon Penyelamatan Pangan</span>
                    <span className="font-mono-tabular">
                      -{formatRupiah(totalSavings)}
                    </span>
                  </div>

                  <div className="flex justify-between text-stone-600">
                    <span>Biaya Layanan SisaPiring</span>
                    <span className="font-semibold text-emerald-800">GRATIS</span>
                  </div>

                  <div className="pt-3 border-t border-stone-200 flex justify-between items-baseline">
                    <span className="text-sm sm:text-base font-bold text-stone-900">
                      Total Bayar
                    </span>
                    <span className="text-xl sm:text-2xl font-black text-[#f89254] font-mono-tabular">
                      {formatRupiah(totalRescuePrice)}
                    </span>
                  </div>
                </div>

                {formError && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-2 text-xs text-red-700 font-medium">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{formError}</span>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full h-13 px-4 bg-[#f89254] hover:bg-[#e57d3d] text-white text-xs sm:text-sm font-bold rounded-2xl shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>Konfirmasi & Bayar Sekarang</span>
                </button>

                <p className="text-[11px] text-stone-400 text-center leading-relaxed">
                  Dengan mengonfirmasi pesanan, Anda berkomitmen mengambil makanan tepat waktu di mitra UMKM Bandung sesuai jadwal sore.
                </p>
              </div>
            </form>
          </div>
        </>
      )}

      {/* ============================================================== */}
      {/* 3. STEP MENUNGGU PEMBAYARAN (QRIS / REKENING DOWNLOAD & COPY)   */}
      {/* ============================================================== */}
      {step === 'payment-pending' && generatedOrder && (
        <div className="max-w-2xl mx-auto px-4 sm:px-6 pt-6 sm:pt-10">
          <div className="bg-white border border-stone-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
            {/* Pending Status Header with Countdown */}
            <div className="text-center space-y-2 pb-5 border-b border-stone-100">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold animate-pulse">
                <Clock className="w-3.5 h-3.5" />
                <span>Menunggu Pembayaran</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-stone-900 tracking-tight">
                Selesaikan Pembayaran Anda
              </h2>
              <p className="text-xs sm:text-sm text-stone-500">
                Batas waktu pembayaran:{' '}
                <strong className="text-stone-900 font-mono-tabular">
                  {formatTimer(paymentTimeLeft)}
                </strong>
              </p>
            </div>

            {/* Total Due Banner */}
            <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4 flex items-center justify-between">
              <div>
                <span className="text-xs text-stone-500">Total Nominal Tagihan</span>
                <div className="text-xl sm:text-2xl font-black text-[#f89254] font-mono-tabular">
                  {formatRupiah(generatedOrder.totalPaid)}
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleCopy(String(generatedOrder.totalPaid), 'Nominal')}
                className="px-3 py-1.5 bg-white border border-stone-300 hover:bg-stone-100 rounded-xl text-xs font-semibold text-stone-700 transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                {copiedText === 'Nominal' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Tersalin!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Salin</span>
                  </>
                )}
              </button>
            </div>

            {/* ============ PAYMENT METHOD: QRIS ============ */}
            {paymentMethod === 'qris' && (
              <div className="space-y-4 text-center">
                <div className="p-4 bg-white border border-stone-200 rounded-3xl max-w-xs mx-auto shadow-xs space-y-3">
                  <div className="flex items-center justify-between text-xs font-bold px-1 text-stone-500">
                    <span>QRIS STANDAR NASIONAL</span>
                    <span className="text-[#8da249]">SISAPIRING</span>
                  </div>

                  {/* Canvas QR Code */}
                  <div className="flex justify-center p-2 bg-white rounded-2xl border border-stone-100">
                    <canvas ref={qrCanvasRef} className="w-[220px] h-[220px]" />
                  </div>

                  <p className="text-[11px] text-stone-500 leading-tight">
                    NMID: ID1020394819201 · SisaPiring Indonesia
                  </p>
                </div>

                {/* QR Actions: Download & Copy */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 max-w-sm mx-auto">
                  <button
                    type="button"
                    onClick={handleDownloadQR}
                    className="w-full sm:flex-1 h-11 px-4 bg-[#1F281A] hover:bg-[#2D3A26] text-white text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 shadow-2xs"
                  >
                    <Download className="w-4 h-4" />
                    <span>Simpan / Unduh QR Code</span>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      handleCopy(
                        `QRIS-SISAPIRING-${generatedOrder.orderCode}-${generatedOrder.totalPaid}`,
                        'QR'
                      )
                    }
                    className="w-full sm:w-auto h-11 px-4 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    {copiedText === 'QR' ? (
                      <>
                        <Check className="w-4 h-4 text-emerald-600" />
                        <span>Kode Tersalin</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-4 h-4" />
                        <span>Salin Kode</span>
                      </>
                    )}
                  </button>
                </div>

                <div className="p-4 bg-stone-50 rounded-2xl text-left space-y-2 text-xs text-stone-600">
                  <p className="font-bold text-stone-900">Cara Membayar QRIS:</p>
                  <ol className="list-decimal list-inside space-y-1">
                    <li>Unduh gambar QR code atau scan langsung di layar Anda.</li>
                    <li>Buka aplikasi GoPay, BCA, OVO, Dana, ShopeePay, atau m-Banking.</li>
                    <li>Pilih menu <strong>Scan / Bayar</strong> dan upload QR yang telah disimpan.</li>
                    <li>Periksa nama penerima <strong>SisaPiring Indonesia</strong> dan selesaikan bayar.</li>
                  </ol>
                </div>
              </div>
            )}

            {/* ============ PAYMENT METHOD: TRANSFER BANK ============ */}
            {paymentMethod === 'transfer' && (
              <div className="space-y-4">
                <div className="p-5 bg-stone-50 border border-stone-200 rounded-2xl space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-stone-500">
                      {BANK_DETAILS[selectedBank].name}
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                      Verifikasi Otomatis
                    </span>
                  </div>

                  <div>
                    <span className="text-xs text-stone-500">Nomor Virtual Account:</span>
                    <div className="flex items-center justify-between mt-1">
                      <span className="font-mono-tabular font-extrabold text-lg sm:text-xl text-stone-900 tracking-wide">
                        {BANK_DETAILS[selectedBank].vaNumber}
                      </span>
                      <button
                        type="button"
                        onClick={() =>
                          handleCopy(
                            BANK_DETAILS[selectedBank].vaNumber.replace(/\s+/g, ''),
                            'Rekening'
                          )
                        }
                        className="px-3 py-1.5 bg-white border border-stone-300 hover:bg-stone-100 rounded-xl text-xs font-semibold text-stone-700 transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                      >
                        {copiedText === 'Rekening' ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Tersalin!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Salin No. Rekening</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-stone-200/80 text-xs text-stone-600">
                    <span className="text-stone-400">Atas Nama:</span>{' '}
                    <strong className="text-stone-900">{BANK_DETAILS[selectedBank].accountName}</strong>
                  </div>
                </div>

                {/* Download Transfer Detail */}
                <button
                  type="button"
                  onClick={handleDownloadBankReceipt}
                  className="w-full h-11 px-4 bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  <span>Simpan / Unduh Detail Rekening & Panduan</span>
                </button>

                <div className="p-4 bg-white border border-stone-200 rounded-2xl text-left space-y-2 text-xs text-stone-600">
                  <p className="font-bold text-stone-900">Petunjuk Pembayaran:</p>
                  <ol className="list-decimal list-inside space-y-1">
                    {BANK_DETAILS[selectedBank].guide.map((stepItem, idx) => (
                      <li key={idx}>{stepItem}</li>
                    ))}
                  </ol>
                </div>
              </div>
            )}

            {/* ============ PAYMENT METHOD: COD ============ */}
            {paymentMethod === 'cod' && (
              <div className="p-5 bg-amber-50 border border-amber-200 rounded-2xl space-y-2 text-xs text-amber-900">
                <p className="font-bold text-sm">Bayar Tunai di Kasir UMKM</p>
                <p className="leading-relaxed">
                  Pesanan Anda telah disiapkan. Silakan bawa uang pas sebesar{' '}
                  <strong className="font-bold text-stone-900">
                    {formatRupiah(generatedOrder.totalPaid)}
                  </strong>{' '}
                  saat menjemput paket makanan di lokasi kasir mitra UMKM Bandung sore ini.
                </p>
              </div>
            )}

            {/* Verify / Complete Button */}
            <div className="pt-4 border-t border-stone-100 space-y-2.5">
              <button
                type="button"
                onClick={handleVerifyPayment}
                disabled={isVerifyingPayment}
                className="w-full h-13 px-4 bg-[#8da249] hover:bg-[#7b8e3d] text-white text-xs sm:text-sm font-bold rounded-2xl shadow-sm hover:shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
              >
                {isVerifyingPayment ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Memverifikasi Pembayaran Anda...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Saya Sudah Bayar / Cek Status Pembayaran</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleBackToCart}
                className="w-full py-2 text-xs text-stone-500 hover:text-stone-700 cursor-pointer text-center"
              >
                Batalkan & Kembali ke Kantong
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ============================================================== */}
      {/* 4. STEP SUKSES: ANIMASI PEMBAYARAN SELESAI -> /pesanan          */}
      {/* ============================================================== */}
      {step === 'payment-success' && generatedOrder && (
        <div className="max-w-xl mx-auto px-4 sm:px-6 pt-10 sm:pt-16">
          <div className="bg-white border border-stone-200 rounded-3xl p-6 sm:p-10 text-center space-y-6 shadow-md relative overflow-hidden animate-payment-pop">
            {/* Top Confetti & Sparkles */}
            <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-48 h-48 bg-[#8da249]/10 rounded-full blur-2xl pointer-events-none" />

            {/* Success Checkmark Circle with Pop Animation */}
            <div className="relative inline-flex items-center justify-center w-20 h-20 sm:w-24 sm:h-24 rounded-full bg-emerald-100 text-emerald-600 mx-auto shadow-inner">
              <span className="absolute inset-0 rounded-full bg-emerald-400/20 animate-ping" />
              <CheckCircle2 className="w-12 h-12 sm:w-14 sm:h-14 relative z-10" />
            </div>

            {/* Header Text */}
            <div className="space-y-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>Makanan Terselamatkan!</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-stone-900 tracking-tight">
                Pembayaran Berhasil!
              </h2>
              <p className="text-xs sm:text-sm text-stone-500 max-w-sm mx-auto leading-relaxed">
                Alhamdulillah! Anda baru saja menyelamatkan{' '}
                <strong className="text-stone-800">{generatedOrder.items.length} jenis makanan</strong>{' '}
                dari potensi pemborosan pangan.
              </p>
            </div>

            {/* Order Ticket Card */}
            <div className="p-5 bg-stone-50 border border-stone-200 rounded-2xl text-left space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-stone-200">
                <span className="text-xs text-stone-500">Kode Tiket Pengambilan:</span>
                <span className="font-mono-tabular font-extrabold text-base text-stone-900">
                  {generatedOrder.orderCode}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-stone-500">Penerima:</span>
                <span className="font-semibold text-stone-800">
                  {generatedOrder.name} ({generatedOrder.phone})
                </span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-stone-500">Total Terbayar:</span>
                <span className="font-extrabold text-[#f89254] font-mono-tabular">
                  {formatRupiah(generatedOrder.totalPaid)}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-stone-500">Status:</span>
                <span className="font-bold text-emerald-700">Lunas & Diteruskan ke Kasir</span>
              </div>
            </div>

            {/* Auto-redirect indicator */}
            <div className="space-y-3 pt-2">
              <p className="text-xs text-stone-400">
                Mengalihkan ke menu Pesanan dalam{' '}
                <strong className="text-stone-700">{redirectCountdown} detik</strong>...
              </p>

              <button
                type="button"
                onClick={() => {
                  if (onGoToPesanan) {
                    onGoToPesanan();
                  } else {
                    onBackToEtalase();
                  }
                }}
                className="w-full h-12 bg-[#1F281A] hover:bg-[#2D3A26] text-white text-xs sm:text-sm font-bold rounded-2xl transition-all cursor-pointer shadow-xs flex items-center justify-center gap-2"
              >
                <span>Lihat Detail di Menu Pesanan Sekarang</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
