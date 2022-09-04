<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreatePayrollsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('payrolls', function (Blueprint $table) {
            $table->id();
            $table->float('cash_ad', 8, 3)->nullable()->default(0);
            $table->float('deduction', 8, 3)->nullable()->default(0);
            $table->float('incentive', 8, 3)->nullable()->default(0);
            $table->float('rate_per_hour', 8, 3)->nullable();
            $table->float('rate_per_hour_ot', 8, 3)->nullable();
            $table->unsignedInteger('emp_id');
            $table->date('beg_date')->nullable();
            $table->date('end_date')->nullable();
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
        Schema::dropIfExists('payrolls');
    }
}
