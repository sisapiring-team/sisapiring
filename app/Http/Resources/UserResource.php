<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'phone' => $this->phone,
            'role' => $this->role?->value,
            'accountStatus' => $this->account_status?->value,
            'avatar' => $this->avatar,
            'district' => $this->district,
            'defaultAddress' => $this->default_address,
            'notificationPreferences' => $this->notification_preferences ?? [],
            'violationCount' => (int) $this->violation_count,
            'createdAt' => $this->created_at?->toIso8601String(),
            'merchant' => $this->whenLoaded('merchant', fn () => new MerchantResource($this->merchant)),
        ];
    }
}
