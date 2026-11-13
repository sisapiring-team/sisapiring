<?php

namespace App\Services;

use App\Enums\EscrowStatus;
use App\Enums\EscrowType;
use App\Models\EscrowLedger;
use App\Models\Order;

class EscrowService
{
    public function holdForOrder(Order $order): EscrowLedger
    {
        return EscrowLedger::query()->create([
            'order_id' => $order->id,
            'merchant_id' => $order->merchant_id,
            'entry_type' => EscrowType::Hold,
            'status' => EscrowStatus::Held,
            'amount' => (float) $order->total_payment - (float) $order->platform_fee,
            'currency' => 'IDR',
            'available_at' => now()->addHours((int) config('payment.escrow_hold_hours', 24)),
        ]);
    }

    public function releaseForOrder(Order $order, ?string $note = null): void
    {
        EscrowLedger::query()
            ->where('order_id', $order->id)
            ->where('entry_type', EscrowType::Hold)
            ->where('status', EscrowStatus::Held)
            ->update([
                'status' => EscrowStatus::Released,
                'released_at' => now(),
                'note' => $note,
            ]);
    }

    public function refundForOrder(Order $order, ?string $note = null): void
    {
        EscrowLedger::query()
            ->where('order_id', $order->id)
            ->where('entry_type', EscrowType::Hold)
            ->where('status', EscrowStatus::Held)
            ->update([
                'status' => EscrowStatus::Refunded,
                'released_at' => now(),
                'note' => $note,
            ]);
    }
}
