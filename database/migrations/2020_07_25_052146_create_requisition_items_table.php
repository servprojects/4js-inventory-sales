<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateRequisitionItemsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('requisition_items', function (Blueprint $table) {
            $table->id();
            $table->float('unit_price', 8, 2)->nullable();
            $table->integer('quantity');
            $table->string('new_item')->nullable();
            $table->string('status')->nullable();
            $table->string('unit')->nullable();
            $table->string('size')->nullable();
            $table->unsignedInteger('requisition_id');
            $table->unsignedInteger('item_id')->nullable();
            $table->date('date_received')->nullable();
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
        Schema::dropIfExists('requisition_items');
    }
}
