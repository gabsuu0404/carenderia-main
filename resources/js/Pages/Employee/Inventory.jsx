import { useState } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import EmployeeLayout from '@/Layouts/EmployeeLayout';
import Notification from '@/Components/Notification';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import InputError from '@/Components/InputError';

export default function Inventory({ ingredients = [], stockTransactions = [], success, error }) {
	const [showModal, setShowModal] = useState(false);
	const [editingItem, setEditingItem] = useState(null);
	const [showStockModal, setShowStockModal] = useState(false);
	const [stockAction, setStockAction] = useState(null); // 'in' or 'out' or 'history'
	const [stockInDate, setStockInDate] = useState('');
	const [stockInSupplier, setStockInSupplier] = useState('');
	const [selectedIngredients, setSelectedIngredients] = useState([]);
	const [stockInData, setStockInData] = useState({});
	const [stockOutDate, setStockOutDate] = useState('');
	const [stockOutData, setStockOutData] = useState({});
	const [selectedTransaction, setSelectedTransaction] = useState(null);
	const [isEditingTransaction, setIsEditingTransaction] = useState(false);
	const [editedTransactionItems, setEditedTransactionItems] = useState({});

	const { data, setData, post, put, processing, errors, reset } = useForm({
		name: '',
		unit: '',
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
			unit: ingredient.unit,
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
			// When editing, only send name and unit (not quantity)
			put(route('employee.inventory.update', editingItem.id), {
				data: {
					name: data.name,
					unit: data.unit,
				},
				onSuccess: () => closeModal(),
			});
		} else {
			post(route('employee.inventory.store'), {
				onSuccess: () => closeModal(),
			});
		}
	};

	const handleStockIn = () => {
		// Validate that all selected ingredients have quantity
		const ingredientsToStockIn = selectedIngredients
			.filter(id => stockInData[id]?.quantity)
			.map(id => ({
				id: id,
				quantity: parseFloat(stockInData[id].quantity),
				expiry_date: stockInData[id].expiry_date || null,
			}));

		if (ingredientsToStockIn.length === 0) {
			alert('Please enter quantities for the selected ingredients.');
			return;
		}

		if (!stockInDate) {
			alert('Please select a date for stock in.');
			return;
		}

		console.log('Sending stock in data:', {
			date: stockInDate,
			supplier: stockInSupplier,
			ingredients: ingredientsToStockIn,
		});

		// Use router.post instead of the useForm post
		router.post(route('employee.inventory.stock-in'), {
			date: stockInDate,
			supplier: stockInSupplier,
			ingredients: ingredientsToStockIn,
		}, {
			onSuccess: () => {
				console.log('Stock in successful!');
				// Reset the form
				setShowStockModal(false);
				setStockAction(null);
				setStockInDate('');
				setStockInSupplier('');
				setSelectedIngredients([]);
				setStockInData({});
			},
			onError: (errors) => {
				console.error('Stock in failed:', errors);
			},
		});
	};

	const handleStockOut = () => {
		// Validate that all selected ingredients have quantity
		const ingredientsToStockOut = selectedIngredients
			.filter(id => stockOutData[id]?.quantity)
			.map(id => ({
				id: id,
				quantity: parseFloat(stockOutData[id].quantity),
				reason: stockOutData[id].reason || null,
			}));

		if (ingredientsToStockOut.length === 0) {
			alert('Please enter quantities for the selected ingredients.');
			return;
		}

		if (!stockOutDate) {
			alert('Please select a date for stock out.');
			return;
		}

		console.log('Sending stock out data:', {
			date: stockOutDate,
			ingredients: ingredientsToStockOut,
		});

		// Use router.post for stock out
		router.post(route('employee.inventory.stock-out'), {
			date: stockOutDate,
			ingredients: ingredientsToStockOut,
		}, {
			onSuccess: () => {
				console.log('Stock out successful!');
				// Reset the form
				setShowStockModal(false);
				setStockAction(null);
				setStockOutDate('');
				setSelectedIngredients([]);
				setStockOutData({});
			},
			onError: (errors) => {
				console.error('Stock out failed:', errors);
			},
		});
	};

	const handleEditTransaction = () => {
		setIsEditingTransaction(true);
		// Initialize edited items with current values
		const initialData = {};
		selectedTransaction.items.forEach(item => {
			initialData[item.id] = {
				quantity: item.quantity,
				expiry_date: item.expiry_date || '',
				reason: item.reason || ''
			};
		});
		setEditedTransactionItems(initialData);
	};

	const handleSaveTransactionEdit = () => {
		const updatedItems = selectedTransaction.items.map(item => ({
			id: item.id,
			quantity: parseFloat(editedTransactionItems[item.id]?.quantity || item.quantity),
			expiry_date: selectedTransaction.type === 'in' ? (editedTransactionItems[item.id]?.expiry_date || item.expiry_date) : null,
			reason: selectedTransaction.type === 'out' ? (editedTransactionItems[item.id]?.reason || item.reason) : null,
		}));

		console.log('Saving transaction edit:', {
			transaction_id: selectedTransaction.id,
			items: updatedItems
		});

		router.put(route('employee.inventory.update-transaction', selectedTransaction.id), {
			items: updatedItems
		}, {
			onSuccess: () => {
				console.log('Transaction updated successfully!');
				setIsEditingTransaction(false);
				setSelectedTransaction(null);
				setEditedTransactionItems({});
			},
			onError: (errors) => {
				console.error('Transaction update failed:', errors);
				alert('Failed to update transaction. Please try again.');
			},
		});
	};

	const handleCancelEdit = () => {
		setIsEditingTransaction(false);
		setEditedTransactionItems({});
	};

	return (
		<EmployeeLayout title="Manage Inventory">
			<Head title="Manage Inventory" />
			
			<Notification message={success} type="success" />
			<Notification message={error} type="error" />

			<div className="space-y-6">
				<div className="flex justify-between items-center">
					<h2 className="text-2xl font-bold text-gray-900">Inventory Management</h2>
				<div className="flex gap-3">
					<button
						onClick={() => setShowStockModal(true)}
						className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-md shadow-sm transition-colors duration-200"
					>
						Manage Stock
					</button>
					<PrimaryButton onClick={openCreateModal} className="bg-blue-600 hover:bg-blue-700">
						Add Ingredient
					</PrimaryButton>
					</div>
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
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Expiry</th>
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
								</tr>
							</thead>
							<tbody className="bg-white divide-y divide-gray-200">
								{ingredients.map((ingredient) => {
									const daysUntilExpiry = ingredient.days_until_expiry;
									let expiryColor = 'text-gray-700';
									let expiryBg = '';
									
									if (daysUntilExpiry !== null) {
										if (daysUntilExpiry < 0) {
											expiryColor = 'text-red-700 font-bold';
											expiryBg = 'bg-red-50';
										} else if (daysUntilExpiry <= 3) {
											expiryColor = 'text-red-600 font-semibold';
											expiryBg = 'bg-red-50';
										} else if (daysUntilExpiry <= 7) {
											expiryColor = 'text-orange-600 font-semibold';
											expiryBg = 'bg-orange-50';
										} else if (daysUntilExpiry <= 14) {
											expiryColor = 'text-yellow-600';
											expiryBg = 'bg-yellow-50';
										}
									}

									return (
										<tr key={ingredient.id} className={`hover:bg-gray-50 ${expiryBg}`}>
											<td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{ingredient.name}</td>
											<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{ingredient.quantity}</td>
											<td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">{ingredient.unit}</td>
											<td className={`px-6 py-4 whitespace-nowrap text-sm ${expiryColor}`}>
												{ingredient.closest_expiry_date ? (
													<div>
														<div>{ingredient.closest_expiry_date}</div>
														<div className="text-xs font-semibold text-gray-600">
															{ingredient.expiring_quantity} {ingredient.unit} will expire
														</div>
														{daysUntilExpiry !== null && (
															<div className="text-xs">
																{daysUntilExpiry < 0 ? (
																	<span>Expired {Math.abs(daysUntilExpiry)} day(s) ago</span>
																) : daysUntilExpiry === 0 ? (
																	<span>Expires today!</span>
																) : (
																	<span>{daysUntilExpiry} day(s) left</span>
																)}
															</div>
														)}
													</div>
												) : (
													<span className="text-gray-400">No expiry set</span>
												)}
											</td>
											<td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
												<button onClick={() => openEditModal(ingredient)} className="text-blue-600 hover:text-blue-900">Edit</button>
											</td>
										</tr>
									);
								})}
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

								{editingItem ? null : (
									<div className="bg-blue-50 border border-blue-200 rounded-md p-3">
										<p className="text-xs text-blue-700">
											<strong>Note:</strong> New ingredients will start with 0 quantity. Use <strong>Stock In</strong> to add initial inventory.
										</p>
									</div>
								)}

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

			{/* Stock Management Modal */}
			{showStockModal && (
				<div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
					<div className="relative top-20 mx-auto p-5 border w-full max-w-2xl shadow-lg rounded-md bg-white">
						<div className="mt-3">
							<div className="flex justify-between items-center mb-6">
								<h3 className="text-xl font-bold text-gray-900">
									Manage Stock
								</h3>
								<button
									onClick={() => setShowStockModal(false)}
									className="text-gray-400 hover:text-gray-600"
								>
									<svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
									</svg>
								</button>
							</div>
						
						{/* Stock Management Options */}
						<div className="min-h-[400px] bg-gray-50 rounded-lg p-6 border-2 border-dashed border-gray-300">
							{!stockAction ? (
								<div className="space-y-4">
									<div className="flex items-center justify-center gap-4 mb-6">
										<button
											onClick={() => setStockAction('in')}
											className="px-8 py-4 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg shadow-md transition-colors duration-200 flex items-center gap-2"
										>
											<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
											</svg>
											Stock In
										</button>
										<button
											onClick={() => setStockAction('out')}
											className="px-8 py-4 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg shadow-md transition-colors duration-200 flex items-center gap-2"
										>
											<svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
											</svg>
											Stock Out
										</button>
									</div>

									{/* Transaction History */}
									<div className="bg-white rounded-lg p-4">
										<h4 className="text-lg font-semibold text-gray-900 mb-4">Transaction History</h4>
										<div className="max-h-[350px] overflow-y-auto space-y-2">
											{stockTransactions.length === 0 ? (
												<p className="text-center text-gray-500 py-4">No transactions yet.</p>
											) : (
												stockTransactions.map((transaction) => (
													<div
														key={transaction.id}
														onClick={() => setSelectedTransaction(transaction)}
														className="border rounded-lg p-3 hover:bg-gray-50 cursor-pointer transition-colors"
													>
														<div className="flex items-center justify-between">
															<div className="flex items-center gap-3">
																<div className={`w-10 h-10 rounded-full flex items-center justify-center ${
																	transaction.type === 'in' ? 'bg-green-100' : 'bg-red-100'
																}`}>
																	<svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
																		<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} 
																			d={transaction.type === 'in' ? "M12 4v16m8-8H4" : "M20 12H4"} 
																			className={transaction.type === 'in' ? 'text-green-600' : 'text-red-600'}
																		/>
																	</svg>
																</div>
																<div>
																	<p className="font-semibold text-gray-900">
																		Stock {transaction.type === 'in' ? 'In' : 'Out'}
																	</p>
																	<p className="text-xs text-gray-500">
																		{transaction.transaction_date} • {transaction.items_count} item(s)
																	</p>
																</div>
															</div>
															<div className="text-right">
																<p className="text-xs text-gray-500">{transaction.user_name}</p>
															</div>
														</div>
													</div>
												))
											)}
										</div>
									</div>
								</div>
							) : stockAction === 'in' ? (
								<div className="space-y-4">
									<h4 className="text-lg font-semibold text-gray-900 mb-4">Stock In Form</h4>
									
									<div>
										<label className="block text-sm font-medium text-gray-700 mb-1">
											Date
										</label>
										<TextInput
											type="date"
											value={stockInDate}
											onChange={(e) => setStockInDate(e.target.value)}
											className="w-full"
										/>
									</div>

									<div>
										<label className="block text-sm font-medium text-gray-700 mb-1">
											Supplier / Source
										</label>
										<TextInput
											type="text"
											value={stockInSupplier}
											onChange={(e) => setStockInSupplier(e.target.value)}
											placeholder="e.g., ABC Supplier, Local Market"
											className="w-full"
										/>
									</div>

									<div className="border-t pt-4">
										<h5 className="text-md font-semibold text-gray-800 mb-3">Select Ingredients to Stock In</h5>
										
										<div className="max-h-[400px] overflow-y-auto space-y-3">
											{ingredients.map((ingredient) => (
												<div key={ingredient.id} className="border rounded-lg p-3 bg-white">
													<div className="flex items-center mb-2">
														<input
															type="checkbox"
															id={`ingredient-${ingredient.id}`}
															checked={selectedIngredients.includes(ingredient.id)}
															onChange={(e) => {
																if (e.target.checked) {
																	setSelectedIngredients([...selectedIngredients, ingredient.id]);
																	setStockInData({
																		...stockInData,
																		[ingredient.id]: { quantity: '', expiry_date: '' }
																	});
																} else {
																	setSelectedIngredients(selectedIngredients.filter(id => id !== ingredient.id));
																	const newData = { ...stockInData };
																	delete newData[ingredient.id];
																	setStockInData(newData);
																}
															}}
															className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
														/>
														<label htmlFor={`ingredient-${ingredient.id}`} className="ml-3 text-sm font-semibold text-gray-900 cursor-pointer flex-1">
															{ingredient.name}
														</label>
														<span className="text-xs text-gray-500">
															Current: {ingredient.quantity} {ingredient.unit}
														</span>
													</div>

													{selectedIngredients.includes(ingredient.id) && (
														<div className="mt-3 pl-7 space-y-2 border-l-2 border-green-500">
															<div>
																<label className="block text-xs font-medium text-gray-700 mb-1">
																	In Quantity
																</label>
																<TextInput
																	type="number"
																	step="0.01"
																	min="0.01"
																	value={stockInData[ingredient.id]?.quantity || ''}
																	onChange={(e) => setStockInData({
																		...stockInData,
																		[ingredient.id]: {
																			...stockInData[ingredient.id],
																			quantity: e.target.value
																		}
																	})}
																	className="w-full"
																	placeholder={`Enter quantity in ${ingredient.unit}`}
																	required
																/>
															</div>
															<div>
																<label className="block text-xs font-medium text-gray-700 mb-1">
																	Expiry Date
																</label>
																<TextInput
																	type="date"
																	value={stockInData[ingredient.id]?.expiry_date || ''}
																	onChange={(e) => setStockInData({
																		...stockInData,
																		[ingredient.id]: {
																			...stockInData[ingredient.id],
																			expiry_date: e.target.value
																		}
																	})}
																	className="w-full"
																/>
															</div>
														</div>
													)}
												</div>
											))}
										</div>
									</div>

									<div className="flex gap-2 pt-4 border-t">
										<button
											onClick={() => {
												setStockAction(null);
												setStockInDate('');
												setStockInSupplier('');
												setSelectedIngredients([]);
												setStockInData({});
											}}
											className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
										>
											Back
										</button>
										<button
											onClick={handleStockIn}
											disabled={selectedIngredients.length === 0 || processing}
											className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
										>
											{processing ? 'Saving...' : `Save (${selectedIngredients.length} items)`}
										</button>
									</div>
								</div>
							) : stockAction === 'out' ? (
								<div className="space-y-4">
									<h4 className="text-lg font-semibold text-gray-900 mb-4">Stock Out Form</h4>
									
									<div>
										<label className="block text-sm font-medium text-gray-700 mb-1">
											Date
										</label>
										<TextInput
											type="date"
											value={stockOutDate}
											onChange={(e) => setStockOutDate(e.target.value)}
											className="w-full"
										/>
									</div>

									<div className="border-t pt-4">
										<h5 className="text-md font-semibold text-gray-800 mb-3">Select Ingredients to Stock Out</h5>
										
										<div className="max-h-[400px] overflow-y-auto space-y-3">
											{ingredients.map((ingredient) => (
												<div key={ingredient.id} className="border rounded-lg p-3 bg-white">
													<div className="flex items-center mb-2">
														<input
															type="checkbox"
															id={`ingredient-out-${ingredient.id}`}
															checked={selectedIngredients.includes(ingredient.id)}
															onChange={(e) => {
																if (e.target.checked) {
																	setSelectedIngredients([...selectedIngredients, ingredient.id]);
																	setStockOutData({
																		...stockOutData,
																		[ingredient.id]: { quantity: '', reason: '' }
																	});
																} else {
																	setSelectedIngredients(selectedIngredients.filter(id => id !== ingredient.id));
																	const newData = { ...stockOutData };
																	delete newData[ingredient.id];
																	setStockOutData(newData);
																}
															}}
															className="h-4 w-4 text-red-600 focus:ring-red-500 border-gray-300 rounded"
														/>
														<label htmlFor={`ingredient-out-${ingredient.id}`} className="ml-3 text-sm font-semibold text-gray-900 cursor-pointer flex-1">
															{ingredient.name}
														</label>
														<span className="text-xs text-gray-500">
															Current: {ingredient.quantity} {ingredient.unit}
														</span>
													</div>

													{selectedIngredients.includes(ingredient.id) && (
														<div className="mt-3 pl-7 space-y-2 border-l-2 border-red-500">
															<div>
																<label className="block text-xs font-medium text-gray-700 mb-1">
																	Out Quantity
																</label>
																<TextInput
																	type="number"
																	step="0.01"
																	min="0.01"
																	max={ingredient.quantity}
																	value={stockOutData[ingredient.id]?.quantity || ''}
																	onChange={(e) => setStockOutData({
																		...stockOutData,
																		[ingredient.id]: {
																			...stockOutData[ingredient.id],
																			quantity: e.target.value
																		}
																	})}
																	className="w-full"
																	placeholder={`Enter quantity in ${ingredient.unit}`}
																	required
																/>
																{stockOutData[ingredient.id]?.quantity && parseFloat(stockOutData[ingredient.id].quantity) > ingredient.quantity && (
																	<p className="mt-1 text-xs text-red-600">
																		Cannot exceed current quantity ({ingredient.quantity} {ingredient.unit})
																	</p>
																)}
															</div>
															<div>
																<label className="block text-xs font-medium text-gray-700 mb-1">
																	Reason (Optional)
																</label>
																<TextInput
																	type="text"
																	value={stockOutData[ingredient.id]?.reason || ''}
																	onChange={(e) => setStockOutData({
																		...stockOutData,
																		[ingredient.id]: {
																			...stockOutData[ingredient.id],
																			reason: e.target.value
																		}
																	})}
																	className="w-full"
																	placeholder="e.g., Used for cooking, Expired, Damaged"
																/>
															</div>
														</div>
													)}
												</div>
											))}
										</div>
									</div>

									<div className="flex gap-2 pt-4 border-t">
										<button
											onClick={() => {
												setStockAction(null);
												setStockOutDate('');
												setSelectedIngredients([]);
												setStockOutData({});
											}}
											className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
										>
											Back
										</button>
										<button
											onClick={handleStockOut}
											disabled={selectedIngredients.length === 0 || processing}
											className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
										>
											{processing ? 'Saving...' : `Save (${selectedIngredients.length} items)`}
										</button>
									</div>
								</div>
							) : null}
						</div>

						<div className="mt-6 flex justify-end">
								<button
									onClick={() => setShowStockModal(false)}
									className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
								>
									Close
								</button>
							</div>
						</div>
					</div>
				</div>
			)}

			{/* Transaction Details Modal */}
			{selectedTransaction && (
				<div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
					<div className="relative top-20 mx-auto p-5 border w-full max-w-3xl shadow-lg rounded-md bg-white">
						<div className="mt-3">
							<div className="flex justify-between items-center mb-6">
								<div>
									<h3 className="text-xl font-semibold text-gray-900">
										Stock {selectedTransaction.type === 'in' ? 'In' : 'Out'} Details
										{isEditingTransaction && <span className="ml-2 text-sm text-blue-600">(Editing)</span>}
									</h3>
									<p className="text-sm text-gray-500 mt-1">
										Date: {selectedTransaction.transaction_date} • By: {selectedTransaction.user_name}
									</p>
									{selectedTransaction.supplier && selectedTransaction.type === 'in' && (
										<p className="text-sm text-gray-600 mt-1">
											<span className="font-medium">Supplier:</span> {selectedTransaction.supplier}
										</p>
									)}
								</div>
								<button
									onClick={() => {
										setSelectedTransaction(null);
										setIsEditingTransaction(false);
										setEditedTransactionItems({});
									}}
									className="text-gray-400 hover:text-gray-600"
								>
									<svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
									</svg>
								</button>
							</div>

							<div className="bg-gray-50 rounded-lg p-4">
								<table className="min-w-full divide-y divide-gray-200">
									<thead className="bg-gray-100">
										<tr>
											<th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ingredient</th>
											<th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity</th>
											<th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Before</th>
											<th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">After</th>
											{selectedTransaction.type === 'in' && (
												<th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Expiry Date</th>
											)}
											{selectedTransaction.type === 'out' && (
												<th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reason</th>
											)}
										</tr>
									</thead>
									<tbody className="bg-white divide-y divide-gray-200">
										{selectedTransaction.items.map((item) => (
											<tr key={item.id} className="hover:bg-gray-50">
												<td className="px-4 py-3 text-sm font-medium text-gray-900">
													{item.ingredient_name}
												</td>
												<td className="px-4 py-3 text-sm">
													{isEditingTransaction ? (
														<TextInput
															type="number"
															step="0.01"
															min="0.01"
															value={editedTransactionItems[item.id]?.quantity ?? item.quantity}
															onChange={(e) => setEditedTransactionItems({
																...editedTransactionItems,
																[item.id]: {
																	...editedTransactionItems[item.id],
																	quantity: e.target.value
																}
															})}
															className="w-32"
														/>
													) : (
														<span className={`font-bold ${selectedTransaction.type === 'in' ? 'text-green-600' : 'text-red-600'}`}>
															{selectedTransaction.type === 'in' ? '+' : '-'}{item.quantity} {item.ingredient_unit}
														</span>
													)}
												</td>
												<td className="px-4 py-3 text-sm text-gray-700">
													{item.quantity_before} {item.ingredient_unit}
												</td>
												<td className="px-4 py-3 text-sm text-gray-700">
													{isEditingTransaction ? (
														<span className="text-gray-400 italic">Will be recalculated</span>
													) : (
														`${item.quantity_after} ${item.ingredient_unit}`
													)}
												</td>
												{selectedTransaction.type === 'in' && (
													<td className="px-4 py-3 text-sm text-gray-700">
														{isEditingTransaction ? (
															<TextInput
																type="date"
																value={editedTransactionItems[item.id]?.expiry_date ?? item.expiry_date ?? ''}
																onChange={(e) => setEditedTransactionItems({
																	...editedTransactionItems,
																	[item.id]: {
																		...editedTransactionItems[item.id],
																		expiry_date: e.target.value
																	}
																})}
																className="w-full"
															/>
														) : (
															item.expiry_date || 'N/A'
														)}
													</td>
												)}
												{selectedTransaction.type === 'out' && (
													<td className="px-4 py-3 text-sm text-gray-700">
														{isEditingTransaction ? (
															<TextInput
																type="text"
																value={editedTransactionItems[item.id]?.reason ?? item.reason ?? ''}
																onChange={(e) => setEditedTransactionItems({
																	...editedTransactionItems,
																	[item.id]: {
																		...editedTransactionItems[item.id],
																		reason: e.target.value
																	}
																})}
																className="w-full"
																placeholder="Enter reason"
															/>
														) : (
															item.reason || 'Not specified'
														)}
													</td>
												)}
											</tr>
										))}
									</tbody>
								</table>
							</div>

							<div className="mt-6 flex justify-between items-center">
								{isEditingTransaction ? (
									<>
										<button
											onClick={handleCancelEdit}
											className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
										>
											Cancel
										</button>
										<button
											onClick={handleSaveTransactionEdit}
											disabled={processing}
											className="px-6 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
										>
											{processing ? 'Saving...' : 'Save Changes'}
										</button>
									</>
								) : (
									<>
										<button
											onClick={handleEditTransaction}
											className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 flex items-center gap-2"
										>
											<svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
											</svg>
											Edit
										</button>
										<button
											onClick={() => {
												setSelectedTransaction(null);
												setIsEditingTransaction(false);
												setEditedTransactionItems({});
											}}
											className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
										>
											Close
										</button>
									</>
								)}
							</div>
						</div>
					</div>
				</div>
			)}
		</EmployeeLayout>
	);
}