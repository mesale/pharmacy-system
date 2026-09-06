<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Product;
use App\Models\Sale;
use App\Models\StockBatch;
use Illuminate\Support\Facades\DB;

class PosController extends Controller
{
    public function index(Request $request)
    {
        $products = Product::with(['category', 'stockBatches'])
            ->withSum('stockBatches as total_stock', 'quantity')
            ->having('total_stock', '>', 0)
            ->when($request->search, fn($q, $s) => $q->where('name', 'like', "%{$s}%")->orWhere('barcode', 'like', "%{$s}%"))
            ->get();

        return Inertia::render('Pos/Index', [
            'products' => $products
        ]);
    }

    public function checkout(Request $request)
    {
        $validated = $request->validate([
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
            'items.*.unit_price' => 'required|numeric|min:0',
            'payment_method' => 'required|string|in:cash,card,insurance',
            'tendered_amount' => 'required|numeric|min:0',
        ]);

        return DB::transaction(function () use ($validated, $request) {
            $totalAmount = 0;
            $totalCost = 0;
            $saleItemsData = [];

            foreach ($validated['items'] as $item) {
                $product = Product::findOrFail($item['product_id']);
                $qtyNeeded = $item['quantity'];
                
                // FEFO: Get active batches ordered by expiry_date ASC
                $batches = $product->stockBatches()->where('quantity', '>', 0)->orderBy('expiry_date', 'asc')->lockForUpdate()->get();
                
                $totalAvailable = $batches->sum('quantity');
                if ($totalAvailable < $qtyNeeded) {
                    abort(422, "Not enough stock for {$product->name}. Requested: {$qtyNeeded}, Available: {$totalAvailable}");
                }

                $itemTotalAmount = 0;
                $itemTotalCost = 0;

                foreach ($batches as $batch) {
                    if ($qtyNeeded <= 0) break;

                    $qtyToTake = min($qtyNeeded, $batch->quantity);
                    $batch->quantity -= $qtyToTake;
                    $batch->save();

                    $qtyNeeded -= $qtyToTake;
                    
                    $costForThisBatch = $qtyToTake * $batch->cost_price;
                    $revenueForThisBatch = $qtyToTake * $item['unit_price'];

                    $itemTotalCost += $costForThisBatch;
                    $itemTotalAmount += $revenueForThisBatch;

                    $saleItemsData[] = [
                        'product_id' => $product->id,
                        'batch_id' => $batch->id,
                        'quantity' => $qtyToTake,
                        'unit_price' => $item['unit_price'],
                        'unit_cost' => $batch->cost_price,
                    ];
                }

                $totalAmount += $itemTotalAmount;
                $totalCost += $itemTotalCost;
            }

            $sale = Sale::create([
                'worker_id' => $request->user()->id,
                'total_amount' => $totalAmount,
                'total_cost' => $totalCost,
                'profit' => $totalAmount - $totalCost,
                'payment_method' => $validated['payment_method'],
            ]);

            foreach ($saleItemsData as $si) {
                $sale->items()->create($si);
            }

            return redirect()->back()->with('success', 'Sale completed successfully!');
        });
    }
}
