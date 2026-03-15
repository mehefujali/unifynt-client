import {
  LayoutDashboard,
  School,
  Users,
  BookOpen,
  CalendarDays,
  Settings,
  UserCheck,
  GraduationCap,
  Gem,
  Banknote,
  UserPlus,
  LayoutTemplate,
  FileText,
  Award,
  ShieldAlert,
  Megaphone,
  Bell,
  Mailbox,
  TrendingUp,
  MessageCircle,
  CreditCard,
  LifeBuoy,
  Library,
} from "lucide-react";

export type SubItem = {
  title: string;
  href: string;
  requiredPermissions?: string[];
};

export type NavItem = {
  title: string;
  href: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  icon: any;
  color?: string;
  subItems?: SubItem[];
  requiredPermissions?: string[];
};

// 🌟 UNIFIED ADMIN PANEL MENUS 🌟
const ADMIN_PANEL_ITEMS: NavItem[] = [
  {
    title: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    title: "Notice Board",
    href: "/admin/notices",
    icon: Megaphone,
    requiredPermissions: ["NOTICE_VIEW"],
  },
  {
    title: "Inquiries",
    href: "/admin/inquiries",
    icon: Mailbox,
    requiredPermissions: ["INQUIRY_VIEW"],
  },
  {
    title: "Admissions",
    href: "#",
    icon: UserPlus,
    requiredPermissions: [
      "ADMISSION_VIEW",
      "ADMISSION_CREATE",
      "ADMISSION_EDIT",
      "ADMISSION_DELETE",
    ],
    subItems: [
      {
        title: "Applications",
        href: "/admin/admission/applications",
        requiredPermissions: [
          "ADMISSION_VIEW",
          "ADMISSION_EDIT",
          "ADMISSION_DELETE",
        ],
      },
      {
        title: "Form Settings",
        href: "/admin/admission/settings",
        requiredPermissions: ["ADMISSION_CREATE", "ADMISSION_EDIT"],
      },
    ],
  },
  {
    title: "People",
    href: "#",
    icon: Users,
    requiredPermissions: [
      "TEACHER_VIEW",
      "TEACHER_CREATE",
      "TEACHER_EDIT",
      "TEACHER_DELETE",
      "STUDENT_VIEW",
      "STUDENT_CREATE",
      "STUDENT_EDIT",
      "STUDENT_DELETE",
      "STAFF_VIEW",
      "STAFF_CREATE",
      "STAFF_EDIT",
      "STAFF_DELETE",
    ],
    subItems: [
      {
        title: "Teachers",
        href: "/admin/teachers",
        requiredPermissions: [
          "TEACHER_VIEW",
          "TEACHER_CREATE",
          "TEACHER_EDIT",
          "TEACHER_DELETE",
        ],
      },
      {
        title: "Students",
        href: "/admin/students",
        requiredPermissions: [
          "STUDENT_VIEW",
          "STUDENT_CREATE",
          "STUDENT_EDIT",
          "STUDENT_DELETE",
        ],
      },
      {
        title: "All Staff",
        href: "/admin/staff",
        requiredPermissions: [
          "STAFF_VIEW",
          "STAFF_CREATE",
          "STAFF_EDIT",
          "STAFF_DELETE",
        ],
      },
    ],
  },
  {
    title: "Student Promotion",
    href: "/admin/promotion",
    icon: TrendingUp,
    requiredPermissions: ["STUDENT_EDIT"],
  },
  {
    title: "Academics",
    href: "#",
    icon: BookOpen,
    requiredPermissions: [
      "ACADEMIC_VIEW",
      "CLASS_CREATE",
      "CLASS_EDIT",
      "CLASS_DELETE",
      "SUBJECT_CREATE",
      "SUBJECT_EDIT",
      "SUBJECT_DELETE",
      "ROUTINE_CREATE",
      "ROUTINE_EDIT",
      "ROUTINE_DELETE",
      "STUDENT_EDIT", // Required for Promotion
    ],
    subItems: [
      {
        title: "Academics overview",
        href: "/admin/academics",
        requiredPermissions: [
          "ACADEMIC_VIEW",
          "CLASS_CREATE",
          "CLASS_EDIT",
          "CLASS_DELETE",
          "SUBJECT_CREATE",
          "SUBJECT_EDIT",
          "SUBJECT_DELETE",
        ],
      },
      {
        title: "Routine",
        href: "/admin/routine",
        requiredPermissions: [
          "ACADEMIC_VIEW",
          "ROUTINE_CREATE",
          "ROUTINE_EDIT",
          "ROUTINE_DELETE",
        ],
      },
    ],
  },
  {
    title: "Attendance",
    href: "/admin/attendance",
    icon: UserCheck,
    requiredPermissions: ["ATTENDANCE_VIEW", "ATTENDANCE_MARK"],
  },
  {
    title: "Examinations",
    href: "#",
    icon: Award,
    requiredPermissions: [
      "EXAM_VIEW",
      "EXAM_CREATE",
      "EXAM_EDIT",
      "EXAM_DELETE",
      "MARKS_ENTRY",
      "RESULT_VIEW",
      "RESULT_CREATE",
      "RESULT_EDIT",
      "RESULT_DELETE",
    ],
    subItems: [
      {
        title: "Exam Master",
        href: "/admin/examinations/exams",
        requiredPermissions: [
          "EXAM_VIEW",
          "EXAM_CREATE",
          "EXAM_EDIT",
          "EXAM_DELETE",
        ],
      },
      {
        title: "Grading Scale",
        href: "/admin/examinations/grades",
        requiredPermissions: [
          "EXAM_VIEW",
          "EXAM_CREATE",
          "EXAM_EDIT",
          "EXAM_DELETE",
        ],
      },
      {
        title: "Exam Schedules",
        href: "/admin/examinations/schedules",
        requiredPermissions: [
          "EXAM_VIEW",
          "EXAM_CREATE",
          "EXAM_EDIT",
          "EXAM_DELETE",
        ],
      },
      {
        title: "Marks Entry",
        href: "/admin/examinations/marks-entry",
        requiredPermissions: ["MARKS_ENTRY", "EXAM_VIEW"],
      },
      {
        title: "Results & Marksheet",
        href: "/admin/examinations/results",
        requiredPermissions: [
          "RESULT_VIEW",
          "RESULT_CREATE",
          "RESULT_EDIT",
          "RESULT_DELETE",
        ],
      },
      {
        title: "Marksheet Builder",
        href: "/admin/examinations/marksheet-builder",
        requiredPermissions: ["EXAM_EDIT"],
      },
    ],
  },
  {
    title: "Forms & Surveys",
    href: "/admin/forms",
    icon: FileText,
    requiredPermissions: [
      "FORM_VIEW",
      "FORM_CREATE",
      "FORM_EDIT",
      "FORM_DELETE",
    ],
  },
  {
    title: "Library Management",
    href: "#",
    icon: Library,
    requiredPermissions: ["LIBRARY_VIEW"],
    subItems: [
      {
        title: "Book List",
        href: "/admin/library/books",
        requiredPermissions: ["LIBRARY_VIEW"],
      },
      {
        title: "Issue/Return",
        href: "/admin/library/circulation",
        requiredPermissions: ["LIBRARY_VIEW"],
      },
      {
        title: "Members",
        href: "/admin/library/members",
        requiredPermissions: ["LIBRARY_VIEW"],
      },
    ],
  },
  {
    title: "Finance",
    href: "#",
    icon: Banknote,
    requiredPermissions: [
      "FEE_VIEW",
      "FEE_CREATE",
      "FEE_EDIT",
      "FEE_DELETE",
      "FEE_COLLECT",
      "PAYROLL_VIEW",
      "PAYROLL_CREATE",
      "PAYROLL_EDIT",
      "PAYROLL_DELETE",
      "INVOICE_VIEW",
      "INVOICE_CREATE",
      "INVOICE_EDIT",
      "INVOICE_DELETE",
    ],
    subItems: [
      {
        title: "Fees",
        href: "/admin/fees",
        requiredPermissions: [
          "FEE_VIEW",
          "FEE_CREATE",
          "FEE_EDIT",
          "FEE_DELETE",
          "FEE_COLLECT",
          "INVOICE_VIEW",
          "INVOICE_CREATE",
          "INVOICE_EDIT",
          "INVOICE_DELETE",
        ],
      },
      {
        title: "Payroll",
        href: "/admin/payroll",
        requiredPermissions: [
          "PAYROLL_VIEW",
          "PAYROLL_CREATE",
          "PAYROLL_EDIT",
          "PAYROLL_DELETE",
        ],
      },
    ],
  },
  {
    title: "Communication",
    href: "#",
    icon: MessageCircle,
    requiredPermissions: ["SMS_VIEW", "SMS_SEND", "SMS_MANAGE"],
    subItems: [
      {
        title: "SMS Center",
        href: "/admin/sms",
        requiredPermissions: ["SMS_VIEW", "SMS_SEND", "SMS_MANAGE"],
      },
      {
        title: "Email Center",
        href: "/admin/email",
        requiredPermissions: ["SMS_VIEW", "SMS_SEND", "SMS_MANAGE"],
      },
    ],
  },
  {
    title: "Administration",
    href: "#",
    icon: Settings,
    requiredPermissions: [
      "SITE_SETTINGS_EDIT",
      "SCHOOL_EDIT",
    ],
    subItems: [
      {
        title: "Payment Gateway",
        href: "/admin/settings/payment",
        requiredPermissions: ["SCHOOL_EDIT"],
      },
      {
        title: "Website Settings",
        href: "/admin/settings/website",
        requiredPermissions: ["SITE_SETTINGS_EDIT"],
      },
      {
        title: "Email Config",
        href: "/admin/settings/email-config",
        requiredPermissions: ["SCHOOL_EDIT"],
      },
      {
        title: "Support Reports",
        href: "/admin/reports",
        requiredPermissions: ["SCHOOL_EDIT"],
      },
    ],
  },
  {
    title: "Billing & Plans",
    href: "/admin/billing",
    icon: CreditCard,
    requiredPermissions: ["SCHOOL_EDIT"],
  },
];

export const navItems: Record<string, NavItem[]> = {
  SUPER_ADMIN: [
    { title: "Dashboard", href: "/super-admin", icon: LayoutDashboard },
    {
      title: "Subscriptions",
      href: "#",
      icon: Gem,
      color: "text-blue-500",
      subItems: [
        { title: "Plans", href: "/super-admin/plans" },
        { title: "SMS Packages", href: "/super-admin/sms-packages" },
        { title: "Email Packages", href: "/super-admin/email-packages" },
      ],
    },
    { title: "Schools", href: "/super-admin/schools", icon: School },
    { title: "Users", href: "/super-admin/users", icon: Users },
    {
      title: "Site Templates",
      href: "/super-admin/site-templates",
      icon: LayoutTemplate,
    },
    {
      title: "Announcements",
      href: "/super-admin/announcements",
      icon: Megaphone,
      color: "text-amber-500",
    },
    {
      title: "Notifications",
      href: "/super-admin/notifications",
      icon: Bell,
      color: "text-rose-500",
    },
    {
      title: "Audit Logs",
      href: "/super-admin/audit-logs",
      icon: ShieldAlert,
      color: "text-emerald-500",
    },
    {
      title: "User Reports",
      href: "/admin/reports",
      icon: LifeBuoy,
      color: "text-rose-600",
    },
    { title: "Global Settings", href: "/super-admin/settings", icon: Settings },
  ],

  // 🚀 All school-level users share the same Admin Panel structure!
  SCHOOL_ADMIN: ADMIN_PANEL_ITEMS,
  STAFF: ADMIN_PANEL_ITEMS,
  ACCOUNTANT: ADMIN_PANEL_ITEMS,
  TEACHER: ADMIN_PANEL_ITEMS,

  STUDENT: [
    { title: "Dashboard", href: "/student", icon: LayoutDashboard },
    { title: "Routine", href: "/student/routine", icon: CalendarDays },
    { title: "Fees", href: "/student/fees", icon: Banknote },
    { title: "Result", href: "/student/result", icon: GraduationCap },
  ],
};
