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
    const [showSalesReportModal, setShowSalesReportModal] = useState(false);
    const [showSetLimitModal, setShowSetLimitModal] = useState(false);
    const [salesReportFilter, setSalesReportFilter] = useState('all'); // 'all', 'completed', 'cancelled'
    const [fiestaPackageLimit, setFiestaPackageLimit] = useState(10);
    const [foodPaxLimit, setFoodPaxLimit] = useState(100);
    const [updatingOrder, setUpdatingOrder] = useState(null);
    const [selectedStatus, setSelectedStatus] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [successMessage, setSuccessMessage] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    
    // Load order limits when component mounts
    useEffect(() => {
        axios.get('/employee/order-limits')
            .then(response => {
                setFiestaPackageLimit(response.data.fiesta_limit);
                setFoodPaxLimit(response.data.pax_limit);
            })
            .catch(error => {
                console.error('Error loading order limits:', error);
            });
    }, []);

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
            // Format date as YYYY-MM-DD without timezone conversion
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(i).padStart(2, '0')}`;
            
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
        // Parse the date string manually to avoid timezone issues
        const [year, month, day] = dateString.split('-').map(Number);
        const date = new Date(year, month - 1, day);
        return date.toLocaleDateString(undefined, options);
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
            
            // Show success message from backend (includes customer notification info)
            const message = response.data.message || "Order status updated successfully";
            setSuccessMessage(message);
            
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
                                <div className="flex space-x-2 items-center">
                                    <button 
                                        onClick={() => setShowSetLimitModal(true)}
                                        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 font-medium flex items-center space-x-2"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        <span>Set Limit</span>
                                    </button>
                                    <button 
                                        onClick={() => setShowSalesReportModal(true)}
                                        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 font-medium flex items-center space-x-2"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                        <span>Sales Report</span>
                                    </button>
                                    <div className="h-8 w-px bg-gray-300"></div>
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

                            {/* Monthly Summary */}
                            {(() => {
                                const year = currentDate.getFullYear();
                                const month = currentDate.getMonth();
                                
                                // Filter orders for the current month
                                const monthlyOrders = orders.filter(order => {
                                    const orderDate = new Date(order.delivery_date);
                                    return orderDate.getFullYear() === year && orderDate.getMonth() === month;
                                });
                                
                                const totalMonthlyOrders = monthlyOrders.length;
                                const totalMonthlyPax = monthlyOrders.reduce((sum, order) => sum + (parseInt(order.number_of_pax) || 0), 0);
                                const totalMonthlyRevenue = monthlyOrders.reduce((sum, order) => sum + parseFloat(order.total_amount || 0), 0);
                                
                                return (
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-5 rounded-lg border-2 border-blue-200 shadow-md">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-sm text-blue-600 font-semibold uppercase tracking-wide">Monthly Orders</p>
                                                    <p className="text-4xl font-bold text-blue-900 mt-2">
                                                        {totalMonthlyOrders}
                                                    </p>
                                                    <p className="text-xs text-blue-600 mt-1">
                                                        {formatMonthYear(currentDate)}
                                                    </p>
                                                </div>
                                                <div className="bg-blue-200 p-4 rounded-full">
                                                    <svg className="w-10 h-10 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                                    </svg>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="bg-gradient-to-br from-green-50 to-green-100 p-5 rounded-lg border-2 border-green-200 shadow-md">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-sm text-green-600 font-semibold uppercase tracking-wide">Monthly Pax</p>
                                                    <p className="text-4xl font-bold text-green-900 mt-2">
                                                        {totalMonthlyPax}
                                                    </p>
                                                    <p className="text-xs text-green-600 mt-1">
                                                        Total people served
                                                    </p>
                                                </div>
                                                <div className="bg-green-200 p-4 rounded-full">
                                                    <svg className="w-10 h-10 text-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                                    </svg>
                                                </div>
                                            </div>
                                        </div>
                                        
                                        <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-5 rounded-lg border-2 border-purple-200 shadow-md">
                                            <div className="flex items-center justify-between">
                                                <div>
                                                    <p className="text-sm text-purple-600 font-semibold uppercase tracking-wide">Monthly Revenue</p>
                                                    <p className="text-4xl font-bold text-purple-900 mt-2">
                                                        ₱{totalMonthlyRevenue.toFixed(2)}
                                                    </p>
                                                    <p className="text-xs text-purple-600 mt-1">
                                                        Total earnings
                                                    </p>
                                                </div>
                                                <div className="bg-purple-200 p-4 rounded-full">
                                                    <svg className="w-10 h-10 text-purple-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })()}

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
                                                        </div>
                                                        {/* Display customer names */}
                                                        <div className="text-xs space-y-0.5 mt-1">
                                                            {day.orders.slice(0, 3).map((order, idx) => (
                                                                <div key={order.id} className="truncate text-gray-700">
                                                                    • {order.customer_name}
                                                                </div>
                                                            ))}
                                                            {day.orders.length > 3 && (
                                                                <div className="text-center mt-1 text-sm font-bold text-gray-600">
                                                                    • • •
                                                                </div>
                                                            )}
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
                                    
                                    {/* Summary Cards */}
                                    {selectedDate.orders && selectedDate.orders.length > 0 && (
                                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                                            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <p className="text-sm text-blue-600 font-medium">Total Orders</p>
                                                        <p className="text-3xl font-bold text-blue-900">
                                                            {selectedDate.orders.length}
                                                        </p>
                                                    </div>
                                                    <div className="bg-blue-200 p-3 rounded-full">
                                                        <svg className="w-8 h-8 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                                        </svg>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <p className="text-sm text-green-600 font-medium">Total Pax</p>
                                                        <p className="text-3xl font-bold text-green-900">
                                                            {selectedDate.orders.reduce((sum, order) => sum + (parseInt(order.number_of_pax) || 0), 0)}
                                                        </p>
                                                    </div>
                                                    <div className="bg-green-200 p-3 rounded-full">
                                                        <svg className="w-8 h-8 text-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                                        </svg>
                                                    </div>
                                                </div>
                                            </div>
                                            
                                            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg border border-purple-200">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <p className="text-sm text-purple-600 font-medium">Total Revenue</p>
                                                        <p className="text-3xl font-bold text-purple-900">
                                                            ₱{selectedDate.orders.reduce((sum, order) => sum + parseFloat(order.total_amount || 0), 0).toFixed(2)}
                                                        </p>
                                                    </div>
                                                    <div className="bg-purple-200 p-3 rounded-full">
                                                        <svg className="w-8 h-8 text-purple-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                        </svg>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    
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
                                        {viewingOrder.delivery_time && (
                                            <div className="flex justify-between">
                                                <span className="text-gray-500">Delivery Time:</span>
                                                <span className="font-medium">{viewingOrder.delivery_time}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                            
                            {/* Payment Information */}
                            <div className="mt-6 bg-gray-50 p-4 rounded-lg">
                                <h4 className="font-medium text-lg mb-4">Payment Information</h4>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-500">Payment Method:</span>
                                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                                            viewingOrder.payment_method === 'GCash' 
                                                ? 'bg-blue-100 text-blue-800' 
                                                : 'bg-green-100 text-green-800'
                                        }`}>
                                            {viewingOrder.payment_method || 'COD'}
                                        </span>
                                    </div>
                                    
                                    {viewingOrder.payment_method === 'GCash' && (
                                        <>
                                            {viewingOrder.gcash_number && (
                                                <div className="flex justify-between">
                                                    <span className="text-gray-500">GCash Number:</span>
                                                    <span className="font-medium">{viewingOrder.gcash_number}</span>
                                                </div>
                                            )}
                                            
                                            {viewingOrder.gcash_receipt && (
                                                <div className="mt-3">
                                                    <p className="text-gray-500 mb-2">Payment Receipt:</p>
                                                    <div className="border-2 border-gray-200 rounded-lg p-2 bg-white">
                                                        <img 
                                                            src={`/storage/${viewingOrder.gcash_receipt}`}
                                                            alt="GCash Payment Receipt"
                                                            className="w-full h-auto max-h-96 object-contain rounded cursor-pointer hover:opacity-90 transition-opacity"
                                                            onClick={() => window.open(`/storage/${viewingOrder.gcash_receipt}`, '_blank')}
                                                        />
                                                        <p className="text-xs text-gray-500 mt-2 text-center">Click image to view full size</p>
                                                    </div>
                                                </div>
                                            )}
                                        </>
                                    )}
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

            {/* Sales Report Modal */}
            {showSalesReportModal && (() => {
                const year = currentDate.getFullYear();
                const month = currentDate.getMonth();
                
                // Filter orders for the current month - only completed and cancelled
                const monthlyOrders = orders.filter(order => {
                    const orderDate = new Date(order.delivery_date);
                    const isCurrentMonth = orderDate.getFullYear() === year && orderDate.getMonth() === month;
                    const isCompletedOrCancelled = order.status === 'completed' || order.status === 'cancelled';
                    return isCurrentMonth && isCompletedOrCancelled;
                });

                // Apply filter
                const filteredOrders = salesReportFilter === 'all' 
                    ? monthlyOrders 
                    : monthlyOrders.filter(order => order.status === salesReportFilter);
                
                const totalOrders = filteredOrders.length;
                // Total revenue only counts completed orders
                const totalRevenue = monthlyOrders
                    .filter(order => order.status === 'completed')
                    .reduce((sum, order) => sum + parseFloat(order.total_amount || 0), 0);
                const totalPax = filteredOrders.reduce((sum, order) => sum + (parseInt(order.number_of_pax) || 0), 0);
                
                return (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                        <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden animate-fade-in-up">
                            {/* Modal Header */}
                            <div className="bg-gradient-to-r from-green-600 to-green-700 px-6 py-4 flex justify-between items-center">
                                <div className="flex items-center space-x-4">
                                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                    <div>
                                        <h2 className="text-2xl font-bold text-white">Sales Report</h2>
                                        <div className="flex items-center space-x-3 mt-1">
                                            <button
                                                onClick={goToPrevMonth}
                                                className="text-white hover:text-green-100 transition-colors p-1 hover:bg-green-600 rounded"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                                </svg>
                                            </button>
                                            <p className="text-green-100 text-sm font-medium min-w-[150px] text-center">{formatMonthYear(currentDate)}</p>
                                            <button
                                                onClick={goToNextMonth}
                                                className="text-white hover:text-green-100 transition-colors p-1 hover:bg-green-600 rounded"
                                            >
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                </svg>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => setShowSalesReportModal(false)}
                                    className="text-white hover:text-green-100 transition-colors"
                                >
                                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            {/* Filter Buttons */}
                            <div className="px-6 py-4 bg-gray-100 border-b">
                                <div className="flex items-center justify-between">
                                    <p className="text-sm text-gray-600 font-medium">Filter by Status:</p>
                                    <div className="flex space-x-2">
                                        <button
                                            onClick={() => setSalesReportFilter('all')}
                                            className={`px-4 py-2 rounded-md font-medium transition-colors ${
                                                salesReportFilter === 'all'
                                                    ? 'bg-blue-600 text-white'
                                                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                                            }`}
                                        >
                                            All ({monthlyOrders.length})
                                        </button>
                                        <button
                                            onClick={() => setSalesReportFilter('completed')}
                                            className={`px-4 py-2 rounded-md font-medium transition-colors ${
                                                salesReportFilter === 'completed'
                                                    ? 'bg-green-600 text-white'
                                                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                                            }`}
                                        >
                                            Completed ({monthlyOrders.filter(o => o.status === 'completed').length})
                                        </button>
                                        <button
                                            onClick={() => setSalesReportFilter('cancelled')}
                                            className={`px-4 py-2 rounded-md font-medium transition-colors ${
                                                salesReportFilter === 'cancelled'
                                                    ? 'bg-red-600 text-white'
                                                    : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-300'
                                            }`}
                                        >
                                            Cancelled ({monthlyOrders.filter(o => o.status === 'cancelled').length})
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Summary Cards */}
                            <div className="px-6 py-4 bg-gray-50 grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="bg-white p-4 rounded-lg border-2 border-blue-200 shadow">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-blue-600 font-semibold uppercase">Total Orders</p>
                                            <p className="text-3xl font-bold text-blue-900 mt-1">{totalOrders}</p>
                                        </div>
                                        <div className="bg-blue-100 p-3 rounded-full">
                                            <svg className="w-8 h-8 text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="bg-white p-4 rounded-lg border-2 border-green-200 shadow">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-green-600 font-semibold uppercase">Total Pax</p>
                                            <p className="text-3xl font-bold text-green-900 mt-1">{totalPax}</p>
                                        </div>
                                        <div className="bg-green-100 p-3 rounded-full">
                                            <svg className="w-8 h-8 text-green-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="bg-white p-4 rounded-lg border-2 border-purple-200 shadow">
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <p className="text-sm text-purple-600 font-semibold uppercase">Total Revenue</p>
                                            <p className="text-3xl font-bold text-purple-900 mt-1">₱{totalRevenue.toFixed(2)}</p>
                                        </div>
                                        <div className="bg-purple-100 p-3 rounded-full">
                                            <svg className="w-8 h-8 text-purple-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Best Seller Section */}
                            <div className="px-6 py-4 bg-white border-b">
                                <h3 className="text-lg font-semibold mb-4 text-gray-800 flex items-center">
                                    <svg className="w-6 h-6 mr-2 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
                                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                    </svg>
                                    Best Sellers
                                </h3>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    {(() => {
                                        // Calculate best sellers for completed orders only
                                        const completedOrders = monthlyOrders.filter(order => order.status === 'completed');
                                        
                                        // Filipino Fiesta Package - count dishes by set
                                        const fiestaPackages = completedOrders.filter(order => order.package_set);
                                        const fiestaSetCounts = {};
                                        fiestaPackages.forEach(order => {
                                            const set = order.package_set;
                                            fiestaSetCounts[set] = (fiestaSetCounts[set] || 0) + 1;
                                        });
                                        const topFiesta = Object.entries(fiestaSetCounts).sort((a, b) => b[1] - a[1])[0];
                                        
                                        // Single Meal - count by package name
                                        const singleMeals = completedOrders.filter(order => !order.package_set && order.package_name !== 'Food Pax');
                                        const singleMealCounts = {};
                                        singleMeals.forEach(order => {
                                            const name = order.package_name;
                                            singleMealCounts[name] = (singleMealCounts[name] || 0) + 1;
                                        });
                                        const topSingleMeal = Object.entries(singleMealCounts).sort((a, b) => b[1] - a[1])[0];
                                        
                                        // Food Pax - count dishes from selected_dishes
                                        const foodPaxOrders = completedOrders.filter(order => order.package_name === 'Food Pax');
                                        const dishCounts = {};
                                        foodPaxOrders.forEach(order => {
                                            try {
                                                const dishes = JSON.parse(order.selected_dishes || '[]');
                                                dishes.forEach(dish => {
                                                    if (dish.name) {
                                                        dishCounts[dish.name] = (dishCounts[dish.name] || 0) + 1;
                                                    }
                                                });
                                            } catch (e) {
                                                console.error('Error parsing dishes:', e);
                                            }
                                        });
                                        const topDish = Object.entries(dishCounts).sort((a, b) => b[1] - a[1])[0];
                                        
                                        return (
                                            <>
                                                {/* Filipino Fiesta Package */}
                                                <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-4 rounded-lg border border-orange-200">
                                                    <p className="text-sm font-semibold text-orange-700 uppercase mb-2">Filipino Fiesta Package</p>
                                                    {topFiesta ? (
                                                        <>
                                                            <p className="text-2xl font-bold text-orange-900">Set {topFiesta[0]}</p>
                                                            <p className="text-sm text-orange-600 mt-1">{topFiesta[1]} order{topFiesta[1] > 1 ? 's' : ''}</p>
                                                        </>
                                                    ) : (
                                                        <p className="text-sm text-gray-500">No orders yet</p>
                                                    )}
                                                </div>
                                                
                                                {/* Single Meal */}
                                                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border border-blue-200">
                                                    <p className="text-sm font-semibold text-blue-700 uppercase mb-2">Single Meal</p>
                                                    {topSingleMeal ? (
                                                        <>
                                                            <p className="text-lg font-bold text-blue-900">{topSingleMeal[0]}</p>
                                                            <p className="text-sm text-blue-600 mt-1">{topSingleMeal[1]} order{topSingleMeal[1] > 1 ? 's' : ''}</p>
                                                        </>
                                                    ) : (
                                                        <p className="text-sm text-gray-500">No orders yet</p>
                                                    )}
                                                </div>
                                                
                                                {/* Food Pax */}
                                                <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border border-green-200">
                                                    <p className="text-sm font-semibold text-green-700 uppercase mb-2">Food Pax - Most Popular Dish</p>
                                                    {topDish ? (
                                                        <>
                                                            <p className="text-lg font-bold text-green-900">{topDish[0]}</p>
                                                            <p className="text-sm text-green-600 mt-1">{topDish[1]} order{topDish[1] > 1 ? 's' : ''}</p>
                                                        </>
                                                    ) : (
                                                        <p className="text-sm text-gray-500">No orders yet</p>
                                                    )}
                                                </div>
                                            </>
                                        );
                                    })()}
                                </div>
                            </div>

                            {/* Orders List */}
                            <div className="px-6 py-4 overflow-y-auto max-h-[calc(90vh-520px)]">
                                <h3 className="text-lg font-semibold mb-4 text-gray-800">Orders List</h3>
                                {filteredOrders.length > 0 ? (
                                    <div className="bg-white shadow-md rounded-lg overflow-hidden">
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Order ID</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Package</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pax</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {filteredOrders.map((order) => (
                                                    <tr key={order.id} className="hover:bg-gray-50">
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">#{order.id}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{order.delivery_date}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{order.customer_name}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{order.package_name}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{order.number_of_pax}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">₱{parseFloat(order.total_amount).toFixed(2)}</td>
                                                        <td className="px-6 py-4 whitespace-nowrap">
                                                            <span className={`px-2 py-1 text-xs rounded-full ${
                                                                order.status === 'completed' ? 'bg-green-100 text-green-800' :
                                                                order.status === 'confirmed' ? 'bg-blue-100 text-blue-800' :
                                                                order.status === 'preparing' ? 'bg-yellow-100 text-yellow-800' :
                                                                order.status === 'out_for_delivery' ? 'bg-purple-100 text-purple-800' :
                                                                order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                                                'bg-gray-100 text-gray-800'
                                                            }`}>
                                                                {order.status.replace('_', ' ').toUpperCase()}
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <div className="text-center py-12 bg-gray-50 rounded-lg">
                                        <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                        <p className="text-gray-500 text-lg">No orders found for this month</p>
                                    </div>
                                )}
                            </div>

                            {/* Modal Footer */}
                            <div className="border-t px-6 py-4 flex justify-end space-x-3 bg-gray-50">
                                <button
                                    onClick={() => setShowSalesReportModal(false)}
                                    className="px-6 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors font-medium"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                );
            })()}

            {/* Set Limit Modal */}
            {showSetLimitModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-md w-full overflow-hidden animate-fade-in-up">
                        {/* Modal Header */}
                        <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex justify-between items-center">
                            <div className="flex items-center space-x-3">
                                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <div>
                                    <h2 className="text-2xl font-bold text-white">Set Order Limits</h2>
                                    <p className="text-blue-100 text-sm">Configure maximum orders and pax</p>
                                </div>
                            </div>
                            <button 
                                onClick={() => setShowSetLimitModal(false)}
                                className="text-white hover:text-blue-100 transition-colors"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>

                        {/* Modal Body */}
                        <div className="px-6 py-6 space-y-6">
                            {/* Filipino Fiesta Package Limit */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Filipino Fiesta Package - Order Limit
                                </label>
                                <p className="text-xs text-gray-500 mb-3">
                                    Maximum number of Filipino Fiesta package orders allowed per day
                                </p>
                                <div className="relative">
                                    <input
                                        type="number"
                                        min="1"
                                        value={fiestaPackageLimit}
                                        onChange={(e) => setFiestaPackageLimit(parseInt(e.target.value) || 0)}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg font-semibold"
                                        placeholder="Enter limit"
                                    />
                                    <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                                        orders
                                    </span>
                                </div>
                                <p className="text-xs text-gray-400 mt-2 italic">
                                    Example: If set to 10, only 10 Fiesta package orders can be placed per day
                                </p>
                            </div>

                            {/* Food Pax Limit */}
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Food Pax - Total Pax Limit
                                </label>
                                <p className="text-xs text-gray-500 mb-3">
                                    Maximum total number of people (pax) allowed across all food pax orders per day
                                </p>
                                <div className="relative">
                                    <input
                                        type="number"
                                        min="1"
                                        value={foodPaxLimit}
                                        onChange={(e) => setFoodPaxLimit(parseInt(e.target.value) || 0)}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-lg font-semibold"
                                        placeholder="Enter limit"
                                    />
                                    <span className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400">
                                        total pax
                                    </span>
                                </div>
                                <p className="text-xs text-gray-400 mt-2 italic">
                                    Example: If set to 100, the total pax across all orders cannot exceed 100 per day
                                </p>
                            </div>

                            {/* Info Box */}
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <div className="flex items-start space-x-3">
                                    <svg className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <div className="text-sm text-blue-800">
                                        <p className="font-semibold mb-1">How these limits work:</p>
                                        <ul className="list-disc list-inside space-y-1 mt-2">
                                            <li><strong>Fiesta Package:</strong> Limits the number of orders</li>
                                            <li><strong>Food Pax:</strong> Limits the total number of people served</li>
                                            <li>These limits are independent and calculated separately</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Modal Footer */}
                        <div className="border-t px-6 py-4 flex justify-end space-x-3 bg-gray-50">
                            <button
                                onClick={() => setShowSetLimitModal(false)}
                                className="px-6 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => {
                                    axios.post('/employee/order-limits', {
                                        fiesta_limit: fiestaPackageLimit,
                                        pax_limit: foodPaxLimit
                                    })
                                    .then(response => {
                                        setSuccessMessage('Order limits updated successfully!');
                                        setShowSetLimitModal(false);
                                    })
                                    .catch(error => {
                                        setErrorMessage('Failed to save order limits.');
                                        console.error('Error saving limits:', error);
                                    });
                                }}
                                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-medium"
                            >
                                Save Limits
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
