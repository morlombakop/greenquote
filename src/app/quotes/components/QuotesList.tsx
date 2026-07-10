import { type Quote } from '@/types/quote';
import Link from 'next/link';
import React from 'react';

type QuotesListProps = {
  quotes: Quote[];
  isAdmin: boolean;
};

export default function QuotesList({ quotes, isAdmin }: QuotesListProps) {
  return (
    <>
      {/* Top Header Layer */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-gray-200 pb-5 mb-8 gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            {isAdmin
              ? 'Admin Console: All Pipeline Quotes'
              : 'Your Solar Quotes'}
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            {isAdmin
              ? `Reviewing ${quotes.length} aggregate offers currently logged across the platform.`
              : 'Manage and inspect your calculated installation and payment options.'}
          </p>
        </div>
        <div className="flex gap-3">
          {!isAdmin && (
            <Link
              href="/quotes/new"
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
            >
              Configure New Quote
            </Link>
          )}
          <Link
            href="/api/auth/signout"
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md shadow-sm text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors"
          >
            Sign Out
          </Link>
        </div>
      </div>

      {/* Empty State Banner */}
      {quotes.length === 0 ? (
        <div className="text-center bg-white rounded-xl shadow-sm border border-gray-200 p-12">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            No quotes generated yet
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Get started by entering consumption statistics.
          </p>
          {!isAdmin && (
            <div className="mt-6">
              <Link
                href="/quotes/new"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700"
              >
                Create First Quote
              </Link>
            </div>
          )}
        </div>
      ) : (
        /* Scannable Table Layout */
        <div className="bg-white shadow-sm border border-gray-200 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  {isAdmin && (
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Owner
                    </th>
                  )}
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Client Target
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    System Parameters
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Principal Investment
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Risk Band
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Date Created
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200 text-sm text-gray-900">
                {quotes.map((quote) => (
                  <tr
                    key={quote.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    {/* Admin-only view info */}
                    {isAdmin && (
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900">
                          {quote.user.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {quote.user.email}
                        </div>
                      </td>
                    )}

                    {/* General Client details */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium">{quote.fullName}</div>
                      <div className="text-xs text-gray-500">{quote.email}</div>
                    </td>

                    {/* Metric Specifications */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>{quote.systemSizeKw.toFixed(2)} kWp Size</div>
                      <div className="text-xs text-gray-500">
                        {quote.monthlyConsumptionKwh} kWh / mo
                      </div>
                    </td>

                    {/* Pricing Values */}
                    <td className="px-6 py-4 whitespace-nowrap font-medium">
                      €
                      {quote.principalAmount.toLocaleString('de-DE', {
                        minimumFractionDigits: 2,
                      })}
                    </td>

                    {/* Risk Categorization Badge */}
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          quote.riskBand === 'A'
                            ? 'bg-green-100 text-green-800'
                            : quote.riskBand === 'B'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-red-100 text-red-800'
                        }`}
                      >
                        Band {quote.riskBand}
                      </span>
                    </td>

                    {/* Formatting creation timestamps */}
                    <td className="px-6 py-4 whitespace-nowrap text-gray-500 text-xs">
                      {new Date(quote.createdAt).toLocaleDateString('de-DE', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                      })}
                    </td>

                    {/* Action Triggers */}
                    <td className="px-6 py-4 whitespace-nowrap text-right font-medium">
                      <Link
                        href={`/quotes/${quote.id}`}
                        className="inline-flex items-center text-green-600 hover:text-green-900 bg-green-50 hover:bg-green-100 px-3 py-1.5 rounded-md text-xs transition-colors"
                      >
                        View Details
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
}
