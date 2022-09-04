<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Trans_item_backup extends Model
{
    protected $fillable = [
        'code',
        'items',
        'type',
        'trans_payable', 
        'credit_balance',
        'item_balances',
        'date_transac',
        'user_id'
    ];
    protected $casts = [
        'user_id' => 'integer',
    ];
}
