import { z } from "zod/v3";

export const subjectSchema = z.object({
  name: z.string().min(1, "Subject name is required"),
  code: z.string().min(1, "Subject code is required").toUpperCase(),
  classId: z.string().min(1, "Please select a class"),
  bookName: z.string().optional(),
  type: z.enum(["THEORY", "PRACTICAL", "OPTIONAL", "LAB"]),
  credit: z.number().min(0, "Credit must be a positive number"),
});

export type SubjectFormValues = z.infer<typeof subjectSchema>;
