import React from "react";
import { getServerSession } from "next-auth";
import { authOptions } from "../../api/auth/[...nextauth]/route";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const dynamic = "force-dynamic";

interface OfferItem {
  provider: string;
  type: "loan" | "lease";
  termMonths: number;
  monthlyPayment: number;
  interestRate?: number;
  totalCost: number;
}

export default async function QuoteResultsPage({ params }: { params: { id: string } }) {
  // 1. Enforce Authentication Guard
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/login");
  }

  // 2. Fetch specific Quote along with consumer context
  const quote = await prisma.quote.findUnique({
    where: { id: params.id },
    include: {
      user: {
        select: { name: true, email: true }
      }
    }
  });

  if (!quote) {
    notFound();
  }

  // 3. Authorization Guard: Validate Ownership (Only resource creator or ADMIN allowed)
  if (quote.userId !== session.user.id && session.user.role !== "ADMIN") {
    redirect("/quotes");
  }

  // 4. Safe JSON Deserialization for Generated Offers
  let parsedOffers: OfferItem[] = [];
  try {
    parsedOffers = typeof quote.offers === "string" ? JSON.parse(quote.offers) : quote.offers;
  } catch (err) {
    console.error("Failed parsing offers payload structure:", err);
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        
        {/* Navigation Breadcrumb & Actions Bar */}
        <div className="flex justify-between items-center mb-8">
          <Link
            href={session.user.role === "ADMIN" ? "/admin/quotes" : "/quotes"}
            className="inline-flex items-center text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
          >
            ← Back to Pipeline Dashboard
          </Link>
          <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
            quote.riskBand === "A" ? "bg-green-100 text-green-800" :
            quote.riskBand === "B" ? "bg-yellow-100 text-yellow-800" : "bg-red-100 text-red-800"
          }`}>
            Credit Risk Band: {quote.riskBand}
          </span>
        </div>

        {/* SECTION 1: Consumer & Solar Array Core Specifications */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden mb-8">
          <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
            <h2 className="text-lg font-bold text-gray-900">System Parameters Summary</h2>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">Target Consumer</h3>
              <p className="font-semibold text-gray-900 text-base">{quote.fullName}</p>
              <p className="text-gray-600">{quote.email}</p>
              <p className="text-gray-500 mt-1">{quote.address}</p>
            </div>
            <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg border border-gray-100">
              <div>
                <span className="block text-xs font-medium text-gray-500">System Dimension</span>
                <span className="text-lg font-bold text-gray-900">{quote.systemSizeKw.toFixed(2)} kWp</span>
              </div>
              <div>
                <span className="block text-xs font-medium text-gray-500">Monthly Consumption</span>
                <span className="text-lg font-bold text-gray-900">{quote.monthlyConsumptionKwh} kWh</span>
              </div>
              <div>
                <span className="block text-xs font-medium text-gray-500">Gross Price</span>
                <span className="text-lg font-bold text-gray-900">€{quote.systemPrice.toLocaleString("de-DE")}</span>
              </div>
              <div>
                <span className="block text-xs font-medium text-gray-500">Financing Principal</span>
                <span className="text-lg font-bold text-green-600">€{quote.principalAmount.toLocaleString("de-DE")}</span>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 2: Dynamic Side-by-Side Financial Offer Configuration */}
        <h2 className="text-xl font-bold text-gray-900 mb-4">Calculated Financial Product Packages</h2>
        
        {parsedOffers.length === 0 ? (
          <div className="bg-white text-center rounded-xl p-8 border border-gray-200 text-gray-500 text-sm">
            No valid custom financing structures could be generated based on these parameter margins.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {parsedOffers.map((offer, index) => (
              <div 
                key={index}
                className={`bg-white rounded-xl shadow-sm border p-6 flex flex-col justify-between transition-all hover:shadow-md ${
                  offer.type === "loan" ? "border-green-200 ring-2 ring-green-500/5" : "border-gray-200"
                }`}
              >
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="font-bold text-gray-900 text-lg leading-tight">{offer.provider}</h3>
                      <span className={`inline-block mt-1 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                        offer.type === "loan" ? "bg-green-100 text-green-800" : "bg-blue-100 text-blue-800"
                      }`}>
                        {offer.type} Option
                      </span>
                    </div>
                    {offer.interestRate !== undefined && (
                      <span className="text-sm font-semibold bg-gray-100 text-gray-800 px-2 py-1 rounded">
                        {offer.interestRate}% APR
                      </span>
                    )}
                  </div>

                  <div className="border-t border-b border-gray-100 py-4 my-4">
                    <span className="block text-xs font-medium text-gray-500">Monthly Installment</span>
                    <span className="text-3xl font-black text-gray-900 tracking-tight">
                      €{offer.monthlyPayment.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                    <span className="text-xs text-gray-500"> / month</span>
                  </div>

                  <div className="space-y-2 text-xs text-gray-600 mb-6">
                    <div className="flex justify-between">
                      <span>Amortization Term:</span>
                      <span className="font-semibold text-gray-900">{offer.termMonths} Months ({offer.termMonths / 12} Yrs)</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Aggregate Cost over Term:</span>
                      <span className="font-semibold text-gray-900">€{offer.totalCost.toLocaleString("de-DE", { maximumFractionDigits: 0 })}</span>
                    </div>
                  </div>
                </div>

                <button className={`w-full py-2 px-4 rounded-lg text-sm font-semibold text-center transition-colors shadow-sm ${
                  offer.type === "loan" 
                    ? "bg-green-600 text-white hover:bg-green-700 focus:ring-green-500" 
                    : "bg-gray-900 text-white hover:bg-gray-800 focus:ring-gray-900"
                }`}>
                  Select {offer.provider} Plan
                </button>
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
}
