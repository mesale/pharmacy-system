<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\StockBatch;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class InventoryController extends Controller
{
    public function index(Request $request)
    {
        $query = Product::query()
            ->with('category:id,name')
            // Sellable stock (in date, in stock) summed per product. The
            // Product::getTotalStockAttribute accessor normalises this to a
            // clean int in the JSON — null (no batches) becomes 0 — so the
            // mobile client never does arithmetic on a missing field.
            ->withSum('sellableBatches as total_stock', 'quantity')
            ->orderBy('name');

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('barcode', 'like', "%{$search}%");
            });
        }

        // Keep the full pagination envelope ({data, current_page, last_page,
        // total, ...}) the mobile list relies on for infinite scroll.
        return response()->json($query->paginate(50));
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'category_id' => 'nullable|exists:categories,id',
            'barcode' => 'nullable|string|unique:products,barcode',
            'unit' => 'nullable|string|max:50',
            'selling_price' => 'required|numeric|min:0',
            'reorder_level' => 'nullable|integer|min:0',
            'requires_prescription' => 'boolean',
            'is_controlled' => 'boolean',
            // Optional opening stock. Stock only ever enters through a batch so
            // that cost and expiry are recorded — there is no flat stock column.
            'opening_quantity' => 'nullable|integer|min:0',
            'opening_cost_price' => 'nullable|numeric|min:0|required_with:opening_quantity',
            'opening_expiry_date' => 'nullable|date|required_with:opening_quantity',
        ]);

        $product = DB::transaction(function () use ($validated) {
            $product = Product::create([
                'name' => $validated['name'],
                'category_id' => $validated['category_id'] ?? null,
                'barcode' => $validated['barcode'] ?? null,
                'unit' => $validated['unit'] ?? null,
                'selling_price' => $validated['selling_price'],
                'reorder_level' => $validated['reorder_level'] ?? 0,
                'requires_prescription' => $validated['requires_prescription'] ?? false,
                'is_controlled' => $validated['is_controlled'] ?? false,
            ]);

            if (! empty($validated['opening_quantity'])) {
                StockBatch::create([
                    'product_id' => $product->id,
                    'cost_price' => $validated['opening_cost_price'],
                    'quantity' => $validated['opening_quantity'],
                    'expiry_date' => $validated['opening_expiry_date'],
                    'received_date' => now()->toDateString(),
                ]);
            }

            return $product;
        });

        return response()->json([
            'message' => 'Medicine added successfully',
            'product_id' => $product->id,
        ], 201);
    }

    public function update(Request $request, Product $product)
    {
        // Catalogue fields only. Stock levels are never edited here — they change
        // through batches (receiving) and adjustments (write-offs).
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'category_id' => 'nullable|exists:categories,id',
            'barcode' => 'nullable|string|unique:products,barcode,' . $product->id,
            'unit' => 'nullable|string|max:50',
            'selling_price' => 'required|numeric|min:0',
            'reorder_level' => 'nullable|integer|min:0',
            'requires_prescription' => 'boolean',
            'is_controlled' => 'boolean',
        ]);

        $product->update($validated);

        return response()->json(['message' => 'Medicine updated successfully'], 200);
    }
}
