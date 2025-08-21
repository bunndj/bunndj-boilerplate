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
        Schema::create('event_music_ideas', function (Blueprint $table) {
            $table->id();
            $table->foreignId('event_id')->constrained()->onDelete('cascade');
            $table->json('music_ideas')->nullable();
            $table->text('notes')->nullable();
            $table->timestamps();
            
            // Ensure unique music ideas record per event (one-to-one relationship)
            $table->unique('event_id');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('event_music_ideas', function (Blueprint $table) {
            $table->dropForeign(['event_id']);
        });
        Schema::dropIfExists('event_music_ideas');
    }
};
