<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class ReplacedItm extends Model
{
    protected $fillable = [
        'sale_code',
        'replace_code',
    ];
}
