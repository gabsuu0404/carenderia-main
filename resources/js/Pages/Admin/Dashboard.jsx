import { Head } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';

export default function AdminDashboard({ userCounts }) {
    return (
        <AdminLayout title="Admin Dashboard">
            <Head title="Admin Dashboard" />
            
            <div className="space-y-6">
                <div className="bg-white shadow rounded-lg p-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Welcome to Admin Dashboard</h2>
                    <p className="text-gray-600">
                        You are logged in as an administrator. Use the sidebar to navigate to different admin functions.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <div className="bg-white shadow rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Total Users</h3>
                        <p className="text-3xl font-bold text-blue-600">{userCounts.total}</p>
                        <p className="text-sm text-gray-500">Registered users</p>
                    </div>
                    
                    <div className="bg-white shadow rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Admins</h3>
                        <p className="text-3xl font-bold text-red-600">{userCounts.admins}</p>
                        <p className="text-sm text-gray-500">Administrators</p>
                    </div>
                    
                    <div className="bg-white shadow rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Employees</h3>
                        <p className="text-3xl font-bold text-green-600">{userCounts.employees}</p>
                        <p className="text-sm text-gray-500">Active employees</p>
                    </div>
                    
                    <div className="bg-white shadow rounded-lg p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">Customers</h3>
                        <p className="text-3xl font-bold text-purple-600">{userCounts.customers}</p>
                        <p className="text-sm text-gray-500">Active customers</p>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
