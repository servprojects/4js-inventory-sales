<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Requisition extends Model
{
    protected $fillable = [
        'urgency_status',
        'estimated_receiving_date',
        'request_status',
        'type',
        'user_id',
        'code',
        'branch_id',
        'request_to'
    ];

    protected $casts = [
        'user_id' => 'integer',
        'request_to' => 'integer',
        'branch_id' => 'integer'
    ];
}
