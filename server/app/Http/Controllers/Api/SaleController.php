<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\Product;
use App\Models\Sale;
use App\Models\SaleItem;

class SaleController extends Controller
{
    public function store(Request $request)
    {
        $request->validate([
            'payment_method' => 'required|in:cash,card,insurance',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
        ]);

        try {
            DB::beginTransaction();

            $sale = Sale::create([
                'worker_id' => $request->user()->id,
                'payment_method' => $request->payment_method,
                'total_amount' => 0,
                'total_cost' => 0,
                'profit' => 0,
            ]);

            $totalAmount = 0;
            $totalCost = 0;

            foreach ($request->items as $item) {
                $product = Product::with(['stockBatches' => function ($q) {
                    $q->where('quantity', '>', 0)->orderBy('expiry_date', 'asc');
                }])->findOrFail($item['product_id']);

                $remainingQty = $item['quantity'];

                foreach ($product->stockBatches as $batch) {
                    if ($remainingQty <= 0) break;

                    $take = min($batch->quantity, $remainingQty);
                    
                    $subtotal = $take * $product->selling_price;
                    $costSubtotal = $take * $batch->cost_price;

                    SaleItem::create([
                        'sale_id' => $sale->id,
                        'product_id' => $product->id,
                        'batch_id' => $batch->id,
                        'quantity' => $take,
                        'unit_price' => $product->selling_price,
                        'unit_cost' => $batch->cost_price,
                    ]);

                    $batch->decrement('quantity', $take);
                    
                    $totalAmount += $subtotal;
                    $totalCost += $costSubtotal;
                    $remainingQty -= $take;
                }

                if ($remainingQty > 0) {
                    throw new \Exception("Insufficient stock for product: {$product->name}");
                }
            }

            $sale->update([
                'total_amount' => $totalAmount,
                'total_cost' => $totalCost,
                'profit' => $totalAmount - $totalCost,
            ]);

            DB::commit();

            return response()->json([
                'message' => 'Sale completed successfully',
                'sale_id' => $sale->id,
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => $e->getMessage()
            ], 400);
        }
    }
}
