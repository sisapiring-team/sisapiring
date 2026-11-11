/**
 * Indonesian Rupiah and Bandung WIB time formatters
 */

export function formatRupiah(amount: number): string {
  if (amount === 0) return 'Rp 0 (Donasi)';
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatShortRupiah(amount: number): string {
  if (amount === 0) return 'Bebas Bayar';
  if (amount >= 1000000) {
    return `Rp ${(amount / 1000000).toFixed(1)} jt`;
  }
  if (amount >= 1000) {
    return `Rp ${(amount / 1000).toFixed(0)} rb`;
  }
  return `Rp ${amount}`;
}

export function calculateCO2Saved(portionsRescued: number): string {
  // Average food rescue prevents approx 2.5 kg CO2e per kg/portion of food waste diverted from landfill
  const kg = portionsRescued * 1.85;
  return `${kg.toFixed(1)} kg CO₂e`;
}
