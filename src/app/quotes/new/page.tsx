import { QuoteForm } from '@/app/quotes/components/QuoteForm';
import { prisma } from '@/lib/prisma';
import { type QuoteInput } from '@/lib/validations/quote';
import { getServerSession } from 'next-auth';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import React from 'react';
import { authOptions } from '../../api/auth/[...nextauth]/route';

export default async function NewQuotePage() {
  const session = await getServerSession(authOptions);

  if (!session?.user.id) {
    redirect('/login');
  }

  const user = await prisma.user.findUniqueOrThrow({
    where: { id: session.user.id },
  });

  const initialData: QuoteInput = {
    fullName: user.name,
    email: user.email,
    address: '',
    monthlyConsumptionKwh: 0,
    downPayment: 0,
    systemSizeKw: 0,
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <Link
            href="/quotes"
            className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
          >
            ← Cancel and Return to List
          </Link>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
            <h1
              className="text-xl font-bold text-gray-900"
              data-testid="new-quote-header"
            >
              Configure New Solar Evaluation File
            </h1>
            <p className="text-xs text-gray-500 mt-1">
              Provide installation details below to run our underwriting risk
              assessment matrix.
            </p>
          </div>

          <div className="p-6">
            <QuoteForm initialData={initialData} />
          </div>
        </div>
      </div>
    </div>
  );
}
