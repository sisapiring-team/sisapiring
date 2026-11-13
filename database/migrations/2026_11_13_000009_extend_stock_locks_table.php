<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('stock_locks', function (Blueprint $table) {
            $table->foreignId('order_group_id')->nullable()->after('product_id')->constrained('order_groups')->nullOnDelete();
            $table->foreignId('order_id')->nullable()->after('order_group_id')->constrained('orders')->nullOnDelete();
            $table->timestamp('converted_at')->nullable()->after('expires_at');
            $table->timestamp('released_at')->nullable()->after('converted_at');
        });
    }

    public function down(): void
    {
        Schema::table('stock_locks', function (Blueprint $table) {
            $table->dropForeign(['order_group_id']);
            $table->dropForeign(['order_id']);
            $table->dropColumn(['order_group_id', 'order_id', 'converted_at', 'released_at']);
        });
    }
};
