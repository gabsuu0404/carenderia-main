import { useState } from 'react';
import { Head, Link, useForm } from '@inertiajs/react';
import EmployeeLayout from '@/Layouts/EmployeeLayout';
import Notification from '@/Components/Notification';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';

export default function RawMaterials({ materials, hiddenMaterials, success, error }) {
	const [showModal, setShowModal] = useState(false);
	const [editingMaterial, setEditingMaterial] = useState(null);
	const [showHideModal, setShowHideModal] = useState(null);

	const { data, setData, post, put, processing, errors, reset } = useForm({
		name: '',
		description: '',
		category: '',
		unit: '',
		unit_price: '',
		is_available: true,
	});

	const categories = [
		{ value: 'meat', label: 'Meat' },
		{ value: 'vegetables', label: 'Vegetables' },
		{ value: 'spices', label: 'Spices' },
		{ value: 'dairy', label: 'Dairy' },
		{ value: 'grains', label: 'Grains' },
		{ value: 'other', label: 'Other' },
	];

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
		setEditingMaterial(null);
		setShowModal(true);
	};

	const openEditModal = (material) => {
		setData({
			name: material.name,
			description: material.description || '',
			category: material.category,
			unit: material.unit,
			unit_price: material.unit_price,
			is_available: material.is_available,
		});
		setEditingMaterial(material);
		setShowModal(true);
	};

	const closeModal = () => {
		setShowModal(false);
		setEditingMaterial(null);
		reset();
	};

	const handleSubmit = (e) => {
		e.preventDefault();
		if (editingMaterial) {
			put(route('employee.raw-materials.update', editingMaterial.id), {
				onSuccess: () => closeModal(),
			});
		} else {
			post(route('employee.raw-materials.store'), {
				onSuccess: () => closeModal(),
			});
		}
	};

	const handleHide = (materialId) => {
		post(route('employee.raw-materials.hide', materialId), {
			onSuccess: () => setShowHideModal(null),
		});
	};

	const handleUnhide = (materialId) => {
		post(route('employee.raw-materials.unhide', materialId), {
			onSuccess: () => {},
		});
	};


	return (
		<EmployeeLayout title="Manage Raw Materials">
			<Head title="Manage Raw Materials" />
			
			{/* Notifications */}
			<Notification message={success} type="success" />
			<Notification message={error} type="error" />

			<div className="space-y-6">
				<div className="flex justify-between items-center">
					<h2 className="text-2xl font-bold text-gray-900">Raw Materials Management</h2>
					<PrimaryButton onClick={openCreateModal} className="bg-blue-600 hover:bg-blue-700">
						Add New Material
					</PrimaryButton>
				</div>

				{/* Visible Materials Table */}
				<div>
					<h3 className="text-lg font-semibold text-gray-900 mb-4">Visible Materials</h3>
					<div className="bg-white shadow rounded-lg overflow-hidden">
						<div className="overflow-x-auto">
							<table className="min-w-full divide-y divide-gray-200">
								<thead className="bg-gray-50">
									<tr>
															<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
															<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
															<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
															<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit</th>
															<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit Price (₱)</th>
															<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Value (₱)</th>
															<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
															<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
									</tr>
								</thead>
								<tbody className="bg-white divide-y divide-gray-200">
									{materials.map((material) => (
										<tr key={material.id} className="hover:bg-gray-50">
															<td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{material.name}</td>
															<td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">{material.description || '-'}</td>
															<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">{material.category}</td>
															<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{material.unit}</td>
															<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">₱{material.unit_price}</td>
															<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">₱{material.total_value}</td>
															<td className="px-6 py-4 whitespace-nowrap">
																<span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
																	material.is_available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
																}`}>
																	{material.is_available ? 'Available' : 'Unavailable'}
																</span>
															</td>
															<td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
												<button
													onClick={() => openEditModal(material)}
													className="text-blue-600 hover:text-blue-900"
												>
													Edit
												</button>
												<button
													onClick={() => setShowHideModal(material)}
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

				{/* Hidden Materials Table */}
				<div>
					<h3 className="text-lg font-semibold text-gray-900 mb-4">Hidden Materials</h3>
					<div className="bg-white shadow rounded-lg overflow-hidden">
						<div className="overflow-x-auto">
							<table className="min-w-full divide-y divide-gray-200">
								<thead className="bg-gray-50">
									<tr>
															<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
															<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
															<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
															<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit</th>
															<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit Price (₱)</th>
															<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Value (₱)</th>
															<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
															<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
									</tr>
								</thead>
								<tbody className="bg-white divide-y divide-gray-200">
									{hiddenMaterials.map((material) => (
										<tr key={material.id} className="hover:bg-gray-50 bg-gray-50">
															<td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{material.name}</td>
															<td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">{material.description || '-'}</td>
															<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 capitalize">{material.category}</td>
															<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{material.unit}</td>
															<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">₱{material.unit_price}</td>
															<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">₱{material.total_value}</td>
															<td className="px-6 py-4 whitespace-nowrap">
																<span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
																	material.is_available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
																}`}>
																	{material.is_available ? 'Available' : 'Unavailable'}
																</span>
															</td>
															<td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
												<button
													onClick={() => openEditModal(material)}
													className="text-blue-600 hover:text-blue-900"
												>
													Edit
												</button>
												<button
													onClick={() => handleUnhide(material.id)}
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
					<div className="relative top-10 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
						<div className="mt-3">
							<h3 className="text-lg font-medium text-gray-900 mb-4">
								{editingMaterial ? 'Edit Raw Material' : 'Add New Raw Material'}
							</h3>
							<form onSubmit={handleSubmit} className="space-y-4">
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<div>
										<TextInput
											id="name"
											type="text"
											placeholder="Material Name"
											value={data.name}
											onChange={(e) => setData('name', e.target.value)}
											className="w-full"
										/>
										<InputError message={errors.name} className="mt-2" />
									</div>

									<div>
										<select
											id="category"
											value={data.category}
											onChange={(e) => setData('category', e.target.value)}
											className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
										>
											<option value="">Select Category</option>
											{categories.map((cat) => (
												<option key={cat.value} value={cat.value}>{cat.label}</option>
											))}
										</select>
										<InputError message={errors.category} className="mt-2" />
									</div>
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

												<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
															id="unit_price"
															type="number"
															step="0.01"
															placeholder="Unit Price"
															value={data.unit_price}
															onChange={(e) => setData('unit_price', e.target.value)}
															className="w-full"
														/>
														<InputError message={errors.unit_price} className="mt-2" />
													</div>
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
										{editingMaterial ? 'Update' : 'Create'}
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
							<h3 className="text-lg font-medium text-gray-900 mb-4">Hide Raw Material</h3>
							<p className="text-sm text-gray-500 mb-6">
								Are you sure you want to hide "{showHideModal.name}"? This material will be moved to the hidden materials section.
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
