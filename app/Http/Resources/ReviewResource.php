<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ReviewResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'orderId' => $this->order_id,
            'orderItemId' => $this->order_item_id,
            'rating' => (int) $this->rating,
            'comment' => $this->comment,
            'tags' => $this->tags ?? [],
            'moderationStatus' => $this->moderation_status?->value,
            'flagReason' => $this->flag_reason,
            'adminReply' => $this->admin_reply,
            'merchantReply' => $this->merchant_reply,
            'merchantRepliedAt' => $this->merchant_replied_at?->toIso8601String(),
            'createdAt' => $this->created_at?->toIso8601String(),
            'reviewer' => $this->whenLoaded('reviewer', fn () => [
                'id' => $this->reviewer->id,
                'name' => $this->reviewer->name,
            ]),
            'merchant' => $this->whenLoaded('merchant', fn () => [
                'id' => $this->merchant->code,
                'businessName' => $this->merchant->business_name,
            ]),
            'product' => $this->whenLoaded('product', fn () => [
                'id' => $this->product->code,
                'name' => $this->product->name,
            ]),
        ];
    }
}
