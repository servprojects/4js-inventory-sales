<?php

namespace App\Http\Controllers;

use Illuminate\Support\Facades\Auth;
use App\Http\Controllers\APIController;

use App\ResetCount;
use App\Transaction;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class ResetCountController extends Controller
{
    public function index(Request $request)
    {
        // Get user from $request token.
        if (!$user = auth()->setRequest($request)->user()) {
            return $this->responseUnauthorized();
        }

        try {

            $cureset = ResetCount::select('reset_counts.count')->where('type', 'sale')->first();

            $curcounter = Transaction::select('transactions.counter_no')->where('transaction_type', 'sale')->where('reset_no', $cureset->count)->WhereNotNull('counter_no')->orderBy('counter_no', 'DESC')->first();

            $curct = 0;
            if (!is_null($curcounter)) {
                $curct = $curcounter->counter_no;
            }

            return response()->json([
                'status' => 200,
                'cureset' => $cureset->count,
                'email' => $user->email,
                'curcounter' => $curct,
            ], 200);
        } catch (Exception $e) {
        }
    }

    public function resetCounter(Request $request)
    {
        // Get user from $request token.
        if (!$user = auth()->setRequest($request)->user()) {
            return $this->responseUnauthorized();
        }

        try {

            // $credentials = request(['email', 'password']);

            if (Hash::check(request('password'), $user->password)) {
                $reset = ResetCount::where('type', 'sale')->first();
                $reset->count += 1;
                $reset->save();

                return response()->json([
                    'status' => 200,
                    'credentials' => "success",
                    'pass' => Hash::make(request('password')),
                    'actpass' => $user->password,
                ], 200);
            } else {
                return response()->json([
                    'status' => 200,
                    'credentials' => "failed"
                ], 200);
            }
        } catch (Exception $e) {
            return response()->json([
                'status' => 200,
                'credentials' => "failed"
            ], 200);
        }
    }
}
