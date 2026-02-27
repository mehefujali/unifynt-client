import { z } from "zod/v3";

const MAX_FILE_SIZE = 5000000;
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

export const templateSchema = z.object({
  templateCode: z.string().min(1, "Template code is required"),
  name: z.string().min(1, "Template name is required"),
  description: z.string().optional(),
  defaultThemeSettings: z.string().optional(),
  defaultContent: z.string().optional(),
  isActive: z.boolean(),
  thumbnail: z
    .any()
    .refine((files) => !files || files?.length === 0 || files?.[0]?.size <= MAX_FILE_SIZE, "Max file size is 5MB.")
    .refine(
      (files) => !files || files?.length === 0 || ACCEPTED_IMAGE_TYPES.includes(files?.[0]?.type),
      "Only .jpg, .jpeg, .png and .webp formats are supported."
    )
    .optional(),
});

export type TemplateFormValues = z.infer<typeof templateSchema>;