<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateTransactionsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('transactions', function (Blueprint $table) {
            $table->id();
            $table->string('transaction_type');
            $table->string('code')->unique();
            $table->string('charge_transaction_code')->nullable();
            $table->string('return_code')->nullable();
            $table->string('debit_code')->nullable();
            $table->string('accountability')->nullable();
            $table->int('series_no')->nullable();
            $table->string('receipt_code')->nullable();
            $table->float('discount', 8, 5)->nullable();
            $table->unsignedInteger('user_id');
            $table->unsignedInteger('branch_id');
            $table->unsignedInteger('customer_id')->nullable();
            $table->unsignedInteger('office_id')->nullable();
            $table->unsignedInteger('project_id')->nullable();
            $table->unsignedInteger('delivery_id')->nullable();
            $table->unsignedInteger('requisition_id')->nullable();
            $table->unsignedInteger('cheque_id')->nullable();
            $table->unsignedInteger('supplier_id')->nullable();
            $table->unsignedInteger('receiving_pos_branch ')->nullable();
            $table->string('charge_payment_transac_id')->nullable();
            $table->string('customer_name')->nullable();
            $table->string('description')->nullable();
            $table->float('amount_received', 8, 5)->nullable();
            $table->float('charge_paid_amount', 8, 5)->nullable();
            $table->float('payable', 8, 5)->nullable();
            $table->float('beg_charge_bal', 8, 5)->nullable();
            $table->float('end_charge_bal', 8, 5)->nullable();
            $table->string('date_printed')->nullable();
            $table->date('date_transac')->nullable();
            $table->date('date_paid')->nullable();
            $table->string('charge_status')->nullable();
            $table->string('transaction_status', 100)->nullable();
            $table->char('imported', 3)->nullable();
            $table->char('last_update', 20)->nullable();
            $table->char('partof_cashflow', 3)->nullable();
            $table->char('latespecifics', 10)->nullable();
            $table->integer('reset_no', 11)->nullable();
            $table->char('counter_no', 10)->nullable();
            $table->char('st_tin_num', 50)->nullable();
            $table->char('st_bus_type', 50)->nullable();
            $table->char('originated', 20)->nullable();
            $table->char('ctrlno', 50)->nullable();
            $table->tinyInteger('recordedOnline')->default(0)->nullable();
            $table->tinyInteger('isPOSRelease')->default(0)->nullable();
            $table->tinyInteger('isLocalImport')->default(0)->nullable();
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
        Schema::dropIfExists('transactions');
    }
}
