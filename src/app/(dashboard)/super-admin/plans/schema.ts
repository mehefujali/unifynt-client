import * as z from "zod/v3";

export const planSchema = z.object({
  name: z.string().min(1, "Plan name is required"),
  pricePerMonth: z.coerce.number().min(0, "Price must be a positive number"),
  studentLimit: z.coerce.number().min(1, "Student limit is required"),
  features: z
    .array(z.object({ value: z.string().min(1, "Feature cannot be empty") }))
    .min(1, "At least one feature is required"),
  extraOffers: z.string().optional(),
  isActive: z.boolean().default(true),
});

export type PlanFormValues = z.infer<typeof planSchema>;
