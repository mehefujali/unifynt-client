import * as z from "zod";

export const addTeacherSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(1, "Phone number is required"),
  gender: z.enum(["MALE", "FEMALE", "OTHER"]),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  address: z.string().optional().or(z.literal("")),

  employeeId: z.string().optional().or(z.literal("")),
  department: z.string().optional().or(z.literal("")),
  designation: z.string().min(1, "Designation is required"),
  qualification: z.string().min(1, "Qualification is required"),
  employmentType: z
    .enum(["FULL_TIME", "PART_TIME", "CONTRACT", "GUEST"])
    .default("FULL_TIME"),
  experienceYears: z.coerce.number().optional(),
  joiningDate: z.string().min(1, "Joining date is required"),
  linkedinUrl: z.string().optional().or(z.literal("")),

  profileImage: z.string().optional().or(z.literal("")),
  resumeUrl: z.string().optional().or(z.literal("")),
  emergencyContactName: z.string().optional().or(z.literal("")),
  emergencyContactPhone: z.string().optional().or(z.literal("")),
});

export type AddTeacherFormValues = z.infer<typeof addTeacherSchema>;

export const editTeacherSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(1, "Phone number is required"),
  gender: z.enum(["MALE", "FEMALE", "OTHER"]),
  dateOfBirth: z.string().min(1, "Date of birth is required"),
  address: z.string().optional().or(z.literal("")),

  employeeId: z.string().optional().or(z.literal("")),
  department: z.string().optional().or(z.literal("")),
  designation: z.string().min(1, "Designation is required"),
  qualification: z.string().min(1, "Qualification is required"),
  employmentType: z.enum(["FULL_TIME", "PART_TIME", "CONTRACT", "GUEST"]),
  experienceYears: z.coerce.number().optional(),
  joiningDate: z.string().min(1, "Joining date is required"),
  linkedinUrl: z.string().optional().or(z.literal("")),

  profileImage: z.string().optional().or(z.literal("")),
  resumeUrl: z.string().optional().or(z.literal("")),
  emergencyContactName: z.string().optional().or(z.literal("")),
  emergencyContactPhone: z.string().optional().or(z.literal("")),
});

export type EditTeacherFormValues = z.infer<typeof editTeacherSchema>;
