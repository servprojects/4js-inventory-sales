<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Item extends Model
{
    protected $fillable = [
        'id',
        'name',
        'brand_id',
        'size',
        'category_id',
        'original_price',
        'unit_price',
        'code',
        'id_no',
        'isDisabled',
        'unit'
    ];

    protected $casts = [
        'id' => 'integer',
        'brand_id' => 'integer',
        'category_id' => 'integer',
        'isDisabled' => 'integer',
        'original_price' => 'float',
        'unit_price' => 'float'
    ];
}
