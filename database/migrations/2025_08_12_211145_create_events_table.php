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
        Schema::create('events', function (Blueprint $table) {
            $table->id();
            
            // Event Basic Information
            $table->string('name')->nullable();
            $table->enum('event_type', ['Wedding', 'Corporate', 'Birthday', 'Other'])->default('Wedding');
            $table->date('event_date');
            $table->time('setup_time')->nullable();
            $table->time('start_time')->nullable();
            $table->time('end_time')->nullable();
            $table->enum('booking_status', ['Planning', 'Booked', 'Confirmed', 'Completed'])->default('Planning');
            
            // Service Information
            $table->string('service_package')->nullable();
            $table->text('service_description')->nullable();
            $table->integer('guest_count')->nullable();
            
            // DJ Relationship
            $table->foreignId('dj_id')->constrained('users')->onDelete('cascade');
            
            // Venue Information (1-to-1 relationship)
            $table->string('venue_name')->nullable();
            $table->string('venue_address')->nullable();
            $table->string('venue_city')->nullable();
            $table->string('venue_state')->nullable();
            $table->string('venue_zipcode')->nullable();
            $table->string('venue_phone')->nullable();
            $table->string('venue_email')->nullable();
            
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('events');
    }
};
