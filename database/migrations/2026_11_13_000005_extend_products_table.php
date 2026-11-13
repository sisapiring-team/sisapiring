<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->string('moderation_status')->default('active')->after('is_active');
            $table->text('takedown_reason')->nullable()->after('moderation_status');
            $table->timestamp('last_checked_at')->nullable()->after('takedown_reason');
            $table->foreignId('moderated_by')->nullable()->after('last_checked_at')->constrained('users')->nullOnDelete();
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::table('products', function (Blueprint $table) {
            $table->dropForeign(['moderated_by']);
            $table->dropSoftDeletes();
            $table->dropColumn(['moderation_status', 'takedown_reason', 'last_checked_at', 'moderated_by']);
        });
    }
};
