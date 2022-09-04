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
use App\CashierCashflow;
use App\Project;
use App\Customer;
use App\DebitedItm;
use App\Defective;
use App\Delivery;
use App\Notification;
use App\ReplacedItm;
use App\ReturnedItm;
use App\User;
use DB;

class ReturnController extends Controller
{
  /**
   * Display a listing of the resource.
   *
   * @return \Illuminate\Http\Response
   */
  public function index()
  {
    //
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
  // public function itemReturn(Request $request)
  public function store(Request $request)
  {
    if (!$user = auth()->setRequest($request)->user()) {
      return $this->responseUnauthorized();
    }
    try {
      $dateprint = date("m/d/Y H:i:s");
      //   check if the transaction is redundant
      $searchTrans =  Transaction::where('code', request('return_code'))->get();
      if (!$searchTrans->isEmpty()) {
        $message = "Transaction already record";
        return response()->json([
          'validation' => 90,
          'message' => $message,
        ], 200);
      }

      $userdet =  User_detail::where('id', $user->user_details_id)->firstOrFail();  // get branch
      // check item availability


      $itmObj = json_decode(request('replaced_items'), true);
      // Check the item balance
      $message = array();
      $message[] = "Items with Insufficient Balance: ";
      foreach ($itmObj as $itm) {
        $orgItem = Item::where('id', $itm["id"])->firstOrFail();

        $update = Item_count::where('item_id', $itm["id"])
          ->where('branch_id', $userdet->branch_id)
          ->firstOrFail();

        $insufbal = "no";

        if ($itm["Quantity"] > $update->balance) {
          $insufbal = "yes";
          $message[] = ' ' . $orgItem->name . ',';
        }

        if ($insufbal == "yes") {

          $selectItem =  Item::join('brands', 'items.brand_id', '=', 'brands.id')
            ->join('item_categories', 'items.category_id', '=', 'item_categories.id')
            ->join('item_counts', 'items.id', '=', 'item_counts.item_id')
            ->where('item_counts.branch_id', '=', $userdet->branch_id)
            ->where('item_counts.balance', '>', 0)
            ->select('items.*', 'brands.name as brand', 'item_categories.name as category', 'item_counts.balance as balance')
            ->get();

          return response()->json([
            'validation' => 100,
            'items' => $selectItem,
            'message' => $message,
          ], 200);
        }
      }
      // check item availability



      $user =  User::where('id', request('uId'))->firstOrFail();
      // $userdet =  User_detail::where('id', $user->user_details_id)->firstOrFail();  // get branch

      $transaction = Transaction::where('transactions.code', '=', request('original_code'))->firstOrFail();

      $customer_id = null;
      $project_id = null;
      $office_id = null;
      $beg_charge_bal = null;
      $end_charge_bal = null;
      $debit_code = null;

      $beg_def_bal = null;
      $end_def_bal = null;

      $beg_balance = null;
      $end_balance = null;
      $beg_collectible = null;
      $newCollect = null;

      $total = 0;
      $notDebTotal = 0;
      $debTotal = 0;

      $retObj = json_decode(request('returned_items'), true);
      foreach ($retObj as $itm) {

        // $notDebTotal += $itm["unit_price"]; // add all item value for debit
        $notDebTotal += $itm["unit_price"]  * $itm["quantity"]; // add all item value for debit

      }
      if ($transaction->transaction_type == "Charge") { //deduct item amount to entity's balance
        //FOR CONFIRMATION IF THE BALANCE WILL BE DEDUCTED TO RETURNED ITEMS


        foreach ($retObj as $itm) {
          if ($itm["item_debit"] == "yes") {
            // $total += $itm["unit_price"]; // add all item value for debit
            $total += $itm["unit_price"] * $itm["quantity"]; // add all item value for debit

          }
        }
        $debTotal = $total;
        if (request('make_debit') == "yes") { //  identifies if there are items to be debited
          if ($transaction->accountability == "Customer") {

            $customer =  Customer::where('id', $transaction->customer_id)->firstOrFail();  // get customer
            $beg_charge_bal = $customer->charge_balance;
            $customer->charge_balance -=  $total;
            $end_charge_bal = $customer->charge_balance;
            $customer->save();
            $customer_id = $transaction->customer_id;
          } else if ($transaction->accountability == "Project") {

            $project =  Project::where('id', $transaction->project_id)->firstOrFail();  // get project
            $beg_charge_bal = $project->balance;
            $project->balance -=  $total;
            $end_charge_bal = $project->balance;
            $project->save();
            $project_id = $transaction->project_id;
          } else if ($transaction->accountability == "Maintenance") {

            $office =  Branch::where('id', $transaction->office_id)->firstOrFail();  // get office
            $beg_charge_bal = $office->balance;
            $office->balance -= $total;
            $end_charge_bal = $office->balance;
            $office->save();
            $office_id = $transaction->office_id;
          }


          $debit_code = request('debit_code');
        }
      } //end condition if it is charge
     
        $sn_trans =  Transaction::where('transaction_type', "Return")->where('branch_id', $userdet->branch_id)
        ->orderBy('created_at', 'DESC')->first();
        // ->orderBy('created_at', 'DESC')->take(1)->get();

        // $series_no = $sn_trans[0]->series_no + 1;
        if (is_null($sn_trans)) {
          $series_no = 1;
        }else{
          $series_no = $sn_trans->series_no + 1;
        }
     
      //Create return transaction
      $newReturnTransaction = Transaction::create([
        'receipt_code' => request('receipt_code'),
        'transaction_type' => "Return",
        'accountability' =>  $transaction->accountability,
        'user_id' => $user->id,
        'branch_id' => $userdet->branch_id,
        'customer_name' => $transaction->customer_name,
        // 'amount_received' => request('amount_received'),
        'code' => request('return_code'),
        'date_printed' => $dateprint,
        'date_transac' =>  request('date_transac'),
        'payable' =>  $notDebTotal,
        'customer_id' =>  $customer_id,
        'project_id' =>  $project_id,
        'office_id' =>  $office_id,
        // 'charge_status' =>  "Paid",
        'beg_charge_bal' =>  $beg_charge_bal,
        'end_charge_bal' =>  $beg_charge_bal,
        // 'end_charge_bal' =>  $end_charge_bal,
        'debit_code' =>  $debit_code,
        'series_no' =>  $series_no,
      ]);

      // update original transaction
      // $transaction = Transaction::where('transactions.code', '=', request('original_code'))->firstOrFail();
      // $transaction->return_code =  request('return_code');
      // $transaction->debit_code =  $debit_code;
      // $transaction->save();

      // add new return to the sale
      $savereturn = ReturnedItm::create([
        'sale_code' => request('original_code'),
        'return_code' =>  request('return_code'),
        'sale_id' =>  $transaction->id,
        'return_id' =>  $newReturnTransaction->id,
      ]);


      if ($transaction->transaction_type == "Charge") {
        if (request('make_debit') == "yes") {
          $newDebitTransaction = Transaction::create([
            'transaction_type' => "Debit",
            'accountability' =>  $transaction->accountability,
            'user_id' => $user->id,
            'branch_id' => $userdet->branch_id,
            'customer_name' => $transaction->customer_name,
            // 'amount_received' => request('amount_received'),
            'code' => request('debit_code'),
            'date_printed' => $dateprint,
            'date_transac' =>  request('date_transac'),
            'payable' =>  $debTotal,
            'customer_id' =>  $customer_id,
            'project_id' =>  $project_id,
            'office_id' =>  $office_id,
            // 'charge_status' =>  "Paid",
            'beg_charge_bal' =>  $beg_charge_bal,
            'end_charge_bal' =>  $end_charge_bal,
          ]);
        }

        // add new debit to the sale
        $savedebit = DebitedItm::create([
          'sale_code' => request('original_code'),
          'debit_code' =>  request('debit_code'),
          'sale_id' =>  $transaction->id,
          'return_id' =>  $newReturnTransaction->id,
          'debit_id' =>  request('make_debit') == "yes" ? $newDebitTransaction->id : null,
        ]);
      }

      //loop for returned items
      foreach ($retObj as $itm) {

        $orgItem = Item::where('id', $itm["item_id"])->firstOrFail();

        // set the beginning balance
        $begBal = Item_count::where('item_id', $itm["item_id"])
          ->where('branch_id', $userdet->branch_id)
          ->firstOrFail();

        $beg_collectible = $begBal->collectible_amount; // beg collectioble of item


        // update  branch's item count
        $update = Item_count::where('item_id', $itm["item_id"])
          ->where('branch_id', $userdet->branch_id)
          ->firstOrFail();
        $beg_balance = $update->balance; //item count beginning balance


        if ($itm["status"] == "Good Condition") { //if item is marked good condition

          // // set the beginning balance
          // $begBal = Item_count::where('item_id', $itm["item_id"])
          //   ->where('branch_id', $userdet->branch_id)
          //   ->firstOrFail();

          // $beg_collectible = $begBal->collectible_amount; // beg collectioble of item

          // // update  branch's item count
          // $update = Item_count::where('item_id', $itm["item_id"])
          //   ->where('branch_id', $userdet->branch_id)
          //   ->firstOrFail();
          // $beg_balance = $update->balance; //item count beginning balance
          $update->balance += $itm["quantity"];
          $end_balance = $update->balance; //item count ending balance
          $update->save();

          // updated collectible branch
          $itcount = Item_count::where('item_id', $itm["item_id"])
            ->where('branch_id',  $userdet->branch_id)
            ->get();

          $newCollect = $itcount[0]->balance * $orgItem->unit_price;
          $NewCount = Item_count::where('item_id', $itm["item_id"])->where('branch_id', $userdet->branch_id)->firstOrFail();
          $NewCount->collectible_amount = $newCollect;
          $NewCount->save();

          $item_status = "Returned GC";
        } else { // if item is marked defective

          $end_balance = $beg_balance;
          $newCollect = $beg_collectible;


          // $defectItem = Defective::where('item_id', '=', $itm["item_id"])->first(); //search for existing defetive item count
          $defectItem = Defective::where('item_id', '=', $itm["item_id"])
            ->where('branch_id', '=', $userdet->branch_id)
            ->first(); //search for existing defetive item count
          if (is_null($defectItem)) {
            $newDefect = Defective::create([
              'item_id' => $itm["item_id"],
              'balance' => $itm["quantity"],
              'branch_id' => $userdet->branch_id,
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
          'end_balance' => $end_balance,
          'original_price' => $orgItem->original_price,
          'beg_collectible' => $beg_collectible,
          'end_collectible' => $newCollect,
          'beg_def_bal' => $beg_def_bal,
          'end_def_bal' => $end_def_bal,
          'quantity' => $itm["quantity"],
          'transaction_id' => $newReturnTransaction->id,
          'item_id' => $itm["item_id"],
          'debit' => $itm["item_debit"],
        ]);

        //update original transaction item (return id)
        $transactionItem = Transaction_item::where('transaction_items.id', '=', $itm["trnItm_id"])->firstOrFail();
        $transactionItem->return_transacitem_id = $returnTransactItem->id;
        $transactionItem->save();
      } // end loop for returned items

      if (request('has_replacement') == "yes") {

        $transaction = Transaction::where('transactions.code', '=', request('original_code'))->firstOrFail();

        $beg_charge_bal = null;
        $end_charge_bal = null;
        $beg_def_bal = null;
        $end_def_bal = null;

        $beg_balance = null;
        $end_balance = null;
        $beg_collectible = null;
        $newCollect = null;

        $total = 0;

        $trans_type = "Replacement";
        $charge_status = null;

        $repObj = json_decode(request('replaced_items'), true);
        foreach ($repObj as $itm) {
          // $total += $itm["unit_price"]; // add all item value for balance
          $total += $itm["unit_price"] * $itm["Quantity"]; // add all item value for balance
        }

        $delivery_id = null;
        if (request('delivery_fee') || request('contact') || request(' address')) {
          $delivery = Delivery::create([
            'name' => $transaction->customer_name,
            'address' => request('address'),
            'contact' => request('contact'),
            'delivery_fee' => request('delivery_fee'),
          ]);
          $delivery_id = $delivery->id;

          // if(request('delivery_fee')){
          //   $total += request('delivery_fee');
          // }
        } //if customer ask fo delivery


        if ($transaction->transaction_type == "Charge") { //add to entity's payable

          if (request('delivery_fee')) {
            $total += request('delivery_fee');
          }

          if ($transaction->accountability == "Customer") {

            $customer =  Customer::where('id', $transaction->customer_id)->firstOrFail();  // get customer
            $beg_charge_bal = $customer->charge_balance;
            $customer->charge_balance +=  $total;
            $end_charge_bal = $customer->charge_balance;
            $customer->save();
            $customer_id = $transaction->customer_id;
          } else if ($transaction->accountability == "Project") {

            $project =  Project::where('id', $transaction->project_id)->firstOrFail();  // get project
            $beg_charge_bal = $project->balance;
            $project->balance +=  $total;
            $end_charge_bal = $project->balance;
            $project->save();
            $project_id = $transaction->project_id;
          } else if ($transaction->accountability == "Maintenance") {

            $office =  Branch::where('id', $transaction->office_id)->firstOrFail();  // get office
            $beg_charge_bal = $office->balance;
            $office->balance += $total;
            $end_charge_bal = $office->balance;
            $office->save();
            $office_id = $transaction->office_id;
          }

          $trans_type = "Charge";
          $charge_status = "Unpaid";
        } //end condition if it is charge





        //Create return transaction


        $newReplaceTransaction = Transaction::create([
          'transaction_type' => $trans_type,
          'accountability' =>  $transaction->accountability,
          'user_id' => $user->id,
          'branch_id' => $userdet->branch_id,
          'customer_name' => $transaction->customer_name,
          // 'amount_received' => request('amount_received'),
          'code' => request('replace_code'),
          'date_printed' => $dateprint,
          'date_transac' =>  request('date_transac'),
          'payable' =>  $total,
          'customer_id' =>  $customer_id,
          'project_id' =>  $project_id,
          'office_id' =>  $office_id,
          'charge_status' =>  $charge_status,
          'beg_charge_bal' =>  $beg_charge_bal,
          'end_charge_bal' =>  $end_charge_bal,
          'debit_code' =>  $debit_code,
          'return_code' =>  request('return_code'),
          'delivery_id' => $delivery_id,
        ]);

        // save new replacement
        $savereplace = ReplacedItm::create([
          'sale_code' => request('original_code'),
          'replace_code' =>  request('replace_code'),
        ]);

        $repObj = json_decode(request('replaced_items'), true);
        foreach ($repObj as $itm) { //loop for replacement items
          $orgItem = Item::where('id', $itm["id"])->firstOrFail();
          // set the beginning balance
          $begBal = Item_count::where('item_id', $itm["id"])
            ->where('branch_id', $userdet->branch_id)
            ->firstOrFail();

          $beg_collectible = $begBal->collectible_amount; // beg collectioble of item

          // update  branch's item count
          $update = Item_count::where('item_id', $itm["id"])
            ->where('branch_id', $userdet->branch_id)
            ->firstOrFail();
          $beg_balance = $update->balance; //item count beginning balance
          // $update->balance += $itm["Quantity"];
          $update->balance -= $itm["Quantity"];
          $end_balance = $update->balance; //item count ending balance
          $update->save();

          // updated collectible branch
          $itcount = Item_count::where('item_id', $itm["id"])
            ->where('branch_id',  $userdet->branch_id)
            ->get();

          $newCollect = $itcount[0]->balance * $orgItem->unit_price;
          $NewCount = Item_count::where('item_id', $itm["id"])->where('branch_id', $userdet->branch_id)->firstOrFail();
          $NewCount->collectible_amount = $newCollect;
          $NewCount->save();

          //stop here


          //add transaction item for return

          $returnTransactItem = Transaction_item::create([
            'item_status' => "Replacement",
            'unit_price' => $orgItem->unit_price,
            'beg_balance' => $beg_balance,
            'end_balance' => $end_balance,
            'original_price' => $orgItem->original_price,
            'beg_collectible' => $beg_collectible,
            'end_collectible' => $newCollect,
            'quantity' => $itm["Quantity"],
            'transaction_id' => $newReplaceTransaction->id,
            'item_id' => $itm["id"],

          ]);

          // check threshold
          $threshold = Item_count::where('item_id', $itm["id"])
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
        } //end loop for replacement items


        // if there are excess
        if ($transaction->transaction_type == "Sale") {
          if (request('payable') > 0) {
            $newExcessTransaction = Transaction::create([
              'transaction_type' => "Excess Payment",
              'accountability' =>  $transaction->accountability,
              'user_id' => $user->id,
              'branch_id' => $userdet->branch_id,
              'customer_name' => $transaction->customer_name,
              // 'amount_received' => request('amount_received'),
              'code' => request('excess_code'),
              'date_printed' => $dateprint,
              'date_transac' =>  request('date_transac'),
              'payable' =>  request('payable'),
              // 'return_code' =>  request('return_code'), 
              'return_code' =>  request('return_code'),
              'delivery_id' => $delivery_id,
            ]);

            $coh = User_detail::where('id', '=', $user->user_details_id)->firstorfail();

            if ($coh->enable_cashflow == "yes") {
              $oldcoh = $coh->cash_on_hand;
              $coh->cash_on_hand += request('payable');

              $newcoh = CashierCashflow::create([
                'trans_date' => date("Y-m-d h:i:sa"),
                'type' => "Cash In",
                'accountability' => $transaction->accountability,
                'amount' => request('payable'),
                'beg_cash' =>  $oldcoh,
                'end_cash' =>  $coh->cash_on_hand,
                'user_id' => $user->id,
                'description' => "Excess Payment",
                'transaction_id' =>   $newExcessTransaction->id,
              ]);
              $coh->save();

              $partTrans = Transaction::where('id', '=', $newExcessTransaction->id)->firstorfail();
              $partTrans->partof_cashflow = "yes";
              $partTrans->save();
            }
          }
        }
      } //end condition if there are replacements

      // output
      // $selectItem =  Item::join('brands', 'items.brand_id', '=', 'brands.id')
      //   ->join('item_categories', 'items.category_id', '=', 'item_categories.id')
      //   ->join('item_counts', 'items.id', '=', 'item_counts.item_id')
      //   ->where('item_counts.branch_id', '=', $userdet->branch_id)
      //   ->where('item_counts.balance', '>', 0)
      //   ->select('items.*', 'brands.name as brand', 'item_categories.name as category', 'item_counts.balance as balance')
      //   ->get();

      return response()->json([
        'status' => 200,
        'items' => [],
        // 'items' => $selectItem,
        'printdate' => $dateprint,
        'series_no' => $series_no,
      ], 200);
    } catch (Exception $e) {
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
