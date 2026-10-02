<?php

namespace App\Services;

use App\Models\Product;
use App\Models\Sale;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

/**
 * The single source of truth for turning a basket of line items into a recorded
 * sale. Both the web till (PosController) and the mobile API (Api\SaleController)
 * go through here so the two can never drift apart — the reason the mobile sale
 * endpoint was silently broken was that it carried its own, wrong, copy of this
 * logic that assumed a flat product.stock column this schema does not have.
 */
class SaleService
{
    /**
     * Dispense stock first-expiry-first-out and record the sale atomically.
     *
     * Prices always come from the catalogue and costs from the batch actually
     * drawn down — never from the caller — so a tampered request cannot change
     * what is charged or what margin is booked.
     *
     * @param  array<int, array{product_id: int|string, quantity: int|string}>  $items
     * @param  string  $paymentMethod  one of cash|card|insurance
     * @param  float|null  $tenderedAmount  cash handed over; required to cover a cash sale
     *
     * @throws ValidationException when stock is insufficient or a cash sale is underpaid
     */
    public function checkout(array $items, string $paymentMethod, int $workerId, ?float $tenderedAmount = null): Sale
    {
        return DB::transaction(function () use ($items, $paymentMethod, $workerId, $tenderedAmount) {
            // Merge duplicate line items so one product is dispensed once and the
            // stock check sees the true total being requested.
            $requested = [];
            foreach ($items as $item) {
                $id = (int) $item['product_id'];
                $requested[$id] = ($requested[$id] ?? 0) + (int) $item['quantity'];
            }

            $totalAmount = 0.0;
            $totalCost = 0.0;
            $saleItemsData = [];

            $products = Product::whereIn('id', array_keys($requested))->get()->keyBy('id');

            foreach ($requested as $productId => $qtyNeeded) {
                $product = $products[$productId] ?? null;

                if (! $product) {
                    throw ValidationException::withMessages([
                        'items' => "Product #{$productId} no longer exists.",
                    ]);
                }

                // Price is always the catalogue price from the database. It is never
                // taken from the request: workers cannot alter prices at the till.
                $unitPrice = (float) $product->selling_price;

                // FEFO: earliest expiry first, but expired stock is never dispensed.
                $batches = $product->sellableBatches()
                    ->orderBy('expiry_date')
                    ->orderBy('id')
                    ->lockForUpdate()
                    ->get();

                $totalAvailable = (int) $batches->sum('quantity');

                if ($totalAvailable < $qtyNeeded) {
                    $expiredOnHand = (int) $product->stockBatches()
                        ->where('quantity', '>', 0)
                        ->whereDate('expiry_date', '<', now()->toDateString())
                        ->sum('quantity');

                    $message = "Not enough sellable stock for {$product->name}. "
                        . "Requested: {$qtyNeeded}, available: {$totalAvailable}.";

                    if ($expiredOnHand > 0) {
                        $message .= " {$expiredOnHand} unit(s) on hand are expired and cannot be sold —"
                            . ' write them off with a stock adjustment.';
                    }

                    throw ValidationException::withMessages(['items' => $message]);
                }

                foreach ($batches as $batch) {
                    if ($qtyNeeded <= 0) {
                        break;
                    }

                    $qtyToTake = min($qtyNeeded, (int) $batch->quantity);
                    $batch->decrement('quantity', $qtyToTake);
                    $qtyNeeded -= $qtyToTake;

                    $unitCost = (float) $batch->cost_price;

                    $totalAmount += $qtyToTake * $unitPrice;
                    $totalCost += $qtyToTake * $unitCost;

                    $saleItemsData[] = [
                        'product_id' => $product->id,
                        'batch_id' => $batch->id,
                        'quantity' => $qtyToTake,
                        'unit_price' => $unitPrice,
                        'unit_cost' => $unitCost,
                    ];
                }
            }

            $totalAmount = round($totalAmount, 2);
            $totalCost = round($totalCost, 2);

            // A cash sale must actually cover the bill, otherwise the till will
            // never reconcile against what was recorded.
            if ($paymentMethod === 'cash') {
                $tendered = (float) ($tenderedAmount ?? 0);

                if ($tendered + 0.001 < $totalAmount) {
                    throw ValidationException::withMessages([
                        'tendered_amount' => 'Cash tendered ('
                            . number_format($tendered, 2)
                            . ') is less than the total due ('
                            . number_format($totalAmount, 2) . ').',
                    ]);
                }
            }

            $sale = Sale::create([
                'worker_id' => $workerId,
                'total_amount' => $totalAmount,
                'total_cost' => $totalCost,
                'profit' => round($totalAmount - $totalCost, 2),
                'payment_method' => $paymentMethod,
            ]);

            $sale->items()->createMany($saleItemsData);

            return $sale;
        });
    }
}
