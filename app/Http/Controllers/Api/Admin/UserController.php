<?php

namespace App\Http\Controllers\Api\Admin;

use App\Enums\AccountStatus;
use App\Http\Controllers\Controller;
use App\Http\Resources\UserResource;
use App\Models\User;
use App\Services\AuditService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
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
