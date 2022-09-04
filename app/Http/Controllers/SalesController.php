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
use App\Unit;
use App\Branch;
use App\Project;
use App\Customer;
use App\Delivery;
use App\Item_category;
use App\ReplacedItm;
use App\User;
use DB;


class SalesController extends Controller
{
  public function index(Request $request)
  {
    // Get user from $request token.
    if (!$user = auth()->setRequest($request)->user()) {
      return $this->responseUnauthorized();
      //   return response()->json([
      //     'status' => 401,
      //     'errors' => $errors,
      // ], 401);
    }

    try {

      // get branch
      $userdet =  User_detail::where('id', $user->user_details_id)->firstOrFail();
      $branchname =  Branch::where('id', $userdet->branch_id)->firstOrFail();


      // $collection1 = Item::select('items.*');
      // $collection1 = $collection1->latest()->paginate();
      $collection1 =  Item::join('brands', 'items.brand_id', '=', 'brands.id')
        ->join('item_categories', 'items.category_id', '=', 'item_categories.id')
        ->join('item_counts', 'items.id', '=', 'item_counts.item_id')
        ->where('item_counts.branch_id', '=', $userdet->branch_id)
        ->where('item_counts.balance', '>', 0)
        ->select('items.*', 'brands.name as brand', 'item_categories.name as category', 'item_counts.balance as balance')
        ->get();

      // $genItems =  Item::join('brands', 'items.brand_id', '=', 'brands.id')
      //   ->join('item_categories', 'items.category_id', '=', 'item_categories.id')
      //   ->join('item_counts', 'items.id', '=', 'item_counts.item_id')
      //   ->where('item_counts.branch_id', '=', $userdet->branch_id)
      //   ->select('items.*', 'brands.name as brand', 'item_categories.name as category', 'item_counts.balance as balance')
      //   ->get();

      // $itemList =  Item::join('brands', 'items.brand_id', '=', 'brands.id')
      //   ->join('item_categories', 'items.category_id', '=', 'item_categories.id')
      //   ->join('item_counts', 'items.id', '=', 'item_counts.item_id')
      //   ->where('item_counts.branch_id', '=', $userdet->branch_id)
      //   ->select('items.*', 'brands.name as brand', 'item_categories.name as category', 'item_counts.balance as balance')
      //   ->get();

      $categories = Item_category::select('item_categories.*')->get();
      $branches = Branch::select('branches.*')->get();
      // $project = Project::select('projects.*')->get();

      // $customer = Customer::join('user_details', 'customers.user_details_id', '=', 'user_details.id')
      //   ->select('customers.*', 'user_details.first_name as first_name', 'user_details.last_name as last_name')->get();

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



    return response()->json([
      'status' => 200,
      // 'genItems' => $genItems,
      'items' => $collection1,
      'userId' => $user->id,
      'hashuserId' => $user->hashid,
      'branch' => $userdet->branch_id,
      'categories' => $categories,
      'branches' => $branches,
      // 'project' => $project,
      // 'customer' => $customer,
      // 'AllCustomerCharge' => $AllCustomerCharge,
      // 'AllProjectCharge' => $AllProjectCharge,
      // 'AllOfficeCharge' => $AllOfficeCharge,
      // 'itemList' => $itemList,
      'cashier' => $userdet->first_name . " " . $userdet->last_name,
      'branchName' => $branchname->name,
      'cashFlow' => $userdet->enable_cashflow,
    ], 200);
  }
  public function searchitem(Request $request)
  {
    if (!$user = auth()->setRequest($request)->user()) {
      return $this->responseUnauthorized();
    }

    try {
      $userdet =  User_detail::where('id', $user->user_details_id)->firstOrFail();
      $collection1 =  Item::join('brands', 'items.brand_id', '=', 'brands.id')
        ->join('item_categories', 'items.category_id', '=', 'item_categories.id')
        ->join('item_counts', 'items.id', '=', 'item_counts.item_id')
        ->where('item_counts.branch_id', '=', $userdet->branch_id)
        ->where('item_counts.balance', '>', 0)
        ->select('items.*', 'brands.name as brand', 'item_categories.name as category', 'item_counts.balance as balance')
        ->get();
    } catch (Exception $e) {
    }

    return response()->json([
      'status' => 200,
      'result' => $AllOfficeCharge,

    ], 200);
  }
  public function getAllstocks(Request $request)
  {
    if (!$user = auth()->setRequest($request)->user()) {
      return $this->responseUnauthorized();
    }

    try {
      $userdet =  User_detail::where('id', $user->user_details_id)->firstOrFail();
      $genItems =  Item::join('brands', 'items.brand_id', '=', 'brands.id')
        ->join('item_categories', 'items.category_id', '=', 'item_categories.id')
        ->join('item_counts', 'items.id', '=', 'item_counts.item_id')
        ->where('item_counts.branch_id', '=', $userdet->branch_id)
        ->select('items.*', 'brands.name as brand', 'item_categories.name as category', 'item_counts.balance as balance')
        ->get();
    } catch (Exception $e) {
    }

    return response()->json([
      'status' => 200,
      'genItems' => $genItems,

    ], 200);
  }
  public function getAllcustomers(Request $request)
  {
    if (!$user = auth()->setRequest($request)->user()) {
      return $this->responseUnauthorized();
    }

    try {

      $customer = Customer::join('user_details', 'customers.user_details_id', '=', 'user_details.id')
        ->select('customers.*', 'user_details.first_name as first_name', 'user_details.last_name as last_name')->get();
    } catch (Exception $e) {
    }

    return response()->json([
      'status' => 200,
      'customer' => $customer,

    ], 200);
  }
  public function getAllprojects(Request $request)
  {
    if (!$user = auth()->setRequest($request)->user()) {
      return $this->responseUnauthorized();
    }

    try {

      $project = Project::select('projects.*')->get();
    } catch (Exception $e) {
    }

    return response()->json([
      'status' => 200,
      'project' => $project,

    ], 200);
  }
  public function getAllCustCharge(Request $request)
  {
    if (!$user = auth()->setRequest($request)->user()) {
      return $this->responseUnauthorized();
    }

    try {

      $AllCustomerCharge = Customer::join('user_details', 'customers.user_details_id', '=', 'user_details.id')
        ->where('customers.charge_balance', '>=', 1)
        ->select('customers.*', 'user_details.first_name as first_name', 'user_details.last_name as last_name')->get();
    } catch (Exception $e) {
    }

    return response()->json([
      'status' => 200,
      'AllCustomerCharge' => $AllCustomerCharge,

    ], 200);
  }
  public function getAllProjCharge(Request $request)
  {
    if (!$user = auth()->setRequest($request)->user()) {
      return $this->responseUnauthorized();
    }

    try {

      $AllProjectCharge = Project::where('projects.balance', '>=', 1)
        ->select('projects.*')
        ->get();
    } catch (Exception $e) {
    }

    return response()->json([
      'status' => 200,
      'AllProjectCharge' => $AllProjectCharge,

    ], 200);
  }
  public function getAllOffCharge(Request $request)
  {
    if (!$user = auth()->setRequest($request)->user()) {
      return $this->responseUnauthorized();
    }

    try {

      $AllOfficeCharge = Branch::where('branches.balance', '>=', 1)
        ->select('branches.*')
        ->get();
    } catch (Exception $e) {
    }

    return response()->json([
      'status' => 200,
      'AllOfficeCharge' => $AllOfficeCharge,

    ], 200);
  }
  public function getReceiptCode(Request $request)
  {
    if (!$user = auth()->setRequest($request)->user()) {
      return $this->responseUnauthorized();
    }

    try {
      $userdet =  User_detail::where('id', $user->user_details_id)->firstOrFail();

      $defcode = request('code');

      $transaction = Transaction::where('transactions.code', '=', request('code'))
        ->select('transactions.*')
        ->first();
      
      if(is_null($transaction)){
        $transaction = Transaction::where('transactions.ctrlno', '=', request('code'))
        ->select('transactions.*')
        ->first();
      }

      $defcode =  $transaction->code;

        if($transaction->branch_id != $userdet->branch_id){
          return response()->json([
            'status' => 402,
          ], 402);
        }
      

      $status = 200;
      if (is_null($transaction)) {
        $status = 100;
      }

      $items = [];
      if ($status == 200) {
        // $tran = Transaction::where('transactions.code', '=', request('code'))->firstOrFail();
        $tran = Transaction::where('transactions.code', '=', $defcode)->firstOrFail();

        $org_items =  Item::join('transaction_items', 'transaction_items.item_id', '=', 'items.id')
        ->join('transactions', 'transaction_items.transaction_id', '=', 'transactions.id')
        ->where('transaction_items.transaction_id', '=', $tran->id)
        ->select(
          'items.id as id',
          'transaction_items.id as trnItm_id',
          'transaction_items.unit_price',
          'transaction_items.quantity',
          'transactions.code'
        )->get();




        $items =  Item::join('transaction_items', 'transaction_items.item_id', '=', 'items.id')
          ->join('brands', 'items.brand_id', '=', 'brands.id')
          ->join('transactions', 'transaction_items.transaction_id', '=', 'transactions.id')
          ->where('transaction_items.transaction_id', '=', $tran->id)
          ->select(
            'brands.name as brand',
            'items.name as item',
            'items.id as id',
            'transaction_items.id as trnItm_id',
            'transaction_items.item_status',
            'transaction_items.unit_price',
            'transaction_items.quantity',
            'transaction_items.beg_balance',
            'transaction_items.end_balance',
            'transaction_items.beg_collectible',
            'transaction_items.end_collectible',
            'transactions.code'
          );
        // ->orderBy('transactions.created_at', 'DESC')
        // ->get();

        $reps =  Item::join('transaction_items', 'transaction_items.item_id', '=', 'items.id')
          ->join('transactions', 'transaction_items.transaction_id', '=', 'transactions.id')
          ->join('brands', 'items.brand_id', '=', 'brands.id')
          ->join('replaced_itms', 'transactions.code', '=', 'replaced_itms.replace_code')
          ->where('replaced_itms.sale_code', '=', $defcode)
          // ->where('replaced_itms.sale_code', '=', request('code'))
          ->select(
            'brands.name as brand',
            'items.name as item',
            'items.id as id',
            'transaction_items.id as trnItm_id',
            'transaction_items.item_status',
            'transaction_items.unit_price',
            'transaction_items.quantity',
            'transaction_items.beg_balance',
            'transaction_items.end_balance',
            'transaction_items.beg_collectible',
            'transaction_items.end_collectible',
            'transactions.code'
          )
          ->union($items);
        // ->orderBy('transactions.created_at', 'DESC')
        // ->get();

        $result = $reps;

        $col4 = DB::query()->fromSub($result, 'i_t')
          ->select(
            'i_t.brand',
            'i_t.item',
            'i_t.id',
            'i_t.trnItm_id',
            'i_t.item_status',
            'i_t.unit_price',
            DB::raw('SUM(i_t.quantity) as quantity'),
            'i_t.beg_balance',
            'i_t.end_balance',
            'i_t.beg_collectible',
            'i_t.end_collectible',
            'i_t.code'
          )
          ->groupBy('i_t.id')
          ->get();
      }

      // $transaction = $transaction->latest()->paginate();

      // get branch
      // $userdet =  User_detail::where('id', $user->user_details_id)->firstOrFail();


      // $col4 =  Transaction_item::join('transactions', 'transaction_items.transaction_id', '=', 'transactions.id')
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
      //     'transactions.accountability',
      //     'transactions.payable',
      //     'branches.name',
      //     DB::raw('COUNT(transaction_items.item_id) as total_items'),
      //     DB::raw('DATE(transactions.created_at) as date'),
      //     DB::raw('"plus icon" as icon')
      //   )
      //   ->groupBy('transaction_items.transaction_id')
      //   ->get();

      $returns =  Item::join('transaction_items', 'transaction_items.item_id', '=', 'items.id')
        ->join('transactions', 'transaction_items.transaction_id', '=', 'transactions.id')
        ->join('brands', 'items.brand_id', '=', 'brands.id')
        ->join('returned_itms', 'transactions.code', '=', 'returned_itms.return_code')
        ->where('returned_itms.sale_code', '=', $defcode)
        // ->where('returned_itms.sale_code', '=', request('code'))
        ->select(
          'brands.name as brand',
          'items.name as item',
          'items.id as id',
          'transaction_items.id as trnItm_id',
          'transaction_items.item_status',
          'transaction_items.unit_price',
          // 'transaction_items.quantity',
          'transaction_items.beg_balance',
          'transaction_items.end_balance',
          'transaction_items.beg_collectible',
          'transaction_items.end_collectible',
          'transactions.code',
          DB::raw('(SUM(transaction_items.quantity)) as quantity'),
        )
        ->groupBy('items.id')
        ->get();





      $transaction = Transaction::where('transactions.code', '=',$defcode)
        ->select('transactions.*')
        ->get(); 
        
      // $transaction = Transaction::where('transactions.code', '=', request('code'))
      //   ->select('transactions.*')
      //   ->get();

      // $replacement = ReplacedItm::join('returned_itms', 'replaced_itms.sale_code', '=', 'returned_itms.sale_code')
      // ->join('transactions', 'replaced_itms.replace_code', '=', 'transactions.code')
      // ->where('replaced_itms.sale_code', '=', request('code'))

      $replacement = Transaction::where('transactions.return_code', '=', request('return_code'));
      if ($transaction[0]->transaction_type == "Sale") {
        $replacement->where('transactions.transaction_type', '=', "Replacement");
      } else if ($transaction[0]->transaction_type == "Charge") {
        $replacement->where('transactions.transaction_type', '=', "Charge");
        // $replacement->orWhere('transactions.transaction_type', '=', "Charge");
      }
      $replacement->select(
        'transactions.code',
        'transactions.id'
      );

      $replacement = $replacement->first();

      $repid = null;

      if (!is_null($replacement)) {
        $repid = $replacement->id;
      }
    } catch (Exception $e) {
    }



    return response()->json([
      'status' => $status,
      'transaction' => $transaction,
      'items' => $col4,
      // 'items' => $result,
      'returns' => $returns,
      'repid' => $repid,
      'org_items' => $org_items,
      // 'items' => $items,

    ], 200);
  }

  public function getReplacements(Request $request)
  {
    if (!$user = auth()->setRequest($request)->user()) {
      return $this->responseUnauthorized();
    }

    try {



      $replacement = ReplacedItm::join('transaction', 'replace_itms.replace_code', '=', 'transaction.code')
        ->where('replace_itms.sale_code', '=', request('sale_code'))
        ->where('transaction.return_code', '=', request('sale_code'))
        ->get();







      $transaction = Transaction::where('transactions.code', '=', request('code'))
        ->select('transactions.*')
        ->get();
    } catch (Exception $e) {
    }



    return response()->json([

      'transaction' => $transaction,

      'returns' => $returns,
      // 'items' => $items,

    ], 200);
  }



  public function customer_charge(Request $request)
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
        ->where('transactions.transaction_type', '=', "Charge")
        ->where('transactions.accountability', '=', "Customer")
        // ->where('transactions.charge_status', '=', "unpaid")
        ->where('transactions.customer_id', '=', request('customer_id'))
        ->select(
          'transactions.id as t_id',
          'transaction_items.transaction_id as transId',
          'transactions.code',
          'transactions.requisition_id as transac_req',
          'transactions.date_transac',
          'transactions.accountability',
          'transactions.payable',
          'branches.name',
          DB::raw('COUNT(transaction_items.item_id) as total_items'),
          DB::raw('DATE(transactions.created_at) as date'),
          DB::raw('"plus icon" as icon')
        )
        ->groupBy('transaction_items.transaction_id')
        ->orderBy('transactions.created_at', 'DESC')
        ->get();

      $customer =  Customer::join('user_details', 'customers.user_details_id', '=', 'user_details.id')
        ->where('customers.id', request('customer_id'))
        ->select(
          'customers.*',
          'user_details.first_name',
          'user_details.last_name'

        )
        ->firstOrFail();

      $pc =  Transaction::join('branches', 'transactions.branch_id', '=', 'branches.id');
      $pc->where('transactions.customer_id', '=', request('customer_id'));
      $pc->where('transactions.accountability', '=', "Customer");
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
    } catch (Exception $e) {
    }



    return response()->json([
      'status' => 200,
      'transaction' => $col4,
      'balance' => $customer->charge_balance,
      'allpaycharge' => $allpaycharge,
      'name' => $customer->first_name . ' ' . $customer->last_name,


    ], 200);
  }
  public function project_charge(Request $request)
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
        ->where('transactions.transaction_type', '=', "Charge")
        ->where('transactions.accountability', '=', "Project")
        // ->where('transactions.charge_status', '=', "unpaid")
        ->where('transactions.project_id', '=', request('project_id'))
        ->select(
          'transactions.id as t_id',
          'transaction_items.transaction_id as transId',
          'transactions.code',
          'transactions.requisition_id as transac_req',
          'transactions.date_transac',
          'transactions.accountability',
          'transactions.payable',
          'branches.name',
          DB::raw('COUNT(transaction_items.item_id) as total_items'),
          DB::raw('DATE(transactions.created_at) as date'),
          DB::raw('"plus icon" as icon')
        )
        ->groupBy('transaction_items.transaction_id')
        ->orderBy('transactions.created_at', 'DESC')
        ->get();

      $project =  Project::where('id', request('project_id'))->firstOrFail();
      $pc =  Transaction::join('branches', 'transactions.branch_id', '=', 'branches.id');
      $pc->where('transactions.project_id', '=', request('project_id'));
      $pc->where('transactions.accountability', '=', "Project");
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
    } catch (Exception $e) {
    }



    return response()->json([
      'status' => 200,
      'transaction' => $col4,
      'balance' => $project->balance,
      'allpaycharge' => $allpaycharge,

    ], 200);
  }

  public function office_charge(Request $request)
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
        ->where('transactions.transaction_type', '=', "Charge")
        ->where('transactions.accountability', '=', "Maintenance")
        // ->where('transactions.charge_status', '=', "unpaid")
        ->where('transactions.office_id', '=', request('office_id'))
        ->select(
          'transactions.id as t_id',
          'transaction_items.transaction_id as transId',
          'transactions.code',
          'transactions.requisition_id as transac_req',
          'transactions.date_transac',
          'transactions.accountability',
          'transactions.payable',
          'branches.name',
          DB::raw('COUNT(transaction_items.item_id) as total_items'),
          DB::raw('DATE(transactions.created_at) as date'),
          DB::raw('"plus icon" as icon')
        )
        ->groupBy('transaction_items.transaction_id')
        ->orderBy('transactions.created_at', 'DESC')
        ->get();

      $office =  Branch::where('id', request('office_id'))->firstOrFail();

      $pc =  Transaction::join('branches', 'transactions.branch_id', '=', 'branches.id');
      $pc->where('transactions.office_id', '=', request('office_id'));
      $pc->where('transactions.accountability', '=', "Maintenance");
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
    } catch (Exception $e) {
    }



    return response()->json([
      'status' => 200,
      'transaction' => $col4,
      'balance' => $office->balance,
      'allpaycharge' => $allpaycharge,

    ], 200);
  }

  public function store(Request $request)
  {
    // if (! $user = auth()->setRequest($request)->user()) {
    //     return $this->responseUnauthorized();
    // }
    $user =  User::where('id', request('uId'))->firstOrFail();

    try {
      $discount = null;
      if (request('discount')) {
        $discount = request('discount');
      } //if there is discount

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

      $userdet =  User_detail::where('id', $user->user_details_id)->firstOrFail();  // get branch

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
        'date_printed' => request('date_printed'),
        'date_transac' =>  request('date_transac'),
        'payable' =>  request('payable'),

      ]);

      // Output 
      $transactions = Transaction::select('transactions.*')->get();
      $delivery = Delivery::select('deliveries.*')->get();
    } catch (Exception $e) {
    }

    return response()->json([
      'status' => 200,
      'transactions' => $transactions,
      'delivery' => $delivery,

    ], 200);
  }
  public function refreshStock(Request $request)
  {
    if (!$user = auth()->setRequest($request)->user()) {
      return $this->responseUnauthorized();
    }

    try {
      $userdet =  User_detail::where('id', $user->user_details_id)->firstOrFail();  // get branch

      $itemList =  Item::join('brands', 'items.brand_id', '=', 'brands.id')
        ->join('item_categories', 'items.category_id', '=', 'item_categories.id')
        ->join('item_counts', 'items.id', '=', 'item_counts.item_id')
        ->where('item_counts.branch_id', '=', $userdet->branch_id)
        ->select('items.*', 'brands.name as brand', 'item_categories.name as category', 'item_counts.balance as balance')
        ->get();
    } catch (Exception $e) {
    }



    return response()->json([
      'status' => 200,
      'allitems' => $itemList,

    ], 200);
  }

 
}
