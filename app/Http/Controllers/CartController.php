<?php

namespace App\Http\Controllers;

use App\Models\Cart;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class CartController extends Controller
{
    /**
     * Display the cart page.
     *
     * @return \Inertia\Response
     */
    public function index()
    {
        $cartItems = Cart::where('user_id', Auth::id())
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(function ($item) {
                return [
                    'id' => $item->id,
                    'package_name' => $item->package_name,
                    'package_set' => $item->package_set,
                    'main_item' => $item->main_item,
                    'package_price' => $item->package_price,
                    'quantity' => $item->quantity,
                    'number_of_pax' => $item->number_of_pax,
                    'total_amount' => $item->total_amount,
                    'delivery_date' => $item->delivery_date->format('Y-m-d'),
                    'delivery_time' => $item->delivery_time,
                    'delivery_address' => $item->delivery_address,
                    'notes' => $item->notes,
                    'selected_dishes' => $item->selected_dishes,
                    'selected_desserts' => $item->selected_desserts,
                ];
            });

        $cartTotal = $cartItems->sum('total_amount');
        $cartCount = $cartItems->count();

        return Inertia::render('Cart', [
            'cartItems' => $cartItems,
            'cartTotal' => $cartTotal,
            'cartCount' => $cartCount,
        ]);
    }

    /**
     * Get cart count for the authenticated user.
     *
     * @return \Illuminate\Http\JsonResponse
     */
    public function getCount()
    {
        $count = Cart::where('user_id', Auth::id())->count();
        return response()->json(['count' => $count]);
    }

    /**
     * Add an item to the cart.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\JsonResponse
     */
    public function store(Request $request)
    {
        Log::info('Cart item add request:', $request->all());

        // Validate the request
        $validated = $request->validate([
            'package.id' => 'required|integer',
            'package.name' => 'required|string',
            'package.price' => 'nullable|string',
            'package.set' => 'nullable|string',
            'dishes' => 'required|array',
            'mainItem' => 'nullable|string',
            'desserts' => 'nullable|array',
            'customerInfo.address' => 'required|string',
            'customerInfo.note' => 'nullable|string',
            'customerInfo.numberOfPax' => 'nullable|integer',
            'customerInfo.deliveryDate' => 'required|date|after:today',
            'customerInfo.deliveryTime' => 'required|date_format:H:i',
            'customerInfo.paymentMethod' => 'required|string|in:COD,GCash',
            // GCash details are optional during order placement - will be collected after order confirmation
            'customerInfo.gcashNumber' => 'nullable|string',
            'customerInfo.gcashReceipt' => 'nullable|image|max:5120',
        ]);

        // Calculate price
        $numericPrice = 0;
        $isFiestaPackage = $request->has('package.set');
        
        if ($isFiestaPackage) {
            switch ($request->input('package.set')) {
                case 'A':
                    $numericPrice = 14999;
                    break;
                case 'B':
                    $numericPrice = 10999;
                    break;
                case 'C':
                    $numericPrice = 8999;
                    break;
            }
            $totalAmount = $numericPrice;
            $numberOfPax = 1; // Fiesta packages don't use pax
        } else {
            $priceString = $request->input('package.price', '0');
            $numericPrice = (float) preg_replace('/[^0-9.]/', '', $priceString);
            $numberOfPax = $request->input('customerInfo.numberOfPax', 1);
            $calculatedTotal = $numericPrice * $numberOfPax;
            
            // For Food Pax: Apply min ₱1,000 and max ₱10,000 limits
            if ($request->input('package.id') == 6) { // Food Pax package ID
                $totalAmount = max(1000, min(10000, $calculatedTotal));
            } else {
                $totalAmount = $calculatedTotal;
            }
        }

        // Handle GCash receipt upload
        $gcashReceiptPath = null;
        if ($request->input('customerInfo.paymentMethod') === 'GCash' && $request->hasFile('customerInfo.gcashReceipt')) {
            $gcashReceiptPath = $request->file('customerInfo.gcashReceipt')->store('receipts', 'public');
        }

        // Create cart item
        $cartItem = Cart::create([
            'user_id' => Auth::id(),
            'package_id' => $request->input('package.id'),
            'package_name' => $request->input('package.name'),
            'package_price' => $numericPrice,
            'package_set' => $request->input('package.set'),
            'main_item' => $request->input('mainItem'),
            'quantity' => 1,
            'number_of_pax' => $numberOfPax,
            'selected_dishes' => $request->input('dishes'),
            'selected_desserts' => $request->input('desserts'),
            'delivery_date' => $request->input('customerInfo.deliveryDate'),
            'delivery_time' => $request->input('customerInfo.deliveryTime'),
            'delivery_address' => $request->input('customerInfo.address'),
            'notes' => $request->input('customerInfo.note'),
            'payment_method' => $request->input('customerInfo.paymentMethod'),
            'gcash_number' => $request->input('customerInfo.gcashNumber'),
            'gcash_receipt' => $gcashReceiptPath,
            'total_amount' => $totalAmount,
        ]);

        Log::info('Cart item created:', ['cart_id' => $cartItem->id]);

        return response()->json([
            'success' => true,
            'message' => 'Item added to cart successfully',
            'cart_count' => Cart::where('user_id', Auth::id())->count(),
        ]);
    }

    /**
     * Show the form for editing a cart item.
     *
     * @param  int  $id
     * @return \Inertia\Response
     */
    public function edit($id)
    {
        $cartItem = Cart::where('id', $id)
            ->where('user_id', Auth::id())
            ->firstOrFail();

        $formattedItem = [
            'id' => $cartItem->id,
            'package_name' => $cartItem->package_name,
            'package_id' => $cartItem->package_id,
            'package_set' => $cartItem->package_set,
            'main_item' => $cartItem->main_item,
            'package_price' => $cartItem->package_price,
            'total_amount' => $cartItem->total_amount,
            'delivery_date' => $cartItem->delivery_date->format('Y-m-d'),
            'delivery_time' => $cartItem->delivery_time,
            'delivery_address' => $cartItem->delivery_address,
            'notes' => $cartItem->notes,
            'number_of_pax' => $cartItem->number_of_pax,
            'selected_dishes' => $cartItem->selected_dishes,
            'selected_desserts' => $cartItem->selected_desserts,
        ];

        return Inertia::render('EditCartItem', [
            'cartItem' => $formattedItem,
        ]);
    }

    /**
     * Remove an item from the cart.
     *
     * @param  int  $id
     * @return \Illuminate\Http\RedirectResponse
     */
    public function destroy($id)
    {
        $cartItem = Cart::where('id', $id)
            ->where('user_id', Auth::id())
            ->firstOrFail();

        $cartItem->delete();

        return redirect()->route('cart.index')->with('success', 'Item removed from cart');
    }

    /**
     * Update cart item.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\RedirectResponse
     */
    public function update(Request $request, $id)
    {
        $cartItem = Cart::where('id', $id)
            ->where('user_id', Auth::id())
            ->firstOrFail();

        $validated = $request->validate([
            'delivery_date' => 'required|date|after:today',
            'delivery_time' => 'required|date_format:H:i',
            'delivery_address' => 'required|string',
            'notes' => 'nullable|string',
            'number_of_pax' => 'required|integer|min:1',
        ]);

        $cartItem->delivery_date = $request->input('delivery_date');
        $cartItem->delivery_time = $request->input('delivery_time');
        $cartItem->delivery_address = $request->input('delivery_address');
        $cartItem->notes = $request->input('notes');
        $cartItem->number_of_pax = $request->input('number_of_pax');

        // Recalculate total for non-fiesta packages
        if (!$cartItem->package_set) {
            $cartItem->total_amount = $cartItem->package_price * $request->input('number_of_pax');
        }

        $cartItem->save();

        return redirect()->route('cart.index')->with('success', 'Cart item updated successfully');
    }

    /**
     * Checkout - convert selected cart items to orders.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\RedirectResponse
     */
    public function checkout(Request $request)
    {
        $selectedItemIds = $request->input('selected_items', []);
        
        // If no items selected, checkout all items
        if (empty($selectedItemIds)) {
            $cartItems = Cart::where('user_id', Auth::id())->get();
        } else {
            $cartItems = Cart::where('user_id', Auth::id())
                ->whereIn('id', $selectedItemIds)
                ->get();
        }

        if ($cartItems->isEmpty()) {
            return redirect()->route('cart.index')->with('error', 'No items selected for checkout');
        }

        // Create orders from cart items
        foreach ($cartItems as $cartItem) {
            Order::create([
                'user_id' => $cartItem->user_id,
                'customer_name' => Auth::user()->name,
                'customer_email' => Auth::user()->email,
                'customer_phone' => Auth::user()->phone,
                'delivery_address' => $cartItem->delivery_address,
                'delivery_date' => $cartItem->delivery_date,
                'delivery_time' => $cartItem->delivery_time,
                'package_id' => $cartItem->package_id,
                'package_name' => $cartItem->package_name,
                'package_price' => $cartItem->package_price,
                'package_set' => $cartItem->package_set,
                'main_item' => $cartItem->main_item,
                'number_of_pax' => $cartItem->number_of_pax,
                'selected_dishes' => json_encode($cartItem->selected_dishes),
                'selected_desserts' => json_encode($cartItem->selected_desserts),
                'total_amount' => $cartItem->total_amount,
                'notes' => $cartItem->notes,
                'payment_method' => $cartItem->payment_method,
                'gcash_number' => $cartItem->gcash_number,
                'gcash_receipt' => $cartItem->gcash_receipt,
                'status' => 'pending',
            ]);
        }

        // Clear only the checked out items from cart
        if (empty($selectedItemIds)) {
            Cart::where('user_id', Auth::id())->delete();
        } else {
            Cart::where('user_id', Auth::id())
                ->whereIn('id', $selectedItemIds)
                ->delete();
        }

        $orderCount = $cartItems->count();
        return redirect()->route('my.orders')->with('success', "Successfully placed {$orderCount} order(s)!");
    }
}
