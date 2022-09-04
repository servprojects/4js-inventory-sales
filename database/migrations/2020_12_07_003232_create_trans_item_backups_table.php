<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateTransItemBackupsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('trans_item_backups', function (Blueprint $table) {
            $table->id();
            $table->string('code')->nullable();
            $table->char('type', 30)->nullable();
            $table->char('date_transac', 50)->nullable();
            $table->text('items')->nullable();
            $table->string('trans_payable')->nullable();
            $table->string('credit_balance')->nullable();
            $table->text('item_balances')->nullable();
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
        Schema::dropIfExists('trans_item_backups');
    }
}
