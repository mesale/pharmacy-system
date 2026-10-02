<?php

namespace App\Http\Controllers;

use App\Models\CashReconciliation;
use App\Models\Sale;
use Carbon\Carbon;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class CashReconciliationController extends Controller
{
    public function create(Request $request)
    {
        $user = $request->user();
        [$shiftStartTime, $startIsExclusive] = $this->shiftStartFor($user->id);

        return Inertia::render('Reconciliation/Create', [
            'shiftStartTime' => $shiftStartTime->toIso8601String(),
            'expectedCash' => $this->expectedCashFor($user->id, $shiftStartTime, $startIsExclusive),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'actual_counted_cash' => 'required|numeric|min:0',
            'notes' => 'nullable|string',
        ]);

        $user = $request->user();

        return DB::transaction(function () use ($validated, $user) {
            // The shift window is derived on the server. It is never accepted from
            // the request: a worker could otherwise pick a start time that hides a
            // cash shortage.
            [$shiftStartTime, $startIsExclusive] = $this->shiftStartFor($user->id, lock: true);
            $expectedCash = $this->expectedCashFor($user->id, $shiftStartTime, $startIsExclusive);

            $actualCash = round((float) $validated['actual_counted_cash'], 2);
            $difference = round($actualCash - $expectedCash, 2);

            $status = match (true) {
                $difference < 0 => 'short',
                $difference > 0 => 'over',
                default => 'balanced',
            };

            // A till that does not balance demands an explanation, so the auditor
            // is not left staring at a bare shortage.
            if ($status !== 'balanced' && (($validated['notes'] ?? '') === '')) {
                throw ValidationException::withMessages([
                    'notes' => 'A reason is required when the till is short or over.',
                ]);
            }

            CashReconciliation::create([
                'worker_id' => $user->id,
                'shift_start_time' => $shiftStartTime,
                'shift_end_time' => Carbon::now(),
                'expected_cash' => $expectedCash,
                'actual_counted_cash' => $actualCash,
                'difference' => $difference,
                'status' => $status,
                'notes' => $validated['notes'] ?? null,
            ]);

            return redirect()->route('dashboard')
                ->with('message', 'Shift successfully closed and reconciled.');
        });
    }

    /**
     * Start of the worker's open shift, with whether that boundary is exclusive.
     *
     * When a prior reconciliation exists the window opens strictly after its
     * end time, so a sale recorded on the exact boundary second is not counted
     * in both the shift that just closed and this one. The very first shift has
     * no prior boundary, so it opens inclusively on the first sale (or today) to
     * avoid dropping the opening sale.
     *
     * @return array{0: Carbon, 1: bool} [start, startIsExclusive]
     */
    private function shiftStartFor(int $workerId, bool $lock = false): array
    {
        $query = CashReconciliation::where('worker_id', $workerId)
            ->orderByDesc('shift_end_time');

        if ($lock) {
            $query->lockForUpdate();
        }

        $last = $query->first();

        if ($last) {
            return [$last->shift_end_time, true];
        }

        // No prior reconciliation: cover everything they have ever sold so that
        // sales made before today are not silently dropped from the count.
        $firstSale = Sale::where('worker_id', $workerId)->min('created_at');

        return [$firstSale ? Carbon::parse($firstSale) : Carbon::today(), false];
    }

    private function expectedCashFor(int $workerId, Carbon $shiftStartTime, bool $startIsExclusive = false): float
    {
        return round((float) Sale::where('worker_id', $workerId)
            ->where('payment_method', 'cash')
            ->where('created_at', $startIsExclusive ? '>' : '>=', $shiftStartTime)
            ->sum('total_amount'), 2);
    }
}
