<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class OrderGroupResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->group_code,
            'groupId' => $this->id,
            'subtotal' => (float) $this->subtotal,
            'platformFee' => (float) $this->platform_fee,
            'discountTotal' => (float) $this->discount_total,
            'grandTotal' => (float) $this->grand_total,
            'status' => $this->status?->value,
            'paymentStatus' => $this->payment_status?->value,
            'expiresAt' => $this->expires_at?->toIso8601String(),
            'paidAt' => $this->paid_at?->toIso8601String(),
            'buyerNote' => $this->buyer_note,
            'createdAt' => $this->created_at?->toIso8601String(),
            'orders' => OrderResource::collection($this->whenLoaded('orders')),
            'payment' => $this->whenLoaded('payment', fn () => new PaymentResource($this->payment)),
            'user' => $this->whenLoaded('user', fn () => new UserResource($this->user)),
        ];
    }
}
