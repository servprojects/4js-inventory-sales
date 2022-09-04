<?php

namespace App\Http\Controllers;

use App\Department;
use Illuminate\Http\Request;
use App\Employee;
use App\Payroll;
use App\Position;
use DB;

class PayrollEmpController extends Controller
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
            $collection =  Employee::leftJoin('departments', 'employees.dept_id', '=', 'departments.id')
                ->leftJoin('positions', 'employees.position_id', '=', 'positions.id')
                ->select(
                    'employees.*',
                    DB::raw('CONCAT(employees.last_name,"," , employees.first_name) as name'),
                    'departments.name as department',
                    'positions.name as position'
                )
                ->get();

            $position = Position::select('positions.id', 'positions.name')->get();
            $dept = Department::select('departments.id', 'departments.name')->get();
        } catch (Exception $e) {
        }



        return response()->json([
            'status' => 200,
            'employee' => $collection,
            'position' => $position,
            'department' => $dept,
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


        // Warning: Data isn't being fully sanitized yet.
        try {



            $userdet = Employee::create([
                'dept_id' => request('dept_id'),
                'emp_id' => request('emp_id'),
                'first_name' => request('first_name'),
                'middle_name' =>  request('middle_name'),
                'last_name' => request('last_name'),
                'position_id' => request('position_id'),
                'position_no' => request('position_no'),
                'contac_no' => request('contac_no'),
                'start_work' => request('start_work'),
                'rate_per_day' => request('rate_per_day'),
                'rate_per_hour' => request('rate_per_hour'),
                'rate_per_hour_ot' => request('rate_per_hour_ot'),
                'birthday' => request('birthday'),
                'address' => request('address'),
                'in_case_emerg' => request('in_case_emerg'),
                'rel_to_emp' => request('rel_to_emp'),
            ]);


            return response()->json([
                'status' => 201,
                'message' => 'Resource created.',
                'id' => $userdet->id,

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

        // Validates data.
        // $validator = Validator::make($request->all(), [
        //     'name' => 'string',
        //     'address' => 'string'
        // ]);

        // if ($validator->fails()) {
        //     return $this->responseUnprocessable($validator->errors());
        // }

        try {
            $emp = Employee::where('id', $id)->firstOrFail();

            if (request('dept_id')) {
                $emp->dept_id = request('dept_id');
            }
            if (request('emp_id')) {
                $emp->emp_id = request('emp_id');
            }
            if (request('first_name')) {
                $emp->first_name = request('first_name');
            }
            if (request('middle_name')) {
                $emp->middle_name = request('middle_name');
            }
            if (request('last_name')) {
                $emp->last_name = request('last_name');
            }
            if (request('position_id')) {
                $emp->position_id = request('position_id');
            }
            if (request('position_no')) {
                $emp->position_no = request('position_no');
            }
            if (request('contac_no')) {
                $emp->contac_no = request('contac_no');
            }
            if (request('start_work')) {
                $emp->start_work = request('start_work');
            }
            if (request('rate_per_day')) {
                $emp->rate_per_day = request('rate_per_day');
            }
            if (request('rate_per_hour')) {
                $emp->rate_per_hour = request('rate_per_hour');
            }
            if (request('rate_per_hour_ot')) {
                $emp->rate_per_hour_ot = request('rate_per_hour_ot');
            }
            if (request('birthday')) {
                $emp->birthday = request('birthday');
            }
            if (request('address')) {
                $emp->address = request('address');
            }
            if (request('in_case_emerg')) {
                $emp->in_case_emerg = request('in_case_emerg');
            }
            if (request('rel_to_emp')) {
                $emp->rel_to_emp = request('rel_to_emp');
            }



            $emp->save();

            // $collection = Supplier::select('suppliers.*')->where('id', '!=', 1);
            // $collection = $collection->latest()->paginate();

            $collection =  Employee::leftJoin('departments', 'employees.dept_id', '=', 'departments.id')
                ->leftJoin('positions', 'employees.position_id', '=', 'positions.id')
                ->select(
                    'employees.*',
                    DB::raw('CONCAT(employees.last_name,"," , employees.first_name) as name'),
                    'departments.name as department',
                    'positions.name as position'
                )
                ->get();

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
        if (!$user = auth()->setRequest($request)->user()) {
            return $this->responseUnauthorized();
        }

        $emp = Employee::where('id', $id)->firstOrFail();



        try {
            $payroll = Payroll::where('emp_id', '=', $id)->first();

            if (!empty($payroll)) {
                return response()->json([
                    'status' => 0,

                ], 0);
            } else {
                $emp->delete();
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

    public function importEmp(Request $request)
    {
        if (!$user = auth()->setRequest($request)->user()) {
            return $this->responseUnauthorized();
        }
        try {

            $itmObj = json_decode(request('items'), true);
            // if (is_array($itmObj) || is_object($itmObj)) {
            foreach ($itmObj as $itm) {

                if (!$itm["id"] == "") {
                    $bday = str_replace('/', '-', $itm["birthday"]);

                    $dep = 1;
                    if ($itm["department"]) {
                        $depart =  Department::where('name', $itm["department"])->first();
                        if (is_null($depart)) {
                            $dept = Department::create([
                                'name' =>  $itm["department"],
                            ]);
                            $dep = $dept->id;
                        } else {
                            $dep = $depart->id;
                        }
                    }
                    $pos = 20;
                    if ($itm["position_title"]) {
                        $position =  Position::where('name', $itm["position_title"])->first();
                        if (is_null($position)) {
                            $post = Position::create([
                                'name' => $itm["position_title"],
                            ]);
                            $pos = $post->id;
                        } else {
                            $pos = $position->id;
                        }
                    }
                    $perHour = (float) $itm["rate_per_day"] / 8;
                    $userdet = Employee::create([
                        'dept_id' => $dep,
                        'emp_id' => $itm["id_no"],
                        'first_name' => $itm["first_name"],
                        'middle_name' =>  $itm["middle_name"],
                        'last_name' => $itm["last_name"],
                        'position_id' => $pos,
                        'position_no' => $itm["position_no"],
                        'contac_no' => $itm["contact_no"],
                        'start_work' => $itm["start_work"],
                        'rate_per_day' => (float)$itm["rate_per_day"],
                        'rate_per_hour' => $perHour,
                        'rate_per_hour_ot' => $itm["rate_per_hour_ot"],
                        'birthday' => $bday,
                        'address' => $itm["address"],
                        'in_case_emerg' => $itm["incase_emergency"],
                        'rel_to_emp' => $itm["relationship_employee"],
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
}
