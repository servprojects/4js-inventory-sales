<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateRequisitionsTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('requisitions', function (Blueprint $table) {
            $table->id();
            $table->string('urgency_status');
            $table->date('estimated_receiving_date');
            $table->string('request_status')->nullable();
            $table->string('type');
            $table->string('code')->unique();
            $table->unsignedInteger('user_id');
            $table->unsignedInteger('branch_id');
            $table->unsignedInteger('request_to');
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
        Schema::dropIfExists('requisitions');
    }
}
