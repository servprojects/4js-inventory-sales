<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Remittance extends Model
{
    protected $fillable = [
        'date',
        'remark',
        'remitter_id',
        'amount_remitted',
        'sys_amount',
        'branch_id'
    ];
    protected $casts = [
        'remitter_id' => 'integer',
        'branch_id' => 'integer',
        'amount_remitted' => 'float',
        'sys_amount' => 'float',
    ];
}
