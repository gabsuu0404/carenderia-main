import { useEffect, useState } from "react";
import GuestLayout from "@/Layouts/GuestLayout";
import InputError from "@/Components/InputError";
import PrimaryButton from "@/Components/PrimaryButton";
import TextInput from "@/Components/TextInput";
import { Head, Link, useForm } from "@inertiajs/react";
import PasswordInput from "@/Components/AuthForm/PasswordInput";  // Import your custom PasswordInput

export default function Register() {
  const { data, setData, post, processing, errors, reset } = useForm({
    name: "",
    email: "",
    phone: "",
    password: "",
    password_confirmation: "",
  });

  useEffect(() => {
    return () => {
      reset("password", "password_confirmation");
    };
  }, []);

  const handleOnChange = (event) => {
    setData(
      event.target.name,
      event.target.type === "checkbox"
        ? event.target.checked
        : event.target.value
    );
  };

  const submit = (e) => {
    e.preventDefault();
    post(route("register"));
  };

  return (
    <GuestLayout>
      <Head title="Register" />

      <div className="flex min-h-screen items-center justify-center bg-gray-100">
        <div className="bg-white shadow-md rounded-2xl p-6 w-[400px] text-center">
          <h1 className="text-2xl font-semibold mb-8">Registration</h1>

          <form onSubmit={submit} className="space-y-4">
            {/* Name */}
            <div className="text-left">
              <label className="block text-gray-700 mb-1">Name :</label>
              <TextInput
                id="name"
                name="name"
                value={data.name}
                placeholder="Name"
                className="w-full rounded-full px-4 py-2 border border-gray-300 focus:ring-2 focus:ring-indigo-500 bg-gray-200"
                autoComplete="name"
                onChange={handleOnChange}
                required
              />
              <InputError message={errors.name} className="mt-1 text-sm" />
            </div>

            {/* Email */}
            <div className="text-left">
              <label className="block text-gray-700 mb-1">E-mail :</label>
              <TextInput
                id="email"
                type="email"
                name="email"
                value={data.email}
                placeholder="Email"
                className="w-full rounded-full px-4 py-2 border border-gray-300 focus:ring-2 focus:ring-indigo-500 bg-gray-200"
                autoComplete="username"
                onChange={handleOnChange}
                required
              />
              <InputError message={errors.email} className="mt-1 text-sm" />
            </div>

            {/* Phone */}
            <div className="text-left">
              <label className="block text-gray-700 mb-1">Phone :</label>
              <TextInput
                id="phone"
                type="text"
                name="phone"
                value={data.phone}
                placeholder="Phone Number"
                className="w-full rounded-full px-4 py-2 border border-gray-300 focus:ring-2 focus:ring-indigo-500 bg-gray-200"
                autoComplete="tel"
                onChange={handleOnChange}
                required
              />
              <InputError message={errors.phone} className="mt-1 text-sm" />
            </div>

            {/* Password */}
            <div className="text-left">
              <label className="block text-gray-700 mb-1">Password :</label>
              <PasswordInput
                name="password"
                value={data.password}
                onChange={handleOnChange}
                error={errors.password}
              />
            </div>

            {/* Confirm Password */}
            <div className="text-left">
              <label className="block text-gray-700 mb-1">
                Confirm Password :
              </label>
              <PasswordInput
                name="password_confirmation"
                value={data.password_confirmation}
                onChange={handleOnChange}
                error={errors.password_confirmation}
              />
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <PrimaryButton
                className="w-full rounded-full py-3 bg-black text-white font-semibold hover:bg-gray-800 transition"
                disabled={processing}
              >
                Create Account
              </PrimaryButton>
            </div>

            {/* Footer */}
            <p className="text-sm text-gray-600 mt-3">
              Already have an account?{" "}
              <Link href={route("login")} className="text-blue-600 underline">
                Click here to log in.
              </Link>
            </p>
          </form>
        </div>
      </div>
    </GuestLayout>
  );
}
