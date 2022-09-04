<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use App\Http\Controllers\APIController;
use App\Http\Resources\BranchCollection;
use App\Http\Resources\BranchResource;
use App\Branch;
use App\Item;
use App\Item_count;
use App\Transaction;
use App\Transaction_item;
use App\User_detail;

class BranchController extends Controller
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

        // $collection = new Branch();

        // $collection = $collection->latest()->paginate();

        // return new BranchCollection($collection);
        try {
            $branches = Branch::select('branches.*')->get();
            $userdet =  User_detail::where('id', $user->user_details_id)->firstOrFail();  // get branch
            return response()->json([
                'status' => 200,
                'role' => $userdet->role,
                'branches' => $branches,
            ], 200);
        } catch (Exception $e) {
            return $this->responseServerError('Error creating resource.');
        }
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
        //     'location' => 'required'
        // ]);

        // if ($validator->fails()) {
        //     return $this->responseUnprocessable($validator->errors());
        // }

        // Warning: Data isn't being fully sanitized yet.
        try {
            $branch = Branch::create([
                'name' => request('name'),
                'location' => request('location'),
                'balance' => 0
            ]);
            $branches = Branch::select('branches.*')->get();


            $codeTr =  $this->gecode("IMP") . "-" . $branch->id;
            $trt = $this->addtrans(request('name'), $user->id, $branch->id, $codeTr, date("Y-m-d"), "Import");

            $items = Item::select('items.*')
                ->get();

            foreach ($items as $itm) {
                $newCount = Item_count::create([
                    'item_id' => $itm->id,
                    'balance' => 0,
                    'collectible_amount' => 0,
                    'threshold' => 10,
                    'branch_id' => $branch->id,
                ]);

                $this->addTransItems($itm->unit_price, $itm->original_price,  0, $trt, null, $itm->id, "Import");
            }




            return response()->json([
                'status' => 201,
                'message' => 'Resource created.',
                // 'id' => $branch->id
                'branches' => $branches
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
        //     'location' => 'string'
        // ]);

        // if ($validator->fails()) {
        //     return $this->responseUnprocessable($validator->errors());
        // }

        try {
            $branch = Branch::where('id', $id)->firstOrFail();

            if (request('name')) {
                $branch->name = request('name');
            }
            if (request('location')) {
                $branch->location = request('location');
            } 
            if (request('isDisabled') == 0 || request('isDisabled') == 1 ) {
                $branch->isDisabled = request('isDisabled');
            }

            $branch->save();
            // return $this->responseResourceUpdated();

            // $collection = Branch::select('branches.*');
            // $collection = $collection->latest()->paginate();

            $branches = Branch::select('branches.*')->get();
            return response()->json([
                'status' => 200,
                'message' => 'Update successful',
                'updated' => $branches
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

        $branch = Branch::where('id', $id)->firstOrFail();



        try {
            $confirm = User_detail::where('branch_id', '=', $id)->first();

            if (!empty($confirm)) {
                return response()->json([
                    'status' => 0,
                ], 0);
            } else {
                $branch->delete();
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

    public function updateBalance(Request $request)
    {
        // Get user from $request token.
        if (!$user = auth()->setRequest($request)->user()) {
            return $this->responseUnauthorized();
        }



        try {
            $userdet =  User_detail::where('id', $user->user_details_id)->firstOrFail();

            
            $transitm =  Transaction::where('office_id', request('office_id'))->where('transaction_type', '!=' , 'Update')->first();


            if (is_null($transitm)) {
               $brnch =  Branch::where('id', request('office_id'))->firstOrFail();


                $oldbal = $brnch->balance;
                $brnch->balance = request('newbal');

                $brnch->save();

                // generate code

                $day = date("d");

                $random = rand(1111111111, 9999999999);
                if (strlen($day) == 1) {
                    $day = "0" . $day;
                }
                $code = "UPBR" . $random . $day;


                // check if the id exist
                $oldcode =  Transaction::where('code', $code)->first();
                if ($oldcode) {
                    if (strlen($day) == 1) {
                        $day = "0" . $day;
                    }
                    $random = rand(1111111111, 9999999999);
                    $code = "UPBR" . $random . $day;
                }
                // generate code

             
              
                $new = Transaction::create([
                    'transaction_type' => "Update",
                    'user_id' => $user->id,
                    'branch_id' => $userdet->branch_id,
                    'code' => $code,
                    'date_transac' => date('Y-m-d'),
                    'customer_name' => $brnch->name,
                    'accountability' => "Office",
                    'payable' =>  request('newbal'),
                    'customer_id' =>  $brnch->id,
                    'beg_charge_bal' =>  $oldbal,
                    'end_charge_bal' =>  request('newbal'),

                ]);


                $status = 200;
                $message = 'Update successful';
            } else {
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
