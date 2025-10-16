import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, router, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import Notification from '@/Components/Notification';

export default function MyOrders({ auth, orders, pendingOrdersCount }) {
    const page = usePage();
    const flash = page.props.flash || {};
    const [selectedStatus, setSelectedStatus] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [notification, setNotification] = useState({
        message: flash.success || flash.error || '',
        type: flash.success ? 'success' : flash.error ? 'error' : null,
        visible: !!(flash.success || flash.error)
    });

    // Filter orders by status and search term
    const filteredOrders = (orders || []).filter(order => {
        const matchesStatus = selectedStatus === 'all' || order.status === selectedStatus;
        const matchesSearch = order.package_name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            (order.selected_dishes && order.selected_dishes.some(dish => 
                                dish.toLowerCase().includes(searchTerm.toLowerCase())
                            ));
        return matchesStatus && matchesSearch;
    });

    // Get status badge color
    const getStatusBadgeColor = (status) => {
        switch (status) {
            case 'pending':
                return 'bg-yellow-100 text-yellow-800';
            case 'confirmed':
                return 'bg-blue-100 text-blue-800';
            case 'completed':
                return 'bg-green-100 text-green-800';
            case 'cancelled':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    // Format price
    const formatPrice = (price) => {
        return `₱${parseFloat(price).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    return (
        <AuthenticatedLayout
            auth={auth}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">My Orders</h2>}
        >
            <Head title="My Orders" />
            
            {notification.visible && notification.message && (
                <Notification 
                    message={notification.message} 
                    type={notification.type || 'success'} 
                    onClose={() => setNotification({...notification, visible: false})} 
                />
            )}

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            {flash?.success && (
                                <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
                                    {flash.success}
                                </div>
                            )}
                            <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
                                <h3 className="text-lg font-semibold">Your Orders ({orders ? orders.length : 0})</h3>
                                <div className="flex flex-col sm:flex-row mt-4 sm:mt-0 w-full sm:w-auto">
                                    {/* Filter by Status */}
                                    <div className="mb-2 sm:mb-0 sm:mr-4">
                                        <select
                                            value={selectedStatus}
                                            onChange={(e) => setSelectedStatus(e.target.value)}
                                            className="border-gray-300 focus:border-red-500 focus:ring-red-500 rounded-md shadow-sm w-full"
                                        >
                                            <option value="all">All Orders</option>
                                            <option value="pending">Pending</option>
                                            <option value="confirmed">Confirmed</option>
                                            <option value="completed">Completed</option>
                                            <option value="cancelled">Cancelled</option>
                                        </select>
                                    </div>
                                    
                                    {/* Search */}
                                    <div className="relative">
                                        <input
                                            type="text"
                                            placeholder="Search orders..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="border-gray-300 focus:border-red-500 focus:ring-red-500 rounded-md shadow-sm w-full"
                                        />
                                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            {/* New Order Button */}
                            <div className="mb-6">
                                <Link
                                    href={route('order')}
                                    className="inline-flex items-center px-4 py-2 bg-red-600 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-red-700 focus:bg-red-700 active:bg-red-900 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition ease-in-out duration-150"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                    </svg>
                                    Place New Order
                                </Link>
                            </div>

                            {!orders || filteredOrders.length === 0 ? (
                                <div className="text-center py-8">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                                    </svg>
                                    <p className="mt-4 text-gray-600">No orders found. Start by placing your first order!</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Order Details
                                                </th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Status
                                                </th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Delivery
                                                </th>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Total
                                                </th>
                                                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Actions
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {filteredOrders.map((order) => (
                                                <tr key={order.id} className="hover:bg-gray-50">
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex flex-col">
                                                            <div className="font-medium text-gray-900">
                                                                {order.package_name}
                                                                {order.package_set && (
                                                                    <span className="ml-1 text-sm text-gray-500">
                                                                        (Set {order.package_set})
                                                                    </span>
                                                                )}
                                                            </div>
                                                            <div className="text-sm text-gray-500">
                                                                {order.selected_dishes && (
                                                                    <span>{order.selected_dishes.join(', ')}</span>
                                                                )}
                                                                {order.main_item && (
                                                                    <div className="text-xs font-medium text-gray-600">
                                                                        Main: {order.main_item}
                                                                    </div>
                                                                )}
                                                            </div>
                                                            <div className="text-xs text-gray-400 mt-1">
                                                                Ordered: {order.created_at}
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeColor(order.status)}`}>
                                                            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm text-gray-900">
                                                            {new Date(order.delivery_date).toLocaleDateString('en-US', {
                                                                weekday: 'short',
                                                                month: 'short',
                                                                day: 'numeric'
                                                            })}
                                                        </div>
                                                        <div className="text-xs text-gray-500">
                                                            {order.delivery_address}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="text-sm font-medium text-gray-900">
                                                            {formatPrice(order.total_amount)}
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                        {order.status === 'pending' && (
                                                            <>
                                                                <Link
                                                                    href={route('orders.edit', order.id)}
                                                                    className="text-red-600 hover:text-red-900 mr-4 inline-flex items-center"
                                                                >
                                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                                    </svg>
                                                                    Edit
                                                                </Link>
                                                                <button
                                                                    onClick={() => {
                                                                        if (confirm('Are you sure you want to cancel this order?')) {
                                                                            router.post(route('orders.cancel', order.id), {}, {
                                                                                onSuccess: () => {
                                                                                    setNotification({
                                                                                        message: 'Order cancelled successfully',
                                                                                        type: 'success',
                                                                                        visible: true
                                                                                    });
                                                                                },
                                                                                onError: (errors) => {
                                                                                    setNotification({
                                                                                        message: errors.message || 'Failed to cancel order',
                                                                                        type: 'error',
                                                                                        visible: true
                                                                                    });
                                                                                }
                                                                            });
                                                                        }
                                                                    }}
                                                                    className="text-gray-600 hover:text-gray-900 mr-4 inline-flex items-center"
                                                                >
                                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                                    </svg>
                                                                    Cancel
                                                                </button>
                                                            </>
                                                        )}
                                                        <button
                                                            onClick={() => {
                                                                const modal = document.getElementById(`order-details-${order.id}`);
                                                                modal.classList.remove('hidden');
                                                            }}
                                                            className="text-blue-600 hover:text-blue-900"
                                                        >
                                                            View Details
                                                        </button>
                                                        
                                                        {/* Modal for Order Details */}
                                                        <div id={`order-details-${order.id}`} className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center z-50 hidden">
                                                            <div className="bg-white rounded-lg p-6 max-w-md w-full">
                                                                <div className="flex justify-between items-center mb-4">
                                                                    <h3 className="text-xl font-bold text-gray-900">Order Details</h3>
                                                                    <button 
                                                                        onClick={() => {
                                                                            const modal = document.getElementById(`order-details-${order.id}`);
                                                                            modal.classList.add('hidden');
                                                                        }}
                                                                        className="text-gray-400 hover:text-gray-500 focus:outline-none"
                                                                    >
                                                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                                        </svg>
                                                                    </button>
                                                                </div>
                                                                <div className="border-t border-gray-200 pt-4">
                                                                    <div className="mb-4">
                                                                        <div className="font-medium">Order #{order.id}</div>
                                                                        <div className="text-sm text-gray-500">
                                                                            Placed on {order.created_at}
                                                                        </div>
                                                                        <div className="mt-1">
                                                                            <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeColor(order.status)}`}>
                                                                                {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                                                                            </span>
                                                                        </div>
                                                                    </div>
                                                                    
                                                                    <div className="mb-4">
                                                                        <div className="font-medium">Package</div>
                                                                        <div className="text-gray-800">
                                                                            {order.package_name}
                                                                            {order.package_set && (
                                                                                <span className="ml-1 text-sm text-gray-500">
                                                                                    (Set {order.package_set})
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                    </div>

                                                                    {order.main_item && (
                                                                        <div className="mb-4">
                                                                            <div className="font-medium">Main Item</div>
                                                                            <div className="text-gray-800">{order.main_item}</div>
                                                                        </div>
                                                                    )}
                                                                    
                                                                    {order.selected_dishes && order.selected_dishes.length > 0 && (
                                                                        <div className="mb-4">
                                                                            <div className="font-medium">Selected Dishes</div>
                                                                            <ul className="list-disc list-inside text-gray-800">
                                                                                {order.selected_dishes.map((dish, index) => (
                                                                                    <li key={index}>{dish}</li>
                                                                                ))}
                                                                            </ul>
                                                                        </div>
                                                                    )}
                                                                    
                                                                    {order.selected_desserts && order.selected_desserts.length > 0 && (
                                                                        <div className="mb-4">
                                                                            <div className="font-medium">Selected Desserts</div>
                                                                            <ul className="list-disc list-inside text-gray-800">
                                                                                {order.selected_desserts.map((dessert, index) => (
                                                                                    <li key={index}>{dessert}</li>
                                                                                ))}
                                                                            </ul>
                                                                        </div>
                                                                    )}
                                                                    
                                                                    <div className="mb-4">
                                                                        <div className="font-medium">Delivery Information</div>
                                                                        <div className="text-gray-800">
                                                                            <div>
                                                                                Date: {new Date(order.delivery_date).toLocaleDateString('en-US', {
                                                                                    weekday: 'long',
                                                                                    year: 'numeric',
                                                                                    month: 'long',
                                                                                    day: 'numeric'
                                                                                })}
                                                                            </div>
                                                                            <div>Address: {order.delivery_address}</div>
                                                                        </div>
                                                                    </div>
                                                                    
                                                                    <div className="mt-6 border-t border-gray-200 pt-4">
                                                                        <div className="flex justify-between font-bold">
                                                                            <div>Total Amount:</div>
                                                                            <div>{formatPrice(order.total_amount)}</div>
                                                                        </div>
                                                                    </div>
                                                                    
                                                                    <div className="mt-6 flex justify-end">
                                                                        <button
                                                                            onClick={() => {
                                                                                const modal = document.getElementById(`order-details-${order.id}`);
                                                                                modal.classList.add('hidden');
                                                                            }}
                                                                            className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded focus:outline-none"
                                                                        >
                                                                            Close
                                                                        </button>
                                                                        {order.status === 'pending' && (
                                                                            <>
                                                                                <button
                                                                                    onClick={() => {
                                                                                        if (confirm('Are you sure you want to cancel this order?')) {
                                                                                            const modal = document.getElementById(`order-details-${order.id}`);
                                                                                            modal.classList.add('hidden');
                                                                                            router.post(route('orders.cancel', order.id), {}, {
                                                                                                onSuccess: () => {
                                                                                                    setNotification({
                                                                                                        message: 'Order cancelled successfully',
                                                                                                        type: 'success',
                                                                                                        visible: true
                                                                                                    });
                                                                                                },
                                                                                                onError: (errors) => {
                                                                                                    setNotification({
                                                                                                        message: errors.message || 'Failed to cancel order',
                                                                                                        type: 'error',
                                                                                                        visible: true
                                                                                                    });
                                                                                                }
                                                                                            });
                                                                                        }
                                                                                    }}
                                                                                    className="ml-4 bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded focus:outline-none"
                                                                                >
                                                                                    Cancel Order
                                                                                </button>
                                                                                <Link
                                                                                    href={route('orders.edit', order.id)}
                                                                                    className="ml-4 bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded focus:outline-none flex items-center"
                                                                                >
                                                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                                                    </svg>
                                                                                    Edit Order
                                                                                </Link>
                                                                            </>
                                                                        )}
                                                                    </div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}