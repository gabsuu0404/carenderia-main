import { useState } from 'react';
import { router } from '@inertiajs/react';

export default function GCashPaymentModal({ show, onClose, onSubmit }) {
    const [gcashNumber, setGcashNumber] = useState('');
    const [receiptFile, setReceiptFile] = useState(null);
    const [previewUrl, setPreviewUrl] = useState(null);
    const [errors, setErrors] = useState({});

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            // Validate file type
            if (!file.type.startsWith('image/')) {
                setErrors({ receipt: 'Please upload an image file' });
                return;
            }
            
            // Validate file size (max 5MB)
            if (file.size > 5 * 1024 * 1024) {
                setErrors({ receipt: 'File size must be less than 5MB' });
                return;
            }

            setReceiptFile(file);
            setErrors({});
            
            // Create preview URL
            const reader = new FileReader();
            reader.onloadend = () => {
                setPreviewUrl(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        // Validate
        const newErrors = {};
        if (!gcashNumber) {
            newErrors.gcashNumber = 'GCash number is required';
        }
        if (!receiptFile) {
            newErrors.receipt = 'Payment screenshot is required';
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        // Pass data back to parent
        onSubmit({
            gcashNumber,
            receiptFile,
        });

        // Reset form
        setGcashNumber('');
        setReceiptFile(null);
        setPreviewUrl(null);
        setErrors({});
    };

    const handleCancel = () => {
        setGcashNumber('');
        setReceiptFile(null);
        setPreviewUrl(null);
        setErrors({});
        onClose();
    };

    if (!show) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">GCash Payment</h2>
                    
                    <form onSubmit={handleSubmit}>
                        {/* QR Code Section */}
                        <div className="mb-6 bg-gray-50 p-4 rounded-lg">
                            <h3 className="text-lg font-semibold text-gray-800 mb-3">Scan QR Code to Pay</h3>
                            <div className="flex justify-center mb-4">
                                <div className="bg-white p-4 rounded-lg shadow-md">
                                    <img 
                                        src="/images/gcash-qr.png" 
                                        alt="GCash QR Code" 
                                        className="w-64 h-64 object-contain"
                                        onError={(e) => {
                                            // Fallback if PNG doesn't exist, try JPG
                                            e.target.onerror = null;
                                            e.target.src = '/images/gcash-qr.jpg';
                                        }}
                                    />
                                </div>
                            </div>
                            <p className="text-sm text-gray-600 text-center">
                                Scan this QR code using your GCash app to complete the payment
                            </p>
                        </div>

                        {/* GCash Number Input */}
                        <div className="mb-4">
                            <label htmlFor="gcashNumber" className="block text-sm font-medium text-gray-700 mb-1">
                                Your GCash Number <span className="text-red-600">*</span>
                            </label>
                            <input
                                type="text"
                                id="gcashNumber"
                                value={gcashNumber}
                                onChange={(e) => setGcashNumber(e.target.value)}
                                placeholder="09XX XXX XXXX"
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-transparent"
                            />
                            {errors.gcashNumber && (
                                <p className="text-red-500 text-sm mt-1">{errors.gcashNumber}</p>
                            )}
                        </div>

                        {/* Receipt Upload */}
                        <div className="mb-6">
                            <label htmlFor="receipt" className="block text-sm font-medium text-gray-700 mb-1">
                                Upload Payment Screenshot <span className="text-red-600">*</span>
                            </label>
                            <div className="mt-1">
                                <input
                                    type="file"
                                    id="receipt"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-red-50 file:text-red-700 hover:file:bg-red-100"
                                />
                            </div>
                            {errors.receipt && (
                                <p className="text-red-500 text-sm mt-1">{errors.receipt}</p>
                            )}
                            
                            {/* Image Preview */}
                            {previewUrl && (
                                <div className="mt-3">
                                    <p className="text-sm text-gray-600 mb-2">Preview:</p>
                                    <img 
                                        src={previewUrl} 
                                        alt="Receipt preview" 
                                        className="max-w-full h-48 object-contain border border-gray-300 rounded-md"
                                    />
                                </div>
                            )}
                        </div>

                        {/* Instructions */}
                        <div className="mb-6 bg-blue-50 p-4 rounded-lg">
                            <h4 className="font-semibold text-blue-900 mb-2">Instructions:</h4>
                            <ol className="list-decimal list-inside text-sm text-blue-800 space-y-1">
                                <li>Scan the QR code using your GCash app</li>
                                <li>Complete the payment</li>
                                <li>Take a screenshot of the payment confirmation</li>
                                <li>Enter your GCash number above</li>
                                <li>Upload the screenshot</li>
                                <li>Click "Save Payment Info" to continue</li>
                            </ol>
                        </div>

                        {/* Buttons */}
                        <div className="flex justify-end gap-3">
                            <button
                                type="button"
                                onClick={handleCancel}
                                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 font-medium"
                            >
                                Save Payment Info
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
