<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateDebitedItmsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('debited_itms', function (Blueprint $table) {
            $table->id();
            $table->string('sale_code')->nullable();
            $table->string('debit_code')->nullable();
            $table->unsignedInteger('return_id')->nullable();
            $table->unsignedInteger('sale_id')->nullable();
            $table->unsignedInteger('debit_id')->nullable();
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
        Schema::dropIfExists('debited_itms');
    }
}
