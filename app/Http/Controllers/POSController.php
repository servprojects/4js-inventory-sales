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

class POSController extends Controller
{
  public function index(Request $request)
  {
    //
  }
  public function store(Request $request)
  {
    if (!$user = auth()->setRequest($request)->user()) {
      return $this->responseUnauthorized();
    }
    // $user =  User::where('id', request('uId'))->firstOrFail();

    try {
      $dateprint = date("Y-m-d H:i:s");
      $userdet =  User_detail::where('id', $user->user_details_id)->firstOrFail();  // get branch
      $searchTrans =  Transaction::where('code', request('trasaction_code'))->firstOrFail();  // get branch

      if ($searchTrans) {

        $selectItem =  Item::join('brands', 'items.brand_id', '=', 'brands.id')
          ->join('item_categories', 'items.category_id', '=', 'item_categories.id')
          ->join('item_counts', 'items.id', '=', 'item_counts.item_id')
          ->where('item_counts.branch_id', '=', $userdet->branch_id)
          ->where('item_counts.balance', '>', 0)
          ->select('items.*', 'brands.name as brand', 'item_categories.name as category', 'item_counts.balance as balance')
          ->get();
        $message = "Transaction already record";
        return response()->json([
          'validation' => 90,
          'items' => $selectItem,
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

      $new = Transaction::create([
        'transaction_type' => request('transaction_type'),
        'accountability' =>  request('accountability'),
        'discount' => $discount,
        'user_id' => $user->id,
        'branch_id' => $userdet->branch_id,
        'delivery_id' => $delivery_id,
        'customer_name' => request('customer_name'),
        'amount_received' => request('amount_received'),
        'code' => request('trasaction_code'),
        'date_printed' => "date",
        'date_transac' =>  request('date_transac'),
        'payable' =>  request('payable'),
        'project_id' =>  $proj_id,
        'customer_id' =>  $customer_id,
        'charge_status' =>  $charge_status,
        'office_id' =>  $office_id,
        'beg_charge_bal' =>  $beg_charge_bal,
        'end_charge_bal' =>  $end_charge_bal,

      ]);

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
        }
      }


      // Output 
      // $transactions = Transaction::select('transactions.*')->get();
      // $transactionItems = Transaction_item::select('transaction_items.*')->get();
      // $delivery = Delivery::select('deliveries.*')->get();

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
      'items' => $selectItem,
      // 'itemList' => $itemList,
      'branch' => $userdet->branch_id,
      // 'AllCustomerCharge' => $AllCustomerCharge,
      // 'AllProjectCharge' => $AllProjectCharge,
      // 'AllOfficeCharge' => $AllOfficeCharge,
      'validation' => 200,
      // 'message' => ' ',
      'message' => $message,
    ], 200);
  }
  public function storeCharge(Request $request)
  {
    if (!$user = auth()->setRequest($request)->user()) {
      return $this->responseUnauthorized();
    }
    $user =  User::where('id', request('uId'))->firstOrFail();
    $userdet =  User_detail::where('id', $user->user_details_id)->firstOrFail();  // get branch
    try {
      $dateprint = date("m/d/Y H:i:s");
      //   check if the transaction is redundant
      $searchTrans =  Transaction::where('code', request('trasaction_code'))->get();
      if (!$searchTrans->isEmpty()) {
        $message = "Transaction already record";
        return response()->json([
          'validation' => 90,
          'message' => $message,
        ], 200);
      }




      $beg_charge_bal = null;
      $end_charge_bal = null;

      $customer_id = null;
      if (request('transaction_type') == "Payment Charge" && request('accountability') == "Customer") {
        $customer =  Customer::where('id', request('customer_id'))->firstOrFail();  // get customer

        $beg_charge_bal = $customer->charge_balance;

        $customer->charge_balance -=  request('payable');

        $end_charge_bal = $customer->charge_balance;

        $customer->save();

        $customer_id = request('customer_id');
      }

      $project_id = null;
      if (request('transaction_type') == "Payment Charge" && request('accountability') == "Project") {
        $project =  Project::where('id', request('project_id'))->firstOrFail();  // get project

        $beg_charge_bal = $project->balance;

        $project->balance -=  request('payable');

        $end_charge_bal = $project->balance;

        $project->save();

        $project_id = request('project_id');
      }

      $office_id = null;
      if (request('transaction_type') == "Payment Charge" && request('accountability') == "Maintenance") {
        $office =  Branch::where('id', request('office_id'))->firstOrFail();  // get office
        $beg_charge_bal = $office->balance;

        $office->balance -=  request('payable');

        $end_charge_bal = $office->balance;
        $office->save();

        $office_id = request('office_id');
      }




      $new = Transaction::create([
        'receipt_code' => request('receipt_code'),
        'transaction_type' => request('transaction_type'),
        'accountability' =>  request('accountability'),
        'user_id' => $user->id,
        'branch_id' => $userdet->branch_id,
        'customer_name' => request('customer_name'),
        'amount_received' => request('amount_received'),
        'code' => request('trasaction_code'),
        'date_printed' =>  $dateprint,
        'date_transac' =>  request('date_transac'),
        'payable' =>  request('payable'),
        'customer_id' =>  $customer_id,
        'project_id' =>  $project_id,
        'office_id' =>  $office_id,
        'charge_status' =>  "Paid",
        'beg_charge_bal' =>  $beg_charge_bal,
        'end_charge_bal' =>  $end_charge_bal,
        'date_paid' =>  request('date_transac'),

      ]);

      if (request('transaction_type') == "Payment Charge") {
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
            'description' => "Payment Charge",
            'transaction_id' =>   $new->id,
          ]);
          $coh->save();

          $partTrans = Transaction::where('id', '=', $new->id)->firstorfail();
          $partTrans->partof_cashflow = "yes";
          $partTrans->save();
        }
        
      }

      // $itmObj = json_decode(request('items'), true);

      // foreach ($itmObj as $itm) {
      //   $transac =  Transaction::where('id', $itm["id"])->firstOrFail();  // get transaction
      //   $transac->charge_status =  "Paid";
      //   $transac->date_paid =  request('date_transac');
      //   $transac->charge_payment_transac_id =  request('trasaction_code');
      //   $transac->save();
      // }

      // $AllCustomerCharge = [];
      $customerCharges = [];
      // $AllProjectCharge = [];
      $projectCharges = [];
      // $AllOfficeCharge = [];
      $officeCharges = [];
      $balance = 0;

      if (request('transaction_type') == "Payment Charge" && request('accountability') == "Customer") {
        // $AllCustomerCharge = Customer::join('user_details', 'customers.user_details_id', '=', 'user_details.id')
        //   ->where('customers.charge_balance', '>=', 1)
        //   ->select('customers.*', 'user_details.first_name as first_name', 'user_details.last_name as last_name')->get();

        // $customerCharges =  Transaction_item::join('transactions', 'transaction_items.transaction_id', '=', 'transactions.id')
        //   ->join('branches', 'transactions.branch_id', '=', 'branches.id')
        //   ->join('items', 'transaction_items.item_id', '=', 'items.id')
        //   ->where('transactions.transaction_type', '=', "Charge")
        //   ->where('transactions.accountability', '=', "Customer")
        //   ->where('transactions.charge_status', '=', "unpaid")
        //   ->where('transactions.customer_id', '=', request('customer_id'))
        //   ->select(
        //     'transactions.id as t_id',
        //     'transaction_items.transaction_id as transId',
        //     'transactions.code',
        //     'transactions.requisition_id as transac_req',
        //     'transactions.date_transac',
        //     'transactions.payable',
        //     'branches.name',
        //     DB::raw('COUNT(transaction_items.item_id) as total_items'),
        //     DB::raw('DATE(transactions.created_at) as date'),
        //     DB::raw('"plus icon" as icon')
        //   )
        //   ->groupBy('transaction_items.transaction_id')
        //   ->get();

        $customer =  Customer::where('id', request('customer_id'))->firstOrFail();
        $balance = $customer->charge_balance;

        $col4 =  Transaction::join('branches', 'transactions.branch_id', '=', 'branches.id');
        $col4->where('transactions.customer_id', '=', request('customer_id'));
        $col4->where('transactions.accountability', '=', "Customer");
      }
      if (request('transaction_type') == "Payment Charge" && request('accountability') == "Project") {
        // $AllProjectCharge = Project::where('projects.balance', '>=', 1)
        //   ->select('projects.*')
        //   ->get();

        // $projectCharges =  Transaction_item::join('transactions', 'transaction_items.transaction_id', '=', 'transactions.id')
        //   ->join('branches', 'transactions.branch_id', '=', 'branches.id')
        //   ->join('items', 'transaction_items.item_id', '=', 'items.id')
        //   ->where('transactions.transaction_type', '=', "Charge")
        //   ->where('transactions.accountability', '=', "Project")
        //   ->where('transactions.charge_status', '=', "unpaid")
        //   ->where('transactions.project_id', '=', request('project_id'))
        //   ->select(
        //     'transactions.id as t_id',
        //     'transaction_items.transaction_id as transId',
        //     'transactions.code',
        //     'transactions.requisition_id as transac_req',
        //     'transactions.date_transac',
        //     'transactions.payable',
        //     'branches.name',
        //     DB::raw('COUNT(transaction_items.item_id) as total_items'),
        //     DB::raw('DATE(transactions.created_at) as date'),
        //     DB::raw('"plus icon" as icon')
        //   )
        //   ->groupBy('transaction_items.transaction_id')
        //   ->get();

        $project =  Project::where('id', request('project_id'))->firstOrFail();
        $balance = $project->balance;

        $col4 =  Transaction::join('branches', 'transactions.branch_id', '=', 'branches.id');
        $col4->where('transactions.project_id', '=', request('project_id'));
        $col4->where('transactions.accountability', '=', "Project");
      }
      if (request('transaction_type') == "Payment Charge" && request('accountability') == "Maintenance") {
        // $AllOfficeCharge = Branch::where('branches.balance', '>=', 1)
        //   ->select('branches.*')
        //   ->get();

        // $officeCharges =  Transaction_item::join('transactions', 'transaction_items.transaction_id', '=', 'transactions.id')
        //   ->join('branches', 'transactions.branch_id', '=', 'branches.id')
        //   ->join('items', 'transaction_items.item_id', '=', 'items.id')
        //   ->where('transactions.transaction_type', '=', "Charge")
        //   ->where('transactions.accountability', '=', "Maintenance")
        //   ->where('transactions.charge_status', '=', "unpaid")
        //   ->where('transactions.office_id', '=', request('office_id'))
        //   ->select(
        //     'transactions.id as t_id',
        //     'transaction_items.transaction_id as transId',
        //     'transactions.code',
        //     'transactions.requisition_id as transac_req',
        //     'transactions.date_transac',
        //     'transactions.payable',
        //     'branches.name',
        //     DB::raw('COUNT(transaction_items.item_id) as total_items'),
        //     DB::raw('DATE(transactions.created_at) as date'),
        //     DB::raw('"plus icon" as icon')
        //   )
        //   ->groupBy('transaction_items.transaction_id')
        //   ->get();

        $office =  Branch::where('id', request('office_id'))->firstOrFail();
        $balance = $office->balance;

        $col4 =  Transaction::join('branches', 'transactions.branch_id', '=', 'branches.id');
        $col4->where('transactions.office_id', '=', request('office_id'));
        $col4->where('transactions.accountability', '=', "Maintenance");
      }

      $col4->where('transactions.transaction_type', '=', "Payment Charge");
      $col4->select(
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
      $allpaycharge =  $col4->get();
    } catch (Exception $e) {
    }
    return response()->json([
      'status' => 200,
      // 'AllCustomerCharge' => $AllCustomerCharge,
      // 'AllProjectCharge' => $AllProjectCharge,
      // 'AllOfficeCharge' => $AllOfficeCharge,
      // 'customerCharges' => $customerCharges,
      // 'projectCharges' => $projectCharges,
      // 'officeCharges' => $officeCharges,
      'balance' => $balance,
      'allpaycharge' => $allpaycharge,
      'printdate' => $dateprint,

    ], 200);
  }
}
