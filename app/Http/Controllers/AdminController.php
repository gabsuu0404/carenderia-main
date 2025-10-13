<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class AdminController extends Controller
{
    /**
     * Display the admin dashboard.
     */
    public function dashboard(): Response
    {
        $userCounts = [
            'total' => User::count(),
            'admins' => User::where('role', User::ROLE_ADMIN)->count(),
            'employees' => User::where('role', User::ROLE_EMPLOYEE)->count(),
            'customers' => User::where('role', User::ROLE_CUSTOMER)->count(),
        ];

        return Inertia::render('Admin/Dashboard', [
            'userCounts' => $userCounts,
        ]);
    }

    /**
     * Display all users for admin management.
     */
    public function users(): Response
    {
        return Inertia::render('Admin/Users', [
            'users' => $this->getUsersData(),
            'success' => session('success'),
            'error' => session('error'),
        ]);
    }

    /**
     * Block a user.
     */
    public function blockUser(Request $request, User $user): RedirectResponse
    {
        // Prevent blocking other admins
        if ($user->isAdmin()) {
            return redirect()->back()->with('error', 'Cannot block other administrators.');
        }

        $user->block();

        return redirect()->back()->with('success', 'User has been blocked successfully.');
    }

    /**
     * Unblock a user.
     */
    public function unblockUser(Request $request, User $user): RedirectResponse
    {
        $user->unblock();

        return redirect()->back()->with('success', 'User has been unblocked successfully.');
    }

    /**
     * Show the form for editing a user.
     */
    public function editUser(User $user): Response
    {
        return Inertia::render('Admin/Users', [
            'users' => $this->getUsersData(),
            'editingUser' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
                'status' => $user->status,
            ],
            'success' => session('success'),
            'error' => session('error'),
        ]);
    }

    /**
     * Update a user.
     */
    public function updateUser(Request $request, User $user): RedirectResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,' . $user->id,
            'role' => 'required|string|in:' . User::ROLE_ADMIN . ',' . User::ROLE_EMPLOYEE . ',' . User::ROLE_CUSTOMER,
            'status' => 'required|string|in:' . User::STATUS_ACTIVE . ',' . User::STATUS_BLOCKED,
        ]);

        // Prevent changing role of other admins
        if ($user->isAdmin() && $request->role !== User::ROLE_ADMIN) {
            return redirect()->back()->with('error', 'Cannot change role of other administrators.');
        }

        $user->update([
            'name' => $request->name,
            'email' => $request->email,
            'role' => $request->role,
            'status' => $request->status,
        ]);

        return redirect()->back()->with('success', 'User has been updated successfully.');
    }

    /**
     * Get users data for the view.
     */
    private function getUsersData()
    {
        return User::select('id', 'name', 'email', 'role', 'status', 'created_at')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($user) {
                return [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'role' => $user->role,
                    'status' => $user->status,
                    'created_at' => $user->created_at->format('Y-m-d'),
                ];
            });
    }
}
