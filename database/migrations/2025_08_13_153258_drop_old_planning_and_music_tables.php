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
        Schema::dropIfExists('event_planning_data');
        Schema::dropIfExists('event_music');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Recreate the old tables if needed for rollback
        Schema::create('event_planning_data', function (Blueprint $table) {
            $table->id();
            $table->foreignId('event_id')->constrained()->onDelete('cascade');
            $table->string('field_name');
            $table->text('field_value')->nullable();
            $table->enum('source', ['manual', 'ai_parsed'])->default('manual');
            $table->foreignId('verified_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamps();
            $table->unique(['event_id', 'field_name']);
        });

        Schema::create('event_music', function (Blueprint $table) {
            $table->id();
            $table->foreignId('event_id')->constrained()->onDelete('cascade');
            $table->enum('music_type', ['spotify', 'dj_catalog'])->default('spotify');
            $table->string('playlist_url')->nullable();
            $table->json('song_list')->nullable();
            $table->string('timeline_position')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
        });
    }
};
