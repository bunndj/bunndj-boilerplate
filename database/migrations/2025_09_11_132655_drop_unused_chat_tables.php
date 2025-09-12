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
        // Drop unused chat tables that were created but never used
        Schema::dropIfExists('chat_conversations');
        Schema::dropIfExists('chat_steps');
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        // Recreate the tables if needed (though they were empty)
        Schema::create('chat_conversations', function (Blueprint $table) {
            $table->id();
            $table->timestamps();
        });
        
        Schema::create('chat_steps', function (Blueprint $table) {
            $table->id();
            $table->timestamps();
        });
    }
};
