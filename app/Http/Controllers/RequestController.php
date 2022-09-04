<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use App\Http\Controllers\APIController;
use App\Notification;
use App\Requisition;
use App\Requisition_item;
use App\User_detail;
use App\Branch;
use DB;

class RequestController extends Controller
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

        try {
            $userdet = User_detail::where('id', $user->user_details_id)->firstOrFail();

            $collection1 = Requisition::select('requisitions.*')
                ->where('user_id', $user->id);
            $collection1 = $collection1->latest()->paginate();

            $collection2 = Branch::select('branches.id', 'branches.name');
            $collection2 = $collection2->latest()->paginate();

            $reqs =  Requisition::join('users', 'requisitions.user_id', '=', 'users.id')
                ->join('user_details', 'users.user_details_id', '=', 'user_details.id')
                ->join('branches', 'user_details.branch_id', '=', 'branches.id')
                ->join('branches as req_to', 'requisitions.request_to', '=', 'req_to.id')
                ->join('positions', 'user_details.position_id', '=', 'positions.id')
                // ->where('requisitions.id', '=', request('id'))
                // ->where('requisitions.user_id', '=', $user->id)
                ->where('branches.id', '=', $userdet->branch_id)
                ->select(
                    'requisitions.*',
                    'user_details.first_name',
                    'user_details.last_name',
                    'positions.name as position',
                    'branches.name as branch',
                    'req_to.name as branch_req_to'
                );
            $reqs = $reqs->latest()->paginate();

            $reqitems = Requisition_item::join('requisitions', 'requisition_items.requisition_id', '=', 'requisitions.id')
                // ->leftJoin('items', 'requisition_items.item_id', '=', 'items.id')
                ->leftJoin('items', 'requisition_items.item_id', '=', 'items.id')
                ->where('requisitions.user_id', '=', $user->id)
                ->whereIn('requisitions.request_status', ['Approved', 'Completed', 'Partially Received'])
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

            // ->get();
        } catch (Exception $e) {
        }



        return response()->json([
            'status' => 200,
            // 'requests' => $collection1,
            'requests' => $reqs,
            'items' => $reqitems,
            'branch' => $collection2,
        ], 200);
    }

    /**
     * Show the form for creating a new resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function create(Request $request)
    {
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


        // Warning: Data isn't being fully sanitized yet.
        try {

            $userdet = User_detail::where('id', $user->user_details_id)->firstOrFail();

            $status = "Pending";
            if (request('type') == "Transfer") {
                if (request('request_to') == $userdet->branch_id) {
                    return response()->json([
                        'status' => 155,
                        'message' => 'You cannot request transfer from your own branch.',
                    ], 201);
                }
                $status = "Requested";
            }


            $year = date("y");
            $year = substr($year, -2);
            $month = date("m");
            $day = date("d");
            $code = "RQ" . $user->user_details_id . $year . $day . $month . rand(100, 999);

            $reqs = Requisition::create([
                'urgency_status' => request('urgency_status'),
                'estimated_receiving_date' => request('estimated_receiving_date'),
                'type' => request('type'),
                'request_to' => request('request_to'),
                'user_id' => $user->id,
                'branch_id' => $userdet->branch_id,
                'request_status' => null,
                'code' => $code,
            ]);

            $new = Requisition::where('id', $reqs->id)->firstOrFail(); // get new req code
            $branchdet =  Branch::select('branches.*')->firstOrFail();  // get branch name

            // if(request('type') == "Transfer"){
            //     $description = "Items request from ". $branchdet->name . ". Needed on ". request('estimated_receiving_date');
            //     Notification::create([
            //         'type' => "Preparation",
            //         'notif_for_user' => "Admin",
            //         'notif_for_branch' => request('request_to'),
            //         'description' =>  $description,
            //         'requisition_code' =>  $new->code,
            //         'created_by_user_id' =>  $user->id,
            //         'mark_as' =>  "unread",
            //     ]);
            // }

            $collection = Requisition::select('requisitions.*');
            $collection = $collection->latest()->paginate();

            $reqsnew =  Requisition::join('users', 'requisitions.user_id', '=', 'users.id')
                ->join('user_details', 'users.user_details_id', '=', 'user_details.id')
                ->join('branches', 'user_details.branch_id', '=', 'branches.id')
                ->join('branches as req_to', 'requisitions.request_to', '=', 'req_to.id')
                ->join('positions', 'user_details.position_id', '=', 'positions.id')
                // ->where('requisitions.id', '=', request('id'))
                // ->where('requisitions.user_id', '=', $user->id)
                ->where('branches.id', '=', $userdet->branch_id)
                ->select(
                    'requisitions.*',
                    'user_details.first_name',
                    'user_details.last_name',
                    'positions.name as position',
                    'branches.name as branch',
                    'req_to.name as branch_req_to'
                );
            $reqsnew = $reqsnew->latest()->paginate();


            return response()->json([
                // 'status' => 201,
                'message' => 'Resource created.',
                'id' => $reqs->id,
                // 'status' => $reqs->request_status,
                'code' => $code,
                'requests' => $reqsnew,
            ], 201);
        } catch (Exception $e) {
            return $this->responseServerError('Error creating resource.');
        }
    }

    public function sendForApproval(Request $request)
    {
        // Get user from $request token.
        if (!$user = auth()->setRequest($request)->user()) {
            return $this->responseUnauthorized();
        }


        // Warning: Data isn't being fully sanitized yet.
        try {
            $req = Requisition::where('id', request('id'))->firstOrFail();
            $userdet = User_detail::where('id', $user->user_details_id)->firstOrFail();

            $status = $req->request_status;
            // $status = "what";
            if (is_null($req->request_status)) {
                $status = "Requested";
            }

            if ($req->type == "Transfer") {
                if (is_null($req->request_status)) {
                    $status = "Requested";
                    $thisstat = "new";
                }

                if ($req->request_status == "Requested") {
                    $status = "Pending";
                    $thisstat = "Requested";
                }
            } else {
                $status = "Pending";
            }

            if ($req->request_status == "Disapproved") {
                $status = "Pending";
            }
            $req->request_status = $status;
            $req->save();

            $new = Requisition::where('id', request('id'))->firstOrFail(); // get new req code
            $branchdet =  Branch::where('id', $new->branch_id)->firstOrFail();  // get branch name


            if ($req->type == "Transfer") {
                if ($thisstat == "new") {
                    $description = "Items request for trasfer to " . $branchdet->name . ". Needed on " .  $new->estimated_receiving_date;
                    Notification::create([
                        'type' => "Preparation",
                        'notif_for_user' => "Admin",
                        'notif_for_branch' => $new->request_to,
                        'description' =>  $description,
                        'requisition_code' =>  $new->id,
                        'created_by_user_id' =>  $user->id,
                        'mark_as' =>  "unread",
                        'route' =>  "/reqevaluation",
                    ]);
                }
                if ($req->request_status == "Pending") {
                    $description = "Items request for transfer to " . $branchdet->name . ". Needed on " .  $new->estimated_receiving_date;
                    Notification::create([
                        'type' => "Approval",
                        'notif_for_user' => "Superadmin",
                        'notif_for_branch' => $new->request_to,
                        'description' =>  $description,
                        'requisition_code' =>  $new->id,
                        'created_by_user_id' =>  $user->id,
                        'mark_as' =>  "unread",
                        'route' =>  "/approvalitems/Transfer",
                    ]);
                }
            } else {
                $description = "Items request for purchase for " . $branchdet->name . ". Needed on " .  $new->estimated_receiving_date;
                Notification::create([
                    'type' => "Approval",
                    'notif_for_user' => "Superadmin",
                    'notif_for_branch' => $new->request_to,
                    'description' =>  $description,
                    'requisition_code' =>  $new->id,
                    'created_by_user_id' =>  $user->id,
                    'mark_as' =>  "unread",
                    'route' =>  "/approvalitems/Purchase",
                ]);
            }

            $collection = Requisition::select('requisitions.*');
            $collection = $collection->latest()->paginate();

            $col4 =  Requisition::join('users', 'requisitions.user_id', '=', 'users.id')
                ->join('user_details', 'users.user_details_id', '=', 'user_details.id')
                ->join('branches', 'user_details.branch_id', '=', 'branches.id')
                ->join('positions', 'user_details.position_id', '=', 'positions.id')
                ->where('requisitions.id', '=', request('id'))
                ->select('requisitions.*', 'user_details.first_name', 'user_details.last_name', 'positions.name as position', 'branches.name as branch')
                ->get();


            return response()->json([
                // 'status' => 201,
                'message' => 'Resource created.',
                'requests' => $col4,
                // 'id' => $new->id,
                // 'status' => $new->request_status,
                // 'code' => $code,
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



        try {
            $req = Requisition::where('id', $id)->firstOrFail();



            if (request('urgency_status')) {
                $req->urgency_status = request('urgency_status');
            }
            if (request('estimated_receiving_date')) {
                $req->estimated_receiving_date = request('estimated_receiving_date');
            }
            if (request('type')) {
                $req->type = request('type');
            }
            if (request('request_to')) {
                $req->request_to = request('request_to');
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

            $reqTo =  Requisition::join('branches', 'requisitions.request_to', '=', 'branches.id')
                ->where('requisitions.id', '=', $id)
                ->select('requisitions.*', 'branches.name as branch')
                ->get();

            return response()->json([
                'status' => 200,
                'message' => 'Update successful',
                'updated' => $col4,
                'reqTo' => $reqTo,
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

            $requisition = Requisition::where('id', $id)->firstOrFail();

            if (is_null($requisition->status) || $requisition->status == "Pending" || $requisition->status == "Requested") {
                // $status = 200;
                $requisition->delete();
                $status = 199;
            } else {

                $requisitionItem = Requisition_item::where('requisition_id', $id)->firstOrFail();
                if ($requisitionItem) {
                    if ($requisitionItem) {
                        $requisitionItem->delete();
                    }
                }



                $status = 201;
            }


            // return $this->responseResourceDeleted();
            return response()->json([
                'status' => $status,
                'message' => "Deleted successfully"
            ], 204);
        } catch (Exception $e) {
            return $this->responseServerError('Error deleting resource.');
        }
    }
}
