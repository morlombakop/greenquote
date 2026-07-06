import { QuoteInput } from "../validations/quote";
import type {
  CalculatedQuoteSummary,
  InstallmentOffer,
  RiskBand,
} from "./types";

/**
 * Calculates system pricing, evaluates risk bands, and generates standard
 * amortization schedules for residential solar finance applications.
 */
export function calculateQuote(input: QuoteInput): CalculatedQuoteSummary {
  // 1. System price: systemSizeKw * 1200 (Sticking to Euros)
  const systemPrice = Number(input.systemSizeKw) * 1200;
  const systemSizeKw = Number(input.systemSizeKw);

  // 2. Principal amount: systemPrice minus downPayment
  const downPaymentValue = Number(input.downPayment) ?? 0;
  const principalAmount = Math.max(0, systemPrice - downPaymentValue);

  // 3. Determine coarse Risk Band & Base APR
  // - A: consumption >= 400 AND systemSize <= 6 (APR: 6.9%)
  // - B: otherwise if consumption >= 250 (APR: 8.9%)
  // - C: otherwise (APR: 11.9%)
  let riskBand: RiskBand = "C";
  let apr = 11.9;
  const consumptionKwh = Number(input.monthlyConsumptionKwh);

  if (consumptionKwh >= 400 && systemSizeKw <= 6) {
    riskBand = "A";
    apr = 6.9;
  } else if (consumptionKwh >= 250) {
    riskBand = "B";
    apr = 8.9;
  }

  // 4. Generate standard installment offers for 5, 10, and 15 year terms
  const terms = [5, 10, 15];
  const offers: InstallmentOffer[] = terms.map((years) => {
    const totalPayments = years * 12;
    let monthlyPayment = 0;

    if (principalAmount > 0) {
      const monthlyRate = apr / 100 / 12;

      // Standard Amortization Formula: P * [r(1+r)^n] / [(1+r)^n - 1]
      monthlyPayment =
        (principalAmount *
          (monthlyRate * Math.pow(1 + monthlyRate, totalPayments))) /
        (Math.pow(1 + monthlyRate, totalPayments) - 1);
    }

    return {
      termYears: years,
      apr,
      principalUsed: principalAmount,
      // Rounded cleanly to 2 decimal places for real currency representation
      monthlyPayment: Math.round(monthlyPayment * 100) / 100,
    };
  });

  return {
    systemPrice,
    principalAmount,
    riskBand,
    offers,
  };
}
