export type InstallmentOffer = {
  termYears: number;
  apr: number;
  principalUsed: number;
  monthlyPayment: number;
}

export type RiskBand = "A" | "B" | "C";

export type Quote = {
  id: string;
  userId: string;
  fullName: string;
  email: string;
  address: string;
  monthlyConsumptionKwh: number;
  systemSizeKw: number;
  downPayment: number;
  systemPrice: number;
  principalAmount: number;
  riskBand: string;
  offers: RiskBand;
  createdAt: Date; 
};

export type CalculatedQuoteSummary = {
  systemPrice: number;
  principalAmount: number;
  riskBand: RiskBand;
  offers: InstallmentOffer[];
}
