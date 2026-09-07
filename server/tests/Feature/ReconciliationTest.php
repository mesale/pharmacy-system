<?php

namespace Tests\Feature;

use App\Models\Sale;
use App\Models\User;
use App\Models\CashReconciliation;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;
use Tests\TestCase;
use Carbon\Carbon;

class ReconciliationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        
        Role::firstOrCreate(['name' => 'admin']);
        Role::firstOrCreate(['name' => 'worker']);
    }

    public function test_worker_can_view_expected_cash()
    {
        $worker = User::factory()->create();
        $worker->assignRole('worker');

        // Create a cash sale for this worker
        \Illuminate\Support\Facades\DB::table('sales')->insert([
            'worker_id' => $worker->id,
            'total_amount' => 150,
            'total_cost' => 100,
            'profit' => 50,
            'payment_method' => 'cash',
            'created_at' => Carbon::now(),
            'updated_at' => Carbon::now(),
        ]);

        $response = $this->actingAs($worker)->get(route('reconciliation.create'));

        $response->assertStatus(200);
        $this->assertEquals(150, $response->viewData('page')['props']['expectedCash']);
    }

    public function test_worker_can_submit_balanced_reconciliation()
    {
        $worker = User::factory()->create();
        $worker->assignRole('worker');

        \Illuminate\Support\Facades\DB::table('sales')->insert([
            'worker_id' => $worker->id,
            'total_amount' => 100,
            'total_cost' => 50,
            'profit' => 50,
            'payment_method' => 'cash',
            'created_at' => Carbon::now(),
            'updated_at' => Carbon::now(),
        ]);

        $response = $this->actingAs($worker)->post(route('reconciliation.store'), [
            'actual_counted_cash' => 100,
            'notes' => null,
        ]);

        $response->assertRedirect(route('dashboard'));

        $this->assertDatabaseHas('cash_reconciliations', [
            'worker_id' => $worker->id,
            'expected_cash' => 100,
            'actual_counted_cash' => 100,
            'difference' => 0,
            'status' => 'balanced',
        ]);
    }

    public function test_a_short_till_is_recorded_as_short()
    {
        $worker = User::factory()->create();
        $worker->assignRole('worker');

        \Illuminate\Support\Facades\DB::table('sales')->insert([
            'worker_id' => $worker->id,
            'total_amount' => 100,
            'total_cost' => 50,
            'profit' => 50,
            'payment_method' => 'cash',
            'created_at' => Carbon::now(),
            'updated_at' => Carbon::now(),
        ]);

        $response = $this->actingAs($worker)->post(route('reconciliation.store'), [
            'actual_counted_cash' => 90,
            'notes' => 'Dropped a 10 birr note',
        ]);

        $response->assertRedirect(route('dashboard'));

        $this->assertDatabaseHas('cash_reconciliations', [
            'worker_id' => $worker->id,
            'status' => 'short',
            'difference' => -10,
        ]);
    }

    /**
     * The shift window is derived on the server, so a worker cannot post a start
     * time that excludes sales they have already rung up.
     */
    public function test_shift_start_time_cannot_be_supplied_by_the_client()
    {
        $worker = User::factory()->create();
        $worker->assignRole('worker');

        \Illuminate\Support\Facades\DB::table('sales')->insert([
            'worker_id' => $worker->id,
            'total_amount' => 500,
            'total_cost' => 200,
            'profit' => 300,
            'payment_method' => 'cash',
            'created_at' => Carbon::now(),
            'updated_at' => Carbon::now(),
        ]);

        $this->actingAs($worker)->post(route('reconciliation.store'), [
            // An attempt to start the shift "now" and hide the 500 already taken.
            'shift_start_time' => Carbon::now()->addHour()->toIso8601String(),
            'actual_counted_cash' => 0,
            'notes' => 'nothing in the till',
        ])->assertRedirect(route('dashboard'));

        // Expected cash still reflects the real sale, so the shortage is visible.
        $this->assertDatabaseHas('cash_reconciliations', [
            'worker_id' => $worker->id,
            'expected_cash' => 500,
            'actual_counted_cash' => 0,
            'difference' => -500,
            'status' => 'short',
        ]);
    }

    /**
     * A second closing covers only what was sold after the first one.
     */
    public function test_consecutive_shifts_do_not_double_count_cash()
    {
        $worker = User::factory()->create();
        $worker->assignRole('worker');

        \Illuminate\Support\Facades\DB::table('sales')->insert([
            'worker_id' => $worker->id,
            'total_amount' => 100,
            'total_cost' => 50,
            'profit' => 50,
            'payment_method' => 'cash',
            'created_at' => Carbon::now(),
            'updated_at' => Carbon::now(),
        ]);

        $this->actingAs($worker)->post(route('reconciliation.store'), [
            'actual_counted_cash' => 100,
        ])->assertRedirect(route('dashboard'));

        // No further sales, so the next shift expects an empty till.
        $this->actingAs($worker)->post(route('reconciliation.store'), [
            'actual_counted_cash' => 0,
        ])->assertRedirect(route('dashboard'));

        $this->assertDatabaseCount('cash_reconciliations', 2);
        $this->assertDatabaseHas('cash_reconciliations', [
            'worker_id' => $worker->id,
            'expected_cash' => 0,
            'actual_counted_cash' => 0,
            'status' => 'balanced',
        ]);
    }
}

