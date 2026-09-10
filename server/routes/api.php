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
    
    Route::get("/products", [InventoryController::class, "index"]);
    Route::post("/products", [InventoryController::class, "store"]);
    
    Route::post("/sales", [SaleController::class, "store"]);
    Route::get("/reports", [ReportController::class, "index"]);
    Route::get("/reports/day/{date}", [ReportController::class, "showDay"]);
    Route::get("/dashboard", [\App\Http\Controllers\Api\DashboardController::class, "index"]);

    Route::get("/categories", function () {
        return response()->json(['data' => \App\Models\Category::withCount('products')->get()]);
    });
    Route::get("/suppliers", function () {
        return response()->json(['data' => \App\Models\Supplier::withCount('stockBatches')->get()]);
    });
    Route::get("/users", function () {
        return response()->json(['data' => \App\Models\User::with('roles')->get()]);
    });
    Route::get("/adjustments", function () {
        return response()->json(['data' => \App\Models\StockAdjustment::with(['batch.product', 'user'])->latest()->take(50)->get()]);
    });
});
