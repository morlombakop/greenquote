"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

// Define strict validation rules matching backend expectations
const registerSchema = z.object({
  fullName: z.string().min(2, "Name must be at least 2 characters long"),
  email: z.string().email("Please provide a valid email address"),
  password: z.string().min(6, "Password must be at least 6 characters long"),
});

// Infer structural TypeScript properties natively from the Zod Schema
type RegisterInput = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // Initialize form controls and connect Zod validation parser
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: RegisterInput) => {
    setIsLoading(true);
    setServerError(null);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "An unexpected error occurred during signup.");
      }

      router.push("/login?registered=true");
    } catch (err) {
        const m = err as { message: string };
      setServerError(m.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 bg-white p-8 rounded-xl shadow-md border border-gray-100">
        <div>
          <h2 className="text-center text-3xl font-extrabold tracking-tight text-gray-900">
            Create an account
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Get started with your solar quote evaluation
          </p>
        </div>

        {/* handleSubmit automatically captures event contexts and handles validation checks */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          {serverError && (
            <div className="rounded-md bg-red-50 p-4 border border-red-200">
              <p className="text-sm font-medium text-red-800">{serverError}</p>
            </div>
          )}

          <div className="space-y-4">
            {/* Full Name Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
              <input
                type="text"
                className={`block w-full px-3 py-2 border rounded-md text-gray-900 sm:text-sm focus:outline-none focus:ring-green-500 focus:border-green-500 ${
                  errors.fullName ? "border-red-500 ring-1 ring-red-500" : "border-gray-300"
                }`}
                placeholder="Morlo Mbakop"
                {...register("fullName")}
              />
              {errors.fullName && (
                <p className="mt-1 text-xs font-medium text-red-600">{errors.fullName.message}</p>
              )}
            </div>

            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email address</label>
              <input
                type="email"
                className={`block w-full px-3 py-2 border rounded-md text-gray-900 sm:text-sm focus:outline-none focus:ring-green-500 focus:border-green-500 ${
                  errors.email ? "border-red-500 ring-1 ring-red-500" : "border-gray-300"
                }`}
                placeholder="example@domain.com"
                {...register("email")}
              />
              {errors.email && (
                <p className="mt-1 text-xs font-medium text-red-600">{errors.email.message}</p>
              )}
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <input
                type="password"
                className={`block w-full px-3 py-2 border rounded-md text-gray-900 sm:text-sm focus:outline-none focus:ring-green-500 focus:border-green-500 ${
                  errors.password ? "border-red-500 ring-1 ring-red-500" : "border-gray-300"
                }`}
                placeholder="••••••••"
                {...register("password")}
              />
              {errors.password && (
                <p className="mt-1 text-xs font-medium text-red-600">{errors.password.message}</p>
              )}
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative flex w-full justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 transition-colors shadow-sm"
            >
              {isLoading ? "Creating Account..." : "Register"}
            </button>
          </div>

          <div className="text-center text-sm">
            <Link href="/login" className="font-medium text-green-600 hover:text-green-500">
              Already have an account? Sign in
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
