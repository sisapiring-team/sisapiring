<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Refund;
use App\Services\PaymentService;
use App\Services\XenditService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;

class WebhookController extends Controller
{
    public function __construct(
        private readonly PaymentService $payments,
        private readonly XenditService $xendit,
    ) {
    }

    public function xendit(Request $request): JsonResponse
    {
        $token = $request->header('x-callback-token');
        $configured = filled(config('services.xendit.callback_token'));

        if ($configured && ! $this->xendit->verifyCallbackToken($token)) {
            return response()->json(['message' => 'Invalid callback token.'], 401);
        }

        if (! $configured && app()->isProduction()) {
            Log::error('Xendit webhook received without callback token configured.');

            return response()->json(['message' => 'Webhook not configured.'], 503);
        }

        $payload = $request->all();
        $event = strtolower((string) ($payload['event'] ?? $payload['status'] ?? ''));

        if (str_starts_with($event, 'refund') || isset($payload['refund_id'])) {
            $this->handleRefund($payload);

            return response()->json(['status' => 'ok']);
        }

        $this->payments->handleInvoiceCallback($payload);

        return response()->json(['status' => 'ok']);
    }

    /**
     * @param  array<string, mixed>  $payload
     */
    private function handleRefund(array $payload): void
    {
        $refund = Refund::query()
            ->where('xendit_refund_id', $payload['id'] ?? $payload['refund_id'] ?? null)
            ->first();

        if (! $refund) {
            return;
        }

        $status = strtoupper((string) ($payload['status'] ?? ''));

        $refund->update([
            'status' => in_array($status, ['SUCCEEDED', 'PAID'], true)
                ? \App\Enums\PaymentStatus::Paid
                : \App\Enums\PaymentStatus::Failed,
            'processed_at' => now(),
            'failure_reason' => in_array($status, ['FAILED', 'CANCELLED'], true) ? ($payload['failure_reason'] ?? $status) : null,
        ]);
    }
}
