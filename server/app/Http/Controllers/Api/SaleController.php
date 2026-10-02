<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Services\SaleService;
use Illuminate\Http\Request;

class SaleController extends Controller
{
    /**
     * Record a sale made from the mobile till.
     *
     * This previously carried its own checkout logic that assumed a flat
     * product.stock / product.cost_price model which does not exist in this
     * schema, so every mobile sale failed. It now goes through the same
     * FEFO SaleService the web till uses. Money fields sent by the client are
     * ignored: totals are computed server-side from the catalogue and batches.
     */
    public function store(Request $request, SaleService $saleService)
    {
        $validated = $request->validate([
            'payment_method' => 'required|in:cash,card,insurance',
            'items' => 'required|array|min:1',
            'items.*.product_id' => 'required|integer|exists:products,id',
            'items.*.quantity' => 'required|integer|min:1',
            'tendered_amount' => 'nullable|numeric|min:0',
        ]);

        // A thrown ValidationException (insufficient stock, underpaid cash) is
        // rendered as a 422 JSON body {message, errors} by the API exception
        // handler — which is exactly what the mobile client reads.
        $sale = $saleService->checkout(
            $validated['items'],
            $validated['payment_method'],
            $request->user()->id,
            isset($validated['tendered_amount']) ? (float) $validated['tendered_amount'] : null,
        );

        return response()->json([
            'message' => 'Sale completed successfully',
            'sale_id' => $sale->id,
            'total_amount' => (float) $sale->total_amount,
        ], 201);
    }
}
