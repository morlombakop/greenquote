"use client";

import { calculateQuote } from "@/lib/utils/pricing";
import { type QuoteInput, quoteSchema } from "@/lib/validations/quote";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import React, { useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { QuoteResults } from "./QuoteResult";

type QuoteFormProps = {
  initialData: QuoteInput;
  submitButtonText?: string;
  submitButtonLoadingText?: string;
};

export function QuoteForm({
  initialData,
  submitButtonText = "Submit & Generate Proposals",
  submitButtonLoadingText = "Running Underwriting Engine...",
}: QuoteFormProps) {
  const [serverError, setServerError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isValid },
  } = useForm<QuoteInput>({
    resolver: zodResolver(quoteSchema),
    defaultValues: initialData,
  });

  const monthlyConsumptionKwh =
    useWatch({ control, name: "monthlyConsumptionKwh" }) || 0;
  const downPayment = useWatch({ control, name: "downPayment" }) || 0;
  const systemSizeKw = useWatch({ control, name: "systemSizeKw" }) || 0;

  const quoteSummary = useMemo(() => {
    return calculateQuote({ monthlyConsumptionKwh, downPayment, systemSizeKw });
  }, [monthlyConsumptionKwh, downPayment, systemSizeKw]);

  const handleCreateQuote = async (values: QuoteInput) => {
    const response = await fetch("/api/quotes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to process quote configurations.");
    }

    return data.quote.id;
  };

  const handleFormSubmit = async (values: QuoteInput) => {
    setIsLoading(true);
    setServerError(null);
    try {
      const quoteId = await handleCreateQuote(values);
      router.push(`/quotes/${quoteId}`);
      router.refresh();
    } catch (err) {
      const e = err as { message?: string };
      setServerError(e.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(handleFormSubmit)}
      className="space-y-8"
      noValidate
    >
      {serverError && (
        <div className="rounded-md bg-red-50 p-4 border border-red-200">
          <p className="text-sm font-medium text-red-800">{serverError}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* LEFT COLUMN: Inputs */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400">
            Client Information
          </h3>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name
            </label>
            <input
              type="text"
              data-testid="new-quote-input-full-name"
              className={`block w-full px-3 py-2 border rounded-md text-gray-900 sm:text-sm focus:outline-none focus:ring-green-500 focus:border-green-500 ${
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

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address
            </label>
            <input
              type="email"
              data-testid="new-quote-input-email"
              className={`block w-full px-3 py-2 border rounded-md text-gray-900 sm:text-sm focus:outline-none focus:ring-green-500 focus:border-green-500 ${
                errors.email
                  ? "border-red-500 ring-1 ring-red-500"
                  : "border-gray-300"
              }`}
              placeholder="jane.doe@domain.de"
              {...register("email")}
            />
            {errors.email && (
              <p className="mt-1 text-xs font-medium text-red-600">
                {errors.email.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Installation Site Address
            </label>
            <input
              type="text"
              data-testid="new-quote-input-address"
              className={`block w-full px-3 py-2 border rounded-md text-gray-900 sm:text-sm focus:outline-none focus:ring-green-500 focus:border-green-500 ${
                errors.address
                  ? "border-red-500 ring-1 ring-red-500"
                  : "border-gray-300"
              }`}
              placeholder="Müllerstraße 42, 13353 Berlin"
              {...register("address")}
            />
            {errors.address && (
              <p className="mt-1 text-xs font-medium text-red-600">
                {errors.address.message}
              </p>
            )}
          </div>

          <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400 pt-2">
            Technical & Financial
          </h3>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Usage (kWh/mo)
            </label>
            <input
              type="number"
              data-testid="new-quote-input-monthly-consumption-kwh"
              className={`block w-full px-3 py-2 border rounded-md text-gray-900 sm:text-sm focus:outline-none focus:ring-green-500 focus:border-green-500 ${
                errors.monthlyConsumptionKwh
                  ? "border-red-500 ring-1 ring-red-500"
                  : "border-gray-300"
              }`}
              placeholder="350"
              {...register("monthlyConsumptionKwh", { valueAsNumber: true })}
            />
            {errors.monthlyConsumptionKwh && (
              <p className="mt-1 text-xs font-medium text-red-600">
                {errors.monthlyConsumptionKwh.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              System Size (Kw)
            </label>
            <input
              type="number"
              data-testid="new-quote-input-system-size-kw"
              className={`block w-full px-3 py-2 border rounded-md text-gray-900 sm:text-sm focus:outline-none focus:ring-green-500 focus:border-green-500 ${
                errors.systemSizeKw
                  ? "border-red-500 ring-1 ring-red-500"
                  : "border-gray-300"
              }`}
              placeholder="2000"
              {...register("systemSizeKw", { valueAsNumber: true })}
            />
            {errors.systemSizeKw && (
              <p className="mt-1 text-xs font-medium text-red-600">
                {errors.systemSizeKw.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Down Payment (€)
            </label>
            <input
              type="number"
              data-testid="new-quote-input-down-payment"
              className={`block w-full px-3 py-2 border rounded-md text-gray-900 sm:text-sm focus:outline-none focus:ring-green-500 focus:border-green-500 ${
                errors.downPayment
                  ? "border-red-500 ring-1 ring-red-500"
                  : "border-gray-300"
              }`}
              placeholder="2000"
              {...register("downPayment", { valueAsNumber: true })}
            />
            {errors.downPayment && (
              <p className="mt-1 text-xs font-medium text-red-600">
                {errors.downPayment.message}
              </p>
            )}
          </div>
        </div>

        {/* RIGHT COLUMN: Live Sidebar Estimates */}
        <div className="bg-gray-50 rounded-xl p-5 border border-gray-100 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400 mb-4">
              Live Estimates
            </h3>
            {isValid ? (
              <QuoteResults summary={quoteSummary} />
            ) : (
              <div className="mt-8 text-center text-sm text-gray-400 italic">
                No summary Available.
              </div>
            )}
          </div>

          <div className="mt-8">
            <button
              type="submit"
              data-testid="new-quote-input-submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 text-sm font-semibold rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 transition-colors shadow-sm"
            >
              {isLoading ? submitButtonLoadingText : submitButtonText}
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
