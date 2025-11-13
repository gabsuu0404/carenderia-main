<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('inventory_batches', function (Blueprint $table) {
            $table->id();
            $table->foreignId('inventory_id')->constrained('inventories')->onDelete('cascade');
            $table->foreignId('stock_transaction_item_id')->constrained('stock_transaction_items')->onDelete('cascade');
            $table->decimal('quantity', 10, 2); // Current remaining quantity in this batch
            $table->decimal('original_quantity', 10, 2); // Original quantity when stocked in
            $table->date('expiry_date')->nullable();
            $table->date('stock_in_date');
            $table->timestamps();
            
            // Index for efficient FIFO queries
            $table->index(['inventory_id', 'stock_in_date', 'expiry_date']);
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('inventory_batches');
    }
};
