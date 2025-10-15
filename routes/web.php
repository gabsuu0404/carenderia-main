<?php

use App\Http\Controllers\AdminController;
use App\Http\Controllers\EmployeeController;
use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
|
| Here is where you can register web routes for your application. These
| routes are loaded by the RouteServiceProvider within a group which
| contains the "web" middleware group. Now create something great!
|
*/

Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

Route::get('/dashboard', function () {
    return Inertia::render('Dashboard');
})->middleware(['auth', 'verified', 'user.status'])->name('dashboard');

Route::middleware(['auth', 'user.status'])->group(function () {
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
    
    // Order page
    Route::get('/order', function () {
        return Inertia::render('Order');
    })->name('order');
});

// Admin area (example protected route)
Route::middleware(['auth', 'user.status', 'role:admin'])->group(function () {
    Route::get('/admin', [AdminController::class, 'dashboard'])->name('admin.dashboard');
    Route::get('/admin/users', [AdminController::class, 'users'])->name('admin.users');
    Route::get('/admin/users/{user}/edit', [AdminController::class, 'editUser'])->name('admin.users.edit');
    Route::put('/admin/users/{user}', [AdminController::class, 'updateUser'])->name('admin.users.update');
    Route::post('/admin/users/{user}/block', [AdminController::class, 'blockUser'])->name('admin.users.block');
    Route::post('/admin/users/{user}/unblock', [AdminController::class, 'unblockUser'])->name('admin.users.unblock');
});

// Employee area (read-only access)
Route::middleware(['auth', 'user.status', 'role:employee'])->group(function () {
    Route::get('/employee', [EmployeeController::class, 'dashboard'])->name('employee.dashboard');
    Route::get('/employee/users', [EmployeeController::class, 'users'])->name('employee.users');
    
    // Meal management routes
    Route::get('/employee/meals', [EmployeeController::class, 'meals'])->name('employee.meals');
    Route::post('/employee/meals', [EmployeeController::class, 'storeMeal'])->name('employee.meals.store');
    Route::put('/employee/meals/{meal}', [EmployeeController::class, 'updateMeal'])->name('employee.meals.update');
    Route::post('/employee/meals/{meal}/hide', [EmployeeController::class, 'hideMeal'])->name('employee.meals.hide');
    Route::post('/employee/meals/{meal}/unhide', [EmployeeController::class, 'unhideMeal'])->name('employee.meals.unhide');
    
    // Raw materials management routes
    Route::get('/employee/raw-materials', [EmployeeController::class, 'rawMaterials'])->name('employee.raw-materials');
    Route::post('/employee/raw-materials', [EmployeeController::class, 'storeRawMaterial'])->name('employee.raw-materials.store');
    Route::put('/employee/raw-materials/{rawMaterial}', [EmployeeController::class, 'updateRawMaterial'])->name('employee.raw-materials.update');
    Route::post('/employee/raw-materials/{rawMaterial}/hide', [EmployeeController::class, 'hideRawMaterial'])->name('employee.raw-materials.hide');
    Route::post('/employee/raw-materials/{rawMaterial}/unhide', [EmployeeController::class, 'unhideRawMaterial'])->name('employee.raw-materials.unhide');

    // Inventory management
    Route::get('/employee/inventory', [EmployeeController::class, 'inventory'])->name('employee.inventory');
    Route::post('/employee/inventory', [EmployeeController::class, 'storeInventory'])->name('employee.inventory.store');
    Route::put('/employee/inventory/{item}', [EmployeeController::class, 'updateInventory'])->name('employee.inventory.update');
});

require __DIR__.'/auth.php';


