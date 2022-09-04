<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Item_count extends Model
{
    protected $fillable = [
        'item_id',
        'balance',
        'collectible_amount',
        'threshold',
        'branch_id',
        'begbal_created_at',
        'begbal_updated_at',
        'inv_date_update'
    ];

    protected $casts = [
        'item_id' => 'integer',
        'balance' => 'float',
        'collectible_amount' => 'float',
        'threshold' => 'float',
        'branch_id' => 'integer'
    ];
}
