<?php

namespace App\Http\Controllers\Api\Chat;

use App\Http\Controllers\Controller;
use App\Http\Resources\ConversationResource;
use App\Http\Resources\MessageResource;
use App\Models\Conversation;
use App\Models\Merchant;
use App\Models\Message;
use App\Models\User;
use App\Notifications\SystemNotification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class ConversationController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $user = $request->user();
        $merchant = $user->merchant;

        $conversations = Conversation::query()
            ->when($user->isBuyer(), fn ($query) => $query->where('buyer_id', $user->id))
            ->when($user->isSeller() && $merchant, fn ($query) => $query->where('merchant_id', $merchant->id))
            ->with(['buyer', 'merchant', 'lastMessage.sender'])
            ->orderByDesc('last_message_at')
            ->paginate((int) $request->integer('per_page', 20));

        return ConversationResource::collection($conversations->withQueryString());
    }

    public function show(Request $request, Conversation $conversation): JsonResponse
    {
        $this->authorize('view', $conversation);

        $messages = $conversation->messages()
            ->with('sender')
            ->latest()
            ->limit(100)
            ->get()
            ->reverse()
            ->values();

        $this->markRead($request->user(), $conversation);

        return response()->json([
            'data' => new ConversationResource(
                $conversation->load('buyer', 'merchant')->setRelation('messages', $messages)
            ),
        ]);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'merchant_code' => ['required', 'string', 'exists:merchants,code'],
            'order_id' => ['nullable', 'integer', 'exists:orders,id'],
            'message' => ['nullable', 'string', 'max:2000'],
        ]);

        $merchant = Merchant::query()->where('code', $validated['merchant_code'])->firstOrFail();

        $conversation = Conversation::query()->firstOrCreate([
            'buyer_id' => $request->user()->id,
            'merchant_id' => $merchant->id,
        ], [
            'order_id' => $validated['order_id'] ?? null,
            'last_message_at' => now(),
        ]);

        if (! empty($validated['message'])) {
            $message = Message::query()->create([
                'conversation_id' => $conversation->id,
                'sender_user_id' => $request->user()->id,
                'type' => 'text',
                'body' => $validated['message'],
            ]);

            $conversation->update(['last_message_at' => now()]);
            $merchant->user?->notify(new SystemNotification('Pesan baru', 'Anda menerima pesan dari pembeli.', [
                'conversation_id' => $conversation->id,
                'message_id' => $message->id,
            ]));
        }

        return response()->json([
            'data' => new ConversationResource($conversation->load('buyer', 'merchant', 'lastMessage.sender')),
        ], 201);
    }

    public function send(Request $request, Conversation $conversation): JsonResponse
    {
        $this->authorize('send', $conversation);

        $validated = $request->validate([
            'body' => ['required_without:attachment_path', 'nullable', 'string', 'max:2000'],
            'type' => ['nullable', 'in:text,image,file,system'],
            'attachment_path' => ['nullable', 'string', 'max:2048'],
        ]);

        $message = Message::query()->create([
            'conversation_id' => $conversation->id,
            'sender_user_id' => $request->user()->id,
            'type' => $validated['type'] ?? ($validated['attachment_path'] ?? null ? 'file' : 'text'),
            'body' => $validated['body'] ?? null,
            'attachment_path' => $validated['attachment_path'] ?? null,
        ]);

        $conversation->update(['last_message_at' => now()]);
        $this->markRead($request->user(), $conversation);

        $recipient = $conversation->buyer_id === $request->user()->id
            ? $conversation->merchant?->user
            : $conversation->buyer;

        $recipient?->notify(new SystemNotification('Pesan baru', 'Anda menerima pesan baru.', [
            'conversation_id' => $conversation->id,
            'message_id' => $message->id,
        ]));

        return response()->json(['data' => new MessageResource($message->load('sender'))], 201);
    }

    public function read(Request $request, Conversation $conversation): JsonResponse
    {
        $this->authorize('view', $conversation);

        $this->markRead($request->user(), $conversation);

        return response()->json(['message' => 'Pesan ditandai sudah dibaca.']);
    }

    private function markRead(User $user, Conversation $conversation): void
    {
        $conversation->participants()->updateOrCreate(
            ['user_id' => $user->id],
            ['last_read_at' => now()],
        );

        $conversation->messages()
            ->whereNull('read_at')
            ->where('sender_user_id', '!=', $user->id)
            ->update(['read_at' => now()]);
    }
}
