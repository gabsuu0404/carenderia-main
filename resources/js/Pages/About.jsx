import React from 'react';
import { Head } from '@inertiajs/react';
import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import NavigationBar from '@/Components/NavigationBar';
import Footer from '@/Components/Footer';

export default function About({ auth }) {
    // Content to display in both authenticated and guest layouts
    const AboutContent = () => (
        <div className="py-12">
            <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
                <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
                    <div className="p-6 text-gray-900">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                            <div>
                                <h3 className="text-2xl font-bold mb-4">About 3M's Kainan</h3>
                                <p className="mb-4">
                                    Welcome to 3M's Kainan, your go-to spot for delicious and affordable home-cooked Filipino meals! We bring 
                                    the warmth of traditional Filipino cooking to your plate, made with love and fresh ingredients.
                                </p>
                                <p className="mb-4">
                                    Whether you're craving classic lutong-bahay dishes or need catering for special occasions, we've got you covered.
                                    Each dish is prepared with authentic recipes that have been passed down through generations, ensuring you get
                                    the genuine taste of Filipino cuisine.
                                </p>
                                <p className="mb-6">
                                    Our mission is to provide quality Filipino food that reminds you of home with every bite, 
                                    while maintaining affordability and excellent service.
                                </p>
                                
                                <div className="mb-6">
                                    <h4 className="text-xl font-semibold mb-3">Our Values</h4>
                                    <ul className="list-disc pl-6 space-y-2">
                                        <li><span className="font-medium">Quality:</span> We use only the freshest ingredients in our dishes.</li>
                                        <li><span className="font-medium">Tradition:</span> We stay true to authentic Filipino recipes.</li>
                                        <li><span className="font-medium">Affordability:</span> Great food doesn't have to be expensive.</li>
                                        <li><span className="font-medium">Customer Satisfaction:</span> Your happiness is our priority.</li>
                                    </ul>
                                </div>
                            </div>
                            
                            <div className="flex flex-col space-y-6">
                                <img 
                                    src="/images/logo.jpg" 
                                    alt="3M's Kainan Logo" 
                                    className="w-64 h-64 mx-auto object-contain" 
                                />
                                
                                <div className="bg-red-50 p-6 rounded-lg border border-red-100">
                                    <h4 className="text-xl font-semibold mb-3 text-red-700">Visit Us</h4>
                                    <div className="space-y-3">
                                        <p className="flex items-start">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-red-600 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                            <span>Jacinto Street, Davao City</span>
                                        </p>
                                        <p className="flex items-center">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            <span>Open Daily: 10:00 AM - 9:00 PM</span>
                                        </p>
                                        <p className="flex items-center">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                                            </svg>
                                            <span>+63 912 345 6789</span>
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div className="mt-12 border-t pt-6">
                            <h3 className="text-2xl font-bold mb-4">Our Story</h3>
                            <p className="mb-4">
                                3M's Kainan started as a small family business with a big dream - to share the joy of Filipino home cooking 
                                with everyone. What began as a modest food stall has now grown into a beloved local restaurant, 
                                thanks to our loyal customers and their continued support.
                            </p>
                            <p>
                                We take pride in every dish we serve and are committed to maintaining the quality and taste that 
                                our customers have come to love. Each plate reflects our passion for Filipino cuisine and our 
                                dedication to preserving its rich culinary heritage.
                            </p>
                            
                            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="bg-white p-4 rounded-lg shadow-md">
                                    <img src="/images/food1.jpg" alt="Filipino Food" className="w-full h-48 object-cover rounded-lg mb-4" />
                                    <h4 className="font-semibold text-lg">Authentic Flavors</h4>
                                    <p className="text-gray-600">Experience the true taste of Filipino cuisine with our traditional recipes.</p>
                                </div>
                                <div className="bg-white p-4 rounded-lg shadow-md">
                                    <img src="/images/ingredient.jpeg" alt="Quality Ingredients" className="w-full h-48 object-cover rounded-lg mb-4" />
                                    <h4 className="font-semibold text-lg">Fresh Ingredients</h4>
                                    <p className="text-gray-600">We source only the freshest ingredients to ensure quality in every bite.</p>
                                </div>
                                <div className="bg-white p-4 rounded-lg shadow-md">
                                    <img src="/images/catering.jpg" alt="Catering Services" className="w-full h-48 object-cover rounded-lg mb-4" />
                                    <h4 className="font-semibold text-lg">Catering Services</h4>
                                    <p className="text-gray-600">From intimate gatherings to large events, we offer catering services for all occasions.</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    // Render with AuthenticatedLayout if user is logged in, otherwise with guest layout
    if (auth?.user) {
        return (
            <AuthenticatedLayout
                auth={auth}
                header={<h2 className="font-semibold text-xl text-gray-800 leading-tight">About Us</h2>}
            >
                <Head title="About Us" />
                <AboutContent />
            </AuthenticatedLayout>
        );
    }

    // Guest layout
    return (
        <>
            <Head title="About Us" />
            <div className="flex flex-col min-h-screen">
                <NavigationBar />
                <div className="flex-grow">
                    <div className="bg-gray-100">
                        <div className="py-8 text-center">
                            <h2 className="text-3xl font-bold text-gray-800">About Us</h2>
                        </div>
                        <AboutContent />
                    </div>
                </div>
                <Footer />
            </div>
        </>
    );
}