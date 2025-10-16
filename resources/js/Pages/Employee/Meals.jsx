import { useState, useRef } from 'react';
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
	const [formMessage, setFormMessage] = useState(null); // for form submission messages

	const { data, setData, post, put, delete: destroy, processing, errors, reset, setError } = useForm({
		name: '',
		description: '',
		price: '',
		category: '',
		image: null,
		is_available: true,
	});
	
	const [imagePreview, setImagePreview] = useState(null);
	const fileInputRef = useRef();

	const openCreateModal = () => {
		reset();
		setEditingMeal(null);
		setShowModal(true);
	};

	const openEditModal = (meal) => {
		// Reset form data and errors first
		reset();
		
		// Make sure we have proper string values for all fields
		const nameValue = meal.name ? String(meal.name) : '';
		const priceValue = meal.price ? String(meal.price) : '';
		const descValue = meal.description ? String(meal.description) : '';
		const categoryValue = meal.category ? String(meal.category) : '';
		
		// Then set the data from the meal
		setData({
			name: nameValue,
			description: descValue,
			price: priceValue,
			category: categoryValue,
			is_available: Boolean(meal.is_available),
			// Don't set the image field here - we only set it when a new image is selected
			image: null, // Reset the image field explicitly
			current_image_path: meal.image, // Store the current image path for reference
		});
		
		console.log('Opening edit modal with data:', {
			name: nameValue,
			price: priceValue,
			description: descValue,
			category: categoryValue,
			is_available: Boolean(meal.is_available),
			image_path: meal.image
		});
		
		setEditingMeal(meal);
		setImagePreview(meal.image ? `/storage/${meal.image}` : null);
		setShowModal(true);
	};

	const closeModal = () => {
		setShowModal(false);
		setEditingMeal(null);
		setImagePreview(null);
		reset();
	};
	
	const handleImageChange = (e) => {
		const file = e.target.files[0];
		if (file) {
			// Check file type
			if (!file.type.match('image.*')) {
				setError('image', 'Please select a valid image file');
				return;
			}
			
			// Check file size (limit to 2MB)
			if (file.size > 2 * 1024 * 1024) {
				setError('image', 'Image size should not exceed 2MB');
				return;
			}
			
			console.log('Image selected:', {
				name: file.name,
				size: file.size,
				type: file.type
			});
			
			// Set the image in the form data - create a fresh File object
			// This helps avoid issues with file references
			const newFile = new File([file], file.name, {
				type: file.type,
				lastModified: file.lastModified
			});
			
			// Clear any previous errors
			setError('image', '');
			
			// Set the image in the form data with the fresh file object
			setData('image', newFile);
			
			// Create preview
			const reader = new FileReader();
			reader.onload = (e) => {
				setImagePreview(e.target.result);
			};
			reader.readAsDataURL(file);
			
			// Log success
			console.log('Image file assigned to form data successfully');
		} else {
			console.log('No file selected or file selection cancelled');
		}
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		
		console.log('Form submission started');
		
		// Prevent double submission
		if (processing) {
			console.log('Already processing, preventing double submission');
			return;
		}
		
		// Create a NEW form data object to properly handle file uploads
		const formData = new FormData();
		
		// Track if we're updating the image
		let isUpdatingImage = false;
		
		// Add all the regular fields - handle empty values gracefully
		// For name, either use the current value or fallback for edit/create
		const nameValue = data.name ? data.name.trim() : '';
		formData.append('name', nameValue || (editingMeal ? editingMeal.name : 'Untitled Meal'));
		
		// For description, use empty string if not provided
		formData.append('description', data.description || '');
		
		// For price, use current value, existing value for edit, or 0 for new
		const priceValue = data.price;
		formData.append('price', priceValue || (editingMeal ? editingMeal.price : '0'));
		
		// For category, use empty string if not provided
		formData.append('category', data.category || '');
		
		// For availability status
		formData.append('is_available', data.is_available ? '1' : '0');
		
		// DIRECTLY access the file input element to ensure we get the file
		const fileInput = document.getElementById('image');
		const hasFileSelected = fileInput && fileInput.files && fileInput.files.length > 0;
		
		// If a file is selected, use it directly from the input element
		if (hasFileSelected) {
			const selectedFile = fileInput.files[0];
			console.log('File found directly in input element:', {
				name: selectedFile.name,
				size: selectedFile.size,
				type: selectedFile.type
			});
			
			// Create a fresh File object to ensure proper serialization
			const freshFile = new File([selectedFile], selectedFile.name, {
				type: selectedFile.type,
				lastModified: new Date().getTime()
			});
			
			// Append directly from the input element
			formData.append('image', freshFile);
			
			// Also append a flag indicating we're updating the image
			formData.append('update_image', '1');
			
			// Log for debugging
			console.log('FormData contains image from input element:', formData.has('image'));
		} else {
			console.log('No file selected in the input element');
			
			// If we're editing and there was no new file selected, tell the server to keep the existing image
			if (editingMeal) {
				formData.append('keep_existing_image', '1');
			}
		}
		
		// Debug what's being sent
		console.log('Submitting meal data:', {
			name: data.name,
			price: data.price,
			description: data.description,
			is_available: data.is_available,
			has_image: data.image instanceof File,
			editing_meal_id: editingMeal ? editingMeal.id : null
		});
		
		try {
			// Let Inertia handle the form data submission
			if (editingMeal) {
				console.log(`Updating meal with ID: ${editingMeal.id}`);
				
				// Ensure we're using the correct ID and proper FormData handling
				put(route('employee.meals.update', editingMeal.id), formData, {
					onSuccess: () => {
						console.log('Meal updated successfully');
						// Show success message
						setFormMessage({ type: 'success', text: 'Meal updated successfully!' });
						
						// Reset form and close modal
						reset();
						setImagePreview(null);
						setEditingMeal(null);
						setShowModal(false);
					},
					preserveScroll: true,
					preserveState: false, // Don't preserve state to prevent unwanted redirects
					replace: true, // Use replace to avoid browser history issues
					onError: (errors) => {
						console.error('Error updating meal:', errors);
						// Show error message
						setFormMessage({ type: 'error', text: 'Failed to update meal. Please check the form for errors.' });
						setTimeout(() => setFormMessage(null), 5000);
						
						// Display specific error if available
						if (errors.error) {
							alert(`Error: ${errors.error}`);
						} else if (Object.keys(errors).length > 0) {
							// Show a more user-friendly message for validation errors
							const errorMessages = Object.entries(errors)
								.map(([field, message]) => `${field}: ${message}`)
								.join('\n');
								
							console.error('Validation errors:', errorMessages);
							
							// Show specific error for image upload issues
							if (errors.image) {
								alert(`Image upload error: ${errors.image}`);
							}
							// For other fields
							else if (errors.name || errors.price) {
								alert('Please check the name and price fields - they cannot be empty.');
							}
						}
					},
					forceFormData: true, // Critical for file uploads
					preserveState: false, // Don't preserve state to ensure clean reload
					preserveScroll: true,
					replace: true, // Use replace to avoid browser history issues
					headers: {
						'Accept': 'text/html, application/xhtml+xml',
						'X-Requested-With': 'XMLHttpRequest',
						// Don't set Content-Type - it will be set automatically with boundary for multipart/form-data
					},
				});
			} else {
				post(route('employee.meals.store'), formData, {
					onSuccess: () => {
						console.log('Meal created successfully');
						
						// Just close the modal - no need for setTimeout as Inertia will handle the redirect
						setShowModal(false);
						
						// Reset form data
						reset();
						setImagePreview(null);
						setEditingMeal(null);
						
						// Show success message for the user
						setFormMessage({ type: 'success', text: 'Meal created successfully!' });
					},
					preserveScroll: true,
					preserveState: false, // Don't preserve state to prevent unwanted redirects
					replace: true, // Use replace to avoid browser history issues
					onError: (errors) => {
						console.error('Error creating meal:', errors);
						
						// Show error message
						setFormMessage({ type: 'error', text: 'Failed to create meal. Please check the form for errors.' });
						setTimeout(() => setFormMessage(null), 5000);
						
						// Display specific error if available
						if (errors.error) {
							alert(`Error: ${errors.error}`);
						}
					},
					forceFormData: true,
					preserveState: false,
					preserveScroll: true,
					replace: true, // Use replace to avoid browser history issues
					headers: {
						'Accept': 'text/html, application/xhtml+xml',
						'X-Requested-With': 'XMLHttpRequest',
					},
				});
			}
		} catch (error) {
			console.error('Exception during form submission:', error);
			alert(`An error occurred: ${error.message}`);
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
			{formMessage && <Notification message={formMessage.text} type={formMessage.type} />}

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
									<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image</th>
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
										{meal.image ? (
											<img 
												src={`/storage/${meal.image}?t=${new Date().getTime()}`} 
												alt={meal.name}
												className="h-10 w-10 rounded object-cover" 
												onError={(e) => {
													e.target.onerror = null;
													e.target.src = '/images/logo.jpg';
												}}
											/>
										) : (
											<span className="text-gray-400">No image</span>
										)}
									</td>
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
										<th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Image</th>
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
												{meal.image ? (
													<img 
														src={`/storage/${meal.image}?v=${new Date().getTime()}`} 
														alt={meal.name}
														className="h-10 w-10 rounded object-cover" 
														onError={(e) => {
															e.target.onerror = null;
															e.target.src = '/images/logo.jpg';
														}}
													/>
												) : (
													<span className="text-gray-400">No image</span>
												)}
											</td>
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
				<div 
					className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50"
					onClick={(e) => {
						// Close modal when clicking outside (on the overlay)
						if (e.target === e.currentTarget) {
							console.log('Modal overlay clicked, closing modal');
							closeModal();
						}
					}}
				>
					<div className="relative top-20 mx-auto p-5 border w-96 shadow-lg rounded-md bg-white">
						<div className="mt-3">
							<div className="flex justify-between items-center mb-4">
								<h3 className="text-lg font-medium text-gray-900">
									{editingMeal ? 'Edit Meal' : 'Add New Meal'}
								</h3>
								<button
									type="button"
									onClick={() => {
										console.log('Close button clicked');
										closeModal();
									}}
									className="text-gray-500 hover:text-gray-700 focus:outline-none"
								>
									<svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
										<path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
									</svg>
								</button>
							</div>
							<form 
								onSubmit={handleSubmit} 
								className="space-y-4"
								encType="multipart/form-data"
							>
								<div>
									<TextInput
										id="name"
										name="name"
										type="text"
										placeholder="Meal Name"
										value={data.name}
										onChange={(e) => setData('name', e.target.value)}
										className="w-full"
									/>
									<InputError message={errors.name} className="mt-2" />
									{/* Removed help text */}
								</div>

								<div>
									<textarea
										id="description"
										name="description"
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
										name="price"
										type="number"
										step="0.01"
										min="0"
										placeholder="Price"
										value={data.price}
										onChange={(e) => setData('price', e.target.value)}
										className="w-full"
									/>
									<InputError message={errors.price} className="mt-2" />
									{/* Removed help text */}
								</div>

								<div>
									<label htmlFor="category" className="block text-sm font-medium text-gray-700 mb-1">
										Category
									</label>
									<select
										id="category"
										name="category"
										value={data.category || ''}
										onChange={(e) => setData('category', e.target.value)}
										className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500"
									>
										<option value="">Select a category</option>
										<option value="Pork">Pork</option>
										<option value="Chicken">Chicken</option>
										<option value="Beef">Beef</option>
										<option value="Fish">Fish</option>
										<option value="Seafood">Seafood</option>
										<option value="Vegetables">Vegetables</option>
										<option value="Rice Meal">Rice Meal</option>
										<option value="Noodles">Noodles</option>
										<option value="Soup">Soup</option>
										<option value="Dessert">Dessert</option>
										<option value="Beverage">Beverage</option>
									</select>
									<InputError message={errors.category} className="mt-2" />
								</div>
								
								<div className="mt-3">
									<label className="block text-sm font-medium text-gray-700 mb-1">
										Image
									</label>

									{/* Image Preview Section - Larger display */}
									<div className="mb-4">
										<div className="relative w-full h-48 bg-gray-100 rounded-lg overflow-hidden">
											{(imagePreview || (editingMeal && editingMeal.image)) ? (
												<img
													src={imagePreview || (editingMeal ? `/storage/${editingMeal.image}?v=${new Date().getTime()}` : null)}
													alt="Meal preview"
													className="w-full h-full object-contain"
													onError={(e) => {
														e.target.onerror = null;
														e.target.src = '/images/logo.jpg';
													}}
												/>
											) : (
												<div className="flex items-center justify-center h-full">
													<span className="text-gray-400">No image selected</span>
												</div>
											)}
										</div>
									</div>
									
									{/* File Input Section */}
									<div className="mt-1">
										<input
											type="file"
											id="image"
											name="image"
											accept="image/*"
											className={`block w-full text-sm text-gray-900 border ${errors.image ? 'border-red-500 bg-red-50' : 'border-gray-300'} rounded-md p-2 cursor-pointer file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100`}
											onChange={(e) => {
												const file = e.target.files[0];
												if (file) {
													// Clear previous errors
													setError('image', '');
													
													// Basic validation
													if (!file.type.match('image.*')) {
														setError('image', 'Please select a valid image file (JPG, PNG, GIF, etc.)');
														e.target.value = '';
														return;
													}
													
													if (file.size > 2 * 1024 * 1024) {
														setError('image', 'Image size should not exceed 2MB');
														e.target.value = '';
														return;
													}
													
													console.log('New image selected for ' + (editingMeal ? 'update' : 'new meal') + ':', file.name);
													
													// Create a fresh File object copy to ensure it's properly serialized
													const freshFile = new File([file], file.name, {
														type: file.type,
														lastModified: new Date().getTime()
													});
													
													// Set form data
													setData('image', freshFile);
													
													// Create preview
													const reader = new FileReader();
													reader.onload = (e) => {
														setImagePreview(e.target.result);
													};
													reader.readAsDataURL(file);
												}
											}}
										/>
										
										{imagePreview && (
											<div className="mt-2 flex justify-end">
												<button
													type="button"
													onClick={() => {
														console.log('Removing image from form');
														setImagePreview(null);
														setData('image', null);
														const fileInput = document.getElementById('image');
														if (fileInput) fileInput.value = '';
													}}
													className="text-sm text-red-600 hover:text-red-800 flex items-center"
												>
													<svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
														<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
													</svg>
													Remove image
												</button>
											</div>
										)}
									</div>
									
									<InputError message={errors.image} className="mt-2" />
									
									{/* Help text */}
									<div className="mt-1 text-xs text-gray-500">
										{editingMeal 
											? <span className="font-medium text-blue-600">Browse to select a new image</span> 
											: "Upload an image for the meal"}
									</div>
								</div>

								<div className="flex items-center">
									<input
										id="is_available"
										name="is_available"
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
										onClick={() => {
											console.log('Cancel button clicked, closing modal');
											closeModal();
										}}
										className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
									>
										Cancel
									</button>
									<button 
										type="submit" 
										disabled={processing}
										className={`inline-flex items-center px-4 py-2 bg-gray-800 border border-transparent rounded-md font-semibold text-xs text-white uppercase tracking-widest hover:bg-gray-700 focus:bg-gray-700 active:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition ease-in-out duration-150 ${
											processing ? 'opacity-25 cursor-not-allowed' : ''
										}`}
									>
										{processing ? 'Processing...' : (editingMeal ? 'Update' : 'Create')}
									</button>
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
