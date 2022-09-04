<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Branch extends Model
{
    protected $fillable = [
        'id',
        'name',
        'location',
        'balance',
        'isDisabled'
    ];
    protected $casts = [
        'id' => 'integer',
        'balance' => 'float',
        'isDisabled' => 'integer'
    ];

   
}
