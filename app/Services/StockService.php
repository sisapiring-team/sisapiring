<?php

namespace App\Services;

use App\Models\Order;
use App\Models\OrderGroup;
use App\Models\Product;
use App\Models\StockLock;
use App\Models\User;
use Illuminate\Validation\ValidationException;

class StockService
{
    /**
     * Reserve stock for a checkout group. Assumes products are already locked for update.
     *
     * @param  array<int, array{product: Product, quantity: int}>  $lines
     */
    public function reserve(User $user, OrderGroup $group, array $lines): void
    {
        $expiresAt = now()->addMinutes((int) config('payment.checkout_ttl_minutes', 10));

        foreach ($lines as $line) {
            /** @var Product $product */
            $product = $line['product'];
            $quantity = (int) $line['quantity'];

            $product->increment('locked_stock', $quantity);

            StockLock::query()->create([
                'product_id' => $product->id,
                'order_group_id' => $group->id,
                'user_id' => $user->id,
                'quantity' => $quantity,
                'status' => 'active',
                'expires_at' => $expiresAt,
            ]);
        }
    }

    public function convertForGroup(OrderGroup $group): void
    {
        $locks = StockLock::query()
            ->where('order_group_id', $group->id)
            ->where('status', 'active')
            ->get();

        foreach ($locks as $lock) {
            $product = Product::query()->lockForUpdate()->find($lock->product_id);
            if (! $product) {
                continue;
            }

            $product->decrement('locked_stock', $lock->quantity);
            $product->decrement('stock', $lock->quantity);

            $lock->update([
                'status' => 'converted',
                'converted_at' => now(),
            ]);
        }
    }

    public function releaseForGroup(OrderGroup $group): void
    {
        $locks = StockLock::query()
            ->where('order_group_id', $group->id)
            ->where('status', 'active')
            ->get();

        foreach ($locks as $lock) {
            Product::query()->whereKey($lock->product_id)->decrement('locked_stock', $lock->quantity);

            $lock->update([
                'status' => 'released',
                'released_at' => now(),
            ]);
        }
    }

    public function releaseExpired(): int
    {
        $locks = StockLock::query()
            ->where('status', 'active')
            ->where('expires_at', '<=', now())
            ->get();

        foreach ($locks as $lock) {
            Product::query()->whereKey($lock->product_id)->decrement('locked_stock', $lock->quantity);

            $lock->update([
                'status' => 'expired',
                'released_at' => now(),
            ]);
        }

        return $locks->count();
    }

    public function assertAvailable(Product $product, int $quantity): void
    {
        if (! $product->is_active || $product->moderation_status?->value !== 'active') {
            throw ValidationException::withMessages([
                'items' => "Produk {$product->name} sedang tidak tersedia.",
            ]);
        }

        if ($product->safe_deadline_at && $product->safe_deadline_at->isPast()) {
            throw ValidationException::withMessages([
                'items' => "Produk {$product->name} sudah melewati batas aman konsumsi.",
            ]);
        }

        if ($product->available_stock < $quantity) {
            throw ValidationException::withMessages([
                'items' => "Stok {$product->name} tidak mencukupi.",
            ]);
        }
    }
}
