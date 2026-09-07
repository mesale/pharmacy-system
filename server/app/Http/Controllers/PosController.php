<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Sale;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
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

    public function checkout(Request $request)
    {
        $validated = $request->validate([
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|integer|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
            'payment_method' => 'required|string|in:cash,card,insurance',
            'tendered_amount' => 'nullable|numeric|min:0',
        ]);

        return DB::transaction(function () use ($validated, $request) {
            // Merge duplicate line items so one product is dispensed once.
            $requested = [];
            foreach ($validated['items'] as $item) {
                $id = (int) $item['product_id'];
                $requested[$id] = ($requested[$id] ?? 0) + (int) $item['quantity'];
            }

            $totalAmount = 0.0;
            $totalCost = 0.0;
            $saleItemsData = [];

            $products = Product::whereIn('id', array_keys($requested))->get()->keyBy('id');

            foreach ($requested as $productId => $qtyNeeded) {
                $product = $products[$productId];

                // Price is always the catalogue price from the database. It is never
                // taken from the request: workers cannot alter prices at the till.
                $unitPrice = (float) $product->selling_price;

                // FEFO: earliest expiry first, but expired stock is never dispensed.
                $batches = $product->sellableBatches()
                    ->orderBy('expiry_date')
                    ->orderBy('id')
                    ->lockForUpdate()
                    ->get();

                $totalAvailable = (int) $batches->sum('quantity');

                if ($totalAvailable < $qtyNeeded) {
                    $expiredOnHand = (int) $product->stockBatches()
                        ->where('quantity', '>', 0)
                        ->whereDate('expiry_date', '<', now()->toDateString())
                        ->sum('quantity');

                    $message = "Not enough sellable stock for {$product->name}. "
                        . "Requested: {$qtyNeeded}, available: {$totalAvailable}.";

                    if ($expiredOnHand > 0) {
                        $message .= " {$expiredOnHand} unit(s) on hand are expired and cannot be sold —"
                            . ' write them off with a stock adjustment.';
                    }

                    throw ValidationException::withMessages(['items' => $message]);
                }

                foreach ($batches as $batch) {
                    if ($qtyNeeded <= 0) {
                        break;
                    }

                    $qtyToTake = min($qtyNeeded, (int) $batch->quantity);
                    $batch->decrement('quantity', $qtyToTake);
                    $qtyNeeded -= $qtyToTake;

                    $unitCost = (float) $batch->cost_price;

                    $totalAmount += $qtyToTake * $unitPrice;
                    $totalCost += $qtyToTake * $unitCost;

                    $saleItemsData[] = [
                        'product_id' => $product->id,
                        'batch_id' => $batch->id,
                        'quantity' => $qtyToTake,
                        'unit_price' => $unitPrice,
                        'unit_cost' => $unitCost,
                    ];
                }
            }

            $totalAmount = round($totalAmount, 2);
            $totalCost = round($totalCost, 2);

            // A cash sale must actually cover the bill, otherwise the till will
            // never reconcile against what was recorded.
            if ($validated['payment_method'] === 'cash') {
                $tendered = (float) ($validated['tendered_amount'] ?? 0);

                if ($tendered + 0.001 < $totalAmount) {
                    throw ValidationException::withMessages([
                        'tendered_amount' => 'Cash tendered ('
                            . number_format($tendered, 2)
                            . ') is less than the total due ('
                            . number_format($totalAmount, 2) . ').',
                    ]);
                }
            }

            $sale = Sale::create([
                'worker_id' => $request->user()->id,
                'total_amount' => $totalAmount,
                'total_cost' => $totalCost,
                'profit' => round($totalAmount - $totalCost, 2),
                'payment_method' => $validated['payment_method'],
            ]);

            $sale->items()->createMany($saleItemsData);

            return redirect()->back()->with('success', 'Sale completed successfully!');
        });
    }
}
