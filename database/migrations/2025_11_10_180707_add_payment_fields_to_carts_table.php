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
        Schema::table('carts', function (Blueprint $table) {
            $table->string('payment_method')->default('COD')->after('notes');
            $table->string('gcash_number')->nullable()->after('payment_method');
            $table->string('gcash_receipt')->nullable()->after('gcash_number');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('carts', function (Blueprint $table) {
            $table->dropColumn(['payment_method', 'gcash_number', 'gcash_receipt']);
        });
    }
};
