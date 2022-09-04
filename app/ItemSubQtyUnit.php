<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class ItemSubQtyUnit extends Model
{
    protected $fillable = [
        'unit',
        'quantity',
        'item_id',
    ];

    protected $casts = [
        'quantity' => 'float',
        'item_id' => 'integer',
    ];
}
