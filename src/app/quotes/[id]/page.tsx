import QuoteDetails from "@/app/quotes/components/QuoteDetails";
import logger from "@/lib/logger";
import { prisma } from "@/lib/prisma";
import { type InstallmentOffer } from "@/lib/utils/types";
import { getServerSession } from "next-auth";
import { notFound, redirect } from "next/navigation";
import React from "react";
import { authOptions } from "../../api/auth/[...nextauth]/route";

export const dynamic = "force-dynamic";

export default async function QuoteResultsPage({
  params,
}: {
  params: Promise<{ id: string }> | { id: string };
}) {
  // Enforce Authentication Guard
  const session = await getServerSession(authOptions);
  if (!session) {
    redirect("/login");
  }

  const resolvedParams = await params;
  const { id } = resolvedParams;

  // Fetch specific Quote along with consumer context
  const quote = await prisma.quote.findUnique({
    where: { id: id },
    include: {
      user: {
        select: { name: true, email: true },
      },
    },
  });

  if (!quote) {
    notFound();
  }

  // Authorization Guard: Validate Ownership
  if (quote.userId !== session.user.id && session.user.role !== "ADMIN") {
    redirect("/quotes");
  }

  let parsedOffers: InstallmentOffer[] = [];
  try {
    parsedOffers =
      typeof quote.offers === "string"
        ? JSON.parse(quote.offers)
        : (quote.offers as unknown as InstallmentOffer[]);
  } catch (err) {
    logger.error(err, "Failed parsing offers payload structure:");
  }

  return (
    <QuoteDetails
      quote={quote}
      parsedOffers={parsedOffers}
      userRole={session.user.role}
    />
  );
}
