<?php

namespace App\Http\Controllers;

use App\Branch;
use App\Delivery;
use App\Item;
use App\Item_count;
use App\Notification;
use App\ResetCount;
use App\Transaction;
use App\Transaction_item;
use App\User_detail;
use DateTime;
use DateTimeZone;
use Illuminate\Http\Request;
use DB;
use stdClass;

class NewPosController extends Controller
{
    public function branchItemStocks(Request $request)
    {

        if (!$user = auth()->setRequest($request)->user()) {
            return $this->responseUnauthorized();
        }
        try {
            $userdet =  User_detail::where('id', $user->user_details_id)->firstOrFail();

            $items =  Item::join('brands', 'items.brand_id', '=', 'brands.id')
                ->join('item_categories', 'items.category_id', '=', 'item_categories.id')
                ->join('item_counts', 'items.id', '=', 'item_counts.item_id')
                ->where('item_counts.branch_id', '=', $userdet->branch_id)
                ->where('item_counts.balance', '>', 0)
                ->select(
                    'items.id',
                    'items.name',
                    'items.brand_id',
                    'items.unit_price',
                    'items.code',
                    'brands.name as brand',
                    'item_categories.name as category',
                    'item_counts.balance as balance',
                    'items.unit',
                    'items.size'
                )
                ->get();
        } catch (Exception $e) {
        }

        return response()->json([
            'status' => 200,
            'items' => $items,
        ], 200);
    }

    public function getFutureCtrlnoExternal(Request $request)
    {

        if (!$user = auth()->setRequest($request)->user()) {
            return $this->responseUnauthorized();
        }
        try {
            $rescount =  ResetCount::where('type', 'sale')->first();
            $counter = $this->getFutureCtrlnoInternal($rescount->count);

            return response()->json([
                'status' => 200,
                'ctrlno' => $this->addZeros(2, $rescount->count)."-".$counter,
            ], 200);

        } catch (Exception $e) {
            return response()->json([
                'status' => 422,
            ], 422);
        }

       
    }

    public function getServeCountToday(Request $request)
    {

        if (!$user = auth()->setRequest($request)->user()) {
            return $this->responseUnauthorized();
        }
        try {
            $transdet =  Transaction::where('date_transac', date('Y-m-d'))
            ->where('transaction_type','sale')
            ->select(
                DB::raw('COUNT(id) as served'),
                DB::raw('SUM(payable) as total_sales')
            ) 
            ->groupBy('date_transac')
            ->first();

            return response()->json([
                'status' => 200,
                'served' => $transdet->served,
                'total_sales' => $transdet->total_sales,
            ], 200);

        } catch (Exception $e) {
            return response()->json([
                'status' => 422,
            ], 422);
        }

       
    }
    public function curUserDet(Request $request)
    {

        if (!$user = auth()->setRequest($request)->user()) {
            return $this->responseUnauthorized();
        }
        try {
            $userdet = User_detail::join('branches', 'user_details.branch_id', '=', 'branches.id')
                ->select('user_details.*', 'branches.name as branch', 'branches.id as branch_id')
                ->where('user_details.id', $user->user_details_id)->firstOrFail();

            return response()->json([
                'status' => 200,
                'userdet' => [$userdet],
            ], 200);
        } catch (Exception $e) {
        }
    }

    public function store(Request $request)
    {
        if (!$user = auth()->setRequest($request)->user()) {
            return $this->responseUnauthorized();
        }
        try {

            $dateup = new DateTime("now", new DateTimeZone('Asia/Manila'));
            $dup = $dateup->format('Y-m-d H:i:s');

            $dateCrt = date_create($dup);
            $dupTime = date_format($dateCrt, 'H:i');

            $userdet =  User_detail::where('id', $user->user_details_id)->firstOrFail();  // get branch

            // check if code already exists
            $searchTrans =  Transaction::where('code', request('trasaction_code'))->first();

            if (!is_null($searchTrans)) {

                return response()->json(['validation' => 90, 'message' => 'Transaction already recorded'], 200);
            } else {

                $itmObj = json_decode(request('items'), true);

                // check if there are insufficient balances
                if (COUNT($this->checkForInsuf($itmObj, $userdet)) > 0) {
                    return response()->json([
                        'validation' => 80, 'message' => 'Insuficient Balances', 'items' => $this->checkForInsuf($itmObj, $userdet),
                    ], 200);
                }

                // save delivery
                $delivery_id = null;
                if (request('delivery_fee')) {
                    $delivery_id = $this->storeDelivery($request);
                }

                $series_no = $this->generateSeriesNo($userdet, "sale");

                // save transaction
                $trans_id = $this->createTransaction($request, $series_no, $user, $userdet, $delivery_id, $dup);

                // save transaction items
                foreach ($itmObj as $itm) {
                    $this->createTransactionItems($userdet, $itm["Quantity"], $itm["id"], $trans_id);
                    $this->checkThreshold($userdet, $itm["id"]);
                }




                return response()->json([
                    'validation' => 200,
                    'message' => "success",
                    'transid' => $trans_id,
                    'sys_date_time' => $dupTime

                ], 200);
            }

            return $this->responseUnprocessable();
        } catch (Exception $e) {
            return $this->responseUnprocessable();
        }
    }

    function checkForInsuf($itmObj, $userdet)
    {
        $insuf = array();
        foreach ($itmObj as $itm) {
            $orgItem = Item::where('id', $itm["id"])->firstOrFail();
            $update = Item_count::where('item_id', $itm["id"])->where('branch_id', $userdet->branch_id)->firstOrFail();


            if ($itm["Quantity"] > $update->balance) {

                $invals = new stdClass();
                $invals->id = $orgItem->code;
                $invals->name = $orgItem->name;
                $insuf[] =  $invals;
            }
        }
        return $insuf;
    }

    function storeDelivery($request)
    {

        $delivery = Delivery::create([
            'name' => $request->customer_name,
            'address' => $request->address,
            'contact' => $request->contact,
            'delivery_fee' => $request->delivery_fee,
        ]);

        return $delivery->id;
    }

    function generateSeriesNo($userdet, $transtype)
    {
        $sn_trans =  Transaction::where('transaction_type', $transtype)
            ->where('branch_id', $userdet->branch_id)
            ->orderBy('created_at', 'DESC')
            ->first();

        if (is_null($sn_trans)) {
            $series_no = 1;
        } else {
            $series_no = $sn_trans->series_no + 1;
        }

        return $series_no;
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

    function createTransaction($request, $series_no, $user, $userdet, $delivery_id, $dateprint)
    {
        $rescount =  ResetCount::where('type', $request->transaction_type)->first();
        


        $new = Transaction::create([
            'receipt_code' => $request->receipt_code,
            'ctrlno' => $request->curCtrlno,
            'transaction_type' => $request->transaction_type,
            'accountability' => $request->accountability,
            'discount' => $request->discount,
            'user_id' => $user->id,
            'branch_id' => $userdet->branch_id,
            'delivery_id' => $delivery_id,
            'customer_name' => $request->customer_name,
            'amount_received' => $request->amount_received,
            'code' => $request->trasaction_code,
            'date_printed' => $dateprint,
            'date_transac' =>  $request->date_transac,
            'payable' =>  $request->payable,
            'project_id' => null,
            'customer_id' =>  null,
            'charge_status' =>  null,
            'office_id' =>  null,
            'beg_charge_bal' =>  null,
            'end_charge_bal' => null,
            'series_no' =>  $series_no,
            'reset_no' =>  $rescount->count,
            'st_tin_num' =>  $request->st_tin_num,
            'st_bus_type' =>  $request->st_bus_type,
            'counter_no' => $this->getFutureCtrlnoInternal($rescount->count),

        ]);


        return $new->id;
    }

    function createTransactionItems($userdet, $Quantity, $id, $transactionId)
    {
        $orgItem = Item::where('id', $id)->firstOrFail();

        // set the beginning balance
        $begBal = Item_count::where('item_id', $id)
            ->where('branch_id', $userdet->branch_id)
            ->firstOrFail();

        // update  branch's item count
        $update = Item_count::where('item_id', $id)
            ->where('branch_id', $userdet->branch_id)
            ->firstOrFail();
        $update->balance -= $Quantity;
        $update->save();

        // updated collectible requested branch
        $itcount = Item_count::where('item_id', $id)
            ->where('branch_id',  $userdet->branch_id)
            ->get();

        $newCollect = $itcount[0]->balance * $orgItem->unit_price;
        $NewCount = Item_count::where('item_id', $id)->where('branch_id', $userdet->branch_id)->firstOrFail();
        $NewCount->collectible_amount = $newCollect;
        $NewCount->save();

        Transaction_item::create([
            'item_status' => "Released",
            'unit_price' => $orgItem->unit_price,
            'beg_balance' => $begBal->balance,
            'end_balance' => $begBal->balance - $Quantity,
            'original_price' => $orgItem->original_price,
            'beg_collectible' => $begBal->collectible_amount,
            'end_collectible' => $newCollect,
            'quantity' => $Quantity,
            'transaction_id' => $transactionId,
            'item_id' => $id,
        ]);
    }

    function checkThreshold($userdet, $id)
    {
        // check threshold

        $orgItem = Item::where('id', $id)->firstOrFail();

        $threshold = Item_count::where('item_id', $id)
            ->where('branch_id', $userdet->branch_id)
            ->firstOrFail();

        if ($threshold->balance <=  $threshold->threshold) {


            $description = "Item " . $orgItem->name . " reaches its ordering point.";

            $colors = array("Admin", "Cashier");
            foreach ($colors as $value) {
                Notification::create([
                    'type' => "Warning",
                    'notif_for_user' => $value,
                    'notif_for_branch' => $userdet->branch_id,
                    'description' =>  $description,
                    'mark_as' =>  "unread",
                    'route' =>  "/stocks",
                ]);
            }
        }
    }
}
