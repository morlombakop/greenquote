export type QuoteUser = {
  name: string | null;
  email: string | null;
}

export type  Quote = {
  id: string;
  fullName: string;
  email: string;
  systemSizeKw: number;
  monthlyConsumptionKwh: number;
  principalAmount: number;
  riskBand: string;
  createdAt: Date | string;
  user: QuoteUser;
}
