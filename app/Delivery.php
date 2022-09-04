<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Delivery extends Model
{
    protected $fillable = [
        'name',
        'address',
        'contact',
        'delivery_fee'
    ];
    protected $casts = [
        'delivery_fee' => 'float'
    ];
}
