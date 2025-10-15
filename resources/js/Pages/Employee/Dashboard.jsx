import { Head } from '@inertiajs/react';
import EmployeeLayout from '@/Layouts/EmployeeLayout';

export default function EmployeeDashboard({ userCounts, mealCounts, rawMaterialCounts }) {
    return (
        <EmployeeLayout title="Employee Dashboard">
            <Head title="Employee Dashboard" />
            
            <div className="space-y-6">
                <div className="bg-white shadow rounded-lg p-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Welcome to Employee Dashboard</h2>
                    <p className="text-gray-600">
                        You are logged in as an employee. Use the sidebar to navigate to different functions.
                    </p>
                </div>

                {/* Users Section */}
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Users Overview</h3>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="bg-white shadow rounded-lg p-6">
                            <h4 className="text-lg font-semibold text-gray-900 mb-2">Total Users</h4>
                            <p className="text-3xl font-bold text-blue-600">{userCounts.total}</p>
                            <p className="text-sm text-gray-500">Registered users</p>
                        </div>
                        
                        <div className="bg-white shadow rounded-lg p-6">
                            <h4 className="text-lg font-semibold text-gray-900 mb-2">Admins</h4>
                            <p className="text-3xl font-bold text-red-600">{userCounts.admins}</p>
                            <p className="text-sm text-gray-500">Administrators</p>
                        </div>
                        
                        <div className="bg-white shadow rounded-lg p-6">
                            <h4 className="text-lg font-semibold text-gray-900 mb-2">Employees</h4>
                            <p className="text-3xl font-bold text-green-600">{userCounts.employees}</p>
                            <p className="text-sm text-gray-500">Active employees</p>
                        </div>
                        
                        <div className="bg-white shadow rounded-lg p-6">
                            <h4 className="text-lg font-semibold text-gray-900 mb-2">Customers</h4>
                            <p className="text-3xl font-bold text-purple-600">{userCounts.customers}</p>
                            <p className="text-sm text-gray-500">Active customers</p>
                        </div>
                    </div>
                </div>

                {/* Meals Section */}
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Meals Overview</h3>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="bg-white shadow rounded-lg p-6">
                            <h4 className="text-lg font-semibold text-gray-900 mb-2">Total Meals</h4>
                            <p className="text-3xl font-bold text-indigo-600">{mealCounts.total}</p>
                            <p className="text-sm text-gray-500">All meals</p>
                        </div>
                        
                        <div className="bg-white shadow rounded-lg p-6">
                            <h4 className="text-lg font-semibold text-gray-900 mb-2">Visible Meals</h4>
                            <p className="text-3xl font-bold text-blue-600">{mealCounts.visible}</p>
                            <p className="text-sm text-gray-500">Currently visible</p>
                        </div>
                        
                        <div className="bg-white shadow rounded-lg p-6">
                            <h4 className="text-lg font-semibold text-gray-900 mb-2">Available Meals</h4>
                            <p className="text-3xl font-bold text-green-600">{mealCounts.available}</p>
                            <p className="text-sm text-gray-500">Ready to serve</p>
                        </div>
                        
                        <div className="bg-white shadow rounded-lg p-6">
                            <h4 className="text-lg font-semibold text-gray-900 mb-2">Hidden Meals</h4>
                            <p className="text-3xl font-bold text-orange-600">{mealCounts.hidden}</p>
                            <p className="text-sm text-gray-500">Temporarily hidden</p>
                        </div>
                    </div>
                </div>

                {/* Raw Materials Section */}
                <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Raw Materials Overview</h3>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="bg-white shadow rounded-lg p-6">
                            <h4 className="text-lg font-semibold text-gray-900 mb-2">Total Materials</h4>
                            <p className="text-3xl font-bold text-cyan-600">{rawMaterialCounts.total}</p>
                            <p className="text-sm text-gray-500">All materials</p>
                        </div>
                        
                        <div className="bg-white shadow rounded-lg p-6">
                            <h4 className="text-lg font-semibold text-gray-900 mb-2">Visible Materials</h4>
                            <p className="text-3xl font-bold text-blue-600">{rawMaterialCounts.visible}</p>
                            <p className="text-sm text-gray-500">Currently visible</p>
                        </div>
                        
                        <div className="bg-white shadow rounded-lg p-6">
                            <h4 className="text-lg font-semibold text-gray-900 mb-2">Available Materials</h4>
                            <p className="text-3xl font-bold text-green-600">{rawMaterialCounts.available}</p>
                            <p className="text-sm text-gray-500">Ready to use</p>
                        </div>
                        
                        <div className="bg-white shadow rounded-lg p-6">
                            <h4 className="text-lg font-semibold text-gray-900 mb-2">Hidden Materials</h4>
                            <p className="text-3xl font-bold text-orange-600">{rawMaterialCounts.hidden}</p>
                            <p className="text-sm text-gray-500">Temporarily hidden</p>
                        </div>
                    </div>
                </div>
            </div>
        </EmployeeLayout>
    );
}
