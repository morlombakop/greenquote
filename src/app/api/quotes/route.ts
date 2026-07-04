import { NextResponse } from "next/server";
import { quoteSchema } from "@/lib/validations/quote";
import { logger } from "@/lib/logger";
import { calculateQuote } from "@/lib/utils/pricing";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Server-side validation parsing using the exact same Zod schema rules
    const validation = quoteSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { errors: validation.error.flatten().fieldErrors },
        { status: 400 },
      );
    }

    // Execute our deterministic pricing model calculation matrix
    const calculatedResults = calculateQuote(validation.data);

    return NextResponse.json({
      success: true,
      ...calculatedResults
    });
  } catch (error) {
    logger.error(
      {
        path: "/api/quotes",
        method: "POST",
        errorMessage: error instanceof Error ? error.message : "Unknown",
        stack: error instanceof Error ? error.stack : undefined,
      },
      "Unhandled runtime error during quote processing",
    );

    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
