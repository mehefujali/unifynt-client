import * as z from "zod/v3";

export const payrollItemSchema = z.object({
  title: z.string().min(1, "Title is required"),
  amount: z.coerce.number().min(0, "Amount must be positive"),
});

export const generateSalarySchema = z.object({
  month: z.coerce.number().min(1).max(12),
  year: z.coerce.number().min(2000),
  allowances: z.array(payrollItemSchema).default([]),
  deductions: z.array(payrollItemSchema).default([]),
});

export const addAdjustmentSchema = z.object({
  type: z.enum(["ALLOWANCE", "DEDUCTION"]),
  title: z.string().min(1, "Title is required"),
  amount: z.coerce.number().min(1, "Amount must be greater than 0"),
});

export type GenerateSalaryFormValues = z.infer<typeof generateSalarySchema>;
export type AddAdjustmentFormValues = z.infer<typeof addAdjustmentSchema>;