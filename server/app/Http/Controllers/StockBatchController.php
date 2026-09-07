<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\StockAdjustment;
use App\Models\StockBatch;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class StockBatchController extends Controller
{
    public function store(Request $request, Product $product)
    {
        $validated = $request->validate([
            'batch_number'  => 'required|string|max:100',
            'cost_price'    => 'required|numeric|min:0',
            'quantity'      => 'required|integer|min:1',
            'received_date' => 'required|date|before_or_equal:today',
            // Booking stock that is already expired puts unsellable units on the
            // books and skews every stock figure.
            'expiry_date'   => 'required|date|after:today|after:received_date',
            'supplier_id'   => 'nullable|exists:suppliers,id',
        ]);

        $product->stockBatches()->create($validated);

        return redirect()->back()->with('success', 'Batch added.');
    }

    public function update(Request $request, StockBatch $batch)
    {
        $validated = $request->validate([
            'quantity' => 'required|integer|min:0',
            'reason' => 'required|string|in:damaged,expired,missing,correction',
            'notes' => 'nullable|string|max:2000',
        ]);

        DB::transaction(function () use ($validated, $request, $batch) {
            $locked = StockBatch::whereKey($batch->getKey())->lockForUpdate()->firstOrFail();

            $newQuantity = (int) $validated['quantity'];
            $change = $newQuantity - (int) $locked->quantity;

            if ($change === 0) {
                throw ValidationException::withMessages([
                    'quantity' => 'That is already the current quantity for this batch.',
                ]);
            }

            $locked->update(['quantity' => $newQuantity]);

            // Every stock movement is recorded, so a corrected quantity can always
            // be traced back to who changed it and why.
            StockAdjustment::create([
                'product_id' => $locked->product_id,
                'stock_batch_id' => $locked->id,
                'adjusted_by' => $request->user()->id,
                'quantity_change' => $change,
                'reason' => $validated['reason'],
                'notes' => $validated['notes'] ?? null,
            ]);
        });

        return redirect()->back()->with('success', 'Batch quantity updated and logged.');
    }
}
