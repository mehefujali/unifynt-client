import { z } from "zod/v3";

export const routineSchema = z
  .object({
    classId: z.string().min(1, "Class is required"),
    sectionId: z.string().min(1, "Section is required"),
    subjectId: z.string().min(1, "Subject is required"),
    teacherId: z.string().optional().nullable(),
    day: z.enum([
      "SUNDAY",
      "MONDAY",
      "TUESDAY",
      "WEDNESDAY",
      "THURSDAY",
      "FRIDAY",
      "SATURDAY",
    ]),
    startTime: z.string().min(1, "Start time is required"),
    endTime: z.string().min(1, "End time is required"),
    roomNo: z.string().optional().nullable(),
  })
  .refine((data) => data.startTime < data.endTime, {
    message: "Start time must be before end time",
    path: ["startTime"],
  });

export type RoutineFormValues = z.infer<typeof routineSchema>;
