<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\StockBatch;
use Illuminate\Http\Request;

class StockBatchController extends Controller
{
    public function store(Request $request, Product $product)
    {
        $validated = $request->validate([
            'batch_number'  => 'required|string',
            'cost_price'    => 'required|numeric|min:0',
            'quantity'      => 'required|integer|min:1',
            'expiry_date'   => 'required|date',
            'received_date' => 'required|date',
            'supplier_id'   => 'nullable|exists:suppliers,id',
        ]);

        $product->stockBatches()->create($validated);

        return redirect()->back();
    }

    public function update(Request $request, StockBatch $batch)
    {
        $validated = $request->validate([
            'quantity' => 'required|integer|min:0',
        ]);

        $batch->update($validated);

        return redirect()->back();
    }
}
