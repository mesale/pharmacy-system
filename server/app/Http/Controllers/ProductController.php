<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Product;
use App\Models\Supplier;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        return Inertia::render('Products/Index', [
            'products' => Product::with('category')
                ->withSum('stockBatches as total_stock', 'quantity')
                ->when($request->search, fn ($q, $s) => $q->where('name', 'like', "%{$s}%"))
                ->when($request->category_id, fn ($q, $c) => $q->where('category_id', $c))
                ->paginate(20),
            'categories' => Category::all(),
        ]);
    }

    public function show(Product $product)
    {
        return Inertia::render('Products/Show', [
            'product'   => $product->load(['category', 'stockBatches.supplier']),
            'suppliers' => Supplier::all(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'                  => 'required|string',
            'selling_price'         => 'required|numeric|min:0',
            'category_id'           => 'nullable|exists:categories,id',
            'barcode'               => 'nullable|string',
            'unit'                  => 'nullable|string',
            'reorder_level'         => 'nullable|integer|min:0',
            'requires_prescription' => 'nullable|boolean',
            'is_controlled'         => 'nullable|boolean',
        ]);

        $product = Product::create($validated);

        return redirect()->route('products.show', $product);
    }

    public function update(Request $request, Product $product)
    {
        $validated = $request->validate([
            'name'                  => 'required|string',
            'selling_price'         => 'required|numeric|min:0',
            'category_id'           => 'nullable|exists:categories,id',
            'barcode'               => 'nullable|string',
            'unit'                  => 'nullable|string',
            'reorder_level'         => 'nullable|integer|min:0',
            'requires_prescription' => 'nullable|boolean',
            'is_controlled'         => 'nullable|boolean',
        ]);

        $product->update($validated);

        return redirect()->back();
    }

    public function destroy(Product $product)
    {
        $product->delete();

        return redirect()->route('products.index');
    }
}
