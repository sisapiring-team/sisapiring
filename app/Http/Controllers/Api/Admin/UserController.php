<?php

namespace App\Http\Controllers\Api\Admin;

use App\Enums\AccountStatus;
use App\Enums\UserRole;
use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Models\User;
use App\Services\AuditService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules\Enum;

class UserController extends Controller
{
    public function __construct(private readonly AuditService $audit)
    {
    }

    public function index(Request $request): AnonymousResourceCollection
    {
        $users = User::query()
            ->with('merchant')
            ->when($request->filled('role'), fn ($query) => $query->where('role', $request->string('role')))
            ->when($request->filled('status'), fn ($query) => $query->where('account_status', $request->string('status')))
            ->when($request->filled('q'), fn ($query) => $query->where(
                fn ($inner) => $inner->where('name', 'like', '%'.$request->string('q').'%')
                    ->orWhere('email', 'like', '%'.$request->string('q').'%')
            ))
            ->latest()
            ->paginate((int) $request->integer('per_page', 20));

        return UserResource::collection($users->withQueryString());
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'string', 'email', 'max:255', 'unique:users,email'],
            'password' => ['nullable', 'string', 'min:6'],
            'phone' => ['nullable', 'string', 'max:50'],
            'district' => ['nullable', 'string', 'max:255'],
            'default_address' => ['nullable', 'string', 'max:500'],
            'role' => ['required', 'string', Rule::in(['buyer', 'seller', 'admin'])],
            'status' => ['nullable', 'string', Rule::in(['active', 'suspended'])],
        ]);

        $role = UserRole::from($validated['role']);
        $status = isset($validated['status'])
            ? AccountStatus::from($validated['status'])
            : AccountStatus::Active;

        $user = User::query()->create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => $validated['password'] ?? 'SisaPiring123',
            'phone' => $validated['phone'] ?? null,
            'district' => $validated['district'] ?? null,
            'default_address' => $validated['default_address'] ?? null,
            'role' => $role,
            'account_status' => $status,
            'suspended_at' => $status === AccountStatus::Suspended ? now() : null,
            'suspended_by' => $status === AccountStatus::Suspended ? $request->user()->id : null,
        ]);

        $this->audit->log($request->user(), 'user.created', $user, null, [
            'name' => $user->name,
            'email' => $user->email,
            'role' => $user->role->value,
            'account_status' => $user->account_status->value,
        ], $request);

        return response()->json([
            'message' => 'Pengguna berhasil dibuat.',
            'data' => new UserResource($user),
        ], 201);
    }

    public function updateStatus(Request $request, User $user): JsonResponse
    {
        $validated = $request->validate([
            'status' => ['required', new Enum(AccountStatus::class)],
            'note' => ['nullable', 'string', 'max:500'],
        ]);

        if ($user->id === $request->user()->id) {
            return response()->json(['message' => 'Anda tidak dapat mengubah status akun sendiri.'], 422);
        }

        $status = AccountStatus::from($validated['status']);
        $from = $user->account_status;

        $user->update([
            'account_status' => $status,
            'sanction_note' => $validated['note'] ?? null,
            'suspended_at' => $status === AccountStatus::Suspended ? now() : null,
            'suspended_by' => $status === AccountStatus::Suspended ? $request->user()->id : null,
        ]);

        $this->audit->log($request->user(), 'user.status.updated', $user, ['status' => $from?->value], ['status' => $status->value], $request);

        return response()->json(['data' => new UserResource($user->refresh()->load('merchant'))]);
    }
}
