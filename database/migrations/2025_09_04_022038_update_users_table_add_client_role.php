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
        // For PostgreSQL, we need to handle enum changes differently
        // First, add a temporary column
        Schema::table('users', function (Blueprint $table) {
            $table->enum('role_new', ['admin', 'dj', 'client'])->default('dj')->after('role');
        });

        // Copy data from old column to new column
        DB::statement('UPDATE users SET role_new = role::text');

        // Drop the old column
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('role');
        });

        // Rename the new column to the original name
        Schema::table('users', function (Blueprint $table) {
            $table->renameColumn('role_new', 'role');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Reverse the process: create temp column with old enum values
        Schema::table('users', function (Blueprint $table) {
            $table->enum('role_old', ['admin', 'dj'])->default('dj')->after('role');
        });

        // Copy data, but only admin and dj roles
        DB::statement("UPDATE users SET role_old = role::text WHERE role IN ('admin', 'dj')");

        // Drop the current column
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn('role');
        });

        // Rename back
        Schema::table('users', function (Blueprint $table) {
            $table->renameColumn('role_old', 'role');
        });
    }
};