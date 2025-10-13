<?php

namespace App\Http\Controllers;

use App\Models\Meal;
use App\Models\RawMaterial;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class EmployeeController extends Controller
{
    /**
     * Display the employee dashboard.
     */
    public function dashboard(): Response
    {
        $userCounts = [
            'total' => User::count(),
            'admins' => User::where('role', User::ROLE_ADMIN)->count(),
            'employees' => User::where('role', User::ROLE_EMPLOYEE)->count(),
            'customers' => User::where('role', User::ROLE_CUSTOMER)->count(),
        ];

        $mealCounts = [
            'total' => Meal::count(),
            'visible' => Meal::visible()->count(),
            'hidden' => Meal::hidden()->count(),
            'available' => Meal::visible()->where('is_available', true)->count(),
        ];

        $rawMaterialCounts = [
            'total' => RawMaterial::count(),
            'visible' => RawMaterial::visible()->count(),
            'hidden' => RawMaterial::hidden()->count(),
            'available' => RawMaterial::visible()->where('is_available', true)->count(),
        ];

        return Inertia::render('Employee/Dashboard', [
            'userCounts' => $userCounts,
            'mealCounts' => $mealCounts,
            'rawMaterialCounts' => $rawMaterialCounts,
        ]);
    }

    /**
     * Display all users for employee viewing (read-only).
     */
    public function users(): Response
    {
        $users = User::select('id', 'name', 'email', 'role', 'status', 'created_at')
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

        return Inertia::render('Employee/Users', [
            'users' => $users,
        ]);
    }

    /**
     * Display all meals for employee management.
     */
    public function meals(): Response
    {
        $visibleMeals = Meal::visible()->orderBy('created_at', 'desc')->get();
        $hiddenMeals = Meal::hidden()->orderBy('created_at', 'desc')->get();

        return Inertia::render('Employee/Meals', [
            'meals' => $visibleMeals,
            'hiddenMeals' => $hiddenMeals,
            'success' => session('success'),
            'error' => session('error'),
        ]);
    }

    /**
     * Store a newly created meal.
     */
    public function storeMeal(Request $request): RedirectResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'category' => 'nullable|string|max:255',
            'is_available' => 'boolean',
        ]);

        Meal::create($request->all());

        return redirect()->route('employee.meals')->with('success', 'Meal created successfully.');
    }

    /**
     * Update the specified meal.
     */
    public function updateMeal(Request $request, Meal $meal): RedirectResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'price' => 'required|numeric|min:0',
            'category' => 'nullable|string|max:255',
            'is_available' => 'boolean',
        ]);

        $meal->update($request->all());

        return redirect()->route('employee.meals')->with('success', 'Meal updated successfully.');
    }

    /**
     * Hide the specified meal.
     */
    public function hideMeal(Meal $meal): RedirectResponse
    {
        $meal->hide();

        return redirect()->route('employee.meals')->with('success', 'Meal hidden successfully.');
    }

    /**
     * Unhide the specified meal.
     */
    public function unhideMeal(Meal $meal): RedirectResponse
    {
        $meal->unhide();

        return redirect()->route('employee.meals')->with('success', 'Meal unhidden successfully.');
    }

    /**
     * Display all raw materials for employee management.
     */
    public function rawMaterials(): Response
    {
        $visibleMaterials = RawMaterial::visible()
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($m) {
                return [
                    'id' => $m->id,
                    'name' => $m->name,
                    'description' => $m->description,
                    'category' => $m->category,
                    'unit' => $m->unit,
                    'unit_price' => $m->unit_price,
                    'total_value' => $m->total_value,
                    'is_available' => $m->is_available,
                    'is_hidden' => $m->is_hidden,
                ];
            });

        $hiddenMaterials = RawMaterial::hidden()
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($m) {
                return [
                    'id' => $m->id,
                    'name' => $m->name,
                    'description' => $m->description,
                    'category' => $m->category,
                    'unit' => $m->unit,
                    'unit_price' => $m->unit_price,
                    'total_value' => $m->total_value,
                    'is_available' => $m->is_available,
                    'is_hidden' => $m->is_hidden,
                ];
            });

        return Inertia::render('Employee/RawMaterials', [
            'materials' => $visibleMaterials,
            'hiddenMaterials' => $hiddenMaterials,
            'success' => session('success'),
            'error' => session('error'),
        ]);
    }

    /**
     * Store a newly created raw material.
     */
    public function storeRawMaterial(Request $request): RedirectResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'category' => 'required|string|max:255',
            'unit' => 'required|string|max:255',
            'unit_price' => 'required|numeric|min:0',
            'is_available' => 'boolean',
        ]);

        $material = RawMaterial::create($request->all());
        $material->calculateTotalValue();

        return redirect()->route('employee.raw-materials')->with('success', 'Raw material created successfully.');
    }

    /**
     * Update the specified raw material.
     */
    public function updateRawMaterial(Request $request, RawMaterial $rawMaterial): RedirectResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'category' => 'required|string|max:255',
            'unit' => 'required|string|max:255',
            'unit_price' => 'required|numeric|min:0',
            'is_available' => 'boolean',
        ]);

        $rawMaterial->update($request->all());
        $rawMaterial->calculateTotalValue();

        return redirect()->route('employee.raw-materials')->with('success', 'Raw material updated successfully.');
    }

    /**
     * Hide the specified raw material.
     */
    public function hideRawMaterial(RawMaterial $rawMaterial): RedirectResponse
    {
        $rawMaterial->hide();

        return redirect()->route('employee.raw-materials')->with('success', 'Raw material hidden successfully.');
    }

    /**
     * Unhide the specified raw material.
     */
    public function unhideRawMaterial(RawMaterial $rawMaterial): RedirectResponse
    {
        $rawMaterial->unhide();

        return redirect()->route('employee.raw-materials')->with('success', 'Raw material unhidden successfully.');
    }
}
