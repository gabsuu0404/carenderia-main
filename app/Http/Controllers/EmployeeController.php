<?php

namespace App\Http\Controllers;

use App\Models\Meal;
use App\Models\RawMaterial;
use App\Models\Inventory;
use App\Models\User;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
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
        // Log the received request data
        \Log::info('Creating new meal', [
            'request_data' => $request->all(),
            'has_file' => $request->hasFile('image')
        ]);
        
        // Make validation less strict - if name or price are empty strings, convert them to defaults
        if ($request->has('name') && empty($request->name)) {
            $request->merge(['name' => 'Untitled Meal']);
        }
        
        if ($request->has('price') && (empty($request->price) || !is_numeric($request->price))) {
            $request->merge(['price' => 0]);
        }
        
        // Validate the request - outside try/catch for proper validation errors
        $validated = $request->validate([
            'name' => 'string|max:255',
            'description' => 'nullable|string',
            'price' => 'numeric|min:0',
            'category' => 'nullable|string|max:255',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'is_available' => 'boolean',
        ]);
        
        try {
            // Process the data
            $mealData = $request->except('image');
            
            // Handle image upload
            if ($request->hasFile('image')) {
                $imagePath = $request->file('image')->store('meals', 'public');
                $mealData['image'] = $imagePath;
                
                \Log::info('Image uploaded successfully', ['path' => $imagePath]);
            }
            
            // Create the meal
            $meal = Meal::create($mealData);
            
            \Log::info('Meal created successfully', ['meal_id' => $meal->id]);
            
            return redirect()->route('employee.meals')->with('success', 'Meal created successfully.');
        } catch (\Exception $e) {
            \Log::error('Error creating meal', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return redirect()->back()->withErrors(['error' => 'Failed to create meal: ' . $e->getMessage()]);
        }
    }

    /**
     * Update the specified meal.
     */
    public function updateMeal(Request $request, Meal $meal): RedirectResponse
    {
        \Log::info('========== STARTING MEAL UPDATE ==========');
        \Log::info('Initial request data:', [
            'meal_id' => $meal->id,
            'has_file' => $request->hasFile('image'),
            'has_update_flag' => $request->has('update_image'),
            'keep_existing' => $request->has('keep_existing_image'),
            'content_type' => $request->header('Content-Type')
        ]);
        
        // Validate the request with relaxed validation
        $validated = $request->validate([
            'name' => 'nullable|string|max:255',
            'description' => 'nullable|string',
            'price' => 'nullable|numeric|min:0',
            'category' => 'nullable|string|max:255',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
            'is_available' => 'boolean',
        ]);
        
        try {
            // Start with the non-file data
            $mealData = $request->except(['image', 'update_image', 'keep_existing_image']);
            
            // Handle image update
            if ($request->hasFile('image') && $request->has('update_image')) {
                \Log::info('Processing new image upload');
                
                $file = $request->file('image');
                if ($file->isValid()) {
                    // Delete old image if it exists
                    if ($meal->image && Storage::disk('public')->exists($meal->image)) {
                        \Log::info('Deleting old image: ' . $meal->image);
                        Storage::disk('public')->delete($meal->image);
                    }
                    
                    // Generate unique filename
                    $filename = time() . '_' . uniqid() . '.' . $file->getClientOriginalExtension();
                    
                    // Store new image
                    $imagePath = $file->storeAs('meals', $filename, 'public');
                    if (!$imagePath) {
                        throw new \Exception('Failed to store the image');
                    }
                    
                    $mealData['image'] = $imagePath;
                    \Log::info('New image saved: ' . $imagePath);
                } else {
                    throw new \Exception('Invalid image file uploaded');
                }
            } elseif (!$request->has('keep_existing_image')) {
                // If neither updating nor keeping existing, remove the image
                if ($meal->image && Storage::disk('public')->exists($meal->image)) {
                    Storage::disk('public')->delete($meal->image);
                }
                $mealData['image'] = null;
            }
            // else keep the existing image (do nothing with image field)
            
            \Log::info('Updating meal data', ['data' => $mealData]);
            
            // Update the meal
            $updated = $meal->update($mealData);
            
            if (!$updated) {
                throw new \Exception('Failed to update meal record');
            }
            
            // Force refresh from database to ensure we have latest data
            $meal->refresh();
            
            \Log::info('Meal updated successfully', [
                'id' => $meal->id,
                'image' => $meal->image,
                'updated_at' => $meal->updated_at
            ]);
            
            // Force explicit route to employee.meals to prevent any redirection issues
            return redirect()
                ->route('employee.meals')
                ->with('success', 'Meal updated successfully.');
            
        } catch (\Exception $e) {
            \Log::error('Failed to update meal', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return redirect()
                ->back()
                ->withInput()
                ->withErrors(['error' => 'Failed to update meal: ' . $e->getMessage()]);
        }
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

    /**
 * Display the Inventory page with all ingredients.
 */
public function inventory()
{
    // Fetch all ingredients from the Inventory model
    $ingredients = \App\Models\Inventory::all();

    // Render the Inventory page and pass the data
    return inertia('Employee/Inventory', [
        'ingredients' => $ingredients,
    ]);
}

/**
 * Store a newly created ingredient in the inventory.
 */
public function storeInventory(Request $request)
{
    // Validate form input fields
    $validated = $request->validate([
        'name' => 'required|string|max:255',
        'quantity' => 'required|numeric|min:0',
        'unit' => 'required|string',
        'pax_capacity' => 'required|integer|min:1',
    ]);

    // Save validated data to the database
    \App\Models\Inventory::create($validated);

    // Redirect back with success message
    return redirect()->back()->with('success', 'Ingredient added successfully!');
}

    /**
     * Update an existing ingredient in the inventory.
     */
    public function updateInventory(Request $request, $id)
{
        // Validate updated data
        $validated = $request->validate([
          'name' => 'required|string|max:255',
          'quantity' => 'required|numeric|min:0',
          'unit' => 'required|string',
          'pax_capacity' => 'required|integer|min:1',
    ]);

     // Find the inventory record or fail if not found
     $inventory = \App\Models\Inventory::findOrFail($id);

     // Update the record with new validated data
     $inventory->update($validated);

    // Redirect back with success message
    return redirect()->back()->with('success', 'Ingredient updated successfully!');
}

    /**
     * Display the orders management page with calendar view.
     */
    public function orders(): Response
    {
        $orders = \App\Models\Order::orderBy('delivery_date')
        ->get()
        ->map(function ($order) {
            // Format the order data, ensuring proper date format
            return [
                'id' => $order->id,
                'user_id' => $order->user_id,
                'customer_name' => $order->customer_name,
                'customer_email' => $order->customer_email,
                'customer_phone' => $order->customer_phone,
                'delivery_address' => $order->delivery_address,
                'delivery_date' => $order->delivery_date->format('Y-m-d'), // Ensure consistent YYYY-MM-DD format
                'delivery_time' => $order->delivery_time,
                'package_id' => $order->package_id,
                'package_name' => $order->package_name,
                'package_price' => $order->package_price,
                'number_of_pax' => $order->number_of_pax,
                'selected_dishes' => $order->selected_dishes,
                'total_amount' => $order->total_amount,
                'status' => $order->status,
                'notes' => $order->notes,
                'payment_method' => $order->payment_method,
                'gcash_number' => $order->gcash_number,
                'gcash_receipt' => $order->gcash_receipt,
                'created_at' => $order->created_at ? $order->created_at->format('Y-m-d H:i:s') : null
            ];
        });
        
        // Log the orders data for debugging
        \Log::info('Orders data sent to Employee Orders page:', [
            'count' => $orders->count(),
            'first_order' => $orders->first(),
        ]);

        return Inertia::render('Employee/Orders', [
            'orders' => $orders
        ]);
    }
    
    /**
     * Get a human-readable error message for file upload error codes
     */
    private function getUploadErrorMessage(int $errorCode): string
    {
        switch ($errorCode) {
            case UPLOAD_ERR_INI_SIZE:
                return 'The uploaded file exceeds the upload_max_filesize directive in php.ini';
            case UPLOAD_ERR_FORM_SIZE:
                return 'The uploaded file exceeds the MAX_FILE_SIZE directive in the HTML form';
            case UPLOAD_ERR_PARTIAL:
                return 'The uploaded file was only partially uploaded';
            case UPLOAD_ERR_NO_FILE:
                return 'No file was uploaded';
            case UPLOAD_ERR_NO_TMP_DIR:
                return 'Missing a temporary folder';
            case UPLOAD_ERR_CANT_WRITE:
                return 'Failed to write file to disk';
            case UPLOAD_ERR_EXTENSION:
                return 'A PHP extension stopped the file upload';
            default:
                return 'Unknown upload error';
        }
    }
}
