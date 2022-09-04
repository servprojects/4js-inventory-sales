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
use DB;

class RequestApprovalController extends Controller
{
    public function index(Request $request)
    {
        // Get user from $request token.
        if (!$user = auth()->setRequest($request)->user()) {
            return $this->responseUnauthorized();
        }

        try {
            $h = "<button>Hello</button>";
            $w = "hello";

            $userdet = User_detail::where('id', $user->user_details_id)->firstOrFail();

            $col =  Requisition::join('users', 'requisitions.user_id', '=', 'users.id')
                ->join('user_details', 'users.user_details_id', '=', 'user_details.id')
                ->join('branches', 'user_details.branch_id', '=', 'branches.id')
                ->join('positions', 'user_details.position_id', '=', 'positions.id')
                ->where('request_status', '!=', 'Requested')
                ->where('request_status', '!=', ' ')
                ->select(
                    'requisitions.*',
                    'user_details.first_name',
                    'user_details.last_name',
                    'positions.name as position',
                    'branches.name as branch',
                    DB::raw('
           "<button>Hello</button>"
            as fake')
                )
                ->get();



            if ($userdet->role == "Superadmin") {

                $branchreq =  Requisition::join('users', 'requisitions.user_id', '=', 'users.id')
                    ->join('user_details', 'users.user_details_id', '=', 'user_details.id')
                    ->join('branches', 'user_details.branch_id', '=', 'branches.id')
                    ->join('branches as req_to', 'requisitions.request_to', '=', 'req_to.id')
                    ->join('positions', 'user_details.position_id', '=', 'positions.id')
                    ->whereIn('type', ['Transfer', 'Purchase'])
                    ->where('request_status', '!=', null)
                    // ->where('request_to', '=', $userdet->branch_id)
                    ->select(
                        'requisitions.*',
                        'user_details.first_name',
                        'user_details.last_name',
                        'positions.name as position',
                        'branches.name as branch',
                        'req_to.name as branch_req_to',
                        DB::raw('(CASE 
                    WHEN requisitions.type = "Transfer" THEN "/approvalitems/Transfer"
                    WHEN requisitions.type = "Purchase" THEN "/approvalitems/Purchase"
                    END) AS route'),
                    )
                    ->orderBy('requisitions.created_at', 'DESC')
                    ->get();

                    $reqitems = Requisition_item::join('requisitions', 'requisition_items.requisition_id', '=', 'requisitions.id')
                    // ->leftJoin('items', 'requisition_items.item_id', '=', 'items.id')
                    ->leftJoin('items', 'requisition_items.item_id', '=', 'items.id')
                    ->where('request_to', '=', $userdet->branch_id)
                    // ->where('requisitions.user_id', '=', $user->id)
                    ->whereIn('requisitions.request_status', ['Approved', 'Completed', 'Partially Received'])
                    ->whereIn('type', ['Transfer', 'Purchase'])
                    // ->where('requisition_items.requisition_id', '=', request('id'))
                    ->select(
                        'requisition_items.*',
                        'items.original_price as original_price',
                        // 'items.name as item',
                        'items.id as item_id',
                        'items.size as item_size',
                        'items.unit as item_unit',
                        DB::raw('
                        (requisition_items.unit_price * requisition_items.quantity) as sub_total'),
                        'requisition_items.unit_price as new_price',
                        DB::raw('(CASE 
                        WHEN requisition_items.item_id is null THEN requisition_items.new_item
                        WHEN requisition_items.item_id = requisition_items.item_id THEN items.name
                        END) AS item',)
                    )
                    ->get();

                    // $branchreq =  Requisition::join('users', 'requisitions.user_id', '=', 'users.id')
                    // ->join('user_details', 'users.user_details_id', '=', 'user_details.id')
                    // ->join('branches', 'user_details.branch_id', '=', 'branches.id')
                    // ->join('positions', 'user_details.position_id', '=', 'positions.id')
                    // ->whereIn('type', ['Transfer', 'Purchase'])
                    // ->where('request_status', '!=', null)
                    // ->where('request_to', '=', $userdet->branch_id)
                    // ->select(
                    //     'requisitions.*',
                    //     'user_details.first_name',
                    //     'user_details.last_name',
                    //     'positions.name as position',
                    //     'branches.name as branch',
                    //     DB::raw('(CASE 
                    // WHEN requisitions.type = "Transfer" THEN "/approvalitems/Transfer"
                    // WHEN requisitions.type = "Purchase" THEN "/approvalitems/Purchase"
                    // END) AS route'),
                    // )
                    // ->get();

            } else {
                $branchreq =  Requisition::join('users', 'requisitions.user_id', '=', 'users.id')
                    ->join('user_details', 'users.user_details_id', '=', 'user_details.id')
                    ->join('branches', 'user_details.branch_id', '=', 'branches.id')
                    ->join('branches as req_to', 'requisitions.request_to', '=', 'req_to.id')
                    ->join('positions', 'user_details.position_id', '=', 'positions.id')
                    ->where('type', '=', 'Transfer')
                    ->where('request_status', '!=', null)
                    ->where('request_to', '=', $userdet->branch_id)
                    ->select(
                        'requisitions.*',
                        'user_details.first_name',
                        'user_details.last_name',
                        'positions.name as position',
                        'branches.name as branch',
                        'req_to.name as branch_req_to',
                        DB::raw('(CASE 
                    WHEN requisitions.type = "Transfer" THEN "/reqevaluation"
                    END) AS route'),
                    )
                    ->orderBy('requisitions.created_at', 'DESC')
                    ->get();

                $reqitems = Requisition_item::join('requisitions', 'requisition_items.requisition_id', '=', 'requisitions.id')
                    // ->leftJoin('items', 'requisition_items.item_id', '=', 'items.id')
                    ->leftJoin('items', 'requisition_items.item_id', '=', 'items.id')
                    ->where('request_to', '=', $userdet->branch_id)
                    // ->where('requisitions.user_id', '=', $user->id)
                    ->whereIn('requisitions.request_status', ['Approved', 'Completed', 'Partially Received'])
                    ->where('type', '=', 'Transfer')
                    // ->where('requisition_items.requisition_id', '=', request('id'))
                    ->select(
                        'requisition_items.*',
                        'items.original_price as original_price',
                        'items.name as item',
                        'items.id as item_id',
                        'items.size as item_size',
                        'items.unit as item_unit',
                        DB::raw('
                        (requisition_items.unit_price * requisition_items.quantity) as sub_total'),
                        'requisition_items.unit_price as new_price'
                    )
                    ->get();



                // $branchreq =  Requisition::join('users', 'requisitions.user_id', '=', 'users.id')
                // ->join('user_details', 'users.user_details_id', '=', 'user_details.id')
                // ->join('branches', 'user_details.branch_id', '=', 'branches.id')
                // ->join('positions', 'user_details.position_id', '=', 'positions.id')
                // ->where('type', '=', 'Transfer')
                // ->where('request_status', '!=', null)
                // ->where('request_to', '=', $userdet->branch_id)
                // ->select('requisitions.*', 'user_details.first_name', 'user_details.last_name', 'positions.name as position', 'branches.name as branch',
                // DB::raw('(CASE 
                // WHEN requisitions.type = "Transfer" THEN "/reqevaluation"
                // END) AS route'),)
                // ->get();

            }
        } catch (Exception $e) {
        }



        return response()->json([
            'status' => 200,
            'requests' => $col,
            'branchreq' => $branchreq,
            'items' => $reqitems,
            'role' => $userdet->role,
        ], 200);
    }
    public function update(Request $request, $id)
    {
        // Get user from $request token.
        if (!$user = auth()->setRequest($request)->user()) {
            return $this->responseUnauthorized();
        }



        try {
            $req = Requisition::where('id', $id)->firstOrFail();



            if (request('request_status')) {
                $req->request_status = request('request_status');
            }

            $req->save();
            // return $this->responseResourceUpdated();
            $col4 =  Requisition::join('users', 'requisitions.user_id', '=', 'users.id')
                ->join('user_details', 'users.user_details_id', '=', 'user_details.id')
                ->join('branches', 'user_details.branch_id', '=', 'branches.id')
                ->join('positions', 'user_details.position_id', '=', 'positions.id')
                ->where('requisitions.id', '=', $id)
                ->select('requisitions.*', 'user_details.first_name', 'user_details.last_name', 'positions.name as position', 'branches.name as branch')
                ->get();



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
