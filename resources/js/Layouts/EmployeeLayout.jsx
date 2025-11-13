import { useState } from 'react';
import { Link, usePage } from '@inertiajs/react';

export default function EmployeeLayout({ title = 'Employee', children }) {
	const [sidebarOpen, setSidebarOpen] = useState(false);
	const { auth } = usePage().props;

	return (
		<div className="min-h-screen bg-gray-100 flex">
			{/* Sidebar */}
			<div className={(sidebarOpen ? 'translate-x-0' : '-translate-x-full') + ' fixed z-30 inset-y-0 left-0 w-64 transition transform bg-blue-800 text-white md:translate-x-0 md:static md:inset-0'}>
				<div className="h-16 flex items-center justify-center border-b border-blue-700">
					<span className="text-lg font-semibold">Employee Dashboard</span>
				</div>
				<nav className="p-4 space-y-2">
					<Link href={route('employee.dashboard')} className="block px-3 py-2 rounded hover:bg-blue-700">Dashboard</Link>
					<Link href={route('employee.users')} className="block px-3 py-2 rounded hover:bg-blue-700">View Users</Link>
					<Link href={route('employee.meals')} className="block px-3 py-2 rounded hover:bg-blue-700">Manage Meals</Link>
					<Link href={route('employee.raw-materials')} className="block px-3 py-2 rounded hover:bg-blue-700">Raw Materials</Link>
				    <Link href={route('employee.inventory')} className="block px-3 py-2 rounded hover:bg-blue-700">Inventory</Link>
				    <Link href={route('employee.orders')} className="block px-3 py-2 rounded hover:bg-blue-700">Manage Orders</Link>
				</nav>
			</div>

			{/* Main content */}
			<div className="flex-1 flex flex-col">
				<header className="h-16 bg-white border-b border-gray-200 flex items-center px-4 md:px-6">
					<button onClick={() => setSidebarOpen((v) => !v)} className="md:hidden inline-flex items-center justify-center p-2 rounded text-gray-600 hover:bg-gray-100">
						<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
							<path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
						</svg>
					</button>
					<h1 className="ml-2 md:ml-0 text-xl font-semibold text-gray-800">{title}</h1>
					<div className="ml-auto flex items-center gap-4">
						<div className="flex items-center gap-2">
							<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5 text-gray-600">
								<path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
							</svg>
							<span className="text-sm font-medium text-gray-700">{auth?.user?.name || 'Employee'}</span>
						</div>
						<Link href={route('logout')} method="post" as="button" className="px-3 py-1.5 rounded bg-blue-800 text-white text-sm hover:bg-blue-700">Logout</Link>
					</div>
				</header>

				<main className="p-4 md:p-6">{children}</main>
			</div>
		</div>
	);
}
