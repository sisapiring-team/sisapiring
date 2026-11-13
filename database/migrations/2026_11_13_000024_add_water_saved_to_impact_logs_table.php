<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('impact_logs', function (Blueprint $table) {
            $table->decimal('water_saved_liters', 10, 2)->default(0)->after('methane_prevented_kg');
        });
    }

    public function down(): void
    {
        Schema::table('impact_logs', function (Blueprint $table) {
            $table->dropColumn('water_saved_liters');
        });
    }
};
