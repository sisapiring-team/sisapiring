<?php

namespace App\Http\Controllers\Api\Chat;

use App\Http\Controllers\Controller;
use App\Models\AssistantConversation;
use App\Services\GeminiService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AssistantController extends Controller
{
    private const SYSTEM_PROMPT = <<<'PROMPT'
Anda adalah "Sisa", asisten AI untuk SisaPiring, marketplace makanan surplus di Bandung.
Bantu pengguna memahami cara memesan, pembayaran QRIS, pengambilan pesanan, keamanan pangan,
dampak lingkungan (food waste), refund, dan sengketa. Jawab dalam Bahasa Indonesia yang ramah,
ringkas, dan praktis. Jangan mengarang kebijakan yang tidak ada. Jika menyangkut data pesanan
spesifik atau masalah pembayaran, arahkan pengguna ke halaman pesanan atau ajukan sengketa.
PROMPT;

    public function __construct(private readonly GeminiService $gemini)
    {
    }

    public function index(Request $request): JsonResponse
    {
        $conversations = AssistantConversation::query()
            ->where('user_id', $request->user()->id)
            ->with('messages')
            ->latest()
            ->limit(20)
            ->get();

        return response()->json(['data' => $conversations]);
    }

    public function chat(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'message' => ['required', 'string', 'max:2000'],
            'conversation_id' => ['nullable', 'integer', 'exists:assistant_conversations,id'],
        ]);

        $conversation = $validated['conversation_id'] ?? null
            ? AssistantConversation::query()
                ->where('user_id', $request->user()->id)
                ->findOrFail($validated['conversation_id'])
            : AssistantConversation::query()->create([
                'user_id' => $request->user()->id,
                'title' => mb_substr($validated['message'], 0, 60),
            ]);

        $conversation->messages()->create([
            'role' => 'user',
            'content' => $validated['message'],
        ]);

        $history = $conversation->messages()
            ->latest()
            ->limit(20)
            ->get()
            ->reverse()
            ->map(fn ($message) => ['role' => $message->role, 'content' => $message->content])
            ->values()
            ->all();

        $reply = $this->gemini->chat($history, self::SYSTEM_PROMPT);

        $assistantMessage = $conversation->messages()->create([
            'role' => 'assistant',
            'content' => $reply,
            'metadata' => ['model' => config('services.gemini.model'), 'fallback' => ! $this->gemini->available()],
        ]);

        return response()->json([
            'conversationId' => $conversation->id,
            'reply' => $reply,
            'message' => $assistantMessage,
            'usedFallback' => ! $this->gemini->available(),
        ]);
    }

    public function destroy(Request $request, AssistantConversation $conversation): JsonResponse
    {
        abort_unless($conversation->user_id === $request->user()->id, 403);

        $conversation->delete();

        return response()->json(['message' => 'Riwayat percakapan dihapus.']);
    }
}
