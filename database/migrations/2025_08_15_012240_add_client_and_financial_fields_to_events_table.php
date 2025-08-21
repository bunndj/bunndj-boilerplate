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
        Schema::table('events', function (Blueprint $table) {
            // Client information fields
            $table->string('client_firstname')->nullable();
            $table->string('client_lastname')->nullable();
            $table->string('client_organization')->nullable();
            $table->string('client_cell_phone')->nullable();
            $table->string('client_home_phone')->nullable();
            $table->string('client_email')->nullable();
            $table->string('client_address')->nullable();
            $table->string('client_address_line2')->nullable();
            $table->string('client_city')->nullable();
            $table->string('client_state', 2)->nullable();
            $table->string('client_zipcode', 10)->nullable();
            
            // Custom client fields
            $table->string('partner_name')->nullable();
            $table->string('partner_email')->nullable();
            $table->string('mob_fog')->nullable(); // Mother of Bride/Father of Groom
            $table->string('mob_fog_email')->nullable();
            $table->string('other_contact')->nullable();
            $table->string('poc_email_phone')->nullable(); // Point of Contact
            $table->string('vibo_link')->nullable();
            
            // Financial fields
            $table->string('package')->nullable(); // basic, standard, premium
            $table->json('add_ons')->nullable(); // [{name, price, quantity, total_price}]
            $table->decimal('deposit_value', 10, 2)->nullable();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('events', function (Blueprint $table) {
            // Drop client information fields
            $table->dropColumn([
                'client_firstname',
                'client_lastname',
                'client_organization',
                'client_cell_phone',
                'client_home_phone',
                'client_email',
                'client_address',
                'client_address_line2',
                'client_city',
                'client_state',
                'client_zipcode',
            ]);
            
            // Drop custom client fields
            $table->dropColumn([
                'partner_name',
                'partner_email',
                'mob_fog',
                'mob_fog_email',
                'other_contact',
                'poc_email_phone',
                'vibo_link',
            ]);
            
            // Drop financial fields
            $table->dropColumn([
                'package',
                'add_ons',
                'deposit_value',
            ]);
        });
    }
};
