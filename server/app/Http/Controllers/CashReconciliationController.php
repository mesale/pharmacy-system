<?php

namespace App\Http\Controllers;

use App\Models\CashReconciliation;
use App\Models\Sale;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Carbon\Carbon;

class CashReconciliationController extends Controller
{
    public function create(Request $request)
    {
        $user = $request->user();

        // Get the last reconciliation for this worker
        $lastReconciliation = CashReconciliation::where('worker_id', $user->id)
            ->orderBy('shift_end_time', 'desc')
            ->first();

        $shiftStartTime = $lastReconciliation ? $lastReconciliation->shift_end_time : Carbon::today();

        // Calculate expected cash: all cash sales since the shift started
        $expectedCash = Sale::where('worker_id', $user->id)
            ->where('payment_method', 'cash')
            ->where('created_at', '>=', $shiftStartTime)
            ->sum('total_amount');

        return Inertia::render('Reconciliation/Create', [
            'shiftStartTime' => $shiftStartTime->toIso8601String(),
            'expectedCash' => $expectedCash,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'actual_counted_cash' => 'required|numeric|min:0',
            'shift_start_time' => 'required|date',
            'notes' => 'nullable|string'
        ]);

        $user = $request->user();
        $shiftStartTime = Carbon::parse($request->shift_start_time);
        
        $expectedCash = Sale::where('worker_id', $user->id)
            ->where('payment_method', 'cash')
            ->where('created_at', '>=', $shiftStartTime)
            ->sum('total_amount');

        $actualCash = (float) $request->actual_counted_cash;
        $difference = $actualCash - $expectedCash;

        $status = 'balanced';
        if ($difference < 0) {
            $status = 'short';
        } elseif ($difference > 0) {
            $status = 'over';
        }

        CashReconciliation::create([
            'worker_id' => $user->id,
            'shift_start_time' => $shiftStartTime,
            'shift_end_time' => Carbon::now(),
            'expected_cash' => $expectedCash,
            'actual_counted_cash' => $actualCash,
            'difference' => $difference,
            'status' => $status,
            'notes' => $request->notes,
        ]);

        return redirect()->route('dashboard')->with('message', 'Shift successfully closed and reconciled.');
    }
}
