<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Product;

class InventoryController extends Controller
{
    public function index(Request $request)
    {
        $query = Product::with(['category', 'stockBatches' => function ($q) {
            $q->where('quantity', '>', 0)->orderBy('expiry_date', 'asc');
        }])->withSum('stockBatches as total_stock', 'quantity');

        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('barcode', 'like', "%{$search}%");
            });
        }

        if ($request->has('barcode')) {
            $query->where('barcode', $request->barcode);
        }

        // Must have stock for POS, but maybe admin wants all. Let's just return all, with total_stock computed.
        $products = $query->paginate(50);

        return response()->json($products);
    }
}
