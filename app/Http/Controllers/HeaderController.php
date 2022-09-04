<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use App\Http\Controllers\APIController;
use App\User_detail;
use App\User;
use App\Notification;
use App\Transaction_item;
use App\Item;
use App\Project;
use App\Supplier;
use App\Branch;
use App\Cheque;
use App\Requisition;
use DB;

class HeaderController extends Controller
{
    public function index(Request $request)
    {
        // Get user from $request token.
        if (!$user = auth()->setRequest($request)->user()) {
            return $this->responseUnauthorized();
        }

        try {

            $userdet = User_detail::where('id', $user->user_details_id)->firstOrFail();

            $header = User::join('user_details', 'users.user_details_id', '=', 'user_details.id')
                ->join('branches', 'user_details.branch_id', '=', 'branches.id')
                ->where('users.id', '=',  $user->id)
                ->select('user_details.*', 'branches.name as branch', 'users.email as email', 'users.permission')
                ->get();

            $notif = Notification::where('notif_for_user', '=',  $userdet->role)
                ->where('notif_for_branch', '=',  $userdet->branch_id)
                ->where('mark_as', '=',  "unread")
                ->select(
                    'notifications.*',
                    // DB::raw('DATE(notifications.created_at) as date'),
                    DB::raw('notifications.created_at as date'),
                    DB::raw('"envelope icon" as icon')

                )
                ->orderBy('notifications.created_at', 'DESC')
                ->get();

            $reqs = Requisition::where('request_to', '=',  $userdet->branch_id);
            // $reqs->where('request_status', '=',  "" . $userdet->role == 'Superadmin' ? "Pending" : "Requested" . "");

            // $reqs->where('request_status', '=',  "" . $userdet->role == 'Superadmin' ? "Pending" : "Requested" . "");

            if($userdet->role == 'Superadmin'){
                $reqs->where('request_status', '=',  'Pending');
                $reqs->select(DB::raw('COUNT(id) as count'));
                $reqs = $reqs->get();
            }else {
                $reqs->join('users', 'requisitions.user_id', '=', 'users.id');
                $reqs->join('user_details', 'users.user_details_id', '=', 'user_details.id');
                $reqs->whereIn('requisitions.request_status', ['Requested', 'Disapproved', 'Approved']);
                $reqs->where('user_details.role', '=',  "Admin");
                $reqs->select(DB::raw('COUNT(requisitions.id) as count'));
                $reqs = $reqs->get();
            }
           

            // $owreqs = Requisition::where('branch_id', '=',  $userdet->branch_id)->where('user_id', '=',  $user->id);
            $owreqs = Requisition::where('branch_id', '=',  $userdet->branch_id);
            $owreqs->whereIn('request_status', ['Approved', 'Released', 'Disapproved']);
            $owreqs->select(DB::raw('COUNT(id) as count'));
            $owreqs = $owreqs->get();

            $cq = 0;
            if ($userdet->role == "Superadmin") {
                $cheques =  Cheque::select(DB::raw('COUNT(id) as count'))
                    ->whereRaw('datediff(cheques.date, now()) <= ?', [5])
                    // ->whereRaw('datediff(cheques.date, now()) >= 1')
                    ->whereNull('cheques.status')
                    ->get();

                $cq = $cheques[0]->count;
            }
        } catch (Exception $e) {
        }



        return response()->json([
            'status' => 200,
            'header' => $header,
            'notif' => $notif,
            'reqs' => $reqs[0]->count,
            'ownreqs' => $owreqs[0]->count,
            'cheque' => $cq
        ], 200);
    }

    public function userfilt(Request $request)
    {
        // Get user from $request token.
        if (!$user = auth()->setRequest($request)->user()) {
            return $this->responseUnauthorized();
        }

        try {
            $role = User_detail::where('id', $user->user_details_id)->select('user_details.role')->firstOrFail();
        } catch (Exception $e) {
        }



        return response()->json([
            'status' => 200,
            'role' =>  $role->role,
            
        ], 200);
    }
}
