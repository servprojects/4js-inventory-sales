<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use App\Http\Controllers\APIController;
use App\Requisition;
use App\Requisition_item;
use App\User_detail;
use App\Item;
use App\Unit;
use App\Branch;
use App\Item_count;
use DB;

class RequestItemController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request)
    {
        // Get user from $request token.
        //   if (! $user = auth()->setRequest($request)->user()) {
        //     return $this->responseUnauthorized();
        //      }

        try {

            $col4 =  Requisition::join('users', 'requisitions.user_id', '=', 'users.id')
                ->join('user_details', 'users.user_details_id', '=', 'user_details.id')
                ->join('branches', 'user_details.branch_id', '=', 'branches.id')
                ->join('positions', 'user_details.position_id', '=', 'positions.id')
                ->where('requisitions.id', '=', '7')
                ->select('requisitions.*', 'user_details.first_name', 'user_details.last_name', 'positions.name as position', 'branches.name as branch')
                ->get();

            // $collection1 = Item::select('items.*');
            // $collection1 = $collection1->latest()->paginate();
            $collection1 =  Item::join('brands', 'items.brand_id', '=', 'brands.id')
                ->join('item_categories', 'items.category_id', '=', 'item_categories.id')
                ->select('items.*', 'brands.name as brand', 'item_categories.name as category')
                ->get();
            // $collection1 =  Item::join('brands', 'items.brand_id', '=', 'brands.id')
            // ->join('item_categories', 'items.category_id', '=', 'item_categories.id')
            // ->join('item_counts', 'items.id', '=', 'item_counts.item_id')
            // ->where('item_counts.branch_id', '=', $userdet->branch_id)
            // ->where('item_counts.balance', '>', 0)
            // ->select('items.*', 'brands.name as brand', 'item_categories.name as category', 'item_counts.balance as balance')
            // ->get();

        } catch (Exception $e) {
        }



        return response()->json([
            'status' => 200,
            'items' => $collection1,
            'requests' => $col4,
        ], 200);
    }
    public function reitems(Request $request)
    {
        // Get user from $request token.
        if (!$user = auth()->setRequest($request)->user()) {
            return $this->responseUnauthorized();
        }

        try {

            $col4 =  Requisition::join('users', 'requisitions.user_id', '=', 'users.id')
                ->join('user_details', 'users.user_details_id', '=', 'user_details.id')
                ->join('branches', 'user_details.branch_id', '=', 'branches.id')
                ->join('positions', 'user_details.position_id', '=', 'positions.id')
                ->where('requisitions.id', '=', request('id'))
                ->select('requisitions.*', 'user_details.first_name', 'user_details.last_name', 'positions.name as position', 'branches.name as branch')
                ->get();

            $reqTo =  Requisition::join('branches', 'requisitions.request_to', '=', 'branches.id')
                ->where('requisitions.id', '=', request('id'))
                ->select('requisitions.*', 'branches.name as branch', 'branches.id as branch_id')
                ->get();

            // $collection1 = Item::select('items.*');
            // $collection1 = $collection1->latest()->paginate();

            // $collection1 =  Item::join('brands', 'items.brand_id', '=', 'brands.id')
            // ->join('item_categories', 'items.category_id', '=', 'item_categories.id')
            // ->select('items.*', 'brands.name as brand', 'item_categories.name as category')
            // ->get();
            $reqbrID =  Requisition::where('id', request('id'))->firstOrFail();
            $collection1 =  Item::join('brands', 'items.brand_id', '=', 'brands.id')
                ->join('item_categories', 'items.category_id', '=', 'item_categories.id')
                ->join('item_counts', 'items.id', '=', 'item_counts.item_id')
                ->where('item_counts.branch_id', '=', $reqbrID->request_to)
                ->whereNull('items.isDisabled')
                ->select('items.*', 'brands.name as brand', 'item_categories.name as category', 'item_counts.balance as balance')
                ->get();

            $reqitems = Requisition_item::join('items', 'requisition_items.item_id', '=', 'items.id')
                ->where('requisition_items.requisition_id', '=', request('id'))
                ->select('requisition_items.*', 'items.original_price as original_price', 'items.name as item', 'items.id as item_id', 'items.size as item_size', 'items.unit as item_unit', DB::raw('
                        (requisition_items.unit_price * requisition_items.quantity) as sub_total'), 'requisition_items.unit_price as new_price')
                ->get();

            $reqnewitems = Requisition_item::where('requisition_items.requisition_id', '=', request('id'))
                ->where('requisition_items.item_id', '=', null)
                ->select('requisition_items.*', DB::raw('
            (requisition_items.unit_price * requisition_items.quantity) as sub_total'))
                ->get();

            $units = Unit::select('units.*');
            $units = $units->latest()->paginate();

            $userdet =  User_detail::where('id', $user->user_details_id)->firstOrFail();  // get branch
            if ($reqbrID->type == "Transfer") {
                $branch = Branch::select('branches.id', 'branches.name')->where('id', '!=', $userdet->branch_id);
                $branch = $branch->latest()->paginate();
            } else {
                $branch = Branch::select('branches.id', 'branches.name');
                $branch = $branch->latest()->paginate();
            }

            // $recc = array();
            // foreach($reqitems as $rq){

                $rec= Item_count::join('items', 'item_counts.item_id', '=', 'items.id')
                ->join('requisition_items', 'items.id', '=', 'requisition_items.item_id')
                ->join('branches', 'item_counts.branch_id', '=', 'branches.id');
               
                $rec->select(
                    // 'items.*',
                    'branches.name as branch',
                    'items.name as item',
                    'item_counts.item_id',
                    'item_counts.balance',
                    'item_counts.branch_id',


                );
                $rec->where('requisition_items.requisition_id', '=', request('id'));
                // $rec->whereNull('items.isDisabled');

                $rec = $rec->get();

                $recc = $rec;

            // }

            // $rec =  Item::join('item_counts', 'items.id', '=', 'item_counts.item_id')
            // ->join('branches', 'item_counts.branch_id', '=', 'branches.id');
            // $rec->select(
            //     // 'items.*',
            //     'branches.name as branch',
            //     'items.name as item',
            //     'item_counts.item_id',
            //     'item_counts.balance',
            //     'item_counts.branch_id',


            // );



            // $results = DB::select(
            //             DB::raw('
            //             set @sql = ( select group_concat(distinct concat( "sum(case when `branch_id`=`", "branch_id", "` then `balance` end) as `", "branch_id", "`" ) ) from item_counts );


            //             set @sql = concat("select item_id, ", @sql, " from item_counts group by `item_id`");

            //             prepare stmt from @sql;

            //             execute stmt;

            //             '))->get();

                // $rec =  Item::join('item_counts', 'items.id', '=', 'item_counts.item_id')
                // ->join('branches', 'item_counts.branch_id', '=', 'branches.id');
                // $rec->select(
                //     // 'items.*',
                //     'branches.name as branch',
                //     'items.name as item',
                //     'item_counts.item_id',
                //     'item_counts.balance',
                //     'item_counts.branch_id',


                // );
                // $rec->where( 'item_counts.item_id', '=', '12832');
                // // $rec->groupBy('item_counts.branch_id');
                // $rec = $rec->get();

        } catch (Exception $e) {
        }



        return response()->json([
            'status' => 200,
            'items' => $collection1,
            'requests' => $col4,
            'reqitems' => $reqitems,
            'reqnewitems' => $reqnewitems,
            'units' => $units,
            'reqTo' => $reqTo,
            'branch' => $branch,
            'res' => $recc,
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
        // Get user from $request token.
        //   if (! $user = auth()->setRequest($request)->user()) {
        //     return $this->responseUnauthorized();
        // }


        try {

            $item_id = null;
            $new_item = null;
            // $new_item = 'what';
            if (request('item_id')) {
                $item_id = request('item_id');
            }

            if (request('new_item')) {
                $new_item = request('new_item');
            }

            $reqitem = Requisition_item::create([
                'item_id' => $item_id,
                'new_item' => "" . $new_item . "",
                'unit_price' => request('unit_price'),
                'quantity' => request('quantity'),
                'requisition_id' => request('requisition_id'),
            ]);

            $item = Item::where('id', request('item_id'))->firstOrFail();

            $reqitems = Requisition_item::join('items', 'requisition_items.item_id', '=', 'items.id')
                ->where('requisition_items.requisition_id', '=', request('requisition_id'))
                ->select('requisition_items.*', 'items.name as item', 'items.size as item_size', 'items.unit as item_unit', 'requisition_items.unit_price as new_price', DB::raw('(requisition_items.unit_price * requisition_items.quantity) as sub_total'))
                ->get();

            return response()->json([
                'status' => 201,
                'message' => 'Resource created.',
                'id' => $reqitem->id,
                'item' => $item->name,
                'updated' => $reqitems,

            ], 201);
        } catch (Exception $e) {
            return $this->responseServerError('Error creating resource.');
        }
    }

    public function storeNew(Request $request)
    {
        // Get user from $request token.
        //   if (! $user = auth()->setRequest($request)->user()) {
        //     return $this->responseUnauthorized();
        // }


        try {



            $reqitem = Requisition_item::create([
                'new_item' => request('new_item'),
                'unit_price' => request('unit_price'),
                'quantity' => request('quantity'),
                'requisition_id' => request('requisition_id'),
                'unit' => request('unit'),
                'size' => request('size'),
            ]);

            // $item = Item::where('id', request('item_id'))->firstOrFail();

            $reqitems = Requisition_item::where('requisition_items.requisition_id', '=', request('requisition_id'))
                ->where('requisition_items.item_id', '=', null)
                ->select('requisition_items.*')
                ->get();

            return response()->json([
                'status' => 201,
                'message' => 'Resource created.',
                'id' => $reqitem->id,
                'updated' => $reqitems,

            ], 201);
        } catch (Exception $e) {
            return $this->responseServerError('Error creating resource.');
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
    public function update1(Request $request, $id)
    {
        // Get user from $request token.
        if (!$user = auth()->setRequest($request)->user()) {
            return $this->responseUnauthorized();
        }



        try {
            $req = Requisition_item::where('id', $id)->firstOrFail();



            if (request('unit_price')) {
                $req->unit_price = request('unit_price');
            }

            if (request('quantity')) {
                $req->quantity = request('quantity');
            }

            $req->save();


            $reqitems = Requisition_item::join('items', 'requisition_items.item_id', '=', 'items.id')
                ->where('requisition_items.requisition_id', '=', request('requisition_id'))
                ->select('requisition_items.*', 'items.name as item')
                ->get();

            // return $this->responseResourceUpdated();
            // $reqitems = Requisition_item::join('items', 'requisition_items.item_id', '=', 'items.id')
            // ->where('requisition_items.requisition_id', '=', request('requisition_id'))
            // ->select('requisition_items.*', 'items.name as item')
            // ->get();

            // 'updated1' => $reqitems1,

            return response()->json([
                'status' => 200,
                'message' => 'Update successful',
                'updated' => $reqitems,
            ], 200);
        } catch (Exception $e) {
            return $this->responseServerError('Error updating resource.');
        }
    }

    public function update(Request $request, $id)
    {
        // Get user from $request token.
        //    if (! $user = auth()->setRequest($request)->user()) {
        //     return $this->responseUnauthorized();
        // }



        try {
            $req = Requisition_item::where('id', $id)->firstOrFail();



            if (request('unit_price')) {
                $req->unit_price = request('unit_price');
            }

            if (request('quantity')) {
                $req->quantity = request('quantity');
            }

            if (request('new_item')) {
                $req->new_item = request('new_item');
            }
            if (request('size')) {
                $req->size = request('size');
            }
            if (request('unit')) {
                $req->unit = request('unit');
            }
            $req->save();



            $reqitems1 = Requisition_item::join('items', 'requisition_items.item_id', '=', 'items.id')
                ->where('requisition_items.requisition_id', '=', request('requisition_id'))
                ->select('requisition_items.*', 'items.name as item', 'items.size as item_size', 'items.unit as item_unit', 'requisition_items.unit_price as new_price', DB::raw('(requisition_items.unit_price * requisition_items.quantity) as sub_total'))
                ->get();

            // $reqitems1 = Requisition_item::join('items', 'requisition_items.item_id', '=', 'items.id')
            //              ->select('requisition_items.*', 'items.name as item','items.size as item_size','items.unit as item_unit', 'requisition_items.unit_price as new_price', DB::raw('(requisition_items.unit_price * requisition_items.quantity) as sub_total'))
            //             ->get();


            $reqitems2 = Requisition_item::where('requisition_items.requisition_id', '=', request('requisition_id'))
                ->where('requisition_items.item_id', '=', null)
                ->select('requisition_items.*')
                ->get();


            // return $this->responseResourceUpdated();
            // $reqitems = Requisition_item::join('items', 'requisition_items.item_id', '=', 'items.id')
            // ->where('requisition_items.requisition_id', '=', request('requisition_id'))
            // ->select('requisition_items.*', 'items.name as item')
            // ->get();

            // 'updated1' => $reqitems1,

            return response()->json([
                'status' => 200,
                'message' => 'Update successful',
                'updated1' => $reqitems1,
                'updated2' => $reqitems2,
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
    public function destroy(Request $request, $id)
    {
        // Get user from $request token.
        // if (! $user = auth()->setRequest($request)->user()) {
        //     return $this->responseUnauthorized();
        // }

        $ri = Requisition_item::where('id', $id)->firstOrFail();



        try {
            $ri->delete();
            // return $this->responseResourceDeleted();

            $reqitems = Requisition_item::join('items', 'requisition_items.item_id', '=', 'items.id')
                ->where('requisition_items.requisition_id', '=', request('requisition_id'))
                ->select('requisition_items.*', 'items.name as item')
                ->get();

            $reqitems1 = Requisition_item::join('items', 'requisition_items.item_id', '=', 'items.id')
                ->where('requisition_items.requisition_id', '=', request('requisition_id'))
                ->select('requisition_items.*', 'items.name as item')
                ->get();


            $reqitems2 = Requisition_item::where('requisition_items.requisition_id', '=', request('requisition_id'))
                ->select('requisition_items.*')
                ->get();

            return response()->json([
                'status' => 204,
                'message' => "Deleted successfully",
                'updated' => $reqitems,
                'updated1' => $reqitems1,
                'updated2' => $reqitems2,
            ], 204);
        } catch (Exception $e) {
            return $this->responseServerError('Error deleting resource.');
        }
    }
}
