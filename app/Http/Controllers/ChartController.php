<?php

namespace App\Http\Controllers;

use App\Transaction;
use App\User_detail;
use Illuminate\Http\Request;
use DB;

class ChartController extends Controller
{
    public function saleschart(Request $request)
    {
        // Get user from $request token.
        if (!$user = auth()->setRequest($request)->user()) {
            return $this->responseUnauthorized();
        }

        try {
            $userdet = User_detail::where('id', $user->user_details_id)->firstOrFail();
            $year = date("Y");

            if(request('year')){
                $year = request('year');
            }
            // $dsets = [];
            // if($userdet->role == "Superadmin" || $userdet->role == "Admin" ){
            $ds = Transaction::where('transactions.transaction_type', '=',  'Sale');
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
            // }



            return response()->json([
                'status' => 201,
                'message' => 'Resource created.',
                'datasets' => $dsets,
                'branch' => $userdet->branch_id,
                'role' => $userdet->role,

            ], 201);
        } catch (Exception $e) {
            return $this->responseServerError('Error creating resource.');
        }
    }
}
