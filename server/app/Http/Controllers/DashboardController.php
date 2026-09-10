<?php

namespace App\Http\Controllers;

use App\Models\Product;
use App\Models\Sale;
use App\Models\StockBatch;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Inertia\Inertia;

class DashboardController extends Controller
{
    /**
     * Sellable stock for the product row being selected, as a correlated
     * subquery. Doing this in SQL avoids loading the whole catalogue into
     * memory just to find the products that are running low.
     */
    private const SELLABLE_STOCK = '(SELECT COALESCE(SUM(sb.quantity), 0)
        FROM stock_batches sb
        WHERE sb.product_id = products.id AND sb.quantity > 0 AND sb.expiry_date >= ?)';

    public function index(Request $request)
    {
        // If the user is just a worker, redirect them to the POS terminal.
        if (! $request->user()->hasRole('admin')) {
            return redirect()->route('pos.index');
        }

        $today = Carbon::today()->toDateString();
        $soon = Carbon::today()->addDays(30)->toDateString();

        $todayTotals = Sale::whereDate('created_at', $today)
            ->selectRaw('COALESCE(SUM(total_amount), 0) as revenue')
            ->selectRaw('COALESCE(SUM(profit), 0) as profit')
            ->selectRaw('COUNT(*) as transactions')
            ->first();

        // Expired stock is a separate, more urgent problem than stock that is
        // merely approaching its expiry date, so the two are counted apart.
        $expiredBatchesCount = StockBatch::where('quantity', '>', 0)
            ->whereDate('expiry_date', '<', $today)
            ->count();

        $expiringBatchesCount = StockBatch::where('quantity', '>', 0)
            ->whereDate('expiry_date', '>=', $today)
            ->whereDate('expiry_date', '<=', $soon)
            ->count();

        // `<=` matches the reorder threshold used by the purchasing suggestions.
        $lowStock = fn () => Product::query()
            ->whereRaw(self::SELLABLE_STOCK . ' <= products.reorder_level', [$today])
            ->where('reorder_level', '>', 0);

        $lowStockCount = $lowStock()->count();

        $criticalAlerts = [];

        $lowStockProducts = $lowStock()
            ->selectRaw('products.*, ' . self::SELLABLE_STOCK . ' as total_stock', [$today])
            ->orderBy('name')
            ->take(5)
            ->get();

        foreach ($lowStockProducts as $product) {
            $criticalAlerts[] = [
                'type' => 'low_stock',
                'product' => $product->name,
                'barcode' => $product->barcode,
                'current_stock' => (int) $product->total_stock,
                'threshold' => (int) $product->reorder_level,
                'message' => 'URGENT DEFICIT',
            ];
        }

        $expiryAlerts = StockBatch::with('product:id,name')
            ->where('quantity', '>', 0)
            ->whereDate('expiry_date', '<=', $soon)
            ->orderBy('expiry_date')
            ->take(5)
            ->get();

        foreach ($expiryAlerts as $batch) {
            $isExpired = $batch->expiry_date->isBefore(Carbon::today());

            $criticalAlerts[] = [
                'type' => $isExpired ? 'expired' : 'expiring',
                'product' => $batch->product?->name,
                'batch_number' => $batch->batch_number,
                'quantity' => (int) $batch->quantity,
                'expiry_date' => $batch->expiry_date->toDateString(),
                'message' => $isExpired ? 'EXPIRED — WRITE OFF' : 'FEFO WARNING',
            ];
        }

        $trend = $request->query('trend', 'weekly');
        $chartData = [];

        if ($trend === 'yearly') {
            $sales = Sale::whereYear('created_at', date('Y'))->get();
            $months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
            for ($i = 1; $i <= 12; $i++) {
                $monthSales = $sales->filter(fn($s) => $s->created_at->month === $i)->sum('total_amount');
                $chartData[] = ['label' => $months[$i - 1], 'sales' => (float) $monthSales];
            }
        } elseif ($trend === 'monthly') {
            $sales = Sale::whereYear('created_at', date('Y'))
                ->whereMonth('created_at', date('m'))
                ->get();
            $daysInMonth = Carbon::now()->daysInMonth;
            for ($i = 1; $i <= $daysInMonth; $i++) {
                $daySales = $sales->filter(fn($s) => $s->created_at->day === $i)->sum('total_amount');
                $chartData[] = ['label' => (string) $i, 'sales' => (float) $daySales];
            }
        } else {
            // Weekly
            $sales = Sale::where('created_at', '>=', Carbon::today()->subDays(6))->get();
            for ($i = 6; $i >= 0; $i--) {
                $date = Carbon::today()->subDays($i);
                $daySales = $sales->filter(fn($s) => $s->created_at->isSameDay($date))->sum('total_amount');
                $chartData[] = ['label' => $date->format('D'), 'sales' => (float) $daySales];
            }
        }

        return Inertia::render('Dashboard', [
            'grossSalesToday' => (float) $todayTotals->revenue,
            'netProfitToday' => (float) $todayTotals->profit,
            'transactionCountToday' => (int) $todayTotals->transactions,
            'expiringBatchesCount' => $expiringBatchesCount,
            'expiredBatchesCount' => $expiredBatchesCount,
            'lowStockCount' => $lowStockCount,
            'criticalAlerts' => $criticalAlerts,
            'chartData' => $chartData,
            'currentTrend' => $trend,
        ]);
    }
}
