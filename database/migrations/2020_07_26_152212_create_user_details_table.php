<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateUserDetailsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('user_details', function (Blueprint $table) {
            $table->id();
            $table->string('first_name');
            $table->string('middle_name');
            $table->string('last_name');
            $table->unsignedInteger('branch_id')->nullable();
            $table->string('role')->nullable();
            $table->string('contact_no');
            $table->string('address');
            $table->unsignedInteger('position_id')->nullable();
            $table->float('cash_on_hand')->nullable();
            $table->char('enable_cashflow', 3)->nullable();
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
        Schema::dropIfExists('user_details');
    }
}
