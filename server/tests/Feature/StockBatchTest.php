<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Product;
use App\Models\StockBatch;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class StockBatchTest extends TestCase
{
    use RefreshDatabase;

    public function test_batches_ordered_by_fefo()
    {
        $this->seed(\Database\Seeders\RolesAndPermissionsSeeder::class);
        $admin = User::factory()->create();
        $admin->assignRole('admin');

        $product = Product::create([
            'name' => 'Amoxicillin',
            'selling_price' => 15.00
        ]);

        // Create a batch that expires later
        StockBatch::create([
            'product_id' => $product->id,
            'batch_number' => 'BATCH-002',
            'cost_price' => 10.00,
            'quantity' => 50,
            'expiry_date' => '2025-12-31',
            'received_date' => '2024-01-01',
        ]);

        // Create a batch that expires sooner
        StockBatch::create([
            'product_id' => $product->id,
            'batch_number' => 'BATCH-001',
            'cost_price' => 10.00,
            'quantity' => 20,
            'expiry_date' => '2025-06-30',
            'received_date' => '2024-01-01',
        ]);

        $batches = $product->stockBatches; // Relies on the default relationship ordering
        
        $this->assertEquals('BATCH-001', $batches->first()->batch_number);
        $this->assertEquals('BATCH-002', $batches->last()->batch_number);
    }
}
