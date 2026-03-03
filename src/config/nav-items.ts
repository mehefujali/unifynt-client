/* eslint-disable @typescript-eslint/no-explicit-any */
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
  Award
} from "lucide-react";

export type SubItem = { title: string; href: string };
export type NavItem = {
  title: string;
  href: string;
  icon: any;
  color?: string;
  subItems?: SubItem[];
};

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
      ],
    },
    { title: "Schools", href: "/super-admin/schools", icon: School },
    { title: "Users", href: "/super-admin/users", icon: Users },
    { title: "Site Templates", href: "/super-admin/site-templates", icon: LayoutTemplate },
    { title: "Global Settings", href: "/super-admin/settings", icon: Settings },
  ],
  SCHOOL_ADMIN: [
    { title: "Dashboard", href: "/admin", icon: LayoutDashboard },
    {
      title: "Admissions",
      href: "#",
      icon: UserPlus,
      subItems: [
        { title: "Applications", href: "/admin/admission/applications" },
        { title: "Form Settings", href: "/admin/admission/settings" },
      ],
    },
    {
      title: "People",
      href: "#",
      icon: Users,
      subItems: [
        { title: "Teachers", href: "/admin/teachers" },
        { title: "Students", href: "/admin/students" },
      ],
    },
    {
      title: "Academics",
      href: "#",
      icon: BookOpen,
      subItems: [
        { title: "Academics overview", href: "/admin/academics" },
        { title: "Routine", href: "/admin/routine" },
      ],
    },
    { 
      title: "Attendance", 
      href: "/admin/attendance", 
      icon: UserCheck 
    },
    {
      title: "Examinations",
      href: "#",
      icon: Award,
      subItems: [
        { title: "Exam Master", href: "/admin/examinations/exams" },
        { title: "Grading Scale", href: "/admin/examinations/grades" },
        { title: "Exam Schedules", href: "/admin/examinations/schedules" },
        { title: "Marks Entry", href: "/admin/examinations/marks-entry" },
        { title: "Results & Marksheet", href: "/admin/examinations/results" },
      ],
    },
    { title: "Forms & Surveys", href: "/admin/forms", icon: FileText },
    {
      title: "Finance",
      href: "#",
      icon: Banknote,
      subItems: [
        { title: "Fees", href: "/admin/fees" },
        { title: "Payroll", href: "/admin/payroll" },
      ],
    },
    {
      title: "Administration",
      href: "#",
      icon: Settings,
      subItems: [
        { title: "SMS Center", href: "/admin/sms" },
        { title: "Billing & Sub", href: "/admin/billing" },
        { title: "Website Settings", href: "/admin/settings/website" }, 
      ],
    },
  ],
  TEACHER: [
    { title: "Dashboard", href: "/teacher", icon: LayoutDashboard },
    { title: "My Classes", href: "/teacher/classes", icon: BookOpen },
    { title: "Attendance", href: "/teacher/attendance", icon: UserCheck },
    { title: "My Payroll", href: "/teacher/payroll", icon: Banknote },
  ],
  STUDENT: [
    { title: "Dashboard", href: "/student", icon: LayoutDashboard },
    { title: "Routine", href: "/student/routine", icon: CalendarDays },
    { title: "Result", href: "/student/result", icon: GraduationCap },
  ],
};