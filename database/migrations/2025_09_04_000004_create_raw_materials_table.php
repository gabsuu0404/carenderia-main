<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration {
    public function up(): void
    {
        Schema::create('raw_materials', function (Blueprint $table) {
            $table->id();
            $table->string('name');
            $table->text('description')->nullable();
            $table->string('category'); // e.g., 'Meat', 'Vegetables', 'Spices', 'Dairy'
            $table->string('unit'); // e.g., 'kg', 'pieces', 'liters', 'cups'
            $table->decimal('unit_price', 8, 2);
            $table->decimal('total_value', 10, 2)->default(0);
            $table->boolean('is_available')->default(true);
            $table->boolean('is_hidden')->default(false);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('raw_materials');
    }
};
