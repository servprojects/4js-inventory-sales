<?php

namespace App;

use Illuminate\Database\Eloquent\Model;

class Transaction extends Model
{
    protected $fillable = [
        'transaction_type',
        'accountability',
        'discount',
        'user_id',
        'branch_id',
        'customer_id',
        'office_id',
        'code',
        'project_id',
        'supplier_id',
        'delivery_id',
        'requisition_id',
        'customer_name',
        'amount_received',
        'date_printed',
        'date_transac',
        'charge_status',
        'charge_transaction_code',
        'charge_paid_amount',
        'charge_status',
        'payable',
        'charge_payment_transac_id',
        'beg_charge_bal',
        'end_charge_bal',
        'date_paid',
        'receipt_code',
        'cheque_id',
        'return_code',
        'debit_code',
        'imported',
        'description',
        'last_update',
        'partof_cashflow',
        'series_no',
        'transaction_status',
        'latespecifics',
        'reset_no',
        'counter_no',
        'st_tin_num',
        'st_bus_type',
        'originated',
        'recordedOnline',
        'isPOSRelease',
        'isLocalImport',
        'ctrlno',
        'receiving_pos_branch',
        'created_at',
        'updated_at',
    ];
    

    protected $casts = [
        'discount' => 'float',
        'series_no' => 'integer',
        'receiving_pos_branch' => 'integer',
        'recordedOnline' => 'integer',
        'isPOSRelease' => 'integer',
        'isLocalImport' => 'integer',
        'reset_no' => 'integer',
        'user_id' => 'integer',
        'branch_id' => 'integer',
        'customer_id' => 'integer',
        'office_id' => 'integer',
        'project_id' => 'integer',
        'supplier_id' => 'integer',
        'cheque_id' => 'integer',
        'delivery_id' => 'integer',
        'requisition_id' => 'integer',
        'amount_received' => 'float',
        'payable' => 'float',
        'beg_charge_bal' => 'float',
        'end_charge_bal' => 'float',

    ];
}
