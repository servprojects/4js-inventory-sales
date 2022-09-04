<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Notification extends Model
{
    protected $fillable = [
        'type',
        'notif_for_user',
        'notif_for_branch',
        'description',
        'requisition_code',
        'created_by_user_id',
        'route',
        'mark_as',

    ];
    protected $casts = [
        'created_by_user_id' => 'integer',
    ];
}
