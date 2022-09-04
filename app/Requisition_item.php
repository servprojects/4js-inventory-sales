<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Requisition_item extends Model
{
    protected $fillable = [
        'unit_price',
        'quantity',
        'requisition_id',
        'new_item',
        'status',
        'unit',
        'size',
        'item_id',
        'date_received'
    ];

    protected $casts = [
        'unit_price' => 'float',
        'quantity' => 'integer',
        'requisition_id' => 'integer',
        'item_id' => 'integer'
    ];
}
