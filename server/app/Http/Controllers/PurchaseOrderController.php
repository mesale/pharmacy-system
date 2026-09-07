<?php

namespace App\Http\Controllers;

use App\Models\Product;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PurchaseOrderController extends Controller
{
    public function index()
    {
        $products = Product::with(['category', 'stockBatches.supplier'])
            ->withSum('stockBatches as total_stock', 'quantity')
            ->get();

        $suggestions = [];

        foreach ($products as $product) {
            $totalStock = $product->total_stock ?? 0;
            
            if ($totalStock <= $product->reorder_level) {
                // Calculate how many we need to buy to restore buffer. 
                // A simple formula: (reorder_level * 2) - totalStock
                $suggestedQty = max(0, ($product->reorder_level * 2) - $totalStock);
                
                // If reorder_level is 0 but we want to suggest *something* if it's out of stock?
                // Realistically, if reorder_level is 0, they don't want to reorder it.
                if ($suggestedQty > 0) {
                    
                    // Find the most recent supplier or default to Unknown
                    $lastSupplier = null;
                    if ($product->stockBatches->isNotEmpty()) {
                        $lastBatch = $product->stockBatches->sortByDesc('received_date')->first();
                        $lastSupplier = $lastBatch->supplier;
                    }
                    
                    $suggestions[] = [
                        'product_id' => $product->id,
                        'product_name' => $product->name,
                        'barcode' => $product->barcode,
                        'category' => $product->category ? $product->category->name : 'Uncategorized',
                        'current_stock' => $totalStock,
                        'reorder_level' => $product->reorder_level,
                        'suggested_qty' => $suggestedQty,
                        'supplier_name' => $lastSupplier ? $lastSupplier->name : 'Unknown Supplier',
                        'supplier_id' => $lastSupplier ? $lastSupplier->id : null,
                    ];
                }
            }
        }

        // Group by supplier name
        $groupedSuggestions = collect($suggestions)->groupBy('supplier_name');

        return Inertia::render('Purchasing/Index', [
            'groupedSuggestions' => $groupedSuggestions
        ]);
    }
}
