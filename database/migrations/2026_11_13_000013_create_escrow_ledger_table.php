<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('escrow_ledger', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->nullable()->constrained()->nullOnDelete();
            $table->foreignId('merchant_id')->nullable()->constrained()->nullOnDelete();
            $table->string('entry_type');
            $table->string('status');
            $table->decimal('amount', 12, 2);
            $table->string('currency', 3)->default('IDR');
            $table->string('reference')->nullable();
            $table->timestamp('available_at')->nullable();
            $table->timestamp('released_at')->nullable();
            $table->text('note')->nullable();
            $table->timestamps();

            $table->index(['merchant_id', 'status']);
            $table->index(['order_id', 'entry_type']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('escrow_ledger');
    }
};
