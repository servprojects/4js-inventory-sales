<?php

namespace App\Http\Controllers;

use App\SystemMode;
use Illuminate\Http\Request;

class SystemModeController extends Controller
{
    public function getSpecs(Request $request)
    {
        // Get user from $request token.
        if (!$user = auth()->setRequest($request)->user()) {
            return $this->responseUnauthorized();
        }


        try {


            $sysmode = SystemMode::where('environment', 'local')->first();

            $spec = 'regular';

            if(!is_null($sysmode)){
                if($sysmode->mode == 'pos'){
                    $spec = 'pos';
                }
            }

            return response()->json([
                'status' => 200,
                'spec' =>$spec,
            ], 200);
        } catch (Exception $e) {
        }
    }
}
