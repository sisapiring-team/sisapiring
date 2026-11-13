<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->string('district')->nullable()->after('phone');
            $table->text('default_address')->nullable()->after('district');
            $table->string('account_status')->default('active')->after('role');
            $table->unsignedInteger('violation_count')->default(0)->after('account_status');
            $table->text('sanction_note')->nullable()->after('violation_count');
            $table->json('notification_preferences')->nullable()->after('sanction_note');
            $table->timestamp('last_active_at')->nullable()->after('notification_preferences');
            $table->timestamp('suspended_at')->nullable()->after('last_active_at');
            $table->foreignId('suspended_by')->nullable()->after('suspended_at')->constrained('users')->nullOnDelete();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropForeign(['suspended_by']);
            $table->dropSoftDeletes();
            $table->dropColumn([
                'district',
                'default_address',
                'account_status',
                'violation_count',
                'sanction_note',
                'notification_preferences',
                'last_active_at',
                'suspended_at',
                'suspended_by',
            ]);
        });
    }
};
