<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Carbon\Carbon;
use Inertia\Inertia;

class PurchaseOrderController extends Controller
{
    public function index()
    {
        $today = Carbon::today()->toDateString();

        // Only products at or below their reorder level are of interest, so the
        // filtering happens in SQL rather than over the whole catalogue in PHP.
        // A reorder level of 0 means "do not restock", so those are excluded.
        $sellableStock = '(SELECT COALESCE(SUM(sb.quantity), 0)
            FROM stock_batches sb
            WHERE sb.product_id = products.id AND sb.quantity > 0 AND sb.expiry_date >= ?)';

        $products = Product::query()
            ->selectRaw('products.*, ' . $sellableStock . ' as total_stock', [$today])
            ->whereRaw($sellableStock . ' <= products.reorder_level', [$today])
            ->where('reorder_level', '>', 0)
            ->with([
                'category:id,name',
                'stockBatches.supplier:id,name',
            ])
            ->orderBy('name')
            ->get();

        $suggestions = $products->map(function (Product $product) {
            $totalStock = (int) $product->total_stock;

            // Restore a buffer of twice the reorder level.
            $suggestedQty = max(0, ($product->reorder_level * 2) - $totalStock);

            $lastSupplier = $product->stockBatches
                ->sortByDesc('received_date')
                ->first()?->supplier;

            return [
                'product_id' => $product->id,
                'product_name' => $product->name,
                'barcode' => $product->barcode,
                'category' => $product->category?->name ?? 'Uncategorized',
                'current_stock' => $totalStock,
                'reorder_level' => (int) $product->reorder_level,
                'suggested_qty' => $suggestedQty,
                'supplier_name' => $lastSupplier?->name ?? 'Unknown Supplier',
                'supplier_id' => $lastSupplier?->id,
            ];
        })->filter(fn ($s) => $s['suggested_qty'] > 0)->values();

        return Inertia::render('Purchasing/Index', [
            'groupedSuggestions' => $suggestions->groupBy('supplier_name'),
        ]);
    }
}
