<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Project extends Model
{
    protected $fillable = [
        'name',
        'project_desc',
        'balance',
        'location'
    ];
    protected $casts = [
        'balance' => 'float',
        
    ];
}
