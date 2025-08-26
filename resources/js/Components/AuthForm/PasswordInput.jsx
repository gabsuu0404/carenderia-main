import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import TextInput from "@/Components/TextInput";
import InputError from "@/Components/InputError";

export default function PasswordInput({ name, value, onChange, error }) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="relative">
      <TextInput
        id={name}
        type={showPassword ? "text" : "password"}
        name={name}
        value={value}
        onChange={onChange}
        placeholder="Password"
        className="w-full rounded-full px-4 py-2 border border-gray-300 focus:ring-2 focus:ring-indigo-500 bg-gray-200 pr-10"
        autoComplete={name === "password" ? "new-password" : "off"}
      />


      <button
        type="button"
        onClick={() => setShowPassword(!showPassword)}
        className="absolute inset-y-0 right-3 flex items-center text-gray-500"
      >
        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>

      {error && <InputError message={error} className="mt-1 text-sm" />}
    </div>
  );
}
