<?php

namespace App\Http\Controllers\Api\Admin;

use App\Enums\VerificationStatus;
use App\Http\Controllers\Controller;
use App\Http\Resources\MerchantResource;
use App\Models\Merchant;
use App\Models\MerchantVerificationEvent;
use App\Notifications\SystemNotification;
use App\Services\AuditService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Validation\Rules\Enum;

class MerchantController extends Controller
{
    public function __construct(private readonly AuditService $audit)
    {
    }

    public function index(Request $request): AnonymousResourceCollection
    {
        $merchants = Merchant::query()
            ->withCount('products')
            ->when($request->filled('status'), fn ($query) => $query->where('verification_status', $request->string('status')))
            ->when($request->filled('q'), fn ($query) => $query->where(
                fn ($inner) => $inner->where('business_name', 'like', '%'.$request->string('q').'%')
                    ->orWhere('code', 'like', '%'.$request->string('q').'%')
                    ->orWhere('owner_name', 'like', '%'.$request->string('q').'%')
            ))
            ->latest()
            ->paginate((int) $request->integer('per_page', 15));

        return MerchantResource::collection($merchants->withQueryString());
    }

    public function show(Merchant $merchant): MerchantResource
    {
        return new MerchantResource(
            $merchant->load('documents', 'user')->loadCount('products')
        );
    }

    public function verify(Request $request, Merchant $merchant): JsonResponse
    {
        $validated = $request->validate([
            'status' => ['required', new Enum(VerificationStatus::class)],
            'note' => ['nullable', 'string', 'max:1000'],
        ]);

        $status = VerificationStatus::from($validated['status']);
        $from = $merchant->verification_status;

        $merchant->update([
            'verification_status' => $status,
            'verification_notes' => $validated['note'] ?? null,
            'reviewed_by' => $request->user()->id,
            'reviewed_at' => now(),
        ]);

        if ($status === VerificationStatus::Verified) {
            $merchant->products()->update(['moderation_status' => \App\Enums\ModerationStatus::Active]);
        }

        MerchantVerificationEvent::query()->create([
            'merchant_id' => $merchant->id,
            'actor_user_id' => $request->user()->id,
            'from_status' => $from,
            'to_status' => $status,
            'note' => $validated['note'] ?? null,
        ]);

        $merchant->user?->notify(new SystemNotification(
            'Status verifikasi merchant',
            "Verifikasi merchant Anda sekarang: {$status->value}.",
            ['merchant_id' => $merchant->id],
        ));

        $this->audit->log($request->user(), 'merchant.verification.updated', $merchant, ['status' => $from?->value], ['status' => $status->value], $request);

        return response()->json(['data' => new MerchantResource($merchant->refresh()->load('documents'))]);
    }

    public function suspend(Request $request, Merchant $merchant): JsonResponse
    {
        $validated = $request->validate([
            'reason' => ['required', 'string', 'max:1000'],
        ]);

        $merchant->update([
            'suspended_reason' => $validated['reason'],
            'is_open_today' => false,
        ]);
        $merchant->products()->update(['is_active' => false]);

        $merchant->user?->notify(new SystemNotification(
            'Merchant dibekukan',
            'Toko Anda dibekukan: '.$validated['reason'],
            ['merchant_id' => $merchant->id],
        ));

        $this->audit->log($request->user(), 'merchant.suspended', $merchant, null, ['reason' => $validated['reason']], $request);

        return response()->json(['message' => 'Merchant dibekukan.', 'data' => new MerchantResource($merchant->refresh())]);
    }

    public function reinstate(Request $request, Merchant $merchant): JsonResponse
    {
        $merchant->update([
            'suspended_reason' => null,
            'is_open_today' => true,
        ]);

        $merchant->user?->notify(new SystemNotification('Merchant aktif kembali', 'Toko Anda sudah dapat beroperasi kembali.'));

        $this->audit->log($request->user(), 'merchant.reinstated', $merchant, null, null, $request);

        return response()->json(['message' => 'Merchant diaktifkan kembali.', 'data' => new MerchantResource($merchant->refresh())]);
    }
}
