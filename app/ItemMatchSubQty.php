<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class ItemMatchSubQty extends Model
{
    protected $fillable = [
        'match_item_id',
        'item_id',
    ];

    protected $casts = [
        'match_item_id' => 'integer',
        'item_id' => 'integer',
    ];
}
