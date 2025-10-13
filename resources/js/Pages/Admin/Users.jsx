import { Head, Link, useForm } from '@inertiajs/react';
import AdminLayout from '@/Layouts/AdminLayout';
import Notification from '@/Components/Notification';
import { useState } from 'react';

export default function Users({ users, success, error, editingUser = null }) {
    const [showEditModal, setShowEditModal] = useState(!!editingUser);
    const [selectedUser, setSelectedUser] = useState(editingUser);

    const { data, setData, put, processing, errors, reset } = useForm({
        name: selectedUser?.name || '',
        email: selectedUser?.email || '',
        role: selectedUser?.role || 'customer',
        status: selectedUser?.status || 'active',
    });

    const handleEditClick = (user) => {
        setSelectedUser(user);
        setData({
            name: user.name,
            email: user.email,
            role: user.role,
            status: user.status,
        });
        setShowEditModal(true);
    };

    const handleCloseModal = () => {
        setShowEditModal(false);
        setSelectedUser(null);
        reset();
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        put(route('admin.users.update', selectedUser.id), {
            onSuccess: () => {
                handleCloseModal();
            },
        });
    };
	return (
		<AdminLayout title="Manage Users">
			<Head title="Manage Users" />
			
			{/* Success/Error Notifications */}
			<Notification message={success} type="success" />
			<Notification message={error} type="error" />
			<div className="bg-white shadow rounded">
				<div className="px-4 py-3 border-b">
					<h2 className="font-semibold text-lg text-gray-800">All User Details</h2>
				</div>
				<div className="overflow-x-auto">
					<table className="min-w-full divide-y divide-gray-200">
						<thead className="bg-gray-50">
							<tr>
								<th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Sno.</th>
								<th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Name</th>
								<th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Email</th>
								<th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Role</th>
								<th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Status</th>
								<th className="px-4 py-2 text-left text-xs font-medium text-gray-500">Reg. Date</th>
								<th className="px-4 py-2" />
							</tr>
						</thead>
						<tbody className="divide-y divide-gray-100">
							{users.map((user, idx) => (
								<tr key={user.id} className="hover:bg-gray-50">
									<td className="px-4 py-2 text-sm text-gray-700">{idx + 1}</td>
									<td className="px-4 py-2 text-sm text-gray-700">{user.name}</td>
									<td className="px-4 py-2 text-sm text-gray-700">{user.email}</td>
									<td className="px-4 py-2 text-sm text-gray-700">
										<span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
											user.role === 'admin' ? 'bg-red-100 text-red-800' :
											user.role === 'employee' ? 'bg-blue-100 text-blue-800' :
											'bg-green-100 text-green-800'
										}`}>
											{user.role}
										</span>
									</td>
									<td className="px-4 py-2 text-sm text-gray-700">
										<span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
											user.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
										}`}>
											{user.status}
										</span>
									</td>
									<td className="px-4 py-2 text-sm text-gray-700">{user.created_at}</td>
									<td className="px-4 py-2 text-sm text-right space-x-2">
										<button 
											onClick={() => handleEditClick(user)}
											className="inline-flex items-center px-2 py-1 text-xs rounded bg-blue-600 text-white hover:bg-blue-500"
										>
											Edit
										</button>
										{user.role !== 'admin' && (
											user.status === 'active' ? (
												<Link
													href={route('admin.users.block', user.id)}
													method="post"
													as="button"
													className="inline-flex items-center px-2 py-1 text-xs rounded bg-red-600 text-white hover:bg-red-500"
												>
													Block
												</Link>
											) : (
												<Link
													href={route('admin.users.unblock', user.id)}
													method="post"
													as="button"
													className="inline-flex items-center px-2 py-1 text-xs rounded bg-green-600 text-white hover:bg-green-500"
												>
													Unblock
												</Link>
											)
										)}
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</div>

			{/* Edit User Modal */}
			{showEditModal && (
				<div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
					<div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
						<div className="mt-3">
							<div className="flex items-center justify-between mb-4">
								<h3 className="text-lg font-medium text-gray-900">Edit User</h3>
								<button
									onClick={handleCloseModal}
									className="text-gray-400 hover:text-gray-600"
								>
									<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
									</svg>
								</button>
							</div>
							
							<form onSubmit={handleSubmit} className="space-y-4">
								<div>
									<label className="block text-sm font-medium text-gray-700">Name</label>
									<input
										type="text"
										value={data.name}
										onChange={(e) => setData('name', e.target.value)}
										className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
										required
									/>
									{errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
								</div>

								<div>
									<label className="block text-sm font-medium text-gray-700">Email</label>
									<input
										type="email"
										value={data.email}
										onChange={(e) => setData('email', e.target.value)}
										className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
										required
									/>
									{errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
								</div>

								<div>
									<label className="block text-sm font-medium text-gray-700">Role</label>
									<select
										value={data.role}
										onChange={(e) => setData('role', e.target.value)}
										className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
										required
									>
										<option value="customer">Customer</option>
										<option value="employee">Employee</option>
										<option value="admin">Admin</option>
									</select>
									{errors.role && <p className="text-red-500 text-xs mt-1">{errors.role}</p>}
								</div>

								<div>
									<label className="block text-sm font-medium text-gray-700">Status</label>
									<select
										value={data.status}
										onChange={(e) => setData('status', e.target.value)}
										className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
										required
									>
										<option value="active">Active</option>
										<option value="blocked">Blocked</option>
									</select>
									{errors.status && <p className="text-red-500 text-xs mt-1">{errors.status}</p>}
								</div>

								<div className="flex justify-end space-x-3 pt-4">
									<button
										type="button"
										onClick={handleCloseModal}
										className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
									>
										Cancel
									</button>
									<button
										type="submit"
										disabled={processing}
										className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50"
									>
										{processing ? 'Updating...' : 'Update User'}
									</button>
								</div>
							</form>
						</div>
					</div>
				</div>
			)}
		</AdminLayout>
	);
}


