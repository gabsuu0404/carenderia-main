import { Head, useForm } from '@inertiajs/react';
import { useState, Fragment, useEffect } from 'react';
import axios from 'axios';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import Notification from '@/Components/Notification';

export default function Order({ auth, dbMeals = [] }) {
    const [selectedOption, setSelectedOption] = useState('All Occasions');
    const [showFoodPaxModal, setShowFoodPaxModal] = useState(false);
    const [showFiestaModal, setShowFiestaModal] = useState(false);
    const [showSingleMealModal, setShowSingleMealModal] = useState(false);
    const [selectedDishes, setSelectedDishes] = useState([]);
    const [selectedDesserts, setSelectedDesserts] = useState([]);
    const [selectedSet, setSelectedSet] = useState(null);
    const [currentPackage, setCurrentPackage] = useState(null);
    const [currentDishIndex, setCurrentDishIndex] = useState(0);
    
    // Notification state
    const [notification, setNotification] = useState({ message: '', type: 'success', visible: false });
    
    // Track whether we're using database meals or hardcoded meals
    const [useDatabaseMeals, setUseDatabaseMeals] = useState(true);
    
    // Log received meals from database for debugging
    useEffect(() => {
        console.log('Database meals received:', dbMeals);
        // If no database meals are provided, fall back to hardcoded meals
        if (!dbMeals || dbMeals.length === 0) {
            console.log('No database meals found, using hardcoded meals');
            setUseDatabaseMeals(false);
        }
    }, [dbMeals]);
    const [mealQuantity, setMealQuantity] = useState(1);
    const [customerInfo, setCustomerInfo] = useState({
        name: auth.user?.name || '',
        email: auth.user?.email || '',
        phone: auth.user?.phone || '',
        address: '',
        numberOfPax: 1,
        deliveryDate: getTomorrowDate() // Default to tomorrow's date
    });
    
    // Helper function to get tomorrow's date in YYYY-MM-DD format
    function getTomorrowDate() {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        return tomorrow.toISOString().split('T')[0];
    }

    const options = [
        'All Occasions',
        'Holiday Parties',
        'Family Gatherings'
    ];
    
    // Hardcoded list of Filipino dishes with images (as fallback)
    const hardcodedDishes = [
        { id: 1, name: 'Adobo', description: 'Meat, seafood, or vegetables marinated in vinegar, soy sauce, and spices', image: '/images/dishes/adobo.jpg' },
        { id: 2, name: 'Sinigang', description: 'Sour soup with meat or seafood and vegetables', image: '/images/dishes/sinigang.jpg' },
        { id: 3, name: 'Kare-kare', description: 'Stew with oxtail and vegetables in peanut sauce', image: '/images/dishes/karekare.jpg' },
        { id: 4, name: 'Lechon Kawali', description: 'Deep-fried crispy pork belly', image: '/images/dishes/lechonkawali.jpg' },
        { id: 5, name: 'Bistek', description: 'Filipino-style beef steak with onions and calamansi', image: '/images/dishes/bistek.jpg' },
        { id: 6, name: 'Pinakbet', description: 'Mixed vegetables with shrimp paste', image: '/images/dishes/pinakbet.jpg' },
        { id: 7, name: 'Chicken Inasal', description: 'Grilled chicken marinated in annatto, lemongrass, and ginger', image: '/images/dishes/chickeninasal.jpg' },
        { id: 8, name: 'Caldereta', description: 'Goat or beef stew with liver spread and bell peppers', image: '/images/dishes/caldereta.jpg' },
        { id: 9, name: 'Dinuguan', description: 'Savory pork blood stew with meat and chili', image: '/images/dishes/dinuguan.jpg' },
        { id: 10, name: 'Pancit Canton', description: 'Stir-fried noodles with meat and vegetables', image: '/images/dishes/pancitcanton.jpg' },
        { id: 11, name: 'Crispy Pata', description: 'Deep-fried pork leg with crispy skin', image: '/images/dishes/crispypata.jpg' },
        { id: 12, name: 'Sisig', description: 'Sizzling dish of chopped pig parts and chicken liver', image: '/images/dishes/sisig.jpg' },
        { id: 13, name: 'Menudo', description: 'Pork and liver stew with potatoes, carrots and raisins', image: '/images/dishes/menudo.jpg' },
        { id: 14, name: 'Afritada', description: 'Chicken or pork stew with tomato sauce, potatoes, and bell peppers', image: '/images/dishes/afritada.jpg' },
        { id: 15, name: 'Bulalo', description: 'Beef shank soup with vegetables and bone marrow', image: '/images/dishes/bulalo.jpg' },
        { id: 16, name: 'Laing', description: 'Dried taro leaves cooked in coconut milk with chili', image: '/images/dishes/laing.jpg' },
        { id: 17, name: 'Bicol Express', description: 'Spicy pork stew with coconut milk, shrimp paste, and chilies', image: '/images/dishes/bicolexpress.jpg' },
        { id: 18, name: 'Paksiw na Lechon', description: 'Leftover roast pork cooked in vinegar and spices', image: '/images/dishes/paksiw.jpg' }
    ];
    
    // Use database meals when available, otherwise use hardcoded dishes
    const filipinoDishes = useDatabaseMeals && dbMeals.length > 0 ? dbMeals : hardcodedDishes;
    
    // Dedicated Filipino dishes for Food Pax selection (not from meal management)
    const foodPaxDishes = [
        { id: 101, name: 'Pork Adobo', description: 'Classic Filipino dish with pork cooked in soy sauce, vinegar, and spices' },
        { id: 102, name: 'Chicken Tinola', description: 'Ginger-based soup with chicken, green papaya, and chili leaves' },
        { id: 103, name: 'Beef Kaldereta', description: 'Rich beef stew with liver spread, bell peppers, and potatoes' },
        { id: 104, name: 'Pork Sinigang', description: 'Tamarind-based sour soup with pork and vegetables' },
        { id: 105, name: 'Chicken Afritada', description: 'Tomato-based stew with chicken, potatoes, and carrots' },
        { id: 106, name: 'Beef Mechado', description: 'Filipino-style beef pot roast with tomato sauce' },
        { id: 107, name: 'Pancit Bihon', description: 'Stir-fried rice noodles with meat and vegetables' },
        { id: 108, name: 'Lumpiang Shanghai', description: 'Filipino-style spring rolls filled with ground pork' },
        { id: 109, name: 'Pork Menudo', description: 'Diced pork stew with potatoes, carrots, and liver spread' },
        { id: 110, name: 'Chicken Inasal', description: 'Grilled chicken marinated in vinegar, lime, and spices' },
        { id: 111, name: 'Pinakbet', description: 'Mixed vegetables sautéed in shrimp paste' },
        { id: 112, name: 'Nilaga', description: 'Clear beef soup with vegetables and potatoes' }
    ];
    
    // Dedicated Filipino dishes for Fiesta Package (not from meal management)
    const fiestaDishes = [
        { id: 201, name: 'Pork Adobo', description: 'Classic Filipino dish with pork cooked in soy sauce, vinegar, and spices' },
        { id: 202, name: 'Chicken Tinola', description: 'Ginger-based soup with chicken, green papaya, and chili leaves' },
        { id: 203, name: 'Beef Kaldereta', description: 'Rich beef stew with liver spread, bell peppers, and potatoes' },
        { id: 204, name: 'Pork Sinigang', description: 'Tamarind-based sour soup with pork and vegetables' },
        { id: 205, name: 'Chicken Afritada', description: 'Tomato-based stew with chicken, potatoes, and carrots' },
        { id: 206, name: 'Beef Mechado', description: 'Filipino-style beef pot roast with tomato sauce' },
        { id: 207, name: 'Pancit Bihon', description: 'Stir-fried rice noodles with meat and vegetables' },
        { id: 208, name: 'Lumpiang Shanghai', description: 'Filipino-style spring rolls filled with ground pork' },
        { id: 209, name: 'Pork Menudo', description: 'Diced pork stew with potatoes, carrots, and liver spread' },
        { id: 210, name: 'Chicken Inasal', description: 'Grilled chicken marinated in vinegar, lime, and spices' },
        { id: 211, name: 'Pinakbet', description: 'Mixed vegetables sautéed in shrimp paste' },
        { id: 212, name: 'Nilaga', description: 'Clear beef soup with vegetables and potatoes' },
        { id: 213, name: 'Kare-Kare', description: 'Philippine stew with oxtail and vegetables in rich peanut sauce' },
        { id: 214, name: 'Lechon Kawali', description: 'Deep-fried crispy pork belly' },
        { id: 215, name: 'Bistek Tagalog', description: 'Filipino-style beef steak with citrus and soy sauce' }
    ];
    
    // List of Filipino desserts
    const filipinoDesserts = [
        { id: 1, name: 'Leche Flan', description: 'Creamy caramel custard dessert' },
        { id: 2, name: 'Halo-Halo', description: 'Mixed dessert with shaved ice, evaporated milk, and various sweet beans and fruits' },
        { id: 3, name: 'Biko', description: 'Sweet rice cake made with glutinous rice and coconut milk' },
        { id: 4, name: 'Cassava Cake', description: 'Baked dessert made from grated cassava, coconut milk and condensed milk' },
        { id: 5, name: 'Maja Blanca', description: 'Coconut pudding with corn and milk' },
        { id: 6, name: 'Bibingka', description: 'Rice cake traditionally cooked in clay pots lined with banana leaves' },
        { id: 7, name: 'Ube Halaya', description: 'Purple yam pudding' },
        { id: 8, name: 'Turon', description: 'Sweet spring rolls with banana and jackfruit, dusted with sugar' }
    ];
    
    // Get the max number of dishes based on selected set
    const getMaxDishes = () => {
        if (!selectedSet) return 2; // default for food pax
        return selectedSet === 'A' ? 5 : 4; // Set A: 5 dishes, Set B/C: 4 dishes
    };
    
    // Get the max number of desserts based on selected set
    const getMaxDesserts = () => {
        if (!selectedSet) return 0; // default for food pax
        return selectedSet === 'A' ? 2 : 1; // Set A: 2 desserts, Set B/C: 1 dessert
    };
    
    // Handle dish selection
    const toggleDishSelection = (dishId) => {
        // If dish is already selected, remove it
        if (selectedDishes.includes(dishId)) {
            setSelectedDishes(selectedDishes.filter(id => id !== dishId));
            return;
        }
        
        // Check max dishes limit based on set
        const maxDishes = getMaxDishes();
        if (selectedDishes.length >= maxDishes) {
            return;
        }
        
        // Add the selected dish
        setSelectedDishes([...selectedDishes, dishId]);
    };
    
    // Handle dessert selection
    const toggleDessertSelection = (dessertId) => {
        // If dessert is already selected, remove it
        if (selectedDesserts.includes(dessertId)) {
            setSelectedDesserts(selectedDesserts.filter(id => id !== dessertId));
            return;
        }
        
        // Check max desserts limit based on set
        const maxDesserts = getMaxDesserts();
        if (selectedDesserts.length >= maxDesserts) {
            return;
        }
        
        // Add the selected dessert
        setSelectedDesserts([...selectedDesserts, dessertId]);
    };
    
    // Handle opening the modal for different packages
    const openFoodPaxModal = (menuPackage) => {
        // Reset selections first
        setSelectedDishes([]);
        setSelectedDesserts([]);
        setSelectedSet(null);
        setCurrentPackage(menuPackage);
        setCurrentDishIndex(0);
        setMealQuantity(1);
        
        if (menuPackage.id === 6) { // ID for Food pax
            setShowFoodPaxModal(true);
        } else if (menuPackage.id === 1) { // Filipino Fiesta Package
            setShowFiestaModal(true);
        } else if (menuPackage.id === 5) { // Single Meal
            setShowSingleMealModal(true);
        }
    };
    
    // Handle set selection for Filipino Fiesta Package
    const selectSet = (set) => {
        setSelectedSet(set);
        setSelectedDishes([]);
        setSelectedDesserts([]);
        
        // Set default number of pax based on the set (for backend processing)
        if (set === 'A') {
            // For Set A (Whole Lechon), use the middle of the range 15-30
            setCustomerInfo(prev => ({...prev, numberOfPax: 20})); 
        } else if (set === 'B') {
            // For Set B (Lechon Belly), use the middle of the range 10-20
            setCustomerInfo(prev => ({...prev, numberOfPax: 15})); 
        } else if (set === 'C') {
            // For Set C (Crispy Pata), use the middle of the range 10-15
            setCustomerInfo(prev => ({...prev, numberOfPax: 12})); 
        }
    };
    
    // Handle customer info updates
    const handleCustomerInfoChange = (e) => {
        const { name, value } = e.target;
        setCustomerInfo(prev => ({
            ...prev,
            [name]: value
        }));
    };
    
    // State for loading and success messages
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitSuccess, setSubmitSuccess] = useState(false);
    const [submitError, setSubmitError] = useState(null);

    // Get the main featured item based on selected set
    const getMainFeaturedItem = () => {
        if (selectedSet === 'A') return 'Whole Lechon';
        if (selectedSet === 'B') return 'Lechon Belly';
        if (selectedSet === 'C') return 'Crispy Pata';
        return '';
    };
    
    // Navigation functions for single meal dish carousel
    const nextDish = () => {
        setCurrentDishIndex(prev => 
            prev === filipinoDishes.length - 1 ? 0 : prev + 1
        );
    };
    
    const prevDish = () => {
        setCurrentDishIndex(prev => 
            prev === 0 ? filipinoDishes.length - 1 : prev - 1
        );
    };
    
    // Handle meal quantity change
    const handleQuantityChange = (change) => {
        const newQuantity = mealQuantity + change;
        if (newQuantity >= 1) {
            setMealQuantity(newQuantity);
        }
    };
    
    // Handle confirming food pax selection
    const confirmFoodPaxSelection = () => {
        if (selectedDishes.length === 2 && customerInfo.deliveryDate) {
            setIsSubmitting(true);
            setSubmitError(null);
            
            // Get the selected dish names from the foodPaxDishes list
            const selectedDishNames = selectedDishes.map(id => 
                foodPaxDishes.find(dish => dish.id === id).name
            );
            
            // Format the delivery date for display
            const formattedDate = new Date(customerInfo.deliveryDate).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
            
            // Create the order data with proper price
            const packagePrice = 500; // Base price for Food Pax per pax
            
            // Create the order data
            const orderData = {
                package: {
                    ...currentPackage,
                    price: packagePrice.toString() // Add price field to match backend validation
                },
                dishes: selectedDishNames,
                customerInfo: customerInfo
            };
            
            // Debug the order data before sending
            console.log('Submitting Food Pax order data:', orderData);
            
            // Send the order to the server using the web route
            axios.post(route('orders.store'), orderData, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    }
                })
                .then(response => {
                    console.log('Order created:', response.data);
                    setIsSubmitting(false);
                    setSubmitSuccess(true);
                    setShowFoodPaxModal(false);
                    setNotification({
                        message: `Order placed for ${customerInfo.numberOfPax} pax with: ${selectedDishNames.join(' and ')}. Delivery scheduled for ${formattedDate}.`,
                        type: 'success',
                        visible: true
                    });
                })
                .catch(error => {
                    console.error('Order creation failed:', error);
                    
                    // Add more detailed error logging
                    if (error.response) {
                        console.error('Error response data:', error.response.data);
                        console.error('Error response status:', error.response.status);
                        console.error('Error response headers:', error.response.headers);
                    } else if (error.request) {
                        console.error('Error request:', error.request);
                    } else {
                        console.error('Error message:', error.message);
                    }
                    
                    const errorMessage = error.response?.data?.message || 'Failed to place order. Please try again.';
                    setIsSubmitting(false);
                    setSubmitError(errorMessage);
                    setNotification({
                        message: errorMessage,
                        type: 'error',
                        visible: true
                    });
                });
        }
    };
    
    // Handle confirming single meal selection
    const confirmSingleMealSelection = () => {
        // Check if the current dish is available (when using database meals)
        const currentDish = filipinoDishes[currentDishIndex];
        const isMealAvailable = !useDatabaseMeals || currentDish.is_available !== false;
        
        if (customerInfo.deliveryDate && customerInfo.address && isMealAvailable) {
            setIsSubmitting(true);
            setSubmitError(null);
            
            // Get the current dish
            const selectedDish = filipinoDishes[currentDishIndex];
            
            // Format the delivery date for display
            const formattedDate = new Date(customerInfo.deliveryDate).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
            
            // Calculate total price (base price * quantity)
            const currentDish = filipinoDishes[currentDishIndex];
            const basePrice = useDatabaseMeals ? parseFloat(currentDish.price || 120) : 120; // Get price from database or use default
            const totalPrice = basePrice * mealQuantity;
            
            // Create the order data
            const orderData = {
                package: {
                    ...currentPackage,
                    price: totalPrice.toString(), // Convert to string to match backend validation
                    formattedPrice: `₱${totalPrice.toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}`
                },
                dishes: [selectedDish.name],
                quantity: mealQuantity,
                customerInfo: {
                    ...customerInfo,
                    numberOfPax: 1 // Single meal is for one person by default
                }
            };
            
            // Debug the order data before sending
            console.log('Submitting Single Meal order data:', orderData);
            
            // Send the order to the server using the web route
            axios.post(route('orders.store'), orderData, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    }
                })
                .then(response => {
                    console.log('Order created:', response.data);
                    setIsSubmitting(false);
                    setSubmitSuccess(true);
                    setShowSingleMealModal(false);
                    setNotification({
                        message: `Single meal order placed: ${mealQuantity}x ${selectedDish.name}. Total: ₱${totalPrice}. Delivery scheduled for ${formattedDate}.`,
                        type: 'success',
                        visible: true
                    });
                })
                .catch(error => {
                    console.error('Order creation failed:', error);
                    
                    // Add more detailed error logging
                    if (error.response) {
                        console.error('Error response data:', error.response.data);
                        console.error('Error response status:', error.response.status);
                        console.error('Error response headers:', error.response.headers);
                        
                        // Show detailed error to the user
                        alert(`Order failed: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
                    } else if (error.request) {
                        console.error('Error request:', error.request);
                        alert("Failed to place order. No response received from server.");
                    } else {
                        console.error('Error message:', error.message);
                        alert(`Error: ${error.message}`);
                    }
                    
                    setIsSubmitting(false);
                    setSubmitError(error.response?.data?.message || 'Failed to place order. Please try again.');
                });
        }
    };
    
    // Handle confirming fiesta package selection
    const confirmFiestaSelection = () => {
        // Check if all required selections are made based on set
        const requiredDishes = getMaxDishes();
        const requiredDesserts = getMaxDesserts();
        
        // For Fiesta Package, numberOfPax is pre-defined based on set selection:
        // Set A (Whole Lechon): Good for 15-30 people (default: 20)
        // Set B (Lechon Belly): Good for 10-20 people (default: 15)
        // Set C (Crispy Pata): Good for 10-15 people (default: 12)
        
        if (selectedSet && 
            selectedDishes.length === requiredDishes && 
            selectedDesserts.length === requiredDesserts && 
            customerInfo.deliveryDate) {
            
            setIsSubmitting(true);
            setSubmitError(null);
            
            // Get the selected dish and dessert names
            const selectedDishNames = selectedDishes.map(id => 
                fiestaDishes.find(dish => dish.id === id).name
            );
            
            const selectedDessertNames = selectedDesserts.map(id => 
                filipinoDesserts.find(dessert => dessert.id === id).name
            );
            
            // Get the main featured item (Whole Lechon, Lechon Belly, or Crispy Pata)
            const mainItem = getMainFeaturedItem();
            
            // Format the delivery date for display
            const formattedDate = new Date(customerInfo.deliveryDate).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            });
            
            // Get the price for this set (as a number to avoid formatting issues)
            let packagePrice = 0;
            switch(selectedSet) {
                case 'A': packagePrice = 14999; break;
                case 'B': packagePrice = 10999; break;
                case 'C': packagePrice = 8999; break;
            }
            
            // Create the order data
            const orderData = {
                package: {
                    ...currentPackage,
                    price: packagePrice.toString(), // Convert to string to match backend validation
                    formattedPrice: `₱${packagePrice.toLocaleString()}` // Include formatted price for display
                },
                set: selectedSet,
                mainItem: mainItem,
                dishes: selectedDishNames,
                desserts: selectedDessertNames,
                customerInfo: customerInfo
            };
            
            // Debug the order data before sending
            console.log('Submitting Fiesta Package order data:', orderData);
            
            // Send the order to the server using the web route
            axios.post(route('orders.store'), orderData, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    }
                })
                .then(response => {
                    console.log('Order created:', response.data);
                    setIsSubmitting(false);
                    setSubmitSuccess(true);
                    setShowFiestaModal(false);
                    setNotification({
                        message: `Filipino Fiesta Package Set ${selectedSet} ordered for ${customerInfo.numberOfPax} pax. Main item: ${mainItem}. Selected dishes: ${selectedDishNames.join(', ')}. Selected desserts: ${selectedDessertNames.join(', ')}. Delivery scheduled for ${formattedDate}.`,
                        type: 'success',
                        visible: true
                    });
                })
                .catch(error => {
                    console.error('Order creation failed:', error);
                    
                    // Add more detailed error logging
                    if (error.response) {
                        console.error('Error response data:', error.response.data);
                        console.error('Error response status:', error.response.status);
                        console.error('Error response headers:', error.response.headers);
                        
                        // Show detailed error to the user
                        alert(`Order failed: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
                    } else if (error.request) {
                        console.error('Error request:', error.request);
                        alert("Failed to place order. No response received from server.");
                    } else {
                        console.error('Error message:', error.message);
                        alert(`Error: ${error.message}`);
                    }
                    
                    setIsSubmitting(false);
                    setSubmitError(error.response?.data?.message || 'Failed to place order. Please try again.');
                });
        }
    };
    
    const menuPackages = [
        {
            id: 1,
            name: 'Filipino Fiesta Package',
            description: 'Traditional Filipino feast with choice of Set A (Whole Lechon), Set B (Lechon Belly), or Set C (Crispy Pata).',
            price: '₱8,999 - ₱14,999',
            image: '/images/lechon.jpg'
        },
        {
            id: 5,
            name: 'Single Meal',
            description: 'Individual Filipino meal with steamed rice and your choice of 1 dish. Perfect for personal orders.',
            price: '₱50-100',
            image: '/images/singlemeal.jpg'
        },
        {
            id: 6,
            name: 'Food pax',
            description: 'Customizable meal with steamed rice and your choice of 2 Filipino dishes from our selection.',
            price: '₱1000-10,000',
            image: '/images/foodpax.jpg'
        }
    ];

    return (
        <AuthenticatedLayout
            auth={auth}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Order Now</h2>}
        >
            <Head title="Order Now" />

            <div className="min-h-screen bg-gray-100">
                {/* Header Banner */}
                <div className="bg-gradient-to-r from-red-500 to-red-600 relative overflow-hidden">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex items-center justify-between">
                        {/* Left side with text and logo */}
                        <div className="flex-1">
                            <div className="flex items-center">
                                <div className="bg-white rounded-full p-4">
                                    <img 
                                        src="/images/logo.jpg" 
                                        alt="3M's Logo" 
                                        className="h-16 w-16 object-contain"
                                    />
                                </div>
                                <div className="ml-6 text-white">
                                    <h1 className="text-4xl font-bold">3M's Kainan</h1>
                                    <p className="mt-2 text-lg">Your trusted catering service</p>
                                </div>
                            </div>
                        </div>
                        
                        {/* Right side with options selector */}
                        <div className="flex-1 flex justify-end">
                            <div className="w-64">
                                <label className="block text-white text-sm font-medium mb-2">
                                    Options:
                                </label>
                                <select 
                                    value={selectedOption}
                                    onChange={(e) => setSelectedOption(e.target.value)}
                                    className="w-full px-4 py-2 rounded-lg bg-white text-gray-800 focus:ring-2 focus:ring-red-400"
                                >
                                    {options.map((option) => (
                                        <option key={option} value={option}>
                                            {option}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {/* Menu Item Cards */}
                        {menuPackages.map((menuPackage) => (
                            <div key={menuPackage.id} className="bg-white rounded-lg shadow-lg overflow-hidden">
                                <div className="h-48 bg-gray-200">
                                    <img
                                        src={menuPackage.image}
                                        alt={menuPackage.name}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = '/images/logo.jpg'; // Fallback image if the specified one fails to load
                                        }}
                                    />
                                </div>
                                <div className="p-6">
                                    <h3 className="text-xl font-semibold text-gray-800">{menuPackage.name}</h3>
                                    <p className="mt-2 text-gray-600">
                                        {menuPackage.description}
                                    </p>
                                    <div className="mt-4 flex items-center justify-between">
                                        <span className="text-2xl font-bold text-red-600">{menuPackage.price}</span>
                                        <button 
                                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                                            onClick={() => openFoodPaxModal(menuPackage)}
                                        >
                                            Choose
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
            
            {/* Food Pax Selection Modal */}
            {showFoodPaxModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-bold text-gray-800">Select 2 Dishes for Food Pax</h2>
                            <button 
                                onClick={() => setShowFoodPaxModal(false)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        
                        <div className="mb-4">
                            <p className="text-gray-600">Your meal includes steamed rice. Please select 2 dishes to accompany your rice:</p>
                            <p className="text-sm text-gray-500 mt-1">Selected: {selectedDishes.length}/2</p>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
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
                        
                        {/* Customer Information Form */}
                        <div className="border-t pt-6 mb-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Customer Information</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Name field */}
                                <div>
                                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                                        Name
                                    </label>
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        value={customerInfo.name}
                                        onChange={handleCustomerInfoChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                    />
                                </div>
                                
                                {/* Email field */}
                                <div>
                                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        value={customerInfo.email}
                                        onChange={handleCustomerInfoChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                    />
                                </div>
                                
                                {/* Phone number field */}
                                <div>
                                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                                        Phone Number
                                    </label>
                                    <input
                                        type="tel"
                                        id="phone"
                                        name="phone"
                                        value={customerInfo.phone}
                                        onChange={handleCustomerInfoChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                        placeholder="e.g., 0917 123 4567"
                                    />
                                </div>
                                
                                {/* Address field */}
                                <div>
                                    <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                                        Delivery Address <span className="text-red-600">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        id="address"
                                        name="address"
                                        value={customerInfo.address}
                                        onChange={handleCustomerInfoChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                        required
                                        placeholder="Enter your complete delivery address"
                                    />
                                </div>
                                
                                {/* Number of pax field */}
                                <div>
                                    <label htmlFor="numberOfPax" className="block text-sm font-medium text-gray-700 mb-1">
                                        Number of Pax <span className="text-red-600">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        id="numberOfPax"
                                        name="numberOfPax"
                                        value={customerInfo.numberOfPax}
                                        onChange={handleCustomerInfoChange}
                                        min="1"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                        required
                                    />
                                </div>
                                
                                {/* Delivery Date field */}
                                <div>
                                    <label htmlFor="deliveryDate" className="block text-sm font-medium text-gray-700 mb-1">
                                        Delivery Date <span className="text-red-600">*</span>
                                    </label>
                                    <input
                                        type="date"
                                        id="deliveryDate"
                                        name="deliveryDate"
                                        value={customerInfo.deliveryDate}
                                        onChange={handleCustomerInfoChange}
                                        min={getTomorrowDate()} // Can't select dates before tomorrow
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                        required
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Orders must be placed at least 1 day in advance</p>
                                </div>
                            </div>
                            <p className="text-xs text-gray-500 mt-3">
                                * Required fields. Your existing information has been pre-filled but can be edited if needed.
                            </p>
                        </div>
                        
                        <div className="border-t pt-4 flex justify-end">
                            <button
                                onClick={() => setShowFoodPaxModal(false)}
                                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 mr-2 hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmFoodPaxSelection}
                                disabled={
                                    selectedDishes.length !== 2 || 
                                    !customerInfo.address || 
                                    customerInfo.numberOfPax < 1 ||
                                    !customerInfo.deliveryDate
                                }
                                className={`px-4 py-2 rounded-md text-white ${
                                    (selectedDishes.length === 2 && 
                                     customerInfo.address && 
                                     customerInfo.numberOfPax >= 1 &&
                                     customerInfo.deliveryDate)
                                        ? 'bg-red-600 hover:bg-red-700' 
                                        : 'bg-gray-400 cursor-not-allowed'
                                }`}
                            >
                                Place Order
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Single Meal Modal with Image Carousel */}
            {showSingleMealModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-3xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-bold text-gray-800">Single Meal</h2>
                            <button 
                                onClick={() => setShowSingleMealModal(false)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        
                        <div className="mb-6">
                            <p className="text-gray-600">Select a Filipino dish to accompany your steamed rice:</p>
                        </div>
                        
                        {/* Dish Carousel */}
                        <div className="relative mb-8">
                            <div className="flex justify-center">
                                <div className="relative w-full max-w-md">
                                    <div className="bg-gray-100 rounded-lg overflow-hidden h-64 flex items-center justify-center">
                                        <img 
                                            src={filipinoDishes[currentDishIndex].image} 
                                            alt={filipinoDishes[currentDishIndex].name}
                                            className="w-full h-full object-cover"
                                            onError={(e) => {
                                                e.target.onerror = null;
                                                e.target.src = '/images/logo.jpg'; // Fallback image if the specified one fails to load
                                            }}
                                        />
                                    </div>
                                    
                                    {/* Navigation buttons */}
                                    <button
                                        onClick={prevDish}
                                        className="absolute top-1/2 left-2 -translate-y-1/2 bg-white bg-opacity-80 rounded-full p-2 shadow hover:bg-opacity-100 transition-all"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                        </svg>
                                    </button>
                                    <button
                                        onClick={nextDish}
                                        className="absolute top-1/2 right-2 -translate-y-1/2 bg-white bg-opacity-80 rounded-full p-2 shadow hover:bg-opacity-100 transition-all"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                        </svg>
                                    </button>
                                </div>
                            </div>
                            
                            {/* Dish Info */}
                            <div className="mt-4 text-center">
                                <h3 className="text-xl font-bold">
                                    {filipinoDishes[currentDishIndex].name}
                                    {useDatabaseMeals && (
                                        <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                            filipinoDishes[currentDishIndex].is_available !== false 
                                                ? 'bg-green-100 text-green-800' 
                                                : 'bg-red-100 text-red-800'
                                        }`}>
                                            {filipinoDishes[currentDishIndex].is_available !== false ? 'Available' : 'Not Available'}
                                        </span>
                                    )}
                                </h3>
                                <p className="text-gray-600 mt-1">{filipinoDishes[currentDishIndex].description}</p>
                            </div>
                        </div>
                        
                        {/* Quantity Selector */}
                        <div className="flex justify-center items-center gap-4 mb-6">
                            <button 
                                onClick={() => handleQuantityChange(-1)}
                                className="bg-gray-200 hover:bg-gray-300 rounded-full w-8 h-8 flex items-center justify-center"
                                disabled={mealQuantity <= 1}
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                                </svg>
                            </button>
                            <div className="text-xl font-semibold">{mealQuantity}</div>
                            <button 
                                onClick={() => handleQuantityChange(1)}
                                className="bg-gray-200 hover:bg-gray-300 rounded-full w-8 h-8 flex items-center justify-center"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v12M6 12h12" />
                                </svg>
                            </button>
                        </div>
                        
                        {/* Price Calculation */}
                        <div className="text-center mb-8">
                            <div className="text-sm text-gray-500">
                                Unit Price: ₱{useDatabaseMeals ? parseFloat(filipinoDishes[currentDishIndex]?.price || 120).toFixed(2) : "120.00"}
                            </div>
                            <div className="text-xl font-bold text-red-600">
                                Total: ₱{(useDatabaseMeals 
                                    ? parseFloat(filipinoDishes[currentDishIndex]?.price || 120) * mealQuantity 
                                    : 120 * mealQuantity
                                ).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                            </div>
                            
                            {/* Debug info removed */}
                        </div>
                        
                        {/* Customer Information Form */}
                        <div className="border-t pt-6 mb-6">
                            <h3 className="text-lg font-medium text-gray-900 mb-4">Customer Information</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Name field */}
                                <div>
                                    <label htmlFor="single-name" className="block text-sm font-medium text-gray-700 mb-1">
                                        Name
                                    </label>
                                    <input
                                        type="text"
                                        id="single-name"
                                        name="name"
                                        value={customerInfo.name}
                                        onChange={handleCustomerInfoChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                    />
                                </div>
                                
                                {/* Email field */}
                                <div>
                                    <label htmlFor="single-email" className="block text-sm font-medium text-gray-700 mb-1">
                                        Email
                                    </label>
                                    <input
                                        type="email"
                                        id="single-email"
                                        name="email"
                                        value={customerInfo.email}
                                        onChange={handleCustomerInfoChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                    />
                                </div>
                                
                                {/* Phone number field */}
                                <div>
                                    <label htmlFor="single-phone" className="block text-sm font-medium text-gray-700 mb-1">
                                        Phone Number
                                    </label>
                                    <input
                                        type="tel"
                                        id="single-phone"
                                        name="phone"
                                        value={customerInfo.phone}
                                        onChange={handleCustomerInfoChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                        placeholder="e.g., 0917 123 4567"
                                    />
                                </div>
                                
                                {/* Address field */}
                                <div>
                                    <label htmlFor="single-address" className="block text-sm font-medium text-gray-700 mb-1">
                                        Delivery Address <span className="text-red-600">*</span>
                                    </label>
                                    <input
                                        type="text"
                                        id="single-address"
                                        name="address"
                                        value={customerInfo.address}
                                        onChange={handleCustomerInfoChange}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                        required
                                        placeholder="Enter your complete delivery address"
                                    />
                                </div>
                                
                                {/* Delivery Date field */}
                                <div>
                                    <label htmlFor="single-deliveryDate" className="block text-sm font-medium text-gray-700 mb-1">
                                        Delivery Date <span className="text-red-600">*</span>
                                    </label>
                                    <input
                                        type="date"
                                        id="single-deliveryDate"
                                        name="deliveryDate"
                                        value={customerInfo.deliveryDate}
                                        onChange={handleCustomerInfoChange}
                                        min={getTomorrowDate()} // Can't select dates before tomorrow
                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                        required
                                    />
                                    <p className="text-xs text-gray-500 mt-1">Orders must be placed at least 1 day in advance</p>
                                </div>
                            </div>
                        </div>
                        
                        <div className="border-t pt-4 flex justify-end">
                            <button
                                onClick={() => setShowSingleMealModal(false)}
                                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 mr-2 hover:bg-gray-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmSingleMealSelection}
                                disabled={
                                    !customerInfo.address || 
                                    !customerInfo.deliveryDate || 
                                    (useDatabaseMeals && filipinoDishes[currentDishIndex].is_available === false)
                                }
                                className={`px-4 py-2 rounded-md text-white ${
                                    (customerInfo.address && 
                                     customerInfo.deliveryDate && 
                                     !(useDatabaseMeals && filipinoDishes[currentDishIndex].is_available === false))
                                        ? 'bg-red-600 hover:bg-red-700' 
                                        : 'bg-gray-400 cursor-not-allowed'
                                }`}
                            >
                                {isSubmitting 
                                    ? 'Placing Order...' 
                                    : (useDatabaseMeals && filipinoDishes[currentDishIndex].is_available === false)
                                        ? 'Meal Not Available'
                                        : 'Place Order'
                                }
                            </button>
                        </div>
                    </div>
                </div>
            )}
            
            {/* Filipino Fiesta Package Modal */}
            {showFiestaModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-2xl font-bold text-gray-800">Filipino Fiesta Package</h2>
                            <button 
                                onClick={() => setShowFiestaModal(false)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {!selectedSet ? (
                            <div className="mb-6">
                                <h3 className="text-lg font-medium text-gray-900 mb-3">Select your preferred set:</h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <div 
                                        className="border border-gray-200 rounded-lg p-4 hover:border-red-500 hover:bg-red-50 cursor-pointer transition-colors"
                                        onClick={() => selectSet('A')}
                                    >
                                        <div className="font-bold text-xl mb-2">Set A - ₱14,999</div>
                                        <div className="text-gray-700 mb-3">
                                            <span className="font-semibold">Main: Whole Lechon</span>
                                        </div>
                                        <ul className="text-sm text-gray-600 list-disc list-inside space-y-1 mb-3">
                                            <li>Choose 5 Filipino dishes</li>
                                            <li>Choose 2 desserts</li>
                                            <li>Good for 15-30 pax</li>
                                        </ul>
                                        <div className="mt-4 text-center">
                                            <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                                                Select Set A
                                            </button>
                                        </div>
                                    </div>
                                    
                                    <div 
                                        className="border border-gray-200 rounded-lg p-4 hover:border-red-500 hover:bg-red-50 cursor-pointer transition-colors"
                                        onClick={() => selectSet('B')}
                                    >
                                        <div className="font-bold text-xl mb-2">Set B - ₱10,999</div>
                                        <div className="text-gray-700 mb-3">
                                            <span className="font-semibold">Main: Lechon Belly</span>
                                        </div>
                                        <ul className="text-sm text-gray-600 list-disc list-inside space-y-1 mb-3">
                                            <li>Choose 4 Filipino dishes</li>
                                            <li>Choose 1 dessert</li>
                                            <li>Good for 10-20 pax</li>
                                        </ul>
                                        <div className="mt-4 text-center">
                                            <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                                                Select Set B
                                            </button>
                                        </div>
                                    </div>
                                    
                                    <div 
                                        className="border border-gray-200 rounded-lg p-4 hover:border-red-500 hover:bg-red-50 cursor-pointer transition-colors"
                                        onClick={() => selectSet('C')}
                                    >
                                        <div className="font-bold text-xl mb-2">Set C - ₱8,999</div>
                                        <div className="text-gray-700 mb-3">
                                            <span className="font-semibold">Main: Crispy Pata</span>
                                        </div>
                                        <ul className="text-sm text-gray-600 list-disc list-inside space-y-1 mb-3">
                                            <li>Choose 4 Filipino dishes</li>
                                            <li>Choose 1 dessert</li>
                                            <li>Good for 10-15 pax</li>
                                        </ul>
                                        <div className="mt-4 text-center">
                                            <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                                                Select Set C
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <>
                                {/* Set selection summary */}
                                <div className="mb-4 flex justify-between items-center">
                                    <div>
                                        <h3 className="text-lg font-medium text-gray-900">
                                            Set {selectedSet} - {getMainFeaturedItem()}
                                        </h3>
                                        <p className="text-sm text-gray-500">
                                            {selectedSet === 'A' ? 'Good for 15-30 pax' : 
                                             selectedSet === 'B' ? 'Good for 10-20 pax' : 
                                                                  'Good for 10-15 pax'}
                                        </p>
                                    </div>
                                    <button 
                                        onClick={() => selectSet(null)} 
                                        className="text-sm text-red-600 hover:text-red-800"
                                    >
                                        Change Set
                                    </button>
                                </div>

                                {/* Dish Selection */}
                                <div className="mb-6">
                                    <div className="flex justify-between items-center mb-2">
                                        <h3 className="text-lg font-medium text-gray-900">Select Dishes</h3>
                                        <p className="text-sm font-medium text-gray-700">
                                            Selected: {selectedDishes.length}/{getMaxDishes()}
                                        </p>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
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
                                </div>

                                {/* Dessert Selection */}
                                <div className="mb-6">
                                    <div className="flex justify-between items-center mb-2">
                                        <h3 className="text-lg font-medium text-gray-900">Select Desserts</h3>
                                        <p className="text-sm font-medium text-gray-700">
                                            Selected: {selectedDesserts.length}/{getMaxDesserts()}
                                        </p>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
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
                                </div>

                                {/* Customer Information Form */}
                                <div className="border-t pt-6 mb-6">
                                    <h3 className="text-lg font-medium text-gray-900 mb-4">Customer Information</h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {/* Name field */}
                                        <div>
                                            <label htmlFor="fiesta-name" className="block text-sm font-medium text-gray-700 mb-1">
                                                Name
                                            </label>
                                            <input
                                                type="text"
                                                id="fiesta-name"
                                                name="name"
                                                value={customerInfo.name}
                                                onChange={handleCustomerInfoChange}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                            />
                                        </div>
                                        
                                        {/* Email field */}
                                        <div>
                                            <label htmlFor="fiesta-email" className="block text-sm font-medium text-gray-700 mb-1">
                                                Email
                                            </label>
                                            <input
                                                type="email"
                                                id="fiesta-email"
                                                name="email"
                                                value={customerInfo.email}
                                                onChange={handleCustomerInfoChange}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                            />
                                        </div>
                                        
                                        {/* Phone number field */}
                                        <div>
                                            <label htmlFor="fiesta-phone" className="block text-sm font-medium text-gray-700 mb-1">
                                                Phone Number
                                            </label>
                                            <input
                                                type="tel"
                                                id="fiesta-phone"
                                                name="phone"
                                                value={customerInfo.phone}
                                                onChange={handleCustomerInfoChange}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                                placeholder="e.g., 0917 123 4567"
                                            />
                                        </div>
                                        
                                        {/* Address field */}
                                        <div>
                                            <label htmlFor="fiesta-address" className="block text-sm font-medium text-gray-700 mb-1">
                                                Delivery Address <span className="text-red-600">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                id="fiesta-address"
                                                name="address"
                                                value={customerInfo.address}
                                                onChange={handleCustomerInfoChange}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                                required
                                                placeholder="Enter your complete delivery address"
                                            />
                                        </div>
                                        
                                        {/* Number of pax field - For Fiesta Package this is informational only */}
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Package Size
                                            </label>
                                            <div className="px-3 py-2 border border-gray-300 bg-gray-50 rounded-md text-gray-700 font-medium">
                                                {selectedSet === 'A' ? 'Good for 15-30 people' : 
                                                 selectedSet === 'B' ? 'Good for 10-20 people' : 
                                                                      'Good for 10-15 people'}
                                            </div>
                                            <p className="text-xs text-gray-500 mt-1">
                                                Fiesta packages have pre-defined serving sizes
                                            </p>
                                        </div>
                                        
                                        {/* Delivery Date field */}
                                        <div>
                                            <label htmlFor="fiesta-deliveryDate" className="block text-sm font-medium text-gray-700 mb-1">
                                                Delivery Date <span className="text-red-600">*</span>
                                            </label>
                                            <input
                                                type="date"
                                                id="fiesta-deliveryDate"
                                                name="deliveryDate"
                                                value={customerInfo.deliveryDate}
                                                onChange={handleCustomerInfoChange}
                                                min={getTomorrowDate()} // Can't select dates before tomorrow
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                                required
                                            />
                                            <p className="text-xs text-gray-500 mt-1">Orders must be placed at least 1 day in advance</p>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="border-t pt-4 flex justify-end">
                                    <button
                                        onClick={() => setShowFiestaModal(false)}
                                        className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 mr-2 hover:bg-gray-50"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={confirmFiestaSelection}
                                        disabled={
                                            selectedDishes.length !== getMaxDishes() || 
                                            selectedDesserts.length !== getMaxDesserts() || 
                                            !customerInfo.address || 
                                            !customerInfo.deliveryDate
                                        }
                                        className={`px-4 py-2 rounded-md text-white ${
                                            (selectedDishes.length === getMaxDishes() && 
                                             selectedDesserts.length === getMaxDesserts() &&
                                             customerInfo.address && 
                                             customerInfo.deliveryDate)
                                                ? 'bg-red-600 hover:bg-red-700' 
                                                : 'bg-gray-400 cursor-not-allowed'
                                        }`}
                                    >
                                        {isSubmitting ? 'Placing Order...' : 'Place Order'}
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
            {notification.visible && (
                <Notification
                    message={notification.message}
                    type={notification.type}
                    onClose={() => setNotification({ ...notification, visible: false })}
                />
            )}
        </AuthenticatedLayout>
    );
}