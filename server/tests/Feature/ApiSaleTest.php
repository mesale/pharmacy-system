<?php

namespace Tests\Feature;

use App\Models\Product;
use App\Models\StockBatch;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Laravel\Sanctum\Sanctum;
use Tests\TestCase;

/**
 * The mobile till posts to /api/sales. That endpoint used to assume a flat
 * product.stock column and failed on every sale; these tests pin it to the same
 * FEFO behaviour as the web till, now that both share SaleService.
 */
class ApiSaleTest extends TestCase
{
    use RefreshDatabase;

    private function worker(): User
    {
        $this->seed(\Database\Seeders\RolesAndPermissionsSeeder::class);
        $worker = User::factory()->create();
        $worker->assignRole('worker');

        return $worker;
    }

    private function batch(Product $product, array $attributes = []): StockBatch
    {
        return StockBatch::create(array_merge([
            'product_id' => $product->id,
            'batch_number' => 'B'.fake()->unique()->numerify('###'),
            'cost_price' => 2.00,
            'quantity' => 10,
            'expiry_date' => now()->addMonths(6)->toDateString(),
            'received_date' => now()->subMonth()->toDateString(),
        ], $attributes));
    }

    public function test_mobile_sale_deducts_fefo_and_returns_201()
    {
        $worker = $this->worker();
        Sanctum::actingAs($worker);

        $product = Product::create(['name' => 'Paracetamol', 'selling_price' => 5.00]);

        $soonest = $this->batch($product, [
            'cost_price' => 2.00, 'quantity' => 10,
            'expiry_date' => now()->addMonths(3)->toDateString(),
        ]);
        $later = $this->batch($product, [
            'cost_price' => 3.00, 'quantity' => 20,
            'expiry_date' => now()->addMonths(9)->toDateString(),
        ]);

        $response = $this->postJson('/api/sales', [
            'payment_method' => 'cash',
            'items' => [['product_id' => $product->id, 'quantity' => 15]],
            'tendered_amount' => 75.00,
        ]);

        $response->assertStatus(201)
            ->assertJsonStructure(['message', 'sale_id', 'total_amount']);

        // FEFO: soonest-expiring batch drained first.
        $this->assertEquals(0, $soonest->fresh()->quantity);
        $this->assertEquals(15, $later->fresh()->quantity);

        $this->assertDatabaseHas('sales', [
            'total_amount' => '75.00',
            'total_cost' => '35.00',
            'profit' => '40.00',
        ]);
        // Every sale item is tied to the batch it came from.
        $this->assertDatabaseHas('sale_items', ['batch_id' => $soonest->id, 'quantity' => 10]);
        $this->assertDatabaseHas('sale_items', ['batch_id' => $later->id, 'quantity' => 5]);
    }

    public function test_mobile_sale_with_insufficient_stock_returns_422_with_message()
    {
        $worker = $this->worker();
        Sanctum::actingAs($worker);

        $product = Product::create(['name' => 'Amoxicillin', 'selling_price' => 5.00]);
        $this->batch($product, ['quantity' => 5]);

        $response = $this->postJson('/api/sales', [
            'payment_method' => 'cash',
            'items' => [['product_id' => $product->id, 'quantity' => 10]],
            'tendered_amount' => 50.00,
        ]);

        // The mobile client reads err.response.data.message; a 422 with that key
        // is what it expects on a validation failure.
        $response->assertStatus(422)->assertJsonStructure(['message', 'errors']);
        $this->assertDatabaseCount('sales', 0);
        $this->assertDatabaseCount('sale_items', 0);
    }

    public function test_mobile_sale_price_comes_from_catalogue_not_request()
    {
        $worker = $this->worker();
        Sanctum::actingAs($worker);

        $product = Product::create(['name' => 'Insulin', 'selling_price' => 100.00]);
        $this->batch($product, ['cost_price' => 40.00, 'quantity' => 5]);

        // Tampered unit_price must be ignored.
        $response = $this->postJson('/api/sales', [
            'payment_method' => 'cash',
            'items' => [['product_id' => $product->id, 'quantity' => 2, 'unit_price' => 1.00]],
            'tendered_amount' => 200.00,
        ]);

        $response->assertStatus(201);
        $this->assertDatabaseHas('sales', ['total_amount' => '200.00', 'profit' => '120.00']);
        $this->assertDatabaseHas('sale_items', ['product_id' => $product->id, 'unit_price' => '100.00']);
    }

    public function test_mobile_cash_sale_underpaid_is_rejected()
    {
        $worker = $this->worker();
        Sanctum::actingAs($worker);

        $product = Product::create(['name' => 'Metformin', 'selling_price' => 20.00]);
        $batch = $this->batch($product, ['quantity' => 10]);

        $response = $this->postJson('/api/sales', [
            'payment_method' => 'cash',
            'items' => [['product_id' => $product->id, 'quantity' => 3]], // total 60
            'tendered_amount' => 10.00,
        ]);

        $response->assertStatus(422)->assertJsonValidationErrors('tendered_amount');
        $this->assertDatabaseCount('sales', 0);
        $this->assertEquals(10, $batch->fresh()->quantity);
    }
}
