<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Product;
use App\Models\Category;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class ProductTest extends TestCase
{
    use RefreshDatabase;

    public function test_admin_can_create_product()
    {
        $this->seed(\Database\Seeders\RolesAndPermissionsSeeder::class);
        $admin = User::factory()->create();
        $admin->assignRole('admin');

        $category = Category::create(['name' => 'Painkillers']);

        $response = $this->actingAs($admin)->post('/products', [
            'name' => 'Ibuprofen',
            'category_id' => $category->id,
            'barcode' => '123456789',
            'unit' => 'box',
            'selling_price' => 12.50,
            'reorder_level' => 20,
            'requires_prescription' => false,
            'is_controlled' => false,
        ]);

        $response->assertRedirect();
        $this->assertDatabaseHas('products', [
            'name' => 'Ibuprofen',
            'selling_price' => 12.50,
            'barcode' => '123456789'
        ]);
    }
}
