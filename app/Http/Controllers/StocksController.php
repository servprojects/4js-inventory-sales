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
use App\Item_category;
use App\Transaction_item;
use App\Transaction;
use DB;

class StocksController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request)
    {
        // Get user from $request token.
        if (!$user = auth()->setRequest($request)->user()) {
            return $this->responseUnauthorized();
        }



        try {
            // get branch
            $userdet =  User_detail::where('id', $user->user_details_id)->firstOrFail();

            $col4 =  Item::join('item_counts', 'items.id', '=', 'item_counts.item_id');
            $col4->join('item_categories', 'items.category_id', '=', 'item_categories.id');
            $col4->join('brands', 'items.brand_id', '=', 'brands.id');
            $col4->join('branches', 'item_counts.branch_id', '=', 'branches.id');
            if (request('branch_id')) {
                $col4->where('item_counts.branch_id', '=', request('branch_id'));
            } else {
                // $col4->where('item_counts.branch_id', '=', 8);
                $col4->where('item_counts.branch_id', '=', $userdet->branch_id);
            }
            $col4->where('branches.isDisabled', '!=', 1);
            $col4->whereNull('items.isDisabled');
            $col4->select('items.*', 'item_categories.name as category','items.name as item','item_counts.branch_id', 'item_counts.balance', 'item_counts.collectible_amount', 'item_counts.threshold',
        
            'item_counts.begbal_created_at', 'brands.name as brand',
            'item_counts.begbal_updated_at',
        );
            $col4 = $col4->get();


            if ($userdet->role == "Superadmin" && !request('branch_id')) {

                $col4 =  Item::join('item_counts', 'items.id', '=', 'item_counts.item_id');
                $col4->join('item_categories', 'items.category_id', '=', 'item_categories.id');
                $col4->join('brands', 'items.brand_id', '=', 'brands.id');
                $col4->join('branches', 'item_counts.branch_id', '=', 'branches.id');
                $col4->where('branches.isDisabled', '!=', 1);
                $col4->whereNull('items.isDisabled');
                $col4->select(
                    'items.*',
                    'item_categories.name as category',
                    'items.name as item',
                    DB::raw('SUM(item_counts.balance) as balance'),
                    DB::raw('SUM(item_counts.collectible_amount) as collectible_amount'),
                    'item_counts.threshold', 'brands.name as brand'

                );
                $col4->groupBy('items.id');
                $col4 = $col4->get();
            }

            // $col4 =  Item::join('item_counts', 'items.id', '=', 'item_counts.item_id');
            // $col4->select('items.*', 'items.name as item', 'SUM(item_counts.balance) as balance', 'SUM(item_counts.collectible_amount) as collectible_amount', 'item_counts.threshold');
            // $col4->groupBy('item_counts.item_id');
            // $col4 = $col4->get();

            $categories = Item_category::select('item_categories.*')->get();
            $branches = Branch::select('branches.*')->where('branches.isDisabled', '!=', 1)->get();
            // $branches = Branch::select('branches.*')->get();
        } catch (Exception $e) {
        }

        return response()->json([
            'status' => 200,
            'stocks' => $col4,
            'branches' => $branches,
            'categories' => $categories,
            'role' =>  $userdet->role,
        ], 200);
    }

    public function defectives(Request $request)
    {
        // Get user from $request token.
        if (!$user = auth()->setRequest($request)->user()) {
            return $this->responseUnauthorized();
        }



        try {
            // get branch
            $userdet =  User_detail::where('id', $user->user_details_id)->firstOrFail();

            $col4 =  Item::join('defectives', 'items.id', '=', 'defectives.item_id')
                ->where('defectives.branch_id', '=', $userdet->branch_id)
                ->select('items.*', 'items.name as item', 'defectives.balance')
                ->get();
        } catch (Exception $e) {
        }

        return response()->json([
            'status' => 200,
            'stocks' => $col4,
        ], 200);
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
    public function store(Request $request)
    {
        //
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
    public function update(Request $request)
    {
        // Get user from $request token.
        if (!$user = auth()->setRequest($request)->user()) {
            return $this->responseUnauthorized();
        }



        try {
            // $transitm =  Transaction_item::where('item_id', request('item_id'))->firstOrFail();

            $threshold = Item_count::where('item_id', request('item_id'))->update(['threshold' => request('threshold')]);
            // $threshold = Item_count::where('item_id',  '=',request('item_id'))->get();



            // $threshold->threshold = request('threshold');
            // $threshold->save();


            // return $this->responseResourceUpdated();
            return response()->json([
                'status' => 200,
                'message' => 'Update successful',

            ], 200);
        } catch (Exception $e) {
            return $this->responseServerError('Error updating resource.');
        }
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

    public function updateBalance(Request $request)
    {
        // Get user from $request token.
        if (!$user = auth()->setRequest($request)->user()) {
            return $this->responseUnauthorized();
        }



        try {
            $userdet =  User_detail::where('id', $user->user_details_id)->firstOrFail();

            $transitm =  Transaction_item::join('transactions', 'transaction_items.transaction_id', '=', 'transactions.id')
            ->where('transactions.branch_id', request('branch'))
            ->where('transaction_items.item_id', request('item_id'))
            ->where('transaction_items.item_status', '!=' , 'Update')
            ->where('transaction_items.item_status', '!=' , 'Import')->first();

            // $transitm =  Transaction_item::where('item_id', request('item_id'))
            // ->where('item_status', '!=' , 'Update')
            // ->where('item_status', '!=' , 'Import')->first();

            
            if (is_null($transitm)) {
                $orgitems =  Item::where('id', request('item_id'))->firstOrFail();

                $itmcount =  Item_count::where('item_id', request('item_id'))
                    ->where('branch_id', request('branch'))->firstOrFail();

                $oldbal = $itmcount->balance;
                $itmcount->balance = request('newbal');

                $oldcol = $itmcount->collectible_amount;
                $itmcount->collectible_amount = request('newbal') * $orgitems->unit_price;
                $endcol =  $itmcount->collectible_amount;
                $itmcount->save();

                // generate code
               
                $day = date("d");

                $random = rand(1111111111, 9999999999);
                if (strlen($day) == 1) {
                    $day = "0" . $day;
                }
                $code = "UPB" . $random . $day;


                // check if the id exist
                $oldcode =  Transaction::where('code', $code)->first();
                if ($oldcode) {
                    if (strlen($day) == 1) {
                        $day = "0" . $day;
                    }
                    $random = rand(1111111111, 9999999999);
                    $code = "UPB" . $random . $day;
                }
                // generate code

               $new= Transaction::create([
                    'transaction_type' => "Update",
                    'user_id' => $user->id,
                    // 'branch_id' => $userdet->branch_id,
                    'branch_id' => request('branch'),
                    'code' => $code,
                    'date_transac' => date('Y-m-d'),
                    'customer_name' => $orgitems->name,
                    'accountability' => "Admin",


                ]);
                Transaction_item::create([
                    'item_status' => "Update",
                    'unit_price' => $orgitems->unit_price,
                    'beg_balance' => $oldbal,
                    'end_balance' => request('newbal'),
                    'original_price' => $orgitems->original_price,
                    'transaction_id' => $new->id,
                    'beg_collectible' => $oldcol,
                    'end_collectible' => $endcol,
                    'item_id' => request('item_id'),
                ]);
                $status = 200;
                $message = 'Update successful';
            }else{
                $status = 105;
                $message = 'Update no longer possible';
            }
            return response()->json([
                'stat' => $status,
                'message' => $message,

            ], 200);
           
        } catch (Exception $e) {
            return $this->responseServerError('Error updating resource.');
        }
    }
}
