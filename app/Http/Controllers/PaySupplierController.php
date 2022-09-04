<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use App\Http\Controllers\APIController;
use App\User_detail;
use App\User;
use App\Notification;
use App\Transaction_item;
use App\Transaction;
use App\Cheque;
use App\Item;
use App\Project;
use App\Supplier;
use App\Branch;
use App\Trans_item_backup;
use DateTime;
use DateTimeZone;
use DB;

class Old_trans
{
    public $type;
    public $details;
}

class PaySupplierController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request)
    {
        // Get user from $request token.
        if (!$user = auth()->setRequest($request)->user()) {
            return $this->responseUnauthorized();
        }

        try {


            $supplier =  Supplier::select('suppliers.*')
                ->where('suppliers.id', '!=', 1)
                // ->where('suppliers.balance', '>=', 1)
                ->get();

            $cheques =  Cheque::join('suppliers', 'cheques.supplier_id', '=', 'suppliers.id')
                ->select('cheques.*', 'suppliers.name as supplier')
                ->orderBy('cheques.date', 'DESC')
                ->orderBy('cheques.created_at', 'DESC')
                ->get();
        } catch (Exception $e) {
        }



        return response()->json([
            'status' => 200,
            'supplier' => $supplier,
            'cheques' => $cheques,

        ], 200);
    }
    public function supplier_charge(Request $request)
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
                ->join('branches', 'transactions.branch_id', '=', 'branches.id')
                ->join('items', 'transaction_items.item_id', '=', 'items.id')
                ->where('transactions.transaction_type', '=', "Receiving")
                ->where('transaction_items.charge_status', '=', "Unpaid")
                ->where('transaction_items.supplier_id', '=', request('supplier_id'))
                ->select(
                    'transactions.id as t_id',
                    'transaction_items.transaction_id as transId',
                    'transactions.code',
                    'transactions.requisition_id as transac_req',
                    'transactions.date_transac',
                    'transactions.accountability',
                    'transactions.payable',
                    'branches.name',
                    'transaction_items.supplier_id',
                    DB::raw('COUNT(transaction_items.item_id) as total_items'),
                    DB::raw('DATE(transactions.created_at) as date'),
                    DB::raw('"plus icon" as icon'),
                    DB::raw('SUM(transaction_items.original_price * transaction_items.quantity) as total')
                )
                ->groupBy('transaction_items.transaction_id')
                ->get();
        } catch (Exception $e) {
        }



        return response()->json([
            'status' => 200,
            'transaction' => $col4,

        ], 200);
    }
    public function addPDC(Request $request)
    {
        if (!$user = auth()->setRequest($request)->user()) {
            return $this->responseUnauthorized();
        }

        try {
            $newCheque = Cheque::create([
                'code' => request('cheque_code'),
                'bank' => request('bank'),
                'payee' => request('payee'),
                'date' => request('cheq_date'),
                'amount' => request('cheq_amount'),
                'supplier_id' => request('supplier_id'),
            ]);
            $cheques =  Cheque::join('suppliers', 'cheques.supplier_id', '=', 'suppliers.id')
                ->select('cheques.*', 'suppliers.name as supplier')
                ->orderBy('cheques.date', 'DESC')
                ->orderBy('cheques.created_at', 'DESC')
                ->get();


            return response()->json([
                'status' => 200,
                'cheques' => $cheques,

            ], 200);
        } catch (Exception $e) {
        }
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
                ->join('branches', 'transactions.branch_id', '=', 'branches.id')
                ->join('items', 'transaction_items.item_id', '=', 'items.id')
                ->where('transactions.transaction_type', '=', "Receiving")
                ->where('transaction_items.charge_status', '=', "Unpaid")
                ->where('transaction_items.supplier_id', '=', request('supplier_id'))
                ->where('transactions.id', '=', request('tr_id'))
                ->select('transaction_items.*', 'items.name as item_name', DB::raw('(transaction_items.quantity + transaction_items.beg_balance) as end_bal'))
                ->get();


            // $allItemTrans =  Transaction_item::join('transactions', 'transaction_items.transaction_id', '=', 'transactions.id')
            //     ->join('items', 'transaction_items.item_id', '=', 'items.id')
            //     ->where('transactions.id', '=', request('id'))
            //     ->select('transaction_items.*', 'items.name as item_name', DB::raw('(transaction_items.quantity + transaction_items.beg_balance) as end_bal'))
            //     ->get();
        } catch (Exception $e) {
        }



        return response()->json([
            'status' => 200,
            'items' => $col4,
            // 'allItemTrans' => $allItemTrans,

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
            $userdet =  User_detail::where('id', $user->user_details_id)->firstOrFail();  // get branch
            $cheque_id = null;
            if (request('pay_cheque') == "yes") {
                $newCheque = Cheque::create([
                    'code' => request('cheque_code'),
                    'bank' => request('bank'),
                    'payee' => request('payee'),
                    'date' => request('date_transac'),
                ]);
                $cheque_id =  $newCheque->id;
            }


            // transaction code
            $year = date("y");
            $year = substr($year, -2);
            $month = date("m");
            $day = date("d");
            $code = "PTS" . request('supplier_id') . $year . $day . $month . rand(100, 9999) . "PY ";

            $receipt = null;
            if (request('receipt_code')) {
                $receipt = request('receipt_code');
            }





            $itmObj = json_decode(request('items'), true);

            foreach ($itmObj as $itm) {
                $crdTransac =  Transaction::where('charge_transaction_code', $itm["code"])->firstOrFail();
                $crdTransac->charge_status =  "Paid";
                $crdTransac->charge_payment_transac_id = $code;
                $crdTransac->date_paid = request('date_transac');
                $crdTransac->save();

                $payItems =  Transaction_item::join('transactions', 'transaction_items.transaction_id', '=', 'transactions.id')
                    // ->join('branches', 'transactions.branch_id', '=', 'branches.id')
                    // ->join('items', 'transaction_items.item_id', '=', 'items.id')
                    ->where('transactions.transaction_type', '=', "Receiving")
                    ->where('transaction_items.charge_status', '=', "Unpaid")
                    ->where('transaction_items.supplier_id', '=', request('supplier_id'))
                    ->where('transactions.id', '=', $itm["id"])
                    ->select('transaction_items.id as ti_id')
                    ->get();

                foreach ($payItems as $pi) {
                    $pItems =  Transaction_item::where('id', $pi["ti_id"])->firstOrFail();
                    $pItems->charge_status =  "Paid";
                    $pItems->save();
                }
            }


            $supplier =  Supplier::where('id', request('supplier_id'))->firstOrFail();  // get project

            $beg_charge_bal = $supplier->balance;

            $supplier->balance -=  request('amount');

            $end_charge_bal = $supplier->balance;

            $supplier->save();

            $new = Transaction::create([
                'transaction_type' => "Account Payment",
                'user_id' => $user->id,
                'branch_id' => $userdet->branch_id,
                'code' => $code,
                'date_transac' =>  request('date_transac'),
                'payable' =>  request('amount'),
                'beg_charge_bal' =>  $beg_charge_bal,
                'end_charge_bal' =>  $end_charge_bal,
                'date_paid' =>  request('date_transac'),
                'supplier_id' =>  request('supplier_id'),
                'cheque_id' =>  $cheque_id,
                'receipt_code' => $receipt,

            ]);

            $supplier =  Supplier::select('suppliers.*')
                ->where('suppliers.id', '!=', 1)
                ->where('suppliers.balance', '>=', 1)
                ->get();
        } catch (Exception $e) {
        }
        return response()->json([
            'status' => 200,
            'supplier' =>  $supplier,
            // 'allItemTrans' => $allItemTrans,

        ], 200);
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


    public function updatecheq(Request $request)
    {
        // Get user from $request token.
        if (!$user = auth()->setRequest($request)->user()) {
            return $this->responseUnauthorized();
        }

        try {
            $cheque = Cheque::where('id', request('id'))->firstOrFail();
            

            if ($cheque->status == 'Confirmed') {
                $transaction = Transaction::where('cheque_id', $cheque->id)->firstOrFail();

                $old_trans = [];

                $otrns = new Old_trans();
                $otrns->type = "Cheque";
                $otrns->details = [$cheque];
                $old_trans[] = $otrns;

                $otrns = new Old_trans();
                $otrns->type = "Transaction";
                $otrns->details = [$transaction];
                $old_trans[] = $otrns;

                $backup = Trans_item_backup::create([
                    'code' => $transaction->code,
                    'items' => json_encode($old_trans),
                    'type' =>  "Account Payment Update",
                    'user_id' =>  $user->id,
                    'trans_payable' =>  "[]",
                    'credit_balance' => "[]",
                    'item_balances' => "[]",
                ]);
    

                if (request('cheq_date')) {
                    $transaction->date_paid = request('cheq_date');
                }
                if (request('date_transac')) {
                    $transaction->date_transac = request('date_transac');
                }
                if (request('payee')) {
                    $transaction->customer_name = request('payee');
                }

                if (request('cheq_amount')) {
                    $supplier = Supplier::where('id', $transaction->supplier_id)->firstOrFail();
                    $ent_old_bal = $supplier->balance;
                    $current_bal = $supplier->balance;

                    $current_bal += $transaction->payable;
                    $current_bal -= request('cheq_amount');

                    $supplier->balance = $current_bal;

                    $transaction->payable = request('cheq_amount');

                    $transaction->beg_charge_bal = $ent_old_bal;
                    $transaction->end_charge_bal = $current_bal;

                    $supplier->save();

                }

                if(request('cheq_date')|| request('date_transac')||request('payee')||request('cheq_amount')){
                    $dateup = new DateTime("now", new DateTimeZone('Asia/Manila'));
                    $dup = $dateup->format('Y-m-d H:i:s');
                    $transaction->last_update = $dup;
                }
                


                $transaction->save();
             
            }


            


            if (request('cheque_code')) {
                $cheque->code = request('cheque_code');
            }
            if (request('bank')) {
                $cheque->bank = request('bank');
            }
            if (request('payee')) {
                $cheque->payee = request('payee');
            }
            if (request('cheq_date')) {
                $cheque->date = request('cheq_date');
            }
            if (request('supplier_id')) {
                $cheque->supplier_id = request('supplier_id');
            }
            if (request('cheq_amount')) {
                $cheque->amount = request('cheq_amount');
            }

            $cheque->save();
            // return $this->responseResourceUpdated();


            $cheques =  Cheque::join('suppliers', 'cheques.supplier_id', '=', 'suppliers.id')
                ->select('cheques.*', 'suppliers.name as supplier')
                ->orderBy('cheques.date', 'DESC')
                ->orderBy('cheques.created_at', 'DESC')
                ->get();
        } catch (Exception $e) {
            // return $this->responseServerError('Error updating resource.');
        }
        return response()->json([
            'status' => 200,
            'message' => 'Update successful',
            'updated' => $cheques
        ], 200);
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy(Request $request, $id)
    {
        // Get user from $request token.
        if (!$user = auth()->setRequest($request)->user()) {
            return $this->responseUnauthorized();
        }

        // $branch = Branch::where('id', $id)->firstOrFail();
        $cheque = Cheque::where('id', $id)->firstOrFail();


        try {
            // $confirm = User_detail::where('branch_id', '=', $id)->first();

            if ($cheque->status == "Confirmed") {
                return response()->json([
                    'status' => 0,
                ], 0);
            } else {
                $cheque->delete();

                $cheques =  Cheque::join('suppliers', 'cheques.supplier_id', '=', 'suppliers.id')
                    ->select('cheques.*', 'suppliers.name as supplier')
                    ->orderBy('cheques.date', 'DESC')
                    ->orderBy('cheques.created_at', 'DESC')
                    ->get();


                // return $this->responseResourceDeleted();
                return response()->json([
                    'status' => 204,
                    'message' => "Deleted successfully",
                    'cheques' => $cheques,
                ], 204);
            }
        } catch (Exception $e) {
            return $this->responseServerError('Error deleting resource.');
        }
    }

    public function confirmPayment(Request $request)
    {
        // Get user from $request token.
        if (!$user = auth()->setRequest($request)->user()) {
            return $this->responseUnauthorized();
        }

        try {
            $userdet =  User_detail::where('id', $user->user_details_id)->firstOrFail();  // get branch

            $cheque = Cheque::where('id', request('id'))->firstOrFail();

            $supplier =  Supplier::where('id', $cheque->supplier_id)->firstOrFail();  // get project
            //deduct supplier balance
            $beg_charge_bal = $supplier->balance;
            $supplier->balance -=  $cheque->amount;
            $end_charge_bal = $supplier->balance;
            $supplier->save();

            // transaction code
            $year = date("y");
            $year = substr($year, -2);
            $month = date("m");
            $day = date("d");
            $code = "PTS" . $cheque->supplier_id . $year . $day . $month . rand(100, 9999) . "PY ";

            $curd = date("Y-m-d");
            $new = Transaction::create([
                'transaction_type' => "Account Payment",
                'accountability' => "Supplier",
                'customer_name' => $cheque->payee,
                'user_id' => $user->id,
                'branch_id' => $userdet->branch_id,
                // 'code' => $code,
                'code' => $this->gecode("PTS"),
                'date_transac' =>  $curd,
                'payable' => $cheque->amount,
                'beg_charge_bal' =>  $beg_charge_bal,
                'end_charge_bal' =>  $end_charge_bal,
                'date_paid' =>  $cheque->date,
                'supplier_id' => $cheque->supplier_id,
                'cheque_id' =>  $cheque->id,

            ]);

            $cheque = Cheque::where('id', request('id'))->firstOrFail();
            $cheque->status = "Confirmed";
            $cheque->save();
        } catch (Exception $e) {
            // return $this->responseServerError('Error updating resource.');
        }
        return response()->json([
            'status' => 200,
            'message' => 'Update successful',
            // 'updated' => $cheques
        ], 200);
    }
    public function importPDC(Request $request)
    {
        if (!$user = auth()->setRequest($request)->user()) {
            return $this->responseUnauthorized();
        }
        try {
            // $itmObj = (array)json_decode(request('items'));
            $userdet =  User_detail::where('id', $user->user_details_id)->firstOrFail();  // get branch
            $itmObj = json_decode(request('items'), true);
            // if (is_array($itmObj) || is_object($itmObj)) {
            foreach ($itmObj as $itm) {

                if (!$itm["id"] == "") {
                    $datecq = str_replace('/', '-', $itm["cheq_date"]);
                    $datepd = str_replace('/', '-', $itm["date_paid"]);
                    $sup_id = 1;
                    if ($itm["supplier"]) {
                        $sup =  Supplier::where('name', $itm["supplier"])->first();
                        is_null($sup) ? $sup_id = $this->addSupplier($itm["supplier"]) : $sup_id = $sup->id;
                    }

                    $newCheque = Cheque::create([
                        'code' => $itm["cheque_code"],
                        'bank' => $itm["bank"],
                        'payee' => $itm["payee"],
                        'date' =>  date('Y-m-d', strtotime($datecq)),
                        'amount' => $itm["amount"],
                        'supplier_id' => $sup_id,
                    ]);

                    if ($itm["status"] == "yes") {
                        $new = Transaction::create([
                            'transaction_type' => "Account Payment",
                            'accountability' => "Supplier",
                            'customer_name' => $itm["payee"],
                            'user_id' => $user->id,
                            'branch_id' => $userdet->branch_id,
                            // 'code' => $code,
                            'code' => $this->gecode("PTS"),
                            'date_transac' =>  date('Y-m-d', strtotime($datepd)),
                            'payable' => $itm["amount"],
                            'date_paid' =>   date('Y-m-d', strtotime($datepd)),
                            'supplier_id' => $sup_id,
                            'cheque_id' =>  $newCheque->id,
                            'imported' =>  "yes",

                        ]);

                        $cheque = Cheque::where('id', $newCheque->id)->firstOrFail();
                        $cheque->status = "Confirmed";
                        $cheque->save();
                    }
                }
            }
            return response()->json([
                'status' => 200,
            ], 200);
        } catch (Exception $e) {
            echo $e;
            return $this->responseServerError('Error updating resource.');
        }
    }
    function addSupplier($name)
    {
        $new = Supplier::create([
            'name' => $name,
            'address' => "none",
            'balance' => 0,
        ]);

        return $new->id;
    }
    function gecode($trans)
    {
        // generate code
        $year = date("y");
        $year = substr($year, -2);
        $month = date("m");
        $day = date("d");

        $random = rand(1111111111, 9999999999);
        if (strlen($day) == 1) {
            $day = "0" . $day;
        }


        $code = $trans . $random . $day . "PY ";
        // check if the id exist
        $oldcode =  Transaction::where('code', $code)->first();
        if ($oldcode) {
            if (strlen($day) == 1) {
                $day = "0" . $day;
            }
            $random = rand(1111111111, 9999999999);
            return  $code = $trans . $random . $day . "PY ";
        } else {
            return $code;
        }
    }
}
