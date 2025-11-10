import React, { useEffect, useState } from 'react';
import { Link } from '@inertiajs/react';
import axios from 'axios';

export default function CartIcon() {
    const [cartCount, setCartCount] = useState(0);

    useEffect(() => {
        // Fetch the user's cart count
        const fetchCartCount = async () => {
            try {
                const response = await axios.get(route('cart.count'), {
                    headers: {
                        'X-Requested-With': 'XMLHttpRequest',
                        'Accept': 'application/json',
                    }
                });
                
                if (response.data && response.data.count !== undefined) {
                    setCartCount(response.data.count);
                }
            } catch (error) {
                console.error('Error fetching cart count:', error);
            }
        };
        
        fetchCartCount();
        
        // Set up a timer to refresh the count every 10 seconds
        const timer = setInterval(fetchCartCount, 10000);
        
        return () => clearInterval(timer);
    }, []);
    
    return (
        <div className="relative">
            <Link 
                href={route('cart.index')} 
                className="flex items-center text-gray-500 hover:text-gray-700 transition-colors"
            >
                <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="h-6 w-6" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                >
                    <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                    />
                </svg>
                {cartCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-600 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                        {cartCount}
                    </span>
                )}
            </Link>
        </div>
    );
}