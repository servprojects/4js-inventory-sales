<?php

namespace App\Http\Controllers;

use App\Branch;
use App\Brand;
use App\Item;
use App\Item_category;
use App\Item_count;
use App\Supplier;
use App\Transaction;
use App\Transaction_item;
use App\Unit;
use App\UpdateHistory;
use DateTime;
use DateTimeZone;
use Illuminate\Http\Request;
use stdClass;

class UpdateHistoryController extends Controller
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
    public function store(Request $request)
    {
        // Get user from $request token.
        if (!$user = auth()->setRequest($request)->user()) {
            return $this->responseUnauthorized();
        }
        try {
            $dateup = new DateTime("now", new DateTimeZone('Asia/Manila'));
            $dup = $dateup->format('Y-m-d h:m:s');

            $MAC = exec('getmac');
            $MAC = strtok($MAC, ' ');

            $data = json_decode(request('data'), true);



            $report = array();
            foreach ($data as $d) {
                array_push($report,  $this->upBranches($d['branch']));
                array_push($report,  $this->upSupplier($d['suppliers']));
                array_push($report,  $this->upCategory($d['categories']));
                array_push($report,  $this->upBrand($d['brand']));
                array_push($report,  $this->upUnit($d['units']));
                array_push($report,  $this->upItem($d['items'], $user->id));
            }



            $new = UpdateHistory::create([
                'update_dateTime' => $dup,
                'macaddress' => $MAC,
                'user_id' => $user->id,
                'update_through' => 'update_button',
                'report' => json_encode($report),
            ]);




            return response()->json([
                'status' => 201,
                'message' => 'This the result',
            ], 201);
        } catch (Exception $e) {
            return $this->responseServerError('Error creating resource.');
        }
    }

    function upBranches($data)
    {
        // $data = json_decode($jdata, true); //new

        $add = 0;
        $update = 0;
        foreach ($data as $d) {
            $check = Branch::where('id', $d['id'])->first();

            if (!is_null($check)) {
                $checkIN = Branch::where(
                    [
                        ['id', $d['id']],
                        ['name', $d['name']],
                        ['location', $d['location']],
                        ['isDisabled', $d['isDisabled']]
                    ]
                )->first();

                if (is_null($checkIN)) {
                    $update += 1;
                    $check->name = $d['name'];
                    $check->location = $d['location'];
                    $check->isDisabled = $d['isDisabled'];
                    $check->save();
                }
            } else {
                $add += 1;
                $branch = Branch::create([
                    'id' => $d['id'],
                    'name' => $d['name'],
                    'location' => $d['location'],
                    'balance' => 0
                ]);

                // Adding of items here
            }
        }

        $updata = new stdClass();
        $updata->add = $add;
        $updata->update = $update;

        $main = new stdClass();
        $main->name = 'branches';
        $main->data =  $updata;

        return $main;
    }

    function upSupplier($data)
    {
        $add = 0;
        $update = 0;
        foreach ($data as $d) {
            $check = Supplier::where('id', $d['id'])->first();

            if (!is_null($check)) {
                $checkIN = Supplier::where(
                    [
                        ['id', $d['id']],
                        ['name', $d['name']],
                        ['address', $d['address']]
                    ]
                )->first();

                if (is_null($checkIN)) {
                    $update += 1;
                    $check->name = $d['name'];
                    $check->address = $d['address'];
                    $check->save();
                }
            } else {
                $add += 1;
                $supplier = Supplier::create([
                    'id' => $d['id'],
                    'name' => $d['name'],
                    'address' => $d['address'],
                    'balance' => 0
                ]);
            }

           
        }

        $updata = new stdClass();
        $updata->add = $add;
        $updata->update = $update;

        $main = new stdClass();
        $main->name = 'suppliers';
        $main->data =  $updata;

        return $main;
    }


    function upItem($data, $user_id)
    {
        $add = 0;
        $update = 0;
        foreach ($data as $d) {
            $check = Item::where('id', $d['id'])->first();

            if (!is_null($check)) {
                $checkIN = Item::where(
                    [
                        ['id', $d['id']],
                        ['name', $d['name']],
                        ['brand_id', $d['brand_id']],
                        ['size', $d['size']],
                        ['category_id', $d['category_id']],
                        ['original_price', $d['original_price']],
                        ['unit_price', $d['unit_price']],
                        ['unit', $d['unit']],
                        ['id_no', $d['id_no']],
                        ['isDisabled', $d['isDisabled']]
                    ]
                )->first();

                if (is_null($checkIN)) {
                    $update += 1;
                    $check->name = $d['name'];
                    $check->brand_id = $d['brand_id'];
                    $check->size = $d['size'];
                    $check->category_id = $d['category_id'];
                    $check->original_price = $d['original_price'];
                    $check->unit_price = $d['unit_price'];
                    $check->unit = $d['unit'];
                    $check->id_no = $d['id_no'];
                    $check->isDisabled = $d['isDisabled'];
                    $check->save();
                }
            } else {
                $add += 1;
                $this->addItem($d, $user_id);
            }

            
        }

        $updata = new stdClass();
            $updata->add = $add;
            $updata->update = $update;

            $main = new stdClass();
            $main->name = 'items';
            $main->data =  $updata;

            return $main;
    }


    function addItem($d, $user_id)
    {
        $size = null;
        if ($d['size']) {
            $size =$d['size'];
        }
        $unit_price = 0;
        if ($d['unit_price']) {
            $unit_price = $d['unit_price'];
        }

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
            'id' => $d['id'],
            'id_no' =>$d['id_no'],
            'name' => $d['name'],
            'brand_id' => $d['brand_id'],
            'size' => $size,
            'category_id' =>$d['category_id'],
            'original_price' => $d['original_price'],
            'unit' => $d['unit'],
            'unit_price' => $d['unit_price'],
            'code' => $code,
        ]);

        $branch = Branch::select('branches.*')
            ->get();

        foreach ($branch as $br) {
            Item_count::create([
                'item_id' => $d['id'],
                'balance' => 0,
                'collectible_amount' => 0,
                'threshold' => 0,
                'branch_id' => $br->id,
            ]);

            $codeTr =  $this->gecode("IMP") . "-" . $br->id;
            $trt = $this->addtrans($br->name, $user_id, $br->id, $codeTr, date("Y-m-d"), "Import");
            $this->addTransItems($unit_price, request('original_price'),  0, $trt, null, $item->id, "Import");
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

    function upCategory($data)
    {
        $add = 0;
        $update = 0;
        foreach ($data as $d) {
            $check = Item_category::where('id', $d['id'])->first();

            if (!is_null($check)) {
                $checkIN = Item_category::where(
                    [
                        ['id', $d['id']],
                        ['name', $d['name']]
                    ]
                )->first();

                if (is_null($checkIN)) {
                    $update += 1;
                    $check->name = $d['name'];
                    $check->save();
                }
            } else {
                $add += 1;
                $itemcat = Item_category::create([
                    'name' => request('name'),
                ]);
            }

           
        }

        $updata = new stdClass();
        $updata->add = $add;
        $updata->update = $update;

        $main = new stdClass();
        $main->name = 'categories';
        $main->data =  $updata;

        return $main;
    }

    function upBrand($data)
    {
        $add = 0;
        $update = 0;
        foreach ($data as $d) {
            $check = Brand::where('id', $d['id'])->first();

            if (!is_null($check)) {
                $checkIN = Brand::where(
                    [
                        ['id', $d['id']],
                        ['name', $d['name']]
                    ]
                )->first();

                if (is_null($checkIN)) {
                    $update += 1;
                    $check->name = $d['name'];
                    $check->save();
                }
            } else {
                $add += 1;
                $itemcat = Brand::create([
                    'name' => $d['name'],
                ]);
            }

        }

        
        $updata = new stdClass();
        $updata->add = $add;
        $updata->update = $update;

        $main = new stdClass();
        $main->name = 'brands';
        $main->data =  $updata;

        return $main;
    }


    function upUnit($data)
    {
        $add = 0;
        $update = 0;
        foreach ($data as $d) {
            $check = Unit::where('id', $d['id'])->first();

            if (!is_null($check)) {
                $checkIN = Unit::where(
                    [
                        ['id', $d['id']],
                        ['name', $d['name']],
                        ['abv', $d['abv']]
                    ]
                )->first();

                if (is_null($checkIN)) {
                    $update += 1;
                    $check->name = $d['name'];
                    $check->abv = $d['abv'];
                    $check->save();
                }
            } else {
                $add += 1;
                $unit = Unit::create([
                    'name' => $d['name'],
                    'abv' => $d['abv'],
                ]);
            }

        }

        
        $updata = new stdClass();
        $updata->add = $add;
        $updata->update = $update;

        $main = new stdClass();
        $main->name = 'units';
        $main->data =  $updata;

        return $main;
    }



    /**
     * Display the specified resource.
     *
     * @param  \App\UpdateHistory  $updateHistory
     * @return \Illuminate\Http\Response
     */
    public function show(UpdateHistory $updateHistory)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param  \App\UpdateHistory  $updateHistory
     * @return \Illuminate\Http\Response
     */
    public function edit(UpdateHistory $updateHistory)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\UpdateHistory  $updateHistory
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, UpdateHistory $updateHistory)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  \App\UpdateHistory  $updateHistory
     * @return \Illuminate\Http\Response
     */
    public function destroy(UpdateHistory $updateHistory)
    {
        //
    }
}
