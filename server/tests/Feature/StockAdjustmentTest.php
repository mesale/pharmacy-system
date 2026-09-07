<?php

namespace Tests\Feature;

use App\Models\Product;
use App\Models\StockAdjustment;
use App\Models\StockBatch;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class StockAdjustmentTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        
        Role::firstOrCreate(['name' => 'admin']);
        Role::firstOrCreate(['name' => 'worker']);
    }

    public function test_worker_can_submit_damaged_stock_report_and_deduct_inventory()
    {
        $worker = User::factory()->create();
        $worker->assignRole('worker');

        $product = Product::create([
            'name' => 'Test Product',
            'selling_price' => 10,
        ]);
        $batch = StockBatch::create([
            'product_id' => $product->id,
            'batch_number' => 'B001',
            'cost_price' => 5,
            'quantity' => 10,
            'expiry_date' => now()->addYear(),
            'received_date' => now(),
        ]);

        $response = $this->actingAs($worker)->post(route('adjustments.store', $batch), [
            'quantity_change' => -3,
            'reason' => 'damaged',
            'notes' => 'Dropped on floor',
        ]);

        $response->assertSessionHasNoErrors();
        $response->assertRedirect();

        // Verify batch quantity decreased
        $batch->refresh();
        $this->assertEquals(7, $batch->quantity);

        // Verify audit log created
        $this->assertDatabaseHas('stock_adjustments', [
            'product_id' => $product->id,
            'stock_batch_id' => $batch->id,
            'adjusted_by' => $worker->id,
            'quantity_change' => -3,
            'reason' => 'damaged',
            'notes' => 'Dropped on floor',
        ]);
    }

    public function test_cannot_deduct_more_stock_than_available()
    {
        $worker = User::factory()->create();
        $worker->assignRole('worker');

        $product = Product::create([
            'name' => 'Test Product 2',
            'selling_price' => 10,
        ]);
        $batch = StockBatch::create([
            'product_id' => $product->id,
            'batch_number' => 'B002',
            'cost_price' => 5,
            'quantity' => 5,
            'expiry_date' => now()->addYear(),
            'received_date' => now(),
        ]);

        $response = $this->actingAs($worker)->post(route('adjustments.store', $batch), [
            'quantity_change' => -10, // Trying to deduct 10 from 5
            'reason' => 'missing',
        ]);

        $response->assertSessionHasErrors('quantity_change');
        
        $batch->refresh();
        $this->assertEquals(5, $batch->quantity);
    }

    public function test_admin_can_view_global_audit_log()
    {
        $admin = User::factory()->create();
        $admin->assignRole('admin');

        $product = Product::create([
            'name' => 'Test Product 3',
            'selling_price' => 10,
        ]);
        $batch = StockBatch::create([
            'product_id' => $product->id,
            'batch_number' => 'B003',
            'cost_price' => 5,
            'quantity' => 10,
            'expiry_date' => now()->addYear(),
            'received_date' => now(),
        ]);

        StockAdjustment::create([
            'product_id' => $product->id,
            'stock_batch_id' => $batch->id,
            'adjusted_by' => $admin->id,
            'quantity_change' => -1,
            'reason' => 'expired',
        ]);

        $response = $this->actingAs($admin)->get(route('adjustments.index'));
        $response->assertStatus(200);
    }

    public function test_worker_cannot_view_global_audit_log()
    {
        $worker = User::factory()->create();
        $worker->assignRole('worker');

        $response = $this->actingAs($worker)->get(route('adjustments.index'));
        $response->assertStatus(403);
    }
}
