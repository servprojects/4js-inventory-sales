<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateTransactionItemsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('transaction_items', function (Blueprint $table) {
            $table->id();
            $table->string('item_status');
            $table->string('charge_status')->nullable();
            $table->float('unit_price')->nullable();
            $table->float('beg_balance')->nullable();
            $table->float('end_balance')->nullable();
            $table->float('original_price')->nullable();
            $table->float('old_original_price')->nullable();
            $table->float('beg_collectible')->nullable();
            $table->float('end_collectible')->nullable(); 
            $table->float('beg_def_bal')->nullable();
            $table->float('end_def_bal')->nullable();
            $table->float('quantity')->nullable();
            $table->unsignedInteger('transaction_id')->nullable();
            $table->unsignedInteger('old_transaction_id')->nullable();
            $table->unsignedInteger('return_transacitem_id')->nullable();
            $table->unsignedInteger('item_id')->nullable();
            $table->unsignedInteger('supplier_id')->nullable();
            $table->date('date_received')->nullable();
            $table->char('replace_date', 20)->nullable();
            $table->char('delete_date', 50)->nullable();
            $table->char('debit', 5)->nullable();
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
        Schema::dropIfExists('trasaction_items');
    }
}
