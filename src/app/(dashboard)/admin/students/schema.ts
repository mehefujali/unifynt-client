import * as z from "zod/v3";

export const studentSchema = z.object({
  academicYearId: z.string().min(1, "Academic year is required"),
  classId: z.string().min(1, "Class is required"),
  sectionId: z.string().min(1, "Section is required"),
  rollNumber: z.string().min(1, "Roll number is required"),
  admissionNumber: z.string().optional(),
  admissionDate: z.string().optional(),

  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  gender: z.string().min(1, "Gender is required"),
  dateOfBirth: z.string().optional(),
  bloodGroup: z.string().optional(),
  religion: z.string().optional(),
  caste: z.string().optional(),
  motherTongue: z.string().optional(),
  nationalId: z.string().optional(),

  address: z.string().optional(),
  phone: z.string().optional(),
  email: z.string().optional(), // Removed .email() to prevent conflict if left empty

  fatherName: z.string().optional(),
  fatherPhone: z.string().optional(),
  fatherOccupation: z.string().optional(),
  motherName: z.string().optional(),
  motherPhone: z.string().optional(),
  motherOccupation: z.string().optional(),

  localGuardianName: z.string().optional(),
  localGuardianPhone: z.string().optional(),
  localGuardianRelation: z.string().optional(),

  previousSchoolName: z.string().optional(),
  transferCertificateNo: z.string().optional(),
  lastMarks: z.string().optional(),

  medicalConditions: z.string().optional(),
  transportRoute: z.string().optional(),
  hostelRoom: z.string().optional(),

  profileImage: z.string().optional(),
  birthCertificateUrl: z.string().optional(),
  nationalIdDocumentUrl: z.string().optional(),
  tcDocumentUrl: z.string().optional(),
});

export type StudentFormValues = z.infer<typeof studentSchema>;
