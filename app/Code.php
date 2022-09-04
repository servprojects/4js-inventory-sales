<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Code extends Model
{
    protected $fillable = [
        'code',
        'transaction_items_id',
    ];

    protected $casts = [
        'transaction_items_id' => 'integer',
    ];
}
