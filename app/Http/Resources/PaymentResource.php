<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PaymentResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'provider' => $this->provider,
            'method' => $this->method?->value,
            'status' => $this->status?->value,
            'amount' => (float) $this->amount,
            'currency' => $this->currency,
            'externalId' => $this->external_id,
            'paymentUrl' => $this->payment_url,
            'expiresAt' => $this->expires_at?->toIso8601String(),
            'paidAt' => $this->paid_at?->toIso8601String(),
            'isMock' => (bool) config('payment.mock_gateway', true),
        ];
    }
}
