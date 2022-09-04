<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class SystemMode extends Model
{
    protected $fillable = [
        'environment',
        'mode',
    ];
}