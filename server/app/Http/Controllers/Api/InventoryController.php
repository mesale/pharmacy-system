<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Product;

class InventoryController extends Controller
{
    public function index(Request $request)
    {
        $query = Product::orderBy("name");
        if ($request->has("search")) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where("name", "like", "%{$search}%")
                  ->orWhere("barcode", "like", "%{$search}%");
            });
        }
        return response()->json($query->paginate(50));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            "name" => "required|string",
            "barcode" => "nullable|string|unique:products",
            "cost_price" => "required|numeric|min:0",
            "selling_price" => "required|numeric|min:0",
            "stock" => "required|integer|min:0"
        ]);
        Product::create($validated);
        return response()->json(["message" => "Medicine added successfully"], 201);
    }

    public function update(Request $request, Product $product)
    {
        $validated = $request->validate([
            "name" => "required|string",
            "cost_price" => "required|numeric|min:0",
            "selling_price" => "required|numeric|min:0",
            "stock" => "required|integer|min:0"
        ]);
        $product->update($validated);
        return response()->json(["message" => "Medicine updated successfully"], 200);
    }
}
