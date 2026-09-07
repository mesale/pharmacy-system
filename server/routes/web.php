<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    return redirect()->route('login');
});

Route::get('/dashboard', [\App\Http\Controllers\DashboardController::class, 'index'])->middleware(['auth', 'verified'])->name('dashboard');

Route::middleware('auth')->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    // Readable by all authenticated users
    Route::get('/pos', [\App\Http\Controllers\PosController::class, 'index'])->name('pos.index');
    Route::post('/pos/checkout', [\App\Http\Controllers\PosController::class, 'checkout'])->name('pos.checkout');

    Route::get('/categories', [\App\Http\Controllers\CategoryController::class, 'index'])->name('categories.index');
    Route::get('/suppliers', [\App\Http\Controllers\SupplierController::class, 'index'])->name('suppliers.index');
    Route::get('/products', [\App\Http\Controllers\ProductController::class, 'index'])->name('products.index');
    // Constrained to a numeric id so that /products/create is not captured
    // here as a product named "create".
    Route::get('/products/{product}', [\App\Http\Controllers\ProductController::class, 'show'])
        ->whereNumber('product')
        ->name('products.show');
    
    // Workers can close their shift
    Route::get('/reconciliation/create', [\App\Http\Controllers\CashReconciliationController::class, 'create'])->name('reconciliation.create');
    Route::post('/reconciliation', [\App\Http\Controllers\CashReconciliationController::class, 'store'])->name('reconciliation.store');
    
    // Workers can adjust stock
    Route::post('/batches/{batch}/adjustments', [\App\Http\Controllers\StockAdjustmentController::class, 'store'])->name('adjustments.store');

    // Admin-only write operations
    Route::middleware('role:admin')->group(function () {
        Route::get('/purchasing', [\App\Http\Controllers\PurchaseOrderController::class, 'index'])->name('purchasing.index');
        
        Route::get('/reports', [\App\Http\Controllers\ReportController::class, 'index'])->name('reports.index');
        
        Route::get('/adjustments', [\App\Http\Controllers\StockAdjustmentController::class, 'index'])->name('adjustments.index');
        
        Route::get('/users', [\App\Http\Controllers\UserController::class, 'index'])->name('users.index');
        Route::post('/users', [\App\Http\Controllers\UserController::class, 'store'])->name('users.store');
        Route::patch('/users/{user}', [\App\Http\Controllers\UserController::class, 'update'])->name('users.update');
        Route::delete('/users/{user}', [\App\Http\Controllers\UserController::class, 'destroy'])->name('users.destroy');

        Route::post('/categories', [\App\Http\Controllers\CategoryController::class, 'store'])->name('categories.store');
        Route::patch('/categories/{category}', [\App\Http\Controllers\CategoryController::class, 'update'])->name('categories.update');
        Route::delete('/categories/{category}', [\App\Http\Controllers\CategoryController::class, 'destroy'])->name('categories.destroy');

        Route::post('/suppliers', [\App\Http\Controllers\SupplierController::class, 'store'])->name('suppliers.store');
        Route::patch('/suppliers/{supplier}', [\App\Http\Controllers\SupplierController::class, 'update'])->name('suppliers.update');
        Route::delete('/suppliers/{supplier}', [\App\Http\Controllers\SupplierController::class, 'destroy'])->name('suppliers.destroy');

        Route::get('/products/create', [\App\Http\Controllers\ProductController::class, 'create'])->name('products.create');
        Route::get('/products/{product}/edit', [\App\Http\Controllers\ProductController::class, 'edit'])->whereNumber('product')->name('products.edit');
        Route::post('/products', [\App\Http\Controllers\ProductController::class, 'store'])->name('products.store');
        Route::patch('/products/{product}', [\App\Http\Controllers\ProductController::class, 'update'])->name('products.update');
        Route::delete('/products/{product}', [\App\Http\Controllers\ProductController::class, 'destroy'])->name('products.destroy');

        Route::post('/products/{product}/batches', [\App\Http\Controllers\StockBatchController::class, 'store'])->name('batches.store');
        Route::patch('/batches/{batch}', [\App\Http\Controllers\StockBatchController::class, 'update'])->name('batches.update');
    });
});

require __DIR__.'/auth.php';
