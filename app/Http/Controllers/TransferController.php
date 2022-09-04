<?php

namespace App\Http\Controllers;

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
use App\Transaction;
use App\Transaction_item;
use DB;

class Transfer_det
{
    public $receiver;
    public $sender;
    public $rec_id;
    public $send_id;
}

class TransferController extends Controller
{
    public function index(Request $request)
    {
        if (!$user = auth()->setRequest($request)->user()) {
            return $this->responseUnauthorized();
        }
        try {

            // $col4 =  Requisition::join('users', 'requisitions.user_id', '=', 'users.id')
            // ->join('user_details', 'users.user_details_id', '=', 'user_details.id')
            // ->join('branches', 'user_details.branch_id', '=', 'branches.id')
            // ->join('positions', 'user_details.position_id', '=', 'positions.id')
            // ->where('requisitions.id', '=', request('id'))
            // ->select('requisitions.*', 'user_details.first_name', 'user_details.last_name', 'positions.name as position', 'branches.name as branch')
            // ->get();

            // $reqTo =  Requisition::join('branches', 'requisitions.request_to', '=', 'branches.id')
            // ->where('requisitions.id', '=', request('id'))
            // ->select('requisitions.*', 'branches.name as branch')
            // ->get();

            // $collection1 = Item::select('items.*');
            // $collection1 = $collection1->latest()->paginate();

            // $collection1 =  Item::join('brands', 'items.brand_id', '=', 'brands.id')
            // ->join('item_categories', 'items.category_id', '=', 'item_categories.id')
            // ->select('items.*', 'brands.name as brand', 'item_categories.name as category')
            // ->get();
            $req = Requisition::where('code', request('code'))->firstOrFail();

            $reqitems = Requisition_item::join('items', 'requisition_items.item_id', '=', 'items.id')
                ->where('requisition_items.requisition_id', '=',  $req->id)
                ->where('requisition_items.status', '=',  'Released')
                ->select('requisition_items.*', 'items.original_price as original_price', 'items.name as item', 'items.size as item_size', 'items.unit as item_unit')
                ->get();

            $col4 =  Requisition::join('users', 'requisitions.user_id', '=', 'users.id')
                ->join('user_details', 'users.user_details_id', '=', 'user_details.id')
                ->join('branches', 'user_details.branch_id', '=', 'branches.id')
                ->join('positions', 'user_details.position_id', '=', 'positions.id')
                ->where('requisitions.id', '=', $req->id)
                ->select('requisitions.*', 'user_details.first_name', 'user_details.last_name', 'positions.name as position', 'branches.name as branch')
                ->get();

            $reqTo =  Requisition::join('branches', 'requisitions.request_to', '=', 'branches.id')
                ->where('requisitions.id', '=', $req->id)
                ->select('requisitions.*', 'branches.name as branch')
                ->get();

            $userdet =  User_detail::where('id', $user->user_details_id)->firstOrFail();  // get branch
            // $reqnewitems = Requisition_item::where('requisition_items.requisition_id', '=', request('id'))
            // ->select('requisition_items.*')
            // ->get();

            // $units = Unit::select('units.*');
            // $units = $units->latest()->paginate();

            // $branch = Branch::select('branches.id', 'branches.name');
            // $branch = $branch->latest()->paginate();
        } catch (Exception $e) {
        }



        return response()->json([
            'status' => 200,
            'reqitems' => $reqitems,
            'type' => $req->type,
            'status' => $req->request_status,
            'requests' => $col4,
            'reqTo' => $reqTo,
            'branch_id' => $userdet->branch_id,
        ], 200);
    }
    public function update(Request $request, $id)
    {
        // Get user from $request token.
        if (!$user = auth()->setRequest($request)->user()) {
            return $this->responseUnauthorized();
        }


        try {
            // update request item status
            $item = Requisition_item::where('id', $id)->firstOrFail();
            $item->status = 'Received';
            $item->save();

            // update request status
            $req = Requisition::where('code', request('code'))->firstOrFail();
            $req->request_status = 'Partially Received';
            $req->save();

            // get branch
            $userdet =  User_detail::where('id', $user->user_details_id)->firstOrFail();

            // get original item
            $orgItem = Item::where('id', $item->item_id)->firstOrFail();

            // set the beginning balance
            $begBal = Item_count::where('item_id', $item->item_id)
                ->where('branch_id', $userdet->branch_id)
                ->firstOrFail();

            // update item count
            $count = Item_count::where('item_id', $item->item_id)
                ->where('branch_id', $userdet->branch_id)
                ->firstOrFail();
            $count->balance += $item->quantity;
            $count->collectible_amount += $item->quantity * $orgItem->unit_price;
            $count->save();




            // transaction code
            $year = date("y");
            $year = substr($year, -2);
            $month = date("m");
            $day = date("d");
            $code = "TR" . $user->user_details_id . $year . $day . $month . rand(100, 9999) . "RC";


            // Record Transaction
            // $transaction = Transaction::where('requisition_id', $req->id)->firstOrFail();
            $transaction = Transaction::where('requisition_id', '=', $req->id)
                ->where('branch_id', $userdet->branch_id)
                ->first();

            // updated collectible receiving branch
            $itcount = Item_count::where('item_id', $item->item_id)
                ->where('branch_id', $userdet->branch_id)
                ->get();

            $newCollect = $itcount[0]->balance * $orgItem->unit_price;
            $NewCount = Item_count::where('item_id', $item->item_id)->where('branch_id', $userdet->branch_id)->firstOrFail();
            $NewCount->collectible_amount = $newCollect;
            $NewCount->save();

            if (is_null($transaction)) {
                $branch =  Branch::where('id', $userdet->branch_id)->firstOrFail();  // get branch
                $new = Transaction::create([
                    'transaction_type' => "Receiving",
                    'accountability' => "Admin",
                    'customer_name' => $branch->name,
                    'branch_id' => $userdet->branch_id,
                    'user_id' => $user->id,
                    'requisition_id' => $req->id,
                    'date_transac' => date('Y-m-d'),
                    'code' => $code,
                ]);

                Transaction_item::create([
                    'item_status' => "Received",
                    'unit_price' => $orgItem->unit_price,
                    'beg_balance' => $begBal->balance,
                    'end_balance' => $begBal->balance + $item->quantity,
                    'beg_collectible' => $begBal->collectible_amount,
                    'end_collectible' => $newCollect,
                    'original_price' => $orgItem->original_price,
                    'quantity' => $item->quantity,
                    'transaction_id' => $new->id,
                    'item_id' => $orgItem->id,
                ]);
            } else {
                Transaction_item::create([
                    'item_status' => "Received",
                    'unit_price' => $orgItem->unit_price,
                    'beg_balance' => $begBal->balance,
                    'end_balance' => $begBal->balance + $item->quantity,
                    'beg_collectible' => $begBal->collectible_amount,
                    'end_collectible' => $newCollect,
                    'original_price' => $orgItem->original_price,
                    'quantity' => $item->quantity,
                    'transaction_id' => $transaction->id,
                    'item_id' => $orgItem->id,
                ]);
            }

            // Setting requisition to completed
            $stat = Requisition_item::where('status', '=', 'Released')
                ->where('requisition_id', '=', $req->id)
                ->first();

            if (is_null($stat)) {
                $req = Requisition::where('code', request('code'))->firstOrFail();
                $req->request_status = 'Completed';
                $req->save();
            }



            // // REQUESTED BRANCH SET TRANSACTION


            //   // set the beginning balance
            //   $begBal = Item_count::where('item_id', $item->item_id)
            //   ->where('branch_id', $req->request_to)
            //   ->firstOrFail();

            //    // update requested branch's item count
            //    $requested = Item_count::where('item_id', $item->item_id)
            //    ->where('branch_id', $req->request_to)
            //    ->firstOrFail();
            //    $requested->balance -= $item->quantity;
            //    // $requested->collectible_amount -= $item->quantity * $orgItem->unit_price;
            //    $requested->save();


            //         // transaction code
            //         $year = date("y");
            //         $year = substr( $year, -2);
            //         $month = date("m");
            //         $day = date("d");
            //         $code = "TR".$user->user_details_id.$year.$day.$month.rand(100,9999)."RC";

            //         $transaction = Transaction::where('requisition_id','=',$req->id)
            //         ->where('branch_id', $req->request_to)
            //         ->first();


            //          // updated collectible requested branch
            //          $itcount = Item_count::where('item_id', $item->item_id)
            //          ->where('branch_id', $req->request_to)
            //          ->get();

            //          $newCollect = $itcount[0]->balance * $orgItem->unit_price;
            //          $NewCount = Item_count::where('item_id', $item->item_id)->where('branch_id', $req->request_to)->firstOrFail();
            //          $NewCount->collectible_amount = $newCollect;
            //          $NewCount->save();

            //          if ( is_null($transaction) ){
            //             $new = Transaction::create([
            //                 'transaction_type' => "Releasing",
            //                 'branch_id' => $req->request_to,
            //                 'user_id' => $user->id, //change this to the person who released from the branch
            //                 'requisition_id' => $req->id,
            //                 'date_transac' => date('Y-m-d'),
            //                 'code' => $code,
            //             ]);

            //             Transaction_item::create([
            //                 'item_status' => "Released",
            //                 'unit_price' => $orgItem->unit_price,
            //                 'beg_balance' => $begBal->balance,
            //                 'end_balance' => $begBal->balance - $item->quantity,
            //                 'beg_collectible' => $begBal->collectible_amount,
            //                 'end_collectible' => $newCollect,
            //                 'original_price' => $orgItem->original_price,
            //                 'quantity' => $item->quantity,
            //                 'transaction_id' => $new->id,
            //                 'item_id' => $orgItem->id,
            //             ]);

            //         }else{
            //             Transaction_item::create([
            //                 'item_status' => "Released",
            //                 'unit_price' => $orgItem->unit_price,
            //                 'beg_balance' => $begBal->balance,
            //                 'end_balance' => $begBal->balance - $item->quantity,
            //                 'beg_collectible' => $begBal->collectible_amount,
            //                 'end_collectible' => $newCollect,
            //                 'original_price' => $orgItem->original_price,
            //                 'quantity' => $item->quantity,
            //                 'transaction_id' => $transaction->id,
            //                 'item_id' => $orgItem->id,
            //             ]);
            //         } 

            // output
            $req = Requisition::where('code', request('code'))->firstOrFail();

            // $reqitems = Requisition_item::join('items', 'requisition_items.item_id', '=', 'items.id')
            //     ->where('requisition_items.requisition_id', '=',  $req->id)
            //     ->where('requisition_items.status', '=',  'Released')
            //     ->select('requisition_items.*', 'items.original_price as original_price', 'items.name as item', 'items.size as item_size', 'items.unit as item_unit')
            //     ->get();

            $reqitems = Requisition_item::join('items', 'requisition_items.item_id', '=', 'items.id')
                ->where('requisition_items.requisition_id', '=',  $req->id)
                ->where('requisition_items.status', '=',  'Released')
                ->select('requisition_items.*', 'items.original_price as original_price', 'items.name as item', 'items.size as item_size', 'items.unit as item_unit')
                ->get();

            return response()->json([
                'status' => 200,
                'message' => 'Update successful',
                'updated' => $reqitems
            ], 200);
        } catch (Exception $e) {
            return $this->responseServerError('Error updating resource.');
        }
    }

    public function releaseReq(Request $request)
    {

        if (!$user = auth()->setRequest($request)->user()) {
            return $this->responseUnauthorized();
        }
        try {
            // REQUESTED BRANCH SET TRANSACTION

            // update request status
            $req = Requisition::where('code', request('code'))->firstOrFail();
            $req->request_status = 'Released';
            $req->save();

            // transaction code
            $year = date("y");
            $year = substr($year, -2);
            $month = date("m");
            $day = date("d");
            $code = "TR" . $user->user_details_id . $year . $day . $month . rand(100, 9999) . "RC";


            $branch =  Branch::where('id',  $req->request_to)->firstOrFail();  // get branch
            $new = Transaction::create([
                'transaction_type' => "Releasing",
                'accountability' => "Admin",
                'customer_name' => $branch->name,
                'branch_id' => $req->request_to,
                'user_id' => $user->id, //change this to the person who released from the branch
                'requisition_id' => $req->id,
                'date_transac' => date('Y-m-d'),
                'code' => $code,
            ]);

            $itmObj = json_decode(request('items'), true);

            foreach ($itmObj as $itm) {


                // update request item status
                $item = Requisition_item::where('id', $itm["id"])->firstOrFail();
                $item->status = 'Released';
                $item->save();
                // get original item
                $orgItem = Item::where('id', $itm["item_id"])->firstOrFail();

                // set the beginning balance
                $begBal = Item_count::where('item_id', $itm["item_id"])
                    ->where('branch_id', $req->request_to)
                    ->firstOrFail();

                // update requested branch's item count
                $requested = Item_count::where('item_id', $itm["item_id"])
                    ->where('branch_id', $req->request_to)
                    ->firstOrFail();
                $requested->balance -= $itm["quantity"];
                // $requested->collectible_amount -= $item->quantity * $orgItem->unit_price;
                $requested->save();




                // updated collectible requested branch
                $itcount = Item_count::where('item_id', $itm["item_id"])
                    ->where('branch_id', $req->request_to)
                    ->get();

                $newCollect = $itcount[0]->balance * $orgItem->unit_price;
                $NewCount = Item_count::where('item_id', $item->item_id)->where('branch_id', $req->request_to)->firstOrFail();
                $NewCount->collectible_amount = $newCollect;
                $NewCount->save();




                Transaction_item::create([
                    'item_status' => "Released",
                    'unit_price' => $orgItem->unit_price,
                    'beg_balance' => $begBal->balance,
                    'end_balance' => $begBal->balance - $item->quantity,
                    'beg_collectible' => $begBal->collectible_amount,
                    'end_collectible' => $newCollect,
                    'original_price' => $orgItem->original_price,
                    'quantity' => $item->quantity,
                    'transaction_id' => $new->id,
                    'item_id' => $orgItem->id,
                ]);
            }

            $col4 =  Requisition::join('users', 'requisitions.user_id', '=', 'users.id')
                ->join('user_details', 'users.user_details_id', '=', 'user_details.id')
                ->join('branches', 'user_details.branch_id', '=', 'branches.id')
                ->join('positions', 'user_details.position_id', '=', 'positions.id')
                ->where('requisitions.id', '=', request('id'))
                ->select('requisitions.*', 'user_details.first_name', 'user_details.last_name', 'positions.name as position', 'branches.name as branch')
                ->get();

            $reqitems = Requisition_item::join('items', 'requisition_items.item_id', '=', 'items.id')
                ->where('requisition_items.requisition_id', '=', request('id'))
                ->select('requisition_items.*', 'items.original_price as original_price', 'items.name as item', 'items.id as item_id', 'items.size as item_size', 'items.unit as item_unit', DB::raw('
        (requisition_items.unit_price * requisition_items.quantity) as sub_total'), 'requisition_items.unit_price as new_price')
                ->get();

            return response()->json([
                'requests' => $col4,
                'reqitems' => $reqitems,
            ], 201);
        } catch (Exception $e) {
        }
    }

    public function directTransafer(Request $request)
    {

        if (!$user = auth()->setRequest($request)->user()) {
            return $this->responseUnauthorized();
        }
        try {
            $userdet =  User_detail::where('id', $user->user_details_id)->firstOrFail();  // get branch

            $branch_sender =  Branch::where('id',  $userdet->branch_id)->firstOrFail();  // get branch sender

            $branch_receiver =  Branch::where('id',  request("receiver_branch"))->firstOrFail();  // get branch receiver

            // transaction code
            $year = date("y");
            $year = substr($year, -2);
            $month = date("m");
            $day = date("d");
            $code_release = "TR" . $user->user_details_id . $year . $day . $month . rand(100, 9999) . "RC";


            $transd = [];
                           $td = new Transfer_det();
                           $td->receiver = $branch_receiver->name;
                           $td->sender = $branch_sender->name;
                           $td->rec_id = $branch_receiver->id;
                           $td->send_id = $branch_sender->id;
                           $transd[] = $td;



            $new_release = Transaction::create([
                'transaction_type' => "Releasing",
                'accountability' => "Admin",
                'customer_name' => $branch_sender->name,
                'branch_id' => $userdet->branch_id,
                'user_id' => $user->id,
                'date_transac' => request("date_released"),
                'code' => $code_release,
                'description' => json_encode($transd),
            ]);

            // $branch_receiver =  Branch::where('id',  request("receiver_branch"))->firstOrFail();  // get branch receiver

            // transaction code
            $code_receive = "TR" . $user->user_details_id . $year . $day . $month . rand(100, 9999) . "RC";
            $new_receive = Transaction::create([
                'transaction_type' => "Receiving",
                'accountability' => "Admin",
                'customer_name' => $branch_receiver->name,
                'branch_id' => request("receiver_branch"),
                'user_id' => $user->id, // for confirmation
                'date_transac' => request("date_received"),
                'code' => $code_receive,
                'description' => json_encode($transd),
            ]);


            $itmObj = json_decode(request('items'), true);

            foreach ($itmObj as $itm) {

                $orgItem = Item::where('id', $itm["id"])->firstOrFail();


                $itcount_sender = Item_count::where('item_id', $itm["id"])->where('branch_id', $userdet->branch_id)->firstOrFail();
                $itcount_receiver = Item_count::where('item_id', $itm["id"])->where('branch_id', request("receiver_branch"))->firstOrFail();

                $old_balance_sender = $itcount_sender->balance;
                $old_collectible_sender = $itcount_sender->collectible_amount;

                $old_balance_receiver = $itcount_receiver->balance;
                $old_collectible_receiver = $itcount_receiver->collectible_amount;

                // updating
                $itcount_sender->balance -= $itm["quantity"];
                $itcount_sender->collectible_amount = $itcount_sender->balance * $orgItem->unit_price;

                $itcount_receiver->balance += $itm["quantity"];
                $itcount_receiver->collectible_amount = $itcount_receiver->balance * $orgItem->unit_price;
                // updating

                Transaction_item::create([
                    'item_status' => "Released",
                    'unit_price' => $orgItem->unit_price,
                    'beg_balance' =>  $old_balance_sender,
                    'end_balance' => $itcount_sender->balance,
                    'beg_collectible' =>  $old_collectible_sender,
                    'end_collectible' => $itcount_sender->collectible_amount,
                    'original_price' => $orgItem->original_price,
                    'quantity' => $itm["quantity"],
                    'transaction_id' => $new_release->id,
                    'item_id' => $orgItem->id,
                ]);

                Transaction_item::create([
                    'item_status' => "Received",
                    'unit_price' => $orgItem->unit_price,
                    'beg_balance' => $old_balance_receiver,
                    'end_balance' =>  $itcount_receiver->balance,
                    'beg_collectible' => $old_collectible_receiver,
                    'end_collectible' => $itcount_receiver->collectible_amount,
                    'original_price' => $orgItem->original_price,
                    'quantity' => $itm["quantity"],
                    'transaction_id' => $new_receive->id,
                    'item_id' => $orgItem->id,
                ]);

                $itcount_sender->save();
                $itcount_receiver->save();

            }






            return response()->json([
                'message' => "Successful",
            ], 201);
        } catch (Exception $e) {
        }
    }

    public function POSRelease(Request $request)
    {

        if (!$user = auth()->setRequest($request)->user()) {
            return $this->responseUnauthorized();
        }
        try {
            $userdet =  User_detail::where('id', $user->user_details_id)->firstOrFail();  // get branch

            $branch_sender =  Branch::where('id',  $userdet->branch_id)->firstOrFail();  // get branch sender

            $branch_receiver =  Branch::where('id',  request("receiver_branch"))->firstOrFail();  // get branch receiver

            // transaction code
            $year = date("y");
            $year = substr($year, -2);
            $month = date("m");
            $day = date("d");
            $code_release = "TR" . $user->user_details_id . $year . $day . $month . rand(100, 9999) . "RCP";


            $transd = [];
                           $td = new Transfer_det();
                           $td->receiver = $branch_receiver->name;
                           $td->sender = $branch_sender->name;
                           $td->rec_id = $branch_receiver->id;
                           $td->send_id = $branch_sender->id;
                           $transd[] = $td;



            $new_release = Transaction::create([
                'transaction_type' => "Releasing",
                'accountability' => "Admin",
                'customer_name' => $branch_sender->name,
                'branch_id' => $userdet->branch_id,
                'user_id' => $user->id,
                'date_transac' => request("date_released"),
                'code' => $code_release,
                'description' => json_encode($transd),
                'isPOSRelease' => 1,
                'receiving_pos_branch' => $branch_receiver->id,
            ]);

            // $branch_receiver =  Branch::where('id',  request("receiver_branch"))->firstOrFail();  // get branch receiver

            // transaction code
            // $code_receive = "TR" . $user->user_details_id . $year . $day . $month . rand(100, 9999) . "RC";
            // $new_receive = Transaction::create([
            //     'transaction_type' => "Receiving",
            //     'accountability' => "Admin",
            //     'customer_name' => $branch_receiver->name,
            //     'branch_id' => request("receiver_branch"),
            //     'user_id' => $user->id, // for confirmation
            //     'date_transac' => request("date_received"),
            //     'code' => $code_receive,
            //     'description' => json_encode($transd),
            // ]);


            $itmObj = json_decode(request('items'), true);

            foreach ($itmObj as $itm) {

                $orgItem = Item::where('id', $itm["id"])->firstOrFail();


                $itcount_sender = Item_count::where('item_id', $itm["id"])->where('branch_id', $userdet->branch_id)->firstOrFail();
                // $itcount_receiver = Item_count::where('item_id', $itm["id"])->where('branch_id', request("receiver_branch"))->firstOrFail();

                $old_balance_sender = $itcount_sender->balance;
                $old_collectible_sender = $itcount_sender->collectible_amount;

                // $old_balance_receiver = $itcount_receiver->balance;
                // $old_collectible_receiver = $itcount_receiver->collectible_amount;

                // updating
                $itcount_sender->balance -= $itm["quantity"];
                $itcount_sender->collectible_amount = $itcount_sender->balance * $orgItem->unit_price;

                // $itcount_receiver->balance += $itm["quantity"];
                // $itcount_receiver->collectible_amount = $itcount_receiver->balance * $orgItem->unit_price;
                // updating

                Transaction_item::create([
                    'item_status' => "Released",
                    'unit_price' => $orgItem->unit_price,
                    'beg_balance' =>  $old_balance_sender,
                    'end_balance' => $itcount_sender->balance,
                    'beg_collectible' =>  $old_collectible_sender,
                    'end_collectible' => $itcount_sender->collectible_amount,
                    'original_price' => $orgItem->original_price,
                    'quantity' => $itm["quantity"],
                    'transaction_id' => $new_release->id,
                    'item_id' => $orgItem->id,
                ]);

                // Transaction_item::create([
                //     'item_status' => "Received",
                //     'unit_price' => $orgItem->unit_price,
                //     'beg_balance' => $old_balance_receiver,
                //     'end_balance' =>  $itcount_receiver->balance,
                //     'beg_collectible' => $old_collectible_receiver,
                //     'end_collectible' => $itcount_receiver->collectible_amount,
                //     'original_price' => $orgItem->original_price,
                //     'quantity' => $itm["quantity"],
                //     'transaction_id' => $new_receive->id,
                //     'item_id' => $orgItem->id,
                // ]);

                $itcount_sender->save();
                // $itcount_receiver->save();

            }






            return response()->json([
                'message' => "Successful",
            ], 201);
        } catch (Exception $e) {
        }
    }
}
