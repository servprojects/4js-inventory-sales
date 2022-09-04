<?php

namespace App\Http\Controllers;

use App\Unit;
use Illuminate\Http\Request;

class UnitController extends Controller
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
            $col4 =  Unit::select('units.*')->get();
        } catch (Exception $e) {
        }

        return response()->json([
            'status' => 200,
            'units' => $col4,

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
         if (! $user = auth()->setRequest($request)->user()) {
            return $this->responseUnauthorized();
        }

       

        // Warning: Data isn't being fully sanitized yet.
        try {
            $unit = Unit::create([
                'name' => request('name'),
                'abv' => request('abbr'),
            ]);
            return response()->json([
                'status' => 201,
                'message' => 'Resource created.',
                'id' => $unit->id
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
        if (! $user = auth()->setRequest($request)->user()) {
            return $this->responseUnauthorized();
        }

       

        try {
            $unit = Unit::where('id', $id)->firstOrFail();
            
           
            if(request('name')){
                $unit->name = request('name');
            }
            if(request('abbr')){
                $unit->abv = request('abbr');
            }
           
            $unit->save();

            $col4 =  Unit::select('units.*')->get();
            // return $this->responseResourceUpdated();
            return response()->json([
                'status' => 200,
                'message' => 'Update successful',
                'units' => $col4
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
        if (! $user = auth()->setRequest($request)->user()) {
            return $this->responseUnauthorized();
        }

        $unit = Unit::where('id', $id)->firstOrFail();

        

        try {
         

           
                $unit->delete();
                // return $this->responseResourceDeleted();
                return response()->json([
                    'status' => 204,
                    'message' => "Deleted successfully"
                ], 204);
          

           

        } catch (Exception $e) {
            return $this->responseServerError('Error deleting resource.');
        }
    }
}
