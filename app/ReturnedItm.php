<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class ReturnedItm extends Model
{
    protected $fillable = [
        'sale_code',
        'return_code',
        'return_id',
        'sale_id', 
        'created_at',
        'updated_at',
    ];

    protected $casts = [
        'return_id' => 'integer',
        'sale_id' => 'integer',
        
    ];
}
