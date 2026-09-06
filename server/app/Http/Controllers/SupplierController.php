<?php

namespace App\Http\Controllers;

use App\Models\Supplier;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SupplierController extends Controller
{
    public function index()
    {
        return Inertia::render('Suppliers/Index', [
            'suppliers' => Supplier::withCount('stockBatches')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'    => 'required|string',
            'phone'   => 'nullable|string',
            'email'   => 'nullable|email',
            'address' => 'nullable|string',
        ]);

        Supplier::create($validated);

        return redirect()->back();
    }

    public function update(Request $request, Supplier $supplier)
    {
        $validated = $request->validate([
            'name'    => 'required|string',
            'phone'   => 'nullable|string',
            'email'   => 'nullable|email',
            'address' => 'nullable|string',
        ]);

        $supplier->update($validated);

        return redirect()->back();
    }

    public function destroy(Supplier $supplier)
    {
        $supplier->delete();

        return redirect()->back();
    }
}
