import * as z from "zod";

export const renewalSchema = z.object({
  planId: z.string().min(1, "Please select a subscription plan"),
  durationMonths: z
    .number()
    .min(3, "Minimum duration is 3 months")
    .max(36, "Maximum duration is 3 years"),
});

export type RenewalFormValues = z.infer<typeof renewalSchema>;
