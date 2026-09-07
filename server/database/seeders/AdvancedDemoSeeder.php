<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Product;
use App\Models\StockBatch;
use App\Models\Sale;
use App\Models\SaleItem;
use App\Models\StockAdjustment;
use App\Models\CashReconciliation;
use Carbon\Carbon;
use Illuminate\Support\Str;

class AdvancedDemoSeeder extends Seeder
{
    public function run(): void
    {
        // 1. Create Demo Users
        $admin = User::firstOrCreate(
            ['email' => 'admin@demo.com'],
            [
                'name' => 'Demo Admin',
                'password' => bcrypt('password123'),
            ]
        );
        if (!$admin->hasRole('admin')) {
            $admin->assignRole('admin');
        }

        $worker = User::firstOrCreate(
            ['email' => 'worker@demo.com'],
            [
                'name' => 'Demo Worker',
                'password' => bcrypt('password123'),
            ]
        );
        if (!$worker->hasRole('worker')) {
            $worker->assignRole('worker');
        }

        // 2. Fetch some products and batches
        $products = Product::with('stockBatches')->whereHas('stockBatches', function($q) {
            $q->where('quantity', '>', 0);
        })->get();

        if ($products->isEmpty()) {
            return;
        }

        // 3. Create Sales (Past 30 days)
        $users = [$admin, $worker];
        
        for ($i = 0; $i < 50; $i++) { // 50 random sales
            $saleDate = Carbon::now()->subDays(rand(0, 30))->subMinutes(rand(0, 1440));
            $user = $users[array_rand($users)];

            $sale = Sale::create([
                'worker_id' => $user->id,
                'total_amount' => 0,
                'total_cost' => 0,
                'profit' => 0,
                'payment_method' => ['cash', 'card', 'insurance'][rand(0, 2)],
                'created_at' => $saleDate,
                'updated_at' => $saleDate,
            ]);

            $numItems = rand(1, 4);
            $totalAmount = 0;
            $totalCost = 0;
            
            for ($j = 0; $j < $numItems; $j++) {
                $product = $products->random();
                $batch = $product->stockBatches->where('quantity', '>', 0)->first();
                
                if (!$batch) continue;

                $quantitySold = rand(1, 3);
                
                // Deduct from batch
                if ($batch->quantity >= $quantitySold) {
                    $batch->decrement('quantity', $quantitySold);
                }

                $subtotal = $product->selling_price * $quantitySold;
                $costSubtotal = $batch->cost_price * $quantitySold;

                $totalAmount += $subtotal;
                $totalCost += $costSubtotal;

                SaleItem::create([
                    'sale_id' => $sale->id,
                    'product_id' => $product->id,
                    'batch_id' => $batch->id,
                    'quantity' => $quantitySold,
                    'unit_price' => $product->selling_price,
                    'unit_cost' => $batch->cost_price,
                    'created_at' => $saleDate,
                    'updated_at' => $saleDate,
                ]);
            }

            $sale->update([
                'total_amount' => $totalAmount,
                'total_cost' => $totalCost,
                'profit' => $totalAmount - $totalCost
            ]);
        }

        // 4. Create Stock Adjustments
        for ($i = 0; $i < 15; $i++) { // 15 random adjustments
            $product = $products->random();
            $batch = $product->stockBatches->first();
            $user = $users[array_rand($users)];

            if (!$batch) continue;

            $reasons = ['damaged', 'expired', 'missing', 'correction'];
            $reason = $reasons[array_rand($reasons)];
            $qtyChange = $reason === 'correction' ? rand(1, 10) : -rand(1, 5);

            // Update batch
            if ($batch->quantity + $qtyChange >= 0) {
                $batch->increment('quantity', $qtyChange);
                
                StockAdjustment::create([
                    'product_id' => $product->id,
                    'stock_batch_id' => $batch->id,
                    'adjusted_by' => $user->id,
                    'quantity_change' => $qtyChange,
                    'reason' => $reason,
                    'notes' => 'Demo generated ' . $reason,
                    'created_at' => Carbon::now()->subDays(rand(0, 15)),
                ]);
            }
        }

        // 5. Create Cash Reconciliations
        for ($i = 1; $i <= 10; $i++) {
            $recDate = Carbon::now()->subDays($i);
            // find total cash sales for that day
            $expectedCash = Sale::whereDate('created_at', $recDate)
                                ->where('payment_method', 'cash')
                                ->sum('total_amount');
            
            if ($expectedCash > 0) {
                // random discrepancy between -5 and +5
                $actualCash = $expectedCash + (rand(-50, 50) / 10);
                $diff = $actualCash - $expectedCash;
                
                $status = 'balanced';
                if ($diff > 0) $status = 'over';
                if ($diff < 0) $status = 'short';

                CashReconciliation::create([
                    'worker_id' => $worker->id,
                    'shift_start_time' => $recDate->copy()->setTime(8, 0, 0),
                    'shift_end_time' => $recDate->copy()->setTime(18, 0, 0),
                    'expected_cash' => $expectedCash,
                    'actual_counted_cash' => $actualCash,
                    'difference' => $diff,
                    'status' => $status,
                    'notes' => 'End of shift reconciliation demo',
                    'created_at' => $recDate->copy()->setTime(18, 0, 0),
                ]);
            }
        }
    }
}
