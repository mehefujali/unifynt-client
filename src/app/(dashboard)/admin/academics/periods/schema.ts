import { z } from "zod";

const timeStringSchema = z.string().regex(/^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/, "Invalid time format");

export const periodSchema = z.object({
    name: z.string().min(1, "Period name is required"),
    startTime: timeStringSchema,
    endTime: timeStringSchema,
    type: z.enum(["CLASS", "BREAK"]),
    days: z.array(z.string()).min(1, "Select at least one day"),
}).refine(data => data.startTime < data.endTime, {
    message: "Start time must be before end time",
    path: ["startTime"]
});

export type PeriodFormValues = z.infer<typeof periodSchema>;