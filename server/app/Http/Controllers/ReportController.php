<?php

namespace App\Http\Controllers;

use App\Models\Sale;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class ReportController extends Controller
{
    public function index(Request $request)
    {
        // Unvalidated input reached Carbon::parse() before, so a malformed date in
        // the query string was an unhandled 500 rather than a field error.
        $validated = $request->validate([
            'start_date' => 'nullable|date',
            'end_date' => 'nullable|date|after_or_equal:start_date',
        ]);

        $startDate = $validated['start_date'] ?? Carbon::now()->subDays(30)->toDateString();
        $endDate = $validated['end_date'] ?? Carbon::now()->toDateString();

        $parsedStartDate = Carbon::parse($startDate)->startOfDay();
        $parsedEndDate = Carbon::parse($endDate)->endOfDay();

        // Aggregate daily metrics
        $dailyData = Sale::whereBetween('created_at', [$parsedStartDate, $parsedEndDate])
            ->select(
                DB::raw('DATE(created_at) as date'),
                DB::raw('COUNT(id) as total_transactions'),
                DB::raw('SUM(total_amount) as revenue'),
                DB::raw('SUM(total_cost) as cogs'),
                DB::raw('SUM(profit) as profit')
            )
            ->groupBy('date')
            ->orderBy('date', 'desc')
            ->get();

        // Grand totals for the period, summed in SQL so they do not depend on the
        // daily rows being fully loaded.
        $totals = Sale::whereBetween('created_at', [$parsedStartDate, $parsedEndDate])
            ->selectRaw('COUNT(id) as total_transactions')
            ->selectRaw('COALESCE(SUM(total_amount), 0) as total_revenue')
            ->selectRaw('COALESCE(SUM(total_cost), 0) as total_cogs')
            ->selectRaw('COALESCE(SUM(profit), 0) as total_profit')
            ->first();

        $byWorker = Sale::whereBetween('sales.created_at', [$parsedStartDate, $parsedEndDate])
            ->join('users', 'users.id', '=', 'sales.worker_id')
            ->groupBy('users.id', 'users.name')
            ->selectRaw('users.name as worker')
            ->selectRaw('COUNT(sales.id) as total_transactions')
            ->selectRaw('COALESCE(SUM(sales.total_amount), 0) as revenue')
            ->selectRaw('COALESCE(SUM(sales.profit), 0) as profit')
            ->orderByDesc('revenue')
            ->get();

        return Inertia::render('Reports/Index', [
            'filters' => [
                'start_date' => $startDate,
                'end_date' => $endDate,
            ],
            'dailyData' => $dailyData,
            'byWorker' => $byWorker,
            'summary' => [
                'total_transactions' => (int) $totals->total_transactions,
                'total_revenue' => (float) $totals->total_revenue,
                'total_cogs' => (float) $totals->total_cogs,
                'total_profit' => (float) $totals->total_profit,
            ],
        ]);
    }

    public function showDay(Request $request, $date)
    {
        $parsedDate = Carbon::parse($date);
        
        $items = \App\Models\SaleItem::whereHas('sale', function ($query) use ($parsedDate) {
                $query->whereDate('created_at', $parsedDate->toDateString());
            })
            ->join('products', 'sale_items.product_id', '=', 'products.id')
            ->selectRaw('products.name, SUM(sale_items.quantity) as total_quantity, SUM(sale_items.quantity * sale_items.unit_price) as total_revenue')
            ->groupBy('products.id', 'products.name')
            ->orderByDesc('total_revenue')
            ->get();
            
        return response()->json($items);
    }
}
