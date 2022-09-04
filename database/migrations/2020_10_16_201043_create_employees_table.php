<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateEmployeesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('employees', function (Blueprint $table) {
            $table->id();
            $table->string('emp_id')->nullable();
            $table->string('last_name')->nullable();
            $table->string('first_name')->nullable();
            $table->string('middle_name')->nullable();
            $table->string('position_no')->nullable();
            $table->string('contac_no')->nullable();
            $table->string('start_work')->nullable();
            $table->date('birthday')->nullable();
            $table->string('address')->nullable();
            $table->string('in_case_emerg')->nullable();
            $table->string('rel_to_emp')->nullable();
            $table->float('rate_per_day', 10, 2)->nullable();
            $table->float('rate_per_hour', 10, 5)->nullable();
            $table->float('rate_per_hour_ot', 10, 5)->nullable();
            $table->unsignedInteger('position_id')->nullable();
            $table->unsignedInteger('dept_id')->nullable();
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
        Schema::dropIfExists('employees');
    }
}
