export const PERMISSIONS = {
  DASHBOARD_VIEW: "DASHBOARD_VIEW",

  ACADEMIC_VIEW: "ACADEMIC_VIEW",
  CLASS_CREATE: "CLASS_CREATE",
  CLASS_EDIT: "CLASS_EDIT",
  CLASS_DELETE: "CLASS_DELETE",
  SUBJECT_CREATE: "SUBJECT_CREATE",
  SUBJECT_EDIT: "SUBJECT_EDIT",
  SUBJECT_DELETE: "SUBJECT_DELETE",
  ROUTINE_CREATE: "ROUTINE_CREATE",
  ROUTINE_EDIT: "ROUTINE_EDIT",
  ROUTINE_DELETE: "ROUTINE_DELETE",

  ADMISSION_VIEW: "ADMISSION_VIEW",
  ADMISSION_CREATE: "ADMISSION_CREATE",
  ADMISSION_EDIT: "ADMISSION_EDIT",
  ADMISSION_DELETE: "ADMISSION_DELETE",
  STUDENT_VIEW: "STUDENT_VIEW",
  STUDENT_CREATE: "STUDENT_CREATE",
  STUDENT_EDIT: "STUDENT_EDIT",
  STUDENT_DELETE: "STUDENT_DELETE",

  // --- Added Teacher Specific Permissions ---
  TEACHER_VIEW: "TEACHER_VIEW",
  TEACHER_CREATE: "TEACHER_CREATE",
  TEACHER_EDIT: "TEACHER_EDIT",
  TEACHER_DELETE: "TEACHER_DELETE",

  STAFF_VIEW: "STAFF_VIEW",
  STAFF_CREATE: "STAFF_CREATE",
  STAFF_EDIT: "STAFF_EDIT",
  STAFF_DELETE: "STAFF_DELETE",
  
  PAYROLL_VIEW: "PAYROLL_VIEW",
  PAYROLL_CREATE: "PAYROLL_CREATE",
  PAYROLL_EDIT: "PAYROLL_EDIT",
  PAYROLL_DELETE: "PAYROLL_DELETE",

  ATTENDANCE_VIEW: "ATTENDANCE_VIEW",
  ATTENDANCE_MARK: "ATTENDANCE_MARK",

  EXAM_VIEW: "EXAM_VIEW",
  EXAM_CREATE: "EXAM_CREATE",
  EXAM_EDIT: "EXAM_EDIT",
  EXAM_DELETE: "EXAM_DELETE",
  MARKS_ENTRY: "MARKS_ENTRY",
  RESULT_VIEW: "RESULT_VIEW",
  RESULT_CREATE: "RESULT_CREATE",
  RESULT_EDIT: "RESULT_EDIT",
  RESULT_DELETE: "RESULT_DELETE",

  FEE_VIEW: "FEE_VIEW",
  FEE_CREATE: "FEE_CREATE",
  FEE_EDIT: "FEE_EDIT",
  FEE_DELETE: "FEE_DELETE",
  FEE_COLLECT: "FEE_COLLECT",
  INVOICE_VIEW: "INVOICE_VIEW",
  INVOICE_CREATE: "INVOICE_CREATE",
  INVOICE_EDIT: "INVOICE_EDIT",
  INVOICE_DELETE: "INVOICE_DELETE",

  SMS_VIEW: "SMS_VIEW",
  SMS_SEND: "SMS_SEND",
  SMS_MANAGE: "SMS_MANAGE",
  FORM_VIEW: "FORM_VIEW",
  FORM_CREATE: "FORM_CREATE",
  FORM_EDIT: "FORM_EDIT",
  FORM_DELETE: "FORM_DELETE",
  GOOGLE_SHEET_SYNC: "GOOGLE_SHEET_SYNC",

  SITE_SETTINGS_EDIT: "SITE_SETTINGS_EDIT",
  USER_VIEW: "USER_VIEW",
  USER_CREATE: "USER_CREATE",
  USER_EDIT: "USER_EDIT",
  USER_DELETE: "USER_DELETE",
  AUDIT_LOG_VIEW: "AUDIT_LOG_VIEW",

  SCHOOL_VIEW: "SCHOOL_VIEW",
  SCHOOL_CREATE: "SCHOOL_CREATE",
  SCHOOL_EDIT: "SCHOOL_EDIT",
  SCHOOL_DELETE: "SCHOOL_DELETE",
  PLAN_VIEW: "PLAN_VIEW",
  PLAN_CREATE: "PLAN_CREATE",
  PLAN_EDIT: "PLAN_EDIT",
  PLAN_DELETE: "PLAN_DELETE",
  SAAS_TRANSACTION_VIEW: "SAAS_TRANSACTION_VIEW",
} as const;

export const APP_PERMISSIONS = {
  DASHBOARD: {
    title: "Dashboard & Analytics",
    actions: [
      { id: PERMISSIONS.DASHBOARD_VIEW, label: "View Dashboard Statistics" },
    ]
  },
  ACADEMIC_MANAGEMENT: {
    title: "Academic Setup",
    actions: [
      { id: PERMISSIONS.ACADEMIC_VIEW, label: "View Classes, Subjects & Routines" },
      { id: PERMISSIONS.CLASS_CREATE, label: "Create Classes & Sections" },
      { id: PERMISSIONS.CLASS_EDIT, label: "Update Classes & Sections" },
      { id: PERMISSIONS.CLASS_DELETE, label: "Delete Classes & Sections" },
      { id: PERMISSIONS.SUBJECT_CREATE, label: "Create Subjects" },
      { id: PERMISSIONS.SUBJECT_EDIT, label: "Update Subjects" },
      { id: PERMISSIONS.SUBJECT_DELETE, label: "Delete Subjects" },
      { id: PERMISSIONS.ROUTINE_CREATE, label: "Create Class Routines & Periods" },
      { id: PERMISSIONS.ROUTINE_EDIT, label: "Update Class Routines & Periods" },
      { id: PERMISSIONS.ROUTINE_DELETE, label: "Delete Class Routines & Periods" },
    ]
  },
  STUDENT_MANAGEMENT: {
    title: "Student & Admission",
    actions: [
      { id: PERMISSIONS.ADMISSION_VIEW, label: "View Admission Applications" },
      { id: PERMISSIONS.ADMISSION_CREATE, label: "Submit New Applications" },
      { id: PERMISSIONS.ADMISSION_EDIT, label: "Update Admission Status/Forms" },
      { id: PERMISSIONS.ADMISSION_DELETE, label: "Delete Admission Applications" },
      { id: PERMISSIONS.STUDENT_VIEW, label: "View Student Profiles & History" },
      { id: PERMISSIONS.STUDENT_CREATE, label: "Add New Students" },
      { id: PERMISSIONS.STUDENT_EDIT, label: "Edit Student Information" },
      { id: PERMISSIONS.STUDENT_DELETE, label: "Delete or Transfer Students" },
    ]
  },
  HR_MANAGEMENT: {
    title: "HR & Payroll",
    actions: [
      // Teachers
      { id: PERMISSIONS.TEACHER_VIEW, label: "View Teacher Profiles" },
      { id: PERMISSIONS.TEACHER_CREATE, label: "Add New Teachers" },
      { id: PERMISSIONS.TEACHER_EDIT, label: "Update Teacher Records" },
      { id: PERMISSIONS.TEACHER_DELETE, label: "Remove Teacher Accounts" },
      // General Staff
      { id: PERMISSIONS.STAFF_VIEW, label: "View Staff Members" },
      { id: PERMISSIONS.STAFF_CREATE, label: "Add New Staff" },
      { id: PERMISSIONS.STAFF_EDIT, label: "Update Staff Records" },
      { id: PERMISSIONS.STAFF_DELETE, label: "Remove Staff Members" },
      // Payroll
      { id: PERMISSIONS.PAYROLL_VIEW, label: "View Salary & Payroll Records" },
      { id: PERMISSIONS.PAYROLL_CREATE, label: "Generate Monthly Salary" },
      { id: PERMISSIONS.PAYROLL_EDIT, label: "Adjust Salary & Payslips" },
      { id: PERMISSIONS.PAYROLL_DELETE, label: "Void Salary Transactions" },
    ]
  },
  ATTENDANCE_MANAGEMENT: {
    title: "Attendance System",
    actions: [
      { id: PERMISSIONS.ATTENDANCE_VIEW, label: "View Attendance Records" },
      { id: PERMISSIONS.ATTENDANCE_MARK, label: "Mark Student/Staff Attendance" },
    ]
  },
  EXAM_MANAGEMENT: {
    title: "Examination & Results",
    actions: [
      { id: PERMISSIONS.EXAM_VIEW, label: "View Exams & Schedules" },
      { id: PERMISSIONS.EXAM_CREATE, label: "Setup New Examinations" },
      { id: PERMISSIONS.EXAM_EDIT, label: "Update Exam Details & Grades" },
      { id: PERMISSIONS.EXAM_DELETE, label: "Cancel/Delete Exams" },
      { id: PERMISSIONS.MARKS_ENTRY, label: "Enter & Edit Student Marks" },
      { id: PERMISSIONS.RESULT_VIEW, label: "View Published Results" },
      { id: PERMISSIONS.RESULT_CREATE, label: "Generate & Publish Results" },
      { id: PERMISSIONS.RESULT_EDIT, label: "Modify Result/Marksheets" },
      { id: PERMISSIONS.RESULT_DELETE, label: "Retract/Delete Results" },
    ]
  },
  FINANCE_MANAGEMENT: {
    title: "Finance & Accounts",
    actions: [
      { id: PERMISSIONS.FEE_VIEW, label: "View Fee Records" },
      { id: PERMISSIONS.FEE_CREATE, label: "Setup Fee Heads" },
      { id: PERMISSIONS.FEE_EDIT, label: "Update Fee Structure" },
      { id: PERMISSIONS.FEE_DELETE, label: "Remove Fee Heads" },
      { id: PERMISSIONS.FEE_COLLECT, label: "Collect Fee Payments" },
      { id: PERMISSIONS.INVOICE_VIEW, label: "View Invoices" },
      { id: PERMISSIONS.INVOICE_CREATE, label: "Generate New Invoices" },
      { id: PERMISSIONS.INVOICE_EDIT, label: "Adjust Invoice Details" },
      { id: PERMISSIONS.INVOICE_DELETE, label: "Cancel/Delete Invoices" },
    ]
  },
  COMMUNICATION_MANAGEMENT: {
    title: "Communication & Custom Forms",
    actions: [
      { id: PERMISSIONS.SMS_VIEW, label: "View SMS Logs" },
      { id: PERMISSIONS.SMS_SEND, label: "Send Group/Single SMS" },
      { id: PERMISSIONS.SMS_MANAGE, label: "Manage SMS Packages/API" },
      { id: PERMISSIONS.FORM_VIEW, label: "View Form Submissions" },
      { id: PERMISSIONS.FORM_CREATE, label: "Build Custom Forms" },
      { id: PERMISSIONS.FORM_EDIT, label: "Update Form Fields" },
      { id: PERMISSIONS.FORM_DELETE, label: "Delete Custom Forms" },
      { id: PERMISSIONS.GOOGLE_SHEET_SYNC, label: "Manage Google Sheets Integration" },
    ]
  },
  SYSTEM_ADMINISTRATION: {
    title: "System Administration",
    actions: [
      { id: PERMISSIONS.SITE_SETTINGS_EDIT, label: "Update Site Config & Templates" },
      { id: PERMISSIONS.USER_VIEW, label: "View System Users" },
      { id: PERMISSIONS.USER_CREATE, label: "Create User Accounts" },
      { id: PERMISSIONS.USER_EDIT, label: "Edit User Roles & Status" },
      { id: PERMISSIONS.USER_DELETE, label: "Delete User Accounts" },
      { id: PERMISSIONS.AUDIT_LOG_VIEW, label: "View System Audit Logs" },
    ]
  },
  SAAS_MANAGEMENT: {
    title: "SaaS Management (Super Admin)",
    actions: [
      { id: PERMISSIONS.SCHOOL_VIEW, label: "View All Schools" },
      { id: PERMISSIONS.SCHOOL_CREATE, label: "Register New School" },
      { id: PERMISSIONS.SCHOOL_EDIT, label: "Update School Status/Plan" },
      { id: PERMISSIONS.SCHOOL_DELETE, label: "Delete School Data" },
      { id: PERMISSIONS.PLAN_VIEW, label: "View Subscription Plans" },
      { id: PERMISSIONS.PLAN_CREATE, label: "Add New Plans" },
      { id: PERMISSIONS.PLAN_EDIT, label: "Modify Plan Features" },
      { id: PERMISSIONS.PLAN_DELETE, label: "Remove Plans" },
      { id: PERMISSIONS.SAAS_TRANSACTION_VIEW, label: "View SaaS Transactions" },
    ]
  }
};

export const ALL_PERMISSION_IDS = Object.values(APP_PERMISSIONS).flatMap(module => 
  module.actions.map(action => action.id)
);