<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Customer extends Model
{
    protected $fillable = [
        'charge_balance',
        'user_details_id'
    ];

    protected $casts = [
        'charge_balance' => 'float',
        'user_details_id' => 'integer'
    ];
}
