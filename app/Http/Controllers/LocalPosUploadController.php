<?php

namespace App\Http\Controllers;

use App\Defective;
use App\Delivery;
use App\Item;
use App\Item_count;
use App\ReplacedItm;
use App\ResetCount;
use App\ReturnedItm;
use App\Transaction;
use App\Transaction_item;
use Illuminate\Http\Request;

class LocalPosUploadController extends Controller
{
    public function store(Request $request)
    {
        // // Get user from $request token.
        // if (!$user = auth()->setRequest($request)->user()) {
        //     return $this->responseUnauthorized();
        // }
        try {

            $transaction = json_decode(request('transactions'), true); //new
            $deliveries = json_decode(request('deliveries'), true); //new
            $items = json_decode(request('items'), true); //new
            $returned = json_decode(request('returned'), true); //new
            $replaced = json_decode(request('replaced'), true); //new

            $inserted = 0;
            $rejected = 0;
            $attempted = 0;

            $insertedCode = array();
            $attemptCode = array();
            $rejectCode = array();

            foreach ($transaction as $trn) {

                $checkCode = Transaction::where('code', $trn["code"])->first();

                if (is_null($checkCode)) {

                    $expsItm = array_keys(array_column($items, 'transaction_id'), $trn["id"]);

                    switch ($trn["transaction_type"]) {
                        case "Sale":
                            $this->saleTrans($trn, $deliveries, $expsItm, $items);
                            break;
                        case "Return":
                            $this->returnTrans($trn, $deliveries, $expsItm, $items, $returned);
                            break;
                        case "Replacement":
                            $this->replaceTrans($trn, $deliveries, $expsItm, $items, $replaced);
                            break;
                        case "Excess Payment":
                            $this->createTransaction($trn, null, null);
                            break;
                        default:
                    }
                    $inserted += 1;
                    array_push($insertedCode, $trn["code"]);
                } else {
                    $rejected += 1;
                    array_push($rejectCode, $trn["code"]);
                }

                array_push($attemptCode, $trn["code"]);

                $attempted += 1;
            }


            // get Current balances

            $currenInventory = Item_count::select('item_id', 'balance', 'collectible_amount', 'branch_id')
            ->where('branch_id', request('branch_id'))->get();

            return response()->json([
                'status' => 201,
                'rejected' => $rejected,
                'inserted' => $inserted,
                'attempted' => $attempted,
                'insertedCodes' => $insertedCode,
                'attemptCode' => $attemptCode,
                'rejectCode' => $rejectCode,
                'currenInventory' => $currenInventory,
                'message' => 'Succesful',
            ], 201);
        } catch (Exception $e) {
            return $this->responseServerError('Error creating resource.');
        }
    }

    // Main functions ---------------------------------------------------------

    function saleTrans($request, $deliveries, $itemdet, $items)
    {
        // save delivery
        $delivery_id = null;
        if ($request["delivery_id"]) {
            $delivery_id = $this->storeDelivery($request, $deliveries);
        }

        $series_no = $this->generateSeriesNo($request, "sale");

        $trans_id = $this->createTransaction($request, $series_no, $delivery_id);

        foreach ($itemdet as $es) {
            $eps = $items[$es];
            $this->createTransactionItemsSales($request, $eps, $trans_id);
        }
    }


    function replaceTrans($request, $deliveries, $itemdet, $items, $replaced){
        // save delivery
        $delivery_id = null;
        if ($request["delivery_id"]) {
            $delivery_id = $this->storeDelivery($request, $deliveries);
        }

        $trans_id = $this->createTransaction($request, null, $delivery_id);

        $rpl = array_keys(array_column($replaced, 'replace_code'), $request["code"]);

        foreach ($rpl as $rt) {
            $rts = $replaced[$rt];

            $savereplace = ReplacedItm::create([
                'sale_code' => $rts['sale_code'],
                'replace_code' =>  $request["code"],
            ]);
        }

        foreach ($itemdet as $es) {
            $eps = $items[$es];
            $this->createReplaceTransItems($request, $eps, $trans_id);
        }


    }

    function returnTrans($request, $deliveries, $itemdet, $items, $returned)
    {
        // save delivery
        $delivery_id = null;
        if ($request["delivery_id"]) {
            $delivery_id = $this->storeDelivery($request, $deliveries);
        }

        $series_no = $this->generateSeriesNo($request, "Return");


        $rtn = array_keys(array_column($returned, 'return_code'), $request["code"]);

        foreach ($rtn as $rt) {
            $rts = $returned[$rt];


            $orgTrans = Transaction::where('code', $rts['sale_code'])->first();

            if (!is_null($orgTrans)) {
                $trans_id = $this->createTransaction($request, $series_no, $delivery_id);

                ReturnedItm::create([
                    'sale_code' => $rts['sale_code'],
                    'return_code' =>  $request["code"],
                    'sale_id' =>  $orgTrans->id,
                    'return_id' =>  $trans_id,
                ]);


                foreach ($itemdet as $es) {
                    $eps = $items[$es];
                    $this->createReturnTransItems($request, $eps, $trans_id);
                }
            }
        }

      

    }

    // sub fucntions ----------------------------------------------------------

    function createReplaceTransItems($userdet, $itemdet, $transactionId){
        $Quantity = $itemdet["quantity"];
        $id = $itemdet["item_id"];
        $branchId = $userdet["branch_id"];

        $orgItem = Item::where('id', $id)->firstOrFail();

        $begBal = Item_count::where('item_id', $id)->where('branch_id', $branchId)->firstOrFail();

        $beg_collectible = $begBal->collectible_amount; // beg collectioble of item
        $beg_balance = $begBal->balance; //item count beginning balance

        $update = Item_count::where('item_id', $id)->where('branch_id', $branchId)->firstOrFail();
        $update->balance -= $Quantity;
        $end_balance = $update->balance; //item count ending balance
        $update->save();

        $recentUpdate = Item_count::where('item_id', $id)
                ->where('branch_id', $branchId)->firstOrFail();

            $newCollect = $recentUpdate->balance * $orgItem->unit_price;
            $recentUpdate->collectible_amount = $newCollect;
            $recentUpdate->save();

        Transaction_item::create([
            'item_status' => $itemdet["item_status"],
            'unit_price' => $itemdet["unit_price"],
            'beg_balance' => $beg_balance,
            'end_balance' => $end_balance,
            'original_price' => $itemdet["original_price"],
            'beg_collectible' => $beg_collectible,
            'end_collectible' => $newCollect,
            'quantity' => $Quantity,
            'transaction_id' => $transactionId,
            'item_id' => $id,
            'created_at' => $itemdet["unit_price"],
            'updated_at' => $itemdet["updated_at"],
        ]);

    }


    function createReturnTransItems($userdet, $itemdet, $transactionId)
    {
        $Quantity = $itemdet["quantity"];
        $id = $itemdet["item_id"];

        $orgItem = Item::where('id', $itemdet["item_id"])->firstOrFail();
        // set the beginning balance
        $begBal = Item_count::where('item_id', $itemdet["item_id"])
            ->where('branch_id', $userdet["branch_id"])->firstOrFail();

        $beg_collectible = $begBal->collectible_amount; // beg collectioble of item
        $beg_balance = $begBal->balance; //item count beginning balance

        $beg_def_bal = null;
        $end_def_bal = null;

        if ($itemdet["item_status"] == "Returned GC") {

            $update = Item_count::where('item_id', $itemdet["item_id"])
                ->where('branch_id', $userdet["branch_id"])->firstOrFail();

            $update->balance += $itemdet["quantity"];
            $end_balance = $update->balance; //item count ending balance
            $update->save();

            $recentUpdate = Item_count::where('item_id', $itemdet["item_id"])
                ->where('branch_id', $userdet["branch_id"])->firstOrFail();

            $newCollect = $recentUpdate->balance * $orgItem->unit_price;
            $recentUpdate->collectible_amount = $newCollect;
            $recentUpdate->save();

        } else if ($itemdet["item_status"] == "Defective") {

            $end_balance = $beg_balance;
            $newCollect = $beg_collectible;

            $defectItem = Defective::where('item_id', '=', $itemdet["item_id"])
                ->where('branch_id', '=', $userdet["branch_id"])
                ->first(); //search for existing defetive item count

            if (is_null($defectItem)) {
                $newDefect = Defective::create([
                    'item_id' => $itemdet["item_id"],
                    'balance' => $itemdet["quantity"],
                    'branch_id' => $userdet["branch_id"],
                ]);
            }else {
                $beg_def_bal = $defectItem->balance;
                $defectItem->balance += $itemdet["quantity"];
                $end_def_bal = $defectItem->balance;
                $defectItem->save();
            }

        }


        Transaction_item::create([
            'item_status' => $itemdet["item_status"],
            'unit_price' => $itemdet["unit_price"],
            'beg_balance' => $beg_balance,
            'end_balance' => $end_balance,
            'original_price' => $itemdet["original_price"],
            'beg_collectible' => $beg_collectible,
            'end_collectible' => $newCollect,
            'quantity' => $Quantity,
            'transaction_id' => $transactionId,
            'item_id' => $id,
            'beg_def_bal' => $beg_def_bal,
            'end_def_bal' => $end_def_bal,
            'created_at' => $itemdet["unit_price"],
            'updated_at' => $itemdet["updated_at"],
        ]);
    }

    function createTransactionItemsSales($userdet, $itemdet, $transactionId)
    {
        $Quantity = $itemdet["quantity"];
        $id = $itemdet["item_id"];

        $orgItem = Item::where('id', $id)->firstOrFail();

        // set the beginning balance
        $begBal = Item_count::where('item_id', $id)
            ->where('branch_id', $userdet["branch_id"])
            ->firstOrFail();

        // update  branch's item count
        $update = Item_count::where('item_id', $id)
            ->where('branch_id', $userdet["branch_id"])
            ->firstOrFail();
        $update->balance -= $Quantity;
        $update->save();

        // updated collectible requested branch
        $itcount = Item_count::where('item_id', $id)
            ->where('branch_id',  $userdet["branch_id"])
            ->get();

        $newCollect = $itcount[0]->balance * $orgItem->unit_price;
        $NewCount = Item_count::where('item_id', $id)->where('branch_id', $userdet["branch_id"])->firstOrFail();
        $NewCount->collectible_amount = $newCollect;
        $NewCount->save();

        Transaction_item::create([
            'item_status' => "Released",
            'unit_price' => $itemdet["unit_price"],
            'beg_balance' => $begBal->balance,
            'end_balance' => $begBal->balance - $Quantity,
            'original_price' => $itemdet["original_price"],
            'beg_collectible' => $begBal->collectible_amount,
            'end_collectible' => $newCollect,
            'quantity' => $Quantity,
            'transaction_id' => $transactionId,
            'item_id' => $id,
            'created_at' => $itemdet["unit_price"],
            'updated_at' => $itemdet["updated_at"],
        ]);
    }



    function storeDelivery($request, $deliveries)
    {
        $exps = array_keys(array_column($deliveries, 'id'), $request["delivery_id"]);

        foreach ($exps as $es) {
            $eps = $deliveries[$es];

            $delivery = Delivery::create([
                'name' => $eps["name"],
                'address' => $eps["address"],
                'contact' => $eps["contact"],
                'delivery_fee' => $eps["delivery_fee"],
            ]);
        }


        return $delivery->id;
    }

    function generateSeriesNo($request, $transtype)
    {
        $sn_trans =  Transaction::where('transaction_type', $transtype)
            ->where('branch_id', $request["branch_id"])
            ->orderBy('created_at', 'DESC')
            ->first();

        if (is_null($sn_trans)) {
            $series_no = 1;
        } else {
            $series_no = $sn_trans->series_no + 1;
        }

        return $series_no;
    }

    function createTransaction($request, $series_no, $delivery_id)
    {
        $rescount =  ResetCount::where('type', $request["transaction_type"])->first();

        if(!is_null($rescount)){
            $rescount = $rescount;
        }else{
            $rescount = null;
        }


        $new = Transaction::create([
            'receipt_code' => $request["receipt_code"],
            'ctrlno' => $request["transaction_type"] == 'Sale' ? ($rescount->count . "-" . $this->getFutureCtrlnoInternal($rescount->count)) : null,
            'transaction_type' => $request["transaction_type"],
            'accountability' => $request["accountability"],
            'discount' => $request["discount"],
            'user_id' => $request["user_id"],
            'branch_id' => $request["branch_id"],
            'delivery_id' => $delivery_id ? $delivery_id : null,
            'customer_name' => $request["customer_name"],
            'amount_received' => $request["amount_received"],
            'code' => $request["code"],
            'date_printed' => $request["date_printed"],
            'date_transac' =>  $request["date_transac"],
            'payable' => $request["payable"],
            'project_id' => null,
            'customer_id' =>  null,
            'created_at' => $request["created_at"],
            'updated_at' => $request["updated_at"],
            'charge_status' =>  null,
            'office_id' =>  null,
            'beg_charge_bal' =>  null,
            'end_charge_bal' => null,
            'series_no' => $request["transaction_type"] == 'Sale' || $request["transaction_type"] == 'Return' ? ($series_no) : null,
            'reset_no' => $request["transaction_type"] == 'Sale' ? ($rescount->count) : null,
            'st_tin_num' => $request["st_tin_num"],
            'st_bus_type' => $request["st_bus_type"],
            'return_code' => $request["return_code"],
            'isLocalImport' => 1,
            'counter_no' => $request["transaction_type"] == 'Sale' ? ($this->getFutureCtrlnoInternal($rescount->count)) : null,

        ]);


        return $new->id;
    }

    function getFutureCtrlnoInternal($rescount)
    {

        $counter =  Transaction::where('reset_no', $rescount)->orderBy('id', 'DESC')->first();

        $incCounter = 1;
        if (!is_null($counter)) {
            $incCounter = (int)$counter->counter_no + 1;
        }

        return $this->addZeros(7, $incCounter);
    }

    function addZeros($lentgh, $incCounter)
    {
        $pad_length = $lentgh;
        $pad_char = 0;
        $str_type = 'd';

        $format = "%{$pad_char}{$pad_length}{$str_type}";
        $formatted_str = sprintf($format, $incCounter);


        return $formatted_str;
    }
}
