<?php

namespace App\Http\Controllers;

use App\ActivityLog;
use App\CashierCashflow;
use App\Remittance;
use App\Transaction;
use App\User;
use App\User_detail;
use Illuminate\Http\Request;
use DB;

class RemitController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request)
    {
        if (!$user = auth()->setRequest($request)->user()) {
            return $this->responseUnauthorized();
        }
        try {
            $activeUser =  User_detail::where('id', $user->user_details_id)->firstOrFail();

           
 
            
            $userdet =  User_detail:: join('users', 'user_details.id', '=', 'users.user_details_id')
            ->join('branches', 'user_details.branch_id', '=', 'branches.id');
            $userdet->select('user_details.*', 'branches.name as branch');
            if($activeUser->role == "Superadmin" || $activeUser->role == "Admin"){
                // $userdet->where('role', 'Cashier');
                $userdet->whereIn('user_details.role', ['Cashier', 'Admin', 'Superadmin']);
            }else{
                $userdet->where('user_details.id', $user->user_details_id);
            }
            $userdet->whereNull('users.disable');
            
            
            $userdet= $userdet->get();


        } catch (Exception $e) {
        }



        return response()->json([
            'status' => 200,
            'remitters' => $userdet,
              'hashuserId' => $user->hashid


        ], 200);
    }

    public function getTrans(Request $request)
    {
        if (!$user = auth()->setRequest($request)->user()) {
            return $this->responseUnauthorized();
        }
        try {
            $userdet =  User::where('user_details_id', request('id'))->firstOrFail();

        //     $avtiveUser =  User_detail::where('id', $user->user_details_id)->firstOrFail();



        //     $col4 =  Transaction::leftJoin('transaction_items', 'transactions.id', '=', 'transaction_items.transaction_id');
        //     // $col4->where('transactions.transaction_type', '=', request('type'));
        //     $col4->whereIn('transactions.transaction_type', ['Sale', 'Payment Charge', 'Excess Payment']);
        //     $col4->where('transactions.user_id', '=', $userdet->id);
        //     $col4->where('transactions.date_transac', '=', request('date'));
        //     $col4->select(
        //         'transactions.id as t_id',
        //         'transactions.accountability',
        //         'transactions.code',
        //         'transactions.payable',
        //         'transactions.customer_name as cust_name',
        //         DB::raw('COUNT(transaction_items.item_id) as total_items'),
        //         DB::raw('DATE(transactions.created_at) as date'),
        //         DB::raw('(CASE 
        //    WHEN transactions.transaction_type = "Sale" THEN "Direct Sale"
        //    ELSE transactions.transaction_type
        //    END) AS type',),
        //         DB::raw('TIME(transactions.created_at) AS time')

        //     );
        //     $col4->groupBy('transactions.id');
        //     $col4->orderBy('transactions.created_at', 'DESC');
        //     $all =  $col4->get();

        $all = CashierCashflow::leftJoin('transactions', 'cashier_cashflows.transaction_id', '=', 'transactions.id')
       
        ->where('cashier_cashflows.user_id', '=', $userdet->id)
   
        // ->whereDate('cashier_cashflows.created_at', '=', request('date'))
        ->whereDate('cashier_cashflows.trans_date', '=', request('date'))
        ->where('cashier_cashflows.status', '!=', 'deleted')
      
      
        ->select(
            'cashier_cashflows.id as t_id', 
            'cashier_cashflows.accountability', 
            'cashier_cashflows.type as trans_type', 
            'transactions.code', 
            'cashier_cashflows.amount as payable',
            'cashier_cashflows.status',
            'transactions.customer_name as cust_name',
            DB::raw('DATE(cashier_cashflows.trans_date) as date'),
            'cashier_cashflows.description as type',
            DB::raw('TIME(cashier_cashflows.trans_date) AS time')
             )
        ->get();



        } catch (Exception $e) {
        }
        // STOP HERE NO API



        return response()->json([
            'status' => 200,
            'transactions' => $all,
            'uid' => $userdet->id,
            'hashuserId' => $user->hashid


        ], 200);
    }

    public function getTransNoCF(Request $request)
    {
        if (!$user = auth()->setRequest($request)->user()) {
            return $this->responseUnauthorized();
        }
        try {
            $userdet =  User::where('user_details_id', request('id'))->firstOrFail();

        //     $avtiveUser =  User_detail::where('id', $user->user_details_id)->firstOrFail();



            $col4 =  Transaction::leftJoin('transaction_items', 'transactions.id', '=', 'transaction_items.transaction_id');
            // $col4->where('transactions.transaction_type', '=', request('type'));
            $col4->whereIn('transactions.transaction_type', ['Sale', 'Payment Charge', 'Excess Payment']);
            $col4->where('transactions.user_id', '=', $userdet->id);
            $col4->where('transactions.date_transac', '=', request('date'));
            $col4->select(
                'transactions.id as t_id',
                'transactions.accountability',
                'transactions.code',
                'transactions.payable',
                'transactions.customer_name as cust_name',
                DB::raw('COUNT(transaction_items.item_id) as total_items'),
                DB::raw('DATE(transactions.created_at) as date'),
                DB::raw('(CASE 
           WHEN transactions.transaction_type = "Sale" THEN "Direct Sale"
           ELSE transactions.transaction_type
           END) AS type',),
                DB::raw('TIME(transactions.created_at) AS time')

            );
            $col4->groupBy('transactions.id');
            $col4->orderBy('transactions.created_at', 'DESC');
            $all =  $col4->get();

            $initial = CashierCashflow::where('user_id', '=', $userdet->id)
            ->where('trans_date', '=', request("date"))
            ->where('description', '=', "Petty Cash")
            ->select(  DB::raw('SUM(amount) AS initial'))
            ->groupBy('user_id')
            ->get();

        // $all = CashierCashflow::leftJoin('transactions', 'cashier_cashflows.transaction_id', '=', 'transactions.id')
       
        // ->where('cashier_cashflows.user_id', '=', $userdet->id)
   
        // // ->whereDate('cashier_cashflows.created_at', '=', request('date'))
        // ->whereDate('cashier_cashflows.trans_date', '=', request('date'))
        // ->where('cashier_cashflows.status', '!=', 'deleted')
      
      
        // ->select(
        //     'cashier_cashflows.id as t_id', 
        //     'cashier_cashflows.accountability', 
        //     'cashier_cashflows.type as trans_type', 
        //     'transactions.code', 
        //     'cashier_cashflows.amount as payable',
        //     'cashier_cashflows.status',
        //     'transactions.customer_name as cust_name',
        //     DB::raw('DATE(cashier_cashflows.trans_date) as date'),
        //     'cashier_cashflows.description as type',
        //     DB::raw('TIME(cashier_cashflows.trans_date) AS time')
        //      )
        // ->get();



        } catch (Exception $e) {
        }
        // STOP HERE NO API



        return response()->json([
            'status' => 200,
            'transactions' => $all,
            'uid' => $userdet->id,
            'initial' => $initial,


        ], 200);
    }


    public function getTransNoCF_Accu(Request $request)
    {
        if (!$user = auth()->setRequest($request)->user()) {
            return $this->responseUnauthorized();
        }
        try {
            // $userdet =  User::where('user_details_id', request('id'))->firstOrFail();

        //     $avtiveUser =  User_detail::where('id', $user->user_details_id)->firstOrFail();



            $col4 =  Transaction::leftJoin('transaction_items', 'transactions.id', '=', 'transaction_items.transaction_id');
            // $col4->where('transactions.transaction_type', '=', request('type'));
            $col4->join('users', 'transactions.user_id', '=', 'users.id');
            $col4->join('user_details', 'users.user_details_id', '=', 'user_details.id');
            $col4->whereIn('transactions.transaction_type', ['Sale', 'Payment Charge', 'Excess Payment']);
            $col4->where('transactions.date_transac', '=', request('date'));
            $col4->where('transactions.branch_id', '=', request('branch_id'));
            $col4->select(
                'transactions.id as t_id',
                'transactions.accountability',
                'transactions.code',
                'transactions.payable',
                'transactions.customer_name as cust_name',
                DB::raw('COUNT(transaction_items.item_id) as total_items'),
                DB::raw('DATE(transactions.created_at) as date'),
                DB::raw('(CASE 
           WHEN transactions.transaction_type = "Sale" THEN "Direct Sale"
           ELSE transactions.transaction_type
           END) AS type',),
                DB::raw('TIME(transactions.created_at) AS time'),
                'user_details.first_name as remitter'
            );
            $col4->groupBy('transactions.id');
            $col4->orderBy('transactions.created_at', 'DESC');
            $all =  $col4->get();

            $initial = CashierCashflow::join('users', 'cashier_cashflows.user_id', '=', 'users.id')
            ->join('user_details', 'users.user_details_id', '=', 'user_details.id')
            ->where('cashier_cashflows.trans_date', '=', request("date"))
            ->where('cashier_cashflows.description', '=', "Petty Cash")
            ->where('user_details.branch_id', '=', request('branch_id'))
            ->select(  DB::raw('SUM(cashier_cashflows.amount) AS initial'))
            ->groupBy('cashier_cashflows.trans_date')
            ->get();
           

        // $all = CashierCashflow::leftJoin('transactions', 'cashier_cashflows.transaction_id', '=', 'transactions.id')
       
        // ->where('cashier_cashflows.user_id', '=', $userdet->id)
   
        // // ->whereDate('cashier_cashflows.created_at', '=', request('date'))
        // ->whereDate('cashier_cashflows.trans_date', '=', request('date'))
        // ->where('cashier_cashflows.status', '!=', 'deleted')
      
      
        // ->select(
        //     'cashier_cashflows.id as t_id', 
        //     'cashier_cashflows.accountability', 
        //     'cashier_cashflows.type as trans_type', 
        //     'transactions.code', 
        //     'cashier_cashflows.amount as payable',
        //     'cashier_cashflows.status',
        //     'transactions.customer_name as cust_name',
        //     DB::raw('DATE(cashier_cashflows.trans_date) as date'),
        //     'cashier_cashflows.description as type',
        //     DB::raw('TIME(cashier_cashflows.trans_date) AS time')
        //      )
        // ->get();



        } catch (Exception $e) {
        }
        // STOP HERE NO API



        return response()->json([
            'status' => 200,
            'transactions' => $all,
            'initial' => $initial,
            // 'initial' => $initial,
            // 'uid' => $userdet->id,


        ], 200);
    }
    /**
     * Show the form for creating a new resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function create()
    {
        //
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        if (!$user = auth()->setRequest($request)->user()) {
            return $this->responseUnauthorized();
        }
        try {
            $userdet =  User_detail::where('id', request('remitter_id'))->firstOrFail();

            Remittance::create([
                'date' => request('date'),
                'remark' => request('remark'),
                'remitter_id' => request('remitter_id'),
                'branch_id' => $userdet->branch_id,
                'amount_remitted' => request('amount_remitted'),
                'sys_amount' => request('sys_amount'),
                
            ]);

        } catch (Exception $e) {
        }
        // STOP HERE NO API



        return response()->json([
            'status' => 200,
            // 'transactions' => $all,
            // 'uid' => $userdet->id,


        ], 200);
    }

    public function updateRemit(Request $request)
    {
        // Get user from $request token.
        if (! $user = auth()->setRequest($request)->user()) {
            return $this->responseUnauthorized();
        }

       

        try {
            $remitold = Remittance::join('user_details', 'remittances.remitter_id', '=', 'user_details.id')
            ->where('remittances.id', request('id'))
            ->select(
                'remittances.*',
                DB::raw('CONCAT(user_details.first_name," " , user_details.last_name) as remitter'))
            ->get();
            $remit = Remittance::where('id', request('id'))->firstOrFail();

            $act = ActivityLog::create([
                'user_id' => $user->id,
                'type' => "Remittance Update",
                'description' => $remitold, // store previous data
                'code' => $remit->id,
                'reason' => request("reason")
            ]);

           
            
            if(request('remark')){
                $remit->remark = request('remark');
            }
            if(request('amt')){
                $remit->amount_remitted = request('amt');
            }
           
            $remit->save();

           
            // return $this->responseResourceUpdated();
            return response()->json([
                'status' => 200,
                'message' => 'Update successful',
              
            ], 200);

        } catch (Exception $e) {
            return $this->responseServerError('Error updating resource.');
        }
    }

    /**
     * Display the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function edit($id)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
        //
    }
}
