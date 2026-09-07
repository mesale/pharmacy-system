<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\InventoryController;
use App\Http\Controllers\Api\SaleController;

// Mobile App Authentication
Route::post('/login', [AuthController::class, 'login']);

// Protected Mobile API Routes
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', [AuthController::class, 'user']);
    Route::post('/logout', [AuthController::class, 'logout']);
    
    // Inventory (Read-only for workers on mobile)
    Route::get('/products', [InventoryController::class, 'index']);
    
    // POS / Sales
    Route::post('/sales', [SaleController::class, 'store']);
});
