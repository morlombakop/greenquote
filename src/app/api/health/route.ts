import { NextResponse } from 'next/server';
import { logger } from '@/lib/logger';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  const timestamp = new Date().toISOString();

  const healthStatus = {
    status: 'UP' as 'UP' | 'DEGRADED',
    timestamp,
    uptime: process.uptime(),
    services: {
      database: 'UP' as 'UP' | 'DOWN',
    },
  };

  try {
    await prisma.$queryRaw`SELECT 1`;
    healthStatus.services.database = 'UP';
  } catch (error) {
    if (error instanceof Error) {
      logger.error(
        {
          errorMessage: error.message,
          errorStack: error.stack,
        },
        'Health check database dependency probe failed.'
      );
    }

    healthStatus.services.database = 'DOWN';
    healthStatus.status = 'DEGRADED';
  }

  const headers = {
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
  };

  if (healthStatus.status === 'DEGRADED') {
    return NextResponse.json(healthStatus, { status: 503, headers });
  }

  return NextResponse.json(healthStatus, { status: 200, headers });
}
