import { NextResponse } from "next/server";
import { logger } from "@/lib/logger";
import { prisma } from "@/lib/prisma";

// Force runtime execution dynamically to prevent Next.js from caching previous up-times
export const dynamic = "force-dynamic";

export async function GET() {
  const timestamp = new Date().toISOString();
  
  const healthStatus = {
    status: "UP" as "UP" | "DEGRADED",
    timestamp,
    uptime: process.uptime(),
    services: {
      database: "UP" as "UP" | "DOWN",
    },
  };

  try {
    // Execute a primitive raw query to check connection health without pulling table overhead
    await prisma.$queryRaw`SELECT 1`;
    healthStatus.services.database = "UP";
  } catch (error) {
    if(error instanceof Error) {
        logger.error({
          errorMessage: error.message,
          errorStack: error.stack,
        },"Health check database dependency probe failed.");
    }

    healthStatus.services.database = "DOWN";
    healthStatus.status = "DEGRADED";
  }

  // If the database is completely unresponsive, return a 503 status
  if (healthStatus.status === "DEGRADED") {
    return NextResponse.json(healthStatus, { 
      status: 503,
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
      }
    });
  }

  // Return a healthy 200 OK along with complete runtime telemetry
  return NextResponse.json(healthStatus, {
    status: 200,
    headers: {
      "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
    }
  });
}
