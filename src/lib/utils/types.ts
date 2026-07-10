export type InstallmentOffer = {
  termYears: number;
  apr: number;
  principalUsed: number;
  monthlyPayment: number;
};

export type RiskBand = 'A' | 'B' | 'C';

export type CalculatedQuoteSummary = {
  systemPrice: number;
  principalAmount: number;
  riskBand: RiskBand;
  offers: InstallmentOffer[];
};

export type CalculateQuoteInput = {
  systemSizeKw: number;
  downPayment: number;
  monthlyConsumptionKwh: number;
};

export type PdfQuoteData = {
  id: string;
  riskBand: string;
  fullName: string;
  email: string;
  address: string;
  systemSizeKw: number;
  monthlyConsumptionKwh: number;
  systemPrice: number;
  principalAmount: number;
  createdAt?: string | Date;
};
