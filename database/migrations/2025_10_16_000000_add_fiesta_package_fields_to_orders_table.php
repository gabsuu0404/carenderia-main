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
        Schema::table('orders', function (Blueprint $table) {
            $table->string('package_set')->nullable()->after('package_name');
            $table->string('main_item')->nullable()->after('package_set');
            $table->json('selected_desserts')->nullable()->after('selected_dishes');
        });
    }

    /**
     * Reverse the migrations.
     *
     * @return void
     */
    public function down()
    {
        Schema::table('orders', function (Blueprint $table) {
            $table->dropColumn('package_set');
            $table->dropColumn('main_item');
            $table->dropColumn('selected_desserts');
        });
    }
};