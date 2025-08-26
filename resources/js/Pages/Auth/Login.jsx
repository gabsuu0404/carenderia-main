import { useEffect } from "react";
import Checkbox from "@/Components/Checkbox";
import GuestLayout from "@/Layouts/GuestLayout";
import InputError from "@/Components/InputError";
import PrimaryButton from "@/Components/PrimaryButton";
import TextInput from "@/Components/TextInput";
import PasswordInput from "@/Components/AuthForm/PasswordInput";
import { Head, Link, useForm } from "@inertiajs/react";
export default function Login({ status, canResetPassword }) {
  const { data, setData, post, processing, errors, reset } = useForm({
    email: "",
    password: "",
    remember: "",
  });

  useEffect(() => {
    return () => {
      reset("password");
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
    post(route("login"));
  };

  return (
    <GuestLayout>
      <Head title="Sign In" />

      <div className="flex items-center justify-center min-h-screen">
        <div className="bg-white shadow-xl rounded-3xl p-8 w-full max-w-md">
          <h1 className="text-2xl font-semibold text-center mb-6">Sign In</h1>

          {status && (
            <div className="mb-4 font-medium text-sm text-green-600">
              {status}
            </div>
          )}

          <form onSubmit={submit} className="space-y-5">
            {/* Email */}
            <div>
              <TextInput
                id="email"
                type="email"
                name="email"
                value={data.email}
                placeholder="Email"
                className="w-full rounded-full px-4 py-3 border border-gray-300 focus:ring-2 focus:ring-indigo-500 bg-gray-300"
                autoComplete="username"
                isFocused={true}
                onChange={handleOnChange}
              />
              <InputError message={errors.email} className="mt-2" />
            </div>

            {/* Password (split into its own component) */}
            <PasswordInput
              name="password"
              value={data.password}
              onChange={handleOnChange}
              error={errors.password}
            />

            {/* Remember me + Forgot password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center text-sm text-gray-600">
                <Checkbox
                  name="remember"
                  value={data.remember}
                  onChange={handleOnChange}
                />
                <span className="ml-2">Remember me</span>
              </label>

              {canResetPassword && (
                <Link
                  href={route("password.request")}
                  className="text-sm text-indigo-600 hover:underline"
                >
                  Forgot Password?
                </Link>
              )}
            </div>

            <PrimaryButton
              className="w-full rounded-full py-3 bg-black text-white hover:bg-gray-800 items-center justify-center"
              disabled={processing}
            >
              Sign In
            </PrimaryButton>
          </form>

          <p className="mt-6 text-center text-sm text-gray-600">
            Don’t have an existing account?{" "}
            <Link
              href={route("register")}
              className="text-indigo-600 hover:underline"
            >
              Click here to sign up
            </Link>
          </p>
        </div>
      </div>
    </GuestLayout>
  );
}
