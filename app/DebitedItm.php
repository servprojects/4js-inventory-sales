<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class DebitedItm extends Model
{
    protected $fillable = [
        'sale_code',
        'debit_code',
        'return_id',
        'sale_id',
        'debit_id',

    ];

    protected $casts = [
        'return_id' => 'integer',
        'sale_id' => 'integer',
        'debit_id' => 'integer',
        
    ];
}
