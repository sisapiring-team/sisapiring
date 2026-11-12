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
        Schema::create('products', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique(); // e.g. PRD-001
            $table->foreignId('merchant_id')->constrained('merchants')->cascadeOnDelete();
            $table->string('name');
            $table->string('category'); // Bakery & Roti, etc.
            $table->string('image')->nullable();
            $table->text('description')->nullable();
            $table->decimal('original_price', 12, 2);
            $table->unsignedTinyInteger('discount_percentage'); // 50, 70, 90, 100
            $table->decimal('discounted_price', 12, 2);
            $table->integer('stock')->default(0);
            $table->integer('locked_stock')->default(0);
            $table->unsignedInteger('weight_grams')->default(350); // standard portion weight for impact calculation
            $table->string('production_time')->nullable(); // e.g. "Hari ini, 07:00 WIB"
            $table->string('safe_consumption_deadline')->nullable(); // e.g. "Hari ini, 23:00 WIB"
            $table->timestamp('safe_deadline_at')->nullable(); // timestamp for countdown timer
            $table->string('pickup_schedule_start')->nullable(); // e.g. "17:30 WIB"
            $table->string('pickup_schedule_end')->nullable(); // e.g. "21:00 WIB"
            $table->string('storage_instruction')->default('Suhu Ruang (Kering & Sejuk)');
            $table->json('food_safety_checklist')->nullable();
            $table->boolean('is_active')->default(true);
            $table->unsignedInteger('portions_rescued_count')->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('products');
    }
};
