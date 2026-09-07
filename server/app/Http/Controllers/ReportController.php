<?php

namespace App\Http\Controllers;

use App\Models\Sale;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class ReportController extends Controller
{
    public function index(Request $request)
    {
        $startDate = $request->input('start_date', Carbon::now()->subDays(30)->toDateString());
        $endDate = $request->input('end_date', Carbon::now()->toDateString());

        // Ensure end date includes the full day
        $parsedEndDate = Carbon::parse($endDate)->endOfDay();
        $parsedStartDate = Carbon::parse($startDate)->startOfDay();

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

        // Calculate grand totals for the period
        $summary = [
            'total_transactions' => $dailyData->sum('total_transactions'),
            'total_revenue' => $dailyData->sum('revenue'),
            'total_cogs' => $dailyData->sum('cogs'),
            'total_profit' => $dailyData->sum('profit'),
        ];

        return Inertia::render('Reports/Index', [
            'filters' => [
                'start_date' => $startDate,
                'end_date' => $endDate,
            ],
            'dailyData' => $dailyData,
            'summary' => $summary,
        ]);
    }
}
