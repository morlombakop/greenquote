"use client";

import { CalculatedQuoteSummary } from "@/lib/utils/types";
import React from "react";

type QuoteResultsProps = {
  summary: CalculatedQuoteSummary;
}

export function QuoteResults({ summary }: QuoteResultsProps) {
  const { systemPrice, principalAmount, riskBand, offers } = summary;

  // Visual styling badges for risk bands
  const bandStyles = {
    A: "bg-green-100 text-green-800 border-green-200",
    B: "bg-yellow-100 text-yellow-800 border-yellow-200",
    C: "bg-red-100 text-red-800 border-red-200",
  };

  return (
    <div className="mt-8 space-y-6 border-t border-gray-200 pt-8 animate-fadeIn">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Your Pre-Qualification Summary</h3>
          <p className="text-sm text-gray-500">Based on your system size and energy consumption.</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm font-medium text-gray-500">Risk Band:</span>
          <span data-testid="quote-result-risk-band" className={`px-3 py-1 text-sm font-bold border rounded-full ${bandStyles[riskBand]}`}>
            Band {riskBand}
          </span>
        </div>
      </div>

      {/* Price Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
          <span className="block text-xs font-medium text-gray-500 uppercase tracking-wider">
            Total System Price
          </span>
          <span className="text-2xl font-bold text-gray-900"  data-testid="quote-result-system-price">
            {new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(systemPrice)}
          </span>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg border border-gray-100">
          <span className="block text-xs font-medium text-gray-500 uppercase tracking-wider">
            Financed Principal Amount
          </span>
          <span className="text-2xl font-bold text-gray-900" data-testid="quote-result-principal-amount">
            {new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(principalAmount)}
          </span>
        </div>
      </div>

      {/* Installment Offers */}
      <div>
        <h4 className="text-sm font-semibold text-gray-700 mb-3">Available Financing Terms</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4" data-testid="quote-result-offers">
          {offers.map((offer) => (
            <div
              key={offer.termYears}
              className="relative bg-white p-5 rounded-xl border border-gray-200 shadow-sm hover:border-green-500 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start mb-2">
                  <span className="text-lg font-bold text-gray-900">{offer.termYears} Years</span>
                  <span className="text-xs bg-gray-100 text-gray-600 font-medium px-2 py-0.5 rounded">
                    {offer.apr}% APR
                  </span>
                </div>
                <p className="text-xs text-gray-400 mb-4">
                  {offer.termYears * 12} monthly installments
                </p>
              </div>

              <div className="pt-4 border-t border-gray-100">
                <span className="block text-xs text-gray-500">Monthly Payment</span>
                <span className="text-xl font-extrabold text-green-600">
                  {new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR" }).format(offer.monthlyPayment)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
