<?php

namespace App\Services;

use App\Enums\OrderStatus;
use App\Enums\PaymentMethod;
use App\Enums\PaymentStatus;
use App\Models\OrderGroup;
use App\Models\Payment;
use App\Models\Refund;
use App\Models\WebhookEvent;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class PaymentService
{
    public function __construct(
        private readonly XenditService $xendit,
        private readonly OrderService $orders,
    ) {
    }

    public function initiate(OrderGroup $group): Payment
    {
        if ($group->payment_status === PaymentStatus::Paid) {
            throw ValidationException::withMessages(['payment' => 'Pesanan sudah dibayar.']);
        }

        if ($group->status !== OrderStatus::PendingPayment) {
            throw ValidationException::withMessages(['payment' => 'Pesanan tidak menunggu pembayaran.']);
        }

        $payment = $group->payment;

        if (! $payment || $payment->status === PaymentStatus::Expired) {
            $payment = Payment::query()->create([
                'order_group_id' => $group->id,
                'user_id' => $group->user_id,
                'provider' => 'xendit',
                'method' => PaymentMethod::Qris,
                'status' => PaymentStatus::Pending,
                'amount' => (float) $group->grand_total,
                'currency' => 'IDR',
                'external_id' => $this->externalId($group),
                'expires_at' => now()->addMinutes((int) config('impact.payment_expiry_minutes', 30)),
            ]);
        }

        if ($this->xendit->enabled() && ! $payment->xendit_invoice_id) {
            $invoice = $this->xendit->createInvoice($group, $payment);

            $payment->update([
                'xendit_invoice_id' => $invoice['id'] ?? null,
                'payment_url' => $invoice['invoice_url'] ?? null,
                'expires_at' => isset($invoice['expiry_date'])
                    ? now()->parse($invoice['expiry_date'])
                    : $payment->expires_at,
                'raw_payload' => $invoice,
            ]);
        }

        return $payment->refresh();
    }

    public function handleInvoiceCallback(array $payload): WebhookEvent
    {
        $externalId = $payload['external_id'] ?? $payload['id'] ?? null;
        $eventType = $payload['event'] ?? ('invoice.'.strtolower((string) ($payload['status'] ?? 'unknown')));

        $event = WebhookEvent::query()->firstOrCreate(
            ['provider' => 'xendit', 'external_id' => $externalId, 'event_type' => $eventType],
            ['payload' => $payload, 'status' => 'received'],
        );

        if ($event->status === 'processed') {
            return $event;
        }

        $payment = Payment::query()
            ->where('external_id', $externalId)
            ->orWhere('xendit_invoice_id', $payload['id'] ?? null)
            ->first();

        if (! $payment) {
            $event->update(['status' => 'ignored', 'error_message' => 'Payment not found.', 'processed_at' => now()]);

            return $event;
        }

        $event->update(['payment_id' => $payment->id]);

        try {
            DB::transaction(function () use ($payment, $payload, $event) {
                $payment->update([
                    'xendit_payment_id' => $payload['payment_id'] ?? $payment->xendit_payment_id,
                    'raw_payload' => $payload,
                ]);

                match (strtoupper((string) ($payload['status'] ?? ''))) {
                    'PAID', 'SETTLED', 'SUCCEEDED' => $this->markPaid($payment, $payload),
                    'EXPIRED' => $this->markExpired($payment),
                    'FAILED' => $this->markFailed($payment),
                    default => null,
                };

                $event->update(['status' => 'processed', 'processed_at' => now()]);
            });
        } catch (\Throwable $exception) {
            $event->update([
                'status' => 'failed',
                'error_message' => $exception->getMessage(),
                'processed_at' => now(),
            ]);

            throw $exception;
        }

        return $event->refresh();
    }

    public function markPaid(Payment $payment, array $payload = []): void
    {
        if ($payment->status === PaymentStatus::Paid) {
            return;
        }

        $payment->update([
            'status' => PaymentStatus::Paid,
            'paid_at' => now(),
            'xendit_payment_id' => $payload['payment_id'] ?? $payment->xendit_payment_id,
        ]);

        $this->orders->markGroupPaid($payment->orderGroup);
    }

    public function markExpired(Payment $payment): void
    {
        $payment->update(['status' => PaymentStatus::Expired]);

        $group = $payment->orderGroup;
        if ($group && $group->status === OrderStatus::PendingPayment) {
            $this->orders->cancelGroup($group, null, 'Batas waktu pembayaran habis.', true);
        }
    }

    public function markFailed(Payment $payment): void
    {
        $payment->update(['status' => PaymentStatus::Failed]);
    }

    public function mockPay(Payment $payment): Payment
    {
        if (! config('payment.mock_gateway', true)) {
            throw ValidationException::withMessages(['payment' => 'Mock gateway tidak aktif.']);
        }

        $this->markPaid($payment, ['payment_id' => 'mock-'.Str::uuid()]);

        return $payment->refresh();
    }

    public function refund(Payment $payment, float $amount, string $reason): Refund
    {
        $refund = Refund::query()->create([
            'payment_id' => $payment->id,
            'order_id' => $payment->orderGroup?->orders()->value('id'),
            'merchant_id' => $payment->orderGroup?->orders()->value('merchant_id'),
            'user_id' => $payment->user_id,
            'amount' => $amount,
            'status' => PaymentStatus::Pending,
            'reason' => $reason,
        ]);

        if ($this->xendit->enabled()) {
            $response = $this->xendit->createRefund($payment, $amount, $reason);
            $refund->update([
                'xendit_refund_id' => $response['id'] ?? null,
                'status' => PaymentStatus::Paid,
                'processed_at' => now(),
            ]);
        }

        $payment->update([
            'status' => $amount >= (float) $payment->amount
                ? PaymentStatus::Refunded
                : PaymentStatus::PartiallyRefunded,
        ]);

        return $refund->refresh();
    }

    private function externalId(OrderGroup $group): string
    {
        return 'SP-'.$group->group_code.'-'.strtoupper(Str::random(6));
    }
}
