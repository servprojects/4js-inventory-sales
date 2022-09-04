<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Item_category extends Model
{
    protected $fillable = [
        'id',
        'name'
    ];
    protected $casts = [
        'id' => 'integer'
    ];
    
}
