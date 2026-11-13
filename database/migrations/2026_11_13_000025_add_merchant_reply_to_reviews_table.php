<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('reviews', function (Blueprint $table) {
            $table->text('merchant_reply')->nullable()->after('admin_reply');
            $table->timestamp('merchant_replied_at')->nullable()->after('merchant_reply');
        });
    }

    public function down(): void
    {
        Schema::table('reviews', function (Blueprint $table) {
            $table->dropColumn(['merchant_reply', 'merchant_replied_at']);
        });
    }
};
