<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Supplier;

class SupplierController extends Controller
{
    public function index()
    {
        $suppliers = Supplier::withCount("stockBatches")->orderBy("name")->get();
        return response()->json(["data" => $suppliers]);
    }
}
