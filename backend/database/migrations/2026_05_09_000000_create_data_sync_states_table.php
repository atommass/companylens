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
        Schema::create('data_sync_states', function (Blueprint $table) {
            $table->id();
            $table->string('source_key')->unique();
            $table->string('content_hash', 64);
            $table->unsignedInteger('record_count')->default(0);
            $table->timestamp('source_last_modified_at')->nullable();
            $table->timestamp('last_synced_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('data_sync_states');
    }
};
