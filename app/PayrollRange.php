<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class PayrollRange extends Model
{
    protected $fillable = [
        'normal',
        'ot',
        'payroll_id',
        'date',
    ];

    protected $casts = [
        'normal' => 'float',
        'ot' => 'float',
        'payroll_id' => 'integer',
        
    ];
}
