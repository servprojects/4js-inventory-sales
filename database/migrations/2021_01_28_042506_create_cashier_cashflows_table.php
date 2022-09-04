<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateCashierCashflowsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('cashier_cashflows', function (Blueprint $table) {
            $table->id();
            $table->dateTime('trans_date')->nullable();
            $table->char('type', 10)->nullable();
            $table->char('accountability', 30)->nullable();
            $table->char('status', 20)->nullable();
            $table->char('temp_status', 20)->nullable();
            $table->char('actual_date', 25)->nullable();
            $table->float('amount')->nullable();
            $table->float('beg_cash')->nullable();
            $table->float('end_cash')->nullable();
            $table->text('description')->nullable();
            $table->unsignedInteger('transaction_id')->nullable();
            $table->unsignedInteger('user_id')->nullable();
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
        Schema::dropIfExists('cashier_cashflows');
    }
}
