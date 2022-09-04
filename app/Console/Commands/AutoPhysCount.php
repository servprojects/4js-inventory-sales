<?php

namespace App\Console\Commands;

use App\Branch;
use App\Item_count;
use App\PhysicalCount;
use DateTime;
use DateTimeZone;
use Illuminate\Console\Command;
use DB;
class AutoPhysCount extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'physcount:month';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Record monthly item balances of all branches';

    /**
     * Create a new command instance.
     *
     * @return void
     */
    public function __construct()
    {
        parent::__construct();
    }

    /**
     * Execute the console command.
     *
     * @return int
     */
    public function handle()
    {
        $dateup = new DateTime("now", new DateTimeZone('Asia/Manila'));
        $dup = $dateup->format('Y-m-d H:i:s');

        $branches = Branch::select('branches.*')->get();

        foreach ($branches as $b) {
            $itcount = Item_count::join('items', 'item_counts.item_id', '=', 'items.id')
                ->join('brands', 'items.brand_id', '=', 'brands.id')
                ->where('branch_id', '=', request('branch_id'))
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
                'live_update' => "yes",
                'syscount_date' => $dup,
                'description' => "Monthly",
            ]);
        }
        $this->info('Physical count saved successfully');
        // return 0;
    }
}
