<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Brand extends Model
{
    protected $fillable = [
        'id',
        'name'
    ];
    protected $casts = [
        'id' => 'integer'
    ];
}
