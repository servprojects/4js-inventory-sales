<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateItemCountsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('item_counts', function (Blueprint $table) {
            $table->id();
            $table->unsignedInteger('item_id');
            $table->float('balance', 10, 2);
            $table->float('collectible_amount', 10, 2);
            $table->float('threshold', 10, 2);
            $table->char('begbal_created_at', 30)->nullable();
            $table->char('begbal_updated_at', 30)->nullable();
            $table->char('inv_date_update', 25)->nullable();
            $table->unsignedInteger('branch_id');
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
        Schema::dropIfExists('item_counts');
    }
}
