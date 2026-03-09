import { z } from "zod";

export const siteTemplateSchema = z.object({
  templateCode: z.string().min(1, "Template code is required"),
  name: z.string().min(1, "Template name is required"),
  description: z.string().optional().or(z.literal("")),
  isActive: z.boolean().default(true),
  thumbnailUrl: z.any().optional(),
  
  defaultThemeSettingsString: z.string().refine((val) => {
    try {
      if (!val) return true;
      JSON.parse(val);
      return true;
    } catch {
      return false;
    }
  }, { message: "Invalid JSON format" }).optional(),
  
  defaultContentString: z.string().refine((val) => {
    try {
      if (!val) return true;
      JSON.parse(val);
      return true;
    } catch {
      return false;
    }
  }, { message: "Invalid JSON format" }).optional(),
});

export type SiteTemplateFormValues = z.infer<typeof siteTemplateSchema>;