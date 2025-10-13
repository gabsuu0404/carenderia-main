import { useState } from 'react';
import { Link } from '@inertiajs/react';

export default function AdminLayout({ title = 'Admin', children }) {
	const [sidebarOpen, setSidebarOpen] = useState(false);

	return (
		<div className="min-h-screen bg-gray-100 flex">
			{/* Sidebar */}
			<div className={(sidebarOpen ? 'translate-x-0' : '-translate-x-full') + ' fixed z-30 inset-y-0 left-0 w-64 transition transform bg-slate-800 text-white md:translate-x-0 md:static md:inset-0'}>
				<div className="h-16 flex items-center justify-center border-b border-slate-700">
					<span className="text-lg font-semibold">Admin Dashboard</span>
				</div>
				<nav className="p-4 space-y-2">
					<Link href={route('admin.dashboard')} className="block px-3 py-2 rounded hover:bg-slate-700">Dashboard</Link>
					<Link href={route('admin.users')} className="block px-3 py-2 rounded hover:bg-slate-700">Manage Users</Link>
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
					<div className="ml-auto">
						<Link href={route('logout')} method="post" as="button" className="px-3 py-1.5 rounded bg-slate-800 text-white text-sm hover:bg-slate-700">Logout</Link>
					</div>
				</header>

				<main className="p-4 md:p-6">{children}</main>
			</div>
		</div>
	);
}


