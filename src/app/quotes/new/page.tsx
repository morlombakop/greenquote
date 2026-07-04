"use client";

import React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { QuoteForm, QuoteFormData } from "@/components/quotes/QuoteForm";

export default function NewQuotePage() {
  const router = useRouter();

  const handleCreateQuote = async (values: QuoteFormData) => {
    const response = await fetch("/api/quotes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(values),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Failed to process quote configurations.");
    }

    router.push(`/quotes/${data.quote.id}`);
    router.refresh();
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Link href="/quotes" className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors">
            ← Cancel and Return to List
          </Link>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
            <h1 className="text-xl font-bold text-gray-900">Configure New Solar Evaluation File</h1>
            <p className="text-xs text-gray-500 mt-1">Provide installation details below to run our underwriting risk assessment matrix.</p>
          </div>

          <div className="p-6">
            <QuoteForm onSubmit={handleCreateQuote} />
          </div>
        </div>
      </div>
    </div>
  );
}
