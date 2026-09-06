<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;
use App\Models\User;
use Illuminate\Support\Facades\Hash;

class RolesAndPermissionsSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Reset cached roles and permissions
        app()[\Spatie\Permission\PermissionRegistrar::class]->forgetCachedPermissions();

        // create permissions
        Permission::firstOrCreate(['name' => 'manage users']);
        Permission::firstOrCreate(['name' => 'view cost price']);
        Permission::firstOrCreate(['name' => 'view profit reports']);
        Permission::firstOrCreate(['name' => 'manage inventory']);
        Permission::firstOrCreate(['name' => 'process sales']);

        // create roles and assign created permissions
        $workerRole = Role::firstOrCreate(['name' => 'worker']);
        $workerRole->givePermissionTo(['process sales']);

        $adminRole = Role::firstOrCreate(['name' => 'admin']);
        $adminRole->givePermissionTo(Permission::all());

        // create demo users
        $admin = User::firstOrCreate([
            'email' => 'admin@pharmacy.test',
        ], [
            'name' => 'Admin User',
            'password' => Hash::make('password'),
        ]);
        $admin->assignRole($adminRole);

        $worker = User::firstOrCreate([
            'email' => 'worker@pharmacy.test',
        ], [
            'name' => 'Worker User',
            'password' => Hash::make('password'),
        ]);
        $worker->assignRole($workerRole);
    }
}
