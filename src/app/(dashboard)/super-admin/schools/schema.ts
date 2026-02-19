import * as z from "zod/v3";

export const editSchoolSchema = z.object({
  name: z.string().min(1, "School name is required"),
  slug: z.string().min(1, "Slug is required"),
  subdomain: z.string().min(1, "Subdomain is required"),
  customDomain: z.string().optional().or(z.literal("")),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  phone: z.string().optional().or(z.literal("")),
  website: z.string().optional().or(z.literal("")),
  address: z.string().optional().or(z.literal("")),
  principalName: z.string().optional().or(z.literal("")),
  principalPhone: z.string().optional().or(z.literal("")),
  establishedYear: z
    .number({ invalid_type_error: "Must be a number" })
    .optional(),
  registrationCode: z.string().optional().or(z.literal("")),
  taxId: z.string().optional().or(z.literal("")),
  billingAddress: z.string().optional().or(z.literal("")),
  timezone: z.string().optional().or(z.literal("")),
  currency: z.string().optional().or(z.literal("")),
  isActive: z.boolean().optional(),
  smsBalance: z.number({ invalid_type_error: "Must be a number" }).optional(),
});

export type EditSchoolFormValues = z.infer<typeof editSchoolSchema>;

export const renewSchoolSchema = z.object({
  planId: z.string().min(1, "Plan is required"),
  studentLimit: z
    .number({ invalid_type_error: "Must be a number" })
    .min(1, "Must be at least 1"),
  subscriptionEnd: z.string().min(1, "End date is required"),
  paymentMethod: z.enum(["CASH", "ONLINE", "BANK_TRANSFER"]),
  amount: z
    .number({ invalid_type_error: "Must be a number" })
    .min(0, "Amount is required"),
});

export type RenewSchoolFormValues = z.infer<typeof renewSchoolSchema>;
