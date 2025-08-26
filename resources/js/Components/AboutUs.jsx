export default function AboutUs() {
  return (
    <section className="py-16 px-4 md:px-16 bg-white">
      <h2 className="text-3xl font-bold text-center mb-8">About Us</h2>

      <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-start gap-10">
        <div className="md:w-1/2">
          <p className="text-gray-700 leading-relaxed text-center md:text-left">
            We are dedicated to providing delicious meals and top-notch services to our customers.
            Our team works passionately to bring joy and satisfaction with every order.
          </p>
        </div>
        <div className="md:w-1/2 grid grid-cols-1 sm:grid-cols-3 gap-6 text-center md:text-left mt-10 md:mt-0">
          <div>
            <h3 className="font-semibold text-lg mb-2">About</h3>
            <ul className="space-y-1 text-gray-600">
              <li><a href="#" className="hover:text-black">Our Story</a></li>
              <li><a href="#" className="hover:text-black">Mission</a></li>
              <li><a href="#" className="hover:text-black">Team</a></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-lg mb-2">Order</h3>
            <ul className="space-y-1 text-gray-600">
              <li><a href="#" className="hover:text-black">Start Order</a></li>
              <li><a href="#" className="hover:text-black">Track Order</a></li>
            </ul>
          </div>
          <div>
            <h3 className="font-semibold text-lg mb-2">Contacts</h3>
            <ul className="space-y-1 text-gray-600">
              <li><a href="mailto:info@example.com" className="hover:text-black">Email</a></li>
              <li><a href="tel:+1234567890" className="hover:text-black">Contact No.</a></li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
