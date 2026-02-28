import { z } from "zod/v3";

export const routineSchema = z.object({
    classId: z.string().min(1, "Class is required"),
    sectionId: z.string().min(1, "Section is required"),
    periodId: z.string().min(1, "Period is required"),
    subjectId: z.string().nullable().optional(),
    teacherId: z.string().nullable().optional(),
    day: z.enum(["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"], {
        required_error: "Day is required",
    }),
    roomNo: z.string().nullable().optional(),
});

export type RoutineFormValues = z.infer<typeof routineSchema>;