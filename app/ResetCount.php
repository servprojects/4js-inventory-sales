<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class ResetCount extends Model
{
    protected $fillable = [
        'type',
        'count',
    ];

    protected $casts = [
        'count' => 'integer',
    ];
}

