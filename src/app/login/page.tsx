"use client";

import React, { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

type LoginInput = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [serverError, setServerError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // 🚀 THE FIX: Derive this value directly during render. 
  // No useEffect, no extra state variable, no cascading renders.
  const showSuccessToast = searchParams.get("registered") === "true";

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (values: LoginInput) => {
    setIsLoading(true);
    setServerError(null);

    const result = await signIn("credentials", {
      redirect: false,
      email: values.email,
      password: values.password,
    });

    if (result?.error) {
      setServerError("Invalid email address or security password verification failed.");
      setIsLoading(false);
    } else {
      router.push("/quotes");
      router.refresh();
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 bg-white p-8 rounded-xl shadow-md border border-gray-100">
        <div>
          <h2 className="text-center text-3xl font-extrabold tracking-tight text-gray-900">
            Sign in to GreenQuote
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Access your active solar quotes pipeline
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
          {/* Works exactly as before, calculated directly on render */}
          {showSuccessToast && (
            <div className="rounded-md bg-green-50 p-4 border border-green-200">
              <p className="text-sm font-medium text-green-800">
                Account created successfully! Please sign in below.
              </p>
            </div>
          )}

          {serverError && (
            <div className="rounded-md bg-red-50 p-4 border border-red-200">
              <p className="text-sm font-medium text-red-800">{serverError}</p>
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email address</label>
              <input
                type="email"
                className={`block w-full px-3 py-2 border rounded-md text-gray-900 sm:text-sm focus:outline-none focus:ring-green-500 focus:border-green-500 ${
                  errors.email ? "border-red-500 ring-1 ring-red-500" : "border-gray-300"
                }`}
                placeholder="admin@test.com"
                {...register("email")}
              />
              {errors.email && (
                <p className="mt-1 text-xs font-medium text-red-600">{errors.email.message}</p>
              )}
            </div>

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
              {isLoading ? "Signing In..." : "Sign In"}
            </button>
          </div>

          <div className="text-center text-sm">
            <Link href="/register" className="font-medium text-green-600 hover:text-green-500">
              Don&apos;t have an account yet? Register here
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
