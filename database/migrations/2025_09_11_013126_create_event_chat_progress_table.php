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
        Schema::create('event_chat_progress', function (Blueprint $table) {
            $table->id();
            $table->foreignId('event_id')->constrained()->onDelete('cascade');
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->integer('current_step')->default(1);
            $table->json('answers')->nullable(); // Store all answers as JSON
            $table->json('chat_messages')->nullable(); // Store chat history
            $table->boolean('is_completed')->default(false);
            $table->timestamp('last_activity_at')->nullable();
            $table->timestamps();
            
            // Add indexes for faster queries
            $table->index(['event_id', 'user_id']);
            $table->index('current_step');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('event_chat_progress');
    }
};