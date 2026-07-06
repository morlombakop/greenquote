"use client";

import { logger } from "@/lib/logger";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { registrationSchema, type RegistrationInput } from "@/lib/validations/registration";


export function RegisterForm() {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegistrationInput>({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (values: RegistrationInput) => {
    setIsLoading(true);
    setServerError(null);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fullName: values.fullName,
          email: values.email,
          password: values.password,
          confirmPassword: values.confirmPassword
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "An unexpected error occurred.");
      }

      router.push("/login?registered=true");
    } catch (err) {
      if (err instanceof Error) {
        setServerError(err.message);

        logger.error(
          {
            email: values.email,
            errorMessage: err.message,
            errorStack: err.stack,
          },
          "Registration form execution failure intercepted.",
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form className="mt-8 space-y-6" onSubmit={handleSubmit(onSubmit)}>
      {serverError && (
        <div className="rounded-md bg-red-50 p-4 border border-red-200">
          <p className="text-sm font-medium text-red-800">{serverError}</p>
        </div>
      )}

      <div className="space-y-4">
        {/* Full Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Full Name
          </label>
          <input
            type="text"
            className={`block w-full px-3 py-2 border rounded-md text-gray-900 sm:text-sm focus:ring-green-500 focus:border-green-500 ${
              errors.fullName
                ? "border-red-500 ring-1 ring-red-500"
                : "border-gray-300"
            }`}
            placeholder="Jane Doe"
            {...register("fullName")}
          />
          {errors.fullName && (
            <p className="mt-1 text-xs font-medium text-red-600">
              {errors.fullName.message}
            </p>
          )}
        </div>

        {/* Email */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Email address
          </label>
          <input
            type="email"
            className={`block w-full px-3 py-2 border rounded-md text-gray-900 sm:text-sm focus:ring-green-500 focus:border-green-500 ${
              errors.email
                ? "border-red-500 ring-1 ring-red-500"
                : "border-gray-300"
            }`}
            placeholder="example@domain.com"
            {...register("email")}
          />
          {errors.email && (
            <p className="mt-1 text-xs font-medium text-red-600">
              {errors.email.message}
            </p>
          )}
        </div>

        {/* Password */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Password
          </label>
          <input
            type="password"
            className={`block w-full px-3 py-2 border rounded-md text-gray-900 sm:text-sm focus:ring-green-500 focus:border-green-500 ${
              errors.password
                ? "border-red-500 ring-1 ring-red-500"
                : "border-gray-300"
            }`}
            placeholder="••••••••"
            {...register("password")}
          />
          {errors.password && (
            <p className="mt-1 text-xs font-medium text-red-600">
              {errors.password.message}
            </p>
          )}
        </div>

        {/* Confirm Password */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Confirm Password
          </label>
          <input
            type="password"
            className={`block w-full px-3 py-2 border rounded-md text-gray-900 sm:text-sm focus:ring-green-500 focus:border-green-500 ${
              errors.confirmPassword
                ? "border-red-500 ring-1 ring-red-500"
                : "border-gray-300"
            }`}
            placeholder="••••••••"
            {...register("confirmPassword")}
          />
          {errors.confirmPassword && (
            <p className="mt-1 text-xs font-medium text-red-600">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700 disabled:opacity-50 transition-colors shadow-sm"
      >
        {isLoading ? "Creating Account..." : "Register"}
      </button>

      <div className="text-center text-sm">
        <Link
          href="/login"
          className="font-medium text-green-600 hover:text-green-500"
        >
          Already have an account? Sign in
        </Link>
      </div>
    </form>
  );
}
