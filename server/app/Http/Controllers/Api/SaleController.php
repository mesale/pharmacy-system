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
            "payment_method" => "required|in:cash,card,insurance",
            "items" => "required|array|min:1",
            "items.*.product_id" => "required|exists:products,id",
            "items.*.quantity" => "required|integer|min:1",
        ]);

        try {
            DB::beginTransaction();

            $sale = Sale::create([
                "worker_id" => $request->user()->id,
                "payment_method" => $request->payment_method,
                "total_amount" => 0,
                "total_cost" => 0,
                "profit" => 0,
            ]);

            $totalAmount = 0;
            $totalCost = 0;

            foreach ($request->items as $item) {
                $product = Product::findOrFail($item["product_id"]);

                if ($product->stock < $item["quantity"]) {
                    throw new \Exception("Insufficient stock for " . $product->name);
                }

                $subtotal = $item["quantity"] * $product->selling_price;
                $costSubtotal = $item["quantity"] * $product->cost_price;

                SaleItem::create([
                    "sale_id" => $sale->id,
                    "product_id" => $product->id,
                    "quantity" => $item["quantity"],
                    "unit_price" => $product->selling_price,
                    "unit_cost" => $product->cost_price,
                ]);

                $product->decrement("stock", $item["quantity"]);
                
                $totalAmount += $subtotal;
                $totalCost += $costSubtotal;
            }

            $sale->update([
                "total_amount" => $totalAmount,
                "total_cost" => $totalCost,
                "profit" => $totalAmount - $totalCost,
            ]);

            DB::commit();

            return response()->json([
                "message" => "Sale completed successfully",
                "sale_id" => $sale->id,
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                "message" => $e->getMessage()
            ], 400);
        }
    }
}
