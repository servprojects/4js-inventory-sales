<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use App\Http\Controllers\APIController;
use App\Http\Resources\ProjectCollection;
use App\Http\Resources\ProjectResource;
use App\Project;
use App\Transaction;
use App\User_detail;

class ProjectController extends Controller
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

        // $collection = new Project();

        // $collection = $collection->latest()->paginate();

        // return new ProjectCollection($collection);
        $userdet =  User_detail::where('id', $user->user_details_id)->firstOrFail();  // get branch

        $collection = Project::select('projects.*')->get();
        return response()->json([
            'status' => 200,
            'role' => $userdet->role,
            'projects' => $collection,
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
        //     'project_desc' => 'required',
        //     'location' => 'required'
        // ]);

        // if ($validator->fails()) {
        //     return $this->responseUnprocessable($validator->errors());
        // }

        // Warning: Data isn't being fully sanitized yet.
        try {
            $project = Project::create([
                'name' => request('name'),
                'project_desc' => request('project_desc'),
                'location' => request('location'),
                'balance' => 0
            ]);
            return response()->json([
                'status' => 201,
                'message' => 'Resource created.',
                'id' => $project->id
            ], 201);
        } catch (Exception $e) {
            return $this->responseServerError('Error creating resource.');
        }
    }
    public function importProject(Request $request)
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


                    $bal = 0;
                    if (!$itm["balance"] == "") {
                        $bal = $itm["balance"];
                    }

                    // insert new item
                    $sup = Project::create([
                        'name' => $itm["name"],
                        'project_desc' => $itm["project_desc"],
                        'location' => $itm["location"],
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



        try {
            $project = Project::where('id', $id)->firstOrFail();

            if (request('name')) {
                $project->name = request('name');
            }
            if (request('location')) {
                $project->location = request('location');
            }
            if (request('project_desc')) {
                $project->project_desc = request('project_desc');
            }

            $project->save();

            $collection2 = Project::select('projects.*')->get();
            // $collection2 = $collection2->latest()->paginate();
            // return $this->responseResourceUpdated();
            return response()->json([
                'status' => 200,
                'message' => 'Update successful',
                'updated' => $collection2
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

        $project = Project::where('id', $id)->firstOrFail();



        try {
            $transaction = Transaction::where('project_id', '=', $id)->first();
            if (!empty($transaction)) {
                return response()->json([
                    'status' => 0,

                ], 0);
            } else {
                $project->delete();
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

            $transitm =  Transaction::where('project_id', request('project_id'))->where('transaction_type', '!=' , 'Update')->first();


            if (is_null($transitm)) {
                $proj =  Project::where('id', request('project_id'))->firstOrFail();


                $oldbal = $proj->balance;
                $proj->balance = request('newbal');

                $proj->save();

                // generate code

                $day = date("d");

                $random = rand(1111111111, 9999999999);
                if (strlen($day) == 1) {
                    $day = "0" . $day;
                }
                $code = "UPPJ" . $random . $day;


                // check if the id exist
                $oldcode =  Transaction::where('code', $code)->first();
                if ($oldcode) {
                    if (strlen($day) == 1) {
                        $day = "0" . $day;
                    }
                    $random = rand(1111111111, 9999999999);
                    $code = "UPPJ" . $random . $day;
                }
                // generate code

              
                $new = Transaction::create([
                    'transaction_type' => "Update",
                    'user_id' => $user->id,
                    'branch_id' => $userdet->branch_id,
                    'code' => $code,
                    'date_transac' => date('Y-m-d'),
                    'customer_name' => $proj->name,
                    'accountability' => "Project",
                    'payable' =>  request('newbal'),
                    'project_id' =>  $proj->id,
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
