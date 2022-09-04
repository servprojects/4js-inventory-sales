<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class ActivityLog extends Model
{
    protected $fillable = [
        'user_id',
        'type',
        'description',
        'reason',
        'code'
    ];

    protected $casts = [
        'user_id' => 'integer',
    ];
}
