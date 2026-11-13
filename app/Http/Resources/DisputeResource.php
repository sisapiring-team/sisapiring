<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DisputeResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'ticketCode' => $this->ticket_code,
            'orderId' => $this->order_id,
            'orderItemId' => $this->order_item_id,
            'category' => $this->category,
            'description' => $this->description,
            'evidencePath' => $this->evidence_path,
            'severity' => $this->severity,
            'status' => $this->status?->value,
            'resolutionType' => $this->resolution_type,
            'resolutionNote' => $this->resolution_note,
            'refundAmount' => (float) $this->refund_amount,
            'resolvedAt' => $this->resolved_at?->toIso8601String(),
            'createdAt' => $this->created_at?->toIso8601String(),
            'reporter' => $this->whenLoaded('reporter', fn () => [
                'id' => $this->reporter->id,
                'name' => $this->reporter->name,
            ]),
            'merchant' => $this->whenLoaded('merchant', fn () => [
                'id' => $this->merchant->code,
                'businessName' => $this->merchant->business_name,
            ]),
            'order' => $this->whenLoaded('order', fn () => [
                'id' => $this->order->order_code,
                'status' => $this->order->status?->value,
                'totalPayment' => (float) $this->order->total_payment,
            ]),
            'messages' => DisputeMessageResource::collection($this->whenLoaded('messages')),
        ];
    }
}
