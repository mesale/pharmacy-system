<?php

namespace Tests\Feature;

use App\Models\Product;
use App\Models\StockBatch;
use App\Models\Supplier;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class PurchasingTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        
        Role::firstOrCreate(['name' => 'admin']);
        Role::firstOrCreate(['name' => 'worker']);
    }

    public function test_admin_can_view_purchasing_suggestions()
    {
        $admin = User::factory()->create();
        $admin->assignRole('admin');

        $supplier = Supplier::create(['name' => 'PharmaCorp']);
        
        // Low stock product (current stock = 10, reorder = 15)
        $lowStockProduct = Product::create([
            'name' => 'Low Stock Item',
            'reorder_level' => 15,
            'selling_price' => 10,
        ]);
        StockBatch::create([
            'product_id' => $lowStockProduct->id,
            'supplier_id' => $supplier->id,
            'batch_number' => 'B001',
            'cost_price' => 5,
            'quantity' => 10,
            'expiry_date' => now()->addYear(),
            'received_date' => now(),
        ]);

        // Healthy stock product (current stock = 50, reorder = 15)
        $healthyProduct = Product::create([
            'name' => 'Healthy Item',
            'reorder_level' => 15,
            'selling_price' => 10,
        ]);
        StockBatch::create([
            'product_id' => $healthyProduct->id,
            'supplier_id' => $supplier->id,
            'batch_number' => 'B002',
            'cost_price' => 5,
            'quantity' => 50,
            'expiry_date' => now()->addYear(),
            'received_date' => now(),
        ]);

        $response = $this->actingAs($admin)->get(route('purchasing.index'));

        $response->assertStatus(200);
        
        $props = $response->viewData('page')['props'];
        $groupedSuggestions = collect($props['groupedSuggestions']);

        // Should only have suggestions for PharmaCorp
        $this->assertTrue($groupedSuggestions->has('PharmaCorp'));
        
        $pharmaCorpSuggestions = collect($groupedSuggestions['PharmaCorp']);
        
        // Should only contain the Low Stock Item
        $this->assertCount(1, $pharmaCorpSuggestions);
        $this->assertEquals('Low Stock Item', $pharmaCorpSuggestions->first()['product_name']);
        
        // Suggested qty = (reorder * 2) - current = (15 * 2) - 10 = 20
        $this->assertEquals(20, $pharmaCorpSuggestions->first()['suggested_qty']);
    }

    public function test_worker_cannot_view_purchasing_suggestions()
    {
        $worker = User::factory()->create();
        $worker->assignRole('worker');

        $response = $this->actingAs($worker)->get(route('purchasing.index'));
        $response->assertStatus(403);
    }
}

