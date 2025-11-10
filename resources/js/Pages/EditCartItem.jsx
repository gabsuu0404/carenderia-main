import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, useForm } from '@inertiajs/react';

export default function EditCartItem({ auth, cartItem }) {
    const formatDateForInput = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return date.toISOString().split('T')[0];
    };

    const { data, setData, put, processing, errors } = useForm({
        delivery_date: formatDateForInput(cartItem.delivery_date),
        delivery_time: cartItem.delivery_time || '',
        delivery_address: cartItem.delivery_address,
        notes: cartItem.notes || '',
        number_of_pax: cartItem.number_of_pax,
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        put(route('cart.update', cartItem.id));
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setData(name, value);
    };

    const formatPrice = (price) => {
        return `₱${parseFloat(price).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    };

    const getTomorrowDate = () => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        return tomorrow.toISOString().split('T')[0];
    };

    const isFiestaPackage = !!cartItem.package_set;

    return (
        <AuthenticatedLayout
            auth={auth}
            header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">Edit Cart Item</h2>}
        >
            <Head title="Edit Cart Item" />

            <div className="py-12">
                <div className="max-w-4xl mx-auto sm:px-6 lg:px-8">
                    <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                        <div className="p-6 text-gray-900">
                            <form onSubmit={handleSubmit}>
                                {/* Package Info */}
                                <div className="mb-6">
                                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Package Information</h3>
                                    <div className="bg-gray-50 p-4 rounded-md">
                                        <h4 className="font-medium text-gray-900">
                                            {cartItem.package_name}
                                            {cartItem.package_set && (
                                                <span className="ml-2 text-sm text-gray-500">(Set {cartItem.package_set})</span>
                                            )}
                                        </h4>
                                        
                                        {cartItem.main_item && (
                                            <p className="text-sm text-gray-600 mt-1">
                                                <span className="font-medium">Main:</span> {cartItem.main_item}
                                            </p>
                                        )}
                                        
                                        {cartItem.selected_dishes && cartItem.selected_dishes.length > 0 && (
                                            <div className="mt-2">
                                                <p className="text-sm font-medium text-gray-700">Dishes:</p>
                                                <ul className="list-disc list-inside text-sm text-gray-600 ml-2">
                                                    {cartItem.selected_dishes.map((dish, index) => (
                                                        <li key={index}>{dish}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                        
                                        {cartItem.selected_desserts && cartItem.selected_desserts.length > 0 && (
                                            <div className="mt-2">
                                                <p className="text-sm font-medium text-gray-700">Desserts:</p>
                                                <ul className="list-disc list-inside text-sm text-gray-600 ml-2">
                                                    {cartItem.selected_desserts.map((dessert, index) => (
                                                        <li key={index}>{dessert}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                        
                                        <p className="text-lg font-bold text-gray-900 mt-3">
                                            {formatPrice(cartItem.total_amount)}
                                        </p>
                                    </div>
                                </div>

                                {/* Editable Fields */}
                                <div className="space-y-4">
                                    {/* Delivery Date */}
                                    <div>
                                        <label htmlFor="delivery_date" className="block text-sm font-medium text-gray-700 mb-1">
                                            Delivery Date <span className="text-red-600">*</span>
                                        </label>
                                        <input
                                            type="date"
                                            id="delivery_date"
                                            name="delivery_date"
                                            value={data.delivery_date}
                                            onChange={handleInputChange}
                                            min={getTomorrowDate()}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                            required
                                        />
                                        {errors.delivery_date && (
                                            <div className="text-red-500 text-sm mt-1">{errors.delivery_date}</div>
                                        )}
                                    </div>

                                    {/* Delivery Time */}
                                    <div>
                                        <label htmlFor="delivery_time" className="block text-sm font-medium text-gray-700 mb-1">
                                            Delivery Time <span className="text-red-600">*</span>
                                        </label>
                                        <input
                                            type="time"
                                            id="delivery_time"
                                            name="delivery_time"
                                            value={data.delivery_time}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                            required
                                        />
                                        {errors.delivery_time && (
                                            <div className="text-red-500 text-sm mt-1">{errors.delivery_time}</div>
                                        )}
                                    </div>

                                    {/* Delivery Address */}
                                    <div>
                                        <label htmlFor="delivery_address" className="block text-sm font-medium text-gray-700 mb-1">
                                            Delivery Address <span className="text-red-600">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            id="delivery_address"
                                            name="delivery_address"
                                            value={data.delivery_address}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                            required
                                            placeholder="Enter your complete delivery address"
                                        />
                                        {errors.delivery_address && (
                                            <div className="text-red-500 text-sm mt-1">{errors.delivery_address}</div>
                                        )}
                                    </div>

                                    {/* Note */}
                                    <div>
                                        <label htmlFor="notes" className="block text-sm font-medium text-gray-700 mb-1">
                                            Note (Optional)
                                        </label>
                                        <textarea
                                            id="notes"
                                            name="notes"
                                            value={data.notes}
                                            onChange={handleInputChange}
                                            rows="3"
                                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent resize-none"
                                            placeholder="Add any special instructions or notes..."
                                        />
                                        {errors.notes && (
                                            <div className="text-red-500 text-sm mt-1">{errors.notes}</div>
                                        )}
                                    </div>

                                    {/* Number of Pax */}
                                    {!isFiestaPackage && (
                                        <div>
                                            <label htmlFor="number_of_pax" className="block text-sm font-medium text-gray-700 mb-1">
                                                Number of Pax <span className="text-red-600">*</span>
                                            </label>
                                            <input
                                                type="number"
                                                id="number_of_pax"
                                                name="number_of_pax"
                                                value={data.number_of_pax}
                                                onChange={handleInputChange}
                                                min="1"
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                                                required
                                            />
                                            {errors.number_of_pax && (
                                                <div className="text-red-500 text-sm mt-1">{errors.number_of_pax}</div>
                                            )}
                                        </div>
                                    )}

                                    {/* Package Size Info for Fiesta */}
                                    {isFiestaPackage && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Package Size
                                            </label>
                                            <div className="px-3 py-2 border border-gray-300 bg-gray-50 rounded-md text-gray-700 font-medium">
                                                {cartItem.package_set === 'A' ? 'Good for 15-30 people' : 
                                                 cartItem.package_set === 'B' ? 'Good for 10-20 people' : 
                                                                              'Good for 10-15 people'}
                                            </div>
                                            <p className="text-xs text-gray-500 mt-1">
                                                Fiesta packages have pre-defined serving sizes
                                            </p>
                                        </div>
                                    )}
                                </div>

                                {/* Action Buttons */}
                                <div className="mt-6 flex justify-end gap-4">
                                    <Link
                                        href={route('cart.index')}
                                        className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 flex items-center"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                                        </svg>
                                        Back to Cart
                                    </Link>
                                    <button
                                        type="submit"
                                        disabled={processing}
                                        className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
                                    >
                                        {processing ? 'Saving...' : 'Save Changes'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
