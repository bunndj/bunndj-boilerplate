<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        // Add 'client' role to the users_role_enum
        try {
            DB::statement("ALTER TYPE users_role_enum ADD VALUE 'client'");
        } catch (Exception $e) {
            // If the value already exists, ignore the error
            if (strpos($e->getMessage(), 'already exists') === false) {
                throw $e;
            }
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Note: PostgreSQL doesn't support removing enum values easily
        // This would require recreating the enum type and updating all references
        // For now, we'll leave the 'client' value in place
    }
};