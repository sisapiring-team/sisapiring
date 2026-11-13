<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductResource extends JsonResource
{
    /**
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->code,
            'productId' => $this->id,
            'merchantId' => $this->merchant_id,
            'name' => $this->name,
            'category' => $this->category,
            'image' => $this->image,
            'originalPrice' => (float) $this->original_price,
            'discountPercentage' => (int) $this->discount_percentage,
            'discountedPrice' => (float) $this->discounted_price,
            'stock' => (int) $this->stock,
            'lockedStock' => (int) $this->locked_stock,
            'availableStock' => $this->available_stock,
            'weightGrams' => (int) $this->weight_grams,
            'productionTime' => $this->production_time,
            'safeConsumptionDeadline' => $this->safe_consumption_deadline,
            'safeDeadlineTimestamp' => $this->safe_deadline_at?->getTimestampMs(),
            'safeDeadlineAt' => $this->safe_deadline_at?->toIso8601String(),
            'pickupScheduleStart' => $this->pickup_schedule_start,
            'pickupScheduleEnd' => $this->pickup_schedule_end,
            'storageInstruction' => $this->storage_instruction,
            'isActive' => (bool) $this->is_active,
            'moderationStatus' => $this->moderation_status?->value,
            'takedownReason' => $this->takedown_reason,
            'foodSafetyChecklist' => $this->food_safety_checklist ?? [],
            'description' => $this->description,
            'portionsRescuedCount' => (int) $this->portions_rescued_count,
            'rating' => $this->whenLoaded('merchant', fn () => (float) $this->merchant?->rating),
            'createdAt' => $this->created_at?->toIso8601String(),
            'merchant' => $this->whenLoaded('merchant', fn () => new MerchantResource($this->merchant)),
        ];
    }
}
