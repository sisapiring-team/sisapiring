<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('merchants', function (Blueprint $table) {
            $table->string('nib_number')->nullable()->after('business_document_name');
            $table->string('ktp_masked')->nullable()->after('nib_number');
            $table->string('halal_or_pirt_number')->nullable()->after('ktp_masked');
            $table->string('doc_type')->nullable()->after('halal_or_pirt_number');
            $table->string('business_document_path')->nullable()->after('doc_type');
            $table->boolean('hygiene_commitment_signed')->default(false)->after('business_document_path');
            $table->foreignId('reviewed_by')->nullable()->after('verification_notes')->constrained('users')->nullOnDelete();
            $table->timestamp('reviewed_at')->nullable()->after('reviewed_by');
            $table->text('suspended_reason')->nullable()->after('reviewed_at');
            $table->softDeletes();
        });
    }

    public function down(): void
    {
        Schema::table('merchants', function (Blueprint $table) {
            $table->dropForeign(['reviewed_by']);
            $table->dropSoftDeletes();
            $table->dropColumn([
                'nib_number',
                'ktp_masked',
                'halal_or_pirt_number',
                'doc_type',
                'business_document_path',
                'hygiene_commitment_signed',
                'reviewed_by',
                'reviewed_at',
                'suspended_reason',
            ]);
        });
    }
};
