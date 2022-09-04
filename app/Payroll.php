<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Payroll extends Model
{
    protected $fillable = [
        'cash_ad',
        'deduction',
        'incentive',
        'rate_per_hour',
        'rate_per_hour_ot',
        'emp_id',
        'beg_date',
        'end_date'
    ];

    protected $casts = [
        'cash_ad' => 'float',
        'deduction' => 'float',
        'incentive' => 'float',
        'rate_per_hour' => 'float',
        'rate_per_hour_ot' => 'float',
        'emp_id' => 'integer'
    ];
}
