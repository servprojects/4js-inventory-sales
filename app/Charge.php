<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Charge extends Model
{
    protected $fillable = [
        'status',
        'transaction_id'
    ];
    protected $casts = [
        'transaction_id' => 'integer'
    ];
}
