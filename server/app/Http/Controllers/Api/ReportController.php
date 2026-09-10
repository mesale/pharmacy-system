<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Sale;
use Carbon\Carbon;
use Illuminate\Http\Request;

class ReportController extends Controller
{
    public function index(Request $request)
    {
        $startDate = Carbon::today()->subDays(30);
        $endDate = Carbon::today();

        $dailyData = Sale::selectRaw('DATE(created_at) as date')
            ->selectRaw('COUNT(*) as total_transactions')
            ->selectRaw('SUM(total_amount) as revenue')
            ->selectRaw('SUM(total_cost) as cogs')
            ->selectRaw('SUM(profit) as profit')
            ->whereBetween('created_at', [$startDate->startOfDay(), $endDate->endOfDay()])
            ->groupBy('date')
            ->orderByDesc('date')
            ->get();

        $totals = Sale::whereBetween('created_at', [$startDate->startOfDay(), $endDate->endOfDay()])
            ->selectRaw('COUNT(id) as total_transactions')
            ->selectRaw('COALESCE(SUM(total_amount), 0) as total_revenue')
            ->selectRaw('COALESCE(SUM(total_cost), 0) as total_cogs')
            ->selectRaw('COALESCE(SUM(profit), 0) as total_profit')
            ->first();

        return response()->json([
            "data" => [
                "dailyData" => $dailyData,
                "summary" => [
                    "total_revenue" => (float) $totals->total_revenue,
                    "total_profit" => (float) $totals->total_profit,
                    "total_transactions" => (int) $totals->total_transactions,
                    "total_cogs" => (float) $totals->total_cogs,
                ]
            ]
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
