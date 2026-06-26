<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        // The database currently has both:
        // - 'mobile number' (with space from original create migration)
        // - 'mobile_number' (with underscore from rename_phone_to_mobile_number migration)
        // We need to drop the duplicate 'mobile number' column since all code uses 'mobile_number'

        if (Schema::hasColumn('users', 'mobile number') && Schema::hasColumn('users', 'mobile_number')) {
            // Copy any data from 'mobile number' to 'mobile_number' if mobile_number is empty
            DB::statement("UPDATE users SET mobile_number = `mobile number` WHERE mobile_number IS NULL AND `mobile number` IS NOT NULL");

            Schema::table('users', function (Blueprint $table) {
                $table->dropColumn('mobile number');
            });
        } elseif (Schema::hasColumn('users', 'mobile number') && !Schema::hasColumn('users', 'mobile_number')) {
            // If only 'mobile number' exists, rename it
            Schema::table('users', function (Blueprint $table) {
                $table->renameColumn('mobile number', 'mobile_number');
            });
        }
        // If neither or only mobile_number exists, nothing to do
    }

    public function down(): void
    {
        // Cannot reliably reverse this operation
    }
};
