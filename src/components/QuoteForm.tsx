"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { quoteSchema, QuoteInput } from "@/lib/validations/quote";
import { useState } from "react";

// Explicit interface matching the normalized JSON response required by the challenge
interface InstallmentOffer {
  termYears: number;
  apr: number;
  principalUsed: number;
  monthlyPayment: number;
}

interface QuoteResult {
  success: boolean;
  systemPrice: number;
  principalAmount: number;
  riskBand: "A" | "B" | "C";
  offers: InstallmentOffer[];
}

export default function QuoteForm({ userEmail, userName }: { userEmail: string; userName: string }) {
  // Strongly type the useState hook to avoid 'any'
  const [serverResult, setServerResult] = useState<QuoteResult | null>(null);
  const [submitError, setSubmitError] = useState<string | null>(null);
  
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<QuoteInput>({
    resolver: zodResolver(quoteSchema),
    defaultValues: {
      fullName: userName,
      email: userEmail,
      address: "",
      monthlyConsumptionKwh: 0,
      systemSizeKw: 0,
      downPayment: 0,
    },
  });

  const onSubmit = async (data: QuoteInput) => {
    setSubmitError(null);
    try {
      const response = await fetch("/api/quotes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error("Failed to process quote configuration");
      }
      
      const result: QuoteResult = await response.json();
      setServerResult(result);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "An unexpected network error occurred");
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6 p-6">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 bg-white rounded-md shadow p-6 border border-gray-100">
        <h2 className="text-xl font-bold text-gray-800">GreenQuote Pre-Qualification</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Full Name</label>
            <input {...register("fullName")} className="mt-1 block w-full border rounded p-2 bg-gray-50 text-gray-500 cursor-not-allowed" readOnly />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Email Address</label>
            <input {...register("email")} className="mt-1 block w-full border rounded p-2 bg-gray-50 text-gray-500 cursor-not-allowed" readOnly />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Installation Address</label>
          <input {...register("address")} className="mt-1 block w-full border rounded p-2 border-gray-300" placeholder="123 Solar St, Berlin" />
          {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address.message}</p>}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Monthly Consumption (kWh)</label>
            <input type="number" {...register("monthlyConsumptionKwh")} className="mt-1 block w-full border rounded p-2 border-gray-300" />
            {errors.monthlyConsumptionKwh && <p className="text-red-500 text-xs mt-1">{errors.monthlyConsumptionKwh.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">System Size (kW)</label>
            <input type="number" step="0.1" {...register("systemSizeKw")} className="mt-1 block w-full border rounded p-2 border-gray-300" />
            {errors.systemSizeKw && <p className="text-red-500 text-xs mt-1">{errors.systemSizeKw.message}</p>}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Down Payment (€, Optional)</label>
            <input type="number" {...register("downPayment")} className="mt-1 block w-full border rounded p-2 border-gray-300" />
            {errors.downPayment && <p className="text-red-500 text-xs mt-1">{errors.downPayment.message}</p>}
          </div>
        </div>

        {submitError && (
          <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded">
            {submitError}
          </div>
        )}

        <button type="submit" disabled={isSubmitting} className="w-full bg-emerald-600 text-white p-2 rounded font-medium hover:bg-emerald-700 transition disabled:bg-gray-400">
          {isSubmitting ? "Calculating Offers..." : "Get Pre-Qualification"}
        </button>
      </form>
      
      {/* Typed Results Render Block */}
      {serverResult && (
        <div className="mt-6 p-6 bg-emerald-50 border border-emerald-200 rounded-md space-y-4">
          <h3 className="text-lg font-bold text-emerald-900">Your Quote Results</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-b border-emerald-200 pb-4 text-sm text-emerald-800">
            <p><strong>System Price:</strong> €{serverResult.systemPrice.toLocaleString()}</p>
            <p><strong>Principal Amount:</strong> €{serverResult.principalAmount.toLocaleString()}</p>
            <p><strong>Risk Band:</strong> <span className="inline-block px-2 py-0.5 bg-emerald-200 font-bold rounded text-xs">{serverResult.riskBand}</span></p>
          </div>
          
          <div>
            <h4 className="text-sm font-semibold text-emerald-900 mb-2">Available Financing Installments</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {serverResult.offers.map((offer) => (
                <div key={offer.termYears} className="bg-white p-4 border border-emerald-100 rounded shadow-sm flex flex-col justify-between">
                  <div>
                    <p className="text-xs uppercase tracking-wider font-bold text-gray-400">{offer.termYears} Year Term</p>
                    <p className="text-2xl font-black text-gray-800 mt-1">€{offer.monthlyPayment.toFixed(2)}<span className="text-xs font-normal text-gray-500">/mo</span></p>
                  </div>
                  <p className="text-xs text-gray-500 mt-3 pt-2 border-t border-gray-100">APR: <strong>{offer.apr}%</strong></p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
