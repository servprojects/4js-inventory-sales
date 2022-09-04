<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class User_detail extends Model
{
    protected $fillable = [
        'first_name',
        'middle_name',
        'last_name',
        'branch_id',
        'position_id',
        'role',
        'contact_no',
        'address',
        'enable_cashflow'
    ];

    protected $casts = [
        'branch_id' => 'integer',
        'position_id' => 'integer'
    ];
}
