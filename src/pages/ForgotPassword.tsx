import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import toast from "react-hot-toast";
import useAuthStore from "../store/useAuthStore";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";

const forgotPasswordSchema = z.object({
  email: z
    .string()
    .min(1, { message: "Email is required" })
    .email({ message: "Invalid email address" }),
});

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

const ForgotPassword: React.FC = () => {
  const navigate = useNavigate();
  const checkEmailExists = useAuthStore((state) => state.checkEmailExists);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    await new Promise((resolve) => setTimeout(resolve, 1500));

    const userExists = checkEmailExists(data.email);

    if (!userExists) {
      toast.error("Email not registered.");
      setError("email", { type: "manual", message: "Email not registered." });
      return;
    }

    toast.success("Password reset link sent to your email!", {
      duration: 5000,
    });
    console.log("Password reset requested for:", data.email);

    navigate("/");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground p-4">
      <div className="bg-card p-8 rounded-2xl shadow-lg w-full max-w-md border border-border relative">
        <h2 className="text-3xl font-extrabold text-center text-purple-700 mb-4">
          Reset Password
        </h2>
        <p className="text-muted-foreground text-sm text-center mb-6">
          Enter your registered email to receive a password reset link.
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              {...register("email")}
              autoComplete="email"
              className={`mt-1 placeholder-gray-500 dark:placeholder-gray-400 [&:-webkit-autofill]:[transition:background-color_9999s_ease-in-out_0s] [&:-webkit-autofill]:[-webkit-text-fill-color:#000] dark:[&:-webkit-autofill]:[-webkit-text-fill-color:#fff] ${errors.email ? "border-red-500 focus-visible:ring-red-500" : ""}`}
              placeholder="Enter your email"
            />
            {errors.email && (
              <p className="text-red-500 text-xs mt-1 font-medium">
                {errors.email.message}
              </p>
            )}
          </div>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full mt-6 bg-purple-600 hover:bg-purple-700"
          >
            {isSubmitting ? "Sending..." : "Send Reset Link"}
          </Button>
        </form>
        <p className="text-center text-muted-foreground text-sm mt-6">
          Remember your password?{" "}
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

export default ForgotPassword;
