import {
  LayoutDashboard,
  School,
  Users,
  BookOpen,
  CalendarDays,
  Settings,
  CreditCard,
  UserCheck,
  GraduationCap,
  FileText,
  Globe,
  Gem,
  Receipt,
  MessageSquare, // Added for SMS module
} from "lucide-react";

export const navItems = {
  SUPER_ADMIN: [
    { title: "Dashboard", href: "/super-admin", icon: LayoutDashboard },
    {
      title: "Subscription Plans",
      href: "/super-admin/plans",
      icon: Gem,
      color: "text-blue-500",
    },
    { title: "Schools", href: "/super-admin/schools", icon: School },
    { title: "Users", href: "/super-admin/users", icon: Users },
    { title: "Global Settings", href: "/super-admin/settings", icon: Settings },
  ],
  SCHOOL_ADMIN: [
    { title: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { title: "Admission", href: "/admin/admission/settings", icon: FileText },
    { title: "Teachers", href: "/admin/teachers", icon: UserCheck },
    { title: "Students", href: "/admin/students", icon: GraduationCap },
    { title: "Academics", href: "/admin/academics", icon: BookOpen },
    { title: "Routine", href: "/admin/routine", icon: CalendarDays },
    { title: "Fees", href: "/admin/fees", icon: CreditCard },
    { title: "SMS Center", href: "/admin/sms", icon: MessageSquare }, // Added SMS Module
    { title: "Billing & Subscription", href: "/admin/billing", icon: Receipt },
    { title: "Website Settings", href: "/admin/settings", icon: Globe },
  ],
  TEACHER: [
    { title: "Dashboard", href: "/teacher", icon: LayoutDashboard },
    { title: "My Classes", href: "/teacher/classes", icon: BookOpen },
    { title: "Attendance", href: "/teacher/attendance", icon: UserCheck },
  ],
  STUDENT: [
    { title: "Dashboard", href: "/student", icon: LayoutDashboard },
    { title: "Routine", href: "/student/routine", icon: CalendarDays },
    { title: "Result", href: "/student/result", icon: BookOpen },
  ],
};
