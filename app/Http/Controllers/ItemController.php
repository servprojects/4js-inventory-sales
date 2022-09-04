<?php

namespace App\Http\Controllers;

use DB;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use App\Http\Controllers\APIController;
use App\Http\Resources\ItemCollection;
use App\Http\Resources\ItemResource;
use App\Item;
use App\Brand;
use App\Item_category;
use App\Unit;
use App\Branch;
use App\Item_count;
use App\Trans_item_backup;
use App\Transaction;
use App\User_detail;
use App\Transaction_item;

class Branchref
{
    public $brnch;
    public $code;
}

class ItemController extends Controller
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

        // $collection = new Item();

        // $collection = $collection->latest()->paginate();

        // return new ItemCollection($collection);

        try {
            $userdet =  User_detail::where('id', $user->user_details_id)->firstOrFail();
            $col4 =  Item::join('brands', 'items.brand_id', '=', 'brands.id')
                ->join('item_categories', 'items.category_id', '=', 'item_categories.id')
                ->whereNull('items.isDisabled')
                ->select('items.*', 'brands.name as brand', 'item_categories.name as category')
                ->get();

            // $col4 =  Item::join('brands', 'items.brand_id', '=', 'brands.id')
            // ->join('item_categories', 'items.category_id', '=', 'item_categories.id')
            // ->select('items.*', 'brands.name as brand', 'item_categories.name as category')
            // ->get();


            // $col4 = $col4->latest()->paginate();

            //  $col4 = DB::table('items')
            //             ->join('brands', 'items.brand_id', '=', 'brands.id')
            //             ->join('item_categories', 'items.category_id', '=', 'item_categories.id')
            //             ->select('items.*', 'brands.name', 'item_categories.name')
            //             ->get();



            // $collection1 = Item::select('items.id', 'items.name', 'items.brand_id', 'items.size', 'items.category_id', 'items.original_price', 'items.unit_price');
            // $collection1 = $collection1->latest()->paginate();

            $itcount = Item::whereNull('items.isDisabled')->select(DB::raw('COUNT(id) as item_count'))->get();
            // $itcount = Item::select(DB::raw('COUNT(id) as item_count'))->get();


            $collection2 = Brand::select('brands.id', 'brands.name');
            $collection2 = $collection2->latest()->paginate();

            $collection3 = Item_category::select('item_categories.id', 'item_categories.name');
            $collection3 = $collection3->latest()->paginate();

            $units = Unit::select('units.*');
            $units = $units->latest()->paginate();

            $categories = Item_category::select('item_categories.*')->get();
            $branches = Branch::select('branches.*')->get();
        } catch (Exception $e) {
        }

        return response()->json([
            'status' => 200,
            // 'items' => $collection1,
            'item_count' => $itcount,
            'brands' => $collection2,
            'itemcats' => $collection3,
            'cols' => $col4,
            'units' => $units,
            'categories' => $categories,
            'branches' => $branches,
            'role' => $userdet->role,
        ], 200);
    }

    public function itemonly(Request $request)
    {
        // Get user from $request token.
        if (!$user = auth()->setRequest($request)->user()) {
            return $this->responseUnauthorized();
        }

        // $collection = new Item();

        // $collection = $collection->latest()->paginate();

        // return new ItemCollection($collection);

        try {
            $userdet =  User_detail::where('id', $user->user_details_id)->firstOrFail();
            $col4 =  Item::join('brands', 'items.brand_id', '=', 'brands.id')
                ->join('item_categories', 'items.category_id', '=', 'item_categories.id')
                ->select('items.*', 'brands.name as brand', 'item_categories.name as category')
                ->get();
        } catch (Exception $e) {
        }

        return response()->json([
            'status' => 200,
            'items' => $col4,
            'role' => $userdet->role,
        ], 200);
    }

    public function itemWbalances(Request $request)
    {
        // Get user from $request token.
        if (!$user = auth()->setRequest($request)->user()) {
            return $this->responseUnauthorized();
        }



        try {
            $userdet =  User_detail::where('id', $user->user_details_id)->firstOrFail();
            $rec = Item_count::join('items', 'item_counts.item_id', '=', 'items.id')
                ->join('brands', 'items.brand_id', '=', 'brands.id');

            $curBranch =  Branch::where('id', $userdet->branch_id)->firstOrFail();

            $rec->select(
                // 'items.*',
                'brands.name as brand',
                'items.name as name',
                'items.code',
                'items.size',
                'items.unit',
                'items.id_no',
                'items.id',
                'item_counts.balance',
                'item_counts.branch_id',


            );
            $rec->where('item_counts.branch_id', '=', $userdet->branch_id);
            $rec->whereNull('items.isDisabled');
            $rec = $rec->get();



        } catch (Exception $e) {
        }

        return response()->json([
            'status' => 200,
            'items' => $rec,
            'curbranch' => $curBranch->name,
            'role' => $userdet->role,
            'hashuserId' => $user->hashid
        ], 200);
    }




    public function getItem(Request $request)
    {
        // Get user from $request token.
        if (!$user = auth()->setRequest($request)->user()) {
            return $this->responseUnauthorized();
        }

        // $collection = new Item();

        // $collection = $collection->latest()->paginate();

        // return new ItemCollection($collection);

        try {
            $col4 =  Item::where('category_id', request('cat_id'))
                ->join('brands', 'items.brand_id', '=', 'brands.id')
                ->join('item_categories', 'items.category_id', '=', 'item_categories.id')
                ->select('items.*', 'brands.name as brand', 'item_categories.name as category')
                ->get();
        } catch (Exception $e) {
        }

        return response()->json([
            'status' => 200,
            'cols' => $col4,

        ], 200);
    }

    public function getOpts(Request $request)
    {
        // Get user from $request token.
        if (!$user = auth()->setRequest($request)->user()) {
            return $this->responseUnauthorized();
        }

        // $collection = new Item();

        // $collection = $collection->latest()->paginate();

        // return new ItemCollection($collection);

        try {
            $brand =  Brand::select('brands.*')->get();
            $cats =  Item_category::select('item_categories.*')->get();
            $units =  Unit::select('units.*')->get();
        } catch (Exception $e) {
        }

        return response()->json([
            'status' => 200,
            'brands' => $brand,
            'cats' => $cats,
            'units' => $units,

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
        if (!$user = auth()->setRequest($request)->user()) {
            return $this->responseUnauthorized();
        }

        // Validate all the required parameters have been sent.
        // $validator = Validator::make($request->all(), [
        //     'name' => 'required',
        //     'brand_id' => 'required',
        //     'size' => 'required',
        //     'category_id' => 'required',
        //     'original_price' => 'required',
        //     'unit_price' => 'required',
        // ]);

        // if ($validator->fails()) {
        //     return $this->responseUnprocessable($validator->errors());
        // }

        // Warning: Data isn't being fully sanitized yet.
        try {
            $size = null;
            if (request('size')) {
                $size = request('size');
            }
            $unit_price = 0;
            if (request('unit_price')) {
                $unit_price = request('unit_price');
            }

            // $year = date("y");
            // $year = substr($year, -2);
            // $month = date("m");
            // $day = date("d");
            // $random = rand(0, 9999);
            // if (strlen($random) == 1) {
            //     $random = "000" . $random;
            // } else if (strlen($random) == 2) {
            //     $random = "00" . $random;
            // } else if (strlen($random) == 3) {
            //     $random = "0" . $random;
            // }
            // $code = "IT" . request('category_id') . request('brand_id') . $day . $month . $random;
            // generate code
            // $year = date("y");
            // $year = substr($year, -2);
            // $month = date("m");
            // $day = date("d");

            // $random = rand(0, 9999);
            // if (strlen($random) == 1) {
            //     $random = "000" . $random;
            // } else if (strlen($random) == 2) {
            //     $random = "00" . $random;
            // } else if (strlen($random) == 3) {
            //     $random = "0" . $random;
            // }


            // // $code = "ITM-" . $day . $month . $year . "-" . $random . "-" . substr($category_name, 0, 3);
            // $code = "ITM" . $day . $month . $year . "" . $random;
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

            $item = Item::create([
                'id_no' => request('id_no'),
                'name' => request('name'),
                'brand_id' => request('brand_id'),
                'size' => $size,
                'category_id' => request('category_id'),
                'original_price' => request('original_price'),
                'unit' => request('unit'),
                'unit_price' => $unit_price,
                'code' => $code,
            ]);

            $brand = Brand::select('name as brand')
                ->where('id', "" . request('brand_id') . "")
                ->get();

            $category = Item_category::select('name as category')
                ->where('id', "" . request('category_id') . "")
                ->get();

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

                $codeTr =  $this->gecode("IMP") . "-" . $br->id;
                $trt = $this->addtrans($br->name, $user->id, $br->id, $codeTr, date("Y-m-d"), "Import");
                $this->addTransItems($unit_price, request('original_price'),  0, $trt, null, $item->id, "Import");
            }

            $collection1 =  Item::join('brands', 'items.brand_id', '=', 'brands.id')
                ->join('item_categories', 'items.category_id', '=', 'item_categories.id')
                ->select('items.*', 'brands.name as brand', 'item_categories.name as category')
                ->get();

            return response()->json([
                'status' => 201,
                'message' => 'Resource created.',
                'id' => $item->id,
                'brand' => $brand,
                'category' => $category,
                'items' => $collection1
            ], 201);
        } catch (Exception $e) {
            echo $e;
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
    public function importItem(Request $request)
    {
        if (!$user = auth()->setRequest($request)->user()) {
            return $this->responseUnauthorized();
        }
        try {
            // $itmObj = (array)json_decode(request('items'));
            $itmObj = json_decode(request('items'), true);
            // if (is_array($itmObj) || is_object($itmObj)) {

            $branch = Branch::select('branches.*')
                ->get();
            $impTrans = [];
            foreach ($branch as $br) {
                $codeTr =  $this->gecode("IMP") . "-" . $br->id;
                $this->addtrans($br->name, $user->id, $br->id, $codeTr, date("Y-m-d"), "Import");
                $parts = new Branchref();
                $parts->brnch = $br->id;
                $parts->code =  $codeTr;
                // $itms[] = $parts;
                $impTrans[] = $parts;
            }
            $impTransE = json_encode($impTrans);
            $brnchObj = json_decode($impTransE, true);

            foreach ($itmObj as $itm) {

                if (!$itm["id"] == "") {


                    //get brand id
                    $brand_id = 1;
                    if ($itm["brand"]) {
                        $brand =  Brand::where('name', $itm["brand"])->first();
                        if (is_null($brand)) {
                            $brandNew = Brand::create([
                                'name' => $itm["brand"],
                            ]);
                            $brand_id = $brandNew->id;
                        } else {
                            $brand_id = $brand->id;
                        }
                    }
                    //get category id
                    $category_id = 1;
                    $category_name = $itm["category"];
                    if ($itm["category"]) {
                        $category =  Item_category::where('name', $itm["category"])->first();
                        if (is_null($category)) {
                            $categoryNew = Item_category::create([
                                'name' => $itm["category"],
                            ]);
                            $category_id = $categoryNew->id;
                        } else {
                            $category_name = $category->name;
                            $category_id = $category->id;
                        }
                    }

                    //get unit 
                    $unit_abv = null;
                    if ($itm["unit"]) {
                        $unit =  Unit::Where('abv', $itm["unit"])
                            ->orWhere('name', $itm["unit"])->first();
                        if (is_null($unit)) {
                            $unitNew = Unit::create([
                                'name' => $itm["unit"],
                                'abv' => $itm["unit"],
                            ]);
                            $unit_abv =  $itm["unit"];
                        } else {
                            $unit_abv = $unit->abv;
                        }
                    }

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


                    // check if the id exist
                    $oldcode =  Item::where('code', $code)->first();
                    if ($oldcode) {
                        if (strlen($day) == 1) {
                            $day = "0" . $day;
                        }
                        $random = rand(1111111111, 9999999999);
                        $code = "ITM" . $random . $day;
                    }


                    $item_name = $itm["name"];

                    $newItem =  Item::where('name', $itm["name"])->first();
                    if ($newItem) {
                        $randomItem = rand(100, 999);
                        $item_name = $itm["name"] . " (Duplicate)#" . $randomItem;
                    }


                    // insert new item
                    $item = Item::create([
                        'name' => $item_name,
                        'brand_id' => $brand_id,
                        'size' => $itm["measurement"],
                        'category_id' => $category_id,
                        'original_price' => $itm["original_price"],
                        'unit' => $unit_abv,
                        'unit_price' => $itm["srp"],
                        'code' => substr($itm["code"], 0, 3) == "ITM" ? $itm["code"] : $code,
                    ]);

                    $branch = Branch::select('branches.*')
                        ->get();

                    $dateb1 = date_create($itm["date_counted1"]);
                    $dateb2 = date_create($itm["date_counted2"]);

                    // $dateb1 = strtr($itm["date_counted1"], '/', '-');
                    // $dateb2 = strtr($itm["date_counted2"], '/', '-');

                    // $dateb1 = str_replace('/', '-', $itm["date_counted1"]);
                    // $dateb2 = str_replace('/', '-', $itm["date_counted2"]);  

                    $db1 = date_format($dateb1, "Y-m-d");
                    $db2 = date_format($dateb2, "Y-m-d");

                    // $db1 = date('Y-m-d', $dateb1);
                    // $db2 = date('Y-m-d', $dateb2);

                    // $db1 = date('Y-m-d', strtotime($dateb1));
                    // $db2 = date('Y-m-d', strtotime($dateb2));

                    foreach ($branch as $br) {
                        $bal = 0;
                        $col = 0;
                        $timeCreate = null;
                        if (!$itm["beg_bal1"] == "") {
                            if (request("branch1")) {
                                if (request("branch1") == $br->id) {
                                    $bal = $itm["beg_bal1"];
                                    $col = $itm["beg_bal1"] * $itm["srp"];
                                    $timeCreate = $db1 == " " ? date("Y-m-d H:i:s") : $db1;
                                    // $timeCreate =  date("Y-m-d H:i:s")  ;
                                }
                            }
                        }

                        // if (!$itm["beg_bal1"] == "") {
                        if (!$itm["beg_bal2"] == "") {
                            if (request("branch2")) {
                                if (request("branch2") == $br->id) {
                                    $bal = $itm["beg_bal2"];
                                    $col = $itm["beg_bal2"] * $itm["srp"];
                                    $timeCreate = $db2 == " " ? date("Y-m-d H:i:s") : $db2;
                                    // $timeCreate = date("Y-m-d H:i:s");
                                }
                            }
                        }

                        $newCount = Item_count::create([
                            'item_id' => $item->id,
                            'balance' => $bal,
                            'collectible_amount' => $col,
                            // 'threshold' => 0,
                            'begbal_created_at' => $timeCreate,
                            'begbal_updated_at' => $timeCreate,
                            'threshold' => 10,
                            'branch_id' => $br->id,
                        ]);



                        foreach ($brnchObj as $btc) {
                            if ($btc["brnch"] == $br->id) {
                                $brcode = $btc["code"];
                            }
                        }
                        $trt =  Transaction::where('code', $brcode)->firstOrFail();
                        $this->addTransItems($itm["srp"], $itm["original_price"],  $bal, $trt->id, null, $item->id, "Import");
                    }
                }
                // }
                // return response()->json([
                //     'status' => 200,
                //     'brand_id' =>  $brand_id,
                //     'category_id' =>  $category_id,
                //     'unit' =>  $unit_abv,
                //     'item' =>  $item->id,
                //     'item_count' => $newCount,
                //     'code' => $code,
                // ], 200);
                // }
            }
            return response()->json([
                'status' => 200,
                // 'brand_id' =>  $brand_id,
                // 'category_id' =>  $category_id,
                // 'unit' =>  $unit_abv,
                // 'item' =>  $item->id,
                // 'item_count' => $newCount,
                'code' => $code,
            ], 200);
        } catch (Exception $e) {
            echo $e;
            return $this->responseServerError('Error updating resource.');
        }
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

        // Validates data.
        // $validator = Validator::make($request->all(), [
        //     'name' => 'string',
        //     'project_desc' => 'string',
        //     'location' => 'string'
        // ]);

        // if ($validator->fails()) {
        //     return $this->responseUnprocessable($validator->errors());
        // }

        try {

            $item = Item::where('id', $id)->firstOrFail();
            $oldOrgPrice =  $item->original_price;

            if (request('name')) {
                $item->name = request('name');
            }
            if (request('brand_id')) {
                $item->brand_id =  request('brand_id');
            }
            if (request('size')) {
                $item->size = request('size');
            }
            if (request('category_id')) {
                $item->category_id = request('category_id');
            }
            if (request('original_price')) {
                $item->original_price = request('original_price');
            }
            if (request('unit_price')) {
                $item->unit_price = request('unit_price');
            }
            if (request('unit')) {
                $item->unit = request('unit');
            }
            if (request('id_no')) {
                $item->id_no = request('id_no');
            }

            if (request('threshold')) {
               Item_count::where('item_id', $id)->update(['threshold' => request('threshold')]);
               
            }

            $item->save();

            $updateditem = Item::where('id', $id)->firstOrFail();
            
            if (request('unit_price') || request('original_price')) {
                // get branch
                $userdet =  User_detail::where('id', $user->user_details_id)->firstOrFail();
                // $item = Item::where('id', $id)->firstOrFail();
                // updated collectible based on new unit price
                $branch = Branch::select('branches.*')->get();
                foreach ($branch as $b) {

                    $count = Item_count::where('item_id', $id)
                        ->where('branch_id', $b['id'])
                        ->get();
                    // $count[0]->collectible_amount += $count[0]->balance * $updateditem->unit_price;
                    $oldcol = $count[0]->collectible_amount;
                    // $newCollect = $count[0]->collectible_amount + ($count[0]->balance * $updateditem->unit_price);
                    $newCollect = $count[0]->balance * $updateditem->unit_price;

                    $NewCount = Item_count::where('item_id', $id)->where('branch_id', $b['id'])->firstOrFail();
                    $NewCount->collectible_amount = $newCollect;
                    $NewCount->save();

                  



                    //save transaction

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
                        'user_id' => $user->id,
                        'branch_id' => $b['id'],
                        'code' => $code,
                        'date_transac' => date('Y-m-d'),
                        'customer_name' => $updateditem->name,
                        'accountability' => "Admin",
                        'description' => request('unit_price') ? "Unit Price" : "Original Price",


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

                    // save transaction
                }
            }

            $col4 =  Item::join('brands', 'items.brand_id', '=', 'brands.id')
                ->join('item_categories', 'items.category_id', '=', 'item_categories.id')
                ->select('items.*', 'brands.name as brand', 'item_categories.name as category')
                ->get();

            // return $this->responseResourceUpdated();
            return response()->json([
                'status' => 200,
                'message' => 'Update successful',
                'updated' => $col4,
            ], 200);
        } catch (Exception $e) {
            echo $e;
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

            $transaction = Transaction_item::where('item_id', '=', $id)
                ->where('item_status', '!=', "Import")
                ->where('item_status', '!=', "Update")
                ->first();


            $branch = Item_count::where('item_counts.item_id', '=', $id)
            ->select('item_counts.*')
            ->get();


            // if (!empty($transaction)) {
            //     return response()->json([
            //         'status' => 0,
            //         // 'amount' => $amount,
            //     ], 0);
            // }

            if (!empty($transaction)) {

                $amountWt = 0;
                foreach ($branch as $br) {
                    // $amount += $br->collectible_amount;
                    $amountWt += $br['balance'];
                }

                if ($amountWt > 0) {
                    return response()->json([
                        'status' => 0,
                    ], 200);
                }else{

                    $disItem =  Item::where('id', '=', $id)->first();

                    $disItem->isDisabled = 1;
                    $disItem->save();

                    return response()->json([
                        'status' => 2,
                    ], 200);
                }
            }



         
                
            // $branch = Item_count::join('branches', 'item_counts.branch_id', '=', 'branches.id')
            //     ->where('item_counts.item_id', '=', $id)
            //     ->select('item_counts.*')
            //     ->get();

            $amount = 0;
            foreach ($branch as $br) {
                // $amount += $br->collectible_amount;
                $amount += $br['balance'];
            }

            if ($amount > 0) {
                return response()->json([
                    'status' => 0,
                    'amount' => $amount,
                ], 0);
            } else if ($amount == 0) {

                $olditem =  Item::join('brands', 'items.brand_id', '=', 'brands.id')
                    ->join('item_categories', 'items.category_id', '=', 'item_categories.id')
                    ->select('items.*', 'brands.name as brand', 'item_categories.name as category')
                    ->where('items.id', '=', $id)
                    ->get();

                Trans_item_backup::create([
                    'code' => $olditem[0]->code,
                    'items' => $olditem,
                    'type' => "Item Delete",
                    'trans_payable' => "[]",
                    'credit_balance' => "[]",
                    'item_balances' => "[]",
                ]);



                $mainTrans =  Transaction_item::where('item_id', '=', $id)->get();


                foreach ($mainTrans as $mt) {
                    $mainTransDel =  Transaction::where('id', '=', $mt["transaction_id"]);
                    $mainTransDel->delete();
                }

                $transDel =  Transaction_item::where('item_id', '=', $id);
                $transDel->delete();

                $count = Item_count::where('item_id', $id);
                $count->delete();

                $item = Item::where('id', $id)->firstOrFail();
                $item->delete();

                // // return $this->responseResourceDeleted();
                return response()->json([
                    'status' => 204,
                    'message' => "Deleted successfully",
                    'amount' => $amount

                ], 204);
            }
        } catch (Exception $e) {
            return $this->responseServerError('Error deleting resource.');
        }
    }
    function addtrans($branch, $user_id, $branch_id, $code, $date, $type)
    {
        $new = Transaction::create([
            'transaction_type' => $type,
            'accountability' => "Admin",
            'customer_name' => $branch,
            'user_id' => $user_id,
            'branch_id' => $branch_id,
            'code' => $code,
            'date_transac' =>  date('Y-m-d', strtotime($date)),
            'payable' => 0,
        ]);

        return $new->id;
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
    function addTransItems($unit_price, $org_price,  $qty, $trans, $sup, $itm, $type)
    {
        $new = Transaction_item::create([
            'item_status' => $type,
            'unit_price' => $unit_price,
            'original_price' => $org_price,
            'quantity' => $qty,
            'transaction_id' => $trans,
            'supplier_id' => $sup,
            'item_id' => $itm,
            'beg_balance' => 0,
            'end_balance' => $qty,
            'beg_collectible' => 0,
            'end_collectible' => $qty * $unit_price,
        ]);

        return $new->id;
    }
}
