<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use App\Http\Controllers\APIController;
use App\Requisition;
use App\Requisition_item;
use App\User_detail;
use App\Transaction;
use App\Transaction_item;
use App\Item;
use App\Item_count;
use App\Unit;
use App\Branch;
use App\Cheque;
use App\Project;
use App\Customer;
use App\Delivery;
use App\Supplier;
use App\User;
use DB;

class DashboardController extends Controller
{
    public function directsales(Request $request)
    {
        if (!$user = auth()->setRequest($request)->user()) {
            return $this->responseUnauthorized();
        }
        try {


            $userdet =  User_detail::where('id', $user->user_details_id)->firstOrFail();  // get branch

            $directsales = transaction_item::join('transactions', 'transaction_items.transaction_id', '=', 'transactions.id')
                ->where('transactions.transaction_type', '=',  "Sale")
                ->where('transactions.branch_id', '=',  $userdet->branch_id)
                ->select(DB::raw('(transaction_items.quantity * transaction_items.unit_price) as ds_subtotal'))
                ->get();

            $itemcollect =  Item::join('item_counts', 'items.id', '=', 'item_counts.item_id')
                ->where('item_counts.branch_id', '=', $userdet->branch_id)
                ->select('items.*', 'items.name as item', 'item_counts.balance', 'item_counts.collectible_amount')
                ->get();
            //    ----------------------------------

            $directsales = Transaction_item::join('transactions', 'transaction_items.transaction_id', '=', 'transactions.id')
                ->where('transactions.transaction_type', '=',  "Sale")
                ->where('transactions.branch_id', '=',  $userdet->branch_id)
                ->select(DB::raw('(transaction_items.quantity * transaction_items.unit_price) as ds_subtotal'))
                ->get();

            $custcharge = Transaction_item::join('transactions', 'transaction_items.transaction_id', '=', 'transactions.id')
                ->where('transactions.transaction_type', '=',  "Charge")
                ->where('transactions.accountability', '=',  "Customer")
                ->where('transactions.charge_status', '=',  "Unpaid")
                ->where('transactions.branch_id', '=',  $userdet->branch_id)
                ->select(DB::raw('(transaction_items.quantity * transaction_items.unit_price) as cc_subtotal'))
                ->get();


            $itemcollect =  Item::join('item_counts', 'items.id', '=', 'item_counts.item_id')
                ->where('item_counts.branch_id', '=', $userdet->branch_id)
                ->select('items.*', 'items.name as item', 'item_counts.balance', 'item_counts.collectible_amount')
                ->get();

            $offcollect =  Branch::select('branches.*')
                ->get();

            $projects =  Project::select('projects.*')
                ->get();

            $supplier =  Supplier::select('suppliers.*')
                ->get();

            // datediff(created_at, now())
            // "DATEDIFF(2020-09-26,cheques.date)AS days"
            $curd = date("Y-m-d");
            $cheques =  Cheque::join('suppliers', 'cheques.supplier_id', '=', 'suppliers.id')
                ->select('cheques.*', 'suppliers.name as supplier', DB::raw("datediff(cheques.date, now()) as days"))
                ->orderBy('cheques.date', 'DESC')
                ->orderBy('cheques.created_at', 'DESC')
                ->get();
        } catch (Exception $e) {
        }

        // ----------------------------------


        return response()->json([
            // 'status' => 200,
            // 'directsales' => $directsales,
            // 'itemcollect' => $itemcollect,
            'status' => 200,
            'directsales' => $directsales,
            'itemcollect' => $itemcollect,
            'custcharge' => $custcharge,
            'colprojects' => $projects,
            'offcollect' => $offcollect,
            'paysups' => $supplier,
            'cheques' => $cheques,
            'role' =>  $userdet->role,


        ], 200);
    }

    // REAL
    public function dashall(Request $request)
    {
        if (!$user = auth()->setRequest($request)->user()) {
            return $this->responseUnauthorized();
        }
        try {


            $userdet =  User_detail::where('id', $user->user_details_id)->firstOrFail();  // get branch

            // $directsales = transaction_item::join('transactions', 'transaction_items.transaction_id', '=', 'transactions.id')
            //     ->where('transactions.transaction_type', '=',  "Sale")
            //     ->where('transactions.branch_id', '=',  $userdet->branch_id)
            //     ->select(DB::raw('(transaction_items.quantity * transaction_items.unit_price) as ds_subtotal'))
            //     ->get();

            $itemcollect =  Item::join('item_counts', 'items.id', '=', 'item_counts.item_id');
            if ($userdet->role != "Superadmin") {
                $itemcollect->where('item_counts.branch_id', '=', $userdet->branch_id);
            } else if (request('branch_id')) {

                $itemcollect->where('item_counts.branch_id', '=', request('branch_id'));
            }
            $itemcollect->select('items.*', 'items.name as item', 'item_counts.balance', 'item_counts.collectible_amount');
            $itemcollect = $itemcollect->get();

            $allitemcollect = 0;
            foreach ($itemcollect as $itm) {
                $allitemcollect += $itm['collectible_amount'];
            }

            // $directsales = Transaction_item::join('transactions', 'transaction_items.transaction_id', '=', 'transactions.id');
            // $directsales->where('transactions.transaction_type', '=',  "Sale");
            // if ($userdet->role != "Superadmin") {
            //     $directsales->where('transactions.branch_id', '=',  $userdet->branch_id);
            // } else if (request('branch_id')) {

            //     $directsales->where('transactions.branch_id', '=', request('branch_id'));
            // }
            // $directsales->select(
            //     'transactions.branch_id',
            //     'transactions.id',
            //     DB::raw('(transaction_items.quantity * transaction_items.unit_price) as ds_subtotal')
            // );
            // $directsales = $directsales->get();


            $directsales = Transaction::whereIn('transactions.transaction_type', ['Sale', 'Excess Payment']);
            if ($userdet->role != "Superadmin") {
                $directsales->where('transactions.branch_id', '=',  $userdet->branch_id);
            } else if (request('branch_id')) {

                $directsales->where('transactions.branch_id', '=', request('branch_id'));
            }
            $directsales->select(
                'transactions.branch_id',
                'transactions.id',
                DB::raw('SUM(transactions.payable) as total')
            );
            $directsales = $directsales->get();

            $alldr = $directsales[0]->total;
            

            // $alldr = 0;
            // foreach ($directsales as $itm) {
            //     $alldr += $itm['ds_subtotal'];
            // }






            // $custcharge = Transaction_item::join('transactions', 'transaction_items.transaction_id', '=', 'transactions.id');
            // $custcharge->where('transactions.transaction_type', '=',  "Charge");
            // $custcharge->where('transactions.accountability', '=',  "Customer");
            // $custcharge->where('transactions.charge_status', '=',  "Unpaid");
            // if ($userdet->role != "Superadmin") {
            //     $custcharge->where('transactions.branch_id', '=',  $userdet->branch_id);
            // } else if (request('branch_id')) {

            //     $custcharge->where('transactions.branch_id', '=', request('branch_id'));
            // }
            // $custcharge->select(DB::raw('(transaction_items.quantity * transaction_items.unit_price) as cc_subtotal'));
            // $custcharge = $custcharge->get();

            // $allcustcharge = 0;
            // foreach ($custcharge as $itm) {
            //     $allcustcharge += $itm['cc_subtotal'];
            // }



            // $itemcollect =  Item::join('item_counts', 'items.id', '=', 'item_counts.item_id')
            //     ->where('item_counts.branch_id', '=', $userdet->branch_id)
            //     ->select('items.*', 'items.name as item', 'item_counts.balance', 'item_counts.collectible_amount')
            //     ->get();

            $offcollect =  Branch::select('branches.*')
                ->get();

            $alloffcharge = 0;
            foreach ($offcollect as $itm) {
                $alloffcharge += $itm['balance'];
            }


            $projects =  Project::select('projects.*')
                ->get();

            $allprojcharge = 0;
            foreach ($projects as $itm) {
                $allprojcharge += $itm['balance'];
            }

            $supplier =  Supplier::select('suppliers.*')
                ->get();
            $allpccharge = 0;
            foreach ($supplier as $itm) {
                $allpccharge += $itm['balance'];
            }

            $customer =  Customer::select('customers.charge_balance')
                ->get();
            $allcustcharge = 0;
            foreach ($customer as $itm) {
                $allcustcharge += $itm['charge_balance'];
            }



            // datediff(created_at, now())
            // "DATEDIFF(2020-09-26,cheques.date)AS days"
            $curd = date("Y-m-d");
            $cheques =  Cheque::join('suppliers', 'cheques.supplier_id', '=', 'suppliers.id')
                ->select('cheques.*', 'suppliers.name as supplier', DB::raw("datediff(cheques.date, now()) AS days"))
                ->whereRaw('datediff(cheques.date, now()) <= ?', [5])
                // ->whereRaw('datediff(cheques.date, now()) >= 1')
                ->whereNull('cheques.status')
                ->orderBy('cheques.date', 'DESC')
                ->orderBy('cheques.created_at', 'DESC')
                ->get();

            $year = date("Y");
            if (request('year')) {
                $year = request('year');
            }

            // $ds = Transaction::where('transactions.transaction_type', '=',  'Sale');
            $ds = Transaction::whereIn('transactions.transaction_type', ['Sale', 'Charge', 'Excess Payment']);
            $ds->leftJoin('requisitions', 'transactions.requisition_id', '=', 'requisitions.id');
            $ds->leftJoin('transactions as ct', 'transactions.code', '=', 'ct.charge_transaction_code');
            $ds->leftJoin('deliveries', 'transactions.delivery_id', '=', 'deliveries.id');
            if ($userdet->role != "Superadmin") {
                $ds->where('transactions.branch_id', '=',  $userdet->branch_id);
            } else if (request('branch_id')) {

                $ds->where('transactions.branch_id', '=',  request('branch_id'));
            }
            $ds->whereYear('transactions.date_transac', '=', $year);
            $ds->select(
                DB::raw('MONTHNAME(transactions.date_transac) as month'),
                DB::raw('SUM(transactions.payable) as total'),
                DB::raw('SUM( CASE WHEN transactions.discount is null THEN 0 ELSE transactions.discount END) as discount'),
                DB::raw('SUM(CASE WHEN deliveries.delivery_fee is null THEN 0 ELSE deliveries.delivery_fee END) as delivery'),
                DB::raw('
                
                ( 
                    SUM(transactions.payable)  +
                    SUM(CASE WHEN transactions.discount is null THEN 0 ELSE transactions.discount END) - 
                    SUM(CASE WHEN deliveries.delivery_fee is null THEN 0 ELSE deliveries.delivery_fee END)
                 
                 ) as raw_sales'),
                DB::raw('MONTH(transactions.date_transac) as monthnum'),
            );
            $ds->groupBy('month');
            $ds->orderBy('monthnum');
            $dsets =  $ds->get();


            // $ds->select(
            //     DB::raw('MONTHNAME(transactions.date_transac) as month'),
            //     DB::raw('SUM(transactions.payable) as total'),
            //     DB::raw('SUM(transactions.discount) as discount'),
            //     DB::raw('SUM(deliveries.delivery_fee) as delivery'),
            //     // DB::raw('SUM((SUM(transactions.payable) + SUM(transactions.discount))-SUM(deliveries.delivery_fee)) as raw_sales'),
            //     DB::raw('( SUM(transactions.payable) + SUM(transactions.discount)
            //      - SUM(deliveries.delivery_fee)) as raw_sales'),
            //     DB::raw('MONTH(transactions.date_transac) as monthnum'),
            // );


            $bitemcol = Item_count::join('branches', 'item_counts.branch_id', '=', 'branches.id');
            $bitemcol->select('branches.name as branch',  DB::raw('SUM(item_counts.collectible_amount) as total'));
            $bitemcol->groupBy('branches.id');
            $bitemcol =  $bitemcol->get();

        } catch (Exception $e) {
        }




        return response()->json([
            // 'status' => 200,
            // 'directsales' => $directsales,
            // 'itemcollect' => $itemcollect,
            'status' => 200,
            'itemcollect' => $allitemcollect,
            'allitemcollect' => $bitemcol,
            'directsales' => $alldr,
            // 'directsales' => $directsales,
            // 'itemcollect' => $itemcollect,

            // 'custcharge' => $custcharge,
            'custcharge' => $allcustcharge,
            // 'colprojects' => $projects,
            'colprojects' => $allprojcharge,
            'offcollect' => $offcollect,

            // 'paysups' => $supplier,
            'paysups' => $allpccharge,
            'cheques' => $cheques,
            'role' =>  $userdet->role,
            'datasets' => $dsets,

        ], 200);
    }
}
