<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreatePhysicalCountsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('physical_counts', function (Blueprint $table) {
            $table->id();
            $table->unsignedInteger('branch_id');
            $table->date('date')->nullable();
            $table->char('syscount_date', 3)->nullable();
            $table->varchar('description', 100)->nullable();
            $table->char('live_update', 3)->nullable();
            $table->longText('items');
            $table->longText('old_items')->nullable();
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
        Schema::dropIfExists('physical_counts');
    }
}
