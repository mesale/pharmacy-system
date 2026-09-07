<?php

namespace Tests\Feature;

use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;
use Tests\TestCase;

class UserManagementTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        
        // Ensure roles exist
        Role::firstOrCreate(['name' => 'admin']);
        Role::firstOrCreate(['name' => 'worker']);
    }

    public function test_admin_can_view_users_page()
    {
        $admin = User::factory()->create();
        $admin->assignRole('admin');

        $response = $this->actingAs($admin)->get(route('users.index'));

        $response->assertStatus(200);
    }

    public function test_worker_cannot_view_users_page()
    {
        $worker = User::factory()->create();
        $worker->assignRole('worker');

        $response = $this->actingAs($worker)->get(route('users.index'));

        $response->assertStatus(403);
    }

    public function test_admin_can_create_new_worker()
    {
        $admin = User::factory()->create();
        $admin->assignRole('admin');

        $response = $this->actingAs($admin)->post(route('users.store'), [
            'name' => 'New Worker',
            'email' => 'worker@pharmacy.test',
            'password' => 'password',
            'password_confirmation' => 'password',
            'role' => 'worker',
        ]);

        $response->assertSessionHasNoErrors();
        $response->assertRedirect();

        $this->assertDatabaseHas('users', [
            'email' => 'worker@pharmacy.test',
        ]);

        $newUser = User::where('email', 'worker@pharmacy.test')->first();
        $this->assertTrue($newUser->hasRole('worker'));
    }

    public function test_admin_can_update_user_role()
    {
        $admin = User::factory()->create();
        $admin->assignRole('admin');

        $user = User::factory()->create();
        $user->assignRole('worker');

        $response = $this->actingAs($admin)->patch(route('users.update', $user), [
            'name' => 'Updated Name',
            'email' => 'updated@pharmacy.test',
            'role' => 'admin',
        ]);

        $response->assertSessionHasNoErrors();
        $response->assertRedirect();

        $this->assertDatabaseHas('users', [
            'id' => $user->id,
            'name' => 'Updated Name',
            'email' => 'updated@pharmacy.test',
        ]);

        $user->refresh();
        $this->assertTrue($user->hasRole('admin'));
        $this->assertFalse($user->hasRole('worker'));
    }

    public function test_admin_cannot_delete_themselves()
    {
        $admin = User::factory()->create();
        $admin->assignRole('admin');

        $response = $this->actingAs($admin)->delete(route('users.destroy', $admin));

        $response->assertSessionHasErrors(['error']);
        
        $this->assertDatabaseHas('users', [
            'id' => $admin->id,
        ]);
    }
}
