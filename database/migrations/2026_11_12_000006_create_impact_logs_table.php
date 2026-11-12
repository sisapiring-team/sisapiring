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
        Schema::create('impact_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('order_id')->nullable()->constrained('orders')->nullOnDelete();
            $table->foreignId('merchant_id')->nullable()->constrained('merchants')->nullOnDelete();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->unsignedInteger('portions_rescued')->default(1);
            $table->decimal('weight_rescued_kg', 8, 3); // 1 portion ~0.35-0.4 kg
            $table->decimal('co2_prevented_kg', 8, 3); // ~2.5 kg CO2e per kg food waste
            $table->decimal('methane_prevented_kg', 8, 3); // ~0.082 kg CH4 per kg organic waste
            $table->decimal('money_saved_idr', 12, 2)->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('impact_logs');
    }
};
