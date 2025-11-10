<?php

namespace App\Http\Controllers;

use App\Models\Meal;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class OrderController extends Controller
{
    /**
     * Display the order page.
     *
     * @return \Inertia\Response
     */
    public function index()
    {
        // Fetch visible meals from the database (both available and unavailable)
        // Get all visible meals (not hidden), regardless of availability status
        $meals = \App\Models\Meal::where('is_hidden', false)
                    ->orderBy('name')
                    ->get()
                    ->map(function ($meal) {
                        return [
                            'id' => $meal->id,
                            'name' => $meal->name,
                            'description' => $meal->description,
                            'price' => $meal->price,
                            'category' => $meal->category,
                            'image' => $meal->image ?: '/images/dishes/default.jpg', // Default image if none provided
                            'is_available' => $meal->is_available,
                        ];
                    });

        return Inertia::render('Order', [
            'dbMeals' => $meals
        ]);
    }

    /**
     * Update the status of an order.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\JsonResponse
     */
    public function updateStatus(Request $request, $id)
    {
        $request->validate([
            'status' => 'required|string|in:pending,confirmed,completed,cancelled',
        ]);

        $order = Order::findOrFail($id);
        $order->status = $request->input('status');
        $order->save();

        return response()->json([
            'success' => true,
            'order' => $order
        ]);
    }
    
    /**
     * Display the user's orders.
     *
     * @return \Inertia\Response
     */
    public function myOrders()
    {
        // Get all orders for the authenticated user
        $orders = Order::where('user_id', Auth::id())
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($order) {
                // Parse JSON strings for dishes and desserts if they are strings
                $selectedDishes = is_string($order->selected_dishes) ? json_decode($order->selected_dishes, true) : $order->selected_dishes;
                $selectedDishes = $selectedDishes ?? [];
                
                $selectedDesserts = is_string($order->selected_desserts) ? json_decode($order->selected_desserts, true) : $order->selected_desserts;
                $selectedDesserts = $selectedDesserts ?? [];
                
                return [
                    'id' => $order->id,
                    'package_name' => $order->package_name,
                    'package_set' => $order->package_set,
                    'main_item' => $order->main_item,
                    'total_amount' => $order->total_amount,
                    'delivery_date' => $order->delivery_date,
                    'delivery_time' => $order->delivery_time,
                    'delivery_address' => $order->delivery_address,
                    'notes' => $order->notes,
                    'selected_dishes' => $selectedDishes,
                    'selected_desserts' => $selectedDesserts,
                    'status' => $order->status,
                    'created_at' => $order->created_at->format('M d, Y H:i'),
                    'can_edit' => $order->status === 'pending',
                ];
            });

        // Get the count of pending orders for the cart badge
        $pendingOrdersCount = $orders->where('status', 'pending')->count();
        
        // Fetch all possible dishes for editing purposes
        // Dedicated Filipino dishes for Food Pax selection
        $foodPaxDishes = [
            ['id' => 101, 'name' => 'Pork Adobo', 'description' => 'Classic Filipino dish with pork cooked in soy sauce, vinegar, and spices'],
            ['id' => 102, 'name' => 'Chicken Tinola', 'description' => 'Ginger-based soup with chicken, green papaya, and chili leaves'],
            ['id' => 103, 'name' => 'Beef Kaldereta', 'description' => 'Rich beef stew with liver spread, bell peppers, and potatoes'],
            ['id' => 104, 'name' => 'Pork Sinigang', 'description' => 'Tamarind-based sour soup with pork and vegetables'],
            ['id' => 105, 'name' => 'Chicken Afritada', 'description' => 'Tomato-based stew with chicken, potatoes, and carrots'],
            ['id' => 106, 'name' => 'Beef Mechado', 'description' => 'Filipino-style beef pot roast with tomato sauce'],
            ['id' => 107, 'name' => 'Pancit Bihon', 'description' => 'Stir-fried rice noodles with meat and vegetables'],
            ['id' => 108, 'name' => 'Lumpiang Shanghai', 'description' => 'Filipino-style spring rolls filled with ground pork'],
            ['id' => 109, 'name' => 'Pork Menudo', 'description' => 'Diced pork stew with potatoes, carrots, and liver spread'],
            ['id' => 110, 'name' => 'Chicken Inasal', 'description' => 'Grilled chicken marinated in vinegar, lime, and spices'],
            ['id' => 111, 'name' => 'Pinakbet', 'description' => 'Mixed vegetables sautéed in shrimp paste'],
            ['id' => 112, 'name' => 'Nilaga', 'description' => 'Clear beef soup with vegetables and potatoes']
        ];
        
        // List of Filipino desserts for fiesta packages
        $filipinoDesserts = [
            ['id' => 1, 'name' => 'Leche Flan', 'description' => 'Creamy caramel custard dessert'],
            ['id' => 2, 'name' => 'Halo-Halo', 'description' => 'Mixed dessert with shaved ice, evaporated milk, and various sweet beans and fruits'],
            ['id' => 3, 'name' => 'Biko', 'description' => 'Sweet rice cake made with glutinous rice and coconut milk'],
            ['id' => 4, 'name' => 'Cassava Cake', 'description' => 'Baked dessert made from grated cassava, coconut milk and condensed milk'],
            ['id' => 5, 'name' => 'Maja Blanca', 'description' => 'Coconut pudding with corn and milk'],
            ['id' => 6, 'name' => 'Bibingka', 'description' => 'Rice cake traditionally cooked in clay pots lined with banana leaves'],
            ['id' => 7, 'name' => 'Ube Halaya', 'description' => 'Purple yam pudding'],
            ['id' => 8, 'name' => 'Turon', 'description' => 'Sweet spring rolls with banana and jackfruit, dusted with sugar']
        ];
        
        // Get meals from the database for single meal options
        $dbMeals = \App\Models\Meal::where('is_hidden', false)
                    ->orderBy('name')
                    ->get()
                    ->map(function ($meal) {
                        return [
                            'id' => $meal->id,
                            'name' => $meal->name,
                            'description' => $meal->description,
                            'price' => $meal->price,
                            'category' => $meal->category,
                            'image' => $meal->image ?: '/images/dishes/default.jpg',
                            'is_available' => $meal->is_available,
                        ];
                    });

        // Dedicated Filipino dishes for Fiesta Package (not from meal management)
        $fiestaDishes = [
            ['id' => 201, 'name' => 'Pork Adobo', 'description' => 'Classic Filipino dish with pork cooked in soy sauce, vinegar, and spices'],
            ['id' => 202, 'name' => 'Chicken Tinola', 'description' => 'Ginger-based soup with chicken, green papaya, and chili leaves'],
            ['id' => 203, 'name' => 'Beef Kaldereta', 'description' => 'Rich beef stew with liver spread, bell peppers, and potatoes'],
            ['id' => 204, 'name' => 'Pork Sinigang', 'description' => 'Tamarind-based sour soup with pork and vegetables'],
            ['id' => 205, 'name' => 'Chicken Afritada', 'description' => 'Tomato-based stew with chicken, potatoes, and carrots'],
            ['id' => 206, 'name' => 'Beef Mechado', 'description' => 'Filipino-style beef pot roast with tomato sauce'],
            ['id' => 207, 'name' => 'Pancit Bihon', 'description' => 'Stir-fried rice noodles with meat and vegetables'],
            ['id' => 208, 'name' => 'Lumpiang Shanghai', 'description' => 'Filipino-style spring rolls filled with ground pork'],
            ['id' => 209, 'name' => 'Pork Menudo', 'description' => 'Diced pork stew with potatoes, carrots, and liver spread'],
            ['id' => 210, 'name' => 'Chicken Inasal', 'description' => 'Grilled chicken marinated in vinegar, lime, and spices'],
            ['id' => 211, 'name' => 'Pinakbet', 'description' => 'Mixed vegetables sautéed in shrimp paste'],
            ['id' => 212, 'name' => 'Nilaga', 'description' => 'Clear beef soup with vegetables and potatoes'],
            ['id' => 213, 'name' => 'Kare-Kare', 'description' => 'Philippine stew with oxtail and vegetables in rich peanut sauce'],
            ['id' => 214, 'name' => 'Lechon Kawali', 'description' => 'Deep-fried crispy pork belly'],
            ['id' => 215, 'name' => 'Bistek Tagalog', 'description' => 'Filipino-style beef steak with citrus and soy sauce']
        ];
        
        return Inertia::render('MyOrders', [
            'orders' => $orders,
            'pendingOrdersCount' => $pendingOrdersCount,
            'foodPaxDishes' => $foodPaxDishes,
            'fiestaDishes' => $fiestaDishes,
            'filipinoDesserts' => $filipinoDesserts,
            'dbMeals' => $dbMeals,
        ]);
    }
    
    /**
     * Show the form for editing a specific order.
     *
     * @param  int  $id
     * @return \Inertia\Response
     */
    public function edit($id)
    {
        // Find the order and make sure it belongs to the authenticated user
        $order = Order::where('id', $id)
            ->where('user_id', Auth::id())
            ->where('status', 'pending') // Only allow editing pending orders
            ->firstOrFail();
            
        // Parse JSON strings if they are strings
        $selectedDishes = is_string($order->selected_dishes) ? json_decode($order->selected_dishes, true) : $order->selected_dishes;
        $selectedDishes = $selectedDishes ?? [];
        
        $selectedDesserts = is_string($order->selected_desserts) ? json_decode($order->selected_desserts, true) : $order->selected_desserts;
        $selectedDesserts = $selectedDesserts ?? [];
        
        $formattedOrder = [
            'id' => $order->id,
            'package_name' => $order->package_name,
            'package_id' => $order->package_id,
            'package_set' => $order->package_set,
            'main_item' => $order->main_item,
            'total_amount' => $order->total_amount,
            'delivery_date' => $order->delivery_date,
            'delivery_time' => $order->delivery_time,
            'delivery_address' => $order->delivery_address,
            'notes' => $order->notes,
            'number_of_pax' => $order->number_of_pax,
            'selected_dishes' => $selectedDishes,
            'selected_desserts' => $selectedDesserts,
            'status' => $order->status,
        ];
        
        // Dedicated Filipino dishes for Food Pax selection
        $foodPaxDishes = [
            ['id' => 101, 'name' => 'Pork Adobo', 'description' => 'Classic Filipino dish with pork cooked in soy sauce, vinegar, and spices'],
            ['id' => 102, 'name' => 'Chicken Tinola', 'description' => 'Ginger-based soup with chicken, green papaya, and chili leaves'],
            ['id' => 103, 'name' => 'Beef Kaldereta', 'description' => 'Rich beef stew with liver spread, bell peppers, and potatoes'],
            ['id' => 104, 'name' => 'Pork Sinigang', 'description' => 'Tamarind-based sour soup with pork and vegetables'],
            ['id' => 105, 'name' => 'Chicken Afritada', 'description' => 'Tomato-based stew with chicken, potatoes, and carrots'],
            ['id' => 106, 'name' => 'Beef Mechado', 'description' => 'Filipino-style beef pot roast with tomato sauce'],
            ['id' => 107, 'name' => 'Pancit Bihon', 'description' => 'Stir-fried rice noodles with meat and vegetables'],
            ['id' => 108, 'name' => 'Lumpiang Shanghai', 'description' => 'Filipino-style spring rolls filled with ground pork'],
            ['id' => 109, 'name' => 'Pork Menudo', 'description' => 'Diced pork stew with potatoes, carrots, and liver spread'],
            ['id' => 110, 'name' => 'Chicken Inasal', 'description' => 'Grilled chicken marinated in vinegar, lime, and spices'],
            ['id' => 111, 'name' => 'Pinakbet', 'description' => 'Mixed vegetables sautéed in shrimp paste'],
            ['id' => 112, 'name' => 'Nilaga', 'description' => 'Clear beef soup with vegetables and potatoes']
        ];
        
        // List of Filipino desserts for fiesta packages
        $filipinoDesserts = [
            ['id' => 1, 'name' => 'Leche Flan', 'description' => 'Creamy caramel custard dessert'],
            ['id' => 2, 'name' => 'Halo-Halo', 'description' => 'Mixed dessert with shaved ice, evaporated milk, and various sweet beans and fruits'],
            ['id' => 3, 'name' => 'Biko', 'description' => 'Sweet rice cake made with glutinous rice and coconut milk'],
            ['id' => 4, 'name' => 'Cassava Cake', 'description' => 'Baked dessert made from grated cassava, coconut milk and condensed milk'],
            ['id' => 5, 'name' => 'Maja Blanca', 'description' => 'Coconut pudding with corn and milk'],
            ['id' => 6, 'name' => 'Bibingka', 'description' => 'Rice cake traditionally cooked in clay pots lined with banana leaves'],
            ['id' => 7, 'name' => 'Ube Halaya', 'description' => 'Purple yam pudding'],
            ['id' => 8, 'name' => 'Turon', 'description' => 'Sweet spring rolls with banana and jackfruit, dusted with sugar']
        ];
        
        // Get meals from the database for single meal options
        $dbMeals = \App\Models\Meal::where('is_hidden', false)
                    ->orderBy('name')
                    ->get()
                    ->map(function ($meal) {
                        return [
                            'id' => $meal->id,
                            'name' => $meal->name,
                            'description' => $meal->description,
                            'price' => $meal->price,
                            'category' => $meal->category,
                            'image' => $meal->image ?: '/images/dishes/default.jpg',
                            'is_available' => $meal->is_available,
                        ];
                    });

        // Dedicated Filipino dishes for Fiesta Package (not from meal management)
        $fiestaDishes = [
            ['id' => 201, 'name' => 'Pork Adobo', 'description' => 'Classic Filipino dish with pork cooked in soy sauce, vinegar, and spices'],
            ['id' => 202, 'name' => 'Chicken Tinola', 'description' => 'Ginger-based soup with chicken, green papaya, and chili leaves'],
            ['id' => 203, 'name' => 'Beef Kaldereta', 'description' => 'Rich beef stew with liver spread, bell peppers, and potatoes'],
            ['id' => 204, 'name' => 'Pork Sinigang', 'description' => 'Tamarind-based sour soup with pork and vegetables'],
            ['id' => 205, 'name' => 'Chicken Afritada', 'description' => 'Tomato-based stew with chicken, potatoes, and carrots'],
            ['id' => 206, 'name' => 'Beef Mechado', 'description' => 'Filipino-style beef pot roast with tomato sauce'],
            ['id' => 207, 'name' => 'Pancit Bihon', 'description' => 'Stir-fried rice noodles with meat and vegetables'],
            ['id' => 208, 'name' => 'Lumpiang Shanghai', 'description' => 'Filipino-style spring rolls filled with ground pork'],
            ['id' => 209, 'name' => 'Pork Menudo', 'description' => 'Diced pork stew with potatoes, carrots, and liver spread'],
            ['id' => 210, 'name' => 'Chicken Inasal', 'description' => 'Grilled chicken marinated in vinegar, lime, and spices'],
            ['id' => 211, 'name' => 'Pinakbet', 'description' => 'Mixed vegetables sautéed in shrimp paste'],
            ['id' => 212, 'name' => 'Nilaga', 'description' => 'Clear beef soup with vegetables and potatoes'],
            ['id' => 213, 'name' => 'Kare-Kare', 'description' => 'Philippine stew with oxtail and vegetables in rich peanut sauce'],
            ['id' => 214, 'name' => 'Lechon Kawali', 'description' => 'Deep-fried crispy pork belly'],
            ['id' => 215, 'name' => 'Bistek Tagalog', 'description' => 'Filipino-style beef steak with citrus and soy sauce']
        ];
        
        return Inertia::render('EditOrder', [
            'order' => $formattedOrder,
            'foodPaxDishes' => $foodPaxDishes,
            'fiestaDishes' => $fiestaDishes,
            'filipinoDesserts' => $filipinoDesserts,
            'dbMeals' => $dbMeals,
        ]);
    }
    
    /**
     * Update the specified order.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, $id)
    {
        // Find the order and make sure it belongs to the authenticated user
        $order = Order::where('id', $id)
            ->where('user_id', Auth::id())
            ->where('status', 'pending') // Only allow updating pending orders
            ->firstOrFail();
            
        // Validate the update request
        $validated = $request->validate([
            'delivery_date' => 'required|date|after_or_equal:today',
            'delivery_time' => 'required|date_format:H:i',
            'delivery_address' => 'required|string',
            'notes' => 'nullable|string',
            'number_of_pax' => 'required|integer|min:1',
            'selected_dishes' => 'required|array',
            'selected_dishes.*' => 'string',
        ]);
        
        // Check if this is a Fiesta Package (has set and desserts)
        if ($order->package_set) {
            $request->validate([
                'selected_desserts' => 'required|array',
                'selected_desserts.*' => 'string',
            ]);
            
            // Update desserts
            $order->selected_desserts = json_encode($request->input('selected_desserts'));
        }
        
        // Update the order
        $order->delivery_date = $request->input('delivery_date');
        $order->delivery_time = $request->input('delivery_time');
        $order->delivery_address = $request->input('delivery_address');
        $order->notes = $request->input('notes');
        $order->number_of_pax = $request->input('number_of_pax');
        $order->selected_dishes = json_encode($request->input('selected_dishes'));
        
        // Recalculate total amount for regular Food Pax orders
        if (!$order->package_set) {
            $order->total_amount = $order->package_price * $request->input('number_of_pax');
        }
        
        $order->save();
        
        // Always return to my orders with success message
        return redirect()->route('my.orders')->with('success', 'Order updated successfully.');
    }
    
    /**
     * Cancel a pending order.
     *
     * @param  int  $id
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function cancel($id, Request $request)
    {
        // Find the order and make sure it belongs to the authenticated user
        $order = Order::where('id', $id)
            ->where('user_id', Auth::id())
            ->where('status', 'pending') // Only allow cancelling pending orders
            ->firstOrFail();
            
        // Update order status to cancelled
        $order->status = 'cancelled';
        $order->save();
        
        // Always return a redirect response for Inertia requests
        return redirect()->route('my.orders')->with('success', 'Order cancelled successfully.');
    }
    
    /**
     * Store a new order.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request)
    {
        // Log the incoming request data for debugging
        \Log::info('Order submission request data:', $request->all());
        
        // Base validation for all orders
        $baseValidation = [
            'package.id' => 'required|integer',
            'package.name' => 'required|string',
            'dishes' => 'required|array',
            'dishes.*' => 'string',
            'customerInfo.name' => 'required|string',
            'customerInfo.email' => 'required|email',
            'customerInfo.phone' => 'nullable|string',
            'customerInfo.address' => 'required|string',
            'customerInfo.note' => 'nullable|string',
            'customerInfo.deliveryDate' => 'required|date|after:today',
            'customerInfo.deliveryTime' => 'required|date_format:H:i',
            'customerInfo.paymentMethod' => 'required|string|in:COD,GCash',
            'customerInfo.gcashNumber' => 'required_if:customerInfo.paymentMethod,GCash|nullable|string',
            'customerInfo.gcashReceipt' => 'required_if:customerInfo.paymentMethod,GCash|nullable|image|max:5120',
        ];
        
        // Check if this is a Filipino Fiesta Package order (has set and desserts)
        $isFiestaPackage = $request->has('set') && $request->has('desserts');
        \Log::info('Is Fiesta Package order?', ['isFiestaPackage' => $isFiestaPackage]);
        
        // Add specific validation for Filipino Fiesta Package
        if ($isFiestaPackage) {
            \Log::info('Using Fiesta Package validation rules');
            $baseValidation = array_merge($baseValidation, [
                'set' => 'required|string|in:A,B,C',
                'mainItem' => 'required|string',
                'desserts' => 'required|array',
                'desserts.*' => 'string',
                'customerInfo.numberOfPax' => 'integer', // For Fiesta Package, numberOfPax is pre-defined
            ]);
        } else {
            \Log::info('Using regular Food Pax validation rules');
            // Regular food pax requires package price and number of pax
            $baseValidation['package.price'] = 'required|string';
            $baseValidation['customerInfo.numberOfPax'] = 'required|integer|min:1';
        }
        
        try {
            $request->validate($baseValidation);
            \Log::info('Validation passed');
        } catch (\Illuminate\Validation\ValidationException $e) {
            \Log::error('Validation failed', [
                'errors' => $e->errors(),
            ]);
            throw $e;
        }

        // Calculate price based on package type
        $numericPrice = 0;
        $packageId = $request->input('package.id');
        
        if ($isFiestaPackage) {
            \Log::info('Processing Fiesta Package pricing');
            // Set price based on the selected set
            switch ($request->input('set')) {
                case 'A':
                    $numericPrice = 14999; // ₱14,999 for Set A
                    // Set A is good for 15-30 pax
                    $paxRange = '15-30';
                    break;
                case 'B':
                    $numericPrice = 10999; // ₱10,999 for Set B
                    // Set B is good for 10-20 pax
                    $paxRange = '10-20';
                    break;
                case 'C':
                    $numericPrice = 8999; // ₱8,999 for Set C
                    // Set C is good for 10-15 pax
                    $paxRange = '10-15';
                    break;
                default:
                    \Log::warning('Invalid set value received', ['set' => $request->input('set')]);
                    $numericPrice = 8999; // Default to lowest price if set is invalid
                    $paxRange = '10-15';
            }
            // Filipino Fiesta Package has a fixed price, not per pax
            $totalAmount = $numericPrice;
            
            // Store the pax range information in the notes field
            $notes = "Fiesta Package Set {$request->input('set')} - Good for {$paxRange} people";
            \Log::info('Fiesta Package price calculated', [
                'set' => $request->input('set'),
                'price' => $numericPrice,
                'paxRange' => $paxRange
            ]);
        } else {
            // Regular Food Pax pricing
            // Extract price from string (e.g., "₱250.00" to 250.00)
            $priceString = $request->input('package.price');
            $numericPrice = (float) preg_replace('/[^0-9.]/', '', $priceString);
            // Calculate total amount based on package price and number of pax
            $totalAmount = $numericPrice * $request->input('customerInfo.numberOfPax');
        }

        // Handle GCash receipt upload
        $gcashReceiptPath = null;
        if ($request->input('customerInfo.paymentMethod') === 'GCash' && $request->hasFile('customerInfo.gcashReceipt')) {
            $gcashReceiptPath = $request->file('customerInfo.gcashReceipt')->store('receipts', 'public');
        }

        // Prepare order data
        $orderData = [
            'user_id' => Auth::id(),
            'customer_name' => $request->input('customerInfo.name'),
            'customer_email' => $request->input('customerInfo.email'),
            'customer_phone' => $request->input('customerInfo.phone'),
            'delivery_address' => $request->input('customerInfo.address'),
            'delivery_date' => $request->input('customerInfo.deliveryDate'),
            'delivery_time' => $request->input('customerInfo.deliveryTime'),
            'package_id' => $request->input('package.id'),
            'package_name' => $request->input('package.name'),
            'package_price' => $numericPrice,
            'number_of_pax' => $request->input('customerInfo.numberOfPax'),
            'selected_dishes' => json_encode($request->input('dishes')), // Make sure dishes are properly JSON encoded
            'total_amount' => $totalAmount,
            'notes' => $request->input('customerInfo.note'),
            'payment_method' => $request->input('customerInfo.paymentMethod'),
            'gcash_number' => $request->input('customerInfo.gcashNumber'),
            'gcash_receipt' => $gcashReceiptPath,
            'status' => 'pending'
        ];
        
        // Add Filipino Fiesta Package specific data
        if ($isFiestaPackage) {
            $orderData['package_set'] = $request->input('set');
            $orderData['main_item'] = $request->input('mainItem');
            $orderData['selected_desserts'] = json_encode($request->input('desserts')); // Make sure desserts are properly JSON encoded
            $orderData['notes'] = $notes ?? null; // Store the package information in notes
            
            \Log::info('Added Fiesta Package specific data to order', [
                'package_set' => $orderData['package_set'],
                'main_item' => $orderData['main_item'],
                'selected_desserts' => $orderData['selected_desserts']
            ]);
        }
        
        try {
            \Log::info('Attempting to create order with data', [
                'package_id' => $orderData['package_id'],
                'package_name' => $orderData['package_name'],
                'is_fiesta_package' => $isFiestaPackage,
                'selected_dishes' => $orderData['selected_dishes'],
                'selected_desserts' => $isFiestaPackage ? $orderData['selected_desserts'] : null
            ]);
            
            // Make extra sure the orders table exists before trying to create a record
            if (!\Schema::hasTable('orders')) {
                \Log::error('Orders table does not exist!');
                throw new \Exception('Database error: Orders table does not exist. Please run migrations.');
            }
            
            $order = Order::create($orderData);

            // Reload the order to get all fields correctly formatted
            $order = Order::find($order->id);
            
            \Log::info('Order created successfully', [
                'order_id' => $order->id,
                'status' => $order->status
            ]);

            return response()->json([
                'success' => true,
                'order' => $order
            ]);
        } catch (\Illuminate\Database\QueryException $e) {
            \Log::error('Database query error when creating order', [
                'error' => $e->getMessage(),
                'sql' => $e->getSql() ?? 'SQL not available',
                'bindings' => $e->getBindings() ?? [],
                'code' => $e->getCode()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Database error: ' . $e->getMessage()
            ], 500);
        } catch (\Exception $e) {
            \Log::error('Failed to create order', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString()
            ]);
            
            return response()->json([
                'success' => false,
                'message' => 'Failed to create order: ' . $e->getMessage()
            ], 500);
        }
    }
}