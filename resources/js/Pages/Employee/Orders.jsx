import { useState, useEffect } from 'react';
import { Head } from '@inertiajs/react';
import axios from 'axios';
import EmployeeLayout from '@/Layouts/EmployeeLayout';
import Notification from '@/Components/Notification';

export default function Orders({ auth, orders = [] }) {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [hoveredDate, setHoveredDate] = useState(null);
    const [selectedDate, setSelectedDate] = useState(null);
    const [calendarData, setCalendarData] = useState([]);
    const [viewingOrder, setViewingOrder] = useState(null);
    const [showOrderModal, setShowOrderModal] = useState(false);
    const [showStatusModal, setShowStatusModal] = useState(false);
    const [updatingOrder, setUpdatingOrder] = useState(null);
    const [selectedStatus, setSelectedStatus] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    
    // Log orders on component mount for debugging
    useEffect(() => {
        console.log('Orders received:', orders);
        // Check if we have proper orders data
        if (orders && orders.length > 0) {
            console.log('First order:', orders[0]);
            console.log('Sample delivery date format:', orders[0].delivery_date);
        } else {
            console.log('No orders data received');
        }
    }, [orders]);

    // Helper function to get days in a month
    const getDaysInMonth = (year, month) => {
        return new Date(year, month + 1, 0).getDate();
    };

    // Generate calendar data when current date changes
    useEffect(() => {
        generateCalendarData();
    }, [currentDate, orders]);

    const generateCalendarData = () => {
        console.log('Generating calendar data...');
        console.log('Current date:', currentDate);
        console.log('Available orders:', orders);
        
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const daysInMonth = getDaysInMonth(year, month);
        
        // First day of the month (0 = Sunday, 1 = Monday, etc.)
        const firstDayOfMonth = new Date(year, month, 1).getDay();
        
        // Create blank spaces for days before the first of the month
        let days = Array(firstDayOfMonth).fill(null);
        
        // Add the actual days of the month
        for (let i = 1; i <= daysInMonth; i++) {
            const dayDate = new Date(year, month, i);
            const dateStr = dayDate.toISOString().split('T')[0]; // YYYY-MM-DD format
            
            // Find orders for this day
            const dayOrders = orders.filter(order => {
                // Log for debugging
                if (order.delivery_date === dateStr) {
                    console.log(`Match found for ${dateStr}: Order #${order.id}`);
                    return true;
                }
                // If no match, log a comparison for diagnosis (but only for a few days to avoid console spam)
                else if (i <= 3) {
                    console.log(`No match for: Date: ${dateStr}, Order date: ${order.delivery_date}, Order #${order.id}`);
                }
                return false;
            });
            
            console.log(`Date: ${dateStr}, Orders found: ${dayOrders.length}`);
            
            days.push({
                day: i,
                date: dateStr,
                orders: dayOrders,
                isToday: new Date().toDateString() === dayDate.toDateString()
            });
        }
        
        setCalendarData(days);
    };

    const goToPrevMonth = () => {
        setCurrentDate(prev => {
            const prevMonth = new Date(prev);
            prevMonth.setMonth(prev.getMonth() - 1);
            return prevMonth;
        });
    };

    const goToNextMonth = () => {
        setCurrentDate(prev => {
            const nextMonth = new Date(prev);
            nextMonth.setMonth(prev.getMonth() + 1);
            return nextMonth;
        });
    };

    const handleMouseEnter = (day) => {
        setHoveredDate(day);
    };

    const handleMouseLeave = () => {
        setHoveredDate(null);
    };
    
    const handleDateClick = (day) => {
        if (day) {
            setSelectedDate(day);
        }
    };

    const formatMonthYear = (date) => {
        return date.toLocaleString('default', { month: 'long', year: 'numeric' });
    };
    
    const formatDate = (dateString) => {
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
        return new Date(dateString).toLocaleDateString(undefined, options);
    };
    
    const handleViewOrder = (order) => {
        setViewingOrder(order);
        setShowOrderModal(true);
    };
    
    const closeOrderModal = () => {
        setShowOrderModal(false);
        setTimeout(() => setViewingOrder(null), 300); // Clear after animation
    };
    
    const handleUpdateStatus = (order) => {
        setUpdatingOrder(order);
        setSelectedStatus(order.status);
        setShowStatusModal(true);
    };
    
    const closeStatusModal = () => {
        setShowStatusModal(false);
        setTimeout(() => {
            setUpdatingOrder(null);
            setSelectedStatus('');
        }, 300);
    };
    
    const submitStatusUpdate = () => {
        if (!updatingOrder || !selectedStatus) return;
        
        console.log('Updating order status:', {
            orderId: updatingOrder.id,
            newStatus: selectedStatus
        });
        
        setIsSubmitting(true);
        
        // Get CSRF token
        const csrfToken = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '';
        console.log('CSRF Token:', csrfToken ? 'Found' : 'Not found');
        
        // Proceed with the actual update
        // Make the request
        axios.put(`/employee/orders/${updatingOrder.id}/status`, {
            status: selectedStatus
        }, {
            headers: {
                'X-CSRF-TOKEN': csrfToken,
                'X-Requested-With': 'XMLHttpRequest',
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            }
        })
        .then(response => {
            console.log('Status update response:', response.data);
            
            // Update the order in the local state
            const updatedOrders = orders.map(order => 
                order.id === updatingOrder.id ? {...order, status: selectedStatus} : order
            );
            
            // Update calendar data
            generateCalendarData();
            
            // If we're viewing this order, update the viewing order as well
            if (viewingOrder && viewingOrder.id === updatingOrder.id) {
                setViewingOrder({...viewingOrder, status: selectedStatus});
            }
            
            // Close the modal
            closeStatusModal();
            
            // Show success message with the Notification component
            setSuccessMessage("Order status updated successfully");
            
            // We don't need to reload the page immediately since we've already updated state
            setTimeout(() => {
                window.location.reload();
            }, 2000); // Give the user 2 seconds to see the notification before reload
        })
        .catch(error => {
            console.error('Status update failed:', error);
            
            // More detailed error information
            if (error.response) {
                // The request was made and the server responded with a status code
                // that falls out of the range of 2xx
                console.error('Error response data:', error.response.data);
                console.error('Error response status:', error.response.status);
                console.error('Error response headers:', error.response.headers);
                
                setErrorMessage(`Failed to update order status. Server responded with: ${error.response.status} - ${JSON.stringify(error.response.data)}`);
            } else if (error.request) {
                // The request was made but no response was received
                console.error('Error request:', error.request);
                setErrorMessage("Failed to update order status. No response received from server.");
            } else {
                // Something happened in setting up the request that triggered an Error
                console.error('Error message:', error.message);
                setErrorMessage(`Error: ${error.message}`);
            }
            
            // Close the modal after showing the error
            closeStatusModal();
        })
        .finally(() => {
            setIsSubmitting(false);
        });
    };

    return (
        <EmployeeLayout auth={auth}>
            <Head title="Order Management" />
            
            {successMessage && (
                <Notification 
                    message={successMessage} 
                    type="success" 
                    onClose={() => setSuccessMessage('')}
                />
            )}
            {errorMessage && (
                <Notification 
                    message={errorMessage} 
                    type="error" 
                    onClose={() => setErrorMessage('')}
                />
            )}

            <div className="py-12">
                <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 bg-white border-b border-gray-200">
                            <div className="mb-6 flex justify-between items-center">
                                <h1 className="text-2xl font-semibold text-gray-800">Order Management</h1>
                                <div className="flex space-x-2">
                                    <button 
                                        onClick={goToPrevMonth}
                                        className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
                                    >
                                        &lt; Previous
                                    </button>
                                    <span className="px-3 py-1 font-medium">
                                        {formatMonthYear(currentDate)}
                                    </span>
                                    <button 
                                        onClick={goToNextMonth}
                                        className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
                                    >
                                        Next &gt;
                                    </button>
                                </div>
                            </div>

                            {/* Calendar Grid */}
                            <div className="grid grid-cols-7 gap-2">
                                {/* Days of the week */}
                                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                                    <div key={day} className="text-center font-bold py-2 bg-gray-100">
                                        {day}
                                    </div>
                                ))}
                                
                                {/* Calendar days */}
                                {calendarData.map((day, index) => (
                                    <div 
                                        key={index} 
                                        className={`
                                            min-h-[100px] p-2 border relative 
                                            ${!day ? 'bg-gray-50' : 'bg-white'} 
                                            ${day?.isToday ? 'border-red-500 border-2' : ''}
                                            ${selectedDate === day ? 'bg-red-50 border-red-500' : ''}
                                            transition-transform duration-200
                                            ${hoveredDate === day ? 'transform scale-105 shadow-lg z-10' : ''}
                                            ${day ? 'cursor-pointer' : ''}
                                        `}
                                        onMouseEnter={() => day && handleMouseEnter(day)}
                                        onMouseLeave={handleMouseLeave}
                                        onClick={() => day && handleDateClick(day)}
                                    >
                                        {day && (
                                            <>
                                                <div className="font-medium">{day.day}</div>
                                                {day.orders && day.orders.length > 0 ? (
                                                    <div className="mt-1">
                                                        <div className="text-xs bg-red-100 p-1 mb-1 rounded">
                                                            <span className="font-bold">{day.orders.length} order{day.orders.length !== 1 ? 's' : ''}</span>
                                                            <div className="truncate">Click to view details</div>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="text-xs text-gray-400 mt-1">No orders</div>
                                                )}
                                            </>
                                        )}
                                    </div>
                                ))}
                            </div>
                            
                            {/* Order Details Section */}
                            {selectedDate && (
                                <div className="mt-8 border-t pt-6">
                                    <div className="flex justify-between items-center mb-4">
                                        <h2 className="text-xl font-semibold">
                                            Orders for {formatDate(selectedDate.date)}
                                        </h2>
                                        <span className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm">
                                            {selectedDate.orders?.length || 0} order{(selectedDate.orders?.length !== 1) ? 's' : ''}
                                        </span>
                                    </div>
                                    
                                    {selectedDate.orders && selectedDate.orders.length > 0 ? (
                                        <div className="bg-white shadow-md rounded-lg overflow-hidden">
                                            <table className="min-w-full divide-y divide-gray-200">
                                                <thead className="bg-gray-50">
                                                    <tr>
                                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                            Order ID
                                                        </th>
                                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                            Customer
                                                        </th>
                                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                            Package
                                                        </th>
                                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                            Pax
                                                        </th>
                                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                            Amount
                                                        </th>
                                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                            Status
                                                        </th>
                                                        <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                            Actions
                                                        </th>
                                                    </tr>
                                                </thead>
                                                <tbody className="bg-white divide-y divide-gray-200">
                                                    {selectedDate.orders.map((order) => (
                                                        <tr key={order.id}>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                                #{order.id}
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                                {order.customer_name}
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                                {order.package_name}
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                                {order.number_of_pax}
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                                ₱{parseFloat(order.total_amount).toFixed(2)}
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                                                    ${order.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : ''}
                                                                    ${order.status === 'confirmed' ? 'bg-blue-100 text-blue-800' : ''}
                                                                    ${order.status === 'completed' ? 'bg-green-100 text-green-800' : ''}
                                                                    ${order.status === 'cancelled' ? 'bg-gray-100 text-gray-800' : ''}
                                                                `}>
                                                                    {order.status}
                                                                </span>
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                                <button 
                                                                    onClick={() => handleViewOrder(order)} 
                                                                    className="text-indigo-600 hover:text-indigo-900 mr-2"
                                                                >
                                                                    View
                                                                </button>
                                                                <button 
                                                                    onClick={() => handleUpdateStatus(order)}
                                                                    className="text-green-600 hover:text-green-900"
                                                                >
                                                                    Update
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>
                                        </div>
                                    ) : (
                                        <div className="bg-white p-8 text-center rounded-lg shadow">
                                            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                            </svg>
                                            <h3 className="mt-2 text-sm font-medium text-gray-900">No orders</h3>
                                            <p className="mt-1 text-sm text-gray-500">
                                                No orders have been placed for this date.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            
            {/* Status Update Modal */}
            {showStatusModal && updatingOrder && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-lg max-w-md w-full animate-fade-in-up">
                        {/* Modal Header */}
                        <div className="flex justify-between items-center border-b px-6 py-4">
                            <h3 className="text-lg font-medium text-gray-900">Update Order Status</h3>
                            <button 
                                onClick={closeStatusModal}
                                className="text-gray-400 hover:text-gray-500 focus:outline-none"
                            >
                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        
                        {/* Modal Body */}
                        <div className="px-6 py-4">
                            <p className="mb-4 text-gray-600">
                                Update status for Order #{updatingOrder.id} placed by {updatingOrder.customer_name}
                            </p>
                            
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Current Status:
                                </label>
                                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full 
                                    ${updatingOrder.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : ''}
                                    ${updatingOrder.status === 'confirmed' ? 'bg-blue-100 text-blue-800' : ''}
                                    ${updatingOrder.status === 'completed' ? 'bg-green-100 text-green-800' : ''}
                                    ${updatingOrder.status === 'cancelled' ? 'bg-gray-100 text-gray-800' : ''}
                                `}>
                                    {updatingOrder.status}
                                </span>
                            </div>
                            
                            <div className="mb-4">
                                <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                                    New Status:
                                </label>
                                <select
                                    id="status"
                                    value={selectedStatus}
                                    onChange={(e) => setSelectedStatus(e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                >
                                    <option value="pending">Pending</option>
                                    <option value="confirmed">Confirmed</option>
                                    <option value="completed">Completed</option>
                                    <option value="cancelled">Cancelled</option>
                                </select>
                            </div>
                        </div>
                        
                        {/* Modal Footer */}
                        <div className="border-t px-6 py-4 flex justify-end space-x-3">
                            <button
                                onClick={closeStatusModal}
                                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={submitStatusUpdate}
                                disabled={isSubmitting}
                                className={`px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                            >
                                {isSubmitting ? 'Updating...' : 'Update Status'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
            
            {/* Order Detail Modal */}
            {showOrderModal && viewingOrder && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto animate-fade-in-up">
                        {/* Modal Header */}
                        <div className="flex justify-between items-center border-b px-6 py-4">
                            <h3 className="text-lg font-medium text-gray-900">Order #{viewingOrder.id} Details</h3>
                            <button 
                                onClick={closeOrderModal}
                                className="text-gray-400 hover:text-gray-500 focus:outline-none"
                            >
                                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                        
                        {/* Modal Body */}
                        <div className="px-6 py-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Order Summary */}
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <h4 className="font-medium text-lg mb-4">Order Summary</h4>
                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Order ID:</span>
                                            <span className="font-medium">#{viewingOrder.id}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Status:</span>
                                            <span className={`px-2 py-0.5 inline-flex text-xs leading-5 font-semibold rounded-full 
                                                ${viewingOrder.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : ''}
                                                ${viewingOrder.status === 'confirmed' ? 'bg-blue-100 text-blue-800' : ''}
                                                ${viewingOrder.status === 'completed' ? 'bg-green-100 text-green-800' : ''}
                                                ${viewingOrder.status === 'cancelled' ? 'bg-gray-100 text-gray-800' : ''}
                                            `}>
                                                {viewingOrder.status}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Date Created:</span>
                                            <span className="font-medium">
                                                {viewingOrder.created_at ? new Date(viewingOrder.created_at).toLocaleDateString() : new Date().toLocaleDateString()}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Delivery Date:</span>
                                            <span className="font-medium">{formatDate(viewingOrder.delivery_date)}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Package:</span>
                                            <span className="font-medium">{viewingOrder.package_name}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Number of Pax:</span>
                                            <span className="font-medium">{viewingOrder.number_of_pax}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Total Amount:</span>
                                            <span className="font-medium text-red-600">₱{parseFloat(viewingOrder.total_amount).toFixed(2)}</span>
                                        </div>
                                    </div>
                                </div>
                                
                                {/* Customer Information */}
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <h4 className="font-medium text-lg mb-4">Customer Information</h4>
                                    <div className="space-y-2">
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Name:</span>
                                            <span className="font-medium">{viewingOrder.customer_name}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Email:</span>
                                            <span className="font-medium break-all">{viewingOrder.customer_email || 'N/A'}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Phone:</span>
                                            <span className="font-medium">{viewingOrder.customer_phone || 'N/A'}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Delivery Address:</span>
                                            <span className="font-medium text-right break-words max-w-[200px]">{viewingOrder.delivery_address}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                            
                            {/* Selected Dishes */}
                            <div className="mt-6 bg-gray-50 p-4 rounded-lg">
                                <h4 className="font-medium text-lg mb-4">Selected Dishes</h4>
                                {viewingOrder.selected_dishes ? (
                                    <ul className="list-disc pl-5 space-y-1">
                                        {(() => {
                                            // Handle different formats of selected_dishes
                                            let dishes = viewingOrder.selected_dishes;
                                            
                                            // If it's a JSON string, parse it
                                            if (typeof dishes === 'string') {
                                                try {
                                                    dishes = JSON.parse(dishes);
                                                } catch (e) {
                                                    return <p className="text-gray-500 italic">Error parsing dish information</p>;
                                                }
                                            }
                                            
                                            // Handle array format
                                            if (Array.isArray(dishes)) {
                                                return dishes.map((dish, index) => (
                                                    <li key={index} className="text-gray-700">{dish}</li>
                                                ));
                                            }
                                            
                                            // Handle object format
                                            else if (typeof dishes === 'object' && dishes !== null) {
                                                return Object.values(dishes).map((dish, index) => (
                                                    <li key={index} className="text-gray-700">{dish}</li>
                                                ));
                                            }
                                            
                                            // Fallback
                                            return <p className="text-gray-500 italic">Dish information available but in unknown format</p>;
                                        })()}
                                    </ul>
                                ) : (
                                    <p className="text-gray-500 italic">No dish information available</p>
                                )}
                            </div>
                            
                            {/* Notes */}
                            <div className="mt-6 bg-gray-50 p-4 rounded-lg">
                                <h4 className="font-medium text-lg mb-4">Notes</h4>
                                <p className="text-gray-700">
                                    {viewingOrder.notes || 'No additional notes provided.'}
                                </p>
                            </div>
                        </div>
                        
                        {/* Modal Footer */}
                        <div className="border-t px-6 py-4 flex justify-end space-x-3">
                            <button
                                onClick={closeOrderModal}
                                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
                            >
                                Close
                            </button>
                            <button
                                onClick={() => handleUpdateStatus(viewingOrder)}
                                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                            >
                                Update Order Status
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </EmployeeLayout>
    );
    
    // Add CSS animation (using useEffect to avoid duplicate styles)
    useEffect(() => {
        if (typeof document !== 'undefined') {
            const existingStyle = document.getElementById('order-animations');
            if (!existingStyle) {
                const style = document.createElement('style');
                style.id = 'order-animations';
                style.innerHTML = `
                    @keyframes fade-in-up {
                        0% {
                            opacity: 0;
                            transform: translateY(20px);
                        }
                        100% {
                            opacity: 1;
                            transform: translateY(0);
                        }
                    }
                    .animate-fade-in-up {
                        animation: fade-in-up 0.3s ease-out;
                    }
                `;
                document.head.appendChild(style);
            }
        }
        
        return () => {
            if (typeof document !== 'undefined') {
                const style = document.getElementById('order-animations');
                if (style) {
                    style.remove();
                }
            }
        };
    }, []);
}
