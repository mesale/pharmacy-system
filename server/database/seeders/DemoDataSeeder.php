<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Category;
use App\Models\Supplier;
use App\Models\Product;
use App\Models\StockBatch;
use Carbon\Carbon;
use Illuminate\Support\Str;

class DemoDataSeeder extends Seeder
{
    public function run(): void
    {
        $categories = [
            'Analgesics', 'Antibiotics', 'Antihistamines', 'Cardiovascular', 
            'Dermatological', 'Gastrointestinal', 'Neurological', 'Vitamins & Supplements'
        ];

        $categoryModels = [];
        foreach ($categories as $cat) {
            $categoryModels[] = Category::firstOrCreate(['name' => $cat]);
        }

        $suppliers = [
            ['name' => 'PharmaCorp Global', 'email' => 'sales@pharmacorp.com', 'phone' => '+1-555-0192'],
            ['name' => 'MediSupply Logistics', 'email' => 'orders@medisupply.net', 'phone' => '+1-555-8472'],
            ['name' => 'BioHealth Distributors', 'email' => 'contact@biohealth.org', 'phone' => '+1-555-3391'],
        ];

        $supplierModels = [];
        foreach ($suppliers as $sup) {
            $supplierModels[] = Supplier::firstOrCreate(['name' => $sup['name']], $sup);
        }

        $productsData = [
            ['name' => 'Paracetamol 500mg', 'unit' => 'Tablets', 'price' => 5.99, 'rx' => false, 'ctrl' => false, 'cat' => 'Analgesics'],
            ['name' => 'Ibuprofen 400mg', 'unit' => 'Tablets', 'price' => 7.50, 'rx' => false, 'ctrl' => false, 'cat' => 'Analgesics'],
            ['name' => 'Amoxicillin 250mg', 'unit' => 'Capsules', 'price' => 12.99, 'rx' => true, 'ctrl' => false, 'cat' => 'Antibiotics'],
            ['name' => 'Ciprofloxacin 500mg', 'unit' => 'Tablets', 'price' => 18.50, 'rx' => true, 'ctrl' => false, 'cat' => 'Antibiotics'],
            ['name' => 'Loratadine 10mg', 'unit' => 'Tablets', 'price' => 9.25, 'rx' => false, 'ctrl' => false, 'cat' => 'Antihistamines'],
            ['name' => 'Cetirizine 10mg', 'unit' => 'Tablets', 'price' => 8.75, 'rx' => false, 'ctrl' => false, 'cat' => 'Antihistamines'],
            ['name' => 'Lisinopril 20mg', 'unit' => 'Tablets', 'price' => 22.00, 'rx' => true, 'ctrl' => false, 'cat' => 'Cardiovascular'],
            ['name' => 'Atorvastatin 40mg', 'unit' => 'Tablets', 'price' => 28.50, 'rx' => true, 'ctrl' => false, 'cat' => 'Cardiovascular'],
            ['name' => 'Hydrocortisone Cream 1%', 'unit' => 'Tube', 'price' => 6.50, 'rx' => false, 'ctrl' => false, 'cat' => 'Dermatological'],
            ['name' => 'Omeprazole 20mg', 'unit' => 'Capsules', 'price' => 14.99, 'rx' => false, 'ctrl' => false, 'cat' => 'Gastrointestinal'],
            ['name' => 'Pantoprazole 40mg', 'unit' => 'Tablets', 'price' => 16.50, 'rx' => true, 'ctrl' => false, 'cat' => 'Gastrointestinal'],
            ['name' => 'Gabapentin 300mg', 'unit' => 'Capsules', 'price' => 24.00, 'rx' => true, 'ctrl' => true, 'cat' => 'Neurological'],
            ['name' => 'Vitamin C 1000mg', 'unit' => 'Tablets', 'price' => 11.20, 'rx' => false, 'ctrl' => false, 'cat' => 'Vitamins & Supplements'],
            ['name' => 'Vitamin D3 5000 IU', 'unit' => 'Softgels', 'price' => 13.40, 'rx' => false, 'ctrl' => false, 'cat' => 'Vitamins & Supplements'],
            ['name' => 'Diazepam 5mg', 'unit' => 'Tablets', 'price' => 35.00, 'rx' => true, 'ctrl' => true, 'cat' => 'Neurological'],
            ['name' => 'Morphine Sulfate 15mg', 'unit' => 'Tablets', 'price' => 85.00, 'rx' => true, 'ctrl' => true, 'cat' => 'Analgesics'],
            ['name' => 'Salbutamol Inhaler 100mcg', 'unit' => 'Inhaler', 'price' => 15.75, 'rx' => true, 'ctrl' => false, 'cat' => 'Antihistamines'],
            ['name' => 'Metformin 500mg', 'unit' => 'Tablets', 'price' => 8.90, 'rx' => true, 'ctrl' => false, 'cat' => 'Cardiovascular'],
            ['name' => 'Aspirin 81mg', 'unit' => 'Tablets', 'price' => 4.50, 'rx' => false, 'ctrl' => false, 'cat' => 'Analgesics'],
            ['name' => 'Clotrimazole Cream 1%', 'unit' => 'Tube', 'price' => 7.20, 'rx' => false, 'ctrl' => false, 'cat' => 'Dermatological'],
        ];

        foreach ($productsData as $data) {
            $category = collect($categoryModels)->firstWhere('name', $data['cat']);
            
            $product = Product::firstOrCreate(
                ['name' => $data['name']],
                [
                    'category_id' => $category->id ?? null,
                    'barcode' => strtoupper(Str::random(12)),
                    'unit' => $data['unit'],
                    'selling_price' => $data['price'],
                    'reorder_level' => rand(20, 50),
                    'requires_prescription' => $data['rx'],
                    'is_controlled' => $data['ctrl'],
                ]
            );

            // Create 1-3 stock batches for each product
            $batchCount = rand(1, 3);
            for ($i = 0; $i < $batchCount; $i++) {
                $supplier = collect($supplierModels)->random();
                $quantity = rand(50, 200);
                $costPrice = $data['price'] * (rand(40, 70) / 100); // Cost is 40-70% of selling price
                
                StockBatch::create([
                    'product_id' => $product->id,
                    'supplier_id' => $supplier->id,
                    'batch_number' => 'B-' . strtoupper(Str::random(6)),
                    'cost_price' => round($costPrice, 2),
                    'quantity' => $quantity,
                    'expiry_date' => Carbon::now()->addMonths(rand(3, 36)),
                    'received_date' => Carbon::now()->subDays(rand(1, 60)),
                ]);
            }
        }
    }
}
