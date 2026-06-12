<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('cms_page_sections', function (Blueprint $table) {
            $table->id();
            $table->foreignId('cms_page_id')->constrained('cms_pages')->cascadeOnDelete();
            $table->string('type');
            $table->string('title')->nullable();
            $table->json('content')->nullable();
            $table->unsignedInteger('sort_order')->default(0);
            $table->timestamps();

            $table->index(['cms_page_id', 'sort_order']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('cms_page_sections');
    }
};
