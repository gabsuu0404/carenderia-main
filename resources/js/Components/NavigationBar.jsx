import React from "react";
import { Link } from "@inertiajs/react";

export default function NavigationBar() {
  return (
    <nav className="flex items-center justify-between px-6 py-4 bg-white border-b border-gray-200">
      <div className="text-2xl font-bold">
        3m's
      </div>
      <div className="flex items-center space-x-6">
        <a href="#contacts" className="hover:text-gray-700">
          Contacts
        </a>
        <Link href={route('about')} className="hover:text-gray-700">
          About
        </Link>
        <Link
          href={route('login')}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Login
        </Link>
      </div>
    </nav>
  );
}
