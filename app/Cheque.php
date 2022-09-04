<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Cheque extends Model
{
    protected $fillable = [
        'code',
        'bank',
        'date',
        'payee',
        'supplier_id',
        'amount',
        'status',
    ];
    protected $casts = [
        'supplier_id' => 'integer',
        'amount' => 'float',
    ];
}
