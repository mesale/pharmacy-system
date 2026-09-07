<?php

namespace App\Http\Controllers;

use App\Models\Category;
use App\Models\Product;
use App\Models\Supplier;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        return Inertia::render('Products/Index', [
            'products' => Product::with('category')
                ->withSum('stockBatches as total_stock', 'quantity')
                ->withSum('sellableBatches as sellable_stock', 'quantity')
                ->when($request->search, function ($q, $s) {
                    $q->where(function ($inner) use ($s) {
                        $inner->where('name', 'like', "%{$s}%")
                            ->orWhere('barcode', 'like', "%{$s}%");
                    });
                })
                ->when($request->category_id, fn ($q, $c) => $q->where('category_id', $c))
                ->orderBy('name')
                ->paginate(20)
                ->withQueryString(),
            'categories' => Category::orderBy('name')->get(),
            'filters' => $request->only('search', 'category_id'),
        ]);
    }

    public function create()
    {
        return Inertia::render('Products/Create', [
            'categories' => Category::orderBy('name')->get(),
        ]);
    }

    public function edit(Product $product)
    {
        // Products/Create doubles as the edit form. It existed but no route
        // rendered it, so a product could never be edited through the UI.
        return Inertia::render('Products/Create', [
            'product'    => $product,
            'categories' => Category::orderBy('name')->get(),
        ]);
    }

    public function show(Request $request, Product $product)
    {
        $product->load(['category', 'stockBatches.supplier']);

        // Cost price is admin-only information: a worker who can see it can
        // work out the pharmacy's margin on every line they dispense.
        $isAdmin = $request->user()->hasRole('admin');

        if (! $isAdmin) {
            $product->stockBatches->each->setHidden(['cost_price']);
        }

        return Inertia::render('Products/Show', [
            'product'     => $product,
            'suppliers'   => Supplier::orderBy('name')->get(),
            'canViewCost' => $isAdmin,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate($this->rules());

        $product = Product::create($validated);

        return redirect()->route('products.show', $product);
    }

    public function update(Request $request, Product $product)
    {
        $validated = $request->validate($this->rules($product));

        $product->update($validated);

        return redirect()->back()->with('success', 'Product updated.');
    }

    public function destroy(Product $product)
    {
        // Sale items reference the product, so deleting it would either fail at the
        // database or destroy the sales history it is part of.
        if ($product->saleItems()->exists()) {
            throw ValidationException::withMessages([
                'product' => 'This product has sales history and cannot be deleted. '
                    . 'Set its stock to zero to retire it instead.',
            ]);
        }

        $product->delete();

        return redirect()->route('products.index')->with('success', 'Product deleted.');
    }

    /**
     * @return array<string, mixed>
     */
    private function rules(?Product $product = null): array
    {
        return [
            'name'                  => 'required|string|max:255',
            'selling_price'         => 'required|numeric|min:0',
            'category_id'           => 'nullable|exists:categories,id',
            // The column carries a unique index; without this rule a duplicate
            // barcode surfaces as a 500 instead of a field error.
            'barcode'               => [
                'nullable', 'string', 'max:100',
                Rule::unique('products', 'barcode')->ignore($product),
            ],
            'unit'                  => 'nullable|string|max:50',
            'reorder_level'         => 'nullable|integer|min:0',
            'requires_prescription' => 'nullable|boolean',
            'is_controlled'         => 'nullable|boolean',
        ];
    }
}
