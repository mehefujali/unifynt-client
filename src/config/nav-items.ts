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
  FileText, // Admission icon added
} from "lucide-react";

export const navItems = {
  SUPER_ADMIN: [
    { title: "Dashboard", href: "/super-admin", icon: LayoutDashboard },
    { title: "Schools", href: "/super-admin/schools", icon: School },
    { title: "Users", href: "/super-admin/users", icon: Users },
    { title: "Settings", href: "/super-admin/settings", icon: Settings },
  ],
  SCHOOL_ADMIN: [
    { title: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { title: "Admission", href: "/admin/admission/settings", icon: FileText }, // 🔥 Added Here
    { title: "Teachers", href: "/admin/teachers", icon: UserCheck },
    { title: "Students", href: "/admin/students", icon: GraduationCap },
    { title: "Academics", href: "/admin/academics", icon: BookOpen },
    { title: "Routine", href: "/admin/routine", icon: CalendarDays },
    { title: "Fees", href: "/admin/fees", icon: CreditCard },
    { title: "Site Config", href: "/admin/site-config", icon: Settings },
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
