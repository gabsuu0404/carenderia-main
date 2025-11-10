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
        Schema::create('carts', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->integer('package_id')->nullable();
            $table->string('package_name');
            $table->decimal('package_price', 10, 2);
            $table->string('package_set')->nullable();
            $table->string('main_item')->nullable();
            $table->integer('quantity')->default(1);
            $table->integer('number_of_pax')->default(1);
            $table->json('selected_dishes')->nullable();
            $table->json('selected_desserts')->nullable();
            $table->date('delivery_date');
            $table->text('delivery_address');
            $table->text('notes')->nullable();
            $table->decimal('total_amount', 10, 2);
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
        Schema::dropIfExists('carts');
    }
};
