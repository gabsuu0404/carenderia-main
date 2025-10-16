import React, { useState, useEffect } from 'react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Notification from '@/Components/Notification';

export default function EditOrder({ auth, order, foodPaxDishes, fiestaDishes, filipinoDesserts, dbMeals }) {
    // Check package type to determine which form to show
    const isFoodPax = order.package_id === 6;
    const isFiestaPackage = order.package_id === 1;
    const isSingleMeal = order.package_id === 5;
    
    // Set up notification state
    const [notification, setNotification] = useState({
        message: '',
        type: 'success',
        visible: false
    });
    
    // Set up state for selections
    const [selectedDishes, setSelectedDishes] = useState([]);
    const [selectedDesserts, setSelectedDesserts] = useState([]);
    const [dishMap, setDishMap] = useState({}); // Map to convert dish names to IDs
    const [dessertMap, setDessertMap] = useState({}); // Map to convert dessert names to IDs
    
    // For Single Meal, we need to track the selected dish
    const [selectedMeal, setSelectedMeal] = useState(null);
    
    // Format the date properly to YYYY-MM-DD for the date input
    const formatDateForInput = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toISOString().split('T')[0];
    };

    // Initialize form with order data
    const { data, setData, put, processing, errors } = useForm({
        delivery_date: formatDateForInput(order.delivery_date),
        delivery_address: order.delivery_address,
        number_of_pax: order.number_of_pax,
        selected_dishes: order.selected_dishes,
        selected_desserts: order.selected_desserts || [],
    });
    
    // Create dish and dessert maps for selection
    useEffect(() => {
        // Create maps for converting between names and IDs
        const dishMapping = {};
        
        if (isFoodPax) {
            // For Food Pax, use the foodPaxDishes array
            foodPaxDishes.forEach(dish => {
                dishMapping[dish.name] = dish.id;
            });
        } else if (isFiestaPackage) {
            // For Fiesta Package, use fiestaDishes
            fiestaDishes.forEach(dish => {
                dishMapping[dish.name] = dish.id;
            });
        } else if (isSingleMeal) {
            // For Single Meal, find the current meal in dbMeals
            dbMeals.forEach(dish => {
                dishMapping[dish.name] = dish.id;
                
                // If this dish name matches our selected dish, set it as selected
                if (order.selected_dishes.includes(dish.name)) {
                    setSelectedMeal(dish);
                }
            });
        }
        
        setDishMap(dishMapping);
        
        // Create dessert map (only needed for fiesta package)
        if (isFiestaPackage) {
            const dessertMapping = {};
            filipinoDesserts.forEach(dessert => {
                dessertMapping[dessert.name] = dessert.id;
            });
            setDessertMap(dessertMapping);
        }
        
        // Convert dish names to IDs for the initial selection
        const initialDishSelection = order.selected_dishes.map(name => dishMapping[name]).filter(id => id);
        setSelectedDishes(initialDishSelection);
        
        // For fiesta package, also convert dessert names to IDs
        if (isFiestaPackage && order.selected_desserts) {
            const dessertMapping = {};
            filipinoDesserts.forEach(dessert => {
                dessertMapping[dessert.name] = dessert.id;
            });
            
            const initialDessertSelection = order.selected_desserts.map(name => dessertMapping[name]).filter(id => id);
            setSelectedDesserts(initialDessertSelection);
        }
    }, [order, foodPaxDishes, filipinoDesserts, dbMeals]);
    
    // Get the maximum number of dishes based on package type and set
    const getMaxDishes = () => {
        if (isFoodPax) return 2;
        if (isFiestaPackage) {
            return order.package_set === 'A' ? 5 : 4;
        }
        return 1; // Single meal
    };
    
    // Get the maximum number of desserts based on package type and set
    const getMaxDesserts = () => {
        if (isFoodPax) return 0;
        if (isFiestaPackage) {
            return order.package_set === 'A' ? 2 : 1;
        }
        return 0; // Single meal
    };
    
    // Handle dish selection
    const toggleDishSelection = (dishId) => {
        // For Single Meal, we only need one dish
        if (isSingleMeal) {
            const meal = dbMeals.find(meal => meal.id === dishId);
            if (meal) {
                setSelectedMeal(meal);
                setSelectedDishes([dishId]);
                setData('selected_dishes', [meal.name]);
            }
            return;
        }
        
        // For Food Pax and Fiesta Package
        if (selectedDishes.includes(dishId)) {
            // Remove dish
            const newSelection = selectedDishes.filter(id => id !== dishId);
            setSelectedDishes(newSelection);
            
        // Update form data
        const dishNames = newSelection.map(id => {
            if (isFoodPax) {
                const dish = foodPaxDishes.find(d => d.id === id);
                return dish ? dish.name : null;
            } else if (isFiestaPackage) {
                const dish = fiestaDishes.find(d => d.id === id);
                return dish ? dish.name : null;
            } else {
                const dish = dbMeals.find(d => d.id === id);
                return dish ? dish.name : null;
            }
        }).filter(name => name);            setData('selected_dishes', dishNames);
            return;
        }
        
        // Check max dishes limit
        const maxDishes = getMaxDishes();
        if (selectedDishes.length >= maxDishes) {
            return;
        }
        
        // Add dish
        const newSelection = [...selectedDishes, dishId];
        setSelectedDishes(newSelection);
        
        // Update form data
        const dishNames = newSelection.map(id => {
            if (isFoodPax) {
                const dish = foodPaxDishes.find(d => d.id === id);
                return dish ? dish.name : null;
            } else if (isFiestaPackage) {
                const dish = fiestaDishes.find(d => d.id === id);
                return dish ? dish.name : null;
            } else {
                const dish = dbMeals.find(d => d.id === id);
                return dish ? dish.name : null;
            }
        }).filter(name => name);
        
        setData('selected_dishes', dishNames);
    };
    
    // Handle dessert selection (only for fiesta package)
    const toggleDessertSelection = (dessertId) => {
        if (!isFiestaPackage) return;
        
        if (selectedDesserts.includes(dessertId)) {
            // Remove dessert
            const newSelection = selectedDesserts.filter(id => id !== dessertId);
            setSelectedDesserts(newSelection);
            
            // Update form data
            const dessertNames = newSelection.map(id => {
                const dessert = filipinoDesserts.find(d => d.id === id);
                return dessert ? dessert.name : null;
            }).filter(name => name);
            
            setData('selected_desserts', dessertNames);
            return;
        }
        
        // Check max desserts limit
        const maxDesserts = getMaxDesserts();
        if (selectedDesserts.length >= maxDesserts) {
            return;
        }
        
        // Add dessert
        const newSelection = [...selectedDesserts, dessertId];
        setSelectedDesserts(newSelection);
        
        // Update form data
        const dessertNames = newSelection.map(id => {
            const dessert = filipinoDesserts.find(d => d.id === id);
            return dessert ? dessert.name : null;
        }).filter(name => name);
        
        setData('selected_desserts', dessertNames);
    };
    
    // Handle form submission
    const handleSubmit = (e) => {
        e.preventDefault();
        
        // Show processing notification
        setNotification({
            message: 'Saving your order changes...',
            type: 'info',
            visible: true
        });
        
        put(route('orders.update', order.id), {
            onSuccess: () => {
                // Show success notification
                setNotification({
                    message: 'Order updated successfully!',
                    type: 'success',
                    visible: true
                });
                
                // Redirect to the my-orders page directly instead of using window.history.back()
                window.location.href = route('my.orders');
            },
            onError: (errors) => {
                // Show error notification
                setNotification({
                    message: 'There was a problem updating your order. Please check the form and try again.',
                    type: 'error',
                    visible: true
                });
                
                console.error('Order update errors:', errors);
            }
        });
    };
    
    // Handle input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setData(name, value);
    };
    
    return (
        <AuthenticatedLayout
            auth={auth}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Edit Order</h2>}
        >
            <Head title="Edit Order" />
            
            {/* Show notification when visible */}
            {notification.visible && (
                <Notification
                    message={notification.message}
                    type={notification.type}
                    onClose={() => setNotification({...notification, visible: false})}
                />
            )}
            
            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <div className="flex justify-between items-center mb-6">
                                <div className="flex items-center">
                                    <Link
                                        href={route('my.orders')}
                                        className="mr-2 p-1 rounded-full hover:bg-gray-200 transition-colors"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                        </svg>
                                    </Link>
                                    <h3 className="text-lg font-semibold">Edit Order #{order.id}</h3>
                                </div>
                            </div>
                            
                            <div className="mb-6 p-4 bg-yellow-50 border-l-4 border-yellow-400">
                                <div className="flex items-center">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-600 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <p className="text-sm text-yellow-700">
                                        You are editing a <span className="font-semibold">{order.package_name}</span> order. Only pending orders can be edited.
                                    </p>
                                </div>
                            </div>
                            
                            <form onSubmit={handleSubmit}>
                                {/* Food Pax Selection */}
                                {isFoodPax && (
                                    <div className="mb-6">
                                        <h4 className="text-md font-medium text-gray-900 mb-4">Select 2 Dishes for Food Pax</h4>
                                        <p className="text-gray-600 mb-2">Your meal includes steamed rice. Please select 2 dishes to accompany your rice:</p>
                                        <p className="text-sm text-gray-500">Selected: {selectedDishes.length}/2</p>
                                        
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                                            {foodPaxDishes.map((dish) => (
                                                <div 
                                                    key={dish.id}
                                                    onClick={() => toggleDishSelection(dish.id)}
                                                    className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                                                        selectedDishes.includes(dish.id) 
                                                            ? 'border-red-500 bg-red-50' 
                                                            : 'border-gray-200 hover:border-gray-300'
                                                    }`}
                                                >
                                                    <div className="flex items-center">
                                                        <input 
                                                            type="checkbox"
                                                            checked={selectedDishes.includes(dish.id)}
                                                            onChange={() => {}}
                                                            className="h-4 w-4 text-red-600 focus:ring-red-500"
                                                            disabled={selectedDishes.length >= getMaxDishes() && !selectedDishes.includes(dish.id)}
                                                        />
                                                        <label className="ml-2 block font-medium text-gray-700">
                                                            {dish.name}
                                                        </label>
                                                    </div>
                                                    <p className="mt-1 text-sm text-gray-500">
                                                        {dish.description}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                        {errors.selected_dishes && (
                                            <div className="text-red-500 text-sm mt-1">{errors.selected_dishes}</div>
                                        )}
                                    </div>
                                )}
                                
                                {/* Fiesta Package Selection */}
                                {isFiestaPackage && (
                                    <div>
                                        <div className="mb-6">
                                            <h4 className="text-md font-medium text-gray-900 mb-2">Selected Set: {order.package_set}</h4>
                                            <p className="text-gray-600 mb-4">Main Item: {order.main_item}</p>
                                            
                                            <h4 className="text-md font-medium text-gray-900 mb-2">Select Dishes</h4>
                                            <p className="text-sm text-gray-500">Selected: {selectedDishes.length}/{getMaxDishes()}</p>
                                            
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                                                {fiestaDishes.map((dish) => (
                                                    <div 
                                                        key={dish.id}
                                                        onClick={() => toggleDishSelection(dish.id)}
                                                        className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                                                            selectedDishes.includes(dish.id) 
                                                                ? 'border-red-500 bg-red-50' 
                                                                : 'border-gray-200 hover:border-gray-300'
                                                        }`}
                                                    >
                                                        <div className="flex items-center">
                                                            <input 
                                                                type="checkbox"
                                                                checked={selectedDishes.includes(dish.id)}
                                                                onChange={() => {}}
                                                                className="h-4 w-4 text-red-600 focus:ring-red-500"
                                                                disabled={selectedDishes.length >= getMaxDishes() && !selectedDishes.includes(dish.id)}
                                                            />
                                                            <label className="ml-2 block font-medium text-gray-700">
                                                                {dish.name}
                                                            </label>
                                                        </div>
                                                        <p className="mt-1 text-sm text-gray-500">
                                                            {dish.description}
                                                        </p>
                                                    </div>
                                                ))}
                                            </div>
                                            {errors.selected_dishes && (
                                                <div className="text-red-500 text-sm mt-1">{errors.selected_dishes}</div>
                                            )}
                                        </div>
                                        
                                        <div className="mb-6">
                                            <h4 className="text-md font-medium text-gray-900 mb-2">Select Desserts</h4>
                                            <p className="text-sm text-gray-500">Selected: {selectedDesserts.length}/{getMaxDesserts()}</p>
                                            
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-4">
                                                {filipinoDesserts.map((dessert) => (
                                                    <div 
                                                        key={dessert.id}
                                                        onClick={() => toggleDessertSelection(dessert.id)}
                                                        className={`border rounded-lg p-3 cursor-pointer transition-colors ${
                                                            selectedDesserts.includes(dessert.id) 
                                                                ? 'border-red-500 bg-red-50' 
                                                                : 'border-gray-200 hover:border-gray-300'
                                                        }`}
                                                    >
                                                        <div className="flex items-center">
                                                            <input 
                                                                type="checkbox"
                                                                checked={selectedDesserts.includes(dessert.id)}
                                                                onChange={() => {}}
                                                                className="h-4 w-4 text-red-600 focus:ring-red-500"
                                                                disabled={selectedDesserts.length >= getMaxDesserts() && !selectedDesserts.includes(dessert.id)}
                                                            />
                                                            <label className="ml-2 block font-medium text-gray-700">
                                                                {dessert.name}
                                                            </label>
                                                        </div>
                                                        <p className="mt-1 text-sm text-gray-500">
                                                            {dessert.description}
                                                        </p>
                                                    </div>
                                                ))}
                                            </div>
                                            {errors.selected_desserts && (
                                                <div className="text-red-500 text-sm mt-1">{errors.selected_desserts}</div>
                                            )}
                                        </div>
                                    </div>
                                )}
                                
                                {/* Single Meal Selection */}
                                {isSingleMeal && (
                                    <div className="mb-6">
                                        <h4 className="text-md font-medium text-gray-900 mb-4">Select a Filipino dish for your Single Meal</h4>
                                        
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {dbMeals.map((dish) => (
                                                <div 
                                                    key={dish.id}
                                                    onClick={() => dish.is_available !== false && toggleDishSelection(dish.id)}
                                                    className={`border rounded-lg p-3 ${dish.is_available !== false ? 'cursor-pointer' : 'opacity-50 cursor-not-allowed'} transition-colors ${
                                                        selectedDishes.includes(dish.id) 
                                                            ? 'border-red-500 bg-red-50' 
                                                            : 'border-gray-200 hover:border-gray-300'
                                                    }`}
                                                >
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center">
                                                            <input 
                                                                type="radio"
                                                                checked={selectedDishes.includes(dish.id)}
                                                                onChange={() => {}}
                                                                className="h-4 w-4 text-red-600 focus:ring-red-500"
                                                                disabled={dish.is_available === false}
                                                            />
                                                            <label className="ml-2 block font-medium text-gray-700">
                                                                {dish.name}
                                                            </label>
                                                        </div>
                                                        {dish.is_available !== false ? (
                                                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                                                                Available
                                                            </span>
                                                        ) : (
                                                            <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                                                                Not Available
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="mt-1 text-sm text-gray-500">
                                                        {dish.description}
                                                    </p>
                                                </div>
                                            ))}
                                        </div>
                                        {errors.selected_dishes && (
                                            <div className="text-red-500 text-sm mt-1">{errors.selected_dishes}</div>
                                        )}
                                    </div>
                                )}
                                
                                <div className="border-t pt-6 mb-6">
                                    <h4 className="text-md font-medium text-gray-900 mb-4">Order Information</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {/* Delivery Date field */}
                                        <div>
                                            <label htmlFor="delivery_date" className="block text-sm font-medium text-gray-700 mb-1">
                                                Delivery Date <span className="text-red-600">*</span>
                                            </label>
                                            <input
                                                type="date"
                                                id="delivery_date"
                                                name="delivery_date"
                                                value={data.delivery_date}
                                                onChange={handleInputChange}
                                                min={(() => {
                                                    // Allow the existing date or today (whichever is earlier)
                                                    const today = new Date();
                                                    today.setHours(0, 0, 0, 0);
                                                    
                                                    // If we have an existing date that's before today, use that
                                                    const existingDate = new Date(data.delivery_date);
                                                    if (existingDate < today) {
                                                        return data.delivery_date;
                                                    }
                                                    
                                                    return today.toISOString().split('T')[0];
                                                })()}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                                required
                                            />
                                            {errors.delivery_date && (
                                                <div className="text-red-500 text-sm mt-1">{errors.delivery_date}</div>
                                            )}
                                        </div>
                                        
                                        {/* Delivery Address field */}
                                        <div>
                                            <label htmlFor="delivery_address" className="block text-sm font-medium text-gray-700 mb-1">
                                                Delivery Address <span className="text-red-600">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                id="delivery_address"
                                                name="delivery_address"
                                                value={data.delivery_address}
                                                onChange={handleInputChange}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                                required
                                                placeholder="Enter your complete delivery address"
                                            />
                                            {errors.delivery_address && (
                                                <div className="text-red-500 text-sm mt-1">{errors.delivery_address}</div>
                                            )}
                                        </div>
                                        
                                        {/* Number of Pax field */}
                                        {!isFiestaPackage && (
                                            <div>
                                                <label htmlFor="number_of_pax" className="block text-sm font-medium text-gray-700 mb-1">
                                                    Number of Pax <span className="text-red-600">*</span>
                                                </label>
                                                <input
                                                    type="number"
                                                    id="number_of_pax"
                                                    name="number_of_pax"
                                                    value={data.number_of_pax}
                                                    onChange={handleInputChange}
                                                    min="1"
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                                    required
                                                />
                                                {errors.number_of_pax && (
                                                    <div className="text-red-500 text-sm mt-1">{errors.number_of_pax}</div>
                                                )}
                                            </div>
                                        )}
                                        
                                        {/* For Fiesta Package, show package size info */}
                                        {isFiestaPackage && (
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Package Size
                                                </label>
                                                <div className="px-3 py-2 border border-gray-300 bg-gray-50 rounded-md text-gray-700 font-medium">
                                                    {order.package_set === 'A' ? 'Good for 15-30 people' : 
                                                     order.package_set === 'B' ? 'Good for 10-20 people' : 
                                                                              'Good for 10-15 people'}
                                                </div>
                                                <p className="text-xs text-gray-500 mt-1">
                                                    Fiesta packages have pre-defined serving sizes
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                
                                <div className="flex justify-end">
                                    <Link 
                                        href="javascript:history.back()" 
                                        className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 mr-2 hover:bg-gray-50 flex items-center"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                        </svg>
                                        Back
                                    </Link>
                                    <button
                                        type="submit"
                                        disabled={processing || 
                                            (isFoodPax && selectedDishes.length !== 2) ||
                                            (isFiestaPackage && (
                                                selectedDishes.length !== getMaxDishes() || 
                                                selectedDesserts.length !== getMaxDesserts()
                                            )) ||
                                            (isSingleMeal && selectedDishes.length !== 1)
                                        }
                                        className="px-4 py-2 rounded-md text-white bg-red-600 hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                                    >
                                        {processing ? 'Saving...' : 'Save Changes'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}