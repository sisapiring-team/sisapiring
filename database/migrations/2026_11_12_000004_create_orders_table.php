<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('orders', function (Blueprint $table) {
            $table->id();
            $table->string('order_code')->unique(); // e.g. SP-BDG-2026-081
            $table->string('pickup_code'); // e.g. SP-7842
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('merchant_id')->constrained('merchants')->cascadeOnDelete();
            $table->string('customer_name');
            $table->string('customer_phone');
            $table->decimal('total_original_price', 12, 2)->default(0);
            $table->decimal('total_payment', 12, 2)->default(0);
            $table->decimal('total_discount', 12, 2)->default(0);
            $table->string('status')->default('waiting_confirmation'); // waiting_confirmation, confirmed, ready_for_pickup, completed, cancelled
            $table->string('pickup_deadline')->nullable(); // e.g. "Hari ini, 21:00 WIB"
            $table->timestamp('pickup_deadline_at')->nullable();
            $table->string('qr_code_token')->unique(); // Unique token inside buyer's QR code
            $table->boolean('is_verified_by_qr')->default(false);
            $table->timestamp('verified_at')->nullable();
            $table->foreignId('verified_by_user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('cancellation_reason')->nullable();
            $table->json('status_history')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('orders');
    }
};
