<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateChequesTable extends Migration
{
    /**
     * Run the migrations.
     *
     * @return void
     */
    public function up()
    {
        Schema::create('cheques', function (Blueprint $table) {
            $table->id();
            $table->string('code')->unique();
            $table->string('bank')->nullable();
            $table->date('date')->nullable();
            $table->string('payee')->nullable();
            $table->unsignedInteger('supplier_id');
            $table->float('amount', 8, 5);
            $table->string('status')->nullable();
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
        Schema::dropIfExists('cheques');
    }
}
