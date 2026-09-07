<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Illuminate\Validation\Rules;
use Illuminate\Validation\ValidationException;
use Inertia\Inertia;

class UserController extends Controller
{
    public function index()
    {
        return Inertia::render('Users/Index', [
            'users' => User::with('roles')->withCount('sales')->orderBy('name')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
            'role' => 'required|string|in:admin,worker',
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
        ]);

        $user->assignRole($validated['role']);

        return redirect()->back()->with('success', 'User created successfully.');
    }

    public function update(Request $request, User $user)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique('users')->ignore($user)],
            'role' => 'required|string|in:admin,worker',
            'password' => ['nullable', 'confirmed', Rules\Password::defaults()],
        ]);

        // Demoting the last admin would leave nobody able to administer the system.
        if ($validated['role'] !== 'admin') {
            $this->guardLastAdmin($user, 'role');
        }

        $user->update([
            'name' => $validated['name'],
            'email' => $validated['email'],
        ]);

        if (! empty($validated['password'])) {
            $user->update(['password' => Hash::make($validated['password'])]);
        }

        $user->syncRoles([$validated['role']]);

        return redirect()->back()->with('success', 'User updated successfully.');
    }

    public function destroy(Request $request, User $user)
    {
        if ($request->user()->id === $user->id) {
            throw ValidationException::withMessages([
                'user' => 'You cannot delete yourself.',
            ]);
        }

        $this->guardLastAdmin($user, 'user');

        // Sales reference their worker for accountability, so a user who has rung
        // up sales can never be removed without destroying that trail.
        if ($user->sales()->exists()) {
            throw ValidationException::withMessages([
                'user' => 'This user has recorded sales and cannot be deleted, '
                    . 'because their sales history must stay attributable.',
            ]);
        }

        $user->delete();

        return redirect()->back()->with('success', 'User deleted successfully.');
    }

    /**
     * Refuse to remove admin rights from the only remaining admin.
     */
    private function guardLastAdmin(User $user, string $field): void
    {
        if (! $user->hasRole('admin')) {
            return;
        }

        $otherAdmins = User::role('admin')->whereKeyNot($user->getKey())->count();

        if ($otherAdmins === 0) {
            throw ValidationException::withMessages([
                $field => 'This is the only administrator. Promote another user to '
                    . 'admin first, otherwise nobody could administer the system.',
            ]);
        }
    }
}
