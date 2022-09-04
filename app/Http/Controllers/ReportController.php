<?php

namespace App\Http\Controllers;

use App\ActivityLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use App\Http\Controllers\APIController;
use App\Requisition;
use App\Requisition_item;
use App\User_detail;
use App\Item;
use App\Item_count;
use App\Unit;
use App\Branch;
use App\CreditBackup;
use App\Transaction;
use App\Customer;
use App\DebitedItm;
use App\Project;
use App\Remittance;
use App\ReturnedItm;
use App\Supplier;
use App\Trans_item_backup;
use App\Transaction_item;
use DB;
use Mockery\Undefined;
use SebastianBergmann\Type\VoidType;
use Symfony\Component\Console\Input\Input;

class ReportController extends Controller
{
    public function received(Request $request)
    {
        if (!$user = auth()->setRequest($request)->user()) {
            return $this->responseUnauthorized();
        }

        try {

            $transaction = Transaction::select('transactions.*');
            $transaction = $transaction->latest()->paginate();

            // get branch
            $userdet =  User_detail::where('id', $user->user_details_id)->firstOrFail();


            $col4 =  Transaction_item::join('transactions', 'transaction_items.transaction_id', '=', 'transactions.id');
            $col4->join('items', 'transaction_items.item_id', '=', 'items.id');
            $col4->join('branches', 'transactions.branch_id', '=', 'branches.id'); //filt_branch
            $col4->leftJoin('requisitions', 'requisitions.id', '=', 'transactions.requisition_id');
            if ($userdet->role != "Superadmin") {
                $col4->where('transactions.branch_id', '=', $userdet->branch_id);
            } else if (request('branch_id')) {
                $col4->where('transactions.branch_id', '=', request('branch_id'));
            }
            $col4->where('transactions.transaction_type', '=', "Receiving");
            $col4->select(
                'branches.name as branch', //filt_branch
                'transactions.id as t_id',
                'transaction_items.transaction_id as transId',
                'transactions.code',
                'transactions.requisition_id as transac_req',
                DB::raw('COUNT(transaction_items.item_id) as total_items'),
                DB::raw('DATE(transactions.date_transac) as date'),
                // DB::raw('DATE(transactions.created_at) as date'),
                DB::raw('(CASE 
           WHEN transactions.requisition_id is null THEN "No request"
           WHEN transactions.requisition_id = transactions.requisition_id THEN requisitions.type
           END) AS receiving_type',),
            );
            $col4->groupBy('transaction_items.transaction_id');
            // $col4->orderBy('transactions.created_at', 'DESC');
            $col4->orderBy('transactions.date_transac', 'DESC');
            $col4->orderBy('transactions.id', 'DESC');
            $col4 = $col4->get();
            $branches = Branch::select('branches.*')->get(); //filt_branch
        } catch (Exception $e) {
        }



        return response()->json([
            'status' => 200,
            'transaction' => $col4,
            'branches' => $branches, //filt_branch
            'role' => $userdet->role, //filt_branch
        ], 200);
    }

    public function checkCredit(Request $request)
    {
        if (!$user = auth()->setRequest($request)->user()) {
            return $this->responseUnauthorized();
        }

        try {

            $trans =  Transaction::where('id', request('id'))->firstOrFail();

            $creditTrans =  Transaction::where('charge_transaction_code', $trans->code)
                ->where('transaction_type', '=', 'Credit')->first();


            if (is_null($creditTrans)) {
                $existC = "no";
            } else {
                $existC = "yes";
            }
        } catch (Exception $e) {
        }

        return response()->json([
            'status' => 200,
            'exist_credit' => $existC,
        ], 200);
    }

    public function deletedCredits(Request $request)
    {
        if (!$user = auth()->setRequest($request)->user()) {
            return $this->responseUnauthorized();
        }

        try {

            $trans =  CreditBackup::where('supplier_id', request('id'))->get();
        } catch (Exception $e) {
        }

        return response()->json([
            'status' => 200,
            'trans' => $trans,

        ], 200);
    }

    public function deletedRecTrans(Request $request)
    {
        if (!$user = auth()->setRequest($request)->user()) {
            return $this->responseUnauthorized();
        }

        try {

            $trans =  Transaction_item::join('transactions', 'transaction_items.old_transaction_id', '=', 'transactions.id')
                ->join('items', 'transaction_items.item_id', '=', 'items.id')
                ->leftJoin('suppliers', 'transaction_items.supplier_id', '=', 'suppliers.id')
                ->where('transaction_items.old_transaction_id', request('id'))
                ->where('transaction_items.item_status', "Removed")
                ->select(
                    'transaction_items.*',
                    'items.name as item_name',
                    'suppliers.name as supplier',
                    'transaction_items.end_balance as end_bal',
                    'transactions.charge_transaction_code'
                    //  DB::raw('( transaction_items.beg_balance - transaction_items.quantity) as end_bal')

                )
                ->get();
        } catch (Exception $e) {
        }

        return response()->json([
            'status' => 200,
            'trans' => $trans,
            'id' => request('id'),

        ], 200);
    }




    public function stockrep(Request $request)
    {
        if (!$user = auth()->setRequest($request)->user()) {
            return $this->responseUnauthorized();
        }

        try {
            // get branch
            $userdet =  User_detail::where('id', $user->user_details_id)->firstOrFail();
            // $someVariable = Input::get("some_variable");
            // $results = DB::select( DB::raw("SELECT * FROM some_table WHERE some_col = :somevariable"), array(
            //     'somevariable' => $someVariable,
            //   ));
            // $someVariable = (transactions.branch_id);

            // if ($userdet->role == "Superadmin") {
            //     $branch = null;
            // } else {
            //     $branch = $userdet->branch_id;
            // }

            // if (request('branch') == 'all') {
            //     $branch = null;
            // } else if (request('role') != 'Superadmin') {
            //     $branch = request('branch');
            // } else {
            //     $branch = null;
            // }

            // get current month

            // $tday = ($day == "") ? "01" : $day;
            // $tmonth = ($month == "") ? date("m") : $month;
            // $tyear = ($year == "") ? date("Y") : $year;
            // $month_sd = date("Y-m-d", strtotime($tmonth . '/' . $tday . '/' . $tyear . ' 00:00:00'));
            // $month_ed = date("Y-m-d", strtotime('-1 second', strtotime('+1 month', strtotime($tmonth . '/' . $tday . '/' . $tyear . ' 00:00:00'))));
            // return "Month range from $month_sd to $month_ed ";

            $tday = "01";
            $tmonth = date("m");
            $tyear = date("Y");
            $month_sd = date("Y-m-d", strtotime($tmonth . '/' . $tday . '/' . $tyear . ' 00:00:00'));
            $month_ed = date("Y-m-d", strtotime('-1 second', strtotime('+1 month', strtotime($tmonth . '/' . $tday . '/' . $tyear . ' 00:00:00'))));


            $start_date = $month_sd;
            $end_date =  $month_ed;

            //  $start_date = strval($month_sd);
            // $end_date =  strval($month_ed);


            if (request('start_date') && request('end_date')) {
                $start_date = request('start_date');
                $end_date =  request('end_date');
            }

            $initial = "
                select 
                v.item_id,
                items.code,
                items.name,
                items.size,
                items.unit,
                v.unit_price,
                min(case when seqnum_asc = 1 then v.end_balance end)as first_end_bal,
                min(case when seqnum_desc = 1 then v.end_balance end)as last_end_bal,
                min(case when seqnum_asc = 1 then v.end_balance end) -   min(case when seqnum_desc = 1 then v.end_balance end)as unit_sold,
                min(case when seqnum_asc = 1 then v.end_balance end) * v.unit_price as total_unit_price,
                v.unit_price * (min(case when seqnum_asc = 1 then v.end_balance end) -   min(case when seqnum_desc = 1 then v.end_balance end)) as total_unit_price_sold,
                v.unit_price *  min(case when seqnum_desc = 1 then v.end_balance end) as collectible

                from (select v.*,
                    row_number() over (partition by item_id order by created_at desc) as seqnum_desc,
                        row_number() over (partition by item_id order by created_at asc) as seqnum_asc
                from transaction_items v   INNER JOIN transactions ON v.transaction_id = transactions.id ";

            // $branchF = "&& transactions.branch_id = '$branch'";

            $branchFilter = "  ";

            if ($userdet->role == "Superadmin") {
                $branchFilter = " ";
                if (request('branch')) {
                    $branch = request('branch');
                    $branchFilter = "&& transactions.branch_id = '$branch'";
                }
            } else {
                $branchFilter = "&& transactions.branch_id = '$userdet->branch_id'";
            }

            $results = DB::select(
                DB::raw("" . $initial . "

                    WHERE  
                      
                        transactions.date_transac >= '$start_date' && 
                        transactions.date_transac <= '$end_date'  
                         " . $branchFilter .  " 
                        
                 
                    ) v
               INNER JOIN  items ON v.item_id = items.id 
            group by v.item_id
                  ")
            );


            // $results = DB::select(
            //     DB::raw("

            //       select 
            //       v.item_id,
            //       items.code,
            //       items.name,
            //       items.size,
            //       items.unit,
            //       v.unit_price,
            //       min(case when seqnum_asc = 1 then v.end_balance end)as first_end_bal,
            //       min(case when seqnum_desc = 1 then v.end_balance end)as last_end_bal,
            //       min(case when seqnum_asc = 1 then v.end_balance end) -   min(case when seqnum_desc = 1 then v.end_balance end)as unit_sold,
            //       min(case when seqnum_asc = 1 then v.end_balance end) * v.unit_price as total_unit_price,
            //       v.unit_price * (min(case when seqnum_asc = 1 then v.end_balance end) -   min(case when seqnum_desc = 1 then v.end_balance end)) as total_unit_price_sold,
            //       v.unit_price *  min(case when seqnum_desc = 1 then v.end_balance end) as collectible

            // from (select v.*,
            //              row_number() over (partition by item_id order by created_at desc) as seqnum_desc,
            //                row_number() over (partition by item_id order by created_at asc) as seqnum_asc
            //       from transaction_items v   INNER JOIN transactions ON v.transaction_id = transactions.id 
            //         WHERE  
            //             transactions.date_transac >= '$start_date' && 
            //             transactions.date_transac <= '$end_date' && 
            //              " .


            //         ((request('branch') && !is_null($branch)) ? "transactions.branch_id = '$branch'" : "transactions.branch_id = transactions.branch_id")
            //         .

            //         " ) v
            //    INNER JOIN  items ON v.item_id = items.id 
            // group by v.item_id
            //       "),
            //     array(
            //         'branch' => $branch
            //     )
            // );

            // ($userdet->role != "Superadmin") ? "transactions.branch_id = '$userdet->branch_id'" :  "transactions.branch_id = transactions.branch_id")."".
            // ( (request('branch')) ? "transactions.branch_id = '$branch'" : "transactions.branch_id = transactions.branch_id")



            // ((request('branch')) ? "transactions.branch_id = '$branch'" : "transactions.branch_id = transactions.branch_id")

            // if (request('branch') == "yes") {
            //     $results = $results;
            // }else if(request('branch') == "no"){
            //     $results = [];
            // }


            $branches = Branch::select('branches.*')->get(); //filt_branch


        } catch (Exception $e) {
        }



        return response()->json([
            'status' => 200,
            'rep' => $results,
            'branches' => $branches,
            'role' => $userdet->role,
            'sd' => $start_date,
            'ed' => $end_date,

        ], 200);
    }
    public function sales(Request $request)
    {
        if (!$user = auth()->setRequest($request)->user()) {
            return $this->responseUnauthorized();
        }

        try {

            $transaction = Transaction::select('transactions.*');
            $transaction = $transaction->latest()->paginate();

            // get branch
            $userdet =  User_detail::where('id', $user->user_details_id)->firstOrFail();


            $col4 =  Transaction_item::join('transactions', 'transaction_items.transaction_id', '=', 'transactions.id')
                ->join('items', 'transaction_items.item_id', '=', 'items.id')
                // ->where('transactions.branch_id', '=', $userdet->branch_id)
                // ->where('transactions.transaction_type', '!=', "Charge")
                // ->where('transactions.transaction_type', '!=', "Return")
                // ->where('transactions.transaction_type', '!=', "Receiving")
                // ->where('transactions.transaction_type', '!=', "Payment Charges")
                // ->where('transactions.transaction_type', '!=', "Compensation")
                ->where('transactions.transaction_type', '=', "Sale")
                ->select(
                    'transactions.id as t_id',
                    'transactions.accountability',
                    'transaction_items.transaction_id as transId',
                    'transactions.code',
                    'transactions.customer_name as cust_name',
                    DB::raw('COUNT(transaction_items.item_id) as total_items'),
                    DB::raw('DATE(transactions.created_at) as date'),
                    DB::raw('(CASE 
           WHEN transactions.transaction_type = "Sale" THEN "Direct Sale"
           ELSE transactions.transaction_type
           END) AS type',),

                )

                ->groupBy('transaction_items.transaction_id')
                ->orderBy('transactions.created_at', 'DESC')
                ->get();
            $branches = Branch::select('branches.*')->get(); //filt_branch
        } catch (Exception $e) {
        }



        return response()->json([
            'status' => 200,
            // 'transaction' => $col4,
            'branches' => $branches,
            'role' => $userdet->role,
        ], 200);
    }
    public function allTransac(Request $request)
    {
        if (!$user = auth()->setRequest($request)->user()) {
            return $this->responseUnauthorized();
        }

        try {

            // $transaction = Transaction::select('transactions.*');
            // $transaction = $transaction->latest()->paginate();

            // get branch
            $userdet =  User_detail::where('id', $user->user_details_id)->firstOrFail();


            // $col4 =  Transaction_item::leftJoin('transactions', 'transaction_items.transaction_id', '=', 'transactions.id');
            // $col4 =  Transaction::leftJoin('transaction_items', 'transactions.id', '=', 'transaction_items.transaction_id');
            // $col4 =  Transaction::join('branches', 'transactions.branch_id', '=', 'branches.id'); //filt_branch
            $col4 =  Transaction::join('branches', 'transactions.branch_id', '=', 'branches.id'); //filt_branch
            // if(request('type') === 'Receiving'){
            $col4->leftJoin('requisitions', 'transactions.requisition_id', '=', 'requisitions.id');
            $col4->leftJoin('transactions as ct', 'transactions.code', '=', 'ct.charge_transaction_code');
            $col4->leftJoin('branches as rcb', 'transactions.receiving_pos_branch', '=', 'rcb.id');

            // }

            if (request('type') != "Payment Charge") {
                $col4->leftJoin('transaction_items', 'transactions.id', '=', 'transaction_items.transaction_id');
            }
            // $col4->leftJoin('items', 'transaction_items.item_id', '=', 'items.id');
            if (request('type') != "General") {
                // $col4->where('transactions.transaction_type', '=', request('type'));
                $col4->where('transactions.transaction_type', '=', str_replace('"', '', request('type')));
            } else {
                $col4->whereNotNull('transactions.transaction_type');
            }


            if ($userdet->role != "Superadmin") { //filt_branch
                $col4->where('transactions.branch_id', '=', $userdet->branch_id);
            } else if (request('branch_id')) {
                $col4->where('transactions.branch_id', '=', request('branch_id'));
            }

            $col4->leftJoin('suppliers', 'transaction_items.supplier_id', '=', 'suppliers.id');
            // if(request('type') == 'Receiving'){
            //     $col4->select('requisitions.type as req_type','ct.code as credit'
            //     );
            // }

            // $col4->where('transactions.date_transac', '=', date("Y-m-d")); //NEW FEB 4, 2021
            $col4->whereDate('transactions.date_transac', '>=', request('from_date') ? str_replace('"', '', request('from_date')) : date("Y-m-d"));
            $col4->whereDate('transactions.date_transac', '<=', request('to_date') ? str_replace('"', '', request('to_date')) : date("Y-m-d"));
            // $col4->whereDate('transactions.date_transac', '>=', request('from_date') ? request('from_date') : date("Y-m-d"));
            // $col4->whereDate('transactions.date_transac', '<=', request('to_date') ? request('to_date') : date("Y-m-d"));


            $col4->select(
                'branches.name as branch', //filt_branch
                'transactions.id as t_id',
                'transactions.description',
                'transactions.partof_cashflow',
                'transactions.transaction_status',
                'transactions.receipt_code',
                'transactions.accountability',
                'transaction_items.transaction_id as transId',
                'transactions.code',
                // 'transactions.series_no',
                'transactions.payable',
                'transactions.imported',
                'transactions.charge_transaction_code',
                'transactions.isPOSRelease',
                'transactions.receiving_pos_branch',
                'transactions.customer_name as cust_name',
                'rcb.name as rec_branch',
                DB::raw('COUNT(transaction_items.item_id) as total_items'),
                // DB::raw('"new Date(`transactions.date_transac`)" as timestamp'),
                // DB::raw('DATE(transactions.created_at) as date'),
                DB::raw('transactions.date_transac as date'),
                DB::raw('(CASE 
           WHEN transactions.transaction_type = "Sale" THEN CONCAT("DS",transactions.branch_id,"-", transactions.series_no)
           WHEN transactions.transaction_type = "Charge" THEN  CONCAT("CH",transactions.branch_id,"-",transactions.series_no)
           WHEN transactions.transaction_type = "Return" THEN  CONCAT("RT",transactions.branch_id,"-",transactions.series_no)
     
           END) AS series_no_pr',),
                DB::raw('(CASE 
           WHEN transactions.transaction_type = "Sale" THEN "Direct Sale"
           ELSE transactions.transaction_type
           END) AS type',),
                'requisitions.type as req_type',
                'ct.code as credit',
                'suppliers.name as supplier'
            );

            $col4->groupBy('transactions.id');
            // $col4->groupBy('transaction_items.transaction_id');
            // $col4->orderBy('transactions.created_at', 'DESC');
            $col4->orderBy('transactions.date_transac', 'DESC');
            $col4->orderBy('transactions.id', 'DESC');
            $all =  $col4->get();



            $branches = Branch::select('branches.*')->get(); //filt_branch

            $year = date("Y");
            if (request('year')) {
                $year = request('year');
            }

            $ds = Transaction::where('transactions.transaction_type', '=',  request('type'));

            $ds->leftJoin('requisitions', 'transactions.requisition_id', '=', 'requisitions.id');
            $ds->leftJoin('transactions as ct', 'transactions.code', '=', 'ct.charge_transaction_code');
            $ds->leftJoin('deliveries', 'transactions.delivery_id', '=', 'deliveries.id');

            if ($userdet->role != "Superadmin") {
                $ds->where('transactions.branch_id', '=',  $userdet->branch_id);
            } else if (request('branch_id')) {

                $ds->where('transactions.branch_id', '=',  request('branch_id'));
            }
            $ds->whereYear('transactions.date_transac', '=', $year);
            // $ds->whereNotNull('ct.charge_transaction_code');
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
            //     DB::raw('( SUM(transactions.payable) + SUM(transactions.discount)
            //     - SUM(deliveries.delivery_fee)) as raw_sales'),
            //     DB::raw('MONTH(transactions.date_transac) as monthnum'),
            // );
            // $ds->groupBy('month');
            // $ds->orderBy('monthnum');
            // $dsets =  $ds->get();
        } catch (Exception $e) {
        }



        return response()->json([
            'status' => 200,
            'transaction' => $all,
            'role' => $userdet->role,
            'branches' => $branches,
            'datasets' => $dsets,
            'b_id' => $userdet->branch_id,
            'f_date' => str_replace('"', '', request('from_date')),
            // 'transaction' => $col4,

        ], 200);
    }


    public function remittances(Request $request)
    {
        if (!$user = auth()->setRequest($request)->user()) {
            return $this->responseUnauthorized();
        }

        try {

            // get branch
            $userdet =  User_detail::where('id', $user->user_details_id)->firstOrFail();


            $remit = Remittance::join('user_details', 'remittances.remitter_id', '=', 'user_details.id')
                // ->join('branches', 'user_details.branch_id', '=', 'branches.id')
                ->join('branches', 'remittances.branch_id', '=', 'branches.id')
                ->whereDate('remittances.date', '>=', request('from_date') ? request('from_date') : date("Y-m-d"))
                ->whereDate('remittances.date', '<=', request('to_date') ? request('to_date') : date("Y-m-d"))
                ->select('remittances.*', DB::raw('CONCAT(user_details.first_name," " , user_details.last_name) as remitter'), 'branches.name as branch')->get();

            $branches = Branch::select('branches.*')->get(); //filt_branch

            $year = date("Y");
            if (request('year')) {
                $year = request('year');
            }

            // $ds = Transaction::where('transactions.transaction_type', '=',  request('type'));

            // $ds->leftJoin('requisitions', 'transactions.requisition_id', '=', 'requisitions.id');
            // $ds->leftJoin('transactions as ct', 'transactions.code', '=', 'ct.charge_transaction_code');

            // if ($userdet->role != "Superadmin") {
            //     $ds->where('transactions.branch_id', '=',  $userdet->branch_id);
            // } else if (request('branch_id')) {

            //     $ds->where('transactions.branch_id', '=',  request('branch_id'));
            // }
            // $ds->whereYear('transactions.date_transac', '=', $year);
            // // $ds->whereNotNull('ct.charge_transaction_code');
            // $ds->select(
            //     DB::raw('MONTHNAME(transactions.date_transac) as month'),
            //     DB::raw('SUM(transactions.payable) as total'),
            //     DB::raw('MONTH(transactions.date_transac) as monthnum'),
            // );
            // $ds->groupBy('month');
            // $ds->orderBy('monthnum');
            // $dsets =  $ds->get();

            $ds = Remittance::select(
                DB::raw('MONTHNAME(date) as month'),
                DB::raw('SUM(amount_remitted) as remitted'),
                DB::raw('SUM(sys_amount) as sys_amt'),
                DB::raw('MONTH(date) as monthnum'),
            );
            $ds->groupBy('month');
            $ds->orderBy('monthnum');
            $dsets =  $ds->get();
        } catch (Exception $e) {
        }



        return response()->json([
            'status' => 200,
            'role' => $userdet->role,
            'branches' => $branches,
            'datasets' => $dsets,
            'transaction' => $remit,

        ], 200);
    }


    public function chart(Request $request)
    {
        if (!$user = auth()->setRequest($request)->user()) {
            return $this->responseUnauthorized();
        }

        try {


            // get branch
            $userdet =  User_detail::where('id', $user->user_details_id)->firstOrFail();




            $year = date("Y");
            if (request('year')) {
                $year = request('year');
            }

            if (request('type') != "Remittances") {


                $ds = Transaction::where('transactions.transaction_type', '=',  request('type'));
                $ds->leftJoin('requisitions', 'transactions.requisition_id', '=', 'requisitions.id');
                $ds->leftJoin('transactions as ct', 'transactions.code', '=', 'ct.charge_transaction_code');
                $ds->leftJoin('deliveries', 'transactions.delivery_id', '=', 'deliveries.id');

                if ($userdet->role != "Superadmin") {
                    $ds->where('transactions.branch_id', '=',  $userdet->branch_id);
                } else if (request('branch_id')) {
                    $ds->where('transactions.branch_id', '=',  request('branch_id'));
                }
                $ds->whereYear('transactions.date_transac', '=', $year);
                if (request('pur_type') == "Cash") {
                    $ds->whereNull('ct.charge_transaction_code');
                } else if (request('pur_type') == "Credit") {
                    $ds->whereNotNull('ct.charge_transaction_code');
                }
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
            } else {
                $ds = Remittance::whereYear('date', '=', $year);
                $ds->select(
                    DB::raw('MONTHNAME(date) as month'),
                    DB::raw('SUM(amount_remitted) as remitted'),
                    DB::raw('SUM(sys_amount) as sys_amt'),
                    DB::raw('MONTH(date) as monthnum'),
                );
                $ds->groupBy('month');
                $ds->orderBy('monthnum');
                $dsets =  $ds->get();
            }
        } catch (Exception $e) {
        }



        return response()->json([
            'status' => 200,
            'datasets' => $dsets,

        ], 200);
    }
    public function receiveditems(Request $request)
    {
        if (!$user = auth()->setRequest($request)->user()) {
            return $this->responseUnauthorized();
        }

        try {

            $transaction = Transaction::select('transactions.*');
            $transaction = $transaction->latest()->paginate();

            // get branch
            $userdet =  User_detail::where('id', $user->user_details_id)->firstOrFail();


            $col4 =  Transaction_item::join('transactions', 'transaction_items.transaction_id', '=', 'transactions.id')
                ->join('items', 'transaction_items.item_id', '=', 'items.id')
                ->leftJoin('suppliers', 'transaction_items.supplier_id', '=', 'suppliers.id')
                // ->where('transactions.branch_id', '=', $userdet->branch_id)
                ->where('transactions.id', '=', request('id'))
                ->select(
                    'transaction_items.*',
                    'items.name as item_name',
                    DB::raw('(transaction_items.quantity + transaction_items.beg_balance) as end_bal'),
                    'suppliers.name as sup_name'

                )
                ->get();


            $allItemTrans =  Transaction_item::join('transactions', 'transaction_items.transaction_id', '=', 'transactions.id')
                ->join('items', 'transaction_items.item_id', '=', 'items.id')
                ->where('transactions.id', '=', request('id'))
                ->select('transaction_items.*', 'items.name as item_name', DB::raw('(transaction_items.quantity + transaction_items.beg_balance) as end_bal'))
                ->get();
        } catch (Exception $e) {
        }



        return response()->json([
            'status' => 200,
            'items' => $col4,
            'allItemTrans' => $allItemTrans,

        ], 200);
    }
    public function saleItems(Request $request)
    {
        if (!$user = auth()->setRequest($request)->user()) {
            return $this->responseUnauthorized();
        }

        try {

            $transaction = Transaction::select('transactions.*');
            $transaction = $transaction->latest()->paginate();

            // get branch
            $userdet =  User_detail::where('id', $user->user_details_id)->firstOrFail();

            $trans =  Transaction::where('id', request('id'))->firstOrFail();

            $col4 =  Transaction_item::join('transactions', 'transaction_items.transaction_id', '=', 'transactions.id')
                ->join('items', 'transaction_items.item_id', '=', 'items.id')
                ->join('brands', 'items.brand_id', '=', 'brands.id')
                ->leftJoin('suppliers', 'transaction_items.supplier_id', '=', 'suppliers.id')
                // ->where('transactions.branch_id', '=', $userdet->branch_id)
                ->where('transactions.id', '=', request('id'))
                ->select(
                    'transaction_items.*',
                    'transaction_items.quantity as Quantity',
                    'items.name as item_name',
                    'items.name as name',
                    'brands.name as brand',
                    'suppliers.name as supplier',
                    'transaction_items.id as ti_id',
                    'transaction_items.end_balance as end_bal',
                    'transactions.charge_transaction_code',
                    DB::raw('" " as up_stat')
                    //  DB::raw('( transaction_items.beg_balance - transaction_items.quantity) as end_bal')

                )
                ->get();

            // $replacement = [];
            // if ( $trans->transaction_type == "Return") {

            //     $repItems =  Transaction::where('return_code', $trans->code)->where('transaction_type', '=','Replacement')->firstOrFail();

            //     $replacement =  Transaction_item::join('transactions', 'transaction_items.transaction_id', '=', 'transactions.id')
            //     ->join('items', 'transaction_items.item_id', '=', 'items.id')
            //     ->leftJoin('suppliers', 'transaction_items.supplier_id', '=', 'suppliers.id')
            //     ->where('transactions.id', '=', $repItems->id)
            //     ->select('transaction_items.*', 'items.name as item_name', 'suppliers.name as supplier', 'transaction_items.end_balance as end_bal')
            //     ->get();


            // }

            $relCode = null;
            $repCode = null;
            $retCode = null;

            // Details of transaction
            $details =  Transaction::join('branches', 'transactions.branch_id', '=', 'branches.id');
            $details->leftJoin('users', 'transactions.user_id', '=', 'users.id');
            $details->rightJoin('user_details', 'users.user_details_id', '=', 'user_details.id');
            $details->where('transactions.id', '=', request('id'));

            if ($trans->transaction_type == "Sale" || $trans->transaction_type == "Charge") {
                $details->leftJoin('deliveries', 'transactions.delivery_id', '=', 'deliveries.id');
                $details->leftJoin('transactions as ct', 'transactions.code', '=', 'ct.charge_transaction_code');
                $details->select(
                    'transactions.branch_id',
                    'transactions.series_no',
                    'transactions.receipt_code',
                    'transactions.partof_cashflow',
                    'transactions.transaction_type',
                    'transactions.code',
                    'transactions.imported',
                    'transactions.customer_name',
                    'transactions.accountability',
                    'transactions.date_transac',
                    'branches.name as branch',
                    'transactions.discount',
                    'deliveries.address',
                    'deliveries.contact',
                    'deliveries.delivery_fee',
                    'transactions.payable',
                    'transactions.amount_received',
                    'ct.payable as partial',
                    'transactions.date_printed',
                    'transactions.latespecifics',
                    'transactions.st_tin_num',
                    'transactions.st_bus_type',
                    'transactions.ctrlno as curCtrlno',
                    'transactions.code as transaction_code',
                    'transactions.payable as itemPayable',
                    DB::raw('CONCAT(user_details.first_name," " , user_details.last_name) as prepare'), 
                    DB::raw('CONCAT(user_details.first_name," " , user_details.last_name) as cashier')
                );
            }
            if ($trans->transaction_type == "Receiving") {
                $details->leftJoin('requisitions', 'transactions.requisition_id', '=', 'requisitions.id');
                $details->leftJoin('transactions as ct', 'transactions.code', '=', 'ct.charge_transaction_code');
                $details->select(
                    'transactions.transaction_status',
                    'transactions.transaction_type',
                    'transactions.code',
                    'transactions.imported',
                    'transactions.date_transac',
                    'branches.name as branch',
                    'transactions.payable',
                    'requisitions.type as req_type',
                    'requisitions.code as req_code',
                    'ct.code as credit'
                );
            }
            if ($trans->transaction_type == "Releasing") {
                $details->leftJoin('requisitions', 'transactions.requisition_id', '=', 'requisitions.id');
                $details->join('branches as br', 'transactions.branch_id', '=', 'branches.id');
                $details->select(
                    'transactions.transaction_type',
                    'transactions.code',
                    'transactions.imported',
                    'transactions.date_transac',
                    'branches.name as branch',
                    'requisitions.type as req_type',
                    'requisitions.code as req_code',
                    'br.name as requestor',
                );
                $details->groupBy('requisitions.branch_id');
            }
            if ($trans->transaction_type == "Payment Charge") {
                $details->select(
                    'transactions.partof_cashflow',
                    'transactions.transaction_type',
                    'transactions.code',
                    'transactions.imported',
                    'transactions.customer_name',
                    'transactions.accountability',
                    'transactions.date_transac',
                    'branches.name as branch',
                    'transactions.payable',
                    'transactions.amount_received',
                    'transactions.date_printed',
                    'transactions.beg_charge_bal',
                    'transactions.end_charge_bal',
                    'branches.name as branch',
                    DB::raw('CONCAT(user_details.first_name," " , user_details.last_name) as prepare')
                );
            }
            if ($trans->transaction_type == "Credit") {
                $details->leftJoin('suppliers', 'transactions.supplier_id', '=', 'suppliers.id');
                $details->select(
                    'transactions.transaction_type',
                    'transactions.code',
                    'transactions.imported',
                    'transactions.date_transac',
                    'branches.name as branch',
                    'transactions.payable',
                    'transactions.beg_charge_bal',
                    'transactions.end_charge_bal',
                    'suppliers.name as supplier',
                    'transactions.charge_transaction_code as credit'
                );
            }
            if ($trans->transaction_type == "Update") {
                $details->leftJoin('transaction_items', 'transaction_items.transaction_id', '=', 'transactions.id');
                $details->select(
                    'transactions.transaction_type',
                    'transactions.code',
                    'transactions.accountability',
                    'transactions.imported',
                    'transactions.date_transac',
                    'transactions.payable',
                    'transactions.customer_name',
                    'transactions.beg_charge_bal',
                    'transactions.end_charge_bal',
                    'transactions.description',
                    'transaction_items.beg_balance as beg_balance',
                    'transaction_items.end_balance as end_balance',
                    'transaction_items.beg_collectible as beg_collectible',
                    'transaction_items.end_collectible as end_collectible',
                    'transaction_items.unit_price'
                );
            }
            if ($trans->transaction_type == "Replacement" || $trans->transaction_type == "Return") {
                $details->leftJoin('deliveries', 'transactions.delivery_id', '=', 'deliveries.id');







                if ($trans->transaction_type == "Return") {
                    $details->leftJoin('returned_itms', 'transactions.code', '=', 'returned_itms.return_code');
                } else {

                    $details->leftJoin('returned_itms', 'transactions.return_code', '=', 'returned_itms.return_code');
                }

                $details->leftJoin('transactions as rt_trans', 'returned_itms.sale_code', '=', 'rt_trans.code');

                $details->select(
                    'transactions.branch_id',
                    'transactions.series_no',
                    'rt_trans.transaction_type as org_type',
                    'transactions.transaction_type',
                    'transactions.code',
                    // 'transaction_items.item_status',
                    'transactions.imported',
                    'transactions.date_transac',
                    'branches.name as branch',
                    'transactions.payable',
                    'transactions.charge_transaction_code as credit',
                    'transactions.customer_name',
                    'transactions.accountability',
                    'transactions.date_printed',
                    'returned_itms.sale_code as org_code',
                    'deliveries.delivery_fee',
                    'transactions.latespecifics'
                );

                // if ($trans->transaction_type == "Return") {
                //     $relCode = Transaction::where('return_code', $trans->code)->whereIn('transactions.transaction_type', ['Sale', 'Charge'])->firstOrFail();
                //     $repCode = Transaction::where('return_code', $trans->code)->where('transactions.transaction_type', '=', "Replacement")->firstOrFail();

                //     $retCode = $trans->code;
                //     $relCode = $relCode->code;
                //     $repCode = $repCode->code;
                // }
                // if ($trans->transaction_type == "Replacement") {
                //     $relCode = Transaction::where('return_code', $trans->return_code)->whereIn('transactions.transaction_type', ['Sale', 'Charge'])->firstOrFail();
                //     $retCode = Transaction::where('code', $trans->return_code)->where('transactions.transaction_type', '=', "Return")->firstOrFail();

                //     $relCode = $relCode->code;
                //     $retCode = $retCode->code;
                //     $repCode = $trans->code;

                // }
            }
            if ($trans->transaction_type == "Debit") {
                $details->select(
                    'transactions.transaction_type',
                    'transactions.code',
                    'transactions.imported',
                    'transactions.date_transac',
                    'branches.name as branch',
                    'transactions.payable',
                    'transactions.customer_name',
                    'transactions.accountability',
                    'transactions.date_printed',
                    'transactions.beg_charge_bal',
                    'transactions.end_charge_bal',
                );
            }

            if ($trans->transaction_type == "Account Payment") {
                $details->leftJoin('suppliers', 'transactions.supplier_id', '=', 'suppliers.id');
                $details->leftJoin('cheques', 'transactions.cheque_id', '=', 'cheques.id');
                $details->select(
                    'transactions.transaction_type',
                    'transactions.code',
                    'transactions.imported',
                    'transactions.date_transac',
                    'branches.name as branch',
                    'transactions.payable',
                    'transactions.customer_name',
                    'transactions.accountability',
                    'transactions.beg_charge_bal',
                    'transactions.end_charge_bal',
                    'suppliers.name as supplier',
                    'cheques.code as cq_code',
                    'cheques.payee',
                    'cheques.bank',
                    'cheques.date as cq_date',
                );
            }

            if ($trans->transaction_type == "Excess Payment") {
                $details->leftJoin('deliveries', 'transactions.delivery_id', '=', 'deliveries.id');
                $details->leftJoin('returned_itms', 'transactions.return_code', '=', 'returned_itms.return_code');
                $details->leftJoin('transactions as rp', 'transactions.return_code', '=', 'rp.return_code');

                $details->select(
                    'transactions.partof_cashflow',
                    'transactions.transaction_type',
                    'transactions.code',
                    'transactions.imported',
                    'transactions.date_transac',
                    'branches.name as branch',
                    'transactions.payable',
                    'transactions.customer_name',
                    'transactions.accountability',
                    'transactions.date_printed',
                    'returned_itms.sale_code as org_code',
                    'transactions.return_code',
                    'rp.code as replacement_code',
                    'deliveries.delivery_fee',
                    'deliveries.address',
                    'deliveries.contact',
                    'transactions.amount_received',
                );
                $details->limit(1);
            }





            $details = $details->get();
        } catch (Exception $e) {
        }



        return response()->json([
            'status' => 200,
            'items' => $col4,
            'details' => $details,
            'repCode' => $repCode,
            'relCode' => $relCode,
            'retCode' => $retCode,
            // 'replacement' => $replacement,
            // 'repcode' => $trans->code,

        ], 200);
    }
    public function specificTransaction(Request $request)
    {
        if (!$user = auth()->setRequest($request)->user()) {
            return $this->responseUnauthorized();
        }

        try {
            $trans =  Transaction::where('id', request('id'))->get();
        } catch (Exception $e) {
        }

        return response()->json([
            'status' => 200,
            'transaction' => $trans,

        ], 200);
    }




    public function specItemLedger(Request $request)
    {
        if (!$user = auth()->setRequest($request)->user()) {
            return $this->responseUnauthorized();
        }

        try {


            // get branch
            $userdet =  User_detail::where('id', $user->user_details_id)->firstOrFail();

            if ($userdet->role == "Superadmin") {
                $bid = request("branch_id");
            } else {
                $bid = $userdet->branch_id;
            }


            // $col4 =  Item::join('transaction_items', 'transaction_items.item_id', '=', 'items.id')
            //     ->join('transactions', 'transaction_items.transaction_id', '=', 'transactions.id')
            //     ->where('transactions.branch_id', '=', $bid)
            //     ->where('items.id', '=', request('id'))
            //     ->select(
            //         'transactions.created_at',
            //         'transactions.code',
            //         'transactions.date_transac',
            //         'transactions.transaction_type',
            //         'transactions.accountability',
            //         'transaction_items.item_status',
            //         'transaction_items.unit_price',
            //         'transaction_items.quantity',
            //         'transaction_items.beg_balance',
            //         'transaction_items.end_balance',
            //         'transaction_items.beg_collectible',
            //         'transaction_items.end_collectible',
            //     )
            //     ->orderBy('transaction_items.updated_at', 'DESC')
            //     ->get();

            $first =  Item::join('transaction_items', 'transaction_items.item_id', '=', 'items.id')
                ->join('transactions', 'transaction_items.transaction_id', '=', 'transactions.id')
                ->where('transactions.branch_id', '=', $bid)
                ->where('items.id', '=', request('id'))
                ->whereDate('transactions.date_transac', '>=', request('from_date') ? request('from_date') : date("Y-m-d"))
                ->whereDate('transactions.date_transac', '<=', request('to_date') ? request('to_date') : date("Y-m-d"))
                ->select(
                    'transactions.created_at',
                    'transactions.code',
                    'transactions.date_transac',
                    'transactions.transaction_type',
                    'transactions.accountability',
                    'transaction_items.item_status',
                    'transaction_items.unit_price',
                    'transaction_items.quantity',
                    'transaction_items.beg_balance',
                    'transaction_items.end_balance',
                    'transaction_items.beg_collectible',
                    'transaction_items.end_collectible',
                    'transaction_items.beg_def_bal',
                    'transaction_items.end_def_bal',
                    'transaction_items.updated_at',

                );

            $col4 =  Item::join('transaction_items', 'transaction_items.item_id', '=', 'items.id')
                ->join('transactions', 'transaction_items.old_transaction_id', '=', 'transactions.id')
                ->where('transactions.branch_id', '=', $bid)
                ->where('items.id', '=', request('id'))
                ->whereDate('transactions.date_transac', '>=', request('from_date') ? request('from_date') : date("Y-m-d"))
                ->whereDate('transactions.date_transac', '<=', request('to_date') ? request('to_date') : date("Y-m-d"))
                ->select(
                    'transactions.created_at',
                    'transactions.code',
                    'transactions.date_transac',
                    'transactions.transaction_type',
                    'transactions.accountability',
                    'transaction_items.item_status',
                    'transaction_items.unit_price',
                    'transaction_items.quantity',
                    'transaction_items.beg_balance',
                    'transaction_items.end_balance',
                    'transaction_items.beg_collectible',
                    'transaction_items.end_collectible',
                    'transaction_items.beg_def_bal',
                    'transaction_items.end_def_bal',
                    'transaction_items.updated_at',
                )
                ->unionAll($first);

            $col4 = DB::query()->fromSub($col4, 'i_t')
                ->select('i_t.*')
                ->orderBy('updated_at', 'DESC')->get();


            // ->orderBy('updated_at', 'DESC')
            // ->get();


            // $query = $first->unionAll($col4);
            // $querySql = $query->toSql();
            // $col4 = DB::table(DB::raw("($querySql order by updated_at desc) as a"))->mergeBindings($query);

            $item =  Item::where('id', request('id'))->get();
            $branches = Branch::select('branches.*')->get(); //filt_branch
        } catch (Exception $e) {
        }

        return response()->json([
            'status' => 200,
            'ledger' => $col4,
            'item' => $item,
            'branches' => $branches,
            'role' => $userdet->role,

        ], 200);
    }
    //  public function specItemLedger(Request $request)
    // {
    //     if (!$user = auth()->setRequest($request)->user()) {
    //         return $this->responseUnauthorized();
    //     }

    //     try {


    //         // get branch
    //         $userdet =  User_detail::where('id', $user->user_details_id)->firstOrFail();

    //         if ($userdet->role == "Superadmin") {
    //             $bid = request("branch_id");
    //         } else {
    //             $bid = $userdet->branch_id;
    //         }


    //         $col4 =  Item::join('transaction_items', 'transaction_items.item_id', '=', 'items.id')
    //             ->join('transactions', 'transaction_items.transaction_id', '=', 'transactions.id')
    //             // ->where('transactions.branch_id', '=', $userdet->branch_id)
    //             ->where('transactions.branch_id', '=', $bid)
    //             ->where('items.id', '=', request('id'))
    //             ->select(
    //                 'transactions.created_at',
    //                 'transactions.code',
    //                 'transactions.date_transac',
    //                 'transactions.transaction_type',
    //                 'transactions.accountability',
    //                 'transaction_items.item_status',
    //                 'transaction_items.unit_price',
    //                 'transaction_items.quantity',
    //                 'transaction_items.beg_balance',
    //                 'transaction_items.end_balance',
    //                 'transaction_items.beg_collectible',
    //                 'transaction_items.end_collectible',
    //             )
    //             // ->orderBy('transactions.created_at', 'DESC')

    //             // ->orderBy('transactions.updated_at', 'DESC')
    //             ->orderBy('transaction_items.updated_at', 'DESC')

    //             // ->orderBy('transactions.id', 'DESC')
    //             ->get();

    //         $item =  Item::where('id', request('id'))->get();
    //         $branches = Branch::select('branches.*')->get(); //filt_branch
    //     } catch (Exception $e) {
    //     }

    //     return response()->json([
    //         'status' => 200,
    //         'ledger' => $col4,
    //         'item' => $item,
    //         'branches' => $branches,
    //         'role' => $userdet->role,

    //     ], 200);
    // }
    public function specCustomerLedger(Request $request)
    {
        if (!$user = auth()->setRequest($request)->user()) {
            return $this->responseUnauthorized();
        }

        try {


            // get branch
            $userdet =  User_detail::where('id', $user->user_details_id)->firstOrFail();

            $customer = User_detail::join('customers', 'user_details.id', '=', 'customers.user_details_id')
                ->where('user_details.id', request('id'))
                ->select(
                    'user_details.*',
                    'customers.charge_balance as balance',
                    'customers.id as customer_id',
                    DB::raw('CONCAT(user_details.first_name," " , user_details.last_name) as name')
                )
                ->get();

            $userdetCust =  User_detail::where('id', request('id'))->firstOrFail();
            $custDet =  Customer::where('user_details_id', $userdetCust->id)->firstOrFail();

            $col4 =  Transaction::join('branches', 'transactions.branch_id', '=', 'branches.id');
            $col4->where('transactions.customer_id', '=', $custDet->id);
            $col4->where('transactions.accountability', '=', "Customer");

            if (request('from_date') &&  request('to_date')) {
                $col4->whereDate('transactions.date_transac', '>=', request('from_date') );
                $col4->whereDate('transactions.date_transac', '<=', request('to_date') );  
                
                // $col4->whereDate('transactions.date_transac', '>=', request('from_date') ? request('from_date') : date("Y-m-d"));
                // $col4->whereDate('transactions.date_transac', '<=', request('to_date') ? request('to_date') : date("Y-m-d"));
            }
            $col4->select(
                'transactions.last_update',
                'transactions.created_at',
                'transactions.code',
                'transactions.date_transac',
                'transactions.transaction_type',
                'transactions.accountability',
                'transactions.payable',
                'transactions.charge_status',
                'transactions.date_paid',
                'transactions.charge_payment_transac_id as prev_code',
                'transactions.beg_charge_bal',
                'transactions.end_charge_bal',
                'branches.name',
            );
            $col4->orderBy('transactions.created_at', 'DESC');
            $col4->orderBy('transactions.id', 'DESC');
            $col4 =  $col4->get();

            // $item =  Item::where('id', request('id'))->get();

        } catch (Exception $e) {
        }

        return response()->json([
            'status' => 200,
            'ledger' => $col4,
            'customer' => $customer,

        ], 200);
    }
    public function specProjectLedger(Request $request)
    {
        if (!$user = auth()->setRequest($request)->user()) {
            return $this->responseUnauthorized();
        }

        try {


            // get branch
            $userdet =  User_detail::where('id', $user->user_details_id)->firstOrFail();

            $project = Project::where('projects.id', '=', request('id'))
                ->select('projects.*')
                ->get();



            $col4 =  Transaction::join('branches', 'transactions.branch_id', '=', 'branches.id');
            $col4->where('transactions.project_id', '=', request('id'));
            $col4->where('transactions.accountability', '=', "Project");

                // ->whereDate('transactions.date_transac', '>=', request('from_date') ? request('from_date') : date("Y-m-d"))
                // ->whereDate('transactions.date_transac', '<=', request('to_date') ? request('to_date') : date("Y-m-d"))

                if (request('from_date') &&  request('to_date')) {
                    $col4->whereDate('transactions.date_transac', '>=', request('from_date') );
                    $col4->whereDate('transactions.date_transac', '<=', request('to_date') );  
                    
                    // $col4->whereDate('transactions.date_transac', '>=', request('from_date') ? request('from_date') : date("Y-m-d"));
                    // $col4->whereDate('transactions.date_transac', '<=', request('to_date') ? request('to_date') : date("Y-m-d"));
                }

                $col4->select(
                    'transactions.last_update',
                    'transactions.created_at',
                    'transactions.code',
                    'transactions.date_transac',
                    'transactions.transaction_type',
                    'transactions.accountability',
                    'transactions.payable',
                    'transactions.charge_status',
                    'transactions.date_paid',
                    'transactions.charge_payment_transac_id as prev_code',
                    'transactions.beg_charge_bal',
                    'transactions.end_charge_bal',
                    'branches.name',
                );
                $col4->orderBy('transactions.created_at', 'DESC');
                $col4->orderBy('transactions.id', 'DESC');
                $col4 =   $col4->get();

            // $item =  Item::where('id', request('id'))->get();

        } catch (Exception $e) {
        }

        return response()->json([
            'status' => 200,
            'ledger' => $col4,
            'project' => $project,

        ], 200);
    }
    public function specOfficeLedger(Request $request)
    {
        if (!$user = auth()->setRequest($request)->user()) {
            return $this->responseUnauthorized();
        }

        try {


            // get branch
            $userdet =  User_detail::where('id', $user->user_details_id)->firstOrFail();

            $office = Branch::where('branches.id', '=', request('id'))
                ->select('branches.*')
                ->get();



            $col4 =  Transaction::join('branches', 'transactions.branch_id', '=', 'branches.id');
            $col4->where('transactions.office_id', '=', request('id'));
            $col4->where('transactions.accountability', '=', "Maintenance");

                // ->whereDate('transactions.date_transac', '>=', request('from_date') ? request('from_date') : date("Y-m-d"))
                // ->whereDate('transactions.date_transac', '<=', request('to_date') ? request('to_date') : date("Y-m-d"))

                if (request('from_date') &&  request('to_date')) {
                    $col4->whereDate('transactions.date_transac', '>=', request('from_date') );
                    $col4->whereDate('transactions.date_transac', '<=', request('to_date') );  
                    
                    // $col4->whereDate('transactions.date_transac', '>=', request('from_date') ? request('from_date') : date("Y-m-d"));
                    // $col4->whereDate('transactions.date_transac', '<=', request('to_date') ? request('to_date') : date("Y-m-d"));
                }

                $col4->select(
                    'transactions.last_update',
                    'transactions.created_at',
                    'transactions.code',
                    'transactions.date_transac',
                    'transactions.transaction_type',
                    'transactions.accountability',
                    'transactions.payable',
                    'transactions.charge_status',
                    'transactions.date_paid',
                    'transactions.charge_payment_transac_id as prev_code',
                    'transactions.beg_charge_bal',
                    'transactions.end_charge_bal',
                    'branches.name',
                );
                $col4->orderBy('transactions.created_at', 'DESC');
                $col4->orderBy('transactions.id', 'DESC');
                $col4 = $col4->get();

            // $item =  Item::where('id', request('id'))->get();

        } catch (Exception $e) {
        }

        return response()->json([
            'status' => 200,
            'ledger' => $col4,
            'office' => $office,

        ], 200);
    }
    public function specSupplierLedger(Request $request)
    {
        if (!$user = auth()->setRequest($request)->user()) {
            return $this->responseUnauthorized();
        }

        try {


            // get branch
            $userdet =  User_detail::where('id', $user->user_details_id)->firstOrFail();

            $supplier = Supplier::where('suppliers.id', '=', request('id'))
                ->select('suppliers.*')
                ->get();



            $col4 =  Transaction::join('branches', 'transactions.branch_id', '=', 'branches.id')
                ->where('transactions.supplier_id', '=', request('id'))
                // ->where('transactions.transaction_type', '=', "Credit")
                // ->where('transactions.transaction_type', '=', "Debt Payment")
                ->whereIn('transactions.transaction_type', ['Credit', 'Account Payment', 'Update', 'Import'])
                ->whereDate('transactions.date_transac', '>=', request('from_date') ? request('from_date') : date("Y-m-d"))
                ->whereDate('transactions.date_transac', '<=', request('to_date') ? request('to_date') : date("Y-m-d"))
                ->select(
                    'transactions.created_at',
                    'transactions.code',
                    'transactions.supplier_id',
                    'transactions.date_transac',
                    'transactions.transaction_type',
                    'transactions.payable',
                    'transactions.charge_status',
                    'transactions.date_paid',
                    'transactions.charge_payment_transac_id as pay_code',
                    'transactions.beg_charge_bal',
                    'transactions.end_charge_bal',
                    'transactions.updated_at',
                    'branches.name',
                    'transactions.last_update',
                    'transactions.charge_transaction_code',
                )
                // ->orderBy('transactions.created_at', 'DESC')
                // ->orderBy('transactions.created_at', 'DESC')
                ->orderBy('transactions.updated_at', 'DESC')
                ->get();

            // $item =  Item::where('id', request('id'))->get();

        } catch (Exception $e) {
        }

        return response()->json([
            'status' => 200,
            'ledger' => $col4,
            'supplier' => $supplier,

        ], 200);
    }
    public function indivPurchases(Request $request)
    {
        if (!$user = auth()->setRequest($request)->user()) {
            return $this->responseUnauthorized();
        }

        try {

            $userdet =  User_detail::where('id', $user->user_details_id)->firstOrFail();



            $col4 =  Transaction_item::join('transactions', 'transaction_items.transaction_id', '=', 'transactions.id');
            $col4->join('branches', 'transactions.branch_id', '=', 'branches.id'); //ac
            $col4->leftJoin('suppliers', 'transaction_items.supplier_id', '=', 'suppliers.id');
            // $col4->join('suppliers', 'transaction_items.supplier_id', '=', 'suppliers.id');
            $col4->join('items', 'transaction_items.item_id', '=', 'items.id');
            $col4->join('brands', 'items.brand_id', '=', 'brands.id');
            $col4->where('transactions.transaction_type', '=', request('type'));
            $col4->where('transactions.date_transac', '>=', request('begdate'));
            $col4->where('transactions.date_transac', '<=', request('enddate'));



            if ($userdet->role == "Superadmin") {

                if (request('branch_id')) {
                    $col4->where('transactions.branch_id', '=', request('branch_id'));
                }
            } else {
                $col4->where('transactions.branch_id', '=', $userdet->branch_id);
            }

            $col4->select(
                'branches.name as branch',
                'transaction_items.id',
                'transactions.description as t_desc',
                'transactions.date_transac as date',
                'transaction_items.quantity',
                'items.unit',
                'suppliers.name as supplier',
                'items.name as item',
                'brands.name as brand',
                'transaction_items.original_price',
                'transaction_items.unit_price',
                DB::raw('(transaction_items.quantity * transaction_items.original_price) as amount'),
                DB::raw('(SUM((transaction_items.quantity * transaction_items.original_price)) OVER (PARTITION BY transactions.date_transac)) AS total'),
                // DB::raw('(LAST_VALUE(transaction_items.id) OVER ( PARTITION BY  transactions.date_transac  ROWS BETWEEN CURRENT ROW AND UNBOUNDED FOLLOWING )) AS last'),
                DB::raw('( LAST_VALUE(transaction_items.id) OVER(PARTITION BY  transactions.date_transac) )as last'),
                DB::raw('  ( FIRST_VALUE(transaction_items.id) OVER(PARTITION BY  transactions.date_transac) )as first'),
            );
            $col4 = $col4->get();
        } catch (Exception $e) {
        }

        return response()->json([
            'status' => 200,
            'items' => $col4,

        ], 200);
    }

    public function indivSalesRev(Request $request)
    {
        if (!$user = auth()->setRequest($request)->user()) {
            return $this->responseUnauthorized();
        }

        try {
            $userdet =  User_detail::where('id', $user->user_details_id)->firstOrFail();

            // if ($userdet->role == "Superadmin") {
            //     $branch = null;
            // } else {
            //     $branch = $userdet->branch_id;
            // }

            // if (request('branch') == 'all') {
            //     $branch = null;
            // } else if (request('role') != 'Superadmin') {
            //     $branch = request('branch');
            // } else {
            //     $branch = null;
            // }

            // if ($userdet->role == "Superadmin") {
            //     $branch = null;
            // } else {
            //     $branch = $userdet->branch_id;
            // }

            // if (request('branch') == 'all') {
            //     $branch = null;
            // } else if (request('role') != 'Superadmin') {
            //     $branch = request('branch');
            // } else {
            //     $branch = null;
            // }


            $tday = "01";
            $tmonth = date("m");
            $tyear = date("Y");
            $month_sd = date("Y-m-d", strtotime($tmonth . '/' . $tday . '/' . $tyear . ' 00:00:00'));
            $month_ed = date("Y-m-d", strtotime('-1 second', strtotime('+1 month', strtotime($tmonth . '/' . $tday . '/' . $tyear . ' 00:00:00'))));


            $start_date = $month_sd;
            $end_date =  $month_ed;

            if (request('begdate') && request('enddate')) {
                $start_date = request('begdate');
                $end_date =  request('enddate');
            }




            $addons =  Transaction::leftJoin('deliveries', 'transactions.delivery_id', '=', 'deliveries.id');
            $addons->where('transactions.date_transac', '>=',  $start_date);
            $addons->where('transactions.date_transac', '<=',  $end_date);


            if ($userdet->role == "Superadmin") {

                if (request('branch')) {
                    $addons->where('transactions.branch_id', '=',  request('branch'));
                }
            } else {
                $addons->where('transactions.branch_id', '=',  $userdet->branch_id);
            }

            $addons->select(
                'transactions.code',
                'transactions.discount',
                'transactions.date_transac',
                'transactions.payable',
                'transactions.return_code',
                'deliveries.delivery_fee',
            );
            $addons = $addons->get();

            $initial = " SELECT
                            t.*,
                            (CASE 
           WHEN t.transaction_type = 'Sale' THEN CONCAT('DS',t.branch_id,'-', t.series_no)
           WHEN t.transaction_type = 'Charge' THEN  CONCAT('CH',t.branch_id,'-', t.series_no)
           WHEN t.transaction_type = 'Return' THEN  CONCAT('RT',t.branch_id,'-', t.series_no)
     
           END) AS series_no_pr,
                            items.name AS item,
                            brands.name AS brand,
                            items.unit,
                            -- ( SUM((t.quantity * t.srp)) OVER (PARTITION BY t.id ) ) subtotal,
                            -- ( SUM((t.quantity * t.srp)) OVER (PARTITION BY t.item_status, t.code  ) ) total,
                            ROUND(( SUM((t.quantity * t.srp)) OVER (PARTITION BY t.id ) ), 3) subtotal,
                            ROUND(( SUM((t.quantity * t.srp)) OVER (PARTITION BY t.item_status, t.code  ) ), 3) total,
                            ( LAST_VALUE(t.id) OVER(PARTITION BY t.item_status, t.code) )as last,
                            ( FIRST_VALUE(t.id) OVER(PARTITION BY t.item_status, t.code) )as first,
                            ( FIRST_VALUE(t.id) OVER(PARTITION BY t.code ORDER BY t.id) )as first_trans,
                            ( LAST_VALUE(t.id) OVER(PARTITION BY t.code) )as last_trans
                            
                            
                        
                        FROM
                            (
                            SELECT
                                branches.name AS branch_name,
                                transactions.series_no,
                                transactions.receipt_code,
                                transactions.customer_name,
                                transactions.transaction_type,
                                transactions.branch_id,
                                trItm.id,
                                transactions.date_transac,
                                transactions.code,
                                trItm.item_status,
                                trItm.transaction_id,
                                trItm.item_id,
                                trItm.quantity,
                                transactions.accountability,
                                trItm.unit_price AS srp,
                                ' ' AS return_code,
                                ' ' AS ret_code,
                                ' ' AS rep_code
                                
                            FROM
                                transaction_items trItm
                            INNER JOIN transactions ON trItm.transaction_id = transactions.id
                            INNER JOIN branches ON transactions.branch_id = branches.id
                            WHERE
                                trItm.item_status = 'Released' &&
                            transactions.transaction_type IN(
                                'Sale',
                                'Charge'
                            )
                                
                                
                            UNION ALL
                        SELECT
                            branches.name AS branch_name,
                            transactions.series_no,
                            transactions.receipt_code,
                            transactions.customer_name,
                            transactions.transaction_type,
                            transactions.branch_id,
                            trItmr.id,
                            transactions.date_transac,    
                            returned_itms.sale_code AS CODE,
                            trItmr.item_status,
                            trItmr.transaction_id,
                            trItmr.item_id,
                            trItmr.quantity,
                            transactions.accountability,
                            trItmr.unit_price AS srp,
                            returned_itms.return_code AS return_code,
                            ' ' AS  ret_code,
                            ' ' AS rep_code
                        FROM
                            transaction_items trItmr
                        INNER JOIN transactions ON trItmr.transaction_id = transactions.id
                        INNER JOIN branches ON transactions.branch_id = branches.id
                        INNER JOIN returned_itms ON transactions.code = returned_itms.return_code
                        INNER JOIN transactions orTrans ON returned_itms.sale_code = orTrans.code
                                
                        UNION ALL
                                
                                
                        SELECT
                            branches.name AS branch_name,
                            transactions.series_no,
                            transactions.receipt_code,
                            transactions.customer_name,
                            transactions.transaction_type,
                            transactions.branch_id,
                            trItmrp.id,
                            transactions.date_transac,
                            replaced_itms.sale_code AS CODE,
                            trItmrp.item_status,
                            trItmrp.transaction_id,
                            trItmrp.item_id,
                            trItmrp.quantity,
                            transactions.accountability,
                            trItmrp.unit_price AS srp,
                            ' ' AS return_code,
                            transactions.return_code AS ret_code,
                            replaced_itms.replace_code AS rep_code
                        FROM
                            transaction_items trItmrp
                        INNER JOIN transactions ON trItmrp.transaction_id = transactions.id
                        INNER JOIN branches ON transactions.branch_id = branches.id
                        INNER JOIN replaced_itms ON transactions.code = replaced_itms.replace_code
                        ) t
                        
                        INNER JOIN items ON t.item_id = items.id
                        INNER JOIN brands ON items.brand_id = brands.id";

            // $branchFilter = " && t.branch_id = '$branch'";    
            $branchFilter = "  ";

            if ($userdet->role == "Superadmin") {
                $branchFilter = " ";
                if (request('branch')) {
                    $branch = request('branch');
                    $branchFilter = " && t.branch_id = '$branch'";
                }
            } else {
                $branchFilter = " && t.branch_id = '$userdet->branch_id'";
            }



            $results = DB::select(
                DB::raw(" " . $initial . "
               
            WHERE
                t.item_status IN(
                    'Returned GC',
                    'Defective',
                    'Replacement',
                    'Released'
                )   &&
                t.date_transac >= '$start_date' && 
                t.date_transac <= '$end_date' 
    
                " . $branchFilter . "

            
            ORDER BY
            t.code ASC, t.id
            "),
                array(
                    // 'branch' => $branch
                )
            );

            return response()->json([
                'status' => 200,
                'items' => $results,
                'addons' => $addons,

            ], 200);
        } catch (Exception $e) {
        }
    }

    public function GenindivRev(Request $request)
    {
        if (!$user = auth()->setRequest($request)->user()) {
            return $this->responseUnauthorized();
        }

        try {
            $userdet =  User_detail::where('id', $user->user_details_id)->firstOrFail();

            // if ($userdet->role == "Superadmin") {
            //     $branch = null;
            // } else {
            //     $branch = $userdet->branch_id;
            // }

            // if (request('branch') == 'all') {
            //     $branch = null;
            // } else if (request('role') != 'Superadmin') {
            //     $branch = request('branch');
            // } else {
            //     $branch = null;
            // }

            // if ($userdet->role == "Superadmin") {
            //     $branch = null;
            // } else {
            //     $branch = $userdet->branch_id;
            // }

            // if (request('branch') == 'all') {
            //     $branch = null;
            // } else if (request('role') != 'Superadmin') {
            //     $branch = request('branch');
            // } else {
            //     $branch = null;
            // }


            $tday = "01";
            $tmonth = date("m");
            $tyear = date("Y");
            $month_sd = date("Y-m-d", strtotime($tmonth . '/' . $tday . '/' . $tyear . ' 00:00:00'));
            $month_ed = date("Y-m-d", strtotime('-1 second', strtotime('+1 month', strtotime($tmonth . '/' . $tday . '/' . $tyear . ' 00:00:00'))));


            $start_date = $month_sd;
            $end_date =  $month_ed;

            if (request('begdate') && request('enddate')) {
                $start_date = request('begdate');
                $end_date =  request('enddate');
            }




            $addons =  Transaction::leftJoin('deliveries', 'transactions.delivery_id', '=', 'deliveries.id');
            $addons->where('transactions.date_transac', '>=',  $start_date);
            $addons->where('transactions.date_transac', '<=',  $end_date);


            if ($userdet->role == "Superadmin") {

                if (request('branch')) {
                    $addons->where('transactions.branch_id', '=',  request('branch'));
                }
            } else {
                $addons->where('transactions.branch_id', '=',  $userdet->branch_id);
            }

            $addons->select(
                'transactions.code',
                'transactions.discount',
                'transactions.date_transac',
                'transactions.payable',
                'transactions.return_code',
                'deliveries.delivery_fee',
            );
            $addons = $addons->get();

            $trans_type = request('trans_type');

            if ($trans_type == "Sale") {
                $filt = " WHERE
                orTrans.transaction_type = 'Sale'";
            } else {
                $filt = " WHERE
                orTrans.transaction_type = 'Charge' ";
            }

            $initial1 = " SELECT
                            t.*, (CASE 
           WHEN t.transaction_type = 'Sale' THEN CONCAT('DS',t.branch_id,'-', t.series_no)
           WHEN t.transaction_type = 'Charge' THEN  CONCAT('CH',t.branch_id,'-', t.series_no)
           WHEN t.transaction_type = 'Return' THEN  CONCAT('RT',t.branch_id,'-', t.series_no)
     
           END) AS series_no_pr,
                            items.name AS item,
                            brands.name AS brand,
                            items.unit,
                            -- ( SUM((t.quantity * t.srp)) OVER (PARTITION BY t.id ) ) subtotal,
                            -- ( SUM((t.quantity * t.srp)) OVER (PARTITION BY t.item_status, t.code  ) ) total,
                            ROUND(( SUM((t.quantity * t.srp)) OVER (PARTITION BY t.id ) ), 3) subtotal,
                            ROUND(( SUM((t.quantity * t.srp)) OVER (PARTITION BY t.item_status, t.code  ) ), 3) total,
                            ( LAST_VALUE(t.id) OVER(PARTITION BY t.item_status, t.code) )as last,
                            ( FIRST_VALUE(t.id) OVER(PARTITION BY t.item_status, t.code) )as first,
                            ( FIRST_VALUE(t.id) OVER(PARTITION BY t.code ORDER BY t.id) )as first_trans,
                            ( LAST_VALUE(t.id) OVER(PARTITION BY t.code) )as last_trans
                            
                            
                        
                        FROM
                            (
                            SELECT
                                branches.name AS branch_name,
                                transactions.series_no,
                                transactions.receipt_code,
                                transactions.customer_name,
                                transactions.transaction_type,
                                transactions.branch_id,
                                trItm.id,
                                transactions.date_transac,
                                transactions.code,
                                trItm.item_status,
                                trItm.transaction_id,
                                trItm.item_id,
                                trItm.quantity,
                                transactions.accountability,
                                trItm.unit_price AS srp,
                                ' ' AS return_code,
                                ' ' AS ret_code,
                                ' ' AS rep_code
                                
                            FROM
                                transaction_items trItm
                            INNER JOIN transactions ON trItm.transaction_id = transactions.id
                            INNER JOIN branches ON transactions.branch_id = branches.id
                            WHERE
                                trItm.item_status = 'Released' &&
                            transactions.transaction_type IN(
                                
                                '$trans_type'
                            )
                                
                                
                            UNION ALL ";

            $initial2 =     " SELECT
                            branches.name AS branch_name,
                            transactions.series_no,
                            transactions.receipt_code,
                            transactions.customer_name,
                            transactions.transaction_type,
                            transactions.branch_id,
                            trItmr.id,
                            transactions.date_transac,    
                            returned_itms.sale_code AS CODE,
                            trItmr.item_status,
                            trItmr.transaction_id,
                            trItmr.item_id,
                            trItmr.quantity,
                            transactions.accountability,
                            trItmr.unit_price AS srp,
                            returned_itms.return_code AS return_code,
                            ' ' AS  ret_code,
                            ' ' AS rep_code
                        FROM
                            transaction_items trItmr
                        INNER JOIN transactions ON trItmr.transaction_id =  transactions.id
                        INNER JOIN branches ON transactions.branch_id = branches.id
                        INNER JOIN returned_itms ON transactions.code = returned_itms.return_code
                        INNER JOIN transactions orTrans ON returned_itms.sale_code = orTrans.code " . $filt . "UNION ALL";


            $initial3 =     " SELECT
                            branches.name AS branch_name,
                            transactions.series_no,
                            transactions.receipt_code,
                            transactions.customer_name,
                            transactions.transaction_type,
                            transactions.branch_id,
                            trItmrp.id,
                            transactions.date_transac,
                            replaced_itms.sale_code AS CODE,
                            trItmrp.item_status,
                            trItmrp.transaction_id,
                            trItmrp.item_id,
                            trItmrp.quantity,
                            transactions.accountability,
                            trItmrp.unit_price AS srp,
                            ' ' AS return_code,
                            transactions.return_code AS ret_code,
                            replaced_itms.replace_code AS rep_code
                        FROM
                            transaction_items trItmrp
                        INNER JOIN transactions ON trItmrp.transaction_id = transactions.id
                        INNER JOIN branches ON transactions.branch_id = branches.id
                        INNER JOIN replaced_itms ON transactions.code = replaced_itms.replace_code  
                        INNER JOIN transactions orTrans ON replaced_itms.sale_code = orTrans.code " . $filt . "
                        
                        ) t
                        
                        INNER JOIN items ON t.item_id = items.id
                        INNER JOIN brands ON items.brand_id = brands.id";




            $initial = $initial1 . $initial2 . $initial3;

            // $branchFilter = " && t.branch_id = '$branch'";    
            $branchFilter = "  ";

            if ($userdet->role == "Superadmin") {
                $branchFilter = " ";
                if (request('branch')) {
                    $branch = request('branch');
                    $branchFilter = " && t.branch_id = '$branch'";
                }
            } else {
                $branchFilter = " && t.branch_id = '$userdet->branch_id'";
            }



            $results = DB::select(
                DB::raw(" " . $initial . "
               
            WHERE
                t.item_status IN(
                    'Returned GC',
                    'Defective',
                    'Replacement',
                    'Released'
                )   &&
                t.date_transac >= '$start_date' && 
                t.date_transac <= '$end_date' 
    
                " . $branchFilter . "

            ORDER BY
            t.code ASC, t.id
            "),
                array(
                    // 'branch' => $branch
                )
            );

            return response()->json([
                'status' => 200,
                'items' => $results,
                'addons' => $addons,

            ], 200);
        } catch (Exception $e) {
        }
    }





    public function indivAllRelease(Request $request)
    {
        if (!$user = auth()->setRequest($request)->user()) {
            return $this->responseUnauthorized();
        }

        try {
            $userdet =  User_detail::where('id', $user->user_details_id)->firstOrFail();

            // if ($userdet->role == "Superadmin") {
            //     $branch = null;
            // } else {
            //     $branch = $userdet->branch_id;
            // }

            // if (request('branch') == 'all') {
            //     $branch = null;
            // } else if (request('role') != 'Superadmin') {
            //     $branch = request('branch');
            // } else {
            //     $branch = null;
            // }

            // if ($userdet->role == "Superadmin") {
            //     $branch = null;
            // } else {
            //     $branch = $userdet->branch_id;
            // }

            // if (request('branch') == 'all') {
            //     $branch = null;
            // } else if (request('role') != 'Superadmin') {
            //     $branch = request('branch');
            // } else {
            //     $branch = null;
            // }


            $tday = "01";
            $tmonth = date("m");
            $tyear = date("Y");
            $month_sd = date("Y-m-d", strtotime($tmonth . '/' . $tday . '/' . $tyear . ' 00:00:00'));
            $month_ed = date("Y-m-d", strtotime('-1 second', strtotime('+1 month', strtotime($tmonth . '/' . $tday . '/' . $tyear . ' 00:00:00'))));


            $start_date = $month_sd;
            $end_date =  $month_ed;

            if (request('begdate') && request('enddate')) {
                $start_date = request('begdate');
                $end_date =  request('enddate');
            }




            $addons =  Transaction::leftJoin('deliveries', 'transactions.delivery_id', '=', 'deliveries.id');
            $addons->where('transactions.date_transac', '>=',  $start_date);
            $addons->where('transactions.date_transac', '<=',  $end_date);


            if ($userdet->role == "Superadmin") {

                if (request('branch')) {
                    $addons->where('transactions.branch_id', '=',  request('branch'));
                }
            } else {
                $addons->where('transactions.branch_id', '=',  $userdet->branch_id);
            }

            $addons->select(
                'transactions.code',
                'transactions.discount',
                'transactions.date_transac',
                'transactions.payable',
                'transactions.return_code',
                'deliveries.delivery_fee',
            );
            $addons = $addons->get();

            $fdate = request('begdate') ? request('begdate') : date("Y-m-d");
            $tdate = request('enddate') ? request('enddate') : date("Y-m-d");

            $initial = " SELECT
                            t.*, (CASE 
           WHEN t.transaction_type = 'Sale' THEN CONCAT('DS',t.branch_id,'-', t.series_no)
           WHEN t.transaction_type = 'Charge' THEN  CONCAT('CH',t.branch_id,'-', t.series_no)
           WHEN t.transaction_type = 'Return' THEN  CONCAT('RT',t.branch_id,'-', t.series_no)
     
           END) AS series_no_pr,
                            items.name AS item,
                            brands.name AS brand,
                            items.unit,
                            -- ( SUM((t.quantity * t.srp)) OVER (PARTITION BY t.id ) ) subtotal,
                            -- ( SUM((t.quantity * t.srp)) OVER (PARTITION BY t.item_status, t.code  ) ) total,
                            ROUND(( SUM((t.quantity * t.srp)) OVER (PARTITION BY t.id ) ), 3) subtotal,
                            ROUND(( SUM((t.quantity * t.srp)) OVER (PARTITION BY t.item_status, t.code  ) ), 3) total,
                            ( LAST_VALUE(t.id) OVER(PARTITION BY t.item_status, t.code) )as last,
                            ( FIRST_VALUE(t.id) OVER(PARTITION BY t.item_status, t.code) )as first,
                            ( FIRST_VALUE(t.id) OVER(PARTITION BY t.code ORDER BY t.id) )as first_trans,
                            ( LAST_VALUE(t.id) OVER(PARTITION BY t.code) )as last_trans
                            
                            
                        
                        FROM
                            (
                            SELECT
                            
                                transactions.series_no,
                                transactions.receipt_code,
                                transactions.customer_name,
                                transactions.transaction_type,
                                transactions.description,
                                branches.name AS branch_name,
                                transactions.branch_id,
                                trItm.id,
                                transactions.date_transac,
                                transactions.code,
                                trItm.item_status,
                                trItm.transaction_id,
                                trItm.item_id,
                                trItm.quantity,
                                transactions.accountability,
                                trItm.unit_price AS srp,
                                ' ' AS return_code,
                                ' ' AS ret_code,
                                ' ' AS rep_code
                                
                            FROM
                                transaction_items trItm
                            INNER JOIN transactions ON trItm.transaction_id = transactions.id
                            INNER JOIN branches ON transactions.branch_id = branches.id
                            WHERE
                                trItm.item_status = 'Released' &&
                            transactions.transaction_type IN(
                                'Sale',
                                'Charge',
                                'Releasing'
                            )  &&
                                transactions.date_transac >=  '$fdate'
                                &&
                                transactions.date_transac <= '$tdate'
                                
                                
                            UNION ALL
                        SELECT
                        
                            transactions.series_no,
                            transactions.receipt_code,
                            transactions.customer_name,
                            transactions.transaction_type,
                            transactions.description,
                            branches.name AS branch_name,
                            transactions.branch_id,
                            trItmr.id,
                            transactions.date_transac,    
                            returned_itms.sale_code AS CODE,
                            trItmr.item_status,
                            trItmr.transaction_id,
                            trItmr.item_id,
                            trItmr.quantity,
                            transactions.accountability,
                            trItmr.unit_price AS srp,
                            returned_itms.return_code AS return_code,
                            ' ' AS  ret_code,
                            ' ' AS rep_code
                        FROM
                            transaction_items trItmr
                        INNER JOIN transactions ON trItmr.transaction_id = transactions.id
                        INNER JOIN branches ON transactions.branch_id = branches.id
                        INNER JOIN returned_itms ON transactions.code = returned_itms.return_code
                        INNER JOIN transactions orTrans ON returned_itms.sale_code = orTrans.code
                        WHERE
                                 transactions.date_transac >=  '$fdate'
                                 &&
                                transactions.date_transac <= '$tdate' 
                                
                        UNION ALL
                                
                                
                        SELECT
                        
                            transactions.series_no,
                            transactions.receipt_code,
                            transactions.customer_name,
                            transactions.transaction_type,
                            transactions.description,
                            branches.name AS branch_name,
                            transactions.branch_id,
                            trItmrp.id,
                            transactions.date_transac,
                            replaced_itms.sale_code AS CODE,
                            trItmrp.item_status,
                            trItmrp.transaction_id,
                            trItmrp.item_id,
                            trItmrp.quantity,
                            transactions.accountability,
                            trItmrp.unit_price AS srp,
                            ' ' AS return_code,
                            transactions.return_code AS ret_code,
                            replaced_itms.replace_code AS rep_code
                        FROM
                            transaction_items trItmrp
                        INNER JOIN transactions ON trItmrp.transaction_id = transactions.id
                        INNER JOIN branches ON transactions.branch_id = branches.id
                        INNER JOIN replaced_itms ON transactions.code = replaced_itms.replace_code

                        WHERE
                                 transactions.date_transac >=  '$fdate'
                                 &&
                                transactions.date_transac <= '$tdate' 
                        ) t
                        
                        INNER JOIN items ON t.item_id = items.id
                        INNER JOIN brands ON items.brand_id = brands.id";

            // $branchFilter = " && t.branch_id = '$branch'";    
            $branchFilter = "  ";

            if ($userdet->role == "Superadmin") {
                $branchFilter = " ";
                if (request('branch')) {
                    $branch = request('branch');
                    $branchFilter = " && t.branch_id = '$branch'";
                }
            } else {
                $branchFilter = " && t.branch_id = '$userdet->branch_id'";
            }



            $results = DB::select(
                DB::raw(" " . $initial . "
               
            WHERE
                t.item_status IN(
                    'Returned GC',
                    'Defective',
                    'Replacement',
                    'Released'
                )  
    
                " . $branchFilter . "

            ORDER BY
               t.code ASC, t.id
            "),
                array(
                    // 'branch' => $branch
                )
            );

            return response()->json([
                'status' => 200,
                'items' => $results,
                'addons' => $addons,

            ], 200);
        } catch (Exception $e) {
        }
    }
    public function indivChargeRev(Request $request)
    {
        if (!$user = auth()->setRequest($request)->user()) {
            return $this->responseUnauthorized();
        }

        try {
            $userdet =  User_detail::where('id', $user->user_details_id)->firstOrFail();



            $tday = "01";
            $tmonth = date("m");
            $tyear = date("Y");
            $month_sd = date("Y-m-d", strtotime($tmonth . '/' . $tday . '/' . $tyear . ' 00:00:00'));
            $month_ed = date("Y-m-d", strtotime('-1 second', strtotime('+1 month', strtotime($tmonth . '/' . $tday . '/' . $tyear . ' 00:00:00'))));


            $start_date = $month_sd;
            $end_date =  $month_ed;

            if (request('begdate') && request('enddate')) {
                $start_date = request('begdate');
                $end_date =  request('enddate');
            }


            $addons =  Transaction::leftJoin('deliveries', 'transactions.delivery_id', '=', 'deliveries.id');
            if (request("type") == "Customer") {
                $cust =  Customer::where('user_details_id', request('id'))->firstOrFail();
                $addons->where('transactions.customer_id', '=',  $cust->id);
            } else if (request("type") == "Project") {
                $addons->where('transactions.project_id', '=', request('id'));
            } else if (request("type") == "Office") {
                $addons->where('transactions.office_id', '=',  request('id'));
            }
            $addons->whereDate('transactions.date_transac', '>=', request('from_date') ? request('from_date') : date("Y-m-d"));
            $addons->whereDate('transactions.date_transac', '<=', request('to_date') ? request('to_date') : date("Y-m-d"));
            // $addons->where('transactions.date_transac', '>=',  $start_date);
            // $addons->where('transactions.date_transac', '<=',  $end_date);
            $addons->select(
                'transactions.code',
                'transactions.discount',
                'transactions.date_transac',
                'transactions.payable',
                'transactions.return_code',
                'deliveries.delivery_fee',
            );
            $addons = $addons->get();

            $fdate = request('from_date') ? request('from_date') : date("Y-m-d");
            $tdate = request('to_date') ? request('to_date') : date("Y-m-d");

            $initial = " SELECT
                            t.*, (CASE 
           WHEN t.transaction_type = 'Sale' THEN CONCAT('DS',t.branch_id,'-', t.series_no)
           WHEN t.transaction_type = 'Charge' THEN  CONCAT('CH',t.branch_id,'-', t.series_no)
           WHEN t.transaction_type = 'Return' THEN  CONCAT('RT',t.branch_id,'-', t.series_no)
     
           END) AS series_no_pr,
                            items.name AS item,
                            brands.name AS brand,
                            items.unit,
                            ( SUM((t.quantity * t.srp)) OVER (PARTITION BY t.id ) ) subtotal,
                            ( SUM((t.quantity * t.srp)) OVER (PARTITION BY t.item_status, t.code  ) ) total,
                            ( LAST_VALUE(t.id) OVER(PARTITION BY t.item_status, t.code) )as last,
                            ( FIRST_VALUE(t.id) OVER(PARTITION BY t.item_status, t.code) )as first,
                            ( FIRST_VALUE(t.id) OVER(PARTITION BY t.code ORDER BY t.id) )as first_trans,
                            ( LAST_VALUE(t.id) OVER(PARTITION BY t.code) )as last_trans
                            
                            
                        
                        FROM
                            (
                            SELECT
                            
                                transactions.series_no,
                                transactions.receipt_code,
                                transactions.transaction_type,
                                transactions.description,
                                branches.name AS branch_name,
                                transactions.customer_id,
                                transactions.project_id,
                                transactions.office_id,
                                transactions.branch_id,
                                trItm.id,
                                transactions.date_transac,
                                transactions.code,
                                trItm.item_status,
                                trItm.transaction_id,
                                trItm.item_id,
                                trItm.quantity,
                                transactions.accountability,
                                trItm.unit_price AS srp,
                               ' ' AS return_code,
                               ' ' AS ret_code,
                                ' ' AS rep_code
                                
                            FROM
                                transaction_items trItm
                            INNER JOIN transactions ON trItm.transaction_id = transactions.id
                            INNER JOIN branches ON transactions.branch_id = branches.id
                             
                            WHERE
                                trItm.item_status = 'Released' &&
                            transactions.transaction_type =
                                'Charge'
                                &&
                                transactions.date_transac >=  '$fdate'
                                &&
                                transactions.date_transac <= '$tdate'
                                
                        UNION ALL
                        SELECT
                            
                            transactions.series_no,
                            transactions.receipt_code,
                            transactions.transaction_type,
                            transactions.description,
                            branches.name AS branch_name,
                            orTrans.customer_id,
                            orTrans.project_id,
                            orTrans.office_id,
                            transactions.branch_id,
                            trItmr.id,
                            transactions.date_transac,    
                            returned_itms.sale_code AS CODE,
                            trItmr.item_status,
                            trItmr.transaction_id,
                            trItmr.item_id,
                            trItmr.quantity,
                            transactions.accountability,
                            trItmr.unit_price AS srp,
                            returned_itms.return_code AS return_code,
                            ' ' AS  ret_code,
                            ' ' AS rep_code
                        FROM
                            transaction_items trItmr
                        INNER JOIN transactions ON trItmr.transaction_id = transactions.id
                        INNER JOIN branches ON transactions.branch_id = branches.id
                        INNER JOIN returned_itms ON transactions.code = returned_itms.return_code
                        INNER JOIN transactions orTrans ON returned_itms.sale_code = orTrans.code

                                 WHERE
                                 transactions.date_transac >=  '$fdate'
                                 &&
                                transactions.date_transac <= '$tdate'   
                           
                                
                        UNION ALL
                                
                                
                        SELECT
                            
                            transactions.series_no,
                            transactions.receipt_code,
                            transactions.transaction_type,
                            transactions.description,
                            branches.name AS branch_name,
                            transactions.customer_id,
                            transactions.project_id,
                            transactions.office_id,
                            transactions.branch_id,
                            trItmrp.id,
                            transactions.date_transac,
                            replaced_itms.sale_code AS CODE,
                            trItmrp.item_status,
                            trItmrp.transaction_id,
                            trItmrp.item_id,
                            trItmrp.quantity,
                            transactions.accountability,
                            trItmrp.unit_price AS srp,
                            ' ' AS return_code,
                            transactions.return_code AS ret_code,
                            replaced_itms.replace_code AS rep_code
                        FROM
                            transaction_items trItmrp
                        INNER JOIN transactions ON trItmrp.transaction_id = transactions.id
                        INNER JOIN branches ON transactions.branch_id = branches.id
                        INNER JOIN replaced_itms ON transactions.code = replaced_itms.replace_code
                        WHERE
                                 transactions.date_transac >= '$fdate'
                                 &&
                                transactions.date_transac <= '$tdate'


                       




                        ) t
                        
                        INNER JOIN items ON t.item_id = items.id
                        INNER JOIN brands ON items.brand_id = brands.id";

            // $branchFilter = " && t.branch_id = '$branch'";    
            $branchFilter = "  ";

            if ($userdet->role == "Superadmin") {
                $branchFilter = " ";
                if (request('branch')) {
                    $branch = request('branch');
                    $branchFilter = " && t.branch_id = '$branch'";
                }
            } else {
                $branchFilter = " && t.branch_id = '$userdet->branch_id'";
            }

            $acc_id = request("id");
            if (request("type") == "Customer") {
                $cust =  Customer::where('user_details_id', request('id'))->firstOrFail();

                $id_filt = "&& t.customer_id = '$cust->id'";
            } else if (request("type") == "Project") {
                $id_filt = "&& t.project_id = '$acc_id'";
            } else if (request("type") == "Office") {
                $id_filt = "&& t.office_id = '$acc_id'";
            }


            $results = DB::select(
                DB::raw(" " . $initial . "
               
            WHERE
                t.item_status IN(
                    'Returned GC',
                    'Defective',
                    'Replacement',
                    'Released'
                )  
                
          
            
                " . $id_filt . "
                ORDER BY
                t.code ASC, t.id
            "),
                array(
                    // 'branch' => $branch
                )
            );

            // &&
            //     t.date_transac >= '$start_date' && 
            //     t.date_transac <= '$end_date' 
            // " . $branchFilter . "
            return response()->json([
                'status' => 200,

                'items' => $results,
                'addons' => $addons,

            ], 200);
        } catch (Exception $e) {
        }
    }

    public function upLogsitm(Request $request)
    {
        if (!$user = auth()->setRequest($request)->user()) {
            return $this->responseUnauthorized();
        }

        try {
            // $results= Trans_item_backup::where('code',  request('code'))->get();
            $results = Trans_item_backup::where('code',  request('code'));
            if (request('type')) {
                $results->where('type',  request('type'));
            }
            $results = $results->get();
            return response()->json([
                'status' => 200,
                'items' => $results,

            ], 200);
        } catch (Exception $e) {
        }
    }

    public function upActLogs(Request $request)
    {
        if (!$user = auth()->setRequest($request)->user()) {
            return $this->responseUnauthorized();
        }

        try {
            $results = ActivityLog::where('code',  request('code'))->get();
            return response()->json([
                'status' => 200,
                'activities' => $results,

            ], 200);
        } catch (Exception $e) {
        }
    }

    public function saleCodeRet(Request $request)
    {
        if (!$user = auth()->setRequest($request)->user()) {
            return $this->responseUnauthorized();
        }

        try {
            $results = ReturnedItm::where('return_code',  request('return_code'))->firstorfail();
            return response()->json([
                'status' => 200,
                'sale_code' => $results->sale_code,

            ], 200);
        } catch (Exception $e) {
        }
    }

    public function allDeletedItm(Request $request)
    {
        if (!$user = auth()->setRequest($request)->user()) {
            return $this->responseUnauthorized();
        }

        try {
            $results = Trans_item_backup::where('type',  "Item Delete")->get();
            return response()->json([
                'status' => 200,
                'items' => $results,

            ], 200);
        } catch (Exception $e) {
        }
    }
    public function destroyDeletedItm(Request $request)
    {
        // Get user from $request token.
        if (!$user = auth()->setRequest($request)->user()) {
            return $this->responseUnauthorized();
        }

        try {
            $itm = Trans_item_backup::where('id', request('id'))->firstOrFail();
            $itm->delete();

            return response()->json([
                'status' => 204,
                'message' => "Deleted successfully"
            ], 204);
        } catch (Exception $e) {
            return $this->responseServerError('Error deleting resource.');
        }
    }

    public function paychargerep(Request $request)
    {
        // Get user from $request token.
        if (!$user = auth()->setRequest($request)->user()) {
            return $this->responseUnauthorized();
        }

        try {


            $pc =  Transaction::join('branches', 'transactions.branch_id', '=', 'branches.id');

            if (request('accountability') == "Customer") {
                $cs = Customer::where('user_details_id', request('id'))->firstOrFail();
                $pc->where('transactions.customer_id', '=', $cs->id);
            } else if (request('accountability') == "Project") {
                $pc->where('transactions.project_id', '=', request('id'));
            } else if (request('accountability') == "Office") {
                $pc->where('transactions.office_id', '=', request('id'));
            }

            $pc->where('transactions.accountability', '=', request('accountability') == "Office" ? "Maintenance" : request('accountability'));
            $pc->where('transactions.transaction_type', '=', "Payment Charge");
            $pc->select(
                'transactions.created_at',
                'transactions.code',
                'transactions.date_transac',
                'transactions.transaction_type',
                'transactions.accountability',
                'transactions.payable',
                'transactions.charge_status',
                'transactions.date_paid',
                'transactions.charge_payment_transac_id as prev_code',
                'transactions.beg_charge_bal',
                'transactions.end_charge_bal',
                'branches.name',
            );
            $pc->orderBy('transactions.created_at', 'DESC');
            $allpaycharge =  $pc->get();


            return response()->json([
                'status' => 200,
                'items' => $allpaycharge,

            ], 200);
        } catch (Exception $e) {
            return $this->responseServerError('Error deleting resource.');
        }
    }

    public function getDebitTrans(Request $request)
    {
        // Get user from $request token.
        if (!$user = auth()->setRequest($request)->user()) {
            return $this->responseUnauthorized();
        }

        try {

            $pc = DebitedItm::where('return_id', '=', request('return_id'))->get();

            return response()->json([
                'status' => 200,
                'items' => $pc,

            ], 200);
        } catch (Exception $e) {
            return $this->responseServerError('Error deleting resource.');
        }
    }

    public function getRepItemCurrentStock(Request $request)
    {
        // Get user from $request token.
        if (!$user = auth()->setRequest($request)->user()) {
            return $this->responseUnauthorized();
        }

        try {

            $transaction = Transaction::where('id', '=', request('repid'))->firstorfail();

            $itmObj = json_decode(request('items'), true);
            $items = Item_count::join('items', 'item_counts.item_id', '=', 'items.id');

            foreach ($itmObj as $i) {
                $items->orWhere('item_id', '=', $i['item_id']);
                // $items->orWhere('item_id', '=', 1119);
                $items->where('branch_id', '=', $transaction->branch_id);
                // $items->orWhere('item_id', '=', 1144);
            }
            // $items->where('branch_id', '=', $transaction->branch_id);
            $items->select(
                'item_counts.item_id',
                'item_counts.balance',
                'item_counts.branch_id',
            );

            $items = $items->get();



            return response()->json([
                'status' => 200,
                'items' => $items,

            ], 200);
        } catch (Exception $e) {
            return $this->responseServerError('Error deleting resource.');
        }
    }

    public function getExcessTrans(Request $request)
    {
        // Get user from $request token.
        if (!$user = auth()->setRequest($request)->user()) {
            return $this->responseUnauthorized();
        }

        try {

            $excess = Transaction::where('return_code', '=', request('return_code'))
                ->where('transaction_type', '=', "Excess Payment")
                ->get();

            return response()->json([
                'status' => 200,
                'excess' => $excess,

            ], 200);
        } catch (Exception $e) {
            return $this->responseServerError('Error deleting resource.');
        }
    }
}
