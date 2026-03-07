import { z } from "zod";

export const staffSchema = z.object({
    staffData: z.object({
        employeeId: z.string().min(1, "Employee ID is required"),
        firstName: z.string().min(1, "First name is required"),
        lastName: z.string().min(1, "Last name is required"),
        email: z.string().email("Invalid email").optional().or(z.literal("")),
        phone: z.string().min(1, "Phone is required"),
        gender: z.enum(["MALE", "FEMALE", "OTHER"]),
        dateOfBirth: z.string().min(1, "Date of Birth is required"),
        joiningDate: z.string().min(1, "Joining Date is required"),
        designation: z.string().min(1, "Designation is required"),
        department: z.string().min(1, "Department is required"),
        basicSalary: z.coerce.number().min(0, "Salary cannot be negative"),
        bankName: z.string().optional(),
        accountNumber: z.string().optional(),
        ifscCode: z.string().optional(),
        address: z.string().optional(),
    }),
    userData: z.object({
        createAccount: z.boolean().default(false),
        password: z.string().min(6).optional().or(z.literal("")),
        role: z.enum(["ACCOUNTANT", "SUPER_ADMIN", "SCHOOL_ADMIN", "TEACHER", "STAFF"]).optional(),
        permissions: z.array(z.string()).optional(),
    }).optional()
}).refine(
    (data) => {
        if (data.userData?.createAccount && !data.staffData.email) {
            return false;
        }
        return true;
    },
    {
        message: "Email is required if creating a user account",
        path: ["staffData", "email"],
    }
);

export type StaffFormValues = z.infer<typeof staffSchema>;