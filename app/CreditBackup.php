<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class CreditBackup extends Model
{
    protected $fillable = [
        'transaction',
        'items',
        'description',
        'supplier_id',
    ];

    protected $casts = [
        'supplier_id' => 'integer',
    ];
}
