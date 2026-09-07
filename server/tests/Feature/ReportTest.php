<?php

namespace Tests\Feature;

use App\Models\Sale;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;
use Tests\TestCase;
use Carbon\Carbon;

class ReportTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        
        Role::firstOrCreate(['name' => 'admin']);
        Role::firstOrCreate(['name' => 'worker']);
    }

    public function test_admin_can_view_reports()
    {
        $admin = User::factory()->create();
        $admin->assignRole('admin');

        $response = $this->actingAs($admin)->get(route('reports.index'));

        $response->assertStatus(200);
    }

    public function test_worker_cannot_view_reports()
    {
        $worker = User::factory()->create();
        $worker->assignRole('worker');

        $response = $this->actingAs($worker)->get(route('reports.index'));

        $response->assertStatus(403);
    }

    public function test_reports_aggregate_sales_data_correctly()
    {
        $admin = User::factory()->create();
        $admin->assignRole('admin');

        // Insert manually to bypass Eloquent timestamp override
        \Illuminate\Support\Facades\DB::table('sales')->insert([
            [
                'worker_id' => $admin->id,
                'total_amount' => 100,
                'total_cost' => 60,
                'profit' => 40,
                'payment_method' => 'cash',
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ],
            [
                'worker_id' => $admin->id,
                'total_amount' => 50,
                'total_cost' => 20,
                'profit' => 30,
                'payment_method' => 'card',
                'created_at' => Carbon::now(),
                'updated_at' => Carbon::now(),
            ],
            [
                'worker_id' => $admin->id,
                'total_amount' => 200,
                'total_cost' => 100,
                'profit' => 100,
                'payment_method' => 'cash',
                'created_at' => Carbon::now()->subDay(),
                'updated_at' => Carbon::now()->subDay(),
            ]
        ]);

        $response = $this->actingAs($admin)->get(route('reports.index', [
            'start_date' => Carbon::now()->subDays(2)->toDateString(),
            'end_date' => Carbon::now()->toDateString(),
        ]));

        $response->assertStatus(200);
        
        $props = $response->viewData('page')['props'];
        $summary = $props['summary'];
        $dailyData = $props['dailyData'];

        // Total should be 350
        $this->assertEquals(350, $summary['total_revenue']);
        $this->assertEquals(180, $summary['total_cogs']);
        $this->assertEquals(170, $summary['total_profit']);

        // Should be grouped into 2 days
        $this->assertCount(2, $dailyData);
    }
}
