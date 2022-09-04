<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Supplier extends Model
{
    protected $fillable = [
        'id',
        'name',
        'address',
        'balance'
    ];
    protected $casts = [
        'id' => 'integer',
        'balance' => 'float',
       
    ];
}
