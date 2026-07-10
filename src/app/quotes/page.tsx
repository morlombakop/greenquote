import QuotesList from '@/app/quotes/components/QuotesList';
import { prisma } from '@/lib/prisma';
import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import React from 'react';
import { authOptions } from '../api/auth/[...nextauth]/route';

// Force Next.js to bypass caching so newly calculated quotes show up instantly
export const dynamic = 'force-dynamic';

export default async function QuotesListPage() {
  // 1. Authenticate user context server-side
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/login');
  }

  const { id: userId, role: userRole } = session.user;
  const isAdmin = userRole === 'ADMIN';

  // 2. Fetch data based on permissions scope
  const quotes = await prisma.quote.findMany({
    // Admins see everything; standard users see only theirs
    where: isAdmin ? {} : { userId },
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

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <QuotesList quotes={quotes} isAdmin={isAdmin} />
      </div>
    </div>
  );
}
