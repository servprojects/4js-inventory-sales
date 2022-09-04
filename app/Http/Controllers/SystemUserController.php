<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use App\Http\Controllers\APIController;
use App\Http\Resources\SysUserCollection;
use App\Http\Resources\SysUserResource;
use App\User_detail;
use App\User;
use App\Branch;
use App\Requisition;
use App\Transaction;
use Illuminate\Support\Facades\Hash;
use DB;

class SystemUserController extends Controller
{
    public function index(Request $request)
    {
        // Get user from $request token.
        if (!$user = auth()->setRequest($request)->user()) {
            return $this->responseUnauthorized();
        }

        try {
            $collection1 =  User_detail::join('users', 'user_details.id', '=', 'users.user_details_id')
                ->join('branches', 'user_details.branch_id', '=', 'branches.id')
                ->whereNull('users.disable')
                ->select('user_details.*', 'users.email as email', 'branches.name as branch', 'branches.location as location', 'users.permission')
                ->get();


            $collection2 = Branch::select('branches.id', 'branches.name')->get();
            // $collection2 = $collection2->latest()->paginate();


            $collection3 = User_detail::select('user_details.id', 'user_details.first_name', 'user_details.last_name')->get();
            // $collection3 = $collection3->latest()->paginate();

            // $collection2 = Brand::select('brands.id', 'brands.name');
            // $collection2 = $collection2->latest()->paginate();

            // $collection3 = Item_category::select('item_categories.id', 'item_categories.name');
            // $collection3 = $collection3->latest()->paginate();

        } catch (Exception $e) {
        }

        // 'brands' => $collection2,
        // 'itemcats' => $collection3,
        // 'cols' => $col4,

        return response()->json([
            'status' => 200,
            'sysusers' => $collection1,
            'branch' => $collection2,
            'personnel' => $collection3,
        ], 200);
    }

    public function getCashier(Request $request)
    {
        // Get user from $request token.
        if (!$user = auth()->setRequest($request)->user()) {
            return $this->responseUnauthorized();
        }

        try {

            $users =  User_detail::join('users', 'user_details.id', '=', 'users.user_details_id')
            ->join('branches', 'user_details.branch_id', '=', 'branches.id')
            ->whereNull('users.disable')
            ->where('user_details.role','Cashier')
            ->where('user_details.id', '!=','103')
            ->select(
             DB::raw('CONCAT(user_details.first_name," " , user_details.last_name) as name'),
            'users.id', 
            'branches.name as branch', 
            'user_details.role', 
            'user_details.branch_id')
            ->get();

        } catch (Exception $e) {
        }

        // 'brands' => $collection2,
        // 'itemcats' => $collection3,
        // 'cols' => $col4,

        return response()->json([
            'status' => 200,
            'users' => $users,
        ], 200);
    }

    public function getHashId(Request $request)
    {
        // Get user from $request token.
        if (!$user = auth()->setRequest($request)->user()) {
            return $this->responseUnauthorized();
        }

        try {
        } catch (Exception $e) {
        }


        return response()->json([
            'status' => 200,
            'hashuserId' => $user->hashid,
        ], 200);
    }
    public function CreateSystemUser(Request $request)
    {
        // Get user from $request token.
        if (!$user = auth()->setRequest($request)->user()) {
            return $this->responseUnauthorized();
        }


        // Warning: Data isn't being fully sanitized yet.
        try {
            $branch_id = null;
            if (request('branch_id')) {
                $branch_id = request('branch_id');
            }
            $role = null;
            if (request('role')) {
                $role = request('role');
            }

            // $fname = ' ';
            // $lname = ' ';

            // if(request('exist') == 'no'){
            $position_id = null;
            if (request('role') == "Admin") {
                $position_id = "1";
            }
            if (request('role') == "Cashier") {
                $position_id = "2";
            }
            if (request('role') == "HR") {
                $position_id = "3";
            }
            if (request('role') == "Superadmin") {
                $position_id = "4";
            }
            if (request('role') == "Inventory") {
                $position_id = "5";
            }

            $userdet = User_detail::create([
                'first_name' => request('first_name'),
                'last_name' => request('last_name'),
                'middle_name' => request('middle_name'),
                'branch_id' => $branch_id,
                'role' => $role,
                'contact_no' => request('contact_no'),
                'address' => ' ',
                'position_id' =>  $position_id,
            ]);

            $newid = $userdet->id;

            User::create([
                'email' => request('email'),
                'password' =>  Hash::make(request('password')),
                'user_details_id' => $userdet->id
            ]);

            $fname = request('first_name');
            $lname = request('last_name');


            // }else{
            //     User::create([
            //         'email' => request('email'),
            //         'password' =>  Hash::make(request('password')),
            //         'user_details_id' => request('user_details_id')
            //        ]);

            //        $newid = request('user_details_id');

            //        $person = User_detail::select('first_name as fname', 'last_name as lname')
            //        ->where('id', "".request('user_details_id')."")
            //        ->get();

            //     //    $fname = $person->fname;
            //     //    $lname = $person->lname;

            //     //    $names = $person;
            // }
            $users =  User_detail::join('users', 'user_details.id', '=', 'users.user_details_id')
                ->join('branches', 'user_details.branch_id', '=', 'branches.id')
                ->select('user_details.*', 'users.email as email', 'branches.name as branch', 'branches.location as location')
                ->get();



            return response()->json([
                'status' => 201,
                'message' => 'Resource created.',
                // 'id' => $newid,
                // 'email' => request('email'),
                // 'first_name' => $fname,
                // 'last_name' => $lname,
                'users' => $users,
            ], 201);
        } catch (Exception $e) {
            echo $e;
            return $this->responseServerError('Error creating resource.');
        }
    }

    // public function destroy(Request $request, $id)
    // {
    //     // Get user from $request token.
    //     if (! $user = auth()->setRequest($request)->user()) {
    //         return $this->responseUnauthorized();
    //     }

    //     $users = User::where('id',$id)->firstOrFail();



    //     try {
    //         $users->delete();
    //         // return $this->responseResourceDeleted();
    //         return response()->json([
    //             'status' => 204,
    //             'message' => "Deleted successfully"
    //         ], 204);

    //     } catch (Exception $e) {
    //         return $this->responseServerError('Error deleting resource.');
    //     }
    // }
    public function destroy(Request $request, $id)
    {
        // Get user from $request token.
        if (!$user = auth()->setRequest($request)->user()) {
            return $this->responseUnauthorized();
        }

        $usersdet = User::where('user_details_id', $id)->firstOrFail();
        $users = User::where('user_details_id', $id)->firstOrFail();



        try {
            $transaction = Transaction::where('user_id', '=', $usersdet->id)->first();
            $requisition = Requisition::where('user_id', '=', $usersdet->id)->first();

            // if (!empty($transaction) || !empty($requisition)) {
            //     return response()->json([
            //         'status' => 0,

            //     ], 0);
            // }else if(!empty($requisition)){
            //     return response()->json([
            //         'status' => 0,

            //     ], 0);
            // }

            if (!empty($transaction) || !empty($requisition)) {
                return response()->json([
                    'status' => 0,

                ], 0);
            } else {
                $users->delete();
                return response()->json([
                    'status' => 204,
                    'message' => "Deleted successfully"
                ], 204);

                // return $this->responseResourceDeleted();

            }
        } catch (Exception $e) {
            return $this->responseServerError('Error deleting resource.');
        }
    }
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
            $user = User_detail::where('id', $id)->firstOrFail();

            if (request('first_name')) {
                $user->first_name = request('first_name');
            }
            if (request('last_name')) {
                $user->last_name =  request('last_name');
            }
            if (request('middle_name')) {
                $user->middle_name = request('middle_name');
            }
            if (request('branch_id')) {
                $user->branch_id = request('branch_id');
            }
            if (request('role')) {
                $user->role = request('role');

                if (request('role') == "Admin") {
                    $user->position_id = "1";
                }
                if (request('role') == "Cashier") {
                    $user->position_id = "2";
                }
                if (request('role') == "HR") {
                    $user->position_id = "3";
                }
                if (request('role') == "Superadmin") {
                    $user->position_id = "4";
                }
            }
            if (request('contact_no')) {
                $user->contact_no = request('contact_no');
            }

            $user->save();


            $sys = User::where('user_details_id', $id)->firstOrFail();
            if (request('email')) {
                $sys->email = request('email');
            }
            if (request('password')) {
                $sys->password = Hash::make(request('password'));
            }
            $sys->save();

            $col4 =  User_detail::join('users', 'user_details.id', '=', 'users.user_details_id')
                ->join('branches', 'user_details.branch_id', '=', 'branches.id')
                ->select('user_details.*', 'users.email as email', 'branches.name as branch', 'branches.location as location')
                ->get();

            // return $this->responseResourceUpdated();
            return response()->json([
                'status' => 200,
                'message' => 'Update successful',
                'updated' => $col4
            ], 200);
        } catch (Exception $e) {
            return $this->responseServerError('Error updating resource.');
        }
    }
}
