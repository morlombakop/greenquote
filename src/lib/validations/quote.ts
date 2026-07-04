import { z } from "zod";


export const quoteSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  address: z.string().min(5, "Address must be at least 5 characters"),
  monthlyConsumptionKwh: z.coerce
    .number()
    .positive("Consumption must be a positive number"),
  systemSizeKw: z.coerce
    .number()
    .positive("System size must be a positive number") as unknown as number,
  downPayment: z.coerce
    .number()
    .nonnegative("Down payment cannot be negative")
    .optional()
    .default(0),
});

// TypeScript type extracted directly from the Zod schema
export type QuoteInput = z.input<typeof quoteSchema>;

// export type QuoteInput = {
//     fullName: string;
//     email: string;
//     address: string;
//     monthlyConsumptionKwh: number;
//     systemSizeKw: number; // ✨ Strictly a number
//     downPayment: number;
// }
