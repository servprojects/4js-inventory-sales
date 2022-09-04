<?php

namespace App\Http\Controllers;

use App\CashierCashflow;
use App\CashonhandBackup;
use App\Transaction;
use App\User;
use App\User_detail;
use DateTime;
use DateTimeZone;
use Illuminate\Http\Request;
use DB;

class CashierCashController extends Controller
{

    public function index(Request $request)
    {
        // Get user from $request token.
        if (!$user = auth()->setRequest($request)->user()) {
            return $this->responseUnauthorized();
        }

        try {
            $coh = User_detail::where('id', '=', $user->user_details_id)->firstorfail();

            return response()->json([
                'status' => 200,
                'newamt' => $coh->cash_on_hand,
                'enablecf' => $coh->enable_cashflow,

            ], 200);
        } catch (Exception $e) {
            return $this->responseServerError('Error creating resource.');
        }
    }

    public function getPettyCash(Request $request)
    {
        // Get user from $request token.
        if (!$user = auth()->setRequest($request)->user()) {
            return $this->responseUnauthorized();
        }

        try {
            $items = CashierCashflow::where('user_id', '=', request("user_id"))
                ->where('trans_date', '=', request("date"))
                ->where('description', '=', "Petty Cash")
                ->get();

            return response()->json([
                'status' => 200,
                'items' => $items,

            ], 200);
        } catch (Exception $e) {
            return $this->responseServerError('Error creating resource.');
        }
    }

    public function todayEarnings(Request $request)
    {
        // Get user from $request token.
        if (!$user = auth()->setRequest($request)->user()) {
            return $this->responseUnauthorized();
        }

        try {
            $earn = CashierCashflow::whereDate('trans_date', '=', date('Y-m-d'))
                ->where('user_id', '=', $user->id)
                ->get();

            $cashin = 0;
            $cashout = 0;

            foreach ($earn as $e) {
                if ($e['type'] == "Cash In") {
                    $cashin += $e['amount'];
                } else if ($e['type'] == "Cash Out") {
                    $cashout += $e['amount'];
                }
            }

            $earning = $cashin - $cashout;

            return response()->json([
                'status' => 200,
                'earning' => $earning,

            ], 200);
        } catch (Exception $e) {
            return $this->responseServerError('Error creating resource.');
        }
    }

    public function cashflowRep(Request $request)
    {
        // Get user from $request token.
        if (!$user = auth()->setRequest($request)->user()) {
            return $this->responseUnauthorized();
        }

        try {

            if (request('user_id')) {
                $ui =  User::where('user_details_id', '=', request('user_id'))->firstorfail();
            }


            $id = request('user_id') ? $ui->id : $user->id;

            // ->whereDate('cashier_cashflows.created_at', '>=', request('from_date') ? request('from_date') : date("Y-m-d"))
            // ->whereDate('cashier_cashflows.created_at', '<=', request('to_date') ? request('to_date') : date("Y-m-d"))


            $coh = CashierCashflow::leftJoin('transactions', 'cashier_cashflows.transaction_id', '=', 'transactions.id')
                ->leftJoin('cashonhand_backups', 'cashier_cashflows.id', '=', 'cashonhand_backups.coh_id')
                ->where('cashier_cashflows.user_id', '=', $id)
                ->whereDate('cashier_cashflows.trans_date', '>=', request('from_date') ? request('from_date') : date("Y-m-d"))
                ->whereDate('cashier_cashflows.trans_date', '<=', request('to_date') ? request('to_date') : date("Y-m-d"))
                ->select(
                    'cashier_cashflows.*',
                    'transactions.code',
                    DB::raw('COUNT(cashonhand_backups.id) over ( partition by cashonhand_backups.coh_id)as no_updates'),
                )
                ->distinct()
                ->orderBy('cashier_cashflows.id', 'DESC')
                ->orderBy('cashier_cashflows.trans_date', 'DESC')

                // ->withCount('cashonhand_backups.id')
                // ->groupBy('cashier_cashflows.id')
                ->get();

            return response()->json([
                'status' => 200,
                'flows' => $coh,

            ], 200);
        } catch (Exception $e) {
            return $this->responseServerError('Error creating resource.');
        }
    }

    public function cashflowUpRep(Request $request)
    {
        // Get user from $request token.
        if (!$user = auth()->setRequest($request)->user()) {
            return $this->responseUnauthorized();
        }

        try {

            $coh = CashonhandBackup::where('coh_id', '=', request("id"))->get();

            return response()->json([
                'status' => 200,
                'flows' => $coh,

            ], 200);
        } catch (Exception $e) {
            return $this->responseServerError('Error creating resource.');
        }
    }

    public function storePettyCash(Request $request)
    {
        // Get user from $request token.
        if (!$user = auth()->setRequest($request)->user()) {
            return $this->responseUnauthorized();
        }

        try {
            $dateup = new DateTime("now", new DateTimeZone('Asia/Manila'));
            $dup = $dateup->format('Y-m-d H:i:s');

            $new = CashierCashflow::create([

                'trans_date' => request('date'),
                'type' => "Cash In",
                'accountability' => "Admin",
                'amount' => request('amount'),
                'user_id' => request('user_id'),
                'description' => 'Petty Cash',
                'actual_date' => $dup,
            ]);



            return response()->json([
                'status' => 200,
                'message' => "success",

            ], 200);
        } catch (Exception $e) {
            return $this->responseServerError('Error creating resource.');
        }
    }

    public function modTransCashflow(Request $request)
    {
        // Get user from $request token.
        if (!$user = auth()->setRequest($request)->user()) {
            return $this->responseUnauthorized();
        }

        try {


            $trans = Transaction::where('id', '=', request("id"))->firstorfail();

            if ($trans->partof_cashflow == "yes") { // Deactivate cashflow


                $trans->partof_cashflow = null;

                $cf = CashierCashflow::where('transaction_id', '=', request("id"))->firstorfail();
                $cf->temp_status = $cf->status;
                $cf->status = "deleted";

                $us = User::where('id', '=', $cf->user_id)->firstorfail();

                $ud = User_detail::where('id', '=', $us->user_details_id)->firstorfail();
                $ud->cash_on_hand -= $trans->payable;


                $ud->save();
                $cf->save();
                $trans->save();
            } else {

                $trans->partof_cashflow = "yes";

                $check = CashierCashflow::where('transaction_id', '=', request("id"))->first();

                if (is_null($check)) {
                    $us = User::where('id', '=', $trans->user_id)->firstorfail();


                    $coh = User_detail::where('id', '=', $us->user_details_id)->firstorfail();
                    $oldcoh = $coh->cash_on_hand;
                    $coh->cash_on_hand += $trans->payable;

                    $newcoh = CashierCashflow::create([
                        'trans_date' => $trans->date_transac,
                        'type' => "Cash In",
                        'accountability' => $trans->accountability,
                        'amount' => $trans->payable,
                        'beg_cash' =>  null,
                        'end_cash' =>  null,
                        'user_id' => $trans->user_id,
                        'description' => $trans->transaction_type == "Sale" ? "Direct Sale" : $trans->transaction_type,
                        'transaction_id' => $trans->id,
                        'status' => "Late",
                    ]);
                    $coh->save();

                    $trans->save();
                } else {
                    $cf = CashierCashflow::where('transaction_id', '=', request("id"))->firstorfail();

                    $cf->status =  $cf->temp_status;

                    $us = User::where('id', '=', $cf->user_id)->firstorfail();

                    $ud = User_detail::where('id', '=', $us->user_details_id)->firstorfail();
                    $ud->cash_on_hand += $trans->payable;


                    $ud->save();
                    $cf->save();
                    $trans->save();
                }
            }

            $trans = Transaction::where('id', '=', request("id"))->firstorfail();

            return response()->json([
                'status' => 201,
                'message' => 'Resource created.',
                'incCashflow' => $trans->partof_cashflow,
            ], 201);
        } catch (Exception $e) {
            return $this->responseServerError('Error creating resource.');
        }
    }


    public function cashinadmin(Request $request)
    {
        // Get user from $request token.
        if (!$user = auth()->setRequest($request)->user()) {
            return $this->responseUnauthorized();
        }

        try {
            $coh = User_detail::where('id', '=', $user->user_details_id)->firstorfail();

            $oldcoh = $coh->cash_on_hand;
            $coh->cash_on_hand += request('amount');

            $new = CashierCashflow::create([
                'trans_date' => date("Y-m-d h:i:sa"),
                'type' => "Cash In",
                'accountability' => "Admin",
                'amount' => request('amount'),
                'beg_cash' =>  $oldcoh,
                'end_cash' =>  $coh->cash_on_hand,
                'user_id' => $user->id,
            ]);
            $coh->save();


            return response()->json([
                'status' => 201,
                'message' => 'Resource created.',
                'newamt' => $coh->cash_on_hand,
            ], 201);
        } catch (Exception $e) {
            return $this->responseServerError('Error creating resource.');
        }
    }
    public function updateCashflowStatus(Request $request)
    {
        // Get user from $request token.
        if (!$user = auth()->setRequest($request)->user()) {
            return $this->responseUnauthorized();
        }

        try {
            $coh = User_detail::where('id', '=', $user->user_details_id)->firstorfail();

            if ($coh->enable_cashflow == "no") {
                $coh->enable_cashflow =  "yes";
                $stat = "yes";
            } else {
                $coh->enable_cashflow =  "no";
                $stat = "no";
            }


            $coh->save();


            return response()->json([
                'status' => 201,
                'message' => 'Resource created.',
                'enablecf' => $stat,
            ], 201);
        } catch (Exception $e) {
            return $this->responseServerError('Error creating resource.');
        }
    }
    public function cashoutadmin(Request $request)
    {
        // Get user from $request token.
        if (!$user = auth()->setRequest($request)->user()) {
            return $this->responseUnauthorized();
        }

        try {
            $coh = User_detail::where('id', '=', $user->user_details_id)->firstorfail();

            $oldcoh = $coh->cash_on_hand;
            $coh->cash_on_hand -= request('amount');

            $new = CashierCashflow::create([
                'trans_date' => date("Y-m-d h:i:sa"),
                'type' => "Cash Out",
                'accountability' => "Admin",
                'amount' => request('amount'),
                'beg_cash' =>  $oldcoh,
                'end_cash' =>  $coh->cash_on_hand,
                'user_id' => $user->id,
            ]);
            $coh->save();


            return response()->json([
                'status' => 201,
                'message' => 'Resource created.',
                'newamt' => $coh->cash_on_hand,
            ], 201);
        } catch (Exception $e) {
            return $this->responseServerError('Error creating resource.');
        }
    }

    public function updatePettyCash(Request $request)
    {
        // Get user from $request token.
        if (!$user = auth()->setRequest($request)->user()) {
            return $this->responseUnauthorized();
        }

        try {
            $petty = CashierCashflow::where('id', request("id"))->firstOrFail();

           
            if (request('amount')) {
                $petty->amount = request('amount');
            }
            $petty->save();

            // return $this->responseResourceUpdated();
            return response()->json([
                'status' => 200,
                'message' => 'Update successful',
            ], 200);
        } catch (Exception $e) {
            return $this->responseServerError('Error updating resource.');
        }
    }

    public function destroyPetty(Request $request )
    {
        // Get user from $request token.
        if (!$user = auth()->setRequest($request)->user()) {
            return $this->responseUnauthorized();
        }

       



        try {

            $petty = CashierCashflow::where('id', request("id"))->firstOrFail();
            $petty->delete();
           
               
                // return $this->responseResourceDeleted();
                return response()->json([
                    'status' => 204,
                    'message' => "Deleted successfully"
                ], 204);
           
        } catch (Exception $e) {
            return $this->responseServerError('Error deleting resource.');
        }
    }
}
