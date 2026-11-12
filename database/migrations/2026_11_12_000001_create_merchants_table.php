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
        Schema::create('merchants', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique(); // e.g. UMKM-BDG-042
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->string('business_name');
            $table->string('business_category'); // Bakery & Roti, Katering & Nasi Kotak, etc.
            $table->string('owner_name');
            $table->string('owner_phone');
            $table->string('owner_email');
            $table->text('business_address');
            $table->string('city')->default('Bandung');
            $table->string('district'); // BandungDistrict (e.g. Coblong, Bandung Wetan, etc.)
            $table->decimal('latitude', 10, 7)->nullable();
            $table->decimal('longitude', 10, 7)->nullable();
            $table->string('business_photo')->nullable();
            $table->string('business_document_name')->nullable();
            $table->string('verification_status')->default('verified'); // pending_review, verified, rejected
            $table->text('verification_notes')->nullable();
            $table->string('operating_hours')->default('08:00 - 21:00 WIB');
            $table->string('pickup_window')->default('17:00 - 21:30 WIB');
            $table->text('store_bio')->nullable();
            $table->boolean('is_open_today')->default(true);
            $table->decimal('rating', 3, 2)->default(4.85);
            $table->unsignedInteger('total_rescued_count')->default(0);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('merchants');
    }
};
