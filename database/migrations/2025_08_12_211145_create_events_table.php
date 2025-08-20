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
        Schema::create('events', function (Blueprint $table) {
            $table->id();
            
            // Event Basic Information
            $table->string('name')->nullable();
            $table->string('event_type')->default('Wedding');
            $table->date('event_date');
            $table->time('setup_time')->nullable();
            $table->time('start_time')->nullable();
            $table->time('end_time')->nullable();
            $table->string('booking_status')->default('Planning');
            
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

        // Add check constraints for PostgreSQL to simulate ENUM behavior
        if (config('database.default') === 'pgsql') {
            DB::statement("ALTER TABLE events ADD CONSTRAINT events_event_type_check CHECK (event_type IN ('Wedding', 'Corporate', 'Birthday', 'Other'))");
            DB::statement("ALTER TABLE events ADD CONSTRAINT events_booking_status_check CHECK (booking_status IN ('Planning', 'Booked', 'Confirmed', 'Completed'))");
        }
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('events');
    }
};
