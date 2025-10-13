import { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import EmployeeLayout from '@/Layouts/EmployeeLayout';
import Notification from '@/Components/Notification';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';

export default function Meals({ meals, hiddenMeals, success, error }) {
	const [showModal, setShowModal] = useState(false);
	const [editingMeal, setEditingMeal] = useState(null);
	const [showHideModal, setShowHideModal] = useState(null);

	const { data, setData, post, put, delete: destroy, processing, errors, reset } = useForm({
		name: '',
		description: '',
		price: '',
		category: '',
		is_available: true,
	});

	const openCreateModal = () => {
		reset();
		setEditingMeal(null);
		setShowModal(true);
	};

	const openEditModal = (meal) => {
		setData({
			name: meal.name,
			description: meal.description || '',
			price: meal.price,
			category: meal.category || '',
			is_available: meal.is_available,
		});
		setEditingMeal(meal);
		setShowModal(true);
	};

	const closeModal = () => {
		setShowModal(false);
		setEditingMeal(null);
		reset();
	};

	const handleSubmit = (e) => {
		e.preventDefault();
		if (editingMeal) {
			put(route('employee.meals.update', editingMeal.id), {
				onSuccess: () => closeModal(),
			});
		} else {
			post(route('employee.meals.store'), {
				onSuccess: () => closeModal(),
			});
		}
	};

	const handleHide = (mealId) => {
		post(route('employee.meals.hide', mealId), {
			onSuccess: () => setShowHideModal(null),
		});
	};

	const handleUnhide = (mealId) => {
		post(route('employee.meals.unhide', mealId), {
			onSuccess: () => {},
		});
	};

	return (
		<EmployeeLayout title="Manage Meals">
			<Head title="Manage Meals" />
			
			{/* Notifications */}
			<Notification message={success} type="success" />
			<Notification message={error} type="error" />

			<div className="space-y-6">
				<div className="flex justify-between items-center">
					<h2 className="text-2xl font-bold text-gray-900">Meal Management</h2>
					<PrimaryButton onClick={openCreateModal} className="bg-blue-600 hover:bg-blue-700">
						Add New Meal
					</PrimaryButton>
				</div>

				{/* Visible Meals Table */}
				<div>
					<h3 className="text-lg font-semibold text-gray-900 mb-4">Visible Meals</h3>

				<div className="bg-white shadow rounded-lg overflow-hidden">
					<div className="overflow-x-auto">
						<table className="min-w-full divide-y divide-gray-200">
							<thead className="bg-gray-50">
								<tr>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price (₱)</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
								</tr>
							</thead>
							<tbody className="bg-white divide-y divide-gray-200">
								{meals.map((meal) => (
									<tr key={meal.id} className="hover:bg-gray-50">
										<td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{meal.name}</td>
										<td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">{meal.description}</td>
										<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">₱{meal.price}</td>
										<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{meal.category}</td>
										<td className="px-6 py-4 whitespace-nowrap">
											<span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
												meal.is_available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
											}`}>
												{meal.is_available ? 'Available' : 'Unavailable'}
											</span>
										</td>
										<td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
											<button
												onClick={() => openEditModal(meal)}
												className="text-blue-600 hover:text-blue-900"
											>
												Edit
											</button>
											<button
												onClick={() => setShowHideModal(meal)}
												className="text-orange-600 hover:text-orange-900"
											>
												Hide
											</button>
										</td>
									</tr>
								))}
							</tbody>
						</table>
					</div>
				</div>
				</div>

				{/* Hidden Meals Table */}
				<div>
					<h3 className="text-lg font-semibold text-gray-900 mb-4">Hidden Meals</h3>
					<div className="bg-white shadow rounded-lg overflow-hidden">
						<div className="overflow-x-auto">
							<table className="min-w-full divide-y divide-gray-200">
								<thead className="bg-gray-50">
									<tr>
										<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
										<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
										<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price (₱)</th>
										<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
										<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
										<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
									</tr>
								</thead>
								<tbody className="bg-white divide-y divide-gray-200">
									{hiddenMeals.map((meal) => (
										<tr key={meal.id} className="hover:bg-gray-50 bg-gray-50">
											<td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{meal.name}</td>
											<td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">{meal.description}</td>
											<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">₱{meal.price}</td>
											<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{meal.category}</td>
											<td className="px-6 py-4 whitespace-nowrap">
												<span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
													meal.is_available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
												}`}>
													{meal.is_available ? 'Available' : 'Unavailable'}
												</span>
											</td>
											<td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
												<button
													onClick={() => openEditModal(meal)}
													className="text-blue-600 hover:text-blue-900"
												>
													Edit
												</button>
												<button
													onClick={() => handleUnhide(meal.id)}
													className="text-green-600 hover:text-green-900"
												>
													Unhide
												</button>
											</td>
										</tr>
									))}
								</tbody>
							</table>
						</div>
					</div>
				</div>
			</div>

			{/* Create/Edit Modal */}
			{showModal && (
				<div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
					<div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
						<div className="mt-3">
							<h3 className="text-lg font-medium text-gray-900 mb-4">
								{editingMeal ? 'Edit Meal' : 'Add New Meal'}
							</h3>
							<form onSubmit={handleSubmit} className="space-y-4">
								<div>
									<TextInput
										id="name"
										type="text"
										placeholder="Meal Name"
										value={data.name}
										onChange={(e) => setData('name', e.target.value)}
										className="w-full"
									/>
									<InputError message={errors.name} className="mt-2" />
								</div>

								<div>
									<textarea
										id="description"
										placeholder="Description"
										value={data.description}
										onChange={(e) => setData('description', e.target.value)}
										className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
										rows="3"
									/>
									<InputError message={errors.description} className="mt-2" />
								</div>

								<div>
									<TextInput
										id="price"
										type="number"
										step="0.01"
										placeholder="Price"
										value={data.price}
										onChange={(e) => setData('price', e.target.value)}
										className="w-full"
									/>
									<InputError message={errors.price} className="mt-2" />
								</div>

								<div>
									<TextInput
										id="category"
										type="text"
										placeholder="Category"
										value={data.category}
										onChange={(e) => setData('category', e.target.value)}
										className="w-full"
									/>
									<InputError message={errors.category} className="mt-2" />
								</div>

								<div className="flex items-center">
									<input
										id="is_available"
										type="checkbox"
										checked={data.is_available}
										onChange={(e) => setData('is_available', e.target.checked)}
										className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
									/>
									<label htmlFor="is_available" className="ml-2 block text-sm text-gray-900">
										Available
									</label>
								</div>

								<div className="flex justify-end space-x-3">
									<button
										type="button"
										onClick={closeModal}
										className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
									>
										Cancel
									</button>
									<PrimaryButton type="submit" disabled={processing}>
										{editingMeal ? 'Update' : 'Create'}
									</PrimaryButton>
								</div>
							</form>
						</div>
					</div>
				</div>
			)}

			{/* Hide Confirmation Modal */}
			{showHideModal && (
				<div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
					<div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
						<div className="mt-3 text-center">
							<h3 className="text-lg font-medium text-gray-900 mb-4">Hide Meal</h3>
							<p className="text-sm text-gray-500 mb-6">
								Are you sure you want to hide "{showHideModal.name}"? This meal will be moved to the hidden meals section.
							</p>
							<div className="flex justify-center space-x-3">
								<button
									onClick={() => setShowHideModal(null)}
									className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
								>
									Cancel
								</button>
								<button
									onClick={() => handleHide(showHideModal.id)}
									className="px-4 py-2 text-sm font-medium text-white bg-orange-600 rounded-md hover:bg-orange-700"
								>
									Hide
								</button>
							</div>
						</div>
					</div>
				</div>
			)}
		</EmployeeLayout>
	);
}
