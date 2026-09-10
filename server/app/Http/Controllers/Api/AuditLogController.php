<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Sale;
use App\Models\StockAdjustment;
use Illuminate\Http\Request;

class AuditLogController extends Controller
{
    public function index()
    {
        $sales = Sale::with("worker:id,name")->latest()->take(20)->get()->map(function($sale) {
            return [
                "id" => "S-" . $sale->id,
                "action" => "SALE_PROCESSED",
                "user" => $sale->worker->name ?? "Unknown",
                "details" => "Processed a sale of $" . number_format($sale->total_amount, 2),
                "created_at" => $sale->created_at->toDateTimeString(),
                "timestamp" => $sale->created_at->timestamp
            ];
        });

        $adjustments = StockAdjustment::with(["user:id,name", "product:id,name"])->latest()->take(20)->get()->map(function($adj) {
            return [
                "id" => "A-" . $adj->id,
                "action" => "STOCK_ADJUSTMENT",
                "user" => $adj->user->name ?? "Unknown",
                "details" => "Adjusted " . ($adj->product->name ?? "Unknown") . " by " . $adj->quantity_change . " (" . $adj->reason . ")",
                "created_at" => $adj->created_at->toDateTimeString(),
                "timestamp" => $adj->created_at->timestamp
            ];
        });

        $logs = $sales->concat($adjustments)->sortByDesc("timestamp")->values()->take(30);

        return response()->json(["data" => $logs]);
    }
}
