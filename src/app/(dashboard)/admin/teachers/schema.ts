import * as z from "zod";

export const addTeacherSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  gender: z.enum(["MALE", "FEMALE", "OTHER"], {
    required_error: "Gender is required",
  }),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  phone: z.string().optional(),
  designation: z.string().optional(),
  qualification: z.string().optional(),
  joiningDate: z.string().optional(),
});

export type AddTeacherFormValues = z.infer<typeof addTeacherSchema>;
