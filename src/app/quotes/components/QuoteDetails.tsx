"use client";

import React, { useState } from "react";
import Link from "next/link";
import { InstallmentOffer, PdfQuoteData } from "@/lib/utils/types";
import { generateQuotePdf } from "@/lib/utils/quotePdfUtils";

type QuoteResultsClientProps = {
  quote: PdfQuoteData;
  parsedOffers: InstallmentOffer[];
  userRole: string;
};

export default function QuoteResultsClient({
  quote,
  parsedOffers,
  userRole,
}: QuoteResultsClientProps) {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleDownloadPdf = async () => {
    setIsGenerating(true);
    try {
      // Small macro-task delay to ensure UI updates the button state if rendering takes a split second
      await new Promise((resolve) => setTimeout(resolve, 50));
      generateQuotePdf(quote, parsedOffers);
    } catch (err) {
      console.error("Failed to compile PDF download stream:", err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        {/* Navigation Breadcrumb & Actions Bar */}
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-8">
          <Link
            href={userRole === "ADMIN" ? "/admin/quotes" : "/quotes"}
            className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
          >
            ← Back to Pipeline Dashboard
          </Link>

          <div className="flex items-center gap-3">
            <button
              onClick={handleDownloadPdf}
              disabled={isGenerating || parsedOffers.length === 0}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isGenerating ? "Compiling PDF..." : "↓ Export Document PDF"}
            </button>

            <span
              className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                quote.riskBand === "A"
                  ? "bg-green-100 text-green-800"
                  : quote.riskBand === "B"
                    ? "bg-yellow-100 text-yellow-800"
                    : "bg-red-100 text-red-800"
              }`}
            >
              Credit Risk Band: {quote.riskBand}
            </span>
          </div>
        </div>

        {/* SECTION 1: Consumer & Solar Array Core Specifications */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-8">
          <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
            <h2 className="text-lg font-bold text-gray-900">
              System Parameters Summary
            </h2>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
                Target Consumer
              </h3>
              <p className="font-semibold text-gray-900 text-base">
                {quote.fullName}
              </p>
              <p className="text-gray-600">{quote.email}</p>
              <p className="text-gray-500 mt-1">{quote.address}</p>
            </div>
            <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg border border-gray-100">
              <div>
                <span className="block text-xs font-medium text-gray-500">
                  System Dimension
                </span>
                <span className="text-lg font-bold text-gray-900">
                  {quote.systemSizeKw.toFixed(2)} kWp
                </span>
              </div>
              <div>
                <span className="block text-xs font-medium text-gray-500">
                  Monthly Consumption
                </span>
                <span className="text-lg font-bold text-gray-900">
                  {quote.monthlyConsumptionKwh} kWh
                </span>
              </div>
              <div>
                <span className="block text-xs font-medium text-gray-500">
                  Gross Price
                </span>
                <span className="text-lg font-bold text-gray-900">
                  €{quote.systemPrice.toLocaleString("de-DE")}
                </span>
              </div>
              <div>
                <span className="block text-xs font-medium text-gray-500">
                  Financing Principal
                </span>
                <span className="text-lg font-bold text-green-600">
                  €{quote.principalAmount.toLocaleString("de-DE")}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 2: Dynamic Side-by-Side Financial Offer Configuration */}
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Calculated Financial Product Packages
        </h2>

        {parsedOffers.length === 0 ? (
          <div className="bg-white text-center rounded-xl p-8 border border-gray-200 text-gray-500 text-sm">
            No valid custom financing structures could be generated based on
            these parameter margins.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {parsedOffers.map((offer, index) => (
              <div
                key={index}
                className="bg-white rounded-xl shadow-sm border p-6 flex flex-col justify-between transition-all hover:shadow-md"
              >
                <div>
                  <div className="border-t border-b border-gray-100 py-4 my-4">
                    <span className="block text-xs font-medium text-gray-500">
                      Monthly Installment
                    </span>
                    <span className="text-3xl font-black text-gray-900 tracking-tight">
                      €
                      {offer.monthlyPayment.toLocaleString("de-DE", {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </span>
                    <span className="text-xs text-gray-500"> / month</span>
                  </div>

                  <div className="space-y-2 text-xs text-gray-600 mb-6">
                    <div className="flex justify-between">
                      <span>Amortization Term:</span>
                      <span className="font-semibold text-gray-900">
                        {offer.termYears} Years ({offer.termYears * 12} Months)
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>APR:</span>
                      <span className="font-semibold text-gray-900">
                        {offer.apr}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Principal Used:</span>
                      <span className="font-semibold text-gray-900">
                        €{offer.principalUsed.toLocaleString("de-DE")}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Aggregate Cost over Term:</span>
                      <span className="font-semibold text-gray-900">
                        €
                        {(
                          offer.monthlyPayment *
                          offer.termYears *
                          12
                        ).toLocaleString("de-DE", {
                          maximumFractionDigits: 2,
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
