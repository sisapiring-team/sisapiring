<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DisputeMessageResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'body' => $this->body,
            'attachmentPath' => $this->attachment_path,
            'isInternal' => (bool) $this->is_internal,
            'sender' => $this->whenLoaded('sender', fn () => [
                'id' => $this->sender?->id,
                'name' => $this->sender?->name,
                'role' => $this->sender?->role?->value,
            ]),
            'createdAt' => $this->created_at?->toIso8601String(),
        ];
    }
}
