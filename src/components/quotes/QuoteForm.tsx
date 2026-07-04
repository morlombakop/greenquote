"use client";

import React, { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

// Check and compare with validation quote
const quoteSchema = z.object({
  fullName: z.string().min(2, "Full client name is required"),
  email: z.string().email("Please provide a valid contact email"),
  address: z.string().min(5, "Complete physical address is required"),
  monthlyConsumptionKwh: z
    .number()
    .min(50, "Minimum monthly demand is 50 kWh")
    .max(10000, "Commercial installations past 10,000 kWh, contact support"),
  downPayment: z
    .number()
    .min(0, "Down payment cannot drop below zero"),
});

export type QuoteFormData = z.infer<typeof quoteSchema>;

interface QuoteFormProps {
  initialData?: QuoteFormData;
  onSubmit: (values: QuoteFormData) => Promise<void>;
  submitButtonText?: string;
  submitButtonLoadingText?: string;
}

const SOLAR_IRRADIANCE_FACTOR = 1.2;
const PRICE_PER_KW = 1500;

export function QuoteForm({
  initialData,
  onSubmit,
  submitButtonText = "Submit & Generate Proposals",
  submitButtonLoadingText = "Running Underwriting Engine...",
}: QuoteFormProps) {
  const [serverError, setServerError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<QuoteFormData>({
    resolver: zodResolver(quoteSchema),
    defaultValues: initialData ?? {
      fullName: "",
      email: "",
      address: "",
      monthlyConsumptionKwh: 0,
      downPayment: 0,
    },
  });

  const monthlyConsumption = useWatch({ control, name: "monthlyConsumptionKwh" }) || 0;
  const downPayment = useWatch({ control, name: "downPayment" }) || 0;

  const derivedSystemSizeKw = (monthlyConsumption * 12) / 1000 * SOLAR_IRRADIANCE_FACTOR;
  const derivedSystemPrice = derivedSystemSizeKw * PRICE_PER_KW;
  const derivedPrincipalAmount = Math.max(0, derivedSystemPrice - downPayment);

  const handleFormSubmit = async (values: QuoteFormData) => {
    setIsLoading(true);
    setServerError(null);
    try {
      await onSubmit(values);
    } catch (err) {
        const e = err as { message?: string };
      setServerError(e.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="space-y-8">
      {serverError && (
        <div className="rounded-md bg-red-50 p-4 border border-red-200">
          <p className="text-sm font-medium text-red-800">{serverError}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* LEFT COLUMN: Inputs */}
        <div className="space-y-4">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400">Client Information</h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <input
              type="text"
              className={`block w-full px-3 py-2 border rounded-md text-gray-900 sm:text-sm focus:outline-none focus:ring-green-500 focus:border-green-500 ${
                errors.fullName ? "border-red-500 ring-1 ring-red-500" : "border-gray-300"
              }`}
              placeholder="Jane Doe"
              {...register("fullName")}
            />
            {errors.fullName && <p className="mt-1 text-xs font-medium text-red-600">{errors.fullName.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <input
              type="email"
              className={`block w-full px-3 py-2 border rounded-md text-gray-900 sm:text-sm focus:outline-none focus:ring-green-500 focus:border-green-500 ${
                errors.email ? "border-red-500 ring-1 ring-red-500" : "border-gray-300"
              }`}
              placeholder="jane.doe@domain.de"
              {...register("email")}
            />
            {errors.email && <p className="mt-1 text-xs font-medium text-red-600">{errors.email.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Installation Site Address</label>
            <input
              type="text"
              className={`block w-full px-3 py-2 border rounded-md text-gray-900 sm:text-sm focus:outline-none focus:ring-green-500 focus:border-green-500 ${
                errors.address ? "border-red-500 ring-1 ring-red-500" : "border-gray-300"
              }`}
              placeholder="Müllerstraße 42, 13353 Berlin"
              {...register("address")}
            />
            {errors.address && <p className="mt-1 text-xs font-medium text-red-600">{errors.address.message}</p>}
          </div>

          <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400 pt-2">Technical & Financial</h3>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Usage (kWh/mo)</label>
              <input
                type="number"
                className={`block w-full px-3 py-2 border rounded-md text-gray-900 sm:text-sm focus:outline-none focus:ring-green-500 focus:border-green-500 ${
                  errors.monthlyConsumptionKwh ? "border-red-500 ring-1 ring-red-500" : "border-gray-300"
                }`}
                placeholder="350"
                {...register("monthlyConsumptionKwh", { valueAsNumber: true })}
              />
              {errors.monthlyConsumptionKwh && <p className="mt-1 text-xs font-medium text-red-600">{errors.monthlyConsumptionKwh.message}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Down Payment (€)</label>
              <input
                type="number"
                className={`block w-full px-3 py-2 border rounded-md text-gray-900 sm:text-sm focus:outline-none focus:ring-green-500 focus:border-green-500 ${
                  errors.downPayment ? "border-red-500 ring-1 ring-red-500" : "border-gray-300"
                }`}
                placeholder="2000"
                {...register("downPayment", { valueAsNumber: true })}
              />
              {errors.downPayment && <p className="mt-1 text-xs font-medium text-red-600">{errors.downPayment.message}</p>}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Live Sidebar Estimates */}
        <div className="bg-gray-50 rounded-xl p-5 border border-gray-100 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-gray-400 mb-4">Live Estimates</h3>
            <div className="space-y-4 text-sm">
              <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                <span className="text-gray-600">Calculated Size:</span>
                <span className="font-bold text-gray-900">{derivedSystemSizeKw.toFixed(2)} kWp</span>
              </div>
              <div className="flex justify-between items-center pb-3 border-b border-gray-200">
                <span className="text-gray-600">Base Pricing:</span>
                <span className="font-bold text-gray-900">
                  €{derivedSystemPrice.toLocaleString("de-DE", { minimumFractionDigits: 2 })}
                </span>
              </div>
              <div className="flex justify-between items-center pt-2">
                <span className="text-gray-600 font-medium">Financing Principal:</span>
                <span className="font-black text-green-600 text-xl tracking-tight">
                  €{derivedPrincipalAmount.toLocaleString("de-DE", { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-8">
            <button
              type="submit"
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
