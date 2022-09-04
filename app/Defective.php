<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Defective extends Model
{
    protected $fillable = [
        'item_id',
        'branch_id',
        'balance',
        
    ];

    protected $casts = [
        'item_id' => 'integer',
        'branch_id' => 'integer',
        'balance' => 'float',
        
    ];
}
