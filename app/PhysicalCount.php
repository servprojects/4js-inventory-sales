<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class PhysicalCount extends Model
{

protected $fillable = [
    'branch_id',
    'date',
    'items',
    'syscount_date',
    'live_update',
    'description',
    'old_items'
    
];

protected $casts = [
    'branch_id' => 'integer',
    
];

}
