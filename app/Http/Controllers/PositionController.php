<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use App\Http\Controllers\APIController;
use App\Http\Resources\PositionCollection;
use App\Http\Resources\PositionResource;
use App\Position;
use App\User_detail;

class PositionController extends Controller
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


            $collection2 = Position::select('positions.*')
                ->where('id', '!=', 1)
                ->where('id', '!=', 2)
                ->where('id', '!=', 3)
                ->where('id', '!=', 4);
            $collection2 = $collection2->latest()->paginate();
        } catch (Exception $e) {
        }

        return response()->json([
            'status' => 200,
            'positions' => $collection2,
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
            $position = Position::create([
                'name' => request('name'),
            ]);
            return response()->json([
                'status' => 201,
                'message' => 'Resource created.',
                'id' => $position->id
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

        // // Validates data.
        // $validator = Validator::make($request->all(), [
        //     'name' => 'string',
        // ]);

        // if ($validator->fails()) {
        //     return $this->responseUnprocessable($validator->errors());
        // }

        try {
            $position = Position::where('id', $id)->firstOrFail();



            $position->name = request('name');
            $position->save();
            // return $this->responseResourceUpdated();
            $collection = Position::select('positions.*')
            ->where('id', '!=', 1)
            ->where('id', '!=', 2)
            ->where('id', '!=', 3)
            ->where('id', '!=', 4);
            $collection = $collection->latest()->paginate();

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
    public function destroy(Request $request, $id)
    {
        // Get user from $request token.
        if (!$user = auth()->setRequest($request)->user()) {
            return $this->responseUnauthorized();
        }

        $position = Position::where('id', $id)->firstOrFail();



        try {
            $confirm = User_detail::where('position_id', '=', $id)->first();

            if (!empty($confirm)) {
                return response()->json([
                    'status' => 0,
                ], 0);
            } else {
                $position->delete();
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
