<?php

namespace App\Http\Controllers\Auth;

use Illuminate\Support\Facades\Auth;
use App\Http\Controllers\APIController;

use App\Branch;
use App\Item_count;
use App\PhysicalCount;
use DateTime;
use DateTimeZone;
use Illuminate\Console\Command;
use DB;


class LoginController extends APIController
{

    /**
     * Get a JWT via given credentials.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function login()
    {
        $credentials = request(['email', 'password']);

        if (!$token = auth()->attempt($credentials)) {
            return $this->responseUnauthorized();
        }

        // Get the user data.
        $user = auth()->user();

        if ($user->hashid) {
           
            if (date('Y-m-d') == date('Y-m-01')) {
                $pcnt = PhysicalCount::where('date', '=', date('Y-m-01'))->where('description', '=', "Monthly")->first();
               
                if (is_null($pcnt)) {
                    $this->phys();
                }
            }
        }




        return response()->json([
            'status' => 200,
            'message' => 'Authorized.',
            'access_token' => $token,
            'token_type' => 'bearer',
            'expires_in' => auth()->factory()->getTTL() * 60,
            'user' => array(
                'id' => $user->hashid,
                'name' => $user->name
            )
        ], 200);
    }

    function phys()
    {
        $dateup = new DateTime("now", new DateTimeZone('Asia/Manila'));
        $dup = $dateup->format('Y-m-d H:i:s');

        $branches = Branch::select('branches.*')->get();

        foreach ($branches as $b) {
            $itcount = Item_count::join('items', 'item_counts.item_id', '=', 'items.id')
                ->join('brands', 'items.brand_id', '=', 'brands.id')
                ->where('branch_id', '=', $b['id'])
                // ->where('branch_id', '=', request('branch_id'))
                ->select(
                    'item_counts.item_id',
                    'items.code',
                    'brands.name as brand',
                    'items.size',
                    'items.unit',
                    'items.unit_price',
                    'items.original_price',
                    'items.name',
                    'items.category_id',
                    'balance as sys_count',
                    DB::raw('(0) as phys_count')
                )
                ->get();

            $curd = date("Y-m-d");
            $new = PhysicalCount::create([
                'branch_id' => $b['id'],
                'date' => $curd,
                'items' => $itcount,
                'live_update' => "no",
                'syscount_date' => $dup,
                'description' => "Monthly",
            ]);
        }
    }
}
