<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use App\Models\Sale;
use App\Models\Product;
use App\Models\StockBatch;
use Carbon\Carbon;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        // If the user is just a worker, redirect them to the POS terminal.
        if (!$request->user()->hasRole('admin')) {
            return redirect()->route('pos.index');
        }

        $today = Carbon::today();

        $grossSalesToday = Sale::whereDate('created_at', $today)->sum('total_amount');
        $netProfitToday = Sale::whereDate('created_at', $today)->sum('profit');
        $transactionCountToday = Sale::whereDate('created_at', $today)->count();

        // Expiring batches (within 30 days)
        $expiringBatchesCount = StockBatch::where('quantity', '>', 0)
            ->where('expiry_date', '<=', Carbon::today()->addDays(30))
            ->count();

        // Low stock products (total stock < reorder level)
        // This is a bit complex in Eloquent without a raw query or joining, so we can fetch products with their sum.
        $productsWithStock = Product::withSum('stockBatches as total_stock', 'quantity')->get();
        $lowStockProducts = $productsWithStock->filter(function ($product) {
            return $product->total_stock < $product->reorder_level;
        });

        // Get 10 critical alerts (low stock or expiring soon) for the table
        $criticalAlerts = [];
        
        foreach ($lowStockProducts->take(5) as $product) {
            $criticalAlerts[] = [
                'type' => 'low_stock',
                'product' => $product->name,
                'barcode' => $product->barcode,
                'current_stock' => $product->total_stock,
                'threshold' => $product->reorder_level,
                'message' => 'URGENT DEFICIT',
            ];
        }

        $expiringBatchesList = StockBatch::with('product')
            ->where('quantity', '>', 0)
            ->where('expiry_date', '<=', Carbon::today()->addDays(30))
            ->orderBy('expiry_date', 'asc')
            ->take(5)
            ->get();

        foreach ($expiringBatchesList as $batch) {
            $criticalAlerts[] = [
                'type' => 'expiring',
                'product' => $batch->product->name,
                'batch_number' => $batch->batch_number,
                'quantity' => $batch->quantity,
                'expiry_date' => $batch->expiry_date,
                'message' => 'FEFO WARNING',
            ];
        }

        return Inertia::render('Dashboard', [
            'grossSalesToday' => $grossSalesToday,
            'netProfitToday' => $netProfitToday,
            'transactionCountToday' => $transactionCountToday,
            'expiringBatchesCount' => $expiringBatchesCount,
            'criticalAlerts' => $criticalAlerts,
        ]);
    }
}
