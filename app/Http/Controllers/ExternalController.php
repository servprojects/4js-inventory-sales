<?php

namespace App\Http\Controllers;

use App\Branch;
use App\Brand;
use App\Item;
use App\Item_category;
use App\Supplier;
use App\Unit;
use Illuminate\Http\Request;

class ExternalController extends Controller
{
    public function index(Request $request)
    {
        $itemdata = Item::select('items.*')->get();
        $suppliers = Supplier::select('suppliers.*')->get();
        $branch = Branch::select('branches.*')->get();
        $cats = Item_category::select('item_categories.*')->get();
        $brand = Brand::select('brands.*')->get();
        $units = Unit::select('units.*')->get();

        return response()->json([
            // 'status' => 200,
            'items' =>  $itemdata,
            'suppliers' =>  $suppliers,
            'categories' =>  $cats,
            'branch' =>  $branch,
            'units' =>  $units,
            'brand' =>  $brand,
        ], 200);
    }
}
