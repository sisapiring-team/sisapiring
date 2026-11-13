<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('webhook_events', function (Blueprint $table) {
            $table->id();
            $table->foreignId('payment_id')->nullable()->constrained()->nullOnDelete();
            $table->string('provider');
            $table->string('external_id')->nullable();
            $table->string('event_type')->nullable();
            $table->json('payload');
            $table->string('status')->default('received');
            $table->timestamp('processed_at')->nullable();
            $table->text('error_message')->nullable();
            $table->timestamps();

            $table->unique(['provider', 'external_id', 'event_type']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('webhook_events');
    }
};
