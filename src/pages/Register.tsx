import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import toast from "react-hot-toast";
import useAuthStore from "../store/useAuthStore";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { toIconComponent } from "../utils/icons";

const EyeIcon = toIconComponent(FaEye);
const EyeSlashIcon = toIconComponent(FaEyeSlash);

const registerSchema = z
  .object({
    name: z.string().min(1, { message: "Name is required" }),
    email: z
      .string()
      .min(1, { message: "Email is required" })
      .email({ message: "Invalid email address" }),
    phone: z
      .string()
      .min(1, { message: "Phone number is required" })
      .refine((value) => /^\d{10}$/.test(value), {
        message: "Phone number must be 10 digits",
      }),
    password: z
      .string()
      .min(1, { message: "Password is required" })
      .min(8, { message: "Password must be at least 8 characters long" }),
    confirmPassword: z
      .string()
      .min(1, { message: "Please confirm your password" }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type RegisterFormValues = {
  name: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
};

const Register: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const registerUser = useAuthStore((state) => state.registerUser);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    mode: "onTouched",
  });

  const nameField = register("name");
  const emailField = register("email");
  const phoneField = register("phone");
  const passwordField = register("password");
  const confirmPasswordField = register("confirmPassword");
  const onSubmit = async (data: RegisterFormValues) => {
    const result = await registerUser(
      data.email,
      data.password,
      data.phone,
      data.name,
    );

    if (!result.success) {
      toast.error(result.message);
      const isPasswordError =
        result.field === "password" ||
        result.message.toLowerCase().includes("password") ||
        result.message.toLowerCase().includes("8 characters");

      setError(isPasswordError ? "password" : "email", {
        type: "manual",
        message: result.message,
      });
      return;
    }

    toast.success(result.message, { duration: 5000 });
    navigate("/", { replace: true });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground p-4">
      <div className="bg-card p-8 rounded-2xl shadow-lg w-full max-w-md border border-border relative">
        <h2 className="text-3xl font-bold text-center text-purple-700 mb-3">
          Account Setup
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <Label htmlFor="name">Full Name</Label>
            <Input
              id="name"
              type="text"
              {...nameField}
              className={`mt-1 placeholder-gray-500 dark:placeholder-gray-400 [&:-webkit-autofill]:[transition:background-color_9999s_ease-in-out_0s] [&:-webkit-autofill]:[-webkit-text-fill-color:#000] dark:[&:-webkit-autofill]:[-webkit-text-fill-color:#fff] ${
                errors.name != null
                  ? "border-red-500 focus-visible:ring-red-500"
                  : ""
              }`}
              placeholder="Enter your full name"
            />
            {errors.name != null && (
              <p className="text-red-500 text-xs mt-1 font-medium">
                {errors.name.message}
              </p>
            )}
          </div>
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              {...emailField}
              className={`mt-1 placeholder-gray-500 dark:placeholder-gray-400 ${
                errors.email ? "border-red-500 focus-visible:ring-red-500" : ""
              }`}
              placeholder="Enter your email"
            />
            {errors.email != null && (
              <p className="text-red-500 text-xs mt-1 font-medium">
                {errors.email.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="phone">Phone Number</Label>
            <Input
              id="phone"
              type="tel"
              {...phoneField}
              inputMode="numeric"
              maxLength={10}
              className={`mt-1 placeholder-gray-500 dark:placeholder-gray-400 [&:-webkit-autofill]:[transition:background-color_9999s_ease-in-out_0s] [&:-webkit-autofill]:[-webkit-text-fill-color:#000] dark:[&:-webkit-autofill]:[-webkit-text-fill-color:#fff] ${
                errors.phone != null
                  ? "border-red-500 focus-visible:ring-red-500"
                  : ""
              }`}
              placeholder="Enter your phone number"
            />
            {errors.phone != null && (
              <p className="text-red-500 text-xs mt-1 font-medium">
                {errors.phone.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                {...passwordField}
                className={`mt-1 placeholder-gray-500 dark:placeholder-gray-400 [&:-webkit-autofill]:[transition:background-color_9999s_ease-in-out_0s] [&:-webkit-autofill]:[-webkit-text-fill-color:#000] dark:[&:-webkit-autofill]:[-webkit-text-fill-color:#fff] ${
                  errors.password != null
                    ? "border-red-500 focus-visible:ring-red-500"
                    : ""
                }`}
                placeholder="Enter your password"
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-purple-700"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeSlashIcon /> : <EyeIcon />}
              </button>
            </div>
            {errors.password != null && (
              <p className="text-red-500 text-xs mt-1 font-medium">
                {errors.password.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              {...confirmPasswordField}
              className={`mt-1 placeholder-gray-500 dark:placeholder-gray-400 [&:-webkit-autofill]:[transition:background-color_9999s_ease-in-out_0s] [&:-webkit-autofill]:[-webkit-text-fill-color:#000] dark:[&:-webkit-autofill]:[-webkit-text-fill-color:#fff] ${
                errors.confirmPassword != null
                  ? "border-red-500 focus-visible:ring-red-500"
                  : ""
              }`}
              placeholder="Confirm your password"
            />
            {errors.confirmPassword != null && (
              <p className="text-red-500 text-xs mt-1 font-medium">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-6 bg-purple-600 hover:bg-purple-700"
          >
            {isSubmitting ? "Processing..." : "Submit"}
          </Button>
        </form>

        <p className="text-center text-muted-foreground text-sm mt-6">
          Already have an account?{" "}
          <Link
            to="/"
            className="text-purple-600 font-bold hover:text-purple-800 transition"
          >
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Register;
