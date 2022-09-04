<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class UpdateHistory extends Model
{
    protected $fillable = [
        'update_dateTime',
        'macaddress',
        'user_id',
        'update_through', 
        'report',
    ];
    protected $casts = [
        'user_id' => 'integer',
    ];
}
