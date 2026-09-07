<?php

namespace Tests\Feature;

use App\Models\Product;
use App\Models\StockBatch;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PosCheckoutTest extends TestCase
{
    use RefreshDatabase;

    private function worker(): User
    {
        $this->seed(\Database\Seeders\RolesAndPermissionsSeeder::class);
        $worker = User::factory()->create();
        $worker->assignRole('worker');

        return $worker;
    }

    /**
     * Expiry dates are always relative to now. Hard-coded dates silently drift
     * into the past and turn these fixtures into expired stock.
     */
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

    public function test_fefo_checkout_splits_batches_correctly()
    {
        $worker = $this->worker();

        $product = Product::create([
            'name' => 'Paracetamol',
            'selling_price' => 5.00,
        ]);

        // Batch 1: expires soonest (10 units)
        $batch1 = $this->batch($product, [
            'batch_number' => 'B001',
            'cost_price' => 2.00,
            'quantity' => 10,
            'expiry_date' => now()->addMonths(3)->toDateString(),
        ]);

        // Batch 2: expires later (20 units)
        $batch2 = $this->batch($product, [
            'batch_number' => 'B002',
            'cost_price' => 3.00,
            'quantity' => 20,
            'expiry_date' => now()->addMonths(9)->toDateString(),
        ]);

        // We buy 15 units. It should take all 10 from B001, and 5 from B002.
        $response = $this->actingAs($worker)->post('/pos/checkout', [
            'items' => [
                ['product_id' => $product->id, 'quantity' => 15],
            ],
            'payment_method' => 'cash',
            'tendered_amount' => 75.00,
        ]);

        $response->assertSessionHas('success');

        $this->assertEquals(0, $batch1->fresh()->quantity);
        $this->assertEquals(15, $batch2->fresh()->quantity);

        // Revenue: 15 * 5 = 75
        // Cost: (10 * 2) + (5 * 3) = 20 + 15 = 35
        // Profit: 75 - 35 = 40
        $this->assertDatabaseHas('sales', [
            'total_amount' => '75.00',
            'total_cost' => '35.00',
            'profit' => '40.00',
        ]);

        $this->assertDatabaseCount('sale_items', 2);

        $this->assertDatabaseHas('sale_items', [
            'batch_id' => $batch1->id,
            'quantity' => 10,
            'unit_cost' => '2.00',
        ]);

        $this->assertDatabaseHas('sale_items', [
            'batch_id' => $batch2->id,
            'quantity' => 5,
            'unit_cost' => '3.00',
        ]);
    }

    public function test_checkout_fails_if_not_enough_stock()
    {
        $worker = $this->worker();

        $product = Product::create([
            'name' => 'Paracetamol',
            'selling_price' => 5.00,
        ]);

        $this->batch($product, ['quantity' => 5]);

        $response = $this->actingAs($worker)->post('/pos/checkout', [
            'items' => [
                ['product_id' => $product->id, 'quantity' => 10],
            ],
            'payment_method' => 'cash',
            'tendered_amount' => 50.00,
        ]);

        $response->assertSessionHasErrors('items');
        $this->assertDatabaseCount('sales', 0);
        $this->assertDatabaseCount('sale_items', 0);
    }

    public function test_expired_stock_is_never_dispensed()
    {
        $worker = $this->worker();

        $product = Product::create([
            'name' => 'Amoxicillin',
            'selling_price' => 10.00,
        ]);

        $expired = $this->batch($product, [
            'quantity' => 50,
            'expiry_date' => now()->subDay()->toDateString(),
        ]);

        $response = $this->actingAs($worker)->post('/pos/checkout', [
            'items' => [
                ['product_id' => $product->id, 'quantity' => 1],
            ],
            'payment_method' => 'cash',
            'tendered_amount' => 10.00,
        ]);

        $response->assertSessionHasErrors('items');
        $this->assertEquals(50, $expired->fresh()->quantity);
        $this->assertDatabaseCount('sales', 0);
    }

    public function test_fefo_skips_expired_batch_and_uses_the_next_valid_one()
    {
        $worker = $this->worker();

        $product = Product::create([
            'name' => 'Ibuprofen',
            'selling_price' => 8.00,
        ]);

        $expired = $this->batch($product, [
            'cost_price' => 1.00,
            'quantity' => 10,
            'expiry_date' => now()->subWeek()->toDateString(),
        ]);

        $valid = $this->batch($product, [
            'cost_price' => 4.00,
            'quantity' => 10,
            'expiry_date' => now()->addMonths(2)->toDateString(),
        ]);

        $response = $this->actingAs($worker)->post('/pos/checkout', [
            'items' => [
                ['product_id' => $product->id, 'quantity' => 3],
            ],
            'payment_method' => 'cash',
            'tendered_amount' => 24.00,
        ]);

        $response->assertSessionHas('success');

        // The expired batch is untouched even though it expires soonest.
        $this->assertEquals(10, $expired->fresh()->quantity);
        $this->assertEquals(7, $valid->fresh()->quantity);

        $this->assertDatabaseHas('sales', [
            'total_amount' => '24.00',
            'total_cost' => '12.00',
            'profit' => '12.00',
        ]);
    }

    public function test_price_comes_from_the_catalogue_not_the_request()
    {
        $worker = $this->worker();

        $product = Product::create([
            'name' => 'Insulin',
            'selling_price' => 100.00,
        ]);

        $this->batch($product, ['cost_price' => 40.00, 'quantity' => 5]);

        // A tampered request asking to sell at 1.00 must be ignored.
        $response = $this->actingAs($worker)->post('/pos/checkout', [
            'items' => [
                ['product_id' => $product->id, 'quantity' => 2, 'unit_price' => 1.00],
            ],
            'payment_method' => 'cash',
            'tendered_amount' => 200.00,
        ]);

        $response->assertSessionHas('success');

        $this->assertDatabaseHas('sales', [
            'total_amount' => '200.00',
            'total_cost' => '80.00',
            'profit' => '120.00',
        ]);

        $this->assertDatabaseHas('sale_items', [
            'product_id' => $product->id,
            'unit_price' => '100.00',
        ]);
    }

    public function test_cash_sale_is_rejected_when_tendered_is_less_than_the_total()
    {
        $worker = $this->worker();

        $product = Product::create([
            'name' => 'Metformin',
            'selling_price' => 20.00,
        ]);

        $batch = $this->batch($product, ['quantity' => 10]);

        $response = $this->actingAs($worker)->post('/pos/checkout', [
            'items' => [
                ['product_id' => $product->id, 'quantity' => 3],
            ],
            'payment_method' => 'cash',
            'tendered_amount' => 10.00, // total is 60.00
        ]);

        $response->assertSessionHasErrors('tendered_amount');
        $this->assertDatabaseCount('sales', 0);
        $this->assertEquals(10, $batch->fresh()->quantity);
    }

    public function test_duplicate_line_items_for_one_product_are_combined()
    {
        $worker = $this->worker();

        $product = Product::create([
            'name' => 'Aspirin',
            'selling_price' => 5.00,
        ]);

        $batch = $this->batch($product, ['cost_price' => 2.00, 'quantity' => 4]);

        // 3 + 3 = 6 requested against 4 in stock: must be refused, not partially sold.
        $response = $this->actingAs($worker)->post('/pos/checkout', [
            'items' => [
                ['product_id' => $product->id, 'quantity' => 3],
                ['product_id' => $product->id, 'quantity' => 3],
            ],
            'payment_method' => 'cash',
            'tendered_amount' => 30.00,
        ]);

        $response->assertSessionHasErrors('items');
        $this->assertEquals(4, $batch->fresh()->quantity);
        $this->assertDatabaseCount('sales', 0);
    }

    public function test_pos_search_by_barcode_excludes_out_of_stock_products()
    {
        $worker = $this->worker();

        $inStock = Product::create([
            'name' => 'In Stock Item',
            'barcode' => '1112223334',
            'selling_price' => 5.00,
        ]);
        $this->batch($inStock, ['quantity' => 5]);

        // Same barcode prefix, but no sellable stock at all.
        $outOfStock = Product::create([
            'name' => 'Out Of Stock Item',
            'barcode' => '1112229998',
            'selling_price' => 5.00,
        ]);
        $this->batch($outOfStock, ['quantity' => 0]);

        $response = $this->actingAs($worker)->get('/pos?search=111222');

        $response->assertInertia(fn ($page) => $page
            ->component('Pos/Index')
            ->where('products', fn ($products) => collect($products)->count() === 1
                && collect($products)->first()['id'] === $inStock->id
            )
        );
    }
}
