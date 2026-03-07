export type Gender = "MALE" | "FEMALE" | "OTHER";
export type StaffStatus = "ACTIVE" | "BLOCKED";
export type Role = "SUPER_ADMIN" | "SCHOOL_ADMIN" | "TEACHER" | "ACCOUNTANT" | "STUDENT";

export interface User {
  id: string;
  email: string;
  role: Role;
  status: StaffStatus;
  permissions: string[];
}

export interface Staff {
  id: string;
  schoolId: string;
  userId: string | null;
  employeeId: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string;
  gender: Gender;
  dateOfBirth: string;
  joiningDate: string;
  designation: string;
  department: string;
  basicSalary: number;
  bankName: string | null;
  accountNumber: string | null;
  ifscCode: string | null;
  address: string | null;
  status: StaffStatus;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  user?: User;
}

export interface StaffDataPayload {
  employeeId: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone: string;
  gender: Gender;
  dateOfBirth: string;
  joiningDate: string;
  designation: string;
  department: string;
  basicSalary: number;
  bankName?: string;
  accountNumber?: string;
  ifscCode?: string;
  address?: string;
}

export interface UserDataPayload {
  createAccount?: boolean;
  password?: string;
  role?: Role;
  permissions?: string[];
  status?: StaffStatus;
}

export interface CreateStaffPayload {
  staffData: StaffDataPayload;
  userData?: UserDataPayload;
}

export interface UpdateStaffPayload {
  staffData?: Partial<StaffDataPayload>;
  userData?: Partial<UserDataPayload>;
}