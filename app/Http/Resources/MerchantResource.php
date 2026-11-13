<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MerchantResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->code,
            'merchantId' => $this->id,
            'userId' => $this->user_id,
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
            'businessDocumentPath' => $this->business_document_path,
            'nibNumber' => $this->nib_number,
            'ktpMasked' => $this->ktp_masked,
            'halalOrPirtNumber' => $this->halal_or_pirt_number,
            'docType' => $this->doc_type,
            'hygieneCommitmentSigned' => (bool) $this->hygiene_commitment_signed,
            'verificationStatus' => $this->verification_status?->value,
            'verificationNotes' => $this->verification_notes,
            'reviewedAt' => $this->reviewed_at?->toIso8601String(),
            'operatingHours' => $this->operating_hours,
            'pickupWindow' => $this->pickup_window,
            'joinedDate' => $this->created_at?->format('d F Y'),
            'storeBio' => $this->store_bio,
            'isOpenToday' => (bool) $this->is_open_today,
            'rating' => (float) $this->rating,
            'totalRescuedCount' => (int) $this->total_rescued_count,
            'documents' => $this->whenLoaded('documents', fn () => $this->documents->map(fn ($document) => [
                'id' => $document->id,
                'docType' => $document->doc_type,
                'filePath' => $document->file_path,
                'status' => $document->status,
                'reviewNotes' => $document->review_notes,
                'reviewedAt' => $document->reviewed_at?->toIso8601String(),
            ])->values()),
            'productsCount' => $this->whenCounted('products'),
        ];
    }
}
