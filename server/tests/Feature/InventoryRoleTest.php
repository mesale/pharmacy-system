<?php

namespace Tests\Feature;

use App\Models\User;
use App\Models\Product;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class InventoryRoleTest extends TestCase
{
    use RefreshDatabase;

    public function test_worker_can_view_products()
    {
        $this->seed(\Database\Seeders\RolesAndPermissionsSeeder::class);
        $worker = User::factory()->create();
        $worker->assignRole('worker');

        Product::create([
            'name' => 'Paracetamol',
            'selling_price' => 5.00
        ]);

        $response = $this->actingAs($worker)->get('/products');
        $response->assertStatus(200);
    }

    public function test_worker_cannot_create_products()
    {
        $this->seed(\Database\Seeders\RolesAndPermissionsSeeder::class);
        $worker = User::factory()->create();
        $worker->assignRole('worker');

        $response = $this->actingAs($worker)->post('/products', [
            'name' => 'Ibuprofen',
            'selling_price' => 10.00
        ]);
        
        $response->assertStatus(403);
    }
}
