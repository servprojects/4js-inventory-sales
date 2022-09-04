<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class CashonhandBackup extends Model
{
    protected $fillable = [
        'coh_id',
        'item',
        'description',
    ];
    protected $casts = [
        'coh_id' => 'integer',
    ];

}
