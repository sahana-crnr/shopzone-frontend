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

const loginSchema = z.object({
  email: z
    .string()
    .min(1, { message: "Email is required" })
    .email({ message: "Invalid email address" }),
  password: z
    .string()
    .min(1, { message: "Password is required" })
    .min(6, { message: "Password must be at least 6 characters long" }),
});

type LoginFormValues = {
  email: string;
  password: string;
};

const Login: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const loginUser = useAuthStore((state) => state.loginUser);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    mode: "onTouched",
  });

  const emailField = register("email");
  const passwordField = register("password");
  const onSubmit = async (data: LoginFormValues) => {
    const result = await loginUser(data.email, data.password);

    if (!result.success) {
      toast.error(result.message);
      const fieldName = result.field === "password" ? "password" : "email";
      setError(fieldName, { type: "manual", message: result.message });
      return;
    }

    toast.success(result.message, { duration: 5000 });
    navigate("/home", { replace: true });
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground p-4">
      <div className="bg-card p-8 rounded-2xl shadow-lg w-full max-w-md border border-border relative">
        <h2 className="text-3xl font-bold text-center text-purple-900 mb-3">
          Login
        </h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              {...emailField}
              className={`mt-1 placeholder-gray-500 dark:placeholder-gray-400 [&:-webkit-autofill]:[transition:background-color_9999s_ease-in-out_0s] [&:-webkit-autofill]:[-webkit-text-fill-color:#000] dark:[&:-webkit-autofill]:[-webkit-text-fill-color:#fff] ${
                errors.email ? "border-red-500 focus-visible:ring-red-500" : ""
              }`}
              placeholder="Enter your email"
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1 font-medium">
                {errors.email.message}
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
                  errors.password
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
            {errors.password && (
              <p className="text-red-500 text-xs mt-1 font-medium">
                {errors.password.message}
              </p>
            )}
          </div>

          <div className="flex justify-between items-center text-sm">
            <Label
              htmlFor="rememberMe"
              className="flex items-center space-x-2 font-normal text-muted-foreground cursor-pointer"
            >
              <input
                id="rememberMe"
                name="rememberMe"
                type="checkbox"
                className="rounded border-gray-300 text-purple-600 focus:ring-purple-500 accent-purple-600"
              />
              <span>Remember me</span>
            </Label>
            <Link
              to="/forgot-password"
              className="text-purple-600 font-medium hover:text-purple-800 transition"
            >
              Forgot password?
            </Link>
          </div>

          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-6 bg-purple-600 hover:bg-purple-700"
          >
            {isSubmitting ? "Logging in..." : "Login"}
          </Button>
        </form>

        <p className="text-center text-muted-foreground text-sm mt-6">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="text-purple-600 font-bold hover:text-purple-800 transition"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
