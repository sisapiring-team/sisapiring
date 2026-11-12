<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MerchantResource extends JsonResource
{
    /**
     * Transform the resource into the seller-portal profile contract.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->code,
            'ownerName' => $this->owner_name,
            'ownerPhone' => $this->owner_phone,
            'ownerEmail' => $this->owner_email,
            'businessName' => $this->business_name,
            'businessCategory' => $this->business_category,
            'businessAddress' => $this->business_address,
            'city' => $this->city,
            'district' => $this->district,
            'latitude' => $this->latitude !== null ? (float) $this->latitude : null,
            'longitude' => $this->longitude !== null ? (float) $this->longitude : null,
            'businessPhoto' => $this->business_photo,
            'businessDocumentName' => $this->business_document_name,
            'verificationStatus' => $this->verification_status,
            'verificationNotes' => $this->verification_notes,
            'operatingHours' => $this->operating_hours,
            'pickupWindow' => $this->pickup_window,
            'joinedDate' => $this->created_at?->format('d F Y'),
            'storeBio' => $this->store_bio,
            'isOpenToday' => (bool) $this->is_open_today,
            'rating' => (float) $this->rating,
            'totalRescuedCount' => (int) $this->total_rescued_count,
        ];
    }
}
