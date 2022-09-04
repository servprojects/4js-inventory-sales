<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use App\Http\Controllers\APIController;
use App\Http\Resources\BrandCollection;
use App\Http\Resources\BrandResource;
use App\Brand;
use App\Item;

class BrandController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index(Request $request)
    {
      // Get user from $request token.
      if (! $user = auth()->setRequest($request)->user()) {
        return $this->responseUnauthorized();
         }

    // $collection = Brand::all();
    // $collection = new Brand();
    $collection = Brand::select('brands.*')->where('id', '!=' , 1);
    
    $collection = $collection->latest()->paginate();

    

    return new BrandCollection($collection);
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

        // Validate all the required parameters have been sent.
        $validator = Validator::make($request->all(), [
            'name' => 'required',
        ]);

        if ($validator->fails()) {
            return $this->responseUnprocessable($validator->errors());
        }

        // Warning: Data isn't being fully sanitized yet.
        try {
            $brand = Brand::create([
                'name' => request('name'),
            ]);
            return response()->json([
                'status' => 201,
                'message' => 'Resource created.',
                'id' => $brand->id
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
    public function update(Request $request,$id)
    {
         // Get user from $request token.
         if (! $user = auth()->setRequest($request)->user()) {
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
            $brand = Brand::where('id', $id)->firstOrFail();
            
           
            
            $brand->name = request('name');
            $brand->save();

            $collection = Brand::select('brands.*')->where('id', '!=' , 1);
            $collection = $collection->latest()->paginate();
            // return $this->responseResourceUpdated();
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
        if (! $user = auth()->setRequest($request)->user()) {
            return $this->responseUnauthorized();
        }

        $brand = Brand::where('id', $id)->firstOrFail();

        

        try {
            $confirm = Item::where('brand_id', '=', $id)->first();

            if (!empty($confirm)) {
                return response()->json([
                    'status' => 0,
                    
                ], 0);
            }else{
                $brand->delete();
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
