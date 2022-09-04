<?php

namespace App\Http\Controllers;

use App\Employee;
use App\Payroll;
use App\PayrollRange;
use Illuminate\Http\Request;
use DB;

class Payrolls
{
    public $prId;
    public $info;
    public $ranges;
}

class PayrollController extends Controller
{
    /**
     * Display a listing of the resource.
     *
     * @return \Illuminate\Http\Response
     */
    public function index()
    {
        //
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


        // Warning: Data isn't being fully sanitized yet.
        try {

            $searchPay =  Payroll::where('beg_date', request('beg_date'))->where('end_date', request('end_date'))
                ->where('emp_id', request('emp_id'))
                ->get();

            if ($searchPay->isEmpty()) {

                $payroll = Payroll::create([
                    'cash_ad' => request('cash_ad'),
                    'deduction' => request('deduction'),
                    'incentive' => request('incentive'),
                    'rate_per_hour' => request('rate_per_hour'),
                    'rate_per_hour_ot' => request('rate_per_hour_ot'),
                    'emp_id' => request('emp_id'),
                    'beg_date' => request('beg_date'),
                    'end_date' => request('end_date'),

                ]);

                $itmObj = json_decode(request('payranges'), true);
                foreach ($itmObj as $itm) {

                    $prange = PayrollRange::create([
                        'normal' => $itm['normal'],
                        'ot' => $itm['ot'],
                        'payroll_id' => $payroll->id,
                        'date' => $itm['date'],

                    ]);
                }
            } else {
                $expayroll = Payroll::where('beg_date', request('beg_date'))->where('end_date', request('end_date'))
                    ->where('emp_id', request('emp_id'))->firstOrFail();



                if (request('cash_ad')) {
                    $expayroll->cash_ad = request('cash_ad');
                }
                if (request('deduction')) {
                    $expayroll->deduction = request('deduction');
                }
                if (request('incentive')) {
                    $expayroll->incentive = request('incentive');
                }
                if (request('rate_per_hour')) {
                    $expayroll->rate_per_hour = request('rate_per_hour');
                }
                if (request('rate_per_hour_ot')) {
                    $expayroll->rate_per_hour_ot = request('rate_per_hour_ot');
                }

                $expayroll->save();

                $itmObj = json_decode(request('payranges'), true);
                foreach ($itmObj as $itm) {
                    // stop here

                    $expayrollrng = PayrollRange::where('date', $itm['date'])->where('payroll_id', $expayroll->id)
                        ->firstOrFail();
                    $expayrollrng->normal = $itm['normal'];
                    $expayrollrng->ot = $itm['ot'];

                    $expayrollrng->save();
                }

                // stop here
            }




            return response()->json([
                'status' => 201,
                'message' => 'Resource created.',
                // 'id' => $payroll->id,

            ], 201);
        } catch (Exception $e) {
            return $this->responseServerError('Error creating resource.');
        }
    }
    public function getPayroll(Request $request)
    {
        // Get user from $request token.
        if (!$user = auth()->setRequest($request)->user()) {
            return $this->responseUnauthorized();
        }


        // Warning: Data isn't being fully sanitized yet.
        try {



            $searchPay =  Payroll::where('beg_date', request('beg_date'))->where('end_date', request('end_date'))
                ->where('emp_id', request('emp_id'))
                ->get();

            $expayrollrng = PayrollRange::where('payroll_id', $searchPay[0]->id)
                ->get();

            return response()->json([
                'status' => 200,
                'message' => 'Resource created.',
                'payroll' => $expayrollrng,
                'prinfo' => $searchPay,
                'stat' => $searchPay->isEmpty() ? 100 : 150,


            ], 200);
        } catch (Exception $e) {
            return $this->responseServerError('Error creating resource.');
        }
    }
    public function getSummary(Request $request)
    {
        // Get user from $request token.
        if (!$user = auth()->setRequest($request)->user()) {
            return $this->responseUnauthorized();
        }


        // Warning: Data isn't being fully sanitized yet.
        try {



            // $searchPay =  Payroll::where('beg_date', request('beg_date'))->where('end_date', request('end_date'))
            // ->where('emp_id', request('emp_id'))
            // ->get();

            $summary = PayrollRange::join('payrolls', 'payroll_ranges.payroll_id', '=', 'payrolls.id')
                ->join('employees', 'payrolls.emp_id', '=', 'employees.id')
                ->join('positions', 'employees.position_id', '=', 'positions.id')
                ->where('payrolls.beg_date', request('beg_date'))->where('payrolls.end_date', request('end_date'))
                ->select(
                    'payroll_ranges.payroll_id as id',
                    DB::raw('CONCAT(employees.first_name," " , employees.last_name) as employee'),
                    'employees.rate_per_day',
                    DB::raw('(8) as work_hours'),
                    DB::raw('SUM(payroll_ranges.normal) as project_hours'),
                    'employees.rate_per_hour',
                    DB::raw('SUM(payroll_ranges.normal) as total_hours'),
                    DB::raw('(employees.rate_per_hour * SUM(payroll_ranges.normal) )as gross'),
                    'payrolls.incentive',
                    'employees.rate_per_hour_ot',
                    DB::raw('SUM(payroll_ranges.ot) as total_ot'),
                    'payrolls.cash_ad',
                    'payrolls.deduction',
                    DB::raw('
                   (
                       (
                        (SUM(payroll_ranges.ot) * employees.rate_per_hour_ot) +
                        (SUM(payroll_ranges.normal) * employees.rate_per_hour) +
                        payrolls.incentive
                        )
                        -
                        payrolls.cash_ad
                        -
                        payrolls.deduction
                    )as net'),

                    'positions.name as position'
                )
                ->groupBy('payroll_ranges.payroll_id')
                ->get();

            $emps = Employee::join('positions', 'employees.position_id', '=', 'positions.id')
                ->whereIn('positions.name', ['Operation Manager', 'Account Manager', 'Secretary'])
                ->select(
                    DB::raw('CONCAT(employees.first_name," " , employees.last_name) as employee'),
                    'positions.name as position',
                )
                ->get();

            return response()->json([
                'status' => 200,
                'message' => 'Resource created.',
                'summary' => $summary,
                'assig' => $emps,


            ], 200);
        } catch (Exception $e) {
            return $this->responseServerError('Error creating resource.');
        }
    }


    public function printPayrolls(Request $request)
    {

        // Get user from $request token.
        if (!$user = auth()->setRequest($request)->user()) {
            return $this->responseUnauthorized();
        }


        // Warning: Data isn't being fully sanitized yet.
        try {
            $itmObj = json_decode(request('emps'), true);


            $pays = [];
            foreach ($itmObj as $itm) {
                // $payable += $itm["total"];
                $searchPay =  Payroll::join('employees', 'payrolls.emp_id', '=', 'employees.id')
                    ->where('beg_date', request('beg_date'))->where('end_date', request('end_date'))
                    ->where('payrolls.emp_id', $itm['id'])
                    ->select(
                        'payrolls.id',
                        'payrolls.cash_ad',
                        'payrolls.deduction',
                        'payrolls.incentive',
                        'payrolls.rate_per_hour',
                        'payrolls.rate_per_hour_ot',
                        'employees.first_name',
                        'employees.last_name',
                    )
                    ->get();

                $expayrollrng = PayrollRange::where('payroll_id', $searchPay[0]->id)
                    ->select('payroll_ranges.normal', 'payroll_ranges.ot', 'payroll_ranges.date')
                    ->get();

                $empPay = new Payroll();
                $empPay->prId = $searchPay[0]->id;
                $empPay->info = $searchPay;
                $empPay->ranges = $expayrollrng;

                $pays[] = $empPay;
            }

            return response()->json([
                'status' => 200,
                'payroll' => $pays,

            ], 200);
        } catch (Exception $e) {
            return $this->responseServerError('Error creating resource.');
        }
    }
    /**
     * Display the specified resource.
     *
     * @param  \App\Payroll  $payroll
     * @return \Illuminate\Http\Response
     */
    public function show(Payroll $payroll)
    {
        //
    }

    /**
     * Show the form for editing the specified resource.
     *
     * @param  \App\Payroll  $payroll
     * @return \Illuminate\Http\Response
     */
    public function edit(Payroll $payroll)
    {
        //
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  \App\Payroll  $payroll
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, Payroll $payroll)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  \App\Payroll  $payroll
     * @return \Illuminate\Http\Response
     */
    public function destroy(Payroll $payroll)
    {
        //
    }
}
