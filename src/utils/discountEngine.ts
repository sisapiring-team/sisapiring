import { DiscountRecommendation } from '../types/seller';

/**
 * SisaPiring Automatic Discount Suggestion Engine
 * Calculates recommended rescue discount (50%, 70%, 90%, or 100% donasi)
 * based on remaining safe consumption hours and available stock volume.
 */
export function calculateRecommendedDiscount(
  hoursRemaining: number,
  stockCount: number,
  category: string
): DiscountRecommendation {
  // If safe deadline has already passed or less than 1.5 hours remaining with remaining stock
  if (hoursRemaining <= 1.5) {
    if (stockCount >= 4) {
      return {
        recommendedDiscount: 100,
        reason: `Tersisa hanya ${hoursRemaining.toFixed(1)} jam sebelum batas aman dan stok masih ${stockCount} porsi. Alihkan ke Donasi 100% Bebas Bayar untuk segera disalurkan.`,
        hoursRemaining,
        urgencyLevel: 'critical',
      };
    }
    return {
      recommendedDiscount: 90,
      reason: `Waktu konsumsi tersisa ${hoursRemaining.toFixed(1)} jam. Rekomendasi diskon kilat 90% OFF agar produk terselamatkan sebelum toko tutup.`,
      hoursRemaining,
      urgencyLevel: 'critical',
    };
  }

  // Between 1.5 and 4 hours remaining
  if (hoursRemaining <= 4) {
    if (stockCount >= 6) {
      return {
        recommendedDiscount: 90,
        reason: `Sisa waktu ${hoursRemaining.toFixed(1)} jam dengan volume stok cukup banyak (${stockCount} porsi). Diskon 90% OFF disarankan untuk memicu pembelian cepat warga sekitar.`,
        hoursRemaining,
        urgencyLevel: 'high',
      };
    }
    return {
      recommendedDiscount: 70,
      reason: `Tersisa ${hoursRemaining.toFixed(1)} jam sebelum batas aman konsumsi. Rekomendasi diskon optimal 70% OFF untuk mempercepat penyelamatan pangan.`,
      hoursRemaining,
      urgencyLevel: 'medium',
    };
  }

  // Between 4 and 8 hours remaining
  if (hoursRemaining <= 8) {
    if (stockCount >= 10) {
      return {
        recommendedDiscount: 70,
        reason: `Stok surplus cukup besar (${stockCount} porsi). Diskon 70% OFF akan menaikkan eksposur produk di etalase pembeli Bandung.`,
        hoursRemaining,
        urgencyLevel: 'medium',
      };
    }
    return {
      recommendedDiscount: 50,
      reason: `Waktu jual masih aman (${hoursRemaining.toFixed(1)} jam). Diskon standar 50% OFF menjaga margin bahan baku sekaligus menarik pembeli food rescue.`,
      hoursRemaining,
      urgencyLevel: 'low',
    };
  }

  // More than 8 hours remaining
  return {
    recommendedDiscount: 50,
    reason: `Waktu penjualan masih leluasa (${hoursRemaining.toFixed(1)} jam). Diskon awal 50% OFF sudah memenuhi standar program SisaPiring.`,
    hoursRemaining,
    urgencyLevel: 'low',
  };
}
