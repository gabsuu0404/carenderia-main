import NavigationBar from "@/Components/NavigationBar";
import { Head } from "@inertiajs/react";
import { useState } from "react";
import AboutUs from "@/Components/AboutUs";  

const carouselItems = [     //Dummy data
  { title: "Meal 1", img: "/images/burger.png" },
  { title: "Meal 2", img: "/images/burger.png" },
  { title: "Service 1", img: "/images/service.png" },
  { title: "Service 2", img: "/images/service.png" },
];

const reviewItems = [ //Dummy data
  {
    name: "John Doe",
    rating: 5,
    text: "Amazing food and excellent service! Highly recommend.",
    img: "/images/user1.png",
  },
  {
    name: "Jane Smith",
    rating: 4,
    text: "Great meals but a bit slow on delivery. Overall good experience.",
    img: "/images/user2.png",
  },
  {
    name: "Alice Johnson",
    rating: 5,
    text: "Loved it! Will order again.",
    img: "/images/user3.png",
  },
  {
    name: "Bob Williams",
    rating: 4,
    text: "Food was tasty and fresh. Service was polite.",
    img: "/images/user4.png",
  },
];

export default function Welcome(props) {
  const [mealIndex, setMealIndex] = useState(0);
  const [reviewIndex, setReviewIndex] = useState(0); 

  const nextMeal = () => setMealIndex(prev => prev === carouselItems.length - 3 ? 0 : prev + 1);
  const prevMeal = () => setMealIndex(prev => prev === 0 ? carouselItems.length - 3 : prev - 1);

  const nextReview = () => setReviewIndex(prev => prev === reviewItems.length - 3 ? 0 : prev + 1);
  const prevReview = () => setReviewIndex(prev => prev === 0 ? reviewItems.length - 3 : prev - 1);

  return (
    <>
      <NavigationBar />
      <Head title="Welcome" />

      <div className="bg-white min-h-screen flex flex-col">
        {/* Header */}
        <header
          className="relative bg-cover bg-center h-[400px]"
          style={{ backgroundImage: "url('/images/eatery.png')" }}
        >
          <div className="absolute inset-0 bg-black bg-opacity-30 flex flex-col justify-center items-start text-white px-8 md:px-16">
            <h1 className="text-4xl md:text-6xl font-bold mb-4 text-left">3m's</h1>
            <div className="bg-gray-900 bg-opacity-40 text-gray-900 p-6 rounded-lg max-w-xl text-left text-white">
              <p className="mb-4">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
              </p>
              <button className="bg-gray-900 text-white px-6 py-3 rounded-md hover:bg-gray-700 transition">
                Order Now
              </button>
            </div>
          </div>
        </header>
        <section className="py-16 bg-gray-50">
          <h2 className="text-3xl font-bold text-center mb-8">Meals & Services</h2>
          <div className="relative max-w-6xl mx-auto overflow-hidden">
            <div
              className="flex transition-transform duration-500"
              style={{ transform: `translateX(-${mealIndex * (100 / 3)}%)` }}
            >
              {carouselItems.map((item, idx) => (
                <div key={idx} className="flex-none w-1/3 px-2">
                  <div className="relative rounded-lg overflow-hidden">
                    <img
                      src={item.img}
                      alt={item.title}
                      className="w-full h-64 object-cover rounded-lg"
                    />
                    <div className="absolute bottom-2 left-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded">
                      {item.title}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={prevMeal}
              className="absolute top-1/2 left-0 -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-r"
            >
              ‹
            </button>
            <button
              onClick={nextMeal}
              className="absolute top-1/2 right-0 -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-l"
            >
              ›
            </button>
          </div>
        </section>
        <section className="py-16 bg-gray-50">
          <h2 className="text-3xl font-bold text-center mb-8">Reviews</h2>
          <div className="relative max-w-6xl mx-auto overflow-hidden">
            <div
              className="flex transition-transform duration-500"
              style={{ transform: `translateX(-${reviewIndex * (100 / 3)}%)` }}
            >
              {reviewItems.map((review, idx) => (
                <div key={idx} className="flex-none w-1/3 px-3">
                  <div className="bg-white shadow-lg rounded-lg p-6 flex flex-col items-start">
                    <div className="flex items-center mb-4">
                      {review.img && (
                        <img
                          src={review.img}
                          alt={review.name}
                          className="w-12 h-12 rounded-full mr-3 object-cover"
                        />
                      )}
                      <div>
                        <h3 className="font-semibold">{review.name}</h3>
                        <div className="text-yellow-400">
                          {"★".repeat(review.rating) + "☆".repeat(5 - review.rating)}
                        </div>
                      </div>
                    </div>
                    <p className="text-gray-700">{review.text}</p>
                  </div>
                </div>
              ))}
            </div>

            <button
              onClick={prevReview}
              className="absolute top-1/2 left-0 -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-r"
            >
              ‹
            </button>
            <button
              onClick={nextReview}
              className="absolute top-1/2 right-0 -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-l"
            >
              ›
            </button>
          </div>
        </section>

        <AboutUs />
      </div>
    </>
  );
}
