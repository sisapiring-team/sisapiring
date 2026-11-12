<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CatalogItemResource extends JsonResource
{
    /**
     * Transform the resource into the customer marketplace catalog contract.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        $merchant = $this->merchant;

        $category = match ($this->category) {
            'Bakery & Roti' => 'Roti',
            'Katering & Nasi Kotak', 'Resto & Makanan Berat' => 'Nasi & Lauk',
            'Cafe & Minuman' => 'Minuman',
            'Buah & Sayur Segar' => 'Sehat & Segar',
            'Kue & Pastry' => 'Jajanan',
            default => 'Jajanan',
        };

        $pickupStart = trim(str($this->pickup_schedule_start ?? '17:00 WIB')->replaceEnd('WIB', '')->value());
        $pickupEnd = trim(str($this->pickup_schedule_end ?? '21:00 WIB')->replaceEnd('WIB', '')->value());
        $pickupStartHour = (int) str($pickupStart)->before(':')->value();

        return [
            'id' => $this->code,
            'title' => $this->name,
            'merchantName' => $merchant?->business_name ?? 'Mitra SisaPiring',
            'merchantOwner' => $merchant?->owner_name ?? 'Mitra UMKM',
            'merchantRole' => $merchant?->business_category ?? 'Mitra Kuliner Bandung',
            'category' => $category,
            'city' => $merchant?->city ?? 'Bandung',
            'district' => $merchant?->district ?? 'Bandung Wetan',
            'address' => $merchant?->business_address ?? 'Bandung',
            'distanceKm' => round(0.4 + ($this->id % 25) / 10, 1),
            'originalPrice' => (float) $this->original_price,
            'rescuePrice' => (float) $this->discounted_price,
            'discountPercent' => (int) $this->discount_percentage,
            'pickupWindow' => $pickupStart.' – '.$pickupEnd.' WIB',
            'pickupStartHour' => $pickupStartHour,
            'remainingStock' => $this->available_stock,
            'initialQuota' => (int) $this->stock + (int) $this->portions_rescued_count,
            'freshBakedTime' => $this->production_time ?? 'Hari ini',
            'rating' => (float) ($merchant?->rating ?? 4.8),
            'rescuedTotalCount' => (int) $this->portions_rescued_count,
            'imageUrl' => $this->image,
            'shortDescription' => $this->description ?? '',
            'contentsList' => array_values(array_filter([
                $this->name,
                'Kemasan higienis siap ambil',
                'Dijamin masih layak konsumsi',
            ])),
            'sisaPiringReason' => 'Batch berlebih dari produksi '.($this->production_time ?? 'hari ini'),
            'dietaryNotes' => '100% Halal · Informasi alergen tersedia di gerai',
            'storageTip' => $this->storage_instruction ?? 'Suhu Ruang (Kering & Sejuk)',
            'tags' => array_values(array_filter([
                $this->discount_percentage >= 60 ? 'Diskon ≥ 60%' : null,
                $this->discounted_price < 30000 ? 'Di Bawah Rp 30rb' : null,
                $this->available_stock <= 3 ? 'Stok Terakhir' : null,
            ])),
        ];
    }
}
