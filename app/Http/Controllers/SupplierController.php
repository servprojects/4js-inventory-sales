<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use App\Http\Controllers\APIController;
use App\Http\Resources\SupplierCollection;
use App\Http\Resources\SupplierResource;
use App\Supplier;
use App\Transaction;
use App\Transaction_item;
use App\User_detail;

class SupplierController extends Controller
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

        // $collection = new Supplier();
        $collection = Supplier::select('suppliers.*')->where('id', '!=', 1)->get();

        // $collection = $collection->latest()->paginate();

        // return new SupplierCollection($collection);
        $userdet =  User_detail::where('id', $user->user_details_id)->firstOrFail();  // get branch
        return response()->json([
            'status' => 200,
            'role' => $userdet->role,
            'suppliers' => $collection,
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

        // // Validate all the required parameters have been sent.
        // $validator = Validator::make($request->all(), [
        //     'name' => 'required',
        //     'address' => 'required'
        // ]);

        // if ($validator->fails()) {
        //     return $this->responseUnprocessable($validator->errors());
        // }

        // Warning: Data isn't being fully sanitized yet.
        try {
            $supplier = Supplier::create([
                'name' => request('name'),
                'address' => request('address'),
                'balance' => 0
            ]);
            return response()->json([
                'status' => 201,
                'message' => 'Resource created.',
                'id' => $supplier->id
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
    public function update(Request $request, $id)
    {
        // Get user from $request token.
        if (!$user = auth()->setRequest($request)->user()) {
            return $this->responseUnauthorized();
        }

        // Validates data.
        // $validator = Validator::make($request->all(), [
        //     'name' => 'string',
        //     'address' => 'string'
        // ]);

        // if ($validator->fails()) {
        //     return $this->responseUnprocessable($validator->errors());
        // }

        try {
            $supplier = Supplier::where('id', $id)->firstOrFail();

            if (request('name')) {
                $supplier->name = request('name');
            }
            
            if (request('address')) {
            $supplier->address = request('address');
            }

            $supplier->save();

            // $collection = Supplier::select('suppliers.*')->where('id', '!=', 1);
            // $collection = $collection->latest()->paginate();

            // return $this->responseResourceUpdated();
            $collection = Supplier::select('suppliers.*')->where('id', '!=', 1)->get();
            return response()->json([
                'status' => 200,
                'message' => 'Update successful',
                'updated' => $collection
            ], 200);
        } catch (Exception $e) {
            return $this->responseServerError('Error updating resource.');
        }
    }
    public function importSupplier(Request $request)
    {
        if (!$user = auth()->setRequest($request)->user()) {
            return $this->responseUnauthorized();
        }
        try {
            // $itmObj = (array)json_decode(request('items'));
            $itmObj = json_decode(request('items'), true);
            // if (is_array($itmObj) || is_object($itmObj)) {
            foreach ($itmObj as $itm) {

                if (!$itm["id"] == "") {

                    $item_name = $itm["name"];

                    $newItem =  Supplier::where('name', $itm["name"])->first();
                    if ($newItem) {
                        $randomItem = rand(100, 999);
                        $item_name = $itm["name"] . " (Duplicate)#" . $randomItem;
                    }
                    $add = " ";
                    if (!$itm["address"] == "") {
                        $add = $itm["address"];
                    }

                    $bal = 0;
                    if (!$itm["balance"] == "") {
                        $bal = $itm["balance"];
                    }

                    // insert new item
                    $sup = Supplier::create([
                        'name' =>  $item_name,
                        'address' => $add,
                        'balance' => $bal
                    ]);
                }
            }
            return response()->json([
                'status' => 200,
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

        $supplier = Supplier::where('id', $id)->firstOrFail();



        try {
            $transaction = Transaction_item::where('supplier_id', '=', $id)->first();

            if (!empty($transaction)) {
                return response()->json([
                    'status' => 0,

                ], 0);
            } else {
                $supplier->delete();
                // return $this->responseResourceDeleted();
                return response()->json([
                    'status' => 204,
                    'message' => "Deleted successfully"
                ], 204);
            }
        } catch (Exception $e) {
            return $this->responseServerError('Error deleting resource.');
        }
    }

    public function updateBalance(Request $request)
    {
        // Get user from $request token.
        if (!$user = auth()->setRequest($request)->user()) {
            return $this->responseUnauthorized();
        }



        try {
            $userdet =  User_detail::where('id', $user->user_details_id)->firstOrFail();

            
            // $transitm =  Transaction::where('office_id', request('office_id'))->where('transaction_type', '!=' , 'Update')->first();


            // if (is_null($transitm)) {
               $sup =  Supplier::where('id', request('sup_id'))->firstOrFail();


                $oldbal = $sup->balance;
                $sup->balance = request('newbal');

                $sup->save();

                // generate code

                $day = date("d");

                $random = rand(1111111111, 9999999999);
                if (strlen($day) == 1) {
                    $day = "0" . $day;
                }
                $code = "UPSP" . $random . $day;


                // check if the id exist
                $oldcode =  Transaction::where('code', $code)->first();
                if ($oldcode) {
                    if (strlen($day) == 1) {
                        $day = "0" . $day;
                    }
                    $random = rand(1111111111, 9999999999);
                    $code = "UPSP" . $random . $day;
                }
                // generate code

             
              
                $new = Transaction::create([
                    'transaction_type' => "Update",
                    'user_id' => $user->id,
                    'branch_id' => $userdet->branch_id,
                    'code' => $code,
                    'date_transac' => date('Y-m-d'),
                    'customer_name' => $sup->name,
                    'accountability' => "Supplier",
                    'payable' =>  request('newbal'),
                    'supplier_id' =>  $sup->id,
                    'beg_charge_bal' =>  $oldbal,
                    'end_charge_bal' =>  request('newbal'),
                    'description' =>  request('reason'),

                ]);


                $status = 200;
                $message = 'Update successful';
            // } else {
            //     $status = 105;
            //     $message = 'Update no longer possible';
            // }
            return response()->json([
                'stat' => $status,
                'message' => $message,

            ], 200);
        } catch (Exception $e) {
            return $this->responseServerError('Error updating resource.');
        }
    }
}
