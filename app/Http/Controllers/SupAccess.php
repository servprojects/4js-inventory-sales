<?php

namespace App\Http\Controllers;

use App\Pin;
use App\User_detail;
use Illuminate\Http\Request;

class SupAccess extends Controller
{
    public function supacc(Request $request)
    {
        if (!$user = auth()->setRequest($request)->user()) {
            return $this->responseUnauthorized();
        }
        try {
            $activeUser =  User_detail::where('id', $user->user_details_id)->firstOrFail();

            $nip =  Pin::where('type', $activeUser->role)->where('pin',request('nip'))->first();

            if(is_null($nip)){
                $grant = 'no';
            }else{
                $grant = 'yes';
            }
            
         


        } catch (Exception $e) {
        }



        return response()->json([
            'status' => 200,
            'grant' => $grant,


        ], 200);
    }
}
