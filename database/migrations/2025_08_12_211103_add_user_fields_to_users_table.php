<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('users', function (Blueprint $table) {
            // Contact Information
            $table->string('organization')->nullable()->after('email');
            $table->string('website')->nullable()->after('organization');
            $table->string('home_phone')->nullable()->after('website');
            $table->string('cell_phone')->nullable()->after('home_phone');
            $table->string('work_phone')->nullable()->after('cell_phone');
            $table->string('fax_phone')->nullable()->after('work_phone');
            
            // Address Information
            $table->string('address')->nullable()->after('fax_phone');
            $table->string('address_line_2')->nullable()->after('address');
            $table->string('city')->nullable()->after('address_line_2');
            $table->string('state')->nullable()->after('city');
            $table->string('zipcode')->nullable()->after('state');
            
            // User Management
            $table->string('username')->unique()->after('zipcode');
            $table->enum('role', ['admin', 'dj'])->default('dj')->after('username');
            $table->boolean('sms_consent')->default(true)->after('role');
            $table->boolean('is_active')->default(true)->after('sms_consent');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('users', function (Blueprint $table) {
            $table->dropColumn([
                'organization',
                'website',
                'home_phone',
                'cell_phone',
                'work_phone',
                'fax_phone',
                'address',
                'address_line_2',
                'city',
                'state',
                'zipcode',
                'username',
                'role',
                'sms_consent',
                'is_active'
            ]);
        });
    }
};
