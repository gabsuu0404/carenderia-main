import { useState } from 'react';
import { Head, useForm } from '@inertiajs/react';
import EmployeeLayout from '@/Layouts/EmployeeLayout';
import Notification from '@/Components/Notification';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';

export default function Inventory({ ingredients = [], success, error }) {
	const [showModal, setShowModal] = useState(false);
	const [editingItem, setEditingItem] = useState(null);

	const { data, setData, post, put, processing, errors, reset } = useForm({
		name: '',
		quantity: '',
		unit: '',
		pax_capacity: '',
	});

	const units = [
		{ value: 'kg', label: 'Kilograms (kg)' },
		{ value: 'grams', label: 'Grams' },
		{ value: 'pieces', label: 'Pieces' },
		{ value: 'liters', label: 'Liters' },
		{ value: 'cups', label: 'Cups' },
		{ value: 'tablespoons', label: 'Tablespoons' },
	];

	const openCreateModal = () => {
		reset();
		setEditingItem(null);
		setShowModal(true);
	};

	const openEditModal = (ingredient) => {
		setData({
			name: ingredient.name,
			quantity: ingredient.quantity,
			unit: ingredient.unit,
			pax_capacity: ingredient.pax_capacity,
		});
		setEditingItem(ingredient);
		setShowModal(true);
	};

	const closeModal = () => {
		setShowModal(false);
		setEditingItem(null);
		reset();
	};

	const handleSubmit = (e) => {
		e.preventDefault();
		if (editingItem) {
			put(route('employee.inventory.update', editingItem.id), {
				onSuccess: () => closeModal(),
			});
		} else {
			post(route('employee.inventory.store'), {
				onSuccess: () => closeModal(),
			});
		}
	};

	return (
		<EmployeeLayout title="Manage Inventory">
			<Head title="Manage Inventory" />
			
			<Notification message={success} type="success" />
			<Notification message={error} type="error" />

			<div className="space-y-6">
				<div className="flex justify-between items-center">
					<h2 className="text-2xl font-bold text-gray-900">Inventory Management</h2>
					<PrimaryButton onClick={openCreateModal} className="bg-blue-600 hover:bg-blue-700">
						Add Ingredient
					</PrimaryButton>
				</div>

				{/* Inventory Table */}
				<div>
					<h3 className="text-lg font-semibold text-gray-900 mb-4">Ingredients List</h3>
					<div className="bg-white shadow rounded-lg overflow-hidden">
						<div className="overflow-x-auto">
							<table className="min-w-full divide-y divide-gray-200">
								<thead className="bg-gray-50">
									<tr>
										<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ingredient Name</th>
										<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
										<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Unit</th>
										<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Pax Capacity</th>
										<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
									</tr>
								</thead>
								<tbody className="bg-white divide-y divide-gray-200">
									{ingredients.map((ingredient) => (
										<tr key={ingredient.id} className="hover:bg-gray-50">
											<td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{ingredient.name}</td>
											<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{ingredient.quantity}</td>
											<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{ingredient.unit}</td>
											<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{ingredient.pax_capacity}</td>
											<td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
												<button onClick={() => openEditModal(ingredient)} className="text-blue-600 hover:text-blue-900">Edit</button>
											</td>
										</tr>
									))}
								</tbody>
							</table>
							{ingredients.length === 0 && (
								<p className="text-center text-gray-500 py-4">No ingredients found.</p>
							)}
						</div>
					</div>
				</div>
			</div>

			{/* Create/Edit Modal */}
			{showModal && (
				<div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
					<div className="relative top-20 mx-auto p-5 border w-full max-w-lg shadow-lg rounded-md bg-white">
						<div className="mt-3">
							<h3 className="text-lg font-medium text-gray-900 mb-4">
								{editingItem ? 'Edit Ingredient' : 'Add New Ingredient'}
							</h3>
							<form onSubmit={handleSubmit} className="space-y-4">
								<div>
									<TextInput
										id="name"
										type="text"
										placeholder="Ingredient Name"
										value={data.name}
										onChange={(e) => setData('name', e.target.value)}
										className="w-full"
									/>
									<InputError message={errors.name} className="mt-2" />
								</div>

								<div>
									<TextInput
										id="quantity"
										type="number"
										step="0.01"
										placeholder="Quantity"
										value={data.quantity}
										onChange={(e) => setData('quantity', e.target.value)}
										className="w-full"
									/>
									<InputError message={errors.quantity} className="mt-2" />
								</div>

								<div>
									<select
										id="unit"
										value={data.unit}
										onChange={(e) => setData('unit', e.target.value)}
										className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
									>
										<option value="">Select Unit</option>
										{units.map((unit) => (
											<option key={unit.value} value={unit.value}>{unit.label}</option>
										))}
									</select>
									<InputError message={errors.unit} className="mt-2" />
								</div>

								<div>
									<TextInput
										id="pax_capacity"
										type="number"
										step="1"
										placeholder="Pax Capacity"
										value={data.pax_capacity}
										onChange={(e) => setData('pax_capacity', e.target.value)}
										className="w-full"
									/>
									<InputError message={errors.pax_capacity} className="mt-2" />
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
										{editingItem ? 'Update' : 'Create'}
									</PrimaryButton>
								</div>
							</form>
						</div>
					</div>
				</div>
			)}
		</EmployeeLayout>
	);
}