import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import React from 'react';
import { authOptions } from '../../api/auth/[...nextauth]/route';
import FilterBlock from './components/FilterBlock';
import KpiStats from './components/KpiStats';

export const dynamic = 'force-dynamic';

type PageProps = {
  searchParams: Promise<{
    search?: string;
    userId?: string;
  }>;
};

export default async function AdminDashboardPage({ searchParams }: PageProps) {
  const session = await getServerSession(authOptions);

  if (!session || session.user.role !== 'ADMIN') {
    redirect('/quotes');
  }

  // Resolve search parameters for server-side filtering
  const params = await searchParams;
  const searchQuery = params.search || '';
  const selectedUserId = params.userId || '';

  const uniqueUsers = await prisma.user.findMany({
    where: {
      quotes: {
        some: {},
      },
    },
    select: {
      id: true,
      name: true,
      email: true,
    },
    orderBy: { name: 'asc' },
  });

  // Build dynamic Prisma query filters based on active search parameters
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const whereClause: any = {};

  if (selectedUserId) {
    whereClause.userId = selectedUserId;
  }

  if (searchQuery) {
    whereClause.OR = [
      { fullName: { contains: searchQuery } },
      { email: { contains: searchQuery } },
      { user: { name: { contains: searchQuery } } },
      { user: { email: { contains: searchQuery } } },
    ];
  }

  const quotes = await prisma.quote.findMany({
    where: whereClause,
    orderBy: { createdAt: 'desc' },
    include: {
      user: {
        select: {
          name: true,
          email: true,
        },
      },
    },
  });

  // Mathematical summary reductions for KPI stats cards
  const totalVolume = quotes.length;
  const totalPipelineValue = quotes.reduce((acc, q) => acc + q.systemPrice, 0);
  const totalFinancedValue = quotes.reduce(
    (acc, q) => acc + q.principalAmount,
    0
  );

  const riskDistribution = quotes.reduce(
    (acc, q) => {
      if (q.riskBand === 'A' || q.riskBand === 'B' || q.riskBand === 'C') {
        acc[q.riskBand] = (acc[q.riskBand] || 0) + 1;
      }
      return acc;
    },
    { A: 0, B: 0, C: 0 } as { A: number; B: number; C: number }
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Block */}
        <div className="flex justify-between items-center border-b border-gray-200 pb-5 mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900">
              Admin Control Center
            </h1>
            <p className="mt-2 text-sm text-gray-600">
              Global system monitoring, credit risks metrics, and generated
              quote infrastructure audits.
            </p>
          </div>
          <Link
            href="/api/auth/signout"
            className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors shadow-sm"
          >
            Sign Out
          </Link>
        </div>

        <KpiStats
          totalVolume={totalVolume}
          totalPipelineValue={totalPipelineValue}
          totalFinancedValue={totalFinancedValue}
          riskDistribution={riskDistribution}
        />

        <FilterBlock
          searchQuery={searchQuery}
          selectedUserId={selectedUserId}
          uniqueUsers={uniqueUsers}
        />

        {/* Audit Pipeline Tracking Grid */}
        <div className="bg-white shadow-sm border border-gray-200 rounded-xl overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
            <h3 className="text-base font-medium text-gray-900">
              Central Application Pipeline Audit
            </h3>
          </div>

          {quotes.length === 0 ? (
            <div className="p-12 text-center text-sm text-gray-500">
              No portfolio database records found matching the active criteria.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Internal Partner Account
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      End Consumer
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      System Parameters
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Financed Principal
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Risk Matrix
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200 text-sm">
                  {quotes.map((quote) => (
                    <tr
                      key={quote.id}
                      className="hover:bg-gray-50 transition-colors"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-semibold text-gray-900">
                          {quote.user.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {quote.user.email}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-gray-900 font-medium">
                          {quote.fullName}
                        </div>
                        <div className="text-xs text-gray-500">
                          {quote.email}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-700">
                        <span className="font-semibold text-gray-900">
                          {quote.systemSizeKw.toFixed(1)} kWp
                        </span>{' '}
                        array size
                        <div className="text-gray-500">
                          {quote.monthlyConsumptionKwh} kWh / month demand
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">
                        €
                        {quote.principalAmount.toLocaleString('de-DE', {
                          minimumFractionDigits: 2,
                        })}
                      </td>
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
                          Risk Band {quote.riskBand}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <a
                          href={`/quotes/${quote.id}`}
                          className="inline-flex items-center text-green-600 hover:text-green-900 bg-green-50 hover:bg-green-100 px-3 py-1.5 rounded-md text-xs transition-colors"
                        >
                          Audit File
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
