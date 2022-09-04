<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Employee extends Model
{
    protected $fillable = [
        
        'emp_id',
        'last_name',
        'first_name',
        'middle_name',
        'position_no',
        'contac_no',
        'start_work',
        'birthday',
        'address',
        'in_case_emerg',
        'rel_to_emp',
        'dept_id',
        'position_id',
        'rate_per_day',
        'rate_per_hour',
        'rate_per_hour_ot',
    ];
    protected $casts = [
        'dept_id' => 'integer',
        'position_id' => 'integer',
        'rate_per_day' => 'float',
        'rate_per_hour' => 'float',
        'rate_per_hour_ot' => 'float',
    ];
}
