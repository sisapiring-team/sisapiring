<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class MessageResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'type' => $this->type,
            'body' => $this->body,
            'attachmentPath' => $this->attachment_path,
            'metadata' => $this->metadata ?? [],
            'readAt' => $this->read_at?->toIso8601String(),
            'sender' => $this->whenLoaded('sender', fn () => [
                'id' => $this->sender?->id,
                'name' => $this->sender?->name,
                'role' => $this->sender?->role?->value,
            ]),
            'createdAt' => $this->created_at?->toIso8601String(),
        ];
    }
}
