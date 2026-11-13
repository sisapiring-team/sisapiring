<?php

namespace App\Enums;

enum OrderStatus: string
{
    case PendingPayment = 'pending_payment';
    case WaitingConfirmation = 'waiting_confirmation';
    case Confirmed = 'confirmed';
    case ReadyForPickup = 'ready_for_pickup';
    case Completed = 'completed';
    case Cancelled = 'cancelled';
    case Expired = 'expired';

    /**
     * @return array<int, self>
     */
    public function allowedTransitions(): array
    {
        return match ($this) {
            self::PendingPayment => [self::WaitingConfirmation, self::Cancelled, self::Expired],
            self::WaitingConfirmation => [self::Confirmed, self::Cancelled],
            self::Confirmed => [self::ReadyForPickup, self::Cancelled],
            self::ReadyForPickup => [self::Completed, self::Cancelled],
            self::Completed, self::Cancelled, self::Expired => [],
        };
    }

    public function canTransitionTo(self $next): bool
    {
        return in_array($next, $this->allowedTransitions(), true);
    }

    public function isFinal(): bool
    {
        return in_array($this, [self::Completed, self::Cancelled, self::Expired], true);
    }

    public function label(): string
    {
        return match ($this) {
            self::PendingPayment => 'Menunggu Pembayaran',
            self::WaitingConfirmation => 'Menunggu Konfirmasi',
            self::Confirmed => 'Dikonfirmasi',
            self::ReadyForPickup => 'Siap Diambil',
            self::Completed => 'Selesai',
            self::Cancelled => 'Dibatalkan',
            self::Expired => 'Kedaluwarsa',
        };
    }
}
