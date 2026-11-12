<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\MerchantResource;
use App\Models\Merchant;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class MerchantController extends Controller
{
    public function index(): AnonymousResourceCollection
    {
        return MerchantResource::collection(Merchant::query()->latest()->get());
    }

    public function show(Merchant $merchant): MerchantResource
    {
        return new MerchantResource($merchant);
    }

    public function current(Request $request): MerchantResource
    {
        $merchant = $request->user()?->merchant
            ?? Merchant::query()->orderBy('id')->firstOrFail();

        return new MerchantResource($merchant);
    }

    public function update(Request $request, Merchant $merchant): MerchantResource
    {
        $validated = $request->validate([
            'businessName' => ['sometimes', 'string', 'max:255'],
            'businessAddress' => ['sometimes', 'string'],
            'ownerName' => ['sometimes', 'string', 'max:255'],
            'ownerPhone' => ['sometimes', 'string', 'max:50'],
            'ownerEmail' => ['sometimes', 'email', 'max:255'],
            'district' => ['sometimes', 'string', 'max:255'],
            'operatingHours' => ['sometimes', 'string', 'max:255'],
            'pickupWindow' => ['sometimes', 'string', 'max:255'],
            'storeBio' => ['sometimes', 'nullable', 'string'],
            'isOpenToday' => ['sometimes', 'boolean'],
            'verificationStatus' => ['sometimes', 'in:pending_review,verified,rejected'],
            'verificationNotes' => ['sometimes', 'nullable', 'string'],
        ]);

        $merchant->update([
            'business_name' => $validated['businessName'] ?? $merchant->business_name,
            'business_address' => $validated['businessAddress'] ?? $merchant->business_address,
            'owner_name' => $validated['ownerName'] ?? $merchant->owner_name,
            'owner_phone' => $validated['ownerPhone'] ?? $merchant->owner_phone,
            'owner_email' => $validated['ownerEmail'] ?? $merchant->owner_email,
            'district' => $validated['district'] ?? $merchant->district,
            'operating_hours' => $validated['operatingHours'] ?? $merchant->operating_hours,
            'pickup_window' => $validated['pickupWindow'] ?? $merchant->pickup_window,
            'store_bio' => $validated['storeBio'] ?? $merchant->store_bio,
            'is_open_today' => $validated['isOpenToday'] ?? $merchant->is_open_today,
            'verification_status' => $validated['verificationStatus'] ?? $merchant->verification_status,
            'verification_notes' => $validated['verificationNotes'] ?? $merchant->verification_notes,
        ]);

        return new MerchantResource($merchant->refresh());
    }
}
