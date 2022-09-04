<?php

namespace App\Http\Controllers;

use App\Branch;
use App\Item;
use App\Item_category;
use App\Item_count;
use App\PhysicalCount;
use DateTime;
use DateTimeZone;
use Illuminate\Http\Request;
use DB;

class PhysCntController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request)
    {
        if (!$user = auth()->setRequest($request)->user()) {
            return $this->responseUnauthorized();
        }

        try {
            $branch = Branch::select('branches.id', 'branches.name')->where('branches.isDisabled', '!=', 1)->get();

            $allphys = PhysicalCount::join('branches', 'physical_counts.branch_id', '=', 'branches.id')
                ->select('physical_counts.id', 'physical_counts.date', 'branches.name', 'branches.id as branch_id', 'physical_counts.live_update', 'physical_counts.description')->get();
        } catch (Exception $e) {
            // return $this->responseServerError('Error updating resource.');
        }
        return response()->json([
            'status' => 200,
            'message' => 'Update successful',
            'branch' => $branch,
            'allphys' => $allphys,

        ], 200);
    }
    public function getItems(Request $request)
    {
        if (!$user = auth()->setRequest($request)->user()) {
            return $this->responseUnauthorized();
        }

        try {
            $dateup = new DateTime("now", new DateTimeZone('Asia/Manila'));
            $dup = $dateup->format('Y-m-d H:i:s');

            $phys = PhysicalCount::where('id', request('id'))->firstOrFail();

            if ($phys->live_update == "yes") {

                $itcount = Item_count::join('items', 'item_counts.item_id', '=', 'items.id')
                    ->join('brands', 'items.brand_id', '=', 'brands.id')
                    ->where('branch_id', '=', request('branch_id'))
                    ->whereNull('items.isDisabled')
                    ->select(
                        'item_counts.item_id',
                        'items.code',
                        'brands.name as brand',
                        'items.size',
                        'items.unit',
                        'items.name',
                        'items.category_id',
                        'balance as sys_count',
                        DB::raw('(0) as phys_count'),
                        DB::raw('"NM" as date_mod'),
                        'items.unit_price',
                        'items.original_price',

                    )->get();

                $jnew = json_encode($itcount);
                $data = json_decode($jnew, true);
                $dataold = json_decode($phys->items, true);

                foreach ($data as $key => $value) {
                    foreach ($dataold as $keyold => $valueold) {

                        if ($value['code'] == $valueold['code']) {
                            $data[$key]['phys_count'] =  $valueold['phys_count'];
                            $data[$key]['date_mod'] =  $valueold['date_mod'];
                        }
                    }
                }


                $data = json_encode($data);



                $phys->syscount_date =  $dup;

                $phys->old_items =  $phys->items;
                $phys->items =  $data;

                $phys->save();
            }

            $allphys = PhysicalCount::join('branches', 'physical_counts.branch_id', '=', 'branches.id')
                ->where('physical_counts.id', '=', request('id'))
                ->select('physical_counts.id', 'physical_counts.date', 'branches.name', 'physical_counts.live_update', 'physical_counts.syscount_date')->get();

            $allphysItems = PhysicalCount::where('physical_counts.id', '=', request('id'))
                ->select('physical_counts.items', 'physical_counts.old_items')->get();

            $origItems = Item::select('items.*')->get();
            $cat = Item_category::select('item_categories.*')->get();
        } catch (Exception $e) {
            // return $this->responseServerError('Error updating resource.');
        }
        return response()->json([
            'status' => 200,
            'message' => 'Update successful',
            'allphys' => $allphys,
            'origItems' => $origItems,
            'allItems' => json_decode($allphysItems[0]->items, true),
            'oldallItems' => json_decode($allphysItems[0]->old_items, true),
            'categories' => $cat
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
        if (!$user = auth()->setRequest($request)->user()) {
            return $this->responseUnauthorized();
        }

        try {
            $dateup = new DateTime("now", new DateTimeZone('Asia/Manila'));
            $dup = $dateup->format('Y-m-d H:i:s');

            $itcount = Item_count::join('items', 'item_counts.item_id', '=', 'items.id')
                ->join('brands', 'items.brand_id', '=', 'brands.id')
                ->where('branch_id', '=', request('branch_id'))
                ->whereNull('items.isDisabled')
                ->select(
                    'item_counts.item_id',
                    'items.code',
                    'brands.name as brand',
                    'items.size',
                    'items.unit',
                    'items.unit_price',
                    'items.original_price',
                    'items.name',
                    'items.category_id',
                    'balance as sys_count',
                    DB::raw('(0) as phys_count'),
                    DB::raw('"NM" as date_mod')
                )
                ->get();

            $curd = date("Y-m-d");
            $new = PhysicalCount::create([
                'branch_id' => request('branch_id'),
                'date' => $curd,
                'items' => $itcount,
                'live_update' => "yes",
                'syscount_date' => $dup,
            ]);

            // $physcounts =  PhysicalCount::select('physical_counts.*')->get();
            $allphys = PhysicalCount::join('branches', 'physical_counts.branch_id', '=', 'branches.id')
                ->select('physical_counts.id', 'physical_counts.date', 'branches.name', 'physical_counts.live_update')->get();
        } catch (Exception $e) {
        }

        return response()->json([
            'status' => 200,
            'message' => 'Update successful',
            // 'physcounts' => $physcounts,
            'allphys' => $allphys,


        ], 200);
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
        // Get user from $request token.
        if (!$user = auth()->setRequest($request)->user()) {
            return $this->responseUnauthorized();
        }


        try {
            $phys = PhysicalCount::where('id', $id)->firstOrFail();

            if (request('prevData') == "yes") {
                $phys->old_items =  $phys->items;
                $phys->live_update =  "no";
            }
            if (request('items')) {
                $phys->items = request('items');
            }


            $phys->save();
            // return $this->responseResourceUpdated();

            return response()->json([
                'status' => 200,
                'message' => 'Update successful',

            ], 200);
        } catch (Exception $e) {
            return $this->responseServerError('Error updating resource.');
        }
    }
    public function upLiveUp(Request $request)
    {
        // Get user from $request token.
        if (!$user = auth()->setRequest($request)->user()) {
            return $this->responseUnauthorized();
        }


        try {
            $phys = PhysicalCount::where('id', request('id'))->firstOrFail();


            $phys->live_update = $phys->live_update == "yes" ? "no" : "yes";



            $phys->save();
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
    public function destroy(Request $request, $id)
    {
        // Get user from $request token.
        if (!$user = auth()->setRequest($request)->user()) {
            return $this->responseUnauthorized();
        }






        try {
            $phys = PhysicalCount::where('id', $id)->firstOrFail();


            $phys->delete();
            // return $this->responseResourceDeleted();
            return response()->json([
                'status' => 204,
                'message' => "Deleted successfully"
            ], 204);
        } catch (Exception $e) {
            return $this->responseServerError('Error deleting resource.');
        }
    }
}
