import { z } from "zod";

export const quoteSchema = z.object({
  fullName: z.string().min(2, "Full client name is required"),
  email: z.string().email("Please provide a valid contact email"),
  address: z.string().min(5, "Complete physical address is required"),
  systemSizeKw: z
    .number()
    .min(0, "System size must be a positive number"),
  monthlyConsumptionKwh: z
    .number()
    .min(50, "Minimum monthly demand is 50 kWh")
    .max(10000, "Commercial installations past 10,000 kWh, contact support"),
  downPayment: z
    .number()
    .min(0, "Down payment cannot drop below zero"),
});

export type QuoteInput = z.input<typeof quoteSchema>;
