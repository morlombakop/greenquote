import type {
  CalculatedQuoteSummary,
  InstallmentOffer,
  RiskBand,
  CalculateQuoteInput,
} from './types';

const PRICING_CONFIG = {
  PRICE_PER_KW: 1200,
  MONTHS_PER_YEAR: 12,
  PERCENTAGE_DIVISOR: 100,
  CURRENCY_DECIMAL_PLACES: 2,
  CURRENCY_ROUNDING_MULTIPLIER: 100, // 10^2 for rounding to cents
} as const;

const RISK_RULES = {
  BAND_A: {
    MIN_CONSUMPTION: 400,
    MAX_SYSTEM_SIZE: 6,
    APR: 6.9,
  },
  BAND_B: {
    MIN_CONSUMPTION: 250,
    APR: 8.9,
  },
  BAND_C: {
    APR: 11.9,
  },
} as const;

const STANDARD_TERMS_YEARS = [5, 10, 15] as const;

/**
 * Calculates system pricing, evaluates risk bands, and generates standard
 * amortization schedules for residential solar finance applications.
 */
export function calculateQuote(
  input: CalculateQuoteInput
): CalculatedQuoteSummary {
  const systemSizeKw = Number(input.systemSizeKw);

  // System price: systemSizeKw * base price per Kw
  const systemPrice = systemSizeKw * PRICING_CONFIG.PRICE_PER_KW;

  // Principal amount: systemPrice minus downPayment
  const downPaymentValue = Number(input.downPayment) ?? 0;
  const principalAmount = Math.max(0, systemPrice - downPaymentValue);

  // Determine coarse Risk Band & Base APR
  let riskBand: RiskBand = 'C';
  let apr: 6.9 | 8.9 | 11.9 = RISK_RULES.BAND_C.APR;
  const consumptionKwh = Number(input.monthlyConsumptionKwh);

  if (
    consumptionKwh >= RISK_RULES.BAND_A.MIN_CONSUMPTION &&
    systemSizeKw <= RISK_RULES.BAND_A.MAX_SYSTEM_SIZE
  ) {
    riskBand = 'A';
    apr = RISK_RULES.BAND_A.APR;
  } else if (consumptionKwh >= RISK_RULES.BAND_B.MIN_CONSUMPTION) {
    riskBand = 'B';
    apr = RISK_RULES.BAND_B.APR;
  }

  // Generate standard installment offers
  const offers: InstallmentOffer[] = STANDARD_TERMS_YEARS.map((years) => {
    const totalPayments = years * PRICING_CONFIG.MONTHS_PER_YEAR;
    let monthlyPayment = 0;

    if (principalAmount > 0) {
      const monthlyRate =
        apr /
        PRICING_CONFIG.PERCENTAGE_DIVISOR /
        PRICING_CONFIG.MONTHS_PER_YEAR;

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
      monthlyPayment:
        Math.round(
          monthlyPayment * PRICING_CONFIG.CURRENCY_ROUNDING_MULTIPLIER
        ) / PRICING_CONFIG.CURRENCY_ROUNDING_MULTIPLIER,
    };
  });

  return {
    systemPrice,
    principalAmount,
    riskBand,
    offers,
  };
}
