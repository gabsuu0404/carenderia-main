import { Head } from '@inertiajs/react';
import { useState } from 'react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';

export default function Order({ auth }) {
    const [selectedOption, setSelectedOption] = useState('All Occasions');

    const options = [
        'All Occasions',
        'Birthday Catering',
        'Holiday Parties',
        'Family Gatherings'
    ];
    
    const menuPackages = [
        {
            id: 1,
            name: 'Filipino Fiesta Package',
            description: 'Traditional Filipino dishes featuring lechon, pancit, and a variety of local favorites.',
            price: '₱1,299.99',
            image: '/images/menu/filipino-fiesta.jpg'
        },
        {
            id: 2,
            name: 'Seafood Special Package',
            description: 'Fresh seafood selection including grilled fish, shrimp, and squid dishes with side options.',
            price: '₱1,499.99',
            image: '/images/menu/seafood-special.jpg'
        },
        {
            id: 3,
            name: 'Vegetarian Delight Package',
            description: 'Healthy and flavorful vegetarian options with fresh local produce and tofu dishes.',
            price: '₱999.99',
            image: '/images/food1.jpg'
        },
        {
            id: 4,
            name: 'Mixed Grill Package',
            description: 'Assortment of grilled meats including pork BBQ, chicken inasal, and beef kebabs.',
            price: '₱1,399.99',
            image: '/images/menu/mixed-grill.jpg'
        },
        {
            id: 5,
            name: 'Dessert Package',
            description: 'Sweet treats featuring halo-halo, leche flan, cassava cake, and other Filipino desserts.',
            price: '₱799.99',
            image: '/images/menu/dessert-package.jpg'
        },
        {
            id: 6,
            name: 'Breakfast Package',
            description: 'Traditional Filipino breakfast with garlic rice, longganisa, tocino, eggs, and more.',
            price: '₱899.99',
            image: '/images/menu/breakfast-package.jpg'
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
                                        <button className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                                            Add to Cart
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}