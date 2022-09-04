<?php

namespace App\Http\Controllers;

use App\Department;
use App\Employee;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class DepartmentController extends Controller
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

    // $collection = new Position();

    // $collection = $collection->latest()->paginate();

    // return new PositionCollection($collection);
    try {


        $collection2 = Department::select('departments.*')->get();
    } catch (Exception $e) {
    }

    return response()->json([
        'status' => 200,
        'department' => $collection2,
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

        // Validate all the required parameters have been sent.
        $validator = Validator::make($request->all(), [
            'name' => 'required',
        ]);

        if ($validator->fails()) {
            return $this->responseUnprocessable($validator->errors());
        }

        // Warning: Data isn't being fully sanitized yet.
        try {
            $dept = Department::create([
                'name' => request('name'),
            ]);
            return response()->json([
                'status' => 201,
                'message' => 'Resource created.',
                'id' => $dept->id
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
            $dept = Department::where('id', $id)->firstOrFail();



            $dept->name = request('name');
            $dept->save();
            // return $this->responseResourceUpdated();
            $collection = Department::select('departments.*')->get();

            return response()->json([
                'status' => 200,
                'message' => 'Update successful',
                'updated' => $collection
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
    public function destroy(Request $request,$id)
    {
          // Get user from $request token.
          if (!$user = auth()->setRequest($request)->user()) {
            return $this->responseUnauthorized();
        }

        $dept = Department::where('id', $id)->firstOrFail();



        try {
            $confirm = Employee::where('dept_id', '=', $id)->first();

            if (!empty($confirm)) {
                return response()->json([
                    'status' => 0,
                ], 0);
            } else {
                $dept->delete();
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
}
