<?php

namespace App\Http\Controllers\Api\Seller;

use App\Enums\VerificationStatus;
use App\Http\Controllers\Controller;
use App\Http\Resources\MerchantResource;
use App\Models\Merchant;
use App\Models\MerchantDocument;
use App\Models\MerchantVerificationEvent;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class MerchantController extends Controller
{
    public function current(Request $request): MerchantResource
    {
        $merchant = $request->user()->merchant;

        abort_unless($merchant, 404, 'Profil merchant belum dibuat.');

        return new MerchantResource($merchant->load('documents')->loadCount('products'));
    }

    public function update(Request $request): MerchantResource
    {
        $merchant = $this->merchant($request);

        $validated = $request->validate([
            'business_name' => ['sometimes', 'string', 'max:255'],
            'business_category' => ['sometimes', 'string', 'max:255'],
            'owner_name' => ['sometimes', 'string', 'max:255'],
            'owner_phone' => ['sometimes', 'nullable', 'string', 'max:50'],
            'owner_email' => ['sometimes', 'nullable', 'email', 'max:255'],
            'business_address' => ['sometimes', 'string', 'max:500'],
            'city' => ['sometimes', 'string', 'max:255'],
            'district' => ['sometimes', 'nullable', 'string', 'max:255'],
            'latitude' => ['sometimes', 'nullable', 'numeric', 'between:-90,90'],
            'longitude' => ['sometimes', 'nullable', 'numeric', 'between:-180,180'],
            'business_photo' => ['sometimes', 'nullable', 'string', 'max:2048'],
            'operating_hours' => ['sometimes', 'nullable', 'string', 'max:255'],
            'pickup_window' => ['sometimes', 'nullable', 'string', 'max:255'],
            'store_bio' => ['sometimes', 'nullable', 'string', 'max:2000'],
            'is_open_today' => ['sometimes', 'boolean'],
            'hygiene_commitment_signed' => ['sometimes', 'boolean'],
        ]);

        $merchant->update($validated);

        return new MerchantResource($merchant->refresh()->load('documents'));
    }

    public function uploadDocument(Request $request): JsonResponse
    {
        $merchant = $this->merchant($request);

        $validated = $request->validate([
            'doc_type' => ['required', 'string', 'in:ktp,nib,pirt,halal,business_license,other'],
            'file' => ['required', 'file', 'mimes:jpg,jpeg,png,pdf', 'max:5120'],
        ]);

        $file = $request->file('file');
        $path = $file->store("merchant-documents/{$merchant->id}", 'public');

        $document = MerchantDocument::query()->create([
            'merchant_id' => $merchant->id,
            'doc_type' => $validated['doc_type'],
            'file_path' => $path,
            'mime_type' => $file->getMimeType(),
            'size_bytes' => $file->getSize(),
            'status' => 'pending',
        ]);

        return response()->json([
            'message' => 'Dokumen berhasil diunggah.',
            'data' => [
                'id' => $document->id,
                'docType' => $document->doc_type,
                'filePath' => $document->file_path,
                'url' => Storage::disk('public')->url($document->file_path),
                'status' => $document->status,
            ],
        ], 201);
    }

    public function submitVerification(Request $request): JsonResponse
    {
        $merchant = $this->merchant($request);

        if ($merchant->verification_status === VerificationStatus::Verified) {
            return response()->json(['message' => 'Merchant sudah terverifikasi.']);
        }

        $from = $merchant->verification_status;
        $merchant->update([
            'verification_status' => VerificationStatus::PendingReview,
            'verification_notes' => null,
        ]);

        MerchantVerificationEvent::query()->create([
            'merchant_id' => $merchant->id,
            'actor_user_id' => $request->user()->id,
            'from_status' => $from,
            'to_status' => VerificationStatus::PendingReview,
            'note' => 'Pengajuan verifikasi dikirim oleh merchant.',
        ]);

        return response()->json([
            'message' => 'Pengajuan verifikasi berhasil dikirim.',
            'data' => new MerchantResource($merchant->refresh()->load('documents')),
        ]);
    }

    private function merchant(Request $request): Merchant
    {
        $merchant = $request->user()->merchant;

        abort_unless($merchant, 404, 'Profil merchant belum dibuat.');

        return $merchant;
    }
}
