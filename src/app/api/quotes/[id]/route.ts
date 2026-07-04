import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const timestamp = new Date().toISOString();
  const quoteId = params.id;

  try {
    // Extract the encrypted user context right from the cookies server-side
    const session = await getServerSession(authOptions);

    if (!session) {
      logger.warn({
        path: `/api/quotes/${quoteId}`,
        method: "GET",
        message: "Unauthorized attempt to access quote record",
        timestamp
      });

      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const currentUserId = session.user.id;
    const currentUserRole = session.user.role;

    const quote = await prisma.quote.findUnique({
      where: { id: params.id }
    });

    if (!quote) {
      logger.warn({
        path: `/api/quotes/${quoteId}`,
        method: "GET",
        message: "Requested quote record not found in data layer",
        userId: currentUserId,
        timestamp
      });
      return NextResponse.json({ error: "Quote record not found" }, { status: 404 });
    }

    // Enforce ownership: Block if not the owner AND not an admin
    if (quote.userId !== session.user.id && session.user.role !== "ADMIN") {
      logger.warn({
        path: `/api/quotes/${quoteId}`,
        method: "GET",
        message: "Forbidden access attempt: User lacks permission for this record",
        userId: currentUserId,
        userRole: currentUserRole,
        recordOwnerId: quote.userId,
        timestamp
      });
      return NextResponse.json({ error: "Forbidden: Access to this record is restricted" }, { status: 403 });
    }

    return NextResponse.json({ success: true, quote });

  } catch (error) {
    logger.error({
      path: `/api/quotes/${quoteId}`,
      method: "GET",
      message: "Unhandled runtime exception during single quote retrieval",
      errorName: error instanceof Error ? error.name : "UnknownError",
      errorMessage: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      timestamp
    });
    
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
