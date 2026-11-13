<?php

namespace App\Http\Controllers\Api\Admin;

use App\Enums\DisputeStatus;
use App\Http\Controllers\Controller;
use App\Http\Resources\DisputeResource;
use App\Models\Dispute;
use App\Services\DisputeService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Validation\Rules\Enum;

class DisputeController extends Controller
{
    public function __construct(private readonly DisputeService $disputes)
    {
    }

    public function index(Request $request): AnonymousResourceCollection
    {
        $disputes = Dispute::query()
            ->with('order', 'merchant', 'reporter', 'messages.sender')
            ->when($request->filled('status'), fn ($query) => $query->where('status', $request->string('status')))
            ->when($request->filled('q'), fn ($query) => $query->where(
                fn ($inner) => $inner->where('ticket_code', 'like', '%'.$request->string('q').'%')
                    ->orWhere('description', 'like', '%'.$request->string('q').'%')
            ))
            ->latest()
            ->paginate((int) $request->integer('per_page', 15));

        return DisputeResource::collection($disputes->withQueryString());
    }

    public function show(Dispute $dispute): DisputeResource
    {
        return new DisputeResource($dispute->load('order.items', 'merchant', 'reporter', 'messages.sender', 'resolver'));
    }

    public function resolve(Request $request, Dispute $dispute): JsonResponse
    {
        $this->authorize('resolve', $dispute);

        $validated = $request->validate([
            'status' => ['required', new Enum(DisputeStatus::class)],
            'resolution_type' => ['nullable', 'string', 'max:100'],
            'resolution_note' => ['nullable', 'string', 'max:2000'],
            'refund_amount' => ['nullable', 'numeric', 'min:0'],
        ]);

        $resolved = $this->disputes->resolve(
            $request->user(),
            $dispute,
            [
                'status' => DisputeStatus::from($validated['status']),
                'resolution_type' => $validated['resolution_type'] ?? null,
                'resolution_note' => $validated['resolution_note'] ?? null,
                'refund_amount' => $validated['refund_amount'] ?? 0,
            ],
        );

        return response()->json(['data' => new DisputeResource($resolved->load('order', 'merchant', 'reporter', 'messages.sender'))]);
    }
}
