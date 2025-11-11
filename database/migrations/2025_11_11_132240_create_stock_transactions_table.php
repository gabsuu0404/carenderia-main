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
        Schema::create('stock_transactions', function (Blueprint $table) {
            $table->id();
            $table->enum('type', ['in', 'out']); // 'in' for stock in, 'out' for stock out
            $table->date('transaction_date');
            $table->foreignId('user_id')->nullable()->constrained()->onDelete('set null'); // Who made the transaction
            $table->text('notes')->nullable();
            $table->timestamps();
        });

        // Create stock transaction items table for the details
        Schema::create('stock_transaction_items', function (Blueprint $table) {
            $table->id();
            $table->foreignId('stock_transaction_id')->constrained()->onDelete('cascade');
            $table->foreignId('inventory_id')->constrained('inventories')->onDelete('cascade');
            $table->decimal('quantity', 10, 2);
            $table->decimal('quantity_before', 10, 2); // Quantity before the transaction
            $table->decimal('quantity_after', 10, 2); // Quantity after the transaction
            $table->date('expiry_date')->nullable(); // For stock in
            $table->string('reason')->nullable(); // For stock out
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::dropIfExists('stock_transaction_items');
        Schema::dropIfExists('stock_transactions');
    }
};
