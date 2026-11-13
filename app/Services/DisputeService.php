<?php

namespace App\Services;

use App\Enums\DisputeStatus;
use App\Enums\PaymentStatus;
use App\Models\Dispute;
use App\Models\DisputeMessage;
use App\Models\Order;
use App\Models\User;
use App\Notifications\SystemNotification;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;

class DisputeService
{
    public function __construct(
        private readonly PaymentService $payments,
        private readonly EscrowService $escrow,
    ) {
    }

    /**
     * @param  array{order_id: int, order_item_id?: int|null, category: string, description: string, evidence_path?: string|null}  $data
     */
    public function create(User $user, array $data): Dispute
    {
        $order = Order::query()
            ->whereKey($data['order_id'])
            ->where('user_id', $user->id)
            ->with('merchant', 'items')
            ->first();

        if (! $order) {
            throw ValidationException::withMessages(['order_id' => 'Pesanan tidak ditemukan.']);
        }

        $dispute = DB::transaction(function () use ($user, $order, $data) {
            $dispute = Dispute::query()->create([
                'ticket_code' => $this->nextTicketCode(),
                'order_id' => $order->id,
                'order_item_id' => $data['order_item_id'] ?? null,
                'reporter_user_id' => $user->id,
                'merchant_id' => $order->merchant_id,
                'product_id' => $data['order_item_id']
                    ? $order->items->firstWhere('id', $data['order_item_id'])?->product_id
                    : null,
                'category' => $data['category'],
                'description' => $data['description'],
                'evidence_path' => $data['evidence_path'] ?? null,
                'status' => DisputeStatus::Open,
            ]);

            DisputeMessage::query()->create([
                'dispute_id' => $dispute->id,
                'sender_user_id' => $user->id,
                'body' => $data['description'],
                'attachment_path' => $data['evidence_path'] ?? null,
            ]);

            return $dispute;
        });

        $order->merchant?->user?->notify(new SystemNotification(
            'Sengketa baru',
            "Pesanan {$order->order_code} memiliki sengketa {$dispute->ticket_code}.",
            ['dispute_id' => $dispute->id],
        ));

        return $dispute->load('order', 'merchant', 'reporter', 'messages.sender');
    }

    public function reply(User $user, Dispute $dispute, string $body, ?string $attachmentPath = null, bool $internal = false): DisputeMessage
    {
        $message = DisputeMessage::query()->create([
            'dispute_id' => $dispute->id,
            'sender_user_id' => $user->id,
            'body' => $body,
            'attachment_path' => $attachmentPath,
            'is_internal' => $internal && $user->isAdmin(),
        ]);

        $dispute->loadMissing('order', 'merchant', 'reporter');

        $recipients = collect([
            $dispute->reporter,
            $dispute->merchant?->user,
        ])->filter(fn ($recipient) => $recipient && $recipient->id !== $user->id);

        foreach ($recipients as $recipient) {
            $recipient->notify(new SystemNotification(
                'Balasan sengketa',
                "Sengketa {$dispute->ticket_code} mendapat balasan baru.",
                ['dispute_id' => $dispute->id],
            ));
        }

        return $message->load('sender');
    }

    /**
     * @param  array{status: DisputeStatus, resolution_type?: string|null, resolution_note?: string|null, refund_amount?: float|int}  $data
     */
    public function resolve(User $admin, Dispute $dispute, array $data): Dispute
    {
        if (in_array($dispute->status, [DisputeStatus::ResolvedRefund, DisputeStatus::ResolvedSanction, DisputeStatus::Rejected], true)) {
            throw ValidationException::withMessages(['status' => 'Sengketa ini sudah diselesaikan.']);
        }

        DB::transaction(function () use ($admin, $dispute, $data) {
            $refundAmount = (float) ($data['refund_amount'] ?? 0);

            $dispute->update([
                'status' => $data['status'],
                'resolution_type' => $data['resolution_type'] ?? null,
                'resolution_note' => $data['resolution_note'] ?? null,
                'refund_amount' => $refundAmount,
                'resolved_by' => $admin->id,
                'resolved_at' => now(),
            ]);

            if ($refundAmount > 0 && $dispute->order) {
                $payment = $dispute->order->group?->payment;
                if ($payment && $payment->status === PaymentStatus::Paid) {
                    $this->payments->refund($payment, $refundAmount, 'Refund sengketa '.$dispute->ticket_code);
                }
                $this->escrow->refundForOrder($dispute->order, $dispute->ticket_code);
            }
        });

        $dispute->loadMissing('order', 'merchant', 'reporter');

        $dispute->reporter->notify(new SystemNotification(
            'Sengketa diselesaikan',
            "Sengketa {$dispute->ticket_code}: {$dispute->status->value}.",
            ['dispute_id' => $dispute->id],
        ));

        return $dispute->refresh();
    }

    private function nextTicketCode(): string
    {
        do {
            $code = 'TKT-'.now()->format('ymd').'-'.strtoupper(Str::random(5));
        } while (Dispute::query()->where('ticket_code', $code)->exists());

        return $code;
    }
}
