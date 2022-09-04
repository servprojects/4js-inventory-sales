<?php

namespace App\Http\Controllers;

use App\Branch;
use App\Item;
use App\Item_count;
use App\ItemMatchSubQty;
use App\ItemSubQtyUnit;
use App\Transaction;
use App\Transaction_item;
use App\User_detail;
use Illuminate\Http\Request;

class ConversionController extends Controller
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

    public function GetItems(Request $request)
    {
        // Get user from $request token.
        if (!$user = auth()->setRequest($request)->user()) {
            return $this->responseUnauthorized();
        }

        // Warning: Data isn't being fully sanitized yet.
        try {
            // get branch
            $userdet =  User_detail::where('id', $user->user_details_id)->firstOrFail();
            $bId = null;

            if ($userdet->role == "Superadmin") {
                if (request("branch_id")) {
                    $subqty = $this->SubQtySQL(request("branch_id"));
                    $bId = request("branch_id");
                } else {
                    $subqty = $this->SubQtySQL($userdet->branch_id);
                    $bId = $userdet->branch_id;
                }
            } else {
                $subqty = $this->SubQtySQL($userdet->branch_id);
                $bId = $userdet->branch_id;
            }



            $branch =  Branch::where('id', $bId)->firstOrFail();

            return response()->json([
                'status' => 201,
                'message' => 'Resource created.',
                'subqty' => $subqty,
                'branch_name' => $branch->name,
                'branch_id' => $branch->id,
                // 'match' => $match
            ], 201);
        } catch (Exception $e) {
            return $this->responseServerError('Error creating resource.');
        }
    }

    public function GetMatchedItems(Request $request)
    {
        // Get user from $request token.
        if (!$user = auth()->setRequest($request)->user()) {
            return $this->responseUnauthorized();
        }

        // Warning: Data isn't being fully sanitized yet.
        try {
            $match = ItemMatchSubQty::join('items', 'item_match_sub_qties.match_item_id', '=', 'items.id')
                ->join('item_counts', 'items.id', '=', 'item_counts.item_id')
                ->select(
                    'items.name',
                    'items.size',
                    'items.unit',
                    'items.id',
                    'item_counts.balance',

                )
                ->where('item_counts.branch_id', request("branch_id"))
                ->where('item_match_sub_qties.item_id', request("item_id"))->get();

            return response()->json([
                'status' => 201,
                'message' => 'Resource created.',
                'match' => $match,
            ], 201);
        } catch (Exception $e) {
            return $this->responseServerError('Error creating resource.');
        }
    }

    function SubQtySQL($branch)
    {
        $subqty = ItemSubQtyUnit::join('items', 'item_sub_qty_units.item_id', '=', 'items.id')
            ->join('brands', 'items.brand_id', '=', 'brands.id')
            ->join('item_counts', 'items.id', '=', 'item_counts.item_id')
            ->select(
                'items.name',
                'brands.name as brand',
                'items.code',
                'items.size',
                'items.unit',
                'items.id',
                'item_counts.balance',
                'item_sub_qty_units.quantity as const_qty',
                'item_sub_qty_units.unit as const_unit',

            )
            ->where('item_counts.branch_id', $branch)->get();

        return $subqty;
    }


    public function GetConvDet(Request $request)
    {
        // Get user from $request token.
        if (!$user = auth()->setRequest($request)->user()) {
            return $this->responseUnauthorized();
        }

        // Warning: Data isn't being fully sanitized yet.
        try {
            $subqty = ItemSubQtyUnit::where('item_id', request('id'))->get();
            $match = ItemMatchSubQty::join('items', 'item_match_sub_qties.match_item_id', '=', 'items.id')
                ->select('items.name', 'items.size', 'items.unit', 'items.code', 'item_match_sub_qties.id')
                ->where('item_id', request('id'))->get();


            return response()->json([
                'status' => 201,
                'message' => 'Resource created.',
                'subqty' => $subqty,
                'match' => $match
            ], 201);
        } catch (Exception $e) {
            return $this->responseServerError('Error creating resource.');
        }
    }

    public function AddSubQty(Request $request)
    {
        // Get user from $request token.
        if (!$user = auth()->setRequest($request)->user()) {
            return $this->responseUnauthorized();
        }

        // Warning: Data isn't being fully sanitized yet.
        try {

            $itm = ItemSubQtyUnit::where('item_id', request('item_id'))->first();

            if (is_null($itm)) {
                $itm = ItemSubQtyUnit::create([
                    'item_id' => request('item_id'),
                    'quantity' => request('quantity'),
                    'unit' => request('unit'),
                ]);
            } else {

                $itm = ItemSubQtyUnit::where('item_id', request('item_id'))->firstorfail();
                $itm->quantity = request('quantity');
                $itm->unit = request('unit');
                $itm->save();
            }



            return response()->json([
                'status' => 201,
                'message' => 'Resource created.',
                'id' => $itm->id
            ], 201);
        } catch (Exception $e) {
            return $this->responseServerError('Error creating resource.');
        }
    }

    public function AddMatchItm(Request $request)
    {
        // Get user from $request token.
        if (!$user = auth()->setRequest($request)->user()) {
            return $this->responseUnauthorized();
        }

        // Warning: Data isn't being fully sanitized yet.
        try {
            // $orgitm = Item::where('code', request('item_id'))->firstOrFail();
            $orgitm = Item::where('code', request('code'))->firstOrFail();




            if (is_null($orgitm)) {
                return $this->responseServerError('Error creating resource.');
            } else {

                $itm = ItemMatchSubQty::where('item_id', request('item_id'))->first();

                if (is_null($itm)) {

                    $itm = ItemMatchSubQty::create([
                        'item_id' => request('item_id'),
                        'match_item_id' => $orgitm->id
                    ]);
                } else {

                    $itm = ItemMatchSubQty::where('item_id', request('item_id'))->firstorfail();
                    $itm->match_item_id = $orgitm->id;
                    $itm->save();
                }



                return response()->json([
                    'status' => 201,
                    'message' => 'Resource created.',
                    'name' => $orgitm->name,
                    'item' => [$orgitm],
                    'id' => $itm->id,
                ], 201);
            }
        } catch (Exception $e) {
            return $this->responseServerError('Error creating resource.');
        }
    }

    public function RemoveSubQty(Request $request)
    {
        // Get user from $request token.
        if (!$user = auth()->setRequest($request)->user()) {
            return $this->responseUnauthorized();
        }

        try {

            $itm = ItemSubQtyUnit::where('item_id', request('id'))->firstorfail();
            $itm->delete();
            return response()->json([
                'status' => 204,
                'message' => "Deleted successfully"
            ], 204);
        } catch (Exception $e) {
            return $this->responseServerError('Error deleting resource.');
        }
    }

    public function unlinkmatch(Request $request)
    {
        // Get user from $request token.
        if (!$user = auth()->setRequest($request)->user()) {
            return $this->responseUnauthorized();
        }

        try {

            $itm = ItemMatchSubQty::where('item_id', request('id'))->firstorfail();
            $itm->delete();
            return response()->json([
                'status' => 204,
                'message' => "Deleted successfully"
            ], 204);
        } catch (Exception $e) {
            return $this->responseServerError('Error deleting resource.');
        }
    }

    public function convert(Request $request)
    {
        // Get user from $request token.
        if (!$user = auth()->setRequest($request)->user()) {
            return $this->responseUnauthorized();
        }

        try {
            // $userdet =  User_detail::where('id', $user->user_details_id)->firstOrFail();
            // $branch =  Branch::where('id', request("branch_id"))->firstOrFail();

            $this->ConvReleasing(request("branch_id"), $user->id, request("from_qty"), request("from_item_id"));
            $this->ConvReceiving(request("branch_id"), $user->id, request("to_qty"), request("to_item_id"));

            return response()->json([
                'status' => 204,
                'message' => "Deleted successfully"
            ], 204);
        } catch (Exception $e) {
            return $this->responseServerError('Error deleting resource.');
        }
    }



    function ConvReleasing($branch_id, $user_id, $from_qty, $from_item_id)
    {

        $orgitem =  Item::where('id', $from_item_id)->firstOrFail();

        $count = Item_count::where('item_id', $from_item_id)
            ->where('branch_id', $branch_id)
            ->firstOrFail();

        $old_balance = $count->balance;
        $old_collectible = $count->collectible_amount;

        $count->balance -= $from_qty;
        $count->collectible_amount = $count->balance * $orgitem->unit_price;

        $new = Transaction::create([
            'transaction_type' => "Releasing",
            'accountability' => "Admin",
            'customer_name' => $orgitem->name . "  " . $orgitem->size. " - "  . $orgitem->unit,
            'branch_id' => $branch_id,
            'user_id' => $user_id,
            'date_transac' => date('Y-m-d'),
            'code' => $this->codefunc($user_id),
            'description' => "Conversion",
        ]);

        Transaction_item::create([
            'item_status' => "Released",
            'unit_price' => $orgitem->unit_price,
            'beg_balance' => $old_balance,
            'end_balance' =>  $count->balance,
            'beg_collectible' => $old_collectible,
            'end_collectible' =>  $count->collectible_amount,
            'original_price' => $orgitem->original_price,
            'quantity' => $from_qty,
            'transaction_id' => $new->id,
            'item_id' => $from_item_id,
        ]);

        $count->save();
    }

    function ConvReceiving($branch_id, $user_id, $to_qty, $to_item_id)
    {
        $orgitem =  Item::where('id', $to_item_id)->firstOrFail();

        $count = Item_count::where('item_id', $to_item_id)
            ->where('branch_id', $branch_id)
            ->firstOrFail();

        $old_balance = $count->balance;
        $old_collectible = $count->collectible_amount;

        $count->balance += $to_qty;
        $count->collectible_amount = $count->balance * $orgitem->unit_price;

        $new = Transaction::create([
            'transaction_type' => "Receiving",
            'accountability' => "Admin",
            'customer_name' => $orgitem->name . "  " . $orgitem->size. " - "  . $orgitem->unit,
            'branch_id' => $branch_id,
            'user_id' => $user_id,
            'date_transac' => date('Y-m-d'),
            'code' => $this->codefunc($user_id),
            'description' => "Conversion",
        ]);

        Transaction_item::create([
            'item_status' => "Received",
            'unit_price' => $orgitem->unit_price,
            'beg_balance' => $old_balance,
            'end_balance' =>  $count->balance,
            'beg_collectible' => $old_collectible,
            'end_collectible' =>  $count->collectible_amount,
            'original_price' => $orgitem->original_price,
            'quantity' => $to_qty,
            'transaction_id' => $new->id,
            'item_id' => $to_item_id,
        ]);

        $count->save();
    }

    function codefunc($user_id)
    {
        // transaction code
        $year = date("y");
        $year = substr($year, -2);
        $month = date("m");
        $day = date("d");
        $code = "TR" . $user_id . $year . $day . $month . rand(100, 9999) . "RC";

        return $code;
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
