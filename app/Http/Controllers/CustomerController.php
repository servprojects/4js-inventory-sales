<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use App\Http\Controllers\APIController;
use App\Http\Resources\CustomerCollection;
use App\Http\Resources\CustomerResource;
use App\User_detail;
use App\Customer;
use App\Transaction;
use DB;

class CustomerController extends Controller
{
    public function index(Request $request)
    {
        // Get user from $request token.
        if (!$user = auth()->setRequest($request)->user()) {
            return $this->responseUnauthorized();
        }

        try {
            $collection1 =  User_detail::join('customers', 'user_details.id', '=', 'customers.user_details_id')
                ->select(
                    'user_details.*',
                    'customers.charge_balance as balance',
                    DB::raw('CONCAT(user_details.first_name," " , user_details.last_name) as name')
                )
                ->get();
            $userdet =  User_detail::where('id', $user->user_details_id)->firstOrFail();  // get branch
        } catch (Exception $e) {
        }

        return response()->json([
            'status' => 200,
            'role' => $userdet->role,
            'customers' => $collection1,
        ], 200);
    }



    public function store(Request $request)
    {
        // Get user from $request token.
        if (!$user = auth()->setRequest($request)->user()) {
            return $this->responseUnauthorized();
        }


        // Warning: Data isn't being fully sanitized yet.
        try {


            $userdet = User_detail::create([
                'first_name' => request('first_name'),
                'last_name' => request('last_name'),
                'middle_name' => request('middle_name'),
                'contact_no' => request('contact_no'),
                'address' => request('address'),
            ]);

            Customer::create([
                'charge_balance' => 0,
                'user_details_id' => $userdet->id,
            ]);

            $customer = Customer::join('user_details', 'customers.user_details_id', '=', 'user_details.id')
                ->select('customers.*', 'user_details.first_name as first_name', 'user_details.last_name as last_name')->get();

            return response()->json([
                'status' => 201,
                'message' => 'Resource created.',
                'id' => $userdet->id,
                'balance' => 0,
                'customer' => $customer,

            ], 201);
        } catch (Exception $e) {
            echo $e;
            return $this->responseServerError('Error creating resource.');
        }
    }
    public function importCustomer(Request $request)
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

                    // $item_name = $itm["name"];


                    // $add = " ";
                    // if (!$itm["address"] == "") {
                    //     $add = $itm["address"];
                    // }

                    $bal = 0;
                    if (!$itm["balance"] == "") {
                        $bal = $itm["balance"];
                    }
                    $userdet = User_detail::create([
                        'first_name' => $itm["first_name"],
                        'last_name' => $itm["last_name"],
                        'middle_name' => $itm["middle_name"],
                        'contact_no' => $itm["contact_no"],
                        'address' => $itm["address"],
                    ]);

                    Customer::create([
                        'charge_balance' => $bal,
                        'user_details_id' => $userdet->id,
                    ]);
                    // insert new item
                    // $sup = Customer::create([
                    //     'first_name' => $itm["first_name"],
                    //     'last_name' => $itm["last_name"],
                    //     'middle_name' => $itm["middle_name"],
                    //     'contact_no' => $itm["contact_no"],
                    //     'address' => $itm["address"],
                    //     'balance' => $bal,
                    // ]);
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
    public function update(Request $request, $id)
    {
        // Get user from $request token.
        if (!$user = auth()->setRequest($request)->user()) {
            return $this->responseUnauthorized();
        }

        // Validates data.



        try {
            $userdet = User_detail::where('id', $id)->firstOrFail();

            if (request('first_name')) {
                $userdet->first_name = request('first_name');
            }
            if (request('last_name')) {
                $userdet->last_name = request('last_name');
            }
            if (request('middle_name')) {
                $userdet->middle_name = request('middle_name');
            }
            if (request('contact_no')) {
                $userdet->contact_no = request('contact_no');
            }
            if (request('address')) {
                $userdet->address = request('address');
            }

            $userdet->save();

            $collection1 =  User_detail::join('customers', 'user_details.id', '=', 'customers.user_details_id')
                ->select('user_details.*', 'customers.charge_balance as balance')
                ->get();

            // return $this->responseResourceUpdated();
            return response()->json([
                'status' => 200,
                'message' => 'Update successful',
                'updated' => $collection1
            ], 200);
        } catch (Exception $e) {
            return $this->responseServerError('Error updating resource.');
        }
    }
    public function destroy(Request $request, $id)
    {
        // Get user from $request token.
        if (!$user = auth()->setRequest($request)->user()) {
            return $this->responseUnauthorized();
        }

        $userdet = User_detail::where('id', $id)->firstOrFail();
        $cust = Customer::where('user_details_id', $id)->firstOrFail();



        try {
            $transaction = Transaction::where('customer_id', '=', $id)->first();
            if (!empty($transaction)) {
                return response()->json([
                    'status' => 0,

                ], 0);
            } else {
                $userdet->delete();
                $cust->delete();
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

            $cust =  Customer::where('user_details_id', request('cust_id'))->firstOrFail();
            $transitm =  Transaction::where('customer_id', $cust->id)->where('transaction_type', '!=' , 'Update')->first();


            if (is_null($transitm)) {
              


                $oldbal = $cust->charge_balance;
                $cust->charge_balance = request('newbal');

                $cust->save();

                // generate code

                $day = date("d");

                $random = rand(1111111111, 9999999999);
                if (strlen($day) == 1) {
                    $day = "0" . $day;
                }
                $code = "UPCT" . $random . $day;


                // check if the id exist
                $oldcode =  Transaction::where('code', $code)->first();
                if ($oldcode) {
                    if (strlen($day) == 1) {
                        $day = "0" . $day;
                    }
                    $random = rand(1111111111, 9999999999);
                    $code = "UPCT" . $random . $day;
                }
                // generate code

                $ustcust =  User_detail::where('id', $cust->user_details_id)->firstOrFail();
              
                $new = Transaction::create([
                    'transaction_type' => "Update",
                    'user_id' => $user->id,
                    'branch_id' => $userdet->branch_id,
                    'code' => $code,
                    'date_transac' => date('Y-m-d'),
                    'customer_name' => $ustcust->first_name." ".$ustcust->last_name,
                    'accountability' => "Customer",
                    'payable' =>  request('newbal'),
                    'customer_id' =>  $cust->id,
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
