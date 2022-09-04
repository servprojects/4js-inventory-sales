<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Transaction_item extends Model
{
    protected $fillable = [
        'quantity',
        'unit_price',
        'beg_balance',
        'end_balance',
        'original_price',
        'old_original_price',
        'item_id',
        'item_status',
        'supplier_id',
        'transaction_id',
        'date_received',
        'beg_collectible',
        'end_collectible',
        'charge_status',
        'return_transacitem_id',
        'beg_def_bal',
        'end_def_bal',
        'old_transaction_id',
        'replace_date',
        'delete_date',
        'debit',
        'created_at',
        'updated_at',


    ];

    protected $casts = [
        'quantity' => 'float',
        'unit_price' => 'float',
        'beg_balance' => 'float',
        'end_balance' => 'float',
        'original_price' => 'float',
        'old_original_price' => 'float',
        'beg_collectible' => 'float',
        'end_collectible' => 'float',
        'beg_def_bal' => 'float',
        'end_def_bal' => 'float',
        'item_id' => 'integer',
        'supplier_id' => 'integer',
        'transaction_id' => 'integer',
        'old_transaction_id' => 'integer',
        'return_transacitem_id' => 'integer',
    ];
}
