export type InstallmentOffer = {
  termYears: number;
  apr: number;
  principalUsed: number;
  monthlyPayment: number;
}

export type RiskBand = "A" | "B" | "C";

export type CalculatedQuoteSummary = {
  systemPrice: number;
  principalAmount: number;
  riskBand: RiskBand;
  offers: InstallmentOffer[];
}
