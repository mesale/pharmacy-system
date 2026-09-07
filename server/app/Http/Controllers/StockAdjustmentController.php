<?php

namespace App\Http\Controllers;

use App\Models\StockAdjustment;
use App\Models\StockBatch;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class StockAdjustmentController extends Controller
{
    public function index()
    {
        // Admin only route to view all adjustments
        $adjustments = StockAdjustment::with(['product', 'batch', 'user'])
            ->latest()
            ->paginate(20);

        return Inertia::render('Adjustments/Index', [
            'adjustments' => $adjustments
        ]);
    }

    public function store(Request $request, StockBatch $batch)
    {
        $request->validate([
            'quantity_change' => 'required|integer', // e.g. -5 for damaged
            'reason' => 'required|string|in:damaged,expired,missing,correction',
            'notes' => 'nullable|string',
        ]);

        if ($request->quantity_change < 0 && $batch->quantity < abs($request->quantity_change)) {
            return redirect()->back()->withErrors(['error' => 'Cannot deduct more than the batch currently has in stock.']);
        }

        DB::transaction(function () use ($request, $batch) {
            $batch->update([
                'quantity' => $batch->quantity + $request->quantity_change
            ]);

            StockAdjustment::create([
                'product_id' => $batch->product_id,
                'stock_batch_id' => $batch->id,
                'adjusted_by' => auth()->id(),
                'quantity_change' => $request->quantity_change,
                'reason' => $request->reason,
                'notes' => $request->notes,
            ]);
        });

        return redirect()->back()->with('success', 'Stock adjustment logged successfully.');
    }
}
