<?php

namespace Tests\Feature;

use App\Models\Category;
use App\Models\Product;
use App\Models\StockBatch;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\TestCase;

/**
 * The product form (Products/Create, which doubles as the edit form) shipped
 * with no route rendering it, so a product could be created from the index but
 * never edited. Cost price was also sent to every authenticated viewer of a
 * product, which hands a worker the pharmacy's margin on every line.
 */
class ProductFormTest extends TestCase
{
    use RefreshDatabase;

    private function admin(): User
    {
        $this->seed(\Database\Seeders\RolesAndPermissionsSeeder::class);
        $user = User::factory()->create();
        $user->assignRole('admin');

        return $user;
    }

    private function worker(): User
    {
        $this->seed(\Database\Seeders\RolesAndPermissionsSeeder::class);
        $user = User::factory()->create();
        $user->assignRole('worker');

        return $user;
    }

    private function productWithBatch(): Product
    {
        $product = Product::create([
            'name' => 'Amoxicillin 500mg',
            'category_id' => Category::create(['name' => 'Antibiotics'])->id,
            'barcode' => '5901234123457',
            'unit' => 'capsule',
            'selling_price' => 45.00,
            'reorder_level' => 10,
        ]);

        StockBatch::create([
            'product_id' => $product->id,
            'batch_number' => 'B-001',
            'cost_price' => 30.00,
            'quantity' => 50,
            // Relative to now: a hard-coded date drifts into the past and
            // turns this fixture into expired stock.
            'expiry_date' => now()->addMonths(12)->toDateString(),
            'received_date' => now()->subDay()->toDateString(),
        ]);

        return $product;
    }

    public function test_admin_can_open_the_create_product_form(): void
    {
        // /products/create must not be swallowed by the /products/{product}
        // route as a product whose id is the string "create".
        $this->actingAs($this->admin())
            ->get('/products/create')
            ->assertStatus(200)
            ->assertInertia(fn (Assert $page) => $page->component('Products/Create'));
    }

    public function test_admin_can_open_the_edit_product_form(): void
    {
        $product = $this->productWithBatch();

        $this->actingAs($this->admin())
            ->get("/products/{$product->id}/edit")
            ->assertStatus(200)
            ->assertInertia(fn (Assert $page) => $page
                ->component('Products/Create')
                ->where('product.id', $product->id));
    }

    public function test_worker_cannot_open_the_product_forms(): void
    {
        $worker = $this->worker();
        $product = $this->productWithBatch();

        $this->actingAs($worker)->get('/products/create')->assertForbidden();
        $this->actingAs($worker)->get("/products/{$product->id}/edit")->assertForbidden();
    }

    public function test_admin_can_update_a_product(): void
    {
        $product = $this->productWithBatch();

        $this->actingAs($this->admin())
            ->patch("/products/{$product->id}", [
                'name' => 'Amoxicillin 250mg',
                'selling_price' => 30.00,
            ])
            ->assertRedirect();

        $this->assertDatabaseHas('products', [
            'id' => $product->id,
            'name' => 'Amoxicillin 250mg',
        ]);
    }

    public function test_admin_sees_cost_price_on_a_product(): void
    {
        $product = $this->productWithBatch();

        $this->actingAs($this->admin())
            ->get("/products/{$product->id}")
            ->assertStatus(200)
            ->assertInertia(fn (Assert $page) => $page
                ->where('canViewCost', true)
                ->where('product.stock_batches.0.cost_price', '30.00'));
    }

    public function test_worker_is_never_sent_the_cost_price(): void
    {
        $worker = $this->worker();
        $product = $this->productWithBatch();

        $this->actingAs($worker)
            ->get("/products/{$product->id}")
            ->assertStatus(200)
            ->assertInertia(fn (Assert $page) => $page
                ->where('canViewCost', false)
                ->missing('product.stock_batches.0.cost_price'));
    }
}
