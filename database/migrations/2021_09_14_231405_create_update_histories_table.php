<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateUpdateHistoriesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('update_histories', function (Blueprint $table) {
            $table->id();
            $table->char('update_dateTime',25)->nullable();
            $table->char('macaddress',30)->nullable();
            $table->unsignedInteger('user_id')->nullable();
            $table->char('update_through',25)->nullable();
            $table->text('report')->nullable();
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
        Schema::dropIfExists('update_histories');
    }
}
