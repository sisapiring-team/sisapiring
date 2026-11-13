<?php

namespace App\Services;

use App\Models\OrderGroup;
use App\Models\Payment;
use Illuminate\Http\Client\PendingRequest;
use Illuminate\Support\Facades\Http;
use Illuminate\Validation\ValidationException;

class XenditService
{
    public function enabled(): bool
    {
        return ! config('payment.mock_gateway', true)
            && filled(config('services.xendit.secret_key'));
    }

    /**
     * @return array<string, mixed>
     */
    public function createInvoice(OrderGroup $group, Payment $payment): array
    {
        $group->loadMissing('orders.items');

        $response = $this->client()->post('/v2/invoices', [
            'external_id' => $payment->external_id,
            'amount' => (float) $payment->amount,
            'payer_email' => $group->user?->email ?? 'buyer@sisapiring.id',
            'description' => 'SisaPiring '.$group->group_code,
            'invoice_duration' => (int) config('impact.payment_expiry_minutes', 30) * 60,
            'currency' => 'IDR',
            'should_send_email' => false,
            'payment_methods' => ['QRIS', 'EWALLET', 'BANK_TRANSFER'],
            'success_redirect_url' => config('services.xendit.success_redirect_url'),
            'failure_redirect_url' => config('services.xendit.failure_redirect_url'),
            'items' => $group->orders->flatMap(fn ($order) => $order->items->map(fn ($item) => [
                'name' => $item->product_name,
                'quantity' => $item->quantity,
                'price' => (float) $item->price_per_item,
            ]))->values()->all(),
        ]);

        if ($response->failed()) {
            throw ValidationException::withMessages([
                'payment' => 'Gagal membuat invoice pembayaran: '.$response->json('message', $response->body()),
            ]);
        }

        return $response->json();
    }

    /**
     * @return array<string, mixed>
     */
    public function createRefund(Payment $payment, float $amount, string $reason): array
    {
        $response = $this->client()->post('/refunds', [
            'payment_id' => $payment->xendit_payment_id,
            'invoice_id' => $payment->xendit_invoice_id,
            'amount' => $amount,
            'reason' => $reason,
        ]);

        if ($response->failed()) {
            throw ValidationException::withMessages([
                'refund' => 'Gagal memproses refund: '.$response->json('message', $response->body()),
            ]);
        }

        return $response->json();
    }

    public function verifyCallbackToken(?string $token): bool
    {
        $expected = (string) config('services.xendit.callback_token');

        return $expected !== '' && $token !== null && hash_equals($expected, $token);
    }

    private function client(): PendingRequest
    {
        $secret = (string) config('services.xendit.secret_key');

        return Http::baseUrl((string) config('services.xendit.base_url'))
            ->withBasicAuth($secret, '')
            ->acceptJson()
            ->timeout(30);
    }
}
