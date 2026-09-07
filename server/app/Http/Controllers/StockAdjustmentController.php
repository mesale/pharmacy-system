<?php

namespace App\Http\Controllers;

use App\Models\StockAdjustment;
use App\Models\StockBatch;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class StockAdjustmentController extends Controller
{
    public function index()
    {
        // Admin only route to view all adjustments
        $adjustments = StockAdjustment::with(['product', 'batch', 'user'])
            ->latest()
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('Adjustments/Index', [
            'adjustments' => $adjustments,
        ]);
    }

    public function store(Request $request, StockBatch $batch)
    {
        $validated = $request->validate([
            'quantity_change' => 'required|integer|not_in:0', // e.g. -5 for damaged
            'reason' => 'required|string|in:damaged,expired,missing,correction',
            'notes' => 'nullable|string|max:2000',
        ]);

        $change = (int) $validated['quantity_change'];

        // Writing stock off is a normal worker task. Adding stock that no purchase
        // order accounts for is how a shortage would be covered up, so only an
        // admin may increase a batch.
        if ($change > 0 && ! $request->user()->hasRole('admin')) {
            throw ValidationException::withMessages([
                'quantity_change' => 'Only an administrator can increase stock. Record new stock as a batch instead.',
            ]);
        }

        DB::transaction(function () use ($validated, $change, $request, $batch) {
            // Lock and re-read: the quantity may have changed since the request
            // was rendered, and two concurrent write-offs must not both succeed.
            $locked = StockBatch::whereKey($batch->getKey())->lockForUpdate()->firstOrFail();

            if ($locked->quantity + $change < 0) {
                throw ValidationException::withMessages([
                    'quantity_change' => "Cannot deduct more than the batch currently has in stock ({$locked->quantity}).",
                ]);
            }

            $locked->increment('quantity', $change);

            StockAdjustment::create([
                'product_id' => $locked->product_id,
                'stock_batch_id' => $locked->id,
                'adjusted_by' => $request->user()->id,
                'quantity_change' => $change,
                'reason' => $validated['reason'],
                'notes' => $validated['notes'] ?? null,
            ]);
        });

        return redirect()->back()->with('success', 'Stock adjustment logged successfully.');
    }
}
