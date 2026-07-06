import { z } from "zod";

// export const quoteSchema = z.object({
//   fullName: z.string().min(2, "Full name must be at least 2 characters"),
//   email: z.string().email("Invalid email address"),
//   address: z.string().min(5, "Address must be at least 5 characters"),
//   monthlyConsumptionKwh: z.coerce
//     .number()
//     .positive("Consumption must be a positive number"),
//   systemSizeKw: z.coerce
//     .number()
//     .positive("System size must be a positive number") as unknown as number,
//   downPayment: z.coerce
//     .number()
//     .nonnegative("Down payment cannot be negative")
//     .optional()
//     .default(0),
// });

// export type QuoteInput = z.input<typeof quoteSchema>;

// import * as z from "zod";

// Check and compare with validation quote
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

// export type QuoteFormData = z.infer<typeof quoteSchema>;

export type QuoteInput = z.input<typeof quoteSchema>;
