<?php

namespace App\Http\Controllers\Api;

use App\Enums\AccountStatus;
use App\Enums\UserRole;
use App\Enums\VerificationStatus;
use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Models\Merchant;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;

class AuthController extends Controller
{
    public function register(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'max:255', 'unique:users,email'],
            'phone' => ['nullable', 'string', 'max:50'],
            'district' => ['nullable', 'string', 'max:255'],
            'default_address' => ['nullable', 'string', 'max:500'],
            'password' => ['required', 'string', 'min:8'],
            'role' => ['nullable', Rule::in([UserRole::Buyer->value, UserRole::Seller->value])],
            'business_name' => ['required_if:role,seller', 'nullable', 'string', 'max:255'],
            'business_category' => ['required_if:role,seller', 'nullable', 'string', 'max:255'],
            'business_address' => ['required_if:role,seller', 'nullable', 'string', 'max:500'],
            'owner_name' => ['nullable', 'string', 'max:255'],
            'owner_phone' => ['nullable', 'string', 'max:50'],
            'owner_email' => ['nullable', 'email', 'max:255'],
            'city' => ['nullable', 'string', 'max:255'],
        ]);

        $role = UserRole::from($validated['role'] ?? UserRole::Buyer->value);

        $user = DB::transaction(function () use ($validated, $role) {
            $user = User::query()->create([
                'name' => $validated['name'],
                'email' => $validated['email'],
                'phone' => $validated['phone'] ?? null,
                'district' => $validated['district'] ?? null,
                'default_address' => $validated['default_address'] ?? null,
                'role' => $role,
                'account_status' => AccountStatus::Active,
                'password' => $validated['password'],
            ]);

            if ($role === UserRole::Seller) {
                Merchant::query()->create([
                    'code' => $this->nextMerchantCode(),
                    'user_id' => $user->id,
                    'business_name' => $validated['business_name'],
                    'business_category' => $validated['business_category'],
                    'owner_name' => $validated['owner_name'] ?? $validated['name'],
                    'owner_phone' => $validated['owner_phone'] ?? $validated['phone'] ?? null,
                    'owner_email' => $validated['owner_email'] ?? $validated['email'],
                    'business_address' => $validated['business_address'],
                    'city' => $validated['city'] ?? 'Bandung',
                    'district' => $validated['district'] ?? null,
                    'verification_status' => VerificationStatus::PendingReview,
                    'is_open_today' => false,
                    'rating' => 0,
                ]);
            }

            return $user;
        });

        if ($request->hasSession()) {
            Auth::guard('web')->login($user);
            $request->session()->regenerate();
        }

        return response()->json([
            'user' => new UserResource($user->load('merchant')),
            'token' => $user->createToken('sisapiring-spa')->plainTextToken,
        ], 201);
    }

    public function login(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        $user = User::query()->where('email', $validated['email'])->first();

        if (! $user || ! Hash::check($validated['password'], $user->password)) {
            throw ValidationException::withMessages([
                'email' => 'Kombinasi email dan kata sandi tidak sesuai.',
            ]);
        }

        if ($user->isSuspended()) {
            throw ValidationException::withMessages([
                'email' => 'Akun Anda sedang dibekukan. Hubungi admin SisaPiring.',
            ]);
        }

        if ($request->hasSession()) {
            Auth::guard('web')->login($user);
            $request->session()->regenerate();
        }

        $user->forceFill(['last_active_at' => now()])->save();

        return response()->json([
            'user' => new UserResource($user->load('merchant')),
            'token' => $user->createToken('sisapiring-spa')->plainTextToken,
        ]);
    }

    public function me(Request $request): JsonResponse
    {
        $user = $request->user()->load('merchant');

        return response()->json([
            'user' => new UserResource($user),
            'unreadNotifications' => $user->unreadNotifications()->count(),
        ]);
    }

    public function updateProfile(Request $request): JsonResponse
    {
        $user = $request->user();

        $validated = $request->validate([
            'name' => ['sometimes', 'string', 'max:255'],
            'phone' => ['sometimes', 'nullable', 'string', 'max:50'],
            'district' => ['sometimes', 'nullable', 'string', 'max:255'],
            'default_address' => ['sometimes', 'nullable', 'string', 'max:500'],
            'avatar' => ['sometimes', 'nullable', 'string', 'max:2048'],
            'notification_preferences' => ['sometimes', 'array'],
        ]);

        $user->update($validated);

        return response()->json(['user' => new UserResource($user->refresh()->load('merchant'))]);
    }

    public function changePassword(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'current_password' => ['required', 'string'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        if (! Hash::check($validated['current_password'], $request->user()->password)) {
            throw ValidationException::withMessages([
                'current_password' => 'Kata sandi saat ini tidak sesuai.',
            ]);
        }

        $request->user()->update(['password' => $validated['password']]);

        return response()->json(['message' => 'Kata sandi berhasil diperbarui.']);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()?->currentAccessToken()?->delete();

        if ($request->hasSession()) {
            Auth::guard('web')->logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();
        }

        return response()->json(['message' => 'Berhasil keluar.']);
    }

    private function nextMerchantCode(): string
    {
        $last = Merchant::query()->orderByDesc('id')->value('code');
        $sequence = $last ? (int) str($last)->afterLast('-')->value() + 1 : 1;

        return 'MER-'.str_pad((string) $sequence, 4, '0', STR_PAD_LEFT);
    }
}
