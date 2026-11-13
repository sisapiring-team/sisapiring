<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->foreignId('order_group_id')->nullable()->after('id')->constrained('order_groups')->nullOnDelete();
            $table->string('payment_status')->default('unpaid')->after('status');
            $table->decimal('platform_fee', 12, 2)->default(0)->after('total_discount');
            $table->timestamp('paid_at')->nullable()->after('pickup_deadline_at');
            $table->timestamp('completed_at')->nullable()->after('paid_at');
            $table->timestamp('cancelled_at')->nullable()->after('completed_at');
            $table->text('notes')->nullable()->after('cancellation_reason');
            $table->index('pickup_code');
            $table->index(['merchant_id', 'status']);
            $table->index(['user_id', 'status']);
        });
    }

    public function down(): void
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropIndex(['pickup_code']);
            $table->dropIndex(['merchant_id', 'status']);
            $table->dropIndex(['user_id', 'status']);
            $table->dropForeign(['order_group_id']);
            $table->dropColumn([
                'order_group_id',
                'payment_status',
                'platform_fee',
                'paid_at',
                'completed_at',
                'cancelled_at',
                'notes',
            ]);
        });
    }
};
