<?php

namespace App\Http\Controllers;

use App\ActivityLog;
use App\Branch;
use App\CashierCashflow;
use App\CashonhandBackup;
use App\CreditBackup;
use App\Customer;
use App\DebitedItm;
use App\Defective;
use App\Delivery;
use App\Item;
use App\Item_count;
use App\Project;
use App\ReturnedItm;
use App\Supplier;
use App\Trans_item_backup;
use App\Transaction;
use App\Transaction_item;
use App\User;
use App\User_detail;
use DateTime;
use DateTimeZone;
use Illuminate\Http\Request;
use DB;

class Descriptions
{
    public $part;
}
class Trans_pay
{
    public $type;
    public $old;
    public $new;
}
class Trans_item
{
    public $code;
    public $name;
    public $oldbal;
    public $newbal;
    public $oldcol;
    public $newcol;
}
class Old_trans
{
    public $type;
    public $details;
}
class ModTransactionController extends Controller
{
    public function upTrans(Request $request)
    {
        // Get user from $request token.
        if (!$user = auth()->setRequest($request)->user()) {
            return $this->responseUnauthorized();
        }



        try {
            $trans = Transaction::where('id',  request('id'))->firstOrFail();

            $itms = [];
            $itmscrd = [];

            if (request('date')) {
                $parts = new Descriptions();
                $parts->part = "Date: " . $trans->date_transac . " to " . request('date') . "";
                $itms[] = $parts;
                $trans->date_transac = request('date');
                $trans->save();

                $this->addActLog($user->id, "update", $itms, $trans->code, request('reason'));
            }


            if (request('type') == "Credit") {

                if (request('chargecode')) {
                    $crd = Transaction::where('code',  request('chargecode'))->firstOrFail();
                    if ($crd) {
                        if (request('date')) {
                            $parts = new Descriptions();
                            $parts->part = "Date: " . $crd->date_transac . " to " . request('date') . "";
                            $itmscrd[] = $parts;
                            $crd->date_transac = request('date');
                            $crd->save();

                            $this->addActLog($user->id, "update", $itmscrd, $crd->code, request('reason'));
                        }
                    }
                }
            }

            if (request('type') == "Receiving") {
                // $crd = Transaction::where('charge_transaction_code',  request('trcode'))->firstOrFail();
                $crd = Transaction::where('charge_transaction_code',  request('trcode'))->first();
                if (!is_null($crd)) {
                    if (request('date')) {
                        $parts = new Descriptions();
                        $parts->part = "Date: " . $crd->date_transac . " to " . request('date') . "";
                        $itmscrd[] = $parts;
                        $crd->date_transac = request('date');
                        $crd->save();

                        $this->addActLog($user->id, "update", $itmscrd, $crd->code, request('reason'));
                    }
                }
            }

            if ($trans->transaction_type == "Sale") {
                if (request('date')) {
                    if ($trans->partof_cashflow == "yes") {
                        $this->updateCashOnHand($trans->id, request('ams'), request('date'));
                    }
                }
            }


            return response()->json([
                'status' => 200,
                'message' => 'Update successful',
                'code' => $trans->code
            ], 200);
        } catch (Exception $e) {
            return $this->responseServerError('Error updating resource.');
        }
    }

    public function deactivateTransaction(Request $request)
    {
        // Get user from $request token.
        if (!$user = auth()->setRequest($request)->user()) {
            return $this->responseUnauthorized();
        }



        try {

            $trans = Transaction::where('id',  request('trans_id'))->firstOrFail();

            if ($trans->payable == 0) {
                $trans->transaction_status = "Deactivated";
                $trans->save();
            }

            return response()->json([
                'status' => 200,
                'message' => 'Update successful',
            ], 200);
        } catch (Exception $e) {
            return $this->responseServerError('Error updating resource.');
        }
    }

    public function modPurchaseCredit(Request $request)
    {
        // Get user from $request token.
        if (!$user = auth()->setRequest($request)->user()) {
            return $this->responseUnauthorized();
        }



        try {

            $userdet =  User_detail::where('id', $user->user_details_id)->firstOrFail();  // get branch

            if (request("exist") == "yes") {
                $this->creditExist(request('id'), request('description'));
            } else if (request("exist") == "no") {
                $this->creditNotExist(request('id'), $user->id, $userdet->branch_id);
            }


            $trans =  Transaction::where('id', request('id'))->firstOrFail();

            $creditTrans =  Transaction::where('charge_transaction_code', $trans->code)
                ->where('transaction_type', '=', 'Credit')->first();


            if (is_null($creditTrans)) {
                $existC = "no";
            } else {
                $existC = "yes";
            }

            return response()->json([
                'status' => 200,
                'message' => 'Update successful',
                'exist_credit' => $existC,
            ], 200);
        } catch (Exception $e) {
            return $this->responseServerError('Error updating resource.');
        }
    }

    function creditExist($id, $description)
    {
        $trans =  Transaction::where('id', $id)->firstOrFail();

        $creditTrans =  Transaction::where('charge_transaction_code', $trans->code)
            ->where('transaction_type', '=', 'Credit')->firstOrFail();

        $supplier =  Supplier::where('id', $creditTrans->supplier_id)->firstOrFail();

        $supplier->balance -=  $creditTrans->payable;

        $backcredit = CreditBackup::create([
            'transaction' => json_encode($creditTrans),
            'description' => $description,
            'supplier_id' => $creditTrans->supplier_id,
        ]);

        $supplier->save();
        $creditTrans->delete();

        return $backcredit->id;
    }

    function creditNotExist($id, $user_id, $user_branch)
    {

        $trans =  Transaction::where('id', $id)->firstOrFail();

        $transItm =  Transaction_item::where('transaction_id', $id)->firstOrFail();

        $year = date("y");
        $year = substr($year, -2);
        $month = date("m");
        $day = date("d");

        $codeCredit = "CRD" . $transItm->supplier_id . $year . $day . $month . rand(100, 9999) . "PR"; //new

        $supplier =  Supplier::where('id', $transItm->supplier_id)->firstOrFail();
        $oldbal = $supplier->balance;
        $supplier->balance += $trans->payable;



        $newCredit = Transaction::create([
            'transaction_type' => "Credit",
            'user_id' => $user_id,
            'accountability' => "Supplier",
            'customer_name' => $supplier->name,
            'branch_id' => $user_branch,
            'code' => $codeCredit,
            'date_transac' => $trans->date_transac,
            'supplier_id' =>  $transItm->supplier_id,
            'beg_charge_bal' => $oldbal,
            'end_charge_bal' => $supplier->balance,
            'charge_transaction_code' => $trans->code,
            'charge_status' =>  "Unpaid",
            'payable' => $trans->payable,

        ]);

        $supplier->save();
    }




    public function upTransitems(Request $request)
    {
        // Get user from $request token.
        if (!$user = auth()->setRequest($request)->user()) {
            return $this->responseUnauthorized();
        }



        try {
            $trans = Transaction::where('code',  request('code'))->firstOrFail();

            $amtDue = 0;

            $upItms = [];


            if (request('tranItems')) {
                $trItems = json_decode(request('tranItems'), true);


                foreach ($trItems as $itm) {

                    $item =  Item::where('id', $itm["item_id"])->firstOrFail();

                    if (isset($itm["stat"])) {
                        $newItm = Transaction_item::create([
                            'item_status' => $itm["item_status"],
                            'unit_price' => $itm["unit_price"],
                            'original_price' => $itm["original_price"],
                            'quantity' => $itm["quantity"],
                            'transaction_id' => $itm["transaction_id"],
                            'supplier_id' => $itm["supplier_id"],
                            'item_id' => $itm["item_id"],
                        ]);
                        $parts = new Descriptions();
                        $parts->part = "Add-Item: " . $item->code . ", Qty: " . $itm["quantity"] . ", Org-price: " . $itm["original_price"];
                        $upItms[] = $parts;

                        $amtDue += $itm["original_price"] *  $itm["quantity"];
                    } else {
                        $exItm =  Transaction_item::where('id', $itm["id"])->firstOrFail();

                        $parts = new Descriptions();
                        $parts->part = "Modify-Item: " . $item->code .
                            ", Qty: " . $exItm->quantity . "->" . $itm["quantity"] .
                            ", Org-price: " . $item->original_price . "->" . $itm["original_price"];
                        ", Unit-price: " . $item->unit_price . "->" . $itm["unit_price"];
                        $upItms[] = $parts;

                        $exItm->unit_price = $itm["unit_price"];
                        $exItm->original_price = $itm["original_price"];
                        $exItm->quantity = $itm["quantity"];
                        $exItm->save();

                        $amtDue += $itm["original_price"] *  $itm["quantity"];
                    }
                }
            }


            if (request('deleted')) {
                $delItems = json_decode(request('deleted'), true);
                foreach ($delItems as $itm) {
                    $trn_itm = Transaction_item::where('id', $itm["id"])->firstOrFail();
                    $item =  Item::where('id', $trn_itm->item_id)->firstOrFail();

                    $delItem = Transaction_item::where('id',  $itm["id"])->firstOrFail();

                    $parts = new Descriptions();
                    $parts->part = "Deleted-Item: " . $item->code . ", Qty: " . $delItem->quantity . ", Org-price: " . $delItem->original_price . ", Unit-price: " . $delItem->unit_price;
                    $upItms[] = $parts;

                    $delItem->delete();
                }
            }

            $parts = new Descriptions();
            $parts->part = "Transaction-amount-due: " . $trans->payable . "->" . $amtDue;
            $upItms[] = $parts;

            $trans->payable = $amtDue;
            $trans->save();

            $this->addActLog($user->id, "update", $upItms, request('code'), request('reason'));


            $crd =  Transaction::where('charge_transaction_code',  request('code'))->first();
            if ($crd) {

                $upCrdItms = [];
                $partscrd = new Descriptions();
                $partscrd->part = "Transaction-amount-due: " . $crd->payable . "->" . $amtDue;
                $upCrdItms[] = $partscrd;
                $this->addActLog($user->id, "update", $upCrdItms, $crd->code, request('reason'));


                $crd->payable = $amtDue;
                $crd->save();
            }

            if (empty($trItems)) {





                $tr = Transaction::where('code', request('code'))->firstOrFail();
                $this->addActLog($user->id, "delete", [], $tr->code, request('reason'));
                $tr->delete();


                $trcr = Transaction::where('charge_transaction_code', request('code'))->firstOrFail();
                $this->addActLog($user->id, "delete", [], $trcr->code, request('reason'));
                $trcr->delete();
            }




            return response()->json([
                'status' => 200,
                'message' => 'Update successful',
                // 'code' => $trans->code
            ], 200);
        } catch (Exception $e) {
            return $this->responseServerError('Error updating resource.');
        }
    }


    public function upTransitemsNew(Request $request)
    {
        // Get user from $request token.
        if (!$user = auth()->setRequest($request)->user()) {
            return $this->responseUnauthorized();
        }

        $userdet =  User_detail::where('id', $user->user_details_id)->firstOrFail();

        try {
            $compare = null;
            $dateup = new DateTime("now", new DateTimeZone('Asia/Manila'));
            $dup = $dateup->format('Y-m-d H:i:s');

            $rawAmt = request("amntdue");
            $reqAmt = $rawAmt;

            $trans = Transaction::where('code',  request('code'))->firstOrFail();

            $transUp = Transaction::where('code',  request('code'))->firstOrFail();


            $rectrans = Transaction::leftJoin('transaction_items', 'transactions.id', '=', 'transaction_items.transaction_id')
                ->leftJoin('transactions as ct', 'transactions.code', '=', 'ct.charge_transaction_code')
                ->where('transactions.code',  request('code'))
                ->select(
                    'transactions.*',
                    DB::raw('COUNT(transaction_items.item_id) as total_items'),
                    'ct.code as credit',
                )->get();


            Trans_item_backup::create([
                'code' => request('code'),
                'type' => "Receiving Transaction",
                'items' => json_encode($rectrans),
                'date_transac' => $dup,
            ]);







            // $transCRDUp = Transaction::where('charge_transaction_code',  request('code'))->firstOrFail();
            $transCRDUp = Transaction::where('charge_transaction_code',  request('code'))->first();
            $transUp->last_update = $dup;
            $transUp->save();

            if ($transCRDUp) {
                $transCRDUp->last_update = $dup;
                $transCRDUp->save();
            }




            $transOld = Transaction::where('code',  request('code'))->get();
            $crdold =  Transaction::where('charge_transaction_code',  request('code'))->get();
            $oldtranspay =   $trans->payable;

            // $exItmold =  Transaction_item::where('transaction_id',  $trans->id)->firstOrFail();
            // $exItmold->replace_date =  $dup;
            // $exItmold->save(); 

            $itemupdate = [];
            if (request('tranItems')) {
                $trItems = json_decode(request('tranItems'), true);


                foreach ($trItems as $itm) {
                    if (isset($itm["up_stat"]) && $itm["up_stat"] == "yes") {
                        Transaction_item::where('transaction_id',  $trans->id)->where('item_id', $itm["item_id"])->update(['replace_date' => $dup]);
                        $nut = Transaction_item::where('transaction_id',  $trans->id)->where('item_id', $itm["item_id"])->get();

                        $itemupdate[] = $nut[0];
                    }
                }
            }

            $titms = Transaction_item::where('transaction_id',  $trans->id)->get();





            // $amtDue = 0;
            $amtDue = $trans->payable;
            $upItms = [];
            $itmBal = [];


            if (request('tranItems')) {
                // $trItems = json_decode(request('tranItems'), true);


                foreach ($trItems as $itm) {





                    $item =  Item::where('id', $itm["item_id"])->firstOrFail();
                    $itemcount =  Item_count::where('item_id', $itm["item_id"])->where('branch_id',  $trans->branch_id)->firstOrFail();

                    // $getTransItm =  Transaction_item::where('id', $itm["id"])->firstOrFail();

                    $tmcntOldBal = $itemcount->balance;
                    // $tmcntOldBal = $tmcntOldBal - $getTransItm->quantity;
                    $tmcntOldCol = $itemcount->collectible_amount;
                    // $tmcntOldCol = $tmcntOldCol - ($getTransItm->quantity *  $item->unit_price);

                    // $tmcntOldCol = $itemcount->balance * $item->unit_price;

                    if (isset($itm["stat"])) {
                        // $newItm = Transaction_item::create([
                        //     'item_status' => $itm["item_status"],
                        //     'unit_price' => $itm["unit_price"],
                        //     'original_price' => $itm["original_price"],
                        //     'quantity' => $itm["quantity"],
                        //     'transaction_id' => $itm["transaction_id"],
                        //     'supplier_id' => $itm["supplier_id"],
                        //     'item_id' => $itm["item_id"],
                        // ]);



                        $parts = new Descriptions();
                        $parts->part = "Add-Item: " . $item->code . ", Qty: " . $itm["quantity"] . ", Org-price: " . $itm["original_price"];
                        $upItms[] = $parts;

                        $amtDue += $itm["original_price"] *  $itm["quantity"];



                        // update item balance of a branch
                        $newItmCntBal = $tmcntOldBal + $itm["quantity"];
                        $newItmCntCol = $newItmCntBal * $item->unit_price;
                        $itemcount->balance =  $newItmCntBal;
                        $itemcount->collectible_amount =  $newItmCntCol;



                        Transaction_item::create([
                            'item_status' => "Received",
                            'unit_price' => $itm["unit_price"],
                            'beg_balance' => $tmcntOldBal,
                            'end_balance' =>  $newItmCntBal,
                            'original_price' =>  $itm["original_price"],
                            'quantity' => $itm["quantity"],
                            'transaction_id' => $itm["transaction_id"],
                            'supplier_id' =>  $itm["supplier_id"],
                            'beg_collectible' =>  $tmcntOldCol,
                            'end_collectible' =>  $newItmCntCol,
                            'item_id' => $itm["item_id"],
                            'charge_status' => "Unpaid",
                        ]);


                        // $newup = $this->newTrans("Update", $user->id, $trans->branch_id, $this->getCode("UPB"), date('Y-m-d'), $item->name, "Admin");
                        // $this->newTransItems("Update", $itm["unit_price"], $tmcntOldBal, $newItmCntBal, $itm["original_price"], $newup, $tmcntOldCol, $newItmCntCol, $itm["item_id"]);

                        // backup item balances
                        $tnItms = new Trans_item();
                        $tnItms->code = $item->code;
                        $tnItms->name = $item->name;
                        $tnItms->oldbal = $tmcntOldBal;
                        $tnItms->newbal = $newItmCntBal;
                        $tnItms->oldcol = $tmcntOldCol;
                        $tnItms->newcol = $newItmCntCol;
                        $itmBal[] = $tnItms;


                        $itemcount->save();
                    } else {
                        // Compare the Old item quantity and the new item quantity,  result will either duduct to item count or add
                        // Old trans qty - new trans qty
                        // If positive deduct the result to item count
                        // If negative add the result to item count


                        $exItm =  Transaction_item::where('id', $itm["id"])->firstOrFail();


                        if ($itm['up_stat'] == "yes") {

                            Trans_item_backup::create([
                                'code' => request('code'),
                                'type' => "Receiving Item",
                                'items' => json_encode([$exItm]),
                                'date_transac' => $dup,
                            ]);
                        }



                        $parts = new Descriptions();
                        $parts->part = "Modify-Item: " . $item->code .
                            ", Qty: " . $exItm->quantity . "->" . $itm["quantity"] .
                            ", Org-price: " . $item->original_price . "->" . $itm["original_price"];
                        ", Unit-price: " . $item->unit_price . "->" . $itm["unit_price"];
                        $upItms[] = $parts;

                        $compare = $exItm->quantity - $itm["quantity"];
                        $oldqty = $exItm->quantity;


                        $exItm->unit_price = $itm["unit_price"];
                        $exItm->original_price = $itm["original_price"];
                        $exItm->quantity = $itm["quantity"];



                        // $amtDue += $itm["original_price"] *  $itm["quantity"];




                        if ($compare > 0) {
                            $amtDue -= $itm["original_price"] *  $compare;
                            // update item balance of a branch
                            // $newItmCntBal = $tmcntOldBal -  $compare;
                            $newItmCntBal = $tmcntOldBal -  $compare;
                            $newItmCntCol = $newItmCntBal * $item->unit_price;
                            $itemcount->balance =  $newItmCntBal;
                            $itemcount->collectible_amount =  $newItmCntCol;
                            // $itemcount->save();

                            // $newupex = $this->newTrans("Update", $user->id, $trans->branch_id, $this->getCode("UPB"), date('Y-m-d'), $item->name, "Admin");
                            // $this->newTransItems("Update", $itm["unit_price"], $tmcntOldBal, $newItmCntBal, $itm["original_price"], $newupex, $tmcntOldCol, $newItmCntCol, $itm["item_id"]);

                            // backup item balances
                            $tnItms = new Trans_item();
                            $tnItms->code = $item->code;
                            $tnItms->name = $item->name;
                            $tnItms->oldbal = $tmcntOldBal;
                            $tnItms->newbal = $newItmCntBal;
                            $tnItms->oldcol = $tmcntOldCol;
                            $tnItms->newcol = $newItmCntCol;
                            $itmBal[] = $tnItms;

                            $exItm->beg_balance = $tmcntOldBal;
                            $exItm->end_balance = $newItmCntBal;
                            $exItm->beg_collectible = $tmcntOldCol;
                            $exItm->end_collectible = $newItmCntCol;



                            $itemcount->save();
                        } else if ($compare < 0) {

                            $amtDue += $itm["original_price"] * abs($compare);
                            // update item balance of a branch
                            $newItmCntBal = $tmcntOldBal + abs($compare);
                            $newItmCntCol = $newItmCntBal * $item->unit_price;
                            $itemcount->balance =  $newItmCntBal;
                            $itemcount->collectible_amount =  $newItmCntCol;


                            // $newupex = $this->newTrans("Update", $user->id, $trans->branch_id, $this->getCode("UPB"), date('Y-m-d'), $item->name, "Admin");
                            // $this->newTransItems("Update", $itm["unit_price"], $tmcntOldBal, $newItmCntBal, $itm["original_price"], $newupex, $tmcntOldCol, $newItmCntCol, $itm["item_id"]);

                            // backup item balances
                            $tnItms = new Trans_item();
                            $tnItms->code = $item->code;
                            $tnItms->name = $item->name;
                            $tnItms->oldbal = $tmcntOldBal;
                            $tnItms->newbal = $newItmCntBal;
                            $tnItms->oldcol = $tmcntOldCol;
                            $tnItms->newcol = $newItmCntCol;
                            $itmBal[] = $tnItms;

                            $exItm->beg_balance = $tmcntOldBal;
                            $exItm->end_balance = $newItmCntBal;
                            $exItm->beg_collectible = $tmcntOldCol;
                            $exItm->end_collectible = $newItmCntCol;

                            $itemcount->save();
                        }



                        // update transaction balances and collectibles
                        $exItm->save();
                    }
                }
            }


            if (request('deleted')) {
                $delItems = json_decode(request('deleted'), true);
                foreach ($delItems as $itm) {
                    $trn_itm = Transaction_item::where('id', $itm["id"])->firstOrFail();
                    $item =  Item::where('id', $trn_itm->item_id)->firstOrFail();

                    $itemcount =  Item_count::where('item_id', $trn_itm->item_id)->where('branch_id',  $trans->branch_id)->firstOrFail();
                    $tmcntOldBal = $itemcount->balance;
                    $tmcntOldCol = $itemcount->collectible_amount;

                    $delItem = Transaction_item::where('id',  $itm["id"])->firstOrFail();

                    $parts = new Descriptions();
                    $parts->part = "Deleted-Item: " . $item->code . ", Qty: " . $delItem->quantity . ", Org-price: " . $delItem->original_price . ", Unit-price: " . $delItem->unit_price;
                    $upItms[] = $parts;




                    $amtDue -= $delItem->original_price * $delItem->quantity;

                    // update item balance of a branch
                    $newItmCntBal = $tmcntOldBal -  $delItem->quantity;
                    $newItmCntCol = $newItmCntBal * $item->unit_price;
                    $itemcount->balance =  $newItmCntBal;
                    $itemcount->collectible_amount =  $newItmCntCol;


                    // $newupex = $this->newTrans("Update", $user->id, $trans->branch_id, $this->getCode("UPB"), date('Y-m-d'), $item->name, "Admin");
                    // $this->newTransItems("Update", $item->unit_price, $tmcntOldBal, $newItmCntBal, $item->original_price, $newupex, $tmcntOldCol, $newItmCntCol, $trn_itm->item_id);

                    // backup item balances
                    $tnItms = new Trans_item();
                    $tnItms->code = $item->code;
                    $tnItms->name = $item->name;
                    $tnItms->oldbal = $tmcntOldBal;
                    $tnItms->newbal = $newItmCntBal;
                    $tnItms->oldcol = $tmcntOldCol;
                    $tnItms->newcol = $newItmCntCol;
                    $itmBal[] = $tnItms;

                    $trn_itm->item_status = "Removed";
                    $trn_itm->delete_date =  $dup;
                    $trn_itm->old_transaction_id =  $trn_itm->transaction_id;
                    $trn_itm->transaction_id = null;
                    $trn_itm->beg_balance = $tmcntOldBal;
                    $trn_itm->end_balance = $newItmCntBal;
                    $trn_itm->beg_collectible = $tmcntOldCol;
                    $trn_itm->end_collectible = $newItmCntCol;


                    $trn_itm->save();
                    $itemcount->save();
                    // $delItem->delete();
                }
            }



            $oldmaintranpay = $trans->payable;
            $newmaintranpay = $oldmaintranpay - $trans->payable;
            $newmaintranpay = $newmaintranpay + $amtDue;


            // $trans->payable = $newmaintranpay;
            $trans->payable = $reqAmt;
            $trans->last_update = $dup;
            $trans->save();

            $parts = new Descriptions();
            $parts->part = "Transaction-amount-due: " . $oldmaintranpay . "->" . $newmaintranpay;
            $upItms[] = $parts;

            $this->addActLog($user->id, "update", $upItms, request('code'), request('reason'));
            $transPay = [];
            $transPayCrd = [];

            $crd =  Transaction::where('charge_transaction_code',  request('code'))->first();

            if ($crd) {


                Trans_item_backup::create([
                    'code' => request('code'),
                    'type' => "Receiving Credit",
                    'items' => json_encode([$crd]),
                    'date_transac' => $dup,
                ]);


                $oldtranspaycr = $crd->payable;


                $tpc = new Trans_pay();
                $tpc->type = "Credit";
                $tpc->old = $oldtranspaycr;
                $tpc->new = $amtDue;
                $transPay[] = $tpc;

                $sup =  Supplier::where('id', $crd->supplier_id)->firstOrFail();
                $oldsupbal = $sup->balance;
                // $oldsupbal = $sup->balance - $oldtranspaycr;
                $oldsupbal = $oldsupbal;

                $newsupbal = $oldsupbal - $oldtranspaycr;

                // $newsupbal = $newsupbal + $amtDue;
                $newsupbal = $newsupbal +  $reqAmt;

                $sup->balance = $newsupbal;

                $sup->save();


                $crd->beg_charge_bal = $oldsupbal;
                $crd->end_charge_bal = $newsupbal;

                $oldcrdtranpay = $crd->payable;
                $newcrdtranpay = $oldcrdtranpay - $crd->payable;

                $newcrdtranpay = $newcrdtranpay + $reqAmt;
                // $newcrdtranpay = $newcrdtranpay + $amtDue;


                $crd->payable = $reqAmt;
                // $crd->payable = $newcrdtranpay;
                $crd->last_update = $dup;
                $crd->save();


                $upCrdItms = [];
                $partscrd = new Descriptions();
                $partscrd->part = "Transaction-amount-due: " . $oldcrdtranpay . "->" . $newcrdtranpay;
                $upCrdItms[] = $partscrd;
                $this->addActLog($user->id, "update", $upCrdItms, $crd->code, request('reason'));

                // $new = Transaction::create([
                //     'transaction_type' => "Update",
                //     'user_id' => $user->id,
                //     'branch_id' => $userdet->branch_id,
                //     'code' => $this->getCode("UPSP"),
                //     'date_transac' => date('Y-m-d'),
                //     'customer_name' => $sup->name,
                //     'accountability' => "Supplier",
                //     'payable' =>  $amtDue,
                //     'supplier_id' =>  $sup->id,
                //     'beg_charge_bal' =>  $oldsupbal,
                //     'end_charge_bal' =>  $newsupbal,
                //     'description' =>  request('reason'),

                // ]);

                $supcrd = new Trans_pay();
                $supcrd->type = "Supplier_balance";
                $supcrd->old = $oldsupbal;
                $supcrd->new = $newsupbal;
                $transPayCrd[] = $supcrd;
            }

            // if (empty($trItems)) {

            //     $tr = Transaction::where('code', request('code'))->firstOrFail();
            //     $this->addActLog($user->id, "delete", [], $tr->code, request('reason'));
            //     $tr->delete();


            //     $trcr = Transaction::where('charge_transaction_code', request('code'))->firstOrFail();
            //     $this->addActLog($user->id, "delete", [], $trcr->code, request('reason'));
            //     $trcr->delete();
            // }


            // record old new transaction payable

            $tp = new Trans_pay();
            $tp->type = "Receiving";
            $tp->old = $oldtranspay;
            $tp->new = $amtDue;
            $transPay[] = $tp;

            $old_trans = [];

            $otrns = new Old_trans();
            $otrns->type = "Transaction";
            // $otrns->details = json_encode($transOld);
            $otrns->details = $transOld;
            $old_trans[] = $otrns;

            if ($crd) {
                $otrnscrd = new Old_trans();
                $otrnscrd->type = "Credit";
                // $otrnscrd->details = json_encode($crdold);
                $otrnscrd->details = $crdold;
                $old_trans[] = $otrnscrd;
            }

            $otrnsitm = new Old_trans();
            $otrnsitm->type = "Items";
            // $otrnsitm->details = json_encode($titms);
            // $otrnsitm->details = $titms;
            $otrnsitm->details = $itemupdate;
            $old_trans[] = $otrnsitm;

            // old_trans


            // Backup all items

            // $backup = Trans_item_backup::create([
            //     'code' => request('code'),
            //     'items' => json_encode($old_trans),
            //     'trans_payable' =>  json_encode($transPay),
            //     'credit_balance' => json_encode($transPayCrd),
            //     'item_balances' => json_encode($itmBal),
            // ]);



            return response()->json([
                'status' => 200,
                'message' => 'Update successful',
                'compare' => $compare,
                'nitem' => $itemupdate,
                'reqAmt' =>  $reqAmt
            ], 200);
        } catch (Exception $e) {
            return $this->responseServerError('Error updating resource.');
        }
    }


    public function transUpItm(Request $request)
    {
        // Get user from $request token.
        if (!$user = auth()->setRequest($request)->user()) {
            return $this->responseUnauthorized();
        }

        $userdet =  User_detail::where('id', $user->user_details_id)->firstOrFail();

        try {
            $trans = Transaction::where('code',  request('code'))->firstOrFail();
            $oldtranspay =   $trans->payable;
            $titms = Transaction_item::where('transaction_id',  $trans->id)->get();

            // $amtDue = 0;
            $amtDue = $trans->payable;


            if (request('tranItems')) {
                $trItems = json_decode(request('tranItems'), true);


                foreach ($trItems as $itm) {
                    $item =  Item::where('id', $itm["item_id"])->firstOrFail();
                    $itemcount =  Item_count::where('item_id', $itm["item_id"])->where('branch_id',  $trans->branch_id)->firstOrFail();

                    $tmcntOldBal = $itemcount->balance;
                    $tmcntOldCol = $itemcount->collectible_amount;

                    if (isset($itm["stat"])) {

                        $amtDue += $itm["original_price"] *  $itm["quantity"];

                        // update item balance of a branch
                        $newItmCntBal = $tmcntOldBal + $itm["quantity"];
                        $newItmCntCol = $newItmCntBal * $item->unit_price;
                        $itemcount->balance =  $newItmCntBal;
                        $itemcount->collectible_amount =  $newItmCntCol;
                        $itemcount->save();


                        Transaction_item::create([
                            'item_status' => "Received",
                            'unit_price' => $itm["unit_price"],
                            'beg_balance' => $tmcntOldBal,
                            'end_balance' =>  $newItmCntBal,
                            'original_price' =>  $itm["original_price"],
                            'quantity' => $itm["quantity"],
                            'transaction_id' => $itm["transaction_id"],
                            'supplier_id' =>  $itm["supplier_id"],
                            'beg_collectible' =>  $tmcntOldCol,
                            'end_collectible' =>  $newItmCntCol,
                            'item_id' => $itm["item_id"],
                            'charge_status' => "Unpaid",
                        ]);
                    } else {

                        $exItm =  Transaction_item::where('id', $itm["id"])->firstOrFail();


                        $newItmCntBal = $tmcntOldBal - $exItm->quantity;
                        $newItmCntBal = $newItmCntBal + $itm["quantity"];

                        $newItmCntCol = $newItmCntBal * $item->unit_price;

                        $itemcount->balance =  $newItmCntBal;
                        $itemcount->collectible_amount =  $newItmCntCol;
                        $itemcount->save();

                        $compare = $exItm->quantity - $itm["quantity"];

                        if ($compare > 0) {
                            $amtDue -= $itm["original_price"] *  $compare;
                            $newItmCntBal = $tmcntOldBal -  $compare;

                            $exItm->beg_balance = $tmcntOldBal;
                            $exItm->end_balance = $newItmCntBal;
                            $exItm->beg_collectible = $tmcntOldCol;
                            $exItm->end_collectible = $newItmCntCol;
                        } else if ($compare < 0) {
                            $amtDue += $itm["original_price"] * abs($compare);
                            $newItmCntBal = $tmcntOldBal + abs($compare);

                            $exItm->beg_balance = $tmcntOldBal;
                            $exItm->end_balance = $newItmCntBal;
                            $exItm->beg_collectible = $tmcntOldCol;
                            $exItm->end_collectible = $newItmCntCol;
                        }

                        $exItm->unit_price = $itm["unit_price"];
                        $exItm->original_price = $itm["original_price"];
                        $exItm->quantity = $itm["quantity"];
                        $exItm->save();
                    }
                }
            }
            if (request('deleted')) {
                $delItems = json_decode(request('deleted'), true);
                foreach ($delItems as $itm) {
                    $trn_itm = Transaction_item::where('id', $itm["id"])->firstOrFail();
                    $item =  Item::where('id', $trn_itm->item_id)->firstOrFail();

                    $itemcount =  Item_count::where('item_id', $trn_itm->item_id)->where('branch_id',  $trans->branch_id)->firstOrFail();
                    $tmcntOldBal = $itemcount->balance;
                    $tmcntOldCol = $itemcount->collectible_amount;

                    $amtDue -= $trn_itm->original_price * $trn_itm->quantity;

                    // update item balance of a branch
                    $newItmCntBal = $tmcntOldBal -  $trn_itm->quantity;
                    $newItmCntCol = $newItmCntBal * $item->unit_price;
                    $itemcount->balance =  $newItmCntBal;
                    $itemcount->collectible_amount =  $newItmCntCol;
                    $itemcount->save();

                    $trn_itm->item_status = "Removed";
                    $trn_itm->old_transaction_id =  $trn_itm->transaction_id;
                    $trn_itm->transaction_id = null;
                    $trn_itm->save();
                }
            }

            $oldmaintranpay = $trans->payable;
            $newmaintranpay = $oldmaintranpay - $trans->payable;
            $newmaintranpay = $newmaintranpay + $amtDue;
            $trans->payable = $newmaintranpay;
            $trans->save();

            $crd =  Transaction::where('charge_transaction_code',  request('code'))->first();

            if ($crd) {
                $oldtranspaycr = $crd->payable;
                $sup =  Supplier::where('id', $crd->supplier_id)->firstOrFail();
                $oldsupbal = $sup->balance;
                $newsupbal = $oldsupbal - $oldtranspaycr;
                $newsupbal = $newsupbal + $amtDue;

                $sup->balance = $newsupbal;
                $sup->save();

                $oldcrdtranpay = $crd->payable;
                $newcrdtranpay = $oldcrdtranpay - $crd->payable;
                $newcrdtranpay = $newcrdtranpay + $amtDue;

                $crd->payable = $newcrdtranpay;
                $crd->save();
            }

            return response()->json([
                'status' => 200,
                'message' => 'Update successful',
                // 'code' => $trans->code
            ], 200);
        } catch (Exception $e) {
            return $this->responseServerError('Error updating resource.');
        }
    }

    function addActLog($uid, $type, $desc, $code, $reason)
    {
        $act = ActivityLog::create([
            'user_id' => $uid,
            'type' => $type,
            'description' => json_encode($desc),
            'code' => $code,
            'reason' => $reason
        ]);
    }

    function getCode($ex)
    {

        $day = date("d");

        $random = rand(1111111111, 9999999999);
        if (strlen($day) == 1) {
            $day = "0" . $day;
        }
        $code = $ex . $random . $day;


        // check if the id exist
        $oldcode =  Transaction::where('code', $code)->first();
        if ($oldcode) {
            if (strlen($day) == 1) {
                $day = "0" . $day;
            }
            $random = rand(1111111111, 9999999999);
            $code = $ex . $random . $day;
        }

        return $code;
    }

    function newTrans($type, $user_id, $branch_id, $code, $date, $name, $acc)
    {
        $newup = Transaction::create([
            'transaction_type' => $type,
            'user_id' => $user_id,
            'branch_id' => $branch_id,
            'code' =>  $code,
            'date_transac' => $date,
            'customer_name' => $name,
            'accountability' => $acc,


        ]);

        return $newup->id;
    }

    function newTransItems($type, $unit_price, $beg_bal, $end_bal, $org_price, $trans_id, $beg_col, $end_col, $item_id)
    {
        $newup =  Transaction_item::create([
            'item_status' => $type,
            'unit_price' => $unit_price,
            'beg_balance' => $beg_bal,
            'end_balance' => $end_bal,
            'original_price' => $org_price,
            'transaction_id' => $trans_id,
            'beg_collectible' => $beg_col,
            'end_collectible' => $end_col,
            'item_id' => $item_id,
        ]);

        return $newup->id;
    }

    public function updateTransactionSales(Request $request)
    {
        // Get user from $request token.
        if (!$user = auth()->setRequest($request)->user()) {
            return $this->responseUnauthorized();
        }

        $userdet =  User_detail::where('id', $user->user_details_id)->firstOrFail();

        try {

            $transaction =  Transaction::where('id', request('id'))->firstOrFail();

            $otrnscrd = new Old_trans();
            $otrnscrd->type = "Transaction";
            $otrnscrd->details = $transaction;
            $old_trans[] = $otrnscrd;

            $delivery = null;

            if ($transaction->delivery_id) {
                $delivery =  Delivery::where('id', $transaction->delivery_id)->firstOrFail();
                $old_devfee =  $delivery->delivery_fee;

                $otrnscrd = new Old_trans();
                $otrnscrd->type = "Delivery";
                $otrnscrd->details = $delivery;
                $old_trans[] = $otrnscrd;
            } else {

                if (request('dev_address') || request('dev_contact') || request('dev_fee')) {

                    $newdelivery = Delivery::create([
                        'name' => $transaction->customer_name,
                        'address' => request('dev_address'),
                        'contact' => request('dev_contact'),
                        'delivery_fee' => request('dev_fee') ? request('dev_fee') : 0.00,
                    ]);

                    $transaction->delivery_id =  $newdelivery->id;

                    $delivery =  Delivery::where('id', $newdelivery->id)->firstOrFail();
                }

                $old_devfee = 0;
            }


            $backup = Trans_item_backup::create([
                'code' => $transaction->code,
                'items' => json_encode($old_trans),
                'type' =>  "Sale Update",
                'user_id' =>  $user->id,
                'trans_payable' =>  "[]",
                'credit_balance' => "[]",
                'item_balances' => "[]",
            ]);




            if (request('dev_fee')) {
                $payable =  $transaction->payable - $old_devfee;
                $payable =  $payable + request('dev_fee');
                $transaction->payable = $payable;
            }

            if (request('discount')) {
                $dispayable = $transaction->payable + $transaction->discount;
                $dispayable = $dispayable - request('discount');
                $transaction->payable = $dispayable;
            }


            // Delivery Details
            if (request('dev_address')) {
                $delivery->address = request('dev_address');
            }

            if (request('dev_contact')) {
                $delivery->contact = request('dev_contact');
            }

            if (request('dev_fee')) {
                $delivery->delivery_fee = request('dev_fee');
            }
            // Delivery Details


            // Transaction
            if (request('custname')) {
                $transaction->customer_name = request('custname');
                if ($delivery != null) {
                    $delivery->name = request('custname');
                }
            }

            if (request('date_transac')) {
                $transaction->date_transac = request('date_transac');
            }

            if (request('discount')) {
                $transaction->discount = request('discount');
            }

            if (request('amt_rec')) {
                $transaction->amount_received = request('amt_rec');
            }

            if (request('receipt_code')) {
                $transaction->receipt_code = request('receipt_code');
            }
            // Transaction


            $transaction->save();
            if ($delivery != null) {
                $delivery->save();
            }

            $trans =  Transaction::where('id', request('id'))->firstOrFail();
            if (request('discount') || request('dev_fee')) {

                if ($trans->partof_cashflow == "yes") {
                    $this->updateCashOnHand($trans->id, $trans->payable, request('date_transac'));
                }
            }

            if (request('date_transac')) {

                if ($trans->partof_cashflow == "yes") {
                    $this->updateCashOnHand($trans->id, request('ams'), request('date_transac'));
                }
            }


            return response()->json([
                'status' => 200,
                'message' => 'Update successful',
                // 'code' => $trans->code
            ], 200);
        } catch (Exception $e) {
            return $this->responseServerError('Error updating resource.');
        }
    }

    public function updateSalesItems(Request $request)
    {
        // Get user from $request token.
        if (!$user = auth()->setRequest($request)->user()) {
            return $this->responseUnauthorized();
        }

        $userdet =  User_detail::where('id', $user->user_details_id)->firstOrFail();

        try {


            $trItems = json_decode(request('tranItems'), true);
            $dateup = new DateTime("now", new DateTimeZone('Asia/Manila'));
            $dup = $dateup->format('Y-m-d H:i:s');

            foreach ($trItems as $itm) {

                // if(isset($itm["up_stat"])){

                if ($itm["up_stat"] == "yes") {
                    $transId = $itm["transaction_id"];

                    $transItm = Transaction_item::where('id', $itm["id"])->firstOrFail();
                    $transItm->replace_date = $dup;
                    $transItm->save();
                    $transItm = Transaction_item::where('id', $itm["id"])->firstOrFail();

                    $trans = Transaction::where('id', $itm["transaction_id"])->firstOrFail();
                    $itemcount =  Item_count::where('item_id', $transItm->item_id)->where('branch_id',  $trans->branch_id)->firstOrFail();
                    $item =  Item::where('id', $transItm->item_id)->firstOrFail();

                    $old_trans = [];
                    $otrnsitm = new Old_trans();
                    $otrnsitm->type = "Items";
                    $otrnsitm->details = $transItm;
                    $old_trans[] = $otrnsitm;

                    // Backup all items
                    $backup = Trans_item_backup::create([
                        'code' => $trans->code,
                        'type' =>  "Sale Update",
                        'user_id' =>  $user->id,
                        'items' => json_encode($old_trans),
                        'trans_payable' =>  "[]",
                        'credit_balance' => "[]",
                        'item_balances' => "[]",
                    ]);

                    $old_trans = [];
                    $otrnsitm = new Old_trans();
                    $otrnsitm->type = "Transaction";
                    $otrnsitm->details = $trans;
                    $old_trans[] = $otrnsitm;

                    // Backup all items
                    $backup = Trans_item_backup::create([
                        'code' => $trans->code,
                        'type' =>  "Sale Update",
                        'user_id' =>  $user->id,
                        'items' => json_encode($old_trans),
                        'trans_payable' =>  "[]",
                        'credit_balance' => "[]",
                        'item_balances' => "[]",
                    ]);


                    $old_transaction_item = $transItm;
                    $old_qty = $transItm->quantity;
                    $old_balance = $itemcount->balance;
                    $old_collectible = $itemcount->collectible_amount;

                    $transItm->quantity = $itm["quantity"];

                    $trans->payable -= $old_qty *  $transItm->unit_price;
                    $trans->payable += $itm["quantity"] *  $transItm->unit_price;

                    $itemcount->balance += $old_qty;
                    $itemcount->balance -= $itm["quantity"];
                    $itemcount->collectible_amount =  $itemcount->balance *  $item->unit_price;

                    $transItm->beg_balance = $old_balance;
                    $transItm->end_balance = $itemcount->balance;
                    $transItm->beg_collectible = $old_collectible;
                    $transItm->end_collectible = $itemcount->collectible_amount;



                    $transItm->save();
                    $trans->save();
                    $itemcount->save();
                }
                // }




            }

            $trans =  Transaction::where('id', $transId)->firstOrFail();

            if ($trans->partof_cashflow == "yes") {
                $this->updateCashOnHand($trans->id, $trans->payable, request('date_transac'));
            }


            return response()->json([
                'status' => 200,
                'message' => 'Update successful',
                // 'code' => $trans->code
            ], 200);
        } catch (Exception $e) {
            return $this->responseServerError('Error updating resource.');
        }
    }

    public function updateSalesItemsCharge(Request $request)
    {
        // Get user from $request token.
        if (!$user = auth()->setRequest($request)->user()) {
            return $this->responseUnauthorized();
        }

        $userdet =  User_detail::where('id', $user->user_details_id)->firstOrFail();

        try {


            $trItems = json_decode(request('tranItems'), true);
            $dateup = new DateTime("now", new DateTimeZone('Asia/Manila'));
            $dup = $dateup->format('Y-m-d H:i:s');

            foreach ($trItems as $itm) {

                // if(isset($itm["up_stat"])){

                if ($itm["up_stat"] == "yes") {
                    $transItm = Transaction_item::where('id', $itm["id"])->firstOrFail();
                    $transItm->replace_date = $dup;
                    $transItm->save();
                    $transItm = Transaction_item::where('id', $itm["id"])->firstOrFail();

                    $trans = Transaction::where('id', $itm["transaction_id"])->firstOrFail();
                    $itemcount =  Item_count::where('item_id', $transItm->item_id)->where('branch_id',  $trans->branch_id)->firstOrFail();
                    $item =  Item::where('id', $transItm->item_id)->firstOrFail();

                    $old_trans = [];
                    $otrnsitm = new Old_trans();
                    $otrnsitm->type = "Items";
                    $otrnsitm->details = $transItm;
                    $old_trans[] = $otrnsitm;

                    // Backup all items
                    $backup = Trans_item_backup::create([
                        'code' => $trans->code,
                        'type' =>  "Sale Update",
                        'user_id' =>  $user->id,
                        'items' => json_encode($old_trans),
                        'trans_payable' =>  "[]",
                        'credit_balance' => "[]",
                        'item_balances' => "[]",
                    ]);

                    $old_trans = [];
                    $otrnsitm = new Old_trans();
                    $otrnsitm->type = "Transaction";
                    $otrnsitm->details = $trans;
                    $old_trans[] = $otrnsitm;

                    // Backup all items
                    $backup = Trans_item_backup::create([
                        'code' => $trans->code,
                        'type' =>  "Sale Update",
                        'user_id' =>  $user->id,
                        'items' => json_encode($old_trans),
                        'trans_payable' =>  "[]",
                        'credit_balance' => "[]",
                        'item_balances' => "[]",
                    ]);




                    $old_transaction_item = $transItm;
                    $old_qty = $transItm->quantity;
                    $old_balance = $itemcount->balance;
                    $old_collectible = $itemcount->collectible_amount;

                    $transItm->quantity = $itm["quantity"];

                    $trans->payable -= $old_qty *  $transItm->unit_price;
                    $trans->payable += $itm["quantity"] *  $transItm->unit_price;


                    if ($trans->accountability == "Project") {
                        $entity =  Project::where('id', $trans->project_id)->firstOrFail();
                        $ent_old_bal = $entity->balance;

                        $entity->balance -= $old_qty *  $transItm->unit_price;
                        $entity->balance += $itm["quantity"] *  $transItm->unit_price;

                        $current_bal = $entity->balance;
                    } else if ($trans->accountability == "Customer") {
                        $entity =  Customer::where('id', $trans->customer_id)->firstOrFail();
                        $ent_old_bal = $entity->charge_balance;

                        $entity->charge_balance -= $old_qty *  $transItm->unit_price;
                        $entity->charge_balance += $itm["quantity"] *  $transItm->unit_price;

                        $current_bal = $entity->charge_balance;
                    } else if ($trans->accountability == "Maintenance") {
                        $entity =  Branch::where('id', $trans->office_id)->firstOrFail();
                        $ent_old_bal = $entity->balance;

                        $entity->balance -= $old_qty *  $transItm->unit_price;
                        $entity->balance += $itm["quantity"] *  $transItm->unit_price;

                        $current_bal = $entity->balance;
                    }

                    $trans->beg_charge_bal = $ent_old_bal;
                    $trans->end_charge_bal = $current_bal;



                    $itemcount->balance += $old_qty;
                    $itemcount->balance -= $itm["quantity"];
                    $itemcount->collectible_amount =  $itemcount->balance *  $item->unit_price;

                    $transItm->beg_balance = $old_balance;
                    $transItm->end_balance = $itemcount->balance;
                    $transItm->beg_collectible = $old_collectible;
                    $transItm->end_collectible = $itemcount->collectible_amount;




                    $entity->save();
                    $transItm->save();
                    $trans->save();
                    $itemcount->save();
                }
                // }




            }



            return response()->json([
                'status' => 200,
                'message' => 'Update successful',
                // 'code' => $trans->code
            ], 200);
        } catch (Exception $e) {
            return $this->responseServerError('Error updating resource.');
        }
    }


    public function addSalesItems(Request $request)
    {
        // Get user from $request token.
        if (!$user = auth()->setRequest($request)->user()) {
            return $this->responseUnauthorized();
        }

        $userdet =  User_detail::where('id', $user->user_details_id)->firstOrFail();

        try {


            $trans = Transaction::where('id', request('trans_id'))->firstOrFail();

            $old_transA = [];
            $otrnsitmA = new Old_trans();
            $otrnsitmA->type = "Transaction";
            $otrnsitmA->details = $trans;
            $old_transA[] = $otrnsitmA;

            // Backup all items
            $backup = Trans_item_backup::create([
                'code' => $trans->code,
                'type' =>  "Sale Update",
                'user_id' =>  $user->id,
                'items' => json_encode($old_transA),
                'trans_payable' =>  "[]",
                'credit_balance' => "[]",
                'item_balances' => "[]",
            ]);


            $itemcount =  Item_count::where('item_id', request('item_id'))->where('branch_id',  $trans->branch_id)->firstOrFail();

            $end_bal = $itemcount->balance - request('quantity');


            $item =  Item::where('id', request('item_id'))->firstOrFail();

            $itemcount->balance -= request('quantity');
            $itemcount->collectible_amount =  $itemcount->balance *  $item->unit_price;


            $new = Transaction_item::create([
                'item_status' => "Released",
                'unit_price' => $item->unit_price,
                'beg_balance' => $itemcount->balance,
                'end_balance' => $end_bal,
                'original_price' => $item->original_price,
                'beg_collectible' => $itemcount->collectible_amount,
                'end_collectible' => $end_bal *  $item->unit_price,
                'quantity' => request('quantity'),
                'transaction_id' => request('trans_id'),
                'item_id' => request('item_id'),
            ]);

            $trans->payable += request('quantity') *  $item->unit_price;
            $newpayable = $trans->payable;


            $transItm = Transaction_item::where('id', $new->id)->firstOrFail();

            $old_trans = [];
            $otrnsitm = new Old_trans();
            $otrnsitm->type = "Items";
            $otrnsitm->details = $transItm;
            $old_trans[] = $otrnsitm;

            // Backup all items
            $backup = Trans_item_backup::create([
                'code' => $trans->code,
                'type' =>  "Sale Add",
                'user_id' =>  $user->id,
                'items' => json_encode($old_trans),
                'trans_payable' =>  "[]",
                'credit_balance' => "[]",
                'item_balances' => "[]",
            ]);

            if ($trans->partof_cashflow == "yes") {
                $this->updateCashOnHand(request('trans_id'), $newpayable, request('date_transac'));
            }

            $trans->save();
            $itemcount->save();

            return response()->json([
                'status' => 200,
                'message' => 'Update successful',
                // 'code' => $trans->code
            ], 200);
        } catch (Exception $e) {
            return $this->responseServerError('Error updating resource.');
        }
    }

    public function addSalesItemsCharge(Request $request)
    {
        // Get user from $request token.
        if (!$user = auth()->setRequest($request)->user()) {
            return $this->responseUnauthorized();
        }

        $userdet =  User_detail::where('id', $user->user_details_id)->firstOrFail();

        try {


            $trans = Transaction::where('id', request('trans_id'))->firstOrFail();

            $old_transA = [];
            $otrnsitmA = new Old_trans();
            $otrnsitmA->type = "Transaction";
            $otrnsitmA->details = $trans;
            $old_transA[] = $otrnsitmA;

            // Backup all items
            $backup = Trans_item_backup::create([
                'code' => $trans->code,
                'type' =>  "Sale Update",
                'user_id' =>  $user->id,
                'items' => json_encode($old_transA),
                'trans_payable' =>  "[]",
                'credit_balance' => "[]",
                'item_balances' => "[]",
            ]);


            $itemcount =  Item_count::where('item_id', request('item_id'))->where('branch_id',  $trans->branch_id)->firstOrFail();

            $end_bal = $itemcount->balance - request('quantity');


            $item =  Item::where('id', request('item_id'))->firstOrFail();

            $itemcount->balance -= request('quantity');
            $itemcount->collectible_amount =  $itemcount->balance *  $item->unit_price;


            $new = Transaction_item::create([
                'item_status' => "Released",
                'unit_price' => $item->unit_price,
                'beg_balance' => $itemcount->balance,
                'end_balance' => $end_bal,
                'original_price' => $item->original_price,
                'beg_collectible' => $itemcount->collectible_amount,
                'end_collectible' => $end_bal *  $item->unit_price,
                'quantity' => request('quantity'),
                'transaction_id' => request('trans_id'),
                'item_id' => request('item_id'),
            ]);

            $trans->payable += request('quantity') *  $item->unit_price;

            if ($trans->accountability == "Project") {
                $entity =  Project::where('id', $trans->project_id)->firstOrFail();
                $ent_old_bal = $entity->balance;


                $entity->balance += request('quantity') *  $item->unit_price;

                $current_bal = $entity->balance;
            } else if ($trans->accountability == "Customer") {
                $entity =  Customer::where('id', $trans->customer_id)->firstOrFail();
                $ent_old_bal = $entity->charge_balance;


                $entity->charge_balance += request('quantity') *  $item->unit_price;

                $current_bal = $entity->charge_balance;
            } else if ($trans->accountability == "Maintenance") {
                $entity =  Branch::where('id', $trans->office_id)->firstOrFail();
                $ent_old_bal = $entity->balance;


                $entity->balance += request('quantity') *  $item->unit_price;

                $current_bal = $entity->balance;
            }


            $trans->beg_charge_bal = $ent_old_bal;
            $trans->end_charge_bal = $current_bal;

            $transItm = Transaction_item::where('id', $new->id)->firstOrFail();

            $old_trans = [];
            $otrnsitm = new Old_trans();
            $otrnsitm->type = "Items";
            $otrnsitm->details = $transItm;
            $old_trans[] = $otrnsitm;

            // Backup all items
            $backup = Trans_item_backup::create([
                'code' => $trans->code,
                'type' =>  "Sale Add",
                'user_id' =>  $user->id,
                'items' => json_encode($old_trans),
                'trans_payable' =>  "[]",
                'credit_balance' => "[]",
                'item_balances' => "[]",
            ]);

            $trans->save();
            $itemcount->save();
            $entity->save();

            return response()->json([
                'status' => 200,
                'message' => 'Update successful',
                // 'code' => $trans->code
            ], 200);
        } catch (Exception $e) {
            return $this->responseServerError('Error updating resource.');
        }
    }


    public function updateTransactionCharge(Request $request)
    {
        // Get user from $request token.
        if (!$user = auth()->setRequest($request)->user()) {
            return $this->responseUnauthorized();
        }

        $userdet =  User_detail::where('id', $user->user_details_id)->firstOrFail();

        try {

            $transaction =  Transaction::where('id', request('id'))->firstOrFail();

            $otrnscrd = new Old_trans();
            $otrnscrd->type = "Transaction";
            $otrnscrd->details = $transaction;
            $old_trans[] = $otrnscrd;

            $delivery = null;

            if ($transaction->delivery_id) {
                $delivery =  Delivery::where('id', $transaction->delivery_id)->firstOrFail();
                $old_devfee =  $delivery->delivery_fee;

                $otrnscrd = new Old_trans();
                $otrnscrd->type = "Delivery";
                $otrnscrd->details = $delivery;
                $old_trans[] = $otrnscrd;
            } else {

                if (request('dev_address') || request('dev_contact') || request('dev_fee')) {

                    $newdelivery = Delivery::create([
                        'name' => $transaction->customer_name,
                        'address' => request('dev_address'),
                        'contact' => request('dev_contact'),
                        'delivery_fee' => request('dev_fee') ? request('dev_fee') : 0.00,
                    ]);

                    $transaction->delivery_id =  $newdelivery->id;

                    $delivery =  Delivery::where('id', $newdelivery->id)->firstOrFail();
                }

                $old_devfee = 0;
            }

            $backup = Trans_item_backup::create([
                'code' => $transaction->code,
                'items' => json_encode($old_trans),
                'type' =>  "Sale Update",
                'user_id' =>  $user->id,
                'trans_payable' =>  "[]",
                'credit_balance' => "[]",
                'item_balances' => "[]",
            ]);



            if ($transaction->accountability == "Project") {
                $entity =  Project::where('id', $transaction->project_id)->firstOrFail();
                $ent_old_bal = $entity->balance;
                $current_bal = $entity->balance;
            } else if ($transaction->accountability == "Customer") {
                $entity =  Customer::where('id', $transaction->customer_id)->firstOrFail();
                $ent_old_bal = $entity->charge_balance;
                $current_bal = $entity->charge_balance;
            } else if ($transaction->accountability == "Maintenance") {
                $entity =  Branch::where('id', $transaction->office_id)->firstOrFail();
                $ent_old_bal = $entity->balance;
                $current_bal = $entity->balance;
            }





            if (request('dev_fee')) {

                $current_bal -= $transaction->payable;

                $payable =  $transaction->payable - $old_devfee;
                $payable =  $payable + request('dev_fee');
                $transaction->payable = $payable;

                $current_bal += $payable;
            }

            if (request('discount')) {
                $current_bal -= $transaction->payable;

                $dispayable = $transaction->payable + $transaction->discount;
                $dispayable = $dispayable - request('discount');
                $transaction->payable = $dispayable;

                $current_bal += $dispayable;
            }


            // Delivery Details
            if (request('dev_address')) {
                $delivery->address = request('dev_address');
            }

            if (request('dev_contact')) {
                $delivery->contact = request('dev_contact');
            }

            if (request('dev_fee')) {
                $delivery->delivery_fee = request('dev_fee');
            }
            // Delivery Details


            // Transaction
            if (request('custname')) {
                $transaction->customer_name = request('custname');
                if ($delivery != null) {
                    $delivery->name = request('custname');
                }
            }

            if (request('date_transac')) {
                $transaction->date_transac = request('date_transac');
            }

            if (request('discount')) {
                $transaction->discount = request('discount');
            }

            if (request('amt_rec')) {
                $transaction->amount_received = request('amt_rec');
            }
            // Transaction

            if (request('receipt_code')) {
                $transaction->receipt_code = request('receipt_code');
            }

            $transaction->beg_charge_bal = $ent_old_bal;
            $transaction->end_charge_bal = $current_bal;




            if ($transaction->accountability == "Project") {
                $entity->balance = $current_bal;
            } else if ($transaction->accountability == "Customer") {
                $entity->charge_balance = $current_bal;
            } else if ($transaction->accountability == "Maintenance") {
                $entity->balance = $current_bal;
            }


            $dateup = new DateTime("now", new DateTimeZone('Asia/Manila'));
            $dup = $dateup->format('Y-m-d H:i:s');
            $transaction->last_update = $dup;

            $entity->save();
            $transaction->save();
            if ($delivery != null) {
                $delivery->save();
            }

            return response()->json([
                'status' => 200,
                'message' => 'Update successful',
                // 'code' => $trans->code
            ], 200);
        } catch (Exception $e) {
            return $this->responseServerError('Error updating resource.');
        }
    }

    public function updatePaymentCharge(Request $request)
    {
        // Get user from $request token.
        if (!$user = auth()->setRequest($request)->user()) {
            return $this->responseUnauthorized();
        }

        $userdet =  User_detail::where('id', $user->user_details_id)->firstOrFail();

        try {

            $transaction =  Transaction::where('id', request('id'))->firstOrFail();

            $otrnscrd = new Old_trans();
            $otrnscrd->type = "Transaction";
            $otrnscrd->details = $transaction;
            $old_trans[] = $otrnscrd;



            $backup = Trans_item_backup::create([
                'code' => $transaction->code,
                'items' => json_encode($old_trans),
                'type' =>  "Payment charge Update",
                'user_id' =>  $user->id,
                'trans_payable' =>  "[]",
                'credit_balance' => "[]",
                'item_balances' => "[]",
            ]);



            if ($transaction->accountability == "Project") {
                $entity =  Project::where('id', $transaction->project_id)->firstOrFail();
                $ent_old_bal = $entity->balance;
                $current_bal = $entity->balance;
            } else if ($transaction->accountability == "Customer") {
                $entity =  Customer::where('id', $transaction->customer_id)->firstOrFail();
                $ent_old_bal = $entity->charge_balance;
                $current_bal = $entity->charge_balance;
            } else if ($transaction->accountability == "Maintenance") {
                $entity =  Branch::where('id', $transaction->office_id)->firstOrFail();
                $ent_old_bal = $entity->balance;
                $current_bal = $entity->balance;
            }



            if (request('payable')) {

                $current_bal += $transaction->payable;

                $current_bal -= request('payable');
            }


            // Transaction


            if (request('date_transac')) {
                $transaction->date_transac = request('date_transac');
            }

            if (request('payable')) {
                $transaction->payable = request('payable');
            }

            if (request('amt_rec')) {
                $transaction->amount_received = request('amt_rec');
            }
            // Transaction

            $transaction->beg_charge_bal = $ent_old_bal;
            $transaction->end_charge_bal = $current_bal;




            if ($transaction->accountability == "Project") {
                $entity->balance = $current_bal;
            } else if ($transaction->accountability == "Customer") {
                $entity->charge_balance = $current_bal;
            } else if ($transaction->accountability == "Maintenance") {
                $entity->balance = $current_bal;
            }


            $dateup = new DateTime("now", new DateTimeZone('Asia/Manila'));
            $dup = $dateup->format('Y-m-d H:i:s');
            $transaction->last_update = $dup;



            if ($transaction->partof_cashflow == "yes") {
                $this->updateCashOnHand(request('id'), request('payable'), request('date_transac'));
            }




            $entity->save();
            $transaction->save();





            return response()->json([
                'status' => 200,
                'message' => 'Update successful',
                // 'code' => $trans->code
            ], 200);
        } catch (Exception $e) {
            return $this->responseServerError('Error updating resource.');
        }
    }

    function updateCashOnHand($id, $amount, $date)
    {

        $coh = CashierCashflow::where('transaction_id', $id)->firstOrFail();

        $backup = CashonhandBackup::create([
            'coh_id' => $coh->id,
            'item' => json_encode($coh),
        ]);

        if ($amount) {
            $user = User::where('id', $coh->user_id)->firstOrFail();
            $userdet = User_detail::where('id', $user->user_details_id)->firstOrFail();

            $oldbalance = $userdet->cash_on_hand;

            $userdet->cash_on_hand -= $coh->amount;
            $userdet->cash_on_hand += $amount;

            $coh->amount = $amount;
            $coh->beg_cash = $oldbalance;
            $coh->end_cash = $userdet->cash_on_hand;

            $cashB = CashonhandBackup::where('id', $backup->id)->firstOrFail();
            $cashB->description = "Amount";

            $userdet->save();
            $coh->save();
            $cashB->save();
        }

        if ($date) {

            $cashB = CashonhandBackup::where('id', $backup->id)->firstOrFail();
            $cashB->description = "Date";

            $coh->trans_date = $date;

            $cashB->save();
            $coh->save();
        }

        if ($amount && $date) {
            $cashB = CashonhandBackup::where('id', $backup->id)->firstOrFail();
            $cashB->description = "Amount, Date";

            $cashB->save();
        }
    }

    public function modDebit(Request $request)
    {
        // Get user from $request token.
        if (!$user = auth()->setRequest($request)->user()) {
            return $this->responseUnauthorized();
        }



        try {

            $return_trans = Transaction::where('id', request('return_id'))->first();

            if (is_null($return_trans)) {
                return response()->json([
                    'status' => 400,
                    'message' => "No return transaction ID found",
                ], 400);
            }

            if (is_null(request('items'))) {
                return response()->json([
                    'status' => 400,
                    'message' => "No items found",
                ], 400);
            }

            $returned_itms = ReturnedItm::where('return_id', request('return_id'))->first();

            if (is_null($returned_itms)) { // Fill return_id or sale_id if null

                $returned_itms =  $this->upDebit_upReturndItm($return_trans->code, $return_trans->id);

                if (is_null($returned_itms)) {
                    return response()->json(['status' => 400, 'message' => "No return transaction CODE found",], 400);
                }

                $returned_itms_status = null; //testing
            } else {
                $returned_itms = ReturnedItm::where('return_id', request('return_id'))->first();

                $returned_itms_status = "normal"; //testing
            }



            $filt_return_trans = Transaction::where('id', $returned_itms->return_id)->first();

            if (is_null($filt_return_trans->debit_code)) { // if no debit connected

                $newDebit =   $this->createDebit($returned_itms->return_id, $returned_itms->sale_id);
                $filt_return_trans->debit_code = $newDebit->code;
                // $filt_return_trans->save();


                $debited_itms = DebitedItm::where('return_id', $returned_itms->return_id)->first();

                $linked_debited = "yes";
                $return_id_on_debtItms = "normal";
                if (is_null($debited_itms)) { // if no return id on debited_itms
                    $return_id_on_debtItms = "No return Id on debited Itms"; //testing

                    $debited_itms = DebitedItm::where('debit_code', '=', null)->where('sale_id', $returned_itms->sale_id)->first();

                    if (is_null($debited_itms)) { // if no sale id debited_itms

                        $return_id_on_debtItms = "No sale Id on debited Itms"; //testing

                        $debited_itms = DebitedItm::where('debit_code', '=', null)->where('sale_code', $returned_itms->sale_code)->first();
                        // $debited_itms = DebitedItm::where('sale_code', $returned_itms->sale_code)->where('debit_code', null) ->first();

                        if (is_null($debited_itms)) { // if no sale code found
                            return response()->json(['status' => 400, 'message' => "No sale code found on debited items table",], 400);
                        } else {
                            $return_id_on_debtItms = "Sale code found"; //testing
                            $linked_debited = "yes";
                        }
                    } else {
                        $linked_debited = "yes";
                    }
                }

                if ($linked_debited == "yes") { // the updated data on debited itms

                    if (is_null($debited_itms->return_id)) {
                        $debited_itms->return_id = $returned_itms->return_id;
                    }

                    if (is_null($debited_itms->sale_id)) {
                        $debited_itms->sale_id = $returned_itms->sale_id;
                    }

                    if (is_null($debited_itms->debit_id)) {
                        $debited_itms->debit_id = $newDebit->id;
                    }

                    if (is_null($debited_itms->debit_code)) {
                        $debited_itms->debit_code = $newDebit->code;
                    }
                }


                $filt_return_trans->save();
                $debited_itms->save();


                $return_trans_devitcode_satus = null; //testing
            } else {
                $return_trans_devitcode_satus = "normal"; //testing
                $return_id_on_debtItms = "normal"; //testing
                $linked_debited = "already linked"; //testing
            }


            // PROCESS_START
            $dateup = new DateTime("now", new DateTimeZone('Asia/Manila'));
            $dup = $dateup->format('Y-m-d H:i:s');

            $debit_trans = Transaction::where('code', $filt_return_trans->debit_code)->first();
            // Backup debit transaction
            Trans_item_backup::create([
                'code' => $filt_return_trans->debit_code,
                'type' => "Debit Update",
                'items' => json_encode([$debit_trans]),
                'date_transac' => $dup,
                'user_id' => $user->id,
            ]);

            $debit_trans->last_update = $dup;

            $total_converted_yes = 0;
            $total_converted_no = 0;

            $itmObj = json_decode(request('items'), true);

            foreach ($itmObj as $itm) {

                $trans_items = Transaction_item::where('id', $itm['id'])->first();


                Trans_item_backup::create([
                    'code' => $returned_itms->return_code,
                    'type' => "Item Update",
                    'items' => json_encode([$trans_items]),
                    'date_transac' => $dup,
                    'user_id' => $user->id,
                ]);

                if ($trans_items->debit == "yes") {
                    $total_converted_no += $trans_items->quantity * $trans_items->unit_price;
                } else {
                    $total_converted_yes += $trans_items->quantity * $trans_items->unit_price;
                }

                $trans_items->debit = $trans_items->debit == "yes" ? "no" : "yes";
                $trans_items->save();
            }

            // accountability

            if ($debit_trans->accountability == "Customer") {
                $account = Customer::where('id', $debit_trans->customer_id)->first();
                $old_acc_balance =  $account->charge_balance;
                $balance = $account->charge_balance;
            } else if ($debit_trans->accountability == "Project") {
                $account = Project::where('id', $debit_trans->project_id)->first();
                $old_acc_balance =  $account->balance;
                $balance = $account->balance;
            } else if ($debit_trans->accountability == "Office") {
                $account = Branch::where('id', $debit_trans->office_id)->first();
                $old_acc_balance =  $account->balance;
                $balance = $account->balance;
            }

            $balance -=  $total_converted_yes;
            $balance +=  $total_converted_no;

            if ($debit_trans->accountability == "Customer") {
                $account->charge_balance = $balance;
            } else {
                $account->balance = $balance;
            }


            $trans_items_debit_yes = Transaction_item::where('transaction_id', $returned_itms->return_id)->where('debit', "yes")->get();


            $newTotalDebit = 0;

            foreach ($trans_items_debit_yes as $dy) {
                $newTotalDebit += $dy['quantity'] * $dy['unit_price'];
            }

            $debited_itms = DebitedItm::where('return_id', $returned_itms->return_id)->first();
            $debit_trans_up = Transaction::where('id', $debited_itms->debit_id)->first();

            $debit_trans_up->payable =  $newTotalDebit;
            $debit_trans_up->beg_charge_bal =  $old_acc_balance;
            $debit_trans_up->end_charge_bal = $balance;


            $account->save();
            $debit_trans_up->save();
            $debit_trans->save();


            return response()->json([
                'status' => 200,
                'returned_itms_status' => $returned_itms_status, //testing
                'return_trans_debitcode_satus' => $return_trans_devitcode_satus, //testing
                'return_id_on_debtItms' => $return_id_on_debtItms, //testing
                'linked_debited' => $linked_debited, //testing
                // 'message' => 'Update successful',
                'returnItmnew' => [$returned_itms],
                'debit_transaction' => [$debit_trans],
                'total_converted_no' => $total_converted_no,
                'total_converted_yes' => $total_converted_yes,
                'account' => $account,
                'balance' => $balance,
                'newTotalDebit' => $newTotalDebit,




            ], 200);
        } catch (Exception $e) {
            return $this->responseServerError('Error updating resource.');
        }
    }

    function upDebit_upReturndItm($return_code, $return_id)
    {


        $returned_itms = ReturnedItm::where('return_code', $return_code)->first();

        if ($returned_itms) {

            $returned_itms->return_id = $return_id;

            if (is_null($returned_itms->sale_id)) {

                $sale_trans = Transaction::where('code', $returned_itms->sale_code)->firstOrFail();
                $returned_itms->sale_id = $sale_trans->id;
            }

            $returned_itms->save();


            return $returned_itms;
        } else {
            return null;
        }
    }

    function createDebit($return_id, $sale_id)
    {

        $return_trans = Transaction::where('id', $return_id)->first();
        $sale_trans = Transaction::where('id', $sale_id)->first();


        $newDebitTransaction = Transaction::create([
            'transaction_type' => "Debit",
            'accountability' =>  $return_trans->accountability,
            'user_id' => $return_trans->user_id,
            'branch_id' => $return_trans->branch_id,
            'customer_name' => $return_trans->customer_name,
            'code' => $this->generateCode("DB", $return_trans->date_transac, $return_trans->user_id, $return_trans->branch_id),
            'date_printed' => $return_trans->date_printed,
            'date_transac' =>  $return_trans->date_transac,
            'payable' =>  0,
            'customer_id' => $sale_trans->customer_id,
            'project_id' => $sale_trans->project_id,
            'office_id' => $sale_trans->office_id,
            'beg_charge_bal' =>  0,
            'end_charge_bal' =>  0,
        ]);


        return $newDebitTransaction;
    }

    function generateCode($initial, $date, $userid, $branch)
    {

        $year = date("y", strtotime($date));
        $month = date("m", strtotime($date));
        $day = date("d", strtotime($date));

        $code = $initial . $userid . $branch . $month . $day . $year . rand(00000, 99999);


        $sale_trans = Transaction::where('code', $code)->first();

        if (!is_null($sale_trans)) {
            while ($sale_trans->code == $code) {
                $code = $initial . $userid . $branch . $month . $day . $year . rand(00000, 99999);
            }
        }


        return $code;
    }
    public function updateReplaceCharge(Request $request)
    {
        if (!$user = auth()->setRequest($request)->user()) {
            return $this->responseUnauthorized();
        }
        try {
            $dateup = new DateTime("now", new DateTimeZone('Asia/Manila'));
            $dup = $dateup->format('Y-m-d H:i:s');

            // backup replace transaction
            $replace_trans =  Transaction::where('return_code', request("return_code"))
                ->where('transaction_type', "Charge")
                ->first();

            // get the old item amount (items on;y not included extra fees){
            $old_trans_items =  Transaction_item::where('transaction_id', $replace_trans->id)->get();

            $OldReplacePayable = 0;
            foreach ($old_trans_items as $tis) {
                $OldReplacePayable += $tis["quantity"] * $tis["unit_price"];
            }

            if (!is_null($replace_trans)) {
                Trans_item_backup::create([
                    'code' => request('return_code'),
                    'type' => "Replacement Charge Update",
                    'items' => json_encode([$replace_trans]),
                    'date_transac' => $dup,
                    'user_id' => $user->id,
                ]);
            }

            $this->UpReplaceContentOnly(request("mod_items"), request('return_code'), $dup, $replace_trans->branch_id, $user->id);

            //update transactions
            $trans_items =  Transaction_item::where('transaction_id', $replace_trans->id)->get();
            $NewReplacePayable = 0;

            foreach ($trans_items as $tis) {
                $NewReplacePayable += $tis["quantity"] * $tis["unit_price"];
            }

            //  Update entity balances
            if ($replace_trans->accountability == "Customer") {
                $account = Customer::where('id', $replace_trans->customer_id)->first();
                $old_acc_balance =  $account->charge_balance;
                $balance = $account->charge_balance;
            } else if ($replace_trans->accountability == "Project") {
                $account = Project::where('id', $replace_trans->project_id)->first();
                $old_acc_balance =  $account->balance;
                $balance = $account->balance;
            } else if ($replace_trans->accountability == "Office") {
                $account = Branch::where('id', $replace_trans->office_id)->first();
                $old_acc_balance =  $account->balance;
                $balance = $account->balance;
            }

            $balance -=  $OldReplacePayable;
            $balance +=  $NewReplacePayable;

            if ($replace_trans->accountability == "Customer") {
                $account->charge_balance = $balance;
            } else {
                $account->balance = $balance;
            }




            $replace_trans->payable -=  $OldReplacePayable;
            $replace_trans->payable +=  $NewReplacePayable;

            $newreptranspayable =  $replace_trans->payable;

            $replace_trans->last_update = $dup;
            $replace_trans->beg_charge_bal = $old_acc_balance;
            $replace_trans->end_charge_bal =  $balance;


            $replace_trans->save();
            $account->save();
        } catch (Exception $e) {
        }



        return response()->json([
            'status' => 200,
            'message' => "Success",

        ], 200);
    }
    public function updateReplace(Request $request)
    {
        if (!$user = auth()->setRequest($request)->user()) {
            return $this->responseUnauthorized();
        }

        try {

            $dateup = new DateTime("now", new DateTimeZone('Asia/Manila'));
            $dup = $dateup->format('Y-m-d H:i:s');

            // backup replace transaction
            $replace_trans =  Transaction::where('return_code', request("return_code"))
                ->where('transaction_type', "Replacement")
                ->first();

            // get the old item amount (items on;y not included extra fees){
            $old_trans_items =  Transaction_item::where('transaction_id', $replace_trans->id)->get();

            $OldReplacePayable = 0;
            foreach ($old_trans_items as $tis) {
                $OldReplacePayable += $tis["quantity"] * $tis["unit_price"];
            }
            // }

            if (!is_null($replace_trans)) {
                Trans_item_backup::create([
                    'code' => request('return_code'),
                    'type' => "Replacement Update",
                    'items' => json_encode([$replace_trans]),
                    'date_transac' => $dup,
                    'user_id' => $user->id,
                ]);
            }

            // backup excess transaction
            $excess_trans =  Transaction::where('return_code', request("return_code"))
                ->where('transaction_type', "Excess Payment")
                ->first();

            if (!is_null($excess_trans)) {
                Trans_item_backup::create([
                    'code' => request('return_code'),
                    'type' => "Excess Update",
                    'items' => json_encode([$excess_trans]),
                    'date_transac' => $dup,
                    'user_id' => $user->id,
                ]);
            }

            $this->UpReplaceContentOnly(request("mod_items"), request('return_code'), $dup, $replace_trans->branch_id, $user->id);


            //update transactions
            $trans_items =  Transaction_item::where('transaction_id', $replace_trans->id)->get();
            $NewReplacePayable = 0;

            foreach ($trans_items as $tis) {
                $NewReplacePayable += $tis["quantity"] * $tis["unit_price"];
            }

            $replace_trans->payable -=  $OldReplacePayable;
            $replace_trans->payable +=  $NewReplacePayable;
            $newreptranspayable =  $replace_trans->payable;
            $replace_trans->last_update = $dup;


            $retunTrans =  Transaction::where('code', request("return_code"))->first();

            $newExcessPay = $newreptranspayable - $retunTrans->payable;
            if ($newExcessPay >= 0) {
                if (!is_null($excess_trans)) {
                    $excess_trans->payable = $newExcessPay;
                    $excess_trans->last_update = $dup;
                    $excess_trans->save();
                } else {
                    if ($newExcessPay > 0) {
                        $newExcessTransaction = Transaction::create([
                            'transaction_type' => "Excess Payment",
                            'accountability' =>  $replace_trans->accountability,
                            'user_id' => $replace_trans->user_id,
                            'branch_id' => $replace_trans->branch_id,
                            'customer_name' => $replace_trans->customer_name,
                            'code' => $this->generateCode("EC", $replace_trans->date_transac, $replace_trans->user_id, $replace_trans->branch_id),
                            'date_printed' => $replace_trans->date_printed,
                            'date_transac' =>  $replace_trans->date_transac,
                            'payable' =>  $newExcessPay,
                            'return_code' => request("return_code"),

                        ]);
                    }
                }
            } else if ($newExcessPay < 0) {
                if (!is_null($excess_trans)) {
                    $excess_trans->payable = 0;
                    $excess_trans->last_update = $dup;
                    $excess_trans->save();
                }
            }

            $replace_trans->save();
        } catch (Exception $e) {
        }



        return response()->json([
            'status' => 200,
            'message' => "Success",

        ], 200);
    }

    function UpReplaceContentOnly($mod_items, $return_code, $date, $trans_branch_id, $cur_user_id)
    {
        $trItems = json_decode($mod_items, true);

        foreach ($trItems as $itm) {
            $trans_item =  Transaction_item::where('id', $itm["trItem_id"])->firstorfail(); //old transaction item
            Trans_item_backup::create([
                'code' => $return_code,
                'type' => "Replace Item Update",
                'items' => json_encode([$trans_item]),
                'date_transac' => $date,
                'user_id' => $cur_user_id,
            ]);

            $orgitems =  Item::where('id', $itm["item_id"])->firstorfail();
            $itemcount =  Item_count::where('item_id', $itm["item_id"])->where('branch_id', $trans_branch_id)->firstOrFail();

            $item_old_bal = $itemcount->balance;
            $item_old_col = $itemcount->collectible_amount;

            $itemcount->balance += $trans_item->quantity;
            $itemcount->balance -= $itm["quantity"];
            $itemcount->collectible_amount = $itemcount->balance * $orgitems->unit_price;

            $this->CreateUpdateTrans(
                $itm["item_id"],
                $cur_user_id,
                $trans_branch_id,
                $itm["item_name"],
                $item_old_bal,
                $itemcount->balance,
                $item_old_col,
                $itemcount->collectible_amount
            );

            $trans_item->quantity = $itm["quantity"];
            $trans_item->beg_balance = $item_old_bal;
            $trans_item->end_balance = $itemcount->balance;
            $trans_item->beg_collectible = $item_old_col;
            $trans_item->end_collectible = $itemcount->collectible_amount;
            $trans_item->replace_date = $date;

            $itemcount->save();
            $trans_item->save();
        }
    }

    public function updatereturn(Request $request)
    {
        // Get user from $request token.
        if (!$user = auth()->setRequest($request)->user()) {
            return $this->responseUnauthorized();
        }

        $userdet =  User_detail::where('id', $user->user_details_id)->firstOrFail();

        try {
            $dateup = new DateTime("now", new DateTimeZone('Asia/Manila'));
            $dup = $dateup->format('Y-m-d H:i:s');

            // backup return transaction
            $return_trans =  Transaction::where('code', request("return_code"))->firstorfail();

            // check if there is debit transaction
            if (request("type") == "Charge") {
                $debit_itms =  DebitedItm::where('return_id', $return_trans->id)->first();
                $old_debited_amount = 0;
                if (!is_null($debit_itms->debit_id)) {

                    $debit_trans =  Transaction::where('id', $debit_itms->debit_id)->firstorfail();
                    Trans_item_backup::create([
                        'code' => request('return_code'),
                        'type' => "Debit Update",
                        'items' => json_encode([$debit_trans]),
                        'date_transac' => $dup,
                        'user_id' => $user->id,
                    ]);

                    $old_debited_amount = $debit_trans->payable;
                }
            }

            // get the old item amount (items on;y not included extra fees){
            $old_trans_items =  Transaction_item::where('transaction_id', $return_trans->id)->get();

            $OldReturnPayable = 0;
            foreach ($old_trans_items as $tis) {
                $OldReturnPayable += $tis["quantity"] * $tis["unit_price"];
            }
            // }

            Trans_item_backup::create([
                'code' => request('return_code'),
                'type' => "Return Update",
                'items' => json_encode([$return_trans]),
                'date_transac' => $dup,
                'user_id' => $user->id,
            ]);

            // backup excess transaction
            $excess_trans =  Transaction::where('return_code', request("return_code"))
                ->where('transaction_type', "Excess Payment")
                ->first();

            if (!is_null($excess_trans)) {
                Trans_item_backup::create([
                    'code' => request('return_code'),
                    'type' => "Excess Update",
                    'items' => json_encode([$excess_trans]),
                    'date_transac' => $dup,
                    'user_id' => $user->id,
                ]);
            }
            // update items
            if (request("mod_type") == "Update") {
                $this->UpReturnContentOnly(request("mod_items"), request('return_code'), $dup, $return_trans->branch_id, $user->id);
            } else if (request("mod_type") == "Add") {
                $this->UpAddNewReturn(request("mod_items"), request('return_code'), $dup, $return_trans->branch_id, $user->id, $return_trans->id);
            }
            //update transactions
            $trans_items =  Transaction_item::where('transaction_id', $return_trans->id)->get();

            $NewReturnPayable = 0;

            $new_debited_amount = 0;
            $debit_present = "no";

            foreach ($trans_items as $tis) {
                $NewReturnPayable += $tis["quantity"] * $tis["unit_price"];

                if (request("type") == 'Charge') {
                    if ($tis["debit"] == "yes") {
                        $debit_present = "yes";
                        $new_debited_amount += $tis["quantity"] * $tis["unit_price"];
                    }
                }
            }

            $return_trans->payable -=  $OldReturnPayable;
            $return_trans->payable +=  $NewReturnPayable;
            $returntranspayable =  $return_trans->payable;
            $return_trans->last_update = $dup;
            $return_trans->save();

            $replacement_trans =  Transaction::where('return_code', request("return_code"))->where('transaction_type', "Replacement")->first();

            if (!is_null($replacement_trans)) {
                $excess_trans =  Transaction::where('return_code', request("return_code"))->where('transaction_type', "Excess Payment")->first();


                $newExcessPay = $replacement_trans->payable - $returntranspayable;

                if ($newExcessPay >= 0) {
                    if (!is_null($excess_trans)) {
                        $excess_trans->payable = $newExcessPay;
                        $excess_trans->last_update = $dup;
                        $excess_trans->save();
                    } else {

                        // $returned_sale_code =  ReturnedItm::where('return_code', request("return_code"))->first();
                        // $org_transaction =  Transaction::where('code', $returned_sale_code->sale_code)->first();
                        if ($newExcessPay > 0) {
                            $newExcessTransaction = Transaction::create([
                                'transaction_type' => "Excess Payment",
                                'accountability' =>  $return_trans->accountability,
                                'user_id' => $return_trans->user_id,
                                'branch_id' => $return_trans->branch_id,
                                'customer_name' => $return_trans->customer_name,
                                'code' => $this->generateCode("EC", $return_trans->date_transac, $return_trans->user_id, $return_trans->branch_id),
                                'date_printed' => $return_trans->date_printed,
                                'date_transac' =>  $return_trans->date_transac,
                                'payable' =>  $newExcessPay,
                                'return_code' => request("return_code"),

                            ]);
                        }
                    }
                } else if ($newExcessPay < 0) {
                    if (!is_null($excess_trans)) {
                        $excess_trans->payable = 0;
                        $excess_trans->last_update = $dup;
                        $excess_trans->save();
                    }
                }
            }

            if (request("type") == "Charge") {
                if ($debit_present == "yes") {
                    $this->UpdateReturnDebit(request("return_code"), $old_debited_amount, $new_debited_amount, $debit_present, $dup);
                }
            }


            return response()->json([
                'status' => 200,
                'message' => 'Update successful',
                'OldReturnPayable' => $OldReturnPayable,
                'NewReturnPayable' => $NewReturnPayable,
                'returntranspayable' => $returntranspayable,
            ], 200);
        } catch (Exception $e) {
            return $this->responseServerError('Error updating resource.');
        }
    }

    function UpdateReturnDebit($return_code, $old_debited_amount, $new_debited_amount, $debit_present, $date)
    {
        $return_trans =  Transaction::where('code', $return_code)->firstorfail();
        $debit_itms =  DebitedItm::where('return_id', $return_trans->id)->first();
        $sale_trans =  Transaction::where('code', $debit_itms->sale_code)->firstorfail();

        if (!is_null($debit_itms->debit_id)) {
            $debit_trans =  Transaction::where('id', $debit_itms->debit_id)->firstorfail();

            //get old balances
            if ($debit_trans->accountability == "Customer") {
                $account = Customer::where('id', $debit_trans->customer_id)->first();
                $old_acc_balance =  $account->charge_balance;
                $balance = $account->charge_balance;
            } else if ($debit_trans->accountability == "Project") {
                $account = Project::where('id', $debit_trans->project_id)->first();
                $old_acc_balance =  $account->balance;
                $balance = $account->balance;
            } else if ($debit_trans->accountability == "Office") {
                $account = Branch::where('id', $debit_trans->office_id)->first();
                $old_acc_balance =  $account->balance;
                $balance = $account->balance;
            }

            //update the baalnces
            $balance +=  $old_debited_amount;
            $balance -=  $new_debited_amount;

            if ($debit_trans->accountability == "Customer") {
                $account->charge_balance = $balance;
            } else {
                $account->balance = $balance;
            }

            $debit_trans->payable -= $old_debited_amount;
            $debit_trans->payable += $new_debited_amount;

            $debit_trans->beg_charge_bal = $old_acc_balance;
            $debit_trans->end_charge_bal = $balance;
            $debit_trans->last_update = $date;

            $debit_trans->save();
            $account->save();
        } else if (is_null($debit_itms->debit_id)) {
            if ($debit_present == "yes") {
                if ($sale_trans->accountability == "Customer") {
                    $account = Customer::where('id', $sale_trans->customer_id)->first();
                    $old_acc_balance =  $account->charge_balance;
                    $balance = $account->charge_balance;
                    $customer_id = $sale_trans->customer_id;
                } else if ($sale_trans->accountability == "Project") {
                    $account = Project::where('id', $sale_trans->project_id)->first();
                    $old_acc_balance =  $account->balance;
                    $balance = $account->balance;
                    $project_id = $sale_trans->project_id;
                } else if ($sale_trans->accountability == "Office") {
                    $account = Branch::where('id', $sale_trans->office_id)->first();
                    $old_acc_balance =  $account->balance;
                    $balance = $account->balance;
                    $office_id = $sale_trans->office_id;
                }

                //update the baalnces

                $balance -=  $new_debited_amount;

                if ($sale_trans->accountability == "Customer") {
                    $account->charge_balance = $balance;
                } else {
                    $account->balance = $balance;
                }

                $newDebitTransaction = Transaction::create([
                    'transaction_type' => "Debit",
                    'accountability' =>  $sale_trans->accountability,
                    'user_id' => $sale_trans->user_id,
                    'branch_id' => $sale_trans->branch_id,
                    'customer_name' => $sale_trans->customer_name,
                    // 'amount_received' => request('amount_received'),
                    'code' => $this->generateCode("DB", date("Y-m-d"), $sale_trans->user_id, $sale_trans->branch_id),
                    'date_printed' =>  $date,
                    'date_transac' =>  date("Y-m-d"),
                    'payable' =>  $new_debited_amount,
                    'customer_id' =>  $customer_id,
                    'project_id' =>  $project_id,
                    'office_id' =>  $office_id,
                    'beg_charge_bal' =>  $old_acc_balance,
                    'end_charge_bal' =>  $balance,
                ]);

                $debit_itms->debit_id =  $newDebitTransaction->id;

                $debit_itms->save();
                $account->save();
            }
        }
    }


    function UpReturnContentOnly($mod_items, $return_code, $date, $trans_branch_id, $cur_user_id)
    {
        $trItems = json_decode($mod_items, true);


        foreach ($trItems as $itm) {
            $trans_item =  Transaction_item::where('id', $itm["trItem_id"])->firstorfail(); //old transaction item
            Trans_item_backup::create([
                'code' => $return_code,
                'type' => "Item Update",
                'items' => json_encode([$trans_item]),
                'date_transac' => $date,
                'user_id' => $cur_user_id,
            ]);

            if ($itm["item_status"]) {
                if ($itm["item_status"] == "Defective") {
                    if ($trans_item->item_status == "Returned GC") {

                        $orgitems =  Item::where('id', $itm["item_id"])->firstorfail();
                        $itemcount =  Item_count::where('item_id', $itm["item_id"])->where('branch_id', $trans_branch_id)->firstOrFail();
                        $defectItem = Defective::where('item_id', '=', $itm["item_id"])->where('branch_id', '=', $trans_branch_id)->first();

                        if (!is_null($defectItem)) {
                            $def_item_old_bal = $defectItem->balance;
                        } else {
                            $def_item_old_bal = 0;
                        }

                        $item_old_bal = $itemcount->balance;
                        $item_old_col = $itemcount->collectible_amount;
                        $itemcount->balance -= $trans_item->quantity;
                        $itemcount->collectible_amount = $itemcount->balance * $orgitems->unit_price;

                        $this->CreateUpdateTrans(
                            $itm["item_id"],
                            $cur_user_id,
                            $trans_branch_id,
                            $itm["item_name"],
                            $item_old_bal,
                            $itemcount->balance,
                            $item_old_col,
                            $itemcount->collectible_amount
                        );

                        $end_def = $this->DefectiveUpRet(
                            $trans_branch_id,
                            $itm["item_id"],
                            $itm["quantity"],
                            $cur_user_id,
                            $itm["item_name"],
                            "retgc_def",
                            " "
                        );

                        $trans_item->item_status = $itm["item_status"];
                        $trans_item->quantity = $itm["quantity"];
                        $trans_item->beg_balance = $item_old_bal;
                        $trans_item->end_balance = $itemcount->balance;
                        $trans_item->beg_collectible = $item_old_col;
                        $trans_item->end_collectible = $itemcount->collectible_amount;
                        $trans_item->beg_def_bal = $def_item_old_bal;
                        $trans_item->end_def_bal = $end_def;
                        $trans_item->replace_date = $date;

                        $itemcount->save();
                        $trans_item->save();
                    } else if ($trans_item->item_status == "Defective") {

                        $defectItem = Defective::where('item_id', '=', $itm["item_id"])->where('branch_id', '=', $trans_branch_id)->first();
                        $def_item_old_bal = $defectItem->balance;

                        $end_def = $this->DefectiveUpRet(
                            $trans_branch_id,
                            $itm["item_id"],
                            $itm["quantity"],
                            $cur_user_id,
                            $itm["item_name"],
                            "def_def",
                            $trans_item->quantity
                        );

                        $trans_item->quantity = $itm["quantity"];
                        $trans_item->beg_def_bal = $def_item_old_bal;
                        $trans_item->end_def_bal = $end_def;
                        $trans_item->replace_date = $date;
                        $trans_item->save();
                    }
                } else if ($itm["item_status"] == "Returned GC") {




                    if ($trans_item->item_status == "Defective") {

                        $orgitems =  Item::where('id', $itm["item_id"])->firstorfail();
                        $itemcount =  Item_count::where('item_id', $itm["item_id"])->where('branch_id', $trans_branch_id)->firstOrFail();
                        $defectItem = Defective::where('item_id', '=', $itm["item_id"])->where('branch_id', '=', $trans_branch_id)->first();

                        if (!is_null($defectItem)) {
                            $def_item_old_bal = $defectItem->balance;
                        } else {
                            $def_item_old_bal = 0;
                        }

                        $end_def = $this->DefectiveUpRet(
                            $trans_branch_id,
                            $itm["item_id"],
                            $itm["quantity"],
                            $cur_user_id,
                            $itm["item_name"],
                            "def_retgc",
                            $trans_item->quantity
                        );

                        $item_old_bal = $itemcount->balance;
                        $item_old_col = $itemcount->collectible_amount;
                        $itemcount->balance += $itm["quantity"];
                        $itemcount->collectible_amount = $itemcount->balance * $orgitems->unit_price;

                        $this->CreateUpdateTrans(
                            $itm["item_id"],
                            $cur_user_id,
                            $trans_branch_id,
                            $itm["item_name"],
                            $item_old_bal,
                            $itemcount->balance,
                            $item_old_col,
                            $itemcount->collectible_amount
                        );

                        $trans_item->item_status = $itm["item_status"];
                        $trans_item->quantity = $itm["quantity"];
                        $trans_item->beg_balance = $item_old_bal;
                        $trans_item->end_balance = $itemcount->balance;
                        $trans_item->beg_collectible = $item_old_col;
                        $trans_item->end_collectible = $itemcount->collectible_amount;
                        $trans_item->beg_def_bal = $def_item_old_bal;
                        $trans_item->end_def_bal = $end_def;
                        $trans_item->replace_date = $date;

                        $itemcount->save();
                        $trans_item->save();
                    } else if ($trans_item->item_status == "Returned GC") {
                        $orgitems =  Item::where('id', $itm["item_id"])->firstorfail();
                        $itemcount =  Item_count::where('item_id', $itm["item_id"])->where('branch_id', $trans_branch_id)->firstOrFail();

                        $item_old_bal = $itemcount->balance;
                        $item_old_col = $itemcount->collectible_amount;

                        $itemcount->balance -= $trans_item->quantity;
                        $itemcount->balance += $itm["quantity"];
                        $itemcount->collectible_amount = $itemcount->balance * $orgitems->unit_price;

                        $this->CreateUpdateTrans(
                            $itm["item_id"],
                            $cur_user_id,
                            $trans_branch_id,
                            $itm["item_name"],
                            $item_old_bal,
                            $itemcount->balance,
                            $item_old_col,
                            $itemcount->collectible_amount
                        );

                        $trans_item->item_status = $itm["item_status"];
                        $trans_item->quantity = $itm["quantity"];
                        $trans_item->beg_balance = $item_old_bal;
                        $trans_item->end_balance = $itemcount->balance;
                        $trans_item->beg_collectible = $item_old_col;
                        $trans_item->end_collectible = $itemcount->collectible_amount;
                        $trans_item->replace_date = $date;

                        $itemcount->save();
                        $trans_item->save();
                    }
                }
            }
        }
    }

    function UpAddNewReturn($mod_items, $return_code, $date, $trans_branch_id, $cur_user_id, $return_trans_id)
    {
        $trItems = json_decode($mod_items, true);

        foreach ($trItems as $itm) {
            $orgItem = Item::where('id', $itm["item_id"])->firstOrFail();
            $itemcount =  Item_count::where('item_id', $itm["item_id"])->where('branch_id', $trans_branch_id)->firstOrFail();

            $beg_balance = $itemcount->balance;
            $beg_collectible = $itemcount->collectible_amount;

            $beg_def_bal = null;
            $end_def_bal = null;

            if ($itm["item_status"] == "Returned GC") {
                $itemcount->balance += $itm["quantity"];
                $itemcount->collectible_amount = $itemcount->balance * $orgItem->unit_price;
                $item_status = "Returned GC";

                $itemcount->save();
            } else if ($itm["item_status"] == "Defective") {

                $defectItem = Defective::where('item_id', '=', $itm["item_id"])
                    ->where('branch_id', '=', $trans_branch_id)
                    ->first();

                if (is_null($defectItem)) {
                    $newDefect = Defective::create([
                        'item_id' => $itm["item_id"],
                        'balance' => $itm["quantity"],
                        'branch_id' => $trans_branch_id,
                    ]);
                } else {
                    $beg_def_bal = $defectItem->balance;
                    $defectItem->balance += $itm["quantity"];
                    $end_def_bal = $defectItem->balance;
                    $defectItem->save();
                }
                $item_status = "Defective";
            }

            //add transaction item for return
            $returnTransactItem = Transaction_item::create([
                'item_status' => $item_status,
                'unit_price' => $orgItem->unit_price,
                'beg_balance' => $beg_balance,
                'end_balance' => $itemcount->balance,
                'original_price' => $orgItem->original_price,
                'beg_collectible' => $beg_collectible,
                'end_collectible' => $itemcount->collectible_amount,
                'beg_def_bal' => $beg_def_bal,
                'end_def_bal' => $end_def_bal,
                'quantity' => $itm["quantity"],
                'transaction_id' => $return_trans_id,
                'item_id' => $itm["item_id"],
                'debit' => $itm["item_debit"],
            ]);
        }
    }




    function DefectiveUpRet($trans_branch_id, $item_id, $quantity, $cur_user_id, $item_name, $type, $old_qty)
    {
        $defectItem = Defective::where('item_id', '=', $item_id)
            ->where('branch_id', '=', $trans_branch_id)
            ->first(); //search for existing defetive item count
        if (is_null($defectItem)) {
            $newDefect = Defective::create([
                'item_id' => $item_id,
                'balance' =>  $quantity,
                'branch_id' => $trans_branch_id,
            ]);

            $end_def = $quantity;
        } else {
            $old_def_bal =  $defectItem->balance;

            if ($type == "retgc_def") {
                $defectItem->balance += $quantity;
            } else if ($type == "def_def") {
                $defectItem->balance -= $old_qty;
                $defectItem->balance += $quantity;
            } else if ($type == "def_retgc") {
                $defectItem->balance -= $old_qty;
            }

            $end_def = $defectItem->balance;

            $code = $this->generateCode("UPB", date("Y-m-d"), $cur_user_id, $trans_branch_id);

            $orgitems =  Item::where('id', $item_id)->firstorfail();


            $new = Transaction::create([
                'transaction_type' => "Update Defective",
                'user_id' => $cur_user_id,
                'branch_id' => $trans_branch_id,
                'code' => $code,
                'date_transac' => date('Y-m-d'),
                'customer_name' => $item_name,
                'accountability' => "Admin",


            ]);
            Transaction_item::create([
                'item_status' => "Update Defective",
                'unit_price' => $orgitems->unit_price,
                'original_price' => $orgitems->original_price,
                'transaction_id' => $new->id,
                'item_id' =>  $item_id,
                'beg_def_bal' =>  $old_def_bal,
                'end_def_bal' =>  $defectItem->balance,
            ]);

            $defectItem->save();
        }

        return $end_def;
    }

    function CreateUpdateTrans($item_id, $cur_user_id, $trans_branch_id, $item_name, $oldbal, $newbal, $oldcol, $endcol)
    {
        // // generate code

        // $day = date("d");

        // $random = rand(1111111111, 9999999999);
        // if (strlen($day) == 1) {
        //     $day = "0" . $day;
        // }
        // $code = "UPB" . $random . $day;


        // // check if the id exist
        // $oldcode =  Transaction::where('code', $code)->first();
        // if ($oldcode) {
        //     if (strlen($day) == 1) {
        //         $day = "0" . $day;
        //     }
        //     $random = rand(1111111111, 9999999999);
        //     $code = "UPB" . $random . $day;
        // }
        // // generate code

        $code = $this->generateCode("UPB", date("Y-m-d"), $cur_user_id, $trans_branch_id);

        $orgitems =  Item::where('id', $item_id)->firstorfail();


        $new = Transaction::create([
            'transaction_type' => "Update",
            'user_id' => $cur_user_id,
            'branch_id' => $trans_branch_id,
            'code' => $code,
            'date_transac' => date('Y-m-d'),
            'customer_name' => $item_name,
            'accountability' => "Admin",
            'date_printed' => date("m/d/Y H:i:s"),


        ]);
        Transaction_item::create([
            'item_status' => "Update",
            'unit_price' => $orgitems->unit_price,
            'beg_balance' => $oldbal,
            'end_balance' => $newbal,
            'original_price' => $orgitems->original_price,
            'transaction_id' => $new->id,
            'beg_collectible' => $oldcol,
            'end_collectible' => $endcol,
        ]);
    }

    public function placeSN_DR(Request $request)
    {
        if (!$user = auth()->setRequest($request)->user()) {
            return $this->responseUnauthorized();
        }

        try {

            $branch = Branch::select('branches.*')->get();

            foreach ($branch as $b) {

                $trans =  Transaction::where('transaction_type', "Sale")->where('branch_id', $b['id'])
                    ->orderBy('created_at', 'ASC')->get();
                $i = 1;
                foreach ($trans as $t) {
                    $single = Transaction::where('id', $t["id"])->first();

                    // if (is_null($single->series_no)) {
                    $single->series_no = $i;
                    $single->save();
                    $i++;
                    // }
                }
            }
        } catch (Exception $e) {
        }



        return response()->json([
            'status' => 200,
            'message' => "Success",
        ], 200);
    }

    public function placeSN_Charge(Request $request)
    {
        if (!$user = auth()->setRequest($request)->user()) {
            return $this->responseUnauthorized();
        }

        try {

            $branch = Branch::select('branches.*')->get();

            foreach ($branch as $b) {

                $trans =  Transaction::where('transaction_type', "Charge")->where('branch_id', $b['id'])
                    ->orderBy('created_at', 'ASC')->get();
                $i = 1;
                foreach ($trans as $t) {
                    $single = Transaction::where('id', $t["id"])->first();

                    // if (is_null($single->series_no)) {
                    $single->series_no = $i;
                    $single->save();
                    $i++;
                    // }
                }
            }
        } catch (Exception $e) {
        }



        return response()->json([
            'status' => 200,
            'message' => "Success",
        ], 200);
    }

    public function placeSN_Return(Request $request)
    {
        if (!$user = auth()->setRequest($request)->user()) {
            return $this->responseUnauthorized();
        }

        try {

            $branch = Branch::select('branches.*')->get();

            foreach ($branch as $b) {

                $trans =  Transaction::where('transaction_type', "Return")->where('branch_id', $b['id'])
                    ->orderBy('created_at', 'ASC')->get();
                $i = 1;
                foreach ($trans as $t) {
                    $single = Transaction::where('id', $t["id"])->first();

                    // if (is_null($single->series_no)) {
                    $single->series_no = $i;
                    $single->save();
                    $i++;
                    // }
                }
            }
        } catch (Exception $e) {
        }



        return response()->json([
            'status' => 200,
            'message' => "Success",
        ], 200);
    }

    public function getSaleLastSN(Request $request)
    {
        if (!$user = auth()->setRequest($request)->user()) {
            return $this->responseUnauthorized();
        }

        try {

            $trans =  Transaction::where('transaction_type', "Charge")->orderBy('created_at', 'DESC')->take(1)->get();
        } catch (Exception $e) {
        }



        return response()->json([
            'status' => 200,
            'sn' => $trans[0]->series_no,
        ], 200);
    }

    public function updateLateSpec(Request $request)
    {
        if (!$user = auth()->setRequest($request)->user()) {
            return $this->responseUnauthorized();
        }

        try {

            $trans =  Transaction::where('id', request('id'))->firstorfail();

            if (request('spec') == "beyond5") {
                $trans->latespecifics = "beyond5";
            } else if (request('spec') == "before5") {
                $trans->latespecifics = "before5";
            } else {
                $trans->latespecifics = null;
            }
            $trans->save();
        } catch (Exception $e) {
        }



        return response()->json([
            'status' => 200,
            'message' => "Success",

        ], 200);
    }

    public function inventoryUpdate(Request $request)
    {
        if (!$user = auth()->setRequest($request)->user()) {
            return $this->responseUnauthorized();
        }

        try {
            $orgitm = Item_count::join('items','item_counts.item_id','=','items.id')
            ->where('item_counts.item_id', request('item_id'))
            ->where('item_counts.branch_id', request('branch_id'))
            ->first();

            $dateup = new DateTime("now", new DateTimeZone('Asia/Manila'));
            $dup = $dateup->format('Y-m-d H:i:s');

            $newInUp = Transaction::create([
                'transaction_type' => "Inventory Update",
                'user_id' => $user->id,
                'accountability' => "Admin",

                'customer_name' => $orgitm->name,
                'branch_id' => request('branch_id'),
                'code' =>$this->generateCode('INUP', date('Y-m-d'), $user->id, request('branch_id')),
                'date_transac' => date('Y-m-d'),
                'payable' => request('new_balance'),
                'last_update' => $dup,
                'description' => request('description'),
    
            ]);
            
            $itmcount = Item_count::where('item_id', request('item_id'))->where('branch_id', request('branch_id'))->firstorfail();

            $begbal = $itmcount->balance;
            $begcol = $itmcount->collectible_amount;
            $itmcount->balance -= $itmcount->balance;
            $itmcount->balance += request('new_balance');
            $itmcount->collectible_amount = $itmcount->balance * $orgitm->unit_price;
            $itmcount->inv_date_update =$dup;

            Transaction_item::create([
                'item_status' => "Inventory Update",
                'unit_price' => $orgitm->unit_price,
                'beg_balance' => $begbal,
                'end_balance' =>  $itmcount->balance,
                'original_price' => $orgitm->original_price,
                'quantity' =>request('new_balance'),
                'transaction_id' => $newInUp->id,
                'beg_collectible' =>  $begcol,
                'end_collectible' =>   $itmcount->collectible_amount,
                'item_id' => request('item_id')
            ]);

            $itmcount->save();



        } catch (Exception $e) {
        }



        return response()->json([
            'status' => 200,
            'message' => "Success",

        ], 200);
    }
}
