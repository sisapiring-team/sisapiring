/**
 * SisaPiring — Types & Data Contracts
 * Exclusively localized for Bandung, Indonesia
 */

export type BandungDistrict =
  | 'Coblong'
  | 'Sukasari'
  | 'Cidadap'
  | 'Bandung Wetan'
  | 'Sumur Bandung'
  | 'Cicendo'
  | 'Andir'
  | 'Astana Anyar'
  | 'Regol'
  | 'Lengkong'
  | 'Batununggal'
  | 'Kiaracondong'
  | 'Cibeunying Kaler'
  | 'Cibeunying Kidul'
  | 'Babakan Ciparay'
  | 'Bojongloa Kaler'
  | 'Bojongloa Kidul'
  | 'Buahbatu'
  | 'Arcamanik'
  | 'Antapani'
  | 'Mandalajati'
  | 'Ujungberung'
  | 'Cibiru'
  | 'Panyileukan'
  | 'Gedebage'
  | 'Rancasari'
  | 'Bandung Kulon'
  | 'Sukajadi'
  | 'Cinambo';

export type ProductCategory =
  | 'Bakery & Roti'
  | 'Katering & Nasi Kotak'
  | 'Cafe & Minuman'
  | 'Kue & Pastry'
  | 'Resto & Makanan Berat'
  | 'Buah & Sayur Segar';

export type VerificationStatus = 'pending_review' | 'verified' | 'rejected';

export type StorageInstruction =
  | 'Suhu Ruang (Kering & Sejuk)'
  | 'Lemari Pendingin (Chiller 2-6°C)'
  | 'Freezer Beku (-18°C)'
  | 'Penghangat Makanan (Food Warmer)';

export interface FoodSafetyChecklist {
  isFitForConsumption: boolean; // Makanan masih layak dan aman dikonsumsi
  isProperlyStored: boolean; // Disimpan dengan higienis dan suhu yang sesuai
  isCleanPackaging: boolean; // Kemasan bersih, tertutup rapat, dan utuh
  isNoAbnormalOdor: boolean; // Tidak ada perubahan warna, rasa, atau bau menyimpang
  isAccurateInformation: boolean; // Informasi bahan baku & alergen jujur dan akurat
}

export interface SisaPiringProduct {
  id: string;
  name: string;
  category: ProductCategory;
  image: string;
  originalPrice: number; // in IDR
  discountPercentage: 50 | 70 | 90 | 100; // 100% = Donasi / Bebas Bayar
  discountedPrice: number; // in IDR
  stock: number;
  productionTime: string; // e.g. "Hari ini, 09:00 WIB"
  safeConsumptionDeadline: string; // e.g. "Hari ini, 22:00 WIB"
  safeDeadlineTimestamp: number; // epoch ms for calculation
  pickupScheduleStart: string; // e.g. "17:00 WIB"
  pickupScheduleEnd: string; // e.g. "21:30 WIB"
  storageInstruction: StorageInstruction;
  isActive: boolean;
  foodSafetyChecklist: FoodSafetyChecklist;
  description: string;
  portionsRescuedCount: number;
  createdAt: string;
}

export type OrderStatus =
  | 'waiting_confirmation' // Menunggu Konfirmasi
  | 'confirmed' // Dikonfirmasi
  | 'ready_for_pickup' // Siap Diambil
  | 'completed' // Selesai
  | 'cancelled'; // Dibatalkan

export interface OrderItem {
  productId: string;
  productName: string;
  category: ProductCategory;
  pricePerItem: number;
  quantity: number;
  image: string;
}

export interface Order {
  id: string; // e.g. "SP-BDG-2026-081"
  pickupCode: string; // e.g. "SP-7842"
  customerName: string;
  customerPhone: string;
  items: OrderItem[];
  totalPayment: number;
  orderDate: string; // e.g. "10 Nov 2026, 16:30 WIB"
  pickupDeadline: string; // e.g. "Hari ini, 21:00 WIB"
  status: OrderStatus;
  statusHistory: {
    status: OrderStatus;
    timestamp: string;
    note?: string;
  }[];
  cancellationReason?: string;
  isVerifiedByQR: boolean;
  verifiedAt?: string;
}

export interface SellerProfile {
  id: string;
  ownerName: string;
  ownerPhone: string;
  ownerEmail: string;
  businessName: string;
  businessCategory: ProductCategory;
  businessAddress: string;
  district: BandungDistrict;
  businessPhoto: string;
  businessDocumentName: string;
  verificationStatus: VerificationStatus;
  verificationNotes?: string;
  operatingHours: string;
  pickupWindow: string;
  joinedDate: string;
  storeBio: string;
  isOpenToday: boolean;
}

export interface DiscountRecommendation {
  recommendedDiscount: 50 | 70 | 90 | 100;
  reason: string;
  hoursRemaining: number;
  urgencyLevel: 'low' | 'medium' | 'high' | 'critical';
}
