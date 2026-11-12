<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProductResource extends JsonResource
{
    /**
     * Transform the resource into the seller-portal product contract.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->code,
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
            'pickupScheduleStart' => $this->pickup_schedule_start,
            'pickupScheduleEnd' => $this->pickup_schedule_end,
            'storageInstruction' => $this->storage_instruction,
            'isActive' => (bool) $this->is_active,
            'foodSafetyChecklist' => $this->food_safety_checklist ?? [],
            'description' => $this->description,
            'portionsRescuedCount' => (int) $this->portions_rescued_count,
            'createdAt' => $this->created_at?->toIso8601String(),
        ];
    }
}
