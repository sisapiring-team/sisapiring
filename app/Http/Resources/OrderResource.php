<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderResource extends JsonResource
{
    /**
     * Transform the resource into the order contract shared by both portals.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->order_code,
            'pickupCode' => $this->pickup_code,
            'customerName' => $this->customer_name,
            'customerPhone' => $this->customer_phone,
            'items' => $this->whenLoaded('items', fn () => $this->items->map(fn ($item) => [
                'productId' => $item->product?->code,
                'productName' => $item->product_name,
                'category' => $item->category,
                'pricePerItem' => (float) $item->price_per_item,
                'quantity' => (int) $item->quantity,
                'image' => $item->image,
                'subtotal' => (float) $item->subtotal,
            ])->values()),
            'totalOriginalPrice' => (float) $this->total_original_price,
            'totalPayment' => (float) $this->total_payment,
            'totalDiscount' => (float) $this->total_discount,
            'orderDate' => $this->created_at?->format('d M Y, H:i').' WIB',
            'pickupDeadline' => $this->pickup_deadline,
            'pickupDeadlineAt' => $this->pickup_deadline_at?->toIso8601String(),
            'status' => $this->status,
            'statusHistory' => $this->status_history ?? [],
            'cancellationReason' => $this->cancellation_reason,
            'isVerifiedByQR' => (bool) $this->is_verified_by_qr,
            'verifiedAt' => $this->verified_at ? $this->verified_at->format('d M Y, H:i').' WIB' : null,
            'qrCodeToken' => $this->qr_code_token,
            'merchant' => $this->whenLoaded('merchant', fn () => [
                'id' => $this->merchant->code,
                'businessName' => $this->merchant->business_name,
                'district' => $this->merchant->district,
            ]),
        ];
    }
}
