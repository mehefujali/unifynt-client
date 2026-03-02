import { z } from "zod";

export const fieldSchema = z.object({
  id: z.string(),
  label: z.string().min(1, "Label is required"),
  type: z.enum([
    "TEXT",
    "TEXTAREA",
    "NUMBER",
    "EMAIL",
    "SELECT",
    "RADIO",
    "CHECKBOX",
    "DATE",
    "FILE",
    "SIGNATURE",
  ]),
  required: z.boolean(),
  placeholder: z.string().optional(),
  optionsString: z.string().optional(),
});

export const customFormSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  slug: z.string().min(3, "URL Slug is required"),
  status: z.enum(["DRAFT", "PUBLISHED", "CLOSED"]),
  fields: z.array(fieldSchema).min(1, "At least one field is required"),
  settings: z.object({
    limit: z.number().nullable().optional(),
    expiryDate: z.string().nullable().optional(),
    notifyAdmin: z.boolean(),
    isMultipleStep: z.boolean(),
    syncToGoogleSheet: z.boolean(),
  }),
});

export type CustomFormValues = z.infer<typeof customFormSchema>;
