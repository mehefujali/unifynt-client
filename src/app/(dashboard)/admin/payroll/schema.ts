import * as z from "zod";

export const payrollItemSchema = z.object({
  name: z.string().min(1, "Name is required"),
  amount: z.coerce.number().min(0, "Amount must be positive"),
});

export const generateSalarySchema = z.object({
  month: z.coerce.number().min(1).max(12),
  year: z.coerce.number().min(2000),
  allowances: z.array(payrollItemSchema).default([]),
  deductions: z.array(payrollItemSchema).default([]),
});

export type GenerateSalaryFormValues = z.infer<typeof generateSalarySchema>;
