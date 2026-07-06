import { logger } from "@/lib/logger";
import { prisma } from "@/lib/prisma";
import { calculateQuote } from "@/lib/utils/pricing";
import { quoteSchema } from "@/lib/validations/quote";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import { authOptions } from "../auth/[...nextauth]/route";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    logger.warn("Unauthorized resource request blocked: No active session context parsed.");
    return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
  }

  const userId = session.user.id;

  try {
    const body = await req.json();
    const validationResult = quoteSchema.safeParse(body);
    
    if (!validationResult.success) {
      logger.warn(
        { userId, validationErrors: validationResult.error.flatten().fieldErrors },
        "Rejected quote pipeline entry due to malformed metadata parameters."
      );
      return NextResponse.json(
        { error: "Invalid form input data parameters structural layout", details: validationResult.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const data = validationResult.data;

    logger.info(
      { userId, clientEmail: data.email },
      "Initiating backend calculations and data persistence for new quote evaluation."
    );

    const calculatedQuote = calculateQuote(data)

    // 3. Complete Persistence Write satisfying the schema rules
    const newQuote = await prisma.quote.create({
      data: {
        userId: userId,
        fullName: data.fullName,
        email: data.email,
        address: data.address,
        monthlyConsumptionKwh: data.monthlyConsumptionKwh,
        downPayment: data.downPayment,
        systemSizeKw: data.systemSizeKw as number,
        systemPrice: calculatedQuote.systemPrice,   
        principalAmount: calculatedQuote.principalAmount, 
        riskBand: calculatedQuote.riskBand,          
        offers: calculatedQuote.offers,
      },
    });

    logger.info(
      { userId, quoteId: newQuote.id },
      "New quote evaluated, stored, and verified successfully with full fields."
    );

    return NextResponse.json({ quote: newQuote }, { status: 201 });

  } catch (error) {
    if(error instanceof Error) {
        logger.error(
          { userId, errorMessage: error.message, errorStack: error.stack },
          "Critical processing engine breakdown while compiling new quote configuration files."
        );
    }

    return NextResponse.json(
      { error: "Internal processing anomaly tripped within underlying database service engine." },
      { status: 500 }
    );
  }
}
