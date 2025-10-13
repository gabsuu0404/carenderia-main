import { Head } from '@inertiajs/react';
import EmployeeLayout from '@/Layouts/EmployeeLayout';

export default function Users({ users }) {
	return (
		<EmployeeLayout title="View Users">
			<Head title="View Users" />
			
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
								</tr>
							))}
						</tbody>
					</table>
				</div>
			</div>
		</EmployeeLayout>
	);
}
