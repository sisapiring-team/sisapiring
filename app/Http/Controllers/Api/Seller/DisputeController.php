<?php

namespace App\Http\Controllers\Api\Seller;

use App\Http\Controllers\Controller;
use App\Http\Resources\DisputeMessageResource;
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
        $merchant = $request->user()->merchant;
        abort_unless($merchant, 404);

        $disputes = Dispute::query()
            ->where('merchant_id', $merchant->id)
            ->with('order', 'reporter', 'messages.sender')
            ->when($request->filled('status'), fn ($query) => $query->where('status', $request->string('status')))
            ->latest()
            ->paginate((int) $request->integer('per_page', 10));

        return DisputeResource::collection($disputes->withQueryString());
    }

    public function show(Request $request, Dispute $dispute): DisputeResource
    {
        $this->authorize('view', $dispute);

        return new DisputeResource($dispute->load('order', 'reporter', 'merchant', 'messages.sender'));
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

        return response()->json(['data' => new DisputeMessageResource($message)], 201);
    }
}
