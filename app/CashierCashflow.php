<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class CashierCashflow extends Model
{
    protected $fillable = [
        'trans_date',
        'type',
        'accountability',
        'amount',
        'beg_cash',
        'end_cash',
        'description',
        'user_id',
        'transaction_id',
        'status',
        'temp_status',
        'actual_date'
    ];
    protected $casts = [
        'amount' => 'float',
        'beg_cash' => 'float',
        'end_cash' => 'float',
        'user_id' => 'integer',
        'transaction_id' => 'integer'
    ];

}
