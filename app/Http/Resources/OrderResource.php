<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->order_code,
            'orderId' => $this->id,
            'groupId' => $this->order_group_id,
            'groupCode' => $this->whenLoaded('group', fn () => $this->group?->group_code),
            'pickupCode' => $this->pickup_code,
            'customerName' => $this->customer_name,
            'customerPhone' => $this->customer_phone,
            'items' => $this->whenLoaded('items', fn () => $this->items->map(fn ($item) => [
                'id' => $item->id,
                'productId' => $item->product?->code,
                'productName' => $item->product_name,
                'category' => $item->category,
                'pricePerItem' => (float) $item->price_per_item,
                'originalPrice' => (float) $item->original_price,
                'quantity' => (int) $item->quantity,
                'image' => $item->image,
                'subtotal' => (float) $item->subtotal,
                'reviewed' => $this->whenLoaded('items', fn () => $item->relationLoaded('review') ? (bool) $item->review : null),
            ])->values()),
            'totalOriginalPrice' => (float) $this->total_original_price,
            'totalPayment' => (float) $this->total_payment,
            'totalDiscount' => (float) $this->total_discount,
            'status' => $this->status?->value,
            'statusLabel' => $this->status?->label(),
            'paymentStatus' => $this->payment_status?->value,
            'orderDate' => $this->created_at?->format('d M Y, H:i').' WIB',
            'createdAt' => $this->created_at?->toIso8601String(),
            'pickupDeadline' => $this->pickup_deadline,
            'pickupDeadlineAt' => $this->pickup_deadline_at?->toIso8601String(),
            'paidAt' => $this->paid_at?->toIso8601String(),
            'completedAt' => $this->completed_at?->toIso8601String(),
            'statusHistory' => $this->status_history ?? [],
            'cancellationReason' => $this->cancellation_reason,
            'notes' => $this->notes,
            'isVerifiedByQR' => (bool) $this->is_verified_by_qr,
            'verifiedAt' => $this->verified_at?->toIso8601String(),
            'qrCodeToken' => $this->qr_code_token,
            'merchant' => $this->whenLoaded('merchant', fn () => new MerchantResource($this->merchant)),
        ];
    }
}
