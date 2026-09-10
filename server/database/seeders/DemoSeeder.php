<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Category;
use App\Models\Supplier;
use App\Models\Product;
use App\Models\StockBatch;
use App\Models\Sale;
use App\Models\SaleItem;
use App\Models\User;
use Carbon\Carbon;

class DemoSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::firstOrCreate(['email' => 'admin@pharmacy.test'], [
            'name' => 'Admin User',
            'password' => bcrypt('password')
        ]);

        $categories = ['Analgesics', 'Antibiotics', 'Vitamins', 'First Aid', 'Cardiovascular', 'Respiratory'];
        $catModels = [];
        foreach ($categories as $cat) {
            $catModels[] = Category::firstOrCreate(['name' => $cat]);
        }

        $suppliers = [
            ['name' => 'PharmaCorp Inc.', 'phone' => '555-0100', 'email' => 'orders@pharmacorp.com'],
            ['name' => 'MedSupply Global', 'phone' => '555-0200', 'email' => 'sales@medsupply.com'],
            ['name' => 'HealthCare Distributors', 'phone' => '555-0300', 'email' => 'dist@healthcare.com']
        ];
        $supModels = [];
        foreach ($suppliers as $sup) {
            $supModels[] = Supplier::firstOrCreate($sup);
        }

        $products = [
            ['name' => 'Paracetamol 500mg', 'category' => 'Analgesics', 'price' => 5.99, 'cost' => 2.00, 'reorder' => 50],
            ['name' => 'Ibuprofen 400mg', 'category' => 'Analgesics', 'price' => 7.50, 'cost' => 3.00, 'reorder' => 40],
            ['name' => 'Amoxicillin 250mg', 'category' => 'Antibiotics', 'price' => 15.00, 'cost' => 8.00, 'reorder' => 20],
            ['name' => 'Vitamin C 1000mg', 'category' => 'Vitamins', 'price' => 12.99, 'cost' => 5.00, 'reorder' => 30],
            ['name' => 'Band-Aids Pack', 'category' => 'First Aid', 'price' => 4.50, 'cost' => 1.50, 'reorder' => 100],
            ['name' => 'Lisinopril 10mg', 'category' => 'Cardiovascular', 'price' => 25.00, 'cost' => 15.00, 'reorder' => 15],
            ['name' => 'Albuterol Inhaler', 'category' => 'Respiratory', 'price' => 45.00, 'cost' => 20.00, 'reorder' => 10],
            ['name' => 'Aspirin 81mg', 'category' => 'Analgesics', 'price' => 6.99, 'cost' => 2.50, 'reorder' => 60],
            ['name' => 'Multivitamin Gummies', 'category' => 'Vitamins', 'price' => 14.50, 'cost' => 6.00, 'reorder' => 25],
            ['name' => 'Azithromycin 500mg', 'category' => 'Antibiotics', 'price' => 22.00, 'cost' => 12.00, 'reorder' => 20],
        ];

        $prodModels = [];
        foreach ($products as $p) {
            $category = Category::where('name', $p['category'])->first();
            $product = Product::firstOrCreate(
                ['name' => $p['name']],
                [
                    'category_id' => $category->id,
                    'barcode' => 'UPC' . rand(1000000, 9999999),
                    'selling_price' => $p['price'],
                    'reorder_level' => $p['reorder']
                ]
            );
            $prodModels[] = $product;

            // Add good stock
            StockBatch::create([
                'product_id' => $product->id,
                'supplier_id' => $supModels[array_rand($supModels)]->id,
                'batch_number' => 'B' . rand(1000, 9999),
                'cost_price' => $p['cost'],
                'quantity' => rand(50, 200),
                'expiry_date' => Carbon::now()->addMonths(rand(6, 24)),
                'received_date' => Carbon::now()->subDays(rand(1, 30))
            ]);

            // Add some low stock for testing alerts
            if (rand(1, 3) === 1) {
                StockBatch::create([
                    'product_id' => $product->id,
                    'batch_number' => 'LOW' . rand(1000, 9999),
                    'cost_price' => $p['cost'],
                    'quantity' => rand(1, 5),
                    'expiry_date' => Carbon::now()->addMonths(rand(1, 3)),
                    'received_date' => Carbon::now()->subDays(rand(10, 50))
                ]);
            }

            // Add some expired stock for testing alerts
            if (rand(1, 5) === 1) {
                StockBatch::create([
                    'product_id' => $product->id,
                    'batch_number' => 'EXP' . rand(1000, 9999),
                    'cost_price' => $p['cost'],
                    'quantity' => rand(10, 50),
                    'expiry_date' => Carbon::now()->subMonths(rand(1, 3)),
                    'received_date' => Carbon::now()->subDays(rand(100, 200))
                ]);
            }
        }

        // Generate Sales for Today to populate chart
        $hours = [8, 10, 12, 14, 16];
        foreach ($hours as $hour) {
            $numSales = rand(2, 6);
            for ($i = 0; $i < $numSales; $i++) {
                $sale = Sale::create([
                    'worker_id' => $admin->id,
                    'total_amount' => 0,
                    'total_cost' => 0,
                    'profit' => 0,
                    'payment_method' => 'cash',
                    'created_at' => Carbon::today()->setHour($hour)->setMinute(rand(0, 59)),
                    'updated_at' => Carbon::today()->setHour($hour)->setMinute(rand(0, 59))
                ]);

                $total = 0;
                $cost = 0;
                $numItems = rand(1, 4);
                for ($j = 0; $j < $numItems; $j++) {
                    $product = $prodModels[array_rand($prodModels)];
                    $batch = $product->stockBatches()->first();
                    $qty = rand(1, 3);
                    $price = $product->selling_price;
                    $unitCost = $batch->cost_price ?? ($price * 0.5);
                    
                    SaleItem::create([
                        'sale_id' => $sale->id,
                        'product_id' => $product->id,
                        'batch_id' => $batch ? $batch->id : 1,
                        'quantity' => $qty,
                        'unit_price' => $price,
                        'unit_cost' => $unitCost
                    ]);
                    $total += $qty * $price;
                    $cost += $qty * $unitCost;
                }
                $sale->update([
                    'total_amount' => $total,
                    'total_cost' => $cost,
                    'profit' => $total - $cost
                ]);
            }
        }

        // Generate some historical sales for reports
        for ($d = 1; $d <= 30; $d++) {
            $numSales = rand(5, 15);
            for ($i = 0; $i < $numSales; $i++) {
                $sale = Sale::create([
                    'worker_id' => $admin->id,
                    'total_amount' => 0,
                    'total_cost' => 0,
                    'profit' => 0,
                    'payment_method' => 'card',
                    'created_at' => Carbon::now()->subDays($d)->setHour(rand(8, 18))->setMinute(rand(0, 59)),
                    'updated_at' => Carbon::now()->subDays($d)->setHour(rand(8, 18))->setMinute(rand(0, 59))
                ]);

                $total = 0;
                $cost = 0;
                $product = $prodModels[array_rand($prodModels)];
                $batch = $product->stockBatches()->first();
                $qty = rand(1, 5);
                $price = $product->selling_price;
                $unitCost = $batch->cost_price ?? ($price * 0.5);

                SaleItem::create([
                    'sale_id' => $sale->id,
                    'product_id' => $product->id,
                    'batch_id' => $batch ? $batch->id : 1,
                    'quantity' => $qty,
                    'unit_price' => $price,
                    'unit_cost' => $unitCost
                ]);
                $total += $qty * $price;
                $cost += $qty * $unitCost;
                
                $sale->update([
                    'total_amount' => $total,
                    'total_cost' => $cost,
                    'profit' => $total - $cost
                ]);
            }
        }
    }
}
