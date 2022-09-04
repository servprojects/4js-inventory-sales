<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use App\Http\Controllers\APIController;
use App\Http\Resources\EmployeeCollection;
use App\Http\Resources\EmployeeResource;
use App\User_detail;
use App\Branch;
use App\Position;
use App\User;

class EmployeeController extends Controller
{
    public function index(Request $request)
    {
        // Get user from $request token.
        if (!$user = auth()->setRequest($request)->user()) {
            return $this->responseUnauthorized();
        }

        try {
            $collection =  User_detail::join('positions', 'user_details.position_id', '=', 'positions.id')
                ->join('branches', 'User_details.branch_id', '=', 'branches.id')
                ->select('user_details.*', 'positions.name as position_name', 'branches.name as branch', 'branches.location as branch_location')
                ->get();


            $collection1 = Branch::select('branches.id', 'branches.name');
            $collection1 = $collection1->latest()->paginate();

            $collection2 = Position::select('positions.id', 'positions.name');
            $collection2 = $collection2->latest()->paginate();
        } catch (Exception $e) {
        }



        return response()->json([
            'status' => 200,
            'branches' => $collection1,
            'positions' => $collection2,
            'employee' => $collection,
        ], 200);
    }
    public function store(Request $request)
    {
        // Get user from $request token.
        // if (! $user = auth()->setRequest($request)->user()) {
        //     return $this->responseUnauthorized();
        // }


        // Warning: Data isn't being fully sanitized yet.
        try {
            $branch_id = null;
            if (request('branch_id')) {
                $branch_id = request('branch_id');
            }
            $role = null;

            $userdet = User_detail::create([
                'first_name' => request('first_name'),
                'last_name' => request('last_name'),
                'middle_name' => request('middle_name'),
                'branch_id' => $branch_id,
                'contact_no' => request('contact_no'),
                'address' => request('address'),
                'position_id' => request('position_id'),
                'role' => 'employee',
            ]);

            $brand = Branch::select('location as branch_location')
                ->where('id', "" . request('branch_id') . "")
                ->get();

            $position = Position::select('name as position_name')
                ->where('id', "" . request('position_id') . "")
                ->get();

            return response()->json([
                'status' => 201,
                'message' => 'Resource created.',
                'id' => $userdet->id,
                'branches' => $brand,
                'positions' => $position
            ], 201);
        } catch (Exception $e) {
            return $this->responseServerError('Error creating resource.');
        }
    }
    public function destroy(Request $request, $id)
    {
        // Get user from $request token.
        if (!$user = auth()->setRequest($request)->user()) {
            return $this->responseUnauthorized();
        }

        $users = User_detail::where('id', $id)->firstOrFail();



        try {
            $confirm = User::where('user_details_id', '=', $id)->first();

            if (!empty($confirm)) {
                return response()->json([
                    'status' => 0,
                ], 0);
            } else {
                $users->delete();
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
            if (request('contact_no')) {
                $user->contact_no = request('contact_no');
            }
            if (request('position_id')) {
                $user->position_id = request('position_id');
            }
            $user->save();



            $col4 =    $collection =  User_detail::join('positions', 'user_details.position_id', '=', 'positions.id')
                ->join('branches', 'User_details.branch_id', '=', 'branches.id')
                ->select('user_details.*', 'positions.name as position_name', 'branches.name as branch', 'branches.location as branch_location')
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
