import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router } from '@inertiajs/react';
import { useState } from 'react';

export default function Cart({ auth, cartItems, cartTotal, cartCount }) {
    const [selectedItems, setSelectedItems] = useState([]);

    const formatPrice = (price) => {
        return `₱${parseFloat(price).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    const handleRemoveItem = (id) => {
        if (confirm('Are you sure you want to remove this item from cart?')) {
            router.delete(route('cart.destroy', id));
        }
    };

    const handleSelectItem = (id) => {
        setSelectedItems(prev => {
            if (prev.includes(id)) {
                return prev.filter(itemId => itemId !== id);
            } else {
                return [...prev, id];
            }
        });
    };

    const handleSelectAll = () => {
        if (selectedItems.length === cartItems.length) {
            setSelectedItems([]);
        } else {
            setSelectedItems(cartItems.map(item => item.id));
        }
    };

    const calculateSelectedTotal = () => {
        return cartItems
            .filter(item => selectedItems.includes(item.id))
            .reduce((sum, item) => sum + parseFloat(item.total_amount), 0);
    };

    const handleCheckout = () => {
        if (selectedItems.length === 0) {
            alert('Please select at least one item to checkout');
            return;
        }

        const selectedTotal = calculateSelectedTotal();
        if (confirm(`Proceed to checkout with ${selectedItems.length} selected item(s) totaling ${formatPrice(selectedTotal)}?`)) {
            router.post(route('cart.checkout'), {
                selected_items: selectedItems
            });
        }
    };

    return (
        <AuthenticatedLayout
            auth={auth}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Shopping Cart</h2>}
        >
            <Head title="Shopping Cart" />

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            {!cartItems || cartItems.length === 0 ? (
                                <div className="text-center py-12">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-24 w-24 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                    <h3 className="mt-4 text-xl font-medium text-gray-600">Your cart is empty</h3>
                                    <p className="mt-2 text-gray-500">Add some items to your cart to get started!</p>
                                    <Link
                                        href={route('order')}
                                        className="mt-6 inline-flex items-center px-4 py-2 bg-red-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-red-700 focus:bg-red-700 active:bg-red-900 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition ease-in-out duration-150"
                                    >
                                        Browse Menu
                                    </Link>
                                </div>
                            ) : (
                                <>
                                    <div className="mb-6 flex justify-between items-center">
                                        <h3 className="text-lg font-semibold">Cart Items ({cartCount})</h3>
                                        <label className="flex items-center cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={selectedItems.length === cartItems.length}
                                                onChange={handleSelectAll}
                                                className="mr-2 h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                                            />
                                            <span className="text-sm font-medium text-gray-700">Select All</span>
                                        </label>
                                    </div>

                                    <div className="space-y-4">
                                        {cartItems.map((item) => (
                                            <div key={item.id} className={`border rounded-lg p-4 transition-shadow ${selectedItems.includes(item.id) ? 'border-red-500 bg-red-50' : 'hover:shadow-md'}`}>
                                                <div className="flex justify-between items-start">
                                                    <div className="flex items-start gap-3 flex-1">
                                                        <input
                                                            type="checkbox"
                                                            checked={selectedItems.includes(item.id)}
                                                            onChange={() => handleSelectItem(item.id)}
                                                            className="mt-1 h-5 w-5 text-red-600 focus:ring-red-500 border-gray-300 rounded"
                                                        />
                                                        <div className="flex-1">
                                                        <h4 className="text-lg font-semibold text-gray-900">
                                                            {item.package_name}
                                                            {item.package_set && (
                                                                <span className="ml-2 text-sm text-gray-500">
                                                                    (Set {item.package_set})
                                                                </span>
                                                            )}
                                                        </h4>
                                                        
                                                        {item.main_item && (
                                                            <p className="text-sm text-gray-600 mt-1">
                                                                <span className="font-medium">Main:</span> {item.main_item}
                                                            </p>
                                                        )}
                                                        
                                                        {item.selected_dishes && item.selected_dishes.length > 0 && (
                                                            <div className="mt-2">
                                                                <p className="text-sm font-medium text-gray-700">Dishes:</p>
                                                                <ul className="list-disc list-inside text-sm text-gray-600 ml-2">
                                                                    {item.selected_dishes.map((dish, index) => (
                                                                        <li key={index}>{dish}</li>
                                                                    ))}
                                                                </ul>
                                                            </div>
                                                        )}
                                                        
                                                        {item.selected_desserts && item.selected_desserts.length > 0 && (
                                                            <div className="mt-2">
                                                                <p className="text-sm font-medium text-gray-700">Desserts:</p>
                                                                <ul className="list-disc list-inside text-sm text-gray-600 ml-2">
                                                                    {item.selected_desserts.map((dessert, index) => (
                                                                        <li key={index}>{dessert}</li>
                                                                    ))}
                                                                </ul>
                                                            </div>
                                                        )}
                                                        
                                                        <div className="mt-3 text-sm text-gray-600">
                                                            <p><span className="font-medium">Delivery Date:</span> {new Date(item.delivery_date).toLocaleDateString('en-US', {
                                                                weekday: 'long',
                                                                year: 'numeric',
                                                                month: 'long',
                                                                day: 'numeric'
                                                            })}</p>
                                                            <p><span className="font-medium">Delivery Address:</span> {item.delivery_address}</p>
                                                            {item.number_of_pax > 1 && (
                                                                <p><span className="font-medium">Number of Pax:</span> {item.number_of_pax}</p>
                                                            )}
                                                            {item.notes && (
                                                                <p className="mt-1"><span className="font-medium">Note:</span> {item.notes}</p>
                                                            )}
                                                        </div>
                                                    </div>
                                                    
                                                    <div className="ml-4 text-right">
                                                        <p className="text-lg font-bold text-gray-900">{formatPrice(item.total_amount)}</p>
                                                        <div className="mt-2 flex flex-col gap-2">
                                                            <Link
                                                                href={route('cart.edit', item.id)}
                                                                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                                                            >
                                                                Edit
                                                            </Link>
                                                            <button
                                                                onClick={() => handleRemoveItem(item.id)}
                                                                className="text-red-600 hover:text-red-800 text-sm font-medium"
                                                            >
                                                                Remove
                                                            </button>
                                                        </div>
                                                    </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="mt-8 border-t pt-6">
                                        <div className="mb-6">
                                            <div className="flex justify-between items-center mb-2">
                                                <span className="text-sm text-gray-600">Cart Total:</span>
                                                <span className="text-sm font-medium text-gray-900">{formatPrice(cartTotal)}</span>
                                            </div>
                                            {selectedItems.length > 0 && (
                                                <div className="flex justify-between items-center">
                                                    <span className="text-xl font-semibold">Selected Total ({selectedItems.length} items):</span>
                                                    <span className="text-2xl font-bold text-red-600">{formatPrice(calculateSelectedTotal())}</span>
                                                </div>
                                            )}
                                        </div>
                                        
                                        <div className="flex justify-between gap-4">
                                            <Link
                                                href={route('order')}
                                                className="px-6 py-3 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 font-medium"
                                            >
                                                Continue Shopping
                                            </Link>
                                            <button
                                                onClick={handleCheckout}
                                                className="px-6 py-3 bg-red-600 text-white rounded-md hover:bg-red-700 font-medium"
                                            >
                                                Proceed to Checkout
                                            </button>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
