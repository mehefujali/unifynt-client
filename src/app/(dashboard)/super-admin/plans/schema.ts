import * as z from "zod/v3";

export const planSchema = z.object({
  name: z.string().min(1, "Plan name is required"),
  pricePerMonth: z
    .number({ invalid_type_error: "Must be a number" })
    .min(0, "Price cannot be negative"),
  studentLimit: z
    .number({ invalid_type_error: "Must be a number" })
    .min(1, "Must be at least 1"),
  features: z
    .array(z.object({ value: z.string().min(1, "Feature cannot be empty") }))
    .min(1, "Add at least one feature"),
  extraOffers: z.string().optional(),
  isActive: z.boolean().default(true),
});

export type PlanFormValues = z.infer<typeof planSchema>;
