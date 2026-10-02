<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Services\SaleService;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PosController extends Controller
{
    public function index(Request $request)
    {
        $products = Product::with([
                'category:id,name',
                // Only sellable batches reach the terminal, so the FEFO badge shows
                // the soonest expiry that can actually be dispensed.
                'sellableBatches:id,product_id,expiry_date,quantity',
            ])
            ->withSum('sellableBatches as total_stock', 'quantity')
            ->whereHas('sellableBatches')
            ->when($request->search, function ($q, $s) {
                // Grouped so the OR does not escape the sellable-stock filter.
                $q->where(function ($inner) use ($s) {
                    $inner->where('name', 'like', "%{$s}%")
                        ->orWhere('barcode', 'like', "%{$s}%");
                });
            })
            ->orderBy('name')
            ->get();

        return Inertia::render('Pos/Index', ['products' => $products]);
    }

    public function checkout(Request $request, SaleService $saleService)
    {
        $validated = $request->validate([
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|integer|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
            'payment_method' => 'required|string|in:cash,card,insurance',
            'tendered_amount' => 'nullable|numeric|min:0',
        ]);

        // The FEFO dispensing + sale recording lives in SaleService so the web
        // till and the mobile API stay in lockstep. A ValidationException thrown
        // there (insufficient stock, underpaid cash) is turned by Inertia into a
        // redirect back with errors — exactly what this endpoint returned before.
        $saleService->checkout(
            $validated['items'],
            $validated['payment_method'],
            $request->user()->id,
            isset($validated['tendered_amount']) ? (float) $validated['tendered_amount'] : null,
        );

        return redirect()->back()->with('success', 'Sale completed successfully!');
    }
}
