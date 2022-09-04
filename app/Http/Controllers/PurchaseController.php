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
use App\Supplier;
use App\Brand;
use App\Project;
use App\Item_category;
use DB;

class Branchref
{
    public $brnch;
    public $code;
}
class PurchaseController extends Controller
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
                ->where('requisition_items.status', '=',  null)
                ->select('requisition_items.*', 'items.original_price as original_price', 'items.name as item', 'items.size as item_size', 'items.unit as item_unit')
                ->get();

            $reqnewitems = Requisition_item::where('requisition_items.requisition_id', '=',  $req->id)
                ->where('requisition_items.status', '=',  null)
                ->where('requisition_items.item_id', '=', null)
                ->select('requisition_items.*')
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
                ->select('requisitions.*', 'branches.name as branch', 'branches.id as reqto_id', 'requisitions.branch_id as branch_requester')
                ->get();

            $supplier = Supplier::select('suppliers.id', 'suppliers.name')->get();

            $Brand = Brand::select('brands.id', 'brands.name')->get();

            $Item_category = Item_category::select('item_categories.id', 'item_categories.name')->get();

            $units = Unit::select('units.*')->get();
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
            'reqnewitems' => $reqnewitems,
            'requests' => $col4,
            'type' => $req->type,
            'status' => $req->request_status,
            'reqTo' => $reqTo,
            'branch_id' => $userdet->branch_id,
            'supplier' => $supplier,
            'Brand' => $Brand,
            'Item_category' => $Item_category,
            'units' => $units,

        ], 200);
    }
    public function noreqIndex(Request $request)
    {
        // Get user from $request token.
        if (!$user = auth()->setRequest($request)->user()) {
            return $this->responseUnauthorized();
        }

        try {



            $collection1 =  Item::join('brands', 'items.brand_id', '=', 'brands.id')
                ->join('item_categories', 'items.category_id', '=', 'item_categories.id')
                ->whereNull('items.isDisabled')
                ->select('items.*', 'brands.name as brand', 'item_categories.name as category')
                ->get();

            $supplier = Supplier::select('suppliers.id', 'suppliers.name')->get();
            $itemcat = Item_category::select('item_categories.*')->get();
            $brand = Brand::select('brands.*')->get();
            $unit = Unit::select('units.*')->get();
        } catch (Exception $e) {
        }

        return response()->json([
            'status' => 200,
            'items' => $collection1,
            'supplier' => $supplier,
            'itemcat' => $itemcat,
            'brand' => $brand,
            'unit' => $unit,
            'hashuserId' => $user->hashid,

        ], 200);
    }

    public function noreqnewInsert(Request $request)
    {
        // Get user from $request token.
        if (!$user = auth()->setRequest($request)->user()) {
            return $this->responseUnauthorized();
        }

        try {




            $userdet =  User_detail::where('id', $user->user_details_id)->firstOrFail();  // get branch
            // transaction code
            $year = date("y");
            $year = substr($year, -2);
            $month = date("m");
            $day = date("d");
            $code = "TR" . $user->user_details_id . $year . $day . $month . rand(100, 9999) . "RC";
            $codeTr = $code;
            $itmObj = json_decode(request('items'), true); //new
            $payable = 0;
            foreach ($itmObj as $itm) {
                $payable += $itm["total"];
            }

            $new = Transaction::create([
                'transaction_type' => "Receiving",
                'user_id' => $user->id,
                'branch_id' => $userdet->branch_id,
                'code' => $code,
                'date_transac' => request('date_transac'),
                'payable' => $payable, //new
            ]);


            $overtotal = 0; //new
            foreach ($itmObj as $itm) {
                // get original item
                // $orgItem = Item::where('id', $itm["item_id"])->firstOrFail();
                $year = date("y");
                $year = substr($year, -2);
                $month = date("m");
                $day = date("d");
                $code = "IT" . $itm["category_id"] . $itm["brand_id"] . $day . $month . rand(100, 999);

                $orgItem = Item::create([
                    'name' => $itm["new_name"],
                    'brand_id' => $itm["brand_id"],
                    'size' => $itm["new_size"],
                    'category_id' => $itm["category_id"],
                    'original_price' => $itm["original_price"],
                    'unit' => $itm["unit"],
                    'code' => $code,
                ]);

                $branch = Branch::select('branches.*')
                    ->get();

                foreach ($branch as $br) {
                    Item_count::create([
                        'item_id' => $orgItem->id,
                        'balance' => 0,
                        'collectible_amount' => 0,
                        'threshold' => 0,
                        'branch_id' => $br->id,
                    ]);
                }

                $newItem = Item::where('id', $orgItem->id)->firstOrFail();
                // set the beginning balance
                $begBal = Item_count::where('item_id', $newItem->id)
                    ->where('branch_id', $userdet->branch_id)
                    ->firstOrFail();



                // update  branch's item count
                $update = Item_count::where('item_id', $newItem->id)
                    ->where('branch_id', $userdet->branch_id)
                    ->firstOrFail();
                $update->balance += $itm["quantity"];
                $update->save();

                // updated collectible requested branch
                $itcount = Item_count::where('item_id', $newItem->id)
                    ->where('branch_id',  $userdet->branch_id)
                    ->get();

                $newCollect = $itcount[0]->balance * $newItem->unit_price;
                $NewCount = Item_count::where('item_id', $newItem->id)->where('branch_id', $userdet->branch_id)->firstOrFail();
                $NewCount->collectible_amount = $newCollect;
                $NewCount->save();

                // for payment to supplier
                $charge_status = null;
                if ($itm["for_payment"] == "yes") {
                    $supplier =  Supplier::where('id', $itm["supplier_id"])->firstOrFail();  // get project

                    $supplier->balance +=  $itm["total"];
                    $end_charge_bal = $supplier->balance; //new
                    $supplier->save();
                    $overtotal += $itm["total"]; //new
                    $charge_status = "Unpaid";

                    $codeCredit = "CRD" . $itm["supplier_id"] . $year . $day . $month . rand(100, 9999) . "PR"; //new
                    $creditTransac = Transaction::where('charge_transaction_code', '=', $code)->first(); //new
                    if (is_null($creditTransac)) { //new
                        $newCredit = Transaction::create([
                            'transaction_type' => "Credit",
                            'user_id' => $user->id,
                            'branch_id' => $userdet->branch_id,
                            'code' => $codeCredit,
                            'date_transac' => request('date_transac'),
                            'supplier_id' => $itm["supplier_id"],
                            'beg_charge_bal' => $end_charge_bal - $overtotal,
                            'end_charge_bal' => $end_charge_bal,
                            'charge_transaction_code' => $codeTr,
                            'charge_status' =>  $charge_status,
                            'payable' => $payable,

                        ]);
                    } else {
                        $creditTransac->beg_charge_bal = $end_charge_bal - $overtotal;
                        $creditTransac->end_charge_bal = $end_charge_bal;
                        $creditTransac->save();
                    }
                }

                Transaction_item::create([
                    'item_status' => "Received",
                    'unit_price' => $newItem->unit_price,
                    'beg_balance' => $begBal->balance,
                    'end_balance' => $begBal->balance + $itm["quantity"],
                    'original_price' => $newItem->original_price,
                    'quantity' => $itm["quantity"],
                    'transaction_id' => $new->id,
                    'supplier_id' => $itm["supplier_id"],
                    'beg_collectible' => $begBal->collectible_amount,
                    'end_collectible' => $newCollect,
                    'item_id' => $newItem->id,
                    'charge_status' => $charge_status,
                ]);
            }

            $transactionItems = Transaction_item::select('transaction_items.*')->get();
        } catch (Exception $e) {
        }

        return response()->json([
            'status' => 200,
            'items' => $transactionItems,
            // 'supplier' => $supplier,

        ], 200);
    }
    public function noreqInsert(Request $request)
    {
        // Get user from $request token.
        if (!$user = auth()->setRequest($request)->user()) {
            return $this->responseUnauthorized();
        }

        try {




            $userdet =  User_detail::where('id', $user->user_details_id)->firstOrFail();  // get branch
            // transaction code
            $year = date("y");
            $year = substr($year, -2);
            $month = date("m");
            $day = date("d");
            $code = "TR" . $user->user_details_id . $year . $day . $month . rand(100, 9999) . "RC";

            $itmObj = json_decode(request('items'), true);
            $payable = 0;
            foreach ($itmObj as $itm) {
                $payable += $itm["total"];
            }

            $branch =  Branch::where('id', $userdet->branch_id)->firstOrFail();  // get project


            $new = Transaction::create([
                'transaction_type' => "Receiving",
                'accountability' => "Admin",
                'customer_name' => $branch->name,
                'user_id' => $user->id,
                'branch_id' => $userdet->branch_id,
                'code' => $code,
                'date_transac' => request('date_transac'),
                'payable' => $payable, //new


            ]);


            $overtotal = 0; //new
            foreach ($itmObj as $itm) {
                // get original item
                // $supplierBegBal =  Supplier::where('id', $itm["sup_id"])->firstOrFail();  // get beg_bal
                // $supBegBal = $supplierBegBal->balance;
                // $overtotal = $supplierBegBal->balance;

                $orgItem = Item::where('id', $itm["item_id"])->firstOrFail();

                // set the beginning balance
                $begBal = Item_count::where('item_id', $itm["item_id"])
                    ->where('branch_id', $userdet->branch_id)
                    ->firstOrFail();

                $org_price = $itm["original_price"];
                if ($itm["priceOption"] == "pertain") {
                    $org_price = $orgItem->original_price;
                } else if ($itm["priceOption"] == "replace") {
                    $oldOrgPrice = $orgItem->original_price;
                    $orgItem->original_price = $itm["original_price"];
                    $orgItem->save();

                    $this->replaceOrgPrice($user->id, $itm["item_id"], $oldOrgPrice);
                }

                // update  branch's item count
                $update = Item_count::where('item_id', $itm["item_id"])
                    ->where('branch_id', $userdet->branch_id)
                    ->firstOrFail();
                $update->balance += $itm["quantity"];

                $update->save();

                // updated collectible requested branch
                $itcount = Item_count::where('item_id', $itm["item_id"])
                    ->where('branch_id',  $userdet->branch_id)
                    ->get();

                $newCollect = $itcount[0]->balance * $orgItem->unit_price;
                $NewCount = Item_count::where('item_id', $itm["item_id"])->where('branch_id', $userdet->branch_id)->firstOrFail();
                $NewCount->collectible_amount = $newCollect;
                $NewCount->save();

                // for payment to supplier
                $charge_status = null;
                if ($itm["for_payment"] == "yes") {
                    $supplier =  Supplier::where('id', $itm["sup_id"])->firstOrFail();  // get project

                    //  $beg_charge_bal = $supplier->balance;
                    // $supbegBal = $supplier->balance;
                    $supplier->balance +=  $itm["total"];

                    $end_charge_bal = $supplier->balance; //new

                    // $supbegBal -= $itm["total"];
                    $supplier->save();
                    $overtotal += $itm["total"]; //new

                    $charge_status = "Unpaid";

                    $codeCredit = "CRD" . $itm["sup_id"] . $year . $day . $month . rand(100, 9999) . "PR"; //new
                    $creditTransac = Transaction::where('charge_transaction_code', '=', $code)->first(); //new
                    if (is_null($creditTransac)) { //new
                        $newCredit = Transaction::create([
                            'transaction_type' => "Credit",
                            'accountability' => "Supplier",
                            'customer_name' => $supplier->name,
                            'user_id' => $user->id,
                            'branch_id' => $userdet->branch_id,
                            'code' => $codeCredit,
                            'date_transac' => request('date_transac'),
                            'supplier_id' => $itm["sup_id"],
                            'beg_charge_bal' => $end_charge_bal - $overtotal,
                            'end_charge_bal' => $end_charge_bal,
                            'charge_transaction_code' => $code,
                            'charge_status' =>  $charge_status,
                            'payable' => $payable,

                        ]);
                    } else {
                        $creditTransac->beg_charge_bal = $end_charge_bal - $overtotal;
                        $creditTransac->end_charge_bal = $end_charge_bal;
                        $creditTransac->save();
                    }
                }

                Transaction_item::create([
                    'item_status' => "Received",
                    'unit_price' => $orgItem->unit_price,
                    'beg_balance' => $begBal->balance,
                    'end_balance' => $begBal->balance + $itm["quantity"],
                    'original_price' => $org_price,
                    'quantity' => $itm["quantity"],
                    'transaction_id' => $new->id,
                    'supplier_id' => $itm["sup_id"],
                    'beg_collectible' => $begBal->collectible_amount,
                    'end_collectible' => $newCollect,
                    'item_id' => $itm["item_id"],
                    'charge_status' => $charge_status,
                ]);
            }


            $transactionItems = Transaction_item::select('transaction_items.*')->get();
        } catch (Exception $e) {
        }

        return response()->json([
            'status' => 200,
            'items' => $transactionItems,
            // 'supplier' => $supplier,

        ], 200);
    }

    function replaceOrgPrice($user_id, $id, $oldOrgPrice)
    {
        $updateditem = Item::where('id', $id)->firstOrFail();
        $branch = Branch::select('branches.*')->get();
        foreach ($branch as $b) {
            $count = Item_count::where('item_id', $id)
                ->where('branch_id', $b['id'])
                ->get();
            // $count[0]->collectible_amount += $count[0]->balance * $updateditem->unit_price;
            $oldcol = $count[0]->collectible_amount;
            // $newCollect = $count[0]->collectible_amount + ($count[0]->balance * $updateditem->unit_price);
            $newCollect = $count[0]->balance * $updateditem->unit_price;

            // $NewCount = Item_count::where('item_id', $id)->where('branch_id', $b['id'])->firstOrFail();
            // $NewCount->collectible_amount = $newCollect;
            // $NewCount->save();
            // generate code

            $day = date("d");

            $random = rand(1111111111, 9999999999);
            if (strlen($day) == 1) {
                $day = "0" . $day;
            }
            $code = "UPS" . $random . $day;


            // check if the id exist
            $oldcode =  Transaction::where('code', $code)->first();
            if ($oldcode) {
                if (strlen($day) == 1) {
                    $day = "0" . $day;
                }
                $random = rand(1111111111, 9999999999);
                $code = "UPS" . $random . $day;
            }
            // generate code

            $new = Transaction::create([
                'transaction_type' => "Update",
                'user_id' => $user_id,
                'branch_id' => $b['id'],
                'code' => $code,
                'date_transac' => date('Y-m-d'),
                'customer_name' => $updateditem->name,
                'accountability' => "Admin",
                'description' => "Original Price",


            ]);
            Transaction_item::create([
                'item_status' => "Update",
                'unit_price' => $updateditem->unit_price,
                'beg_balance' => $count[0]->balance,
                'end_balance' => $count[0]->balance,
                'original_price' => $updateditem->original_price,
                'old_original_price' => $oldOrgPrice,
                'transaction_id' => $new->id,
                'beg_collectible' => $oldcol,
                'end_collectible' => $newCollect,
                'item_id' => $count[0]->item_id,

            ]);
        }
    }

    public function updateItem(Request $request)
    {
        // Get user from $request token.
        if (!$user = auth()->setRequest($request)->user()) {
            return $this->responseUnauthorized();
        }


        try {
            // update request item status
            $item = Requisition_item::where('id', request('id'))->firstOrFail();
            $item->status = 'Received';
            $item->save();

            // update request status
            $req = Requisition::where('code', request('code'))->firstOrFail();
            $req->request_status = 'Partially Received';
            $req->save();

            // get branch
            $userdet =  User_detail::where('id', $user->user_details_id)->firstOrFail();
            $item = Requisition_item::where('id', request('id'))->firstOrFail();
            // get original item
            $orgItem = Item::where('id', $item->item_id)->firstOrFail();

            // Replace original item price
            $org_price = null;
            if (request('priceOption') == "no") { //setting price from iput
                $orgItem->original_price = request('unit_price');
                $orgItem->save();
                $org_price = request('unit_price');
            } else {
                $orgItem = Item::where('id', $item->item_id)->firstOrFail();
                $org_price = $orgItem->original_price;
            }


            // set the beginning balance
            $begBal = Item_count::where('item_id', $item->item_id)
                ->where('branch_id', $userdet->branch_id)
                ->firstOrFail();

            // update item count
            $count = Item_count::where('item_id', $item->item_id)
                ->where('branch_id', $userdet->branch_id)
                ->firstOrFail();
            $count->balance += request('quantity');
            $count->collectible_amount += request('quantity') *  $orgItem->unit_price;
            $count->save();

            // transaction code
            $year = date("y");
            $year = substr($year, -2);
            $month = date("m");
            $day = date("d");
            $code = "TR" . $user->user_details_id . $year . $day . $month . rand(100, 9999) . "RC";


            // Record Transaction
            // $transaction = Transaction::where('requisition_id', $req->id)->firstOrFail();
            $transaction = Transaction::where('requisition_id', '=', $req->id)->first();


            // updated collectible  branch
            $itcount = Item_count::where('item_id', $item->item_id)
                ->where('branch_id',  $userdet->branch_id)
                ->get();

            $newCollect = $itcount[0]->balance * $orgItem->unit_price;
            $NewCount = Item_count::where('item_id', $item->item_id)->where('branch_id', $userdet->branch_id)->firstOrFail();
            $NewCount->collectible_amount = $newCollect;
            $NewCount->save();

            // for payment to supplier
            // $payable = 0;//new
            $payable =  $org_price * request('quantity'); //new
            $charge_status = null;
            if (request('for_payment') == "yes") {
                $supplier =  Supplier::where('id',  request('supplier_id'))->firstOrFail();  // get project
                $beg_charge_bal = $supplier->balance; //new
                $supplier->balance +=  $org_price * request('quantity');
                $end_charge_bal = $supplier->balance; //new
                $supplier->save();




                $charge_status = "Unpaid";
            }
            // $creditTransac = Transaction::where('charge_transaction_code', '=', $code)->first(); //new
            $creditTransac = Transaction::where('requisition_id', '=', $req->id)->first(); //new
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
                    'payable' => $payable, //new.
                ]);

                Transaction_item::create([
                    'item_status' => "Received",
                    'beg_balance' => $begBal->balance,
                    'end_balance' => $begBal->balance + request('quantity'),
                    'original_price' => $org_price,
                    'unit_price' => $orgItem->unit_price,
                    'quantity' => request('quantity'),
                    'supplier_id' => request('supplier_id'),
                    'beg_collectible' => $begBal->collectible_amount,
                    'end_collectible' => $newCollect,
                    'transaction_id' => $new->id,
                    'item_id' => $orgItem->id,
                    'charge_status' => $charge_status,
                ]);

                if (request('for_payment') == "yes") {
                    $codeCredit = "CRD" . request('supplier_id') . $year . $day . $month . rand(100, 9999) . "PR"; //new
                    $supplier =  Supplier::where('id',  request('supplier_id'))->firstOrFail();  // get sup
                    if (is_null($creditTransac)) { //new
                        $newCredit = Transaction::create([
                            'transaction_type' => "Credit",
                            'accountability' => "Supplier",
                            'customer_name' => $supplier->name,
                            'user_id' => $user->id,
                            'branch_id' => $userdet->branch_id,
                            'code' => $codeCredit,
                            'date_transac' => date('Y-m-d'),
                            'supplier_id' => request('supplier_id'),
                            'beg_charge_bal' => $beg_charge_bal,
                            'end_charge_bal' => $end_charge_bal,
                            'charge_transaction_code' => $code,
                            'charge_status' =>  $charge_status,
                            'payable' => $payable,
                            'requisition_id' => $req->id,

                        ]);
                    }
                }
            } else {
                // update credit transaction
                // $creditTransac = Transaction::where('transaction_type', '=', "Credit")
                //     ->where('requisition_id', '=', $req->id)->first(); //new

                $creditTransac = Transaction::where('transaction_type', '=', "Credit")
                    ->where('requisition_id', '=', $req->id)
                    ->where('supplier_id', '=', request('supplier_id'))->first(); //new

                if (request('for_payment') == "yes") {
                    $codeCredit = "CRD" . request('supplier_id') . $year . $day . $month . rand(100, 9999) . "PR"; //new
                    $supplier =  Supplier::where('id',  request('supplier_id'))->firstOrFail();  // get sup
                    if (is_null($creditTransac)) { //new
                        $newCredit = Transaction::create([
                            'transaction_type' => "Credit",
                            'accountability' => "Supplier",
                            'customer_name' => $supplier->name,
                            'user_id' => $user->id,
                            'branch_id' => $userdet->branch_id,
                            'code' => $codeCredit,
                            'date_transac' => date('Y-m-d'),
                            'supplier_id' => request('supplier_id'),
                            'beg_charge_bal' => $beg_charge_bal,
                            'end_charge_bal' => $end_charge_bal,
                            'charge_transaction_code' => $code,
                            'charge_status' =>  $charge_status,
                            'payable' => $payable,
                            'requisition_id' => $req->id,

                        ]);
                    } else {
                        $creditTransac = Transaction::where('id', '=', $creditTransac->id)->first(); //new
                        $creditTransac->payable += $payable;
                        $creditTransac->end_charge_bal = $end_charge_bal;
                        $creditTransac->save();
                    }

                    // if (is_null($creditTransac)) { //new
                    //     $newCredit = Transaction::create([
                    //         'transaction_type' => "Credit",
                    //         'user_id' => $user->id,
                    //         'branch_id' => $userdet->branch_id,
                    //         'code' => $codeCredit,
                    //         'date_transac' => date('Y-m-d'),
                    //         'supplier_id' => request('supplier_id'),
                    //         'beg_charge_bal' => $beg_charge_bal,
                    //         'end_charge_bal' => $end_charge_bal,
                    //         'charge_transaction_code' => $code,
                    //         'charge_status' =>  $charge_status,
                    //         'payable' => $payable,
                    //         'requisition_id' => $req->id,

                    //     ]);
                    // } else {
                    //     $creditTransac = Transaction::where('id', '=', $creditTransac->id)->first(); //new
                    //     $creditTransac->payable += $payable;
                    //     $creditTransac->end_charge_bal = $end_charge_bal;
                    //     $creditTransac->save();
                    // }


                }



                // update receiving transaction
                $transaction->payable += $payable;
                $transaction->save();

                Transaction_item::create([
                    'item_status' => "Received",
                    'beg_balance' => $begBal->balance,
                    'end_balance' => $begBal->balance + request('quantity'),
                    'original_price' => $org_price,
                    'unit_price' => $orgItem->unit_price,
                    'quantity' => request('quantity'),
                    'supplier_id' => request('supplier_id'),
                    'beg_collectible' => $begBal->collectible_amount,
                    'end_collectible' => $newCollect,
                    'transaction_id' => $transaction->id,
                    'item_id' => $orgItem->id,
                    'charge_status' => $charge_status,
                ]);
            }

            // Setting requisition to completed
            $stat = Requisition_item::where('status', '=', null)
                ->where('requisition_id', '=', $req->id)
                ->first();

            if (is_null($stat)) {
                $req = Requisition::where('code', request('code'))->firstOrFail();
                $req->request_status = 'Completed';
                $req->save();
            }

            //  // updated collectible based on new unit price
            //  $itcount = Item_count::where('item_id', $item->item_id)
            //  ->where('branch_id', $userdet->branch_id)
            //  ->get();

            // //  $newCollect = $itcount[0]->collectible_amount + ( $itcount[0]->balance * $orgItem->unit_price);
            //  $newCollect = $itcount[0]->balance * $orgItem->unit_price;
            //  $NewCount = Item_count::where('item_id', $item->item_id)->where('branch_id', $userdet->branch_id)->firstOrFail();
            //  $NewCount->collectible_amount = $newCollect;
            //  $NewCount->save();


            // output
            $req = Requisition::where('code', request('code'))->firstOrFail();

            $reqitems = Requisition_item::join('items', 'requisition_items.item_id', '=', 'items.id')
                ->where('requisition_items.requisition_id', '=',  $req->id)
                ->where('requisition_items.status', '=',  null)
                ->select('requisition_items.*', 'items.original_price as original_price', 'items.name as item', 'items.size as item_size', 'items.unit as item_unit')
                ->get();

            // $supplier = Supplier::select('suppliers.id', 'suppliers.name')->get();

            return response()->json([
                'status' => 200,
                'message' => 'Update successful',
                'updated' => $reqitems
            ], 200);
        } catch (Exception $e) {
            return $this->responseServerError('Error updating resource.');
        }
    }
    public function updateItemNew(Request $request)
    {
        // Get user from $request token.
        if (!$user = auth()->setRequest($request)->user()) {
            return $this->responseUnauthorized();
        }


        try {

            $itemNewName = request('new_name');
            if (request('nameOption') == "pertain") {
                $reqItemName = Requisition_item::where('id', request('id'))->firstOrFail();
                $itemNewName = $reqItemName->new_item;
            }

            $itemNewSize = request('new_size');
            if (request('new_size') == "pertain") {
                $rt = Requisition_item::where('id', request('id'))->firstOrFail();
                $itemNewSize = $rt->size;
            }

            $itemNewUnit = request('unit');
            if (request('unit') == "pertain") {
                $rt = Requisition_item::where('id', request('id'))->firstOrFail();
                $itemNewUnit = $rt->unit;
            }


            // $year = date("y");
            // $year = substr($year, -2);
            // $month = date("m");
            // $day = date("d");
            // generate code
            $year = date("y");
            $year = substr($year, -2);
            $month = date("m");
            $day = date("d");

            $random = rand(1111111111, 9999999999);
            if (strlen($day) == 1) {
                $day = "0" . $day;
            }
            $code = "ITM" . $random . $day;
            $oldcode =  Item::where('code', $code)->first();
            if ($oldcode) {
                if (strlen($day) == 1) {
                    $day = "0" . $day;
                }
                $random = rand(1111111111, 9999999999);
                $code = "ITM" . $random . $day;
            }

            // $code = "IT" . request('category_id') . request('brand_id') . $day . $month . rand(100, 999);

            $newitem = Item::create([
                'name' => $itemNewName,
                'brand_id' => request('brand_id'),
                'size' => $itemNewSize,
                'category_id' => request('category_id'),
                'original_price' => request('new_unit_price'),
                'unit' => $itemNewUnit,
                'code' => $code,
            ]);

            $branch = Branch::select('branches.*')
                ->get();

            foreach ($branch as $br) {
                Item_count::create([
                    'item_id' => $newitem->id,
                    'balance' => 0,
                    'collectible_amount' => 0,
                    'threshold' => 0,
                    'branch_id' => $br->id,
                ]);
            }

            // update request item status
            $item = Requisition_item::where('id', request('id'))->firstOrFail();
            $item->status = 'Received';
            $item->save();

            // update request status
            $req = Requisition::where('code', request('code'))->firstOrFail();
            $req->request_status = 'Partially Received';
            $req->save();

            // get branch
            $userdet =  User_detail::where('id', $user->user_details_id)->firstOrFail();

            // get original item
            $orgItem = Item::where('id', $newitem->id)->firstOrFail();

            // Replace original item price



            // set the beginning balance
            $begBal = Item_count::where('item_id', $newitem->id)
                ->where('branch_id', $userdet->branch_id)
                ->firstOrFail();


            // update item count
            $count = Item_count::where('item_id', $newitem->id)
                ->where('branch_id', $userdet->branch_id)
                ->firstOrFail();
            $count->balance += request('new_quantity');
            $count->collectible_amount += request('new_quantity') *  $newitem->unit_price;
            $count->save();

            // $count = Item_count::where('item_id', $newitem->id)
            // ->where('branch_id', $userdet->branch_id)
            // ->firstOrFail();
            // $count->balance += request('new_quantity');
            // $count->collectible_amount += request('new_quantity') * request('new_unit_price');
            // $count->save();

            // transaction code
            $year = date("y");
            $year = substr($year, -2);
            $month = date("m");
            $day = date("d");
            $code = "TR" . $user->user_details_id . $year . $day . $month . rand(100, 9999) . "RC";


            // Record Transaction
            // $transaction = Transaction::where('requisition_id', $req->id)->firstOrFail();
            $transaction = Transaction::where('requisition_id', '=', $req->id)->first();
            // updated collectible  branch
            $itcount = Item_count::where('item_id', $newitem->id)
                ->where('branch_id',  $userdet->branch_id)
                ->get();

            $newCollect = $itcount[0]->balance * $orgItem->unit_price;
            $NewCount = Item_count::where('item_id', $newitem->id)->where('branch_id', $userdet->branch_id)->firstOrFail();
            $NewCount->collectible_amount = $newCollect;
            $NewCount->save();


            // for payment to supplier
            $payable =   request('new_unit_price') * request('new_quantity'); //new
            $charge_status = null;
            if (request('for_payment') == "yes") {
                $supplier =  Supplier::where('id',  request('sup'))->firstOrFail();  // get project
                $beg_charge_bal = $supplier->balance; //new
                $supplier->balance +=  request('new_unit_price') * request('new_quantity');
                $end_charge_bal = $supplier->balance; //new
                $supplier->save();

                $charge_status = "Unpaid";
            }

            $creditTransac = Transaction::where('requisition_id', '=', $req->id)->first(); //new
            if (is_null($transaction)) {
                // here
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
                    'payable' => $payable, //new.
                ]);

                Transaction_item::create([
                    'item_status' => "Received",
                    'beg_balance' => $begBal->balance,
                    'end_balance' => $begBal->balance + request('new_quantity'),
                    'original_price' => request('new_unit_price'),
                    'unit_price' => $orgItem->unit_price,
                    'quantity' => request('new_quantity'),
                    'supplier_id' => request('sup'),
                    'beg_collectible' => $begBal->collectible_amount,
                    'end_collectible' => $newCollect,
                    'transaction_id' => $new->id,
                    'item_id' => $newitem->id,
                    'charge_status' => $charge_status,
                ]);

                if (request('for_payment') == "yes") {
                    $codeCredit = "CRD" . request('sup') . $year . $day . $month . rand(100, 9999) . "PR"; //new

                    if (is_null($creditTransac)) { //new
                        $supplier =  Supplier::where('id',  request('sup'))->firstOrFail();  // get sup
                        $newCredit = Transaction::create([
                            'transaction_type' => "Credit",
                            'accountability' => "Supplier",
                            'customer_name' => $supplier->name,
                            'user_id' => $user->id,
                            'branch_id' => $userdet->branch_id,
                            'code' => $codeCredit,
                            'date_transac' => date('Y-m-d'),
                            'supplier_id' => request('sup'),
                            'beg_charge_bal' => $beg_charge_bal,
                            'end_charge_bal' => $end_charge_bal,
                            'charge_transaction_code' => $code,
                            'charge_status' =>  $charge_status,
                            'payable' => $payable,
                            'requisition_id' => $req->id,

                        ]);
                    }
                }
            } else {

                $creditTransac = Transaction::where('transaction_type', '=', "Credit")
                    ->where('requisition_id', '=', $req->id)
                    ->where('supplier_id', '=', request('sup'))->first(); //new

                if (request('for_payment') == "yes") {
                    $codeCredit = "CRD" . request('sup') . $year . $day . $month . rand(100, 9999) . "PR"; //new

                    if (is_null($creditTransac)) { //new
                        $supplier =  Supplier::where('id',  request('sup'))->firstOrFail();  // get sup
                        $newCredit = Transaction::create([
                            'transaction_type' => "Credit",
                            'accountability' => "Supplier",
                            'customer_name' => $supplier->name,
                            'user_id' => $user->id,
                            'branch_id' => $userdet->branch_id,
                            'code' => $codeCredit,
                            'date_transac' => date('Y-m-d'),
                            'supplier_id' => request('sup'),
                            'beg_charge_bal' => $beg_charge_bal,
                            'end_charge_bal' => $end_charge_bal,
                            'charge_transaction_code' => $code,
                            'charge_status' =>  $charge_status,
                            'payable' => $payable,
                            'requisition_id' => $req->id,

                        ]);
                    } else {
                        $creditTransac = Transaction::where('id', '=', $creditTransac->id)->first(); //new
                        $creditTransac->payable += $payable;
                        $creditTransac->end_charge_bal = $end_charge_bal;
                        $creditTransac->save();
                    }
                }

                Transaction_item::create([
                    'item_status' => "Received",
                    'beg_balance' => $begBal->balance,
                    'end_balance' => $begBal->balance + request('new_quantity'),
                    'original_price' => request('new_unit_price'),
                    'unit_price' => $orgItem->unit_price,
                    'quantity' => request('new_quantity'),
                    'supplier_id' => request('sup'),
                    'beg_collectible' => $begBal->collectible_amount,
                    'end_collectible' => $newCollect,
                    'transaction_id' => $transaction->id,
                    'item_id' => $newitem->id,
                    'charge_status' => $charge_status,
                ]);
            }

            // Setting requisition to completed
            $stat = Requisition_item::where('status', '=', null)
                ->where('requisition_id', '=', $req->id)
                ->first();

            if (is_null($stat)) {
                $req = Requisition::where('code', request('code'))->firstOrFail();
                $req->request_status = 'Completed';
                $req->save();
            }

            // updated collectible based on new unit price
            $itcount = Item_count::where('item_id', $newitem->id)
                ->where('branch_id', $userdet->branch_id)
                ->get();

            // $newCollect = $itcount[0]->collectible_amount + ( $itcount[0]->balance * $orgItem->unit_price);
            $newCollect = $itcount[0]->balance * $orgItem->unit_price;
            $NewCount = Item_count::where('item_id', $newitem->id)->where('branch_id', $userdet->branch_id)->firstOrFail();
            $NewCount->collectible_amount = $newCollect;
            $NewCount->save();



            // output
            $req = Requisition::where('code', request('code'))->firstOrFail();

            // $reqitems = Requisition_item::join('items', 'requisition_items.item_id', '=', 'items.id')
            //                 ->where('requisition_items.requisition_id', '=',  $req->id)
            //                 ->where('requisition_items.status', '=',  null)
            //                 ->select('requisition_items.*', 'items.original_price as original_price', 'items.name as item','items.size as item_size','items.unit as item_unit')
            //                 ->get();

            $reqnewitems = Requisition_item::where('requisition_items.requisition_id', '=',  $req->id)
                ->where('requisition_items.status', '=',  null)
                ->where('requisition_items.item_id', '=', null)
                ->select('requisition_items.*')
                ->get();
            // $supplier = Supplier::select('suppliers.id', 'suppliers.name')->get();

            return response()->json([
                'status' => 200,
                'message' => 'Update successful',
                'updated' => $reqnewitems,
                'newItem' => $newitem->name
            ], 200);
        } catch (Exception $e) {
            return $this->responseServerError('Error updating resource.');
        }
    }
    public function importReceiving(Request $request)
    {
        if (!$user = auth()->setRequest($request)->user()) {
            return $this->responseUnauthorized();
        }
        try {





            $codeTr = $this->gecode("TR") . "RC";
            $codeCrd = $this->gecode("CRD");

            $itmObj = json_decode(request('items'), true);
            $userdet =  User_detail::where('id', $user->user_details_id)->firstOrFail();
            $branch =  Branch::where('id', $userdet->branch_id)->firstOrFail();

            $i = 0;
            $subtotal = 0;
            $prev_dateres = null;
            $prev_supplier = null;
            $prev_transId = null;
            $prev_codeTr = null;
            $prev_codeCrd = null;

            $lastIndex = count($itmObj);

            $lcode = null;
            $lccode = null;

            $newItm = "no";

            foreach ($itmObj as $itm) {
                if (!$itm["id"] == "") {
                    if ($itm["item_name"]) {
                        if ($itm["item_code"]) {
                            $item =  Item::where('code', $itm["item_code"])->first();
                            if (is_null($item)) {
                                $newItm = "yes";
                            }
                        } else {
                            $brand_id = 1;
                            if ($itm["brand"]) {
                                $brd =  Brand::where('name', $itm["brand"])->first();
                                is_null($brd) ? $brand_id = $this->addBrand($itm["brand"]) : $brand_id = $brd->id;
                            }

                            $item =  Item::where('name', $itm["item_name"])->where('brand_id', $brand_id)->where('size', $itm["size"])->where('unit', $itm["unit"])->first();
                            if (is_null($item)) {
                                $newItm = "yes";
                            }
                        }
                    }
                }
            }

            if ($newItm == "yes") {
                $branchE = Branch::select('branches.*')
                    ->get();
                $impTrans = [];
                foreach ($branchE as $br) {
                    $codeTrE =  $this->gecode("IMP") . "-" . $br->id;
                    $this->addtrans($br->name, $user->id, $br->id, $codeTrE, date("Y-m-d"), "Import");
                    $parts = new Branchref();
                    $parts->brnch = $br->id;
                    $parts->code =  $codeTrE;
                    // $itms[] = $parts;
                    $impTrans[] = $parts;
                }
                $impTransE = json_encode($impTrans);
                $brnchObj = json_decode($impTransE, true);
            }





            foreach ($itmObj as $itm) { //loop items


                if (!$itm["id"] == "") {
                    $dateres = str_replace('/', '-', $itm["date_received"]);
                    if ($i == 0) { // first index


                        // add receiving transaction
                        $transId = $this->addtrans($branch->name, $user->id, $userdet->branch_id, $codeTr, $dateres, "Receiving");

                        // supplier
                        $sup_id = 1;
                        if ($itm["supplier"]) {
                            $sup =  Supplier::where('name', $itm["supplier"])->first();
                            is_null($sup) ? $sup_id = $this->addSupplier($itm["supplier"]) : $sup_id = $sup->id;
                        }

                        // add credit transaction
                        if ($itm["for_payment"] == "yes") {
                            $creditId = $this->addcredit($itm["supplier"], $user->id, $userdet->branch_id, $sup_id, $codeCrd, $codeTr, $dateres);
                        }

                        // Item
                        if ($itm["item_name"]) {

                            // add brand
                            $brand_id = 1;
                            if ($itm["brand"]) {
                                $brd =  Brand::where('name', $itm["brand"])->first();
                                is_null($brd) ? $brand_id = $this->addBrand($itm["brand"]) : $brand_id = $brd->id;
                            }

                            // Add unit
                            if ($itm["unit"]) {
                                $unt =  Unit::where('name', $itm["unit"])->first();
                                if (is_null($unt)) {
                                    $this->addUnit($itm["unit"]);
                                }
                            }

                            // Add Item
                            if ($itm["item_code"]) {
                                $item =  Item::where('code', $itm["item_code"])->first();
                                is_null($item) ? $item_id = $this->addItem($itm["item_name"], $brand_id, $itm["size"], 1, $itm["original_price"], $itm["unit"], 0, $itm["item_code"], $brnchObj) : $item_id = $item->id;
                            } else {
                                $item =  Item::where('name', $itm["item_name"])->where('brand_id', $brand_id)->where('size', $itm["size"])->where('unit', $itm["unit"])->first();
                                is_null($item) ? $item_id = $this->addItem($itm["item_name"], $brand_id, $itm["size"], 1, $itm["original_price"], $itm["unit"], 0, $this->gecode("ITM"), $brnchObj) : $item_id = $item->id;
                            }

                            // Add transaction item
                            $tr_itemId = $this->addTransItems($itm["srp"], $itm["original_price"],  $itm["quantity"], $transId, $sup_id, $item_id, "Received");
                            $subtotal += $itm["original_price"] * $itm["quantity"];
                        }

                        //pass the transaction id to the next array
                        $prev_transId = $transId;
                        $prev_codeTr = $codeTr;
                        $prev_codeCrd = $codeCrd;
                    } else { //rest of the array

                        if ($itm["date_received"] === $prev_dateres && $itm["supplier"] && $prev_supplier) { //if same date and supplier from prev trans
                            // supplier
                            $sup_id = 1;
                            if ($itm["supplier"]) {
                                $sup =  Supplier::where('name', $itm["supplier"])->first();
                                is_null($sup) ? $sup_id = $this->addSupplier($itm["supplier"]) : $sup_id = $sup->id;
                            }
                            // Item
                            if ($itm["item_name"]) {

                                // add brand
                                $brand_id = 1;
                                if ($itm["brand"]) {
                                    $brd =  Brand::where('name', $itm["brand"])->first();
                                    is_null($brd) ? $brand_id = $this->addBrand($itm["brand"]) : $brand_id = $brd->id;
                                }

                                // Add unit
                                if ($itm["unit"]) {
                                    $unt =  Unit::where('name', $itm["unit"])->first();
                                    if (is_null($unt)) {
                                        $this->addUnit($itm["unit"]);
                                    }
                                }

                                // Add Item
                                if ($itm["item_code"]) {
                                    $item =  Item::where('code', $itm["item_code"])->first();
                                    is_null($item) ? $item_id = $this->addItem($itm["item_name"], $brand_id, $itm["size"], 1, $itm["original_price"], $itm["unit"], 0, $itm["item_code"], $brnchObj) : $item_id = $item->id;
                                } else {
                                    $item =  Item::where('name', $itm["item_name"])->where('brand_id', $brand_id)->where('size', $itm["size"])->where('unit', $itm["unit"])->first();
                                    is_null($item) ? $item_id = $this->addItem($itm["item_name"], $brand_id, $itm["size"], 1, $itm["original_price"], $itm["unit"], 0, $this->gecode("ITM"), $brnchObj) : $item_id = $item->id;
                                }

                                // Add transaction item
                                $tr_itemId = $this->addTransItems($itm["srp"], $itm["original_price"],  $itm["quantity"], $prev_transId, $sup_id, $item_id, "Received");
                                $subtotal += $itm["original_price"] * $itm["quantity"];
                            }
                            //pass the transaction id to the next array
                            $prev_transId = $prev_transId;
                            $prev_codeTr = $prev_codeTr;
                            $prev_codeCrd = $prev_codeCrd;
                        } else {
                            $tres = Transaction::where('code',  $prev_codeTr)->firstOrFail();
                            $tres->payable = $subtotal;
                            $tres->save();

                            $tcrd = Transaction::where('code',  $prev_codeCrd)->firstOrFail();
                            $tcrd->payable = $subtotal;
                            $tcrd->save();

                            $codeTr = $this->gecode("TR") . "RC";
                            $codeCrd = $this->gecode("CRD");

                            $subtotal = 0;

                            // add receiving transaction
                            $transId = $this->addtrans($branch->name, $user->id, $userdet->branch_id, $codeTr, $dateres, "Receiving");

                            // supplier
                            $sup_id = 1;
                            if ($itm["supplier"]) {
                                $sup =  Supplier::where('name', $itm["supplier"])->first();
                                is_null($sup) ? $sup_id = $this->addSupplier($itm["supplier"]) : $sup_id = $sup->id;
                            }

                            // add credit transaction
                            if ($itm["for_payment"] == "yes") {
                                $creditId = $this->addcredit($itm["supplier"], $user->id, $userdet->branch_id, $sup_id, $codeCrd, $codeTr, $dateres);
                            }

                            // Item
                            if ($itm["item_name"]) {

                                // add brand
                                $brand_id = 1;
                                if ($itm["brand"]) {
                                    $brd =  Brand::where('name', $itm["brand"])->first();
                                    is_null($brd) ? $brand_id = $this->addBrand($itm["brand"]) : $brand_id = $brd->id;
                                }

                                // Add unit
                                if ($itm["unit"]) {
                                    $unt =  Unit::where('name', $itm["unit"])->first();
                                    if (is_null($unt)) {
                                        $this->addUnit($itm["unit"]);
                                    }
                                }

                                // Add Item
                                if ($itm["item_code"]) {
                                    $item =  Item::where('code', $itm["item_code"])->first();
                                    is_null($item) ? $item_id = $this->addItem($itm["item_name"], $brand_id, $itm["size"], 1, $itm["original_price"], $itm["unit"], 0, $itm["item_code"], $brnchObj) : $item_id = $item->id;
                                } else {
                                    $item =  Item::where('name', $itm["item_name"])->where('brand_id', $brand_id)->where('size', $itm["size"])->where('unit', $itm["unit"])->first();
                                    is_null($item) ? $item_id = $this->addItem($itm["item_name"], $brand_id, $itm["size"], 1, $itm["original_price"], $itm["unit"], 0, $this->gecode("ITM"), $brnchObj) : $item_id = $item->id;
                                }

                                // Add transaction item
                                $tr_itemId = $this->addTransItems($itm["srp"], $itm["original_price"],  $itm["quantity"], $transId, $sup_id, $item_id, "Received");
                                $subtotal += $itm["original_price"] * $itm["quantity"];
                            }
                            //pass the transaction id to the array
                            $prev_transId = $transId;
                            $prev_codeTr = $codeTr;
                            $prev_codeCrd = $codeCrd;
                        }

                        // if ($i == $lastIndex-2) {
                        //     $lcode = $prev_codeTr;
                        //     $tres = Transaction::where('code',  $prev_codeTr)->firstOrFail();
                        //     $tres->payable = $subtotal;
                        //     $tres->save();

                        //     $lccode =  $prev_codeCrd;
                        //     $tcrd = Transaction::where('code',  $prev_codeCrd)->firstOrFail();
                        //     $tcrd->payable = $subtotal;
                        //     $tcrd->save();
                        // }
                    }

                    $prev_dateres = $itm["date_received"];
                    $prev_supplier = $itm["supplier"];

                    if ($i == $lastIndex - 2) {
                        $lcode = $prev_codeTr;
                        $tres = Transaction::where('code',  $prev_codeTr)->firstOrFail();
                        $tres->payable = $subtotal;
                        $tres->save();

                        $lccode =  $prev_codeCrd;
                        $tcrd = Transaction::where('code',  $prev_codeCrd)->firstOrFail();
                        $tcrd->payable = $subtotal;
                        $tcrd->save();
                    }

                    // $l = $lastIndex-1;
                }



                $i++;
            }

            return response()->json([
                'status' => 200,
                // 'codetr' => $codeTr,
                // 'codecd' => $codeCrd,
                // 'items' => $itmObj,
                // 'trId' => $transId,
                // 'creditId' => $creditId,
                // 'item_id' => $item_id,
                // 'tr_item' => $tr_itemId,
                // 'total' => $subtotal,
                // 'l' => $lastIndex,
                // 'lcode' => $lcode,
                // 'lccode' => $lccode,
            ], 200);
        } catch (Exception $e) {
            echo $e;
            return $this->responseServerError('Error updating resource.');
        }
    }

    public function historicalPurchase(Request $request)
    {
        if (!$user = auth()->setRequest($request)->user()) {
            return $this->responseUnauthorized();
        }


        try {

            $codeTr = $this->gecode("TR") . "RC";
            $codeCrd = $this->gecode("CRD");

            $itmObj = json_decode(request('items'), true);
            $userdet =  User_detail::where('id', $user->user_details_id)->firstOrFail();
            $branch =  Branch::where('id', $userdet->branch_id)->firstOrFail();
            $supplier =  Supplier::where('id', request('supplier_id'))->firstOrFail();
            $subtotal = 0;

            $dateres = str_replace('/', '-', request('date_transac'));
            $transId = $this->addtrans($branch->name, $user->id, $userdet->branch_id, $codeTr, $dateres, "Receiving");

            if (request('for_payment') == "yes") {
                $creditId = $this->addcredit($supplier->name, $user->id, $userdet->branch_id, request('supplier_id'), $codeCrd, $codeTr, $dateres);
            }

            foreach ($itmObj as $itm) { //loop items
                $tr_itemId = $this->addTransItems($itm["srp"], $itm["original_price"],  $itm["quantity"], $transId, $itm["sup_id"], $itm["item_id"], "Received");
                $subtotal += $itm["total"];
            }


            $tres = Transaction::where('code',  $codeTr)->firstOrFail();
            $tres->payable = $subtotal;
            $tres->save();

            if (request('for_payment') == "yes") {
                $tcrd = Transaction::where('code',  $codeCrd)->firstOrFail();
                $tcrd->payable = $subtotal;
                $tcrd->save();
            }

            return response()->json([
                'status' => 200,

            ], 200);
        } catch (Exception $e) {
            echo $e;
            return $this->responseServerError('Error updating resource.');
        }
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


        $code = $trans . $random . $day;
        // check if the id exist
        $oldcode =  Transaction::where('code', $code)->first();
        if ($oldcode) {
            if (strlen($day) == 1) {
                $day = "0" . $day;
            }
            $random = rand(1111111111, 9999999999);
            return  $code = $trans . $random . $day;
        } else {
            return $code;
        }
    }
    function addtrans($branch, $user_id, $branch_id, $code, $date, $type)
    {
        $new = Transaction::create([
            // 'transaction_type' => "Receiving",
            'transaction_type' => $type,
            'accountability' => "Admin",
            'customer_name' => $branch,
            'user_id' => $user_id,
            'branch_id' => $branch_id,
            'code' => $code,
            'date_transac' =>  date('Y-m-d', strtotime($date)),
            'payable' => 0,
            'imported' => 'yes',
        ]);

        return $new->id;
    }

    function addcredit($supplier, $user_id, $branch_id, $sup_id, $codeCrd, $codeTr, $date)
    {

        $newCredit = Transaction::create([
            'transaction_type' => "Credit",
            'accountability' => "Supplier",
            'customer_name' => $supplier,
            'user_id' => $user_id,
            'branch_id' => $branch_id,
            'code' => $codeCrd,
            'date_transac' =>  date('Y-m-d', strtotime($date)),
            'supplier_id' => $sup_id,
            'charge_transaction_code' => $codeTr,
            'payable' => 0,
            'imported' => 'yes',
        ]);

        return $newCredit->id;
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

    function addBrand($name)
    {
        $new = Brand::create([
            'name' => $name,
        ]);

        return $new->id;
    }

    function addUnit($name)
    {
        $new = Unit::create([
            'name' => $name,
        ]);

        return $new->id;
    }

    function addTransItems($unit_price, $org_price,  $qty, $trans, $sup, $itm, $type)
    {
        $new = Transaction_item::create([
            // 'item_status' => "Received",
            'item_status' =>  $type,
            'unit_price' => $unit_price,
            'original_price' => $org_price,
            'quantity' => $qty,
            'transaction_id' => $trans,
            'supplier_id' => $sup,
            'item_id' => $itm,
        ]);

        return $new->id;
    }

    function addItem($name, $brand_id, $size, $cat_id, $org_price, $unit, $srp, $code, $brnchObj)
    {
        $item = Item::create([
            'name' => $name,
            'brand_id' => $brand_id,
            'size' =>  $size,
            'category_id' => $cat_id,
            'original_price' => $org_price,
            'unit' => $unit,
            'unit_price' => $srp,
            'code' => $code,
        ]);
        $branch = Branch::select('branches.*')
            ->get();

        foreach ($branch as $br) {
            Item_count::create([
                'item_id' => $item->id,
                'balance' => 0,
                'collectible_amount' => 0,
                'threshold' => 0,
                'branch_id' => $br->id,
            ]);

            foreach ($brnchObj as $btc) {

                if ($btc["brnch"] == $br->id) {
                    $brcode = $btc["code"];
                }
            }
            $trt =  Transaction::where('code', $brcode)->firstOrFail();
            $this->addTransItems($srp, $org_price,  0, $trt->id, null, $item->id, "Import");
        }



        return $item->id;
    }
}
