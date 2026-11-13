<?php

namespace App\Services;

use Illuminate\Support\Facades\Http;
use Illuminate\Support\Str;

class GeminiService
{
    public function available(): bool
    {
        return filled(config('services.gemini.api_key'));
    }

    /**
     * @param  array<int, array{role: string, content: string}>  $messages
     */
    public function chat(array $messages, ?string $systemInstruction = null): string
    {
        if (! $this->available()) {
            return $this->fallbackReply($messages);
        }

        $contents = collect($messages)->map(fn ($message) => [
            'role' => $message['role'] === 'assistant' ? 'model' : 'user',
            'parts' => [['text' => $message['content']]],
        ])->values()->all();

        $payload = [
            'contents' => $contents,
            'generationConfig' => [
                'temperature' => 0.4,
                'maxOutputTokens' => 1024,
            ],
        ];

        if ($systemInstruction) {
            $payload['systemInstruction'] = [
                'parts' => [['text' => $systemInstruction]],
            ];
        }

        $response = Http::baseUrl((string) config('services.gemini.base_url'))
            ->timeout((int) config('services.gemini.timeout', 30))
            ->acceptJson()
            ->post('/models/'.config('services.gemini.model').':generateContent?key='.config('services.gemini.api_key'), $payload);

        if ($response->failed()) {
            return $this->fallbackReply($messages);
        }

        return (string) ($response->json('candidates.0.content.parts.0.text') ?? $this->fallbackReply($messages));
    }

    /**
     * @param  array<int, array{role: string, content: string}>  $messages
     */
    private function fallbackReply(array $messages): string
    {
        $last = Str::lower((string) collect($messages)->last()['content'] ?? '');

        return match (true) {
            str_contains($last, 'cara') || str_contains($last, 'pesan') => 'Untuk memesan: pilih produk di marketplace, checkout, lalu bayar melalui QRIS. Kode pengambilan akan muncul setelah pembayaran berhasil.',
            str_contains($last, 'refund') || str_contains($last, 'batal') => 'Pembatalan dapat dilakukan sebelum pesanan dikonfirmasi mitra. Jika pesanan sudah dibayar, ajukan sengketa dari halaman pesanan agar kami bantu proses refund.',
            str_contains($last, 'makanan') || str_contains($last, 'aman') => 'Semua produk mencantumkan batas aman konsumsi dan checklist keamanan pangan. Periksa label produk sebelum dikonsumsi.',
            default => 'Halo! Saya asisten SisaPiring. Saya bisa membantu soal pencarian makanan, pemesanan, pembayaran, pengambilan, dampak lingkungan, dan pengajuan sengketa.',
        };
    }
}
