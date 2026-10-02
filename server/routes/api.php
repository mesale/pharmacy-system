<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\InventoryController;
use App\Http\Controllers\Api\SaleController;
use App\Http\Controllers\Api\ReportController;

Route::post("/login", [AuthController::class, "login"]);

Route::middleware("auth:sanctum")->group(function () {
    Route::get("/user", function (Request $request) {
        return $request->user()->load("roles");
    });

    Route::post("/logout", [AuthController::class, "logout"]);

    // Readable / usable by any authenticated user (workers included).
    Route::get("/products", [InventoryController::class, "index"]);
    Route::post("/sales", [SaleController::class, "store"]);
    Route::get("/dashboard", [\App\Http\Controllers\Api\DashboardController::class, "index"]);

    Route::get("/categories", function () {
        return response()->json(['data' => \App\Models\Category::withCount('products')->get()]);
    });
    Route::get("/suppliers", function () {
        return response()->json(['data' => \App\Models\Supplier::withCount('stockBatches')->get()]);
    });

    // Admin-only, mirroring the web routes: profit reports, the user list, the
    // adjustments ledger and creating products are all restricted there, so the
    // API must restrict them too — otherwise a worker's token reads cost/profit
    // figures and the staff list the web UI would never show them.
    Route::middleware("role:admin")->group(function () {
        Route::post("/products", [InventoryController::class, "store"]);

        Route::get("/reports", [ReportController::class, "index"]);
        Route::get("/reports/day/{date}", [ReportController::class, "showDay"]);

        Route::get("/users", function () {
            return response()->json(['data' => \App\Models\User::with('roles')->get()]);
        });
        Route::get("/adjustments", function () {
            return response()->json(['data' => \App\Models\StockAdjustment::with(['batch.product', 'user'])->latest()->take(50)->get()]);
        });
    });
});
