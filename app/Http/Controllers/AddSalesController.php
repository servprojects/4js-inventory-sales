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
use App\Defective;
use App\Delivery;
use App\Notification;
use App\User;
use DB;


class AddSalesController extends Controller
{
  public function index(Request $request)
  {
    // if (!$user = auth()->setRequest($request)->user()) {
    //     return $this->responseUnauthorized();
    // }

    // try {
    //     $branch = Branch::select('branches.id', 'branches.name')->get();

    //     $allphys = PhysicalCount::join('branches', 'physical_counts.branch_id', '=', 'branches.id')
    //         ->select('physical_counts.id', 'physical_counts.date', 'branches.name')->get();
    // } catch (Exception $e) {
    //     // return $this->responseServerError('Error updating resource.');
    // }
    // return response()->json([
    //     'status' => 200,
    //     'message' => 'Update successful',
    //     'branch' => $branch,
    //     'allphys' => $allphys,

    // ], 200);
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

    // return response()->json([
    //     'status' => 44,
    //     'message' => 'here',


    // ], 200);


    $user =  User::where('id', request('uId'))->firstOrFail();

    try {


      $dateprint = date("m/d/Y H:i:s");
      $userdet =  User_detail::where('id', $user->user_details_id)->firstOrFail();  // get branch

      //   check if the transaction is redundant
      $searchTrans =  Transaction::where('code', request('trasaction_code'))->get();
      if (!$searchTrans->isEmpty()) {
        $message = "Transaction already recorded";
        return response()->json([
          'validation' => 90,
          'message' => $message,
        ], 200);
      }






      $itmObj = json_decode(request('items'), true);
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


      $discount = null;
      if (request('discount')) {
        $discount = request('discount');
      } //if there is discount

      $beg_charge_bal = null;
      $end_charge_bal = null;
      $charge_status = null;
      $proj_id = null;
      if (request('transaction_type') == "Charge" && request('accountability') == "Project") {
        $project =  Project::where('id', request('project_id'))->firstOrFail();  // get project
        $beg_charge_bal = $project->balance;
        $project->balance +=  request('payable');
        $end_charge_bal = $project->balance;
        $project->save();

        $proj_id = request('project_id');
        $charge_status = "Unpaid";
      }

      $customer_id = null;
      if (request('transaction_type') == "Charge" && request('accountability') == "Customer") {
        $customer =  Customer::where('id', request('customer_id'))->firstOrFail();  // get project

        $beg_charge_bal = $customer->charge_balance;

        $customer->charge_balance +=  request('payable');

        $end_charge_bal = $customer->charge_balance;

        $customer->save();

        $customer_id = request('customer_id');
        $charge_status = "Unpaid";
      }

      $office_id = null;
      if (request('transaction_type') == "Charge" && request('accountability') == "Maintenance") {
        $office =  Branch::where('id', request('office_id'))->firstOrFail();  // get project
        $beg_charge_bal = $office->balance;

        $office->balance +=  request('payable');

        $end_charge_bal = $office->balance;
        $office->save();

        $office_id = request('office_id');
        $charge_status = "Unpaid";
      }

      $delivery_id = null;
      if (request('delivery_fee')) {
        $delivery = Delivery::create([
          'name' => request('customer_name'),
          'address' => request('address'),
          'contact' => request('contact'),
          'delivery_fee' => request('delivery_fee'),
        ]);
        $delivery_id = $delivery->id;
      } //if customer ask fo delivery

      // $userdet =  User_detail::where('id', $user->user_details_id)->firstOrFail();  // get branch

      if (request('transaction_type') == "Sale") {
        $sn_trans =  Transaction::where('transaction_type', "Sale")->where('branch_id', $userdet->branch_id)
          ->orderBy('created_at', 'DESC')->first();
          // ->orderBy('created_at', 'DESC')->take(1)->get();
        if (is_null($sn_trans)) {
          $series_no =1;
        }else{
          $series_no = $sn_trans->series_no + 1;
        }
      } else if (request('transaction_type') == "Charge") {
        $sn_trans =  Transaction::where('transaction_type', "Charge")->where('branch_id', $userdet->branch_id)
          ->orderBy('created_at', 'DESC')->first();
          // ->orderBy('created_at', 'DESC')->take(1)->get();
          if (is_null($sn_trans)) {
            $series_no = 1;
          }else{
            $series_no = $sn_trans->series_no + 1;
          }
      }

      $new = Transaction::create([
        'receipt_code' => request('receipt_code'),
        'transaction_type' => request('transaction_type'),
        'accountability' =>  request('accountability'),
        'discount' => $discount,
        'user_id' => $user->id,
        'branch_id' => $userdet->branch_id,
        'delivery_id' => $delivery_id,
        'customer_name' => request('customer_name'),
        'amount_received' => request('amount_received'),
        'code' => request('trasaction_code'),
        'date_printed' => $dateprint,
        'date_transac' =>  request('date_transac'),
        'payable' =>  request('payable'),
        'project_id' =>  $proj_id,
        'customer_id' =>  $customer_id,
        'charge_status' =>  $charge_status,
        'office_id' =>  $office_id,
        'beg_charge_bal' =>  $beg_charge_bal,
        'end_charge_bal' =>  $end_charge_bal,
        'series_no' =>  $series_no,

      ]);

      // Cash_on_hand
      if (request('transaction_type') == "Sale") {
        $coh = User_detail::where('id', '=', $user->user_details_id)->firstorfail();

        if ($coh->enable_cashflow == "yes") {
          $oldcoh = $coh->cash_on_hand;
          $coh->cash_on_hand += request('payable');

          $newcoh = CashierCashflow::create([
            'trans_date' => date("Y-m-d h:i:sa"),
            'type' => "Cash In",
            'accountability' => request('accountability'),
            'amount' => request('payable'),
            'beg_cash' =>  $oldcoh,
            'end_cash' =>  $coh->cash_on_hand,
            'user_id' => $user->id,
            'description' => "Direct sale",
            'transaction_id' =>   $new->id,
          ]);
          $coh->save();

          $partTrans = Transaction::where('id', '=', $new->id)->firstorfail();
          $partTrans->partof_cashflow = "yes";
          $partTrans->save();
        }
      }

      $itmObj = json_decode(request('items'), true);

      foreach ($itmObj as $itm) {
        // get original item
        $orgItem = Item::where('id', $itm["id"])->firstOrFail();

        // set the beginning balance
        $begBal = Item_count::where('item_id', $itm["id"])
          ->where('branch_id', $userdet->branch_id)
          ->firstOrFail();




        // update  branch's item count
        $update = Item_count::where('item_id', $itm["id"])
          ->where('branch_id', $userdet->branch_id)
          ->firstOrFail();
        $update->balance -= $itm["Quantity"];
        $update->save();

        // updated collectible requested branch
        $itcount = Item_count::where('item_id', $itm["id"])
          ->where('branch_id',  $userdet->branch_id)
          ->get();

        $newCollect = $itcount[0]->balance * $orgItem->unit_price;
        $NewCount = Item_count::where('item_id', $itm["id"])->where('branch_id', $userdet->branch_id)->firstOrFail();
        $NewCount->collectible_amount = $newCollect;
        $NewCount->save();

        Transaction_item::create([
          'item_status' => "Released",
          'unit_price' => $orgItem->unit_price,
          'beg_balance' => $begBal->balance,
          'end_balance' => $begBal->balance - $itm["Quantity"],
          'original_price' => $orgItem->original_price,
          'beg_collectible' => $begBal->collectible_amount,
          'end_collectible' => $newCollect,
          'quantity' => $itm["Quantity"],
          'transaction_id' => $new->id,
          'item_id' => $itm["id"],
        ]);
      }

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

      // deduct balance with partial payment
      if (request('transaction_type') == "Charge") {

        if (request('partial')) {
          $beg_charge_bal = null;
          $end_charge_bal = null;

          $customer_id = null;
          if (request('accountability') == "Customer") {
            $customer =  Customer::where('id', request('customer_id'))->firstOrFail();  // get customer

            $beg_charge_bal = $customer->charge_balance;

            $customer->charge_balance -=  request('partial');

            $end_charge_bal = $customer->charge_balance;

            $customer->save();

            $customer_id = request('customer_id');
          }

          $project_id = null;
          if (request('accountability') == "Project") {
            $project =  Project::where('id', request('project_id'))->firstOrFail();  // get project

            $beg_charge_bal = $project->balance;

            $project->balance -=  request('partial');

            $end_charge_bal = $project->balance;

            $project->save();

            $project_id = request('project_id');
          }

          $office_id = null;
          if (request('accountability') == "Maintenance") {
            $office =  Branch::where('id', request('office_id'))->firstOrFail();  // get office
            $beg_charge_bal = $office->balance;

            $office->balance -=  request('partial');

            $end_charge_bal = $office->balance;
            $office->save();

            $office_id = request('office_id');
          }

          $new = Transaction::create([
            'transaction_type' => "Payment Charge",
            'accountability' =>  request('accountability'),
            'user_id' => $user->id,
            'branch_id' => $userdet->branch_id,
            'customer_name' => request('customer_name'),
            'amount_received' => request('amount_received'),
            'code' => request('pc_code'),
            'charge_transaction_code' => request('trasaction_code'),
            'date_printed' => $dateprint,
            'date_transac' =>  request('date_transac'),
            'payable' =>  request('partial'),
            'customer_id' =>  $customer_id,
            'project_id' =>  $project_id,
            'office_id' =>  $office_id,
            'charge_status' =>  "Paid",
            'beg_charge_bal' =>  $beg_charge_bal,
            'end_charge_bal' =>  $end_charge_bal,
            'date_paid' =>  request('date_transac'),

          ]);

          $coh = User_detail::where('id', '=', $user->user_details_id)->firstorfail();

          if ($coh->enable_cashflow == "yes") {
            $oldcoh = $coh->cash_on_hand;
            $coh->cash_on_hand += request('partial');

            $newcoh = CashierCashflow::create([
              'trans_date' => date("Y-m-d h:i:sa"),
              'type' => "Cash In",
              'accountability' => request('accountability'),
              'amount' => request('partial'),
              'beg_cash' =>  $oldcoh,
              'end_cash' =>  $coh->cash_on_hand,
              'user_id' => $user->id,
              'description' => "Partial Payment",
              'transaction_id' =>   $new->id,
            ]);
            $coh->save();

            $partTrans = Transaction::where('id', '=', $new->id)->firstorfail();
            $partTrans->partof_cashflow = "yes";
            $partTrans->save();
            // partof_cashflow
          }
        }
      }


      // Output 
      $transactions = Transaction::select('transactions.*')->get();
      $transactionItems = Transaction_item::select('transaction_items.*')->get();
      $delivery = Delivery::select('deliveries.*')->get();

      $selectItem =  Item::join('brands', 'items.brand_id', '=', 'brands.id')
        ->join('item_categories', 'items.category_id', '=', 'item_categories.id')
        ->join('item_counts', 'items.id', '=', 'item_counts.item_id')
        ->where('item_counts.branch_id', '=', $userdet->branch_id)
        ->where('item_counts.balance', '>', 0)
        ->select('items.*', 'brands.name as brand', 'item_categories.name as category', 'item_counts.balance as balance')
        ->get();

      // $itemList =  Item::join('brands', 'items.brand_id', '=', 'brands.id')
      //   ->join('item_categories', 'items.category_id', '=', 'item_categories.id')
      //   ->join('item_counts', 'items.id', '=', 'item_counts.item_id')
      //   ->where('item_counts.branch_id', '=', $userdet->branch_id)
      //   ->select('items.*', 'brands.name as brand', 'item_categories.name as category', 'item_counts.balance as balance')
      //   ->get();

      // $AllCustomerCharge = Customer::join('user_details', 'customers.user_details_id', '=', 'user_details.id')
      //   ->where('customers.charge_balance', '>=', 1)
      //   ->select('customers.*', 'user_details.first_name as first_name', 'user_details.last_name as last_name')->get();

      // $AllProjectCharge = Project::where('projects.balance', '>=', 1)
      //   ->select('projects.*')
      //   ->get();

      // $AllOfficeCharge = Branch::where('branches.balance', '>=', 1)
      //   ->select('branches.*')
      //   ->get();
    } catch (Exception $e) {
    }
    $message = "success";
    return response()->json([
      'status' => 200,
      // 'items' => $selectItem,
      // 'itemList' => $itemList,
      'branch' => $userdet->branch_id,
      // 'AllCustomerCharge' => $AllCustomerCharge,
      // 'AllProjectCharge' => $AllProjectCharge,
      // 'AllOfficeCharge' => $AllOfficeCharge,
      'validation' => 200,
      'message' => $message,
      'printdate' => $dateprint,
      'series_no' => $series_no,
    ], 200);
  }
}
