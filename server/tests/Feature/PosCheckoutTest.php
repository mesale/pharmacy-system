<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Product;
use App\Models\StockBatch;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PosCheckoutTest extends TestCase
{
    use RefreshDatabase;

    public function test_fefo_checkout_splits_batches_correctly()
    {
        $this->seed(\Database\Seeders\RolesAndPermissionsSeeder::class);
        $worker = User::factory()->create();
        $worker->assignRole('worker');

        $product = Product::create([
            'name' => 'Paracetamol',
            'selling_price' => 5.00
        ]);

        // Batch 1: Expires soonest (10 units)
        $batch1 = StockBatch::create([
            'product_id' => $product->id,
            'batch_number' => 'B001',
            'cost_price' => 2.00,
            'quantity' => 10,
            'expiry_date' => '2025-01-01',
            'received_date' => '2024-01-01',
        ]);

        // Batch 2: Expires later (20 units)
        $batch2 = StockBatch::create([
            'product_id' => $product->id,
            'batch_number' => 'B002',
            'cost_price' => 3.00,
            'quantity' => 20,
            'expiry_date' => '2025-12-01',
            'received_date' => '2024-01-01',
        ]);

        // We buy 15 units. It should take all 10 from B001, and 5 from B002.
        $response = $this->actingAs($worker)->post('/pos/checkout', [
            'items' => [
                [
                    'product_id' => $product->id,
                    'quantity' => 15,
                    'unit_price' => 5.00
                ]
            ],
            'payment_method' => 'cash',
            'tendered_amount' => 75.00
        ]);

        $response->assertSessionHas('success');
        
        // Assert batches were reduced
        $this->assertEquals(0, $batch1->fresh()->quantity);
        $this->assertEquals(15, $batch2->fresh()->quantity);

        // Assert sale was created with correct financial totals
        // Revenue: 15 * 5 = 75
        // Cost: (10 * 2) + (5 * 3) = 20 + 15 = 35
        // Profit: 75 - 35 = 40
        $this->assertDatabaseHas('sales', [
            'total_amount' => '75.00',
            'total_cost' => '35.00',
            'profit' => '40.00'
        ]);

        // Assert sale items were split correctly across the two batches
        $this->assertDatabaseCount('sale_items', 2);
        
        $this->assertDatabaseHas('sale_items', [
            'batch_id' => $batch1->id,
            'quantity' => 10,
            'unit_cost' => '2.00'
        ]);

        $this->assertDatabaseHas('sale_items', [
            'batch_id' => $batch2->id,
            'quantity' => 5,
            'unit_cost' => '3.00'
        ]);
    }

    public function test_checkout_fails_if_not_enough_stock()
    {
        $this->seed(\Database\Seeders\RolesAndPermissionsSeeder::class);
        $worker = User::factory()->create();
        $worker->assignRole('worker');

        $product = Product::create([
            'name' => 'Paracetamol',
            'selling_price' => 5.00
        ]);

        StockBatch::create([
            'product_id' => $product->id,
            'batch_number' => 'B001',
            'cost_price' => 2.00,
            'quantity' => 5,
            'expiry_date' => '2025-01-01',
            'received_date' => '2024-01-01',
        ]);

        // Try to buy 10, only 5 available
        $response = $this->actingAs($worker)->post('/pos/checkout', [
            'items' => [
                [
                    'product_id' => $product->id,
                    'quantity' => 10,
                    'unit_price' => 5.00
                ]
            ],
            'payment_method' => 'cash',
            'tendered_amount' => 50.00
        ]);

        $response->assertStatus(422); // Aborted due to insufficient stock
    }
}
