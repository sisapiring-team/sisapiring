<?php

namespace App\Http\Controllers\Api\Buyer;

use App\Http\Controllers\Controller;
use App\Http\Resources\DisputeResource;
use App\Models\Dispute;
use App\Services\DisputeService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class DisputeController extends Controller
{
    public function __construct(private readonly DisputeService $disputes)
    {
    }

    public function index(Request $request): AnonymousResourceCollection
    {
        $disputes = Dispute::query()
            ->where('reporter_user_id', $request->user()->id)
            ->with('order', 'merchant', 'messages.sender')
            ->when($request->filled('status'), fn ($query) => $query->where('status', $request->string('status')))
            ->latest()
            ->paginate((int) $request->integer('per_page', 10));

        return DisputeResource::collection($disputes->withQueryString());
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'order_id' => ['required', 'integer', 'exists:orders,id'],
            'order_item_id' => ['nullable', 'integer', 'exists:order_items,id'],
            'category' => ['required', 'string', 'max:100'],
            'description' => ['required', 'string', 'max:2000'],
            'evidence_path' => ['nullable', 'string', 'max:2048'],
        ]);

        $dispute = $this->disputes->create($request->user(), $validated);

        return response()->json(['data' => new DisputeResource($dispute)], 201);
    }

    public function show(Request $request, Dispute $dispute): DisputeResource
    {
        $this->authorize('view', $dispute);

        return new DisputeResource(
            $dispute->load('order', 'merchant', 'reporter', 'messages.sender')
        );
    }

    public function reply(Request $request, Dispute $dispute): JsonResponse
    {
        $this->authorize('reply', $dispute);

        $validated = $request->validate([
            'body' => ['required', 'string', 'max:2000'],
            'attachment_path' => ['nullable', 'string', 'max:2048'],
        ]);

        $message = $this->disputes->reply(
            $request->user(),
            $dispute,
            $validated['body'],
            $validated['attachment_path'] ?? null,
        );

        return response()->json([
            'data' => new \App\Http\Resources\DisputeMessageResource($message),
        ], 201);
    }
}
