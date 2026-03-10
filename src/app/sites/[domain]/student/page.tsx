/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import Link from "next/link";
import { format, formatDistanceToNow } from "date-fns";
import { cn } from "@/lib/utils";
import {
  CalendarDays,
  GraduationCap,
  Clock,
  ChevronRight,
  Megaphone,
  BookOpen,
  TrendingUp,
  FileText,
  Wallet,
  CheckCircle2,
  Timer,
  AlertCircle,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

interface RoutineItem {
  id: string;
  roomNo?: string;
  subject?: { subjectName: string };
  teacher?: { firstName: string; lastName?: string };
  period: { startTime: string; endTime: string; type: string };
}

interface Notice {
  id: string;
  title: string;
  content: string;
  createdAt: string;
}

interface DashboardData {
  overview: {
    attendancePercentage: number;
    totalDue: number;
    examsAppeared: number;
  };
  studentInfo: {
    className: string;
    sectionName: string;
    rollNumber: number;
  };
  todayRoutine: RoutineItem[];
  recentNotices: Notice[];
}

// ─── Helper: Compute class status based on system time ───────────────────────

function getClassStatus(startTime: string, endTime: string): "completed" | "active" | "upcoming" {
  const now = new Date();
  const [sh, sm] = startTime.split(":").map(Number);
  const [eh, em] = endTime.split(":").map(Number);
  const start = new Date(now); start.setHours(sh, sm, 0, 0);
  const end = new Date(now); end.setHours(eh, em, 0, 0);
  if (now < start) return "upcoming";
  if (now >= start && now <= end) return "active";
  return "completed";
}

function formatTime(t: string) {
  const [h, m] = t.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const hour = h % 12 || 12;
  return `${hour}:${m.toString().padStart(2, "0")} ${ampm}`;
}

// ─── Skeleton Loader ──────────────────────────────────────────────────────────

function SkeletonBlock({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-2xl bg-zinc-100 dark:bg-zinc-800/60", className)} />;
}

function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto pb-6">
      <div className="flex flex-col gap-2 pt-2">
        <SkeletonBlock className="h-10 w-72 rounded-xl" />
        <SkeletonBlock className="h-4 w-48 rounded-lg" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {[...Array(3)].map((_, i) => <SkeletonBlock key={i} className="h-[130px]" />)}
      </div>
      <div className="grid grid-cols-4 gap-3">
        {[...Array(4)].map((_, i) => <SkeletonBlock key={i} className="h-[100px]" />)}
      </div>
      <SkeletonBlock className="h-[280px]" />
      <SkeletonBlock className="h-[180px]" />
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function StudentPortalDashboard() {
  const { user } = useAuth();

  const { data, isLoading, isError } = useQuery<DashboardData>({
    queryKey: ["student-dashboard"],
    queryFn: async () => {
      const res = await api.get("/dashboard/student");
      return res.data.data;
    },
    staleTime: 1000 * 60 * 5,
  });

  const firstName = (user as any)?.details?.firstName
    || (user as any)?.firstName
    || user?.name?.split(" ")[0]
    || "Student";

  const currentHour = new Date().getHours();
  const greeting =
    currentHour < 12 ? "Good Morning" :
    currentHour < 17 ? "Good Afternoon" : "Good Evening";

  const emoji = currentHour < 12 ? "☀️" : currentHour < 17 ? "🌤️" : "🌙";

  if (isLoading) return <DashboardSkeleton />;

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center">
        <div className="h-20 w-20 rounded-full bg-rose-50 dark:bg-rose-500/10 flex items-center justify-center">
          <AlertCircle className="h-10 w-10 text-rose-400" />
        </div>
        <p className="font-black text-zinc-700 dark:text-zinc-300">Could not load dashboard data.</p>
        <p className="text-sm text-zinc-500">Please try refreshing the page.</p>
      </div>
    );
  }

  const { overview, studentInfo, todayRoutine, recentNotices } = data!;

  const statCards = [
    {
      label: "Attendance",
      value: `${overview.attendancePercentage}%`,
      sub: overview.attendancePercentage >= 75 ? "On track ✓" : "Needs improvement",
      subColor: overview.attendancePercentage >= 75 ? "text-emerald-500" : "text-rose-500",
      icon: TrendingUp,
      accent: "blue",
    },
    {
      label: "Fees Due",
      value: overview.totalDue > 0 ? `₹${overview.totalDue.toLocaleString("en-IN")}` : "Cleared ✓",
      sub: overview.totalDue > 0 ? "Payment pending" : "No dues outstanding",
      subColor: overview.totalDue > 0 ? "text-rose-500" : "text-emerald-500",
      icon: Wallet,
      accent: "amber",
    },
    {
      label: "Exams Done",
      value: `${overview.examsAppeared}`,
      sub: `Class ${studentInfo.className}-${studentInfo.sectionName}`,
      subColor: "text-zinc-400",
      icon: GraduationCap,
      accent: "purple",
    },
  ];

  const accentMap: Record<string, string> = {
    blue: "from-blue-400/20 to-transparent text-blue-500",
    amber: "from-amber-400/20 to-transparent text-amber-500",
    purple: "from-purple-400/20 to-transparent text-purple-500",
  };

  const quickLinks = [
    { label: "Routine", icon: CalendarDays, color: "text-blue-600 dark:text-blue-400", bg: "bg-blue-50 dark:bg-blue-500/10", border: "border-blue-100 dark:border-blue-500/20", href: "/student/routine" },
    { label: "Results", icon: GraduationCap, color: "text-purple-600 dark:text-purple-400", bg: "bg-purple-50 dark:bg-purple-500/10", border: "border-purple-100 dark:border-purple-500/20", href: "/student/result" },
    { label: "Syllabus", icon: BookOpen, color: "text-emerald-600 dark:text-emerald-400", bg: "bg-emerald-50 dark:bg-emerald-500/10", border: "border-emerald-100 dark:border-emerald-500/20", href: "#" },
    { label: "Exams", icon: FileText, color: "text-amber-600 dark:text-amber-400", bg: "bg-amber-50 dark:bg-amber-500/10", border: "border-amber-100 dark:border-amber-500/20", href: "#" },
  ];

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto pb-8">

      {/* ── Greeting ── */}
      <div className="flex flex-col gap-1 pt-2">
        <h1 className="text-3xl lg:text-4xl font-black tracking-tight text-zinc-900 dark:text-zinc-100 mt-2">
          {greeting}, {firstName}! {emoji}
        </h1>
        <p className="text-sm font-semibold text-zinc-500">
          {format(new Date(), "EEEE, MMMM do, yyyy")}
          {" · "}
          <span className="font-bold text-zinc-600 dark:text-zinc-400">
            Class {studentInfo.className} – {studentInfo.sectionName} · Roll #{studentInfo.rollNumber}
          </span>
        </p>
      </div>

      {/* ── Stats Bento ── */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {statCards.map((card) => (
          <div
            key={card.label}
            className="bg-white dark:bg-[#0d0d0d] border border-zinc-200/60 dark:border-zinc-800/60 p-5 rounded-[24px] shadow-sm flex flex-col justify-between h-[130px] relative overflow-hidden group hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300"
          >
            {/* Ambient glow orb */}
            <div className={cn("absolute -right-6 -top-6 w-28 h-28 rounded-full bg-gradient-radial pointer-events-none transition-transform duration-500 group-hover:scale-125 opacity-60 dark:opacity-40", `bg-gradient-to-br ${accentMap[card.accent]}`)} />

            <div className="flex items-center justify-between z-10">
              <p className="text-[11px] font-black uppercase tracking-[0.18em] text-zinc-400">{card.label}</p>
              <div className={cn("h-8 w-8 rounded-xl flex items-center justify-center bg-white dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 shadow-sm", accentMap[card.accent].split(" ").slice(-1)[0])}>
                <card.icon className="h-4 w-4" />
              </div>
            </div>

            <div className="z-10 mt-auto">
              <h3 className="text-[2.1rem] font-black text-zinc-900 dark:text-zinc-50 tracking-tighter leading-none">
                {card.value}
              </h3>
              <p className={cn("text-[11px] font-bold mt-1.5", card.subColor)}>{card.sub}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Quick Links ── */}
      <div>
        <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-4 ml-1">Quick Access</h2>
        <div className="grid grid-cols-4 gap-3 md:gap-5">
          {quickLinks.map((link) => (
            <Link key={link.label} href={link.href} className="flex flex-col items-center gap-3 group">
              <div className={cn(
                "w-16 h-16 sm:w-20 sm:h-20 rounded-2xl flex items-center justify-center transition-all duration-300 border shadow-sm",
                "group-hover:scale-105 group-hover:shadow-md",
                link.bg, link.border
              )}>
                <link.icon className={cn("h-7 w-7 sm:h-8 sm:w-8 transition-transform group-hover:scale-110", link.color)} strokeWidth={2.2} />
              </div>
              <span className="text-[12px] font-black tracking-wide text-zinc-600 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-white transition-colors">{link.label}</span>
            </Link>
          ))}
        </div>
      </div>

      {/* ── Today's Routine ── */}
      <div>
        <div className="flex items-center justify-between mb-4 ml-1">
          <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-zinc-400">
            Today&apos;s Classes
            <span className="ml-2 text-zinc-300 dark:text-zinc-600 font-bold">
              {todayRoutine.filter(r => r.period.type !== "BREAK").length} periods
            </span>
          </h2>
          <Link href="/student/routine" className="text-[11px] uppercase tracking-widest font-black text-primary/80 hover:text-primary flex items-center group transition-colors">
            Full Week <ChevronRight className="h-3 w-3 ml-1 transition-transform group-hover:translate-x-1" />
          </Link>
        </div>

        {todayRoutine.length === 0 ? (
          <div className="bg-white dark:bg-[#0d0d0d] border border-zinc-200/60 dark:border-zinc-800/60 rounded-3xl p-8 text-center shadow-sm">
            <div className="h-14 w-14 rounded-2xl bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center mx-auto mb-3">
              <CalendarDays className="h-7 w-7 text-zinc-400" />
            </div>
            <p className="font-black text-zinc-700 dark:text-zinc-300">No classes scheduled today</p>
            <p className="text-xs text-zinc-400 mt-1 font-medium">Enjoy your break! 🎉</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2.5">
            {todayRoutine.map((cls) => {
              const isBreak = cls.period.type === "BREAK";
              if (isBreak) return (
                <div key={cls.id} className="flex items-center gap-3 px-5 py-2">
                  <div className="flex-1 h-px bg-zinc-200 dark:bg-zinc-800" />
                  <span className="text-[10px] font-black uppercase tracking-[0.15em] text-zinc-400 whitespace-nowrap">
                    Break · {formatTime(cls.period.startTime)} – {formatTime(cls.period.endTime)}
                  </span>
                  <div className="flex-1 h-px bg-zinc-200 dark:bg-zinc-800" />
                </div>
              );

              const status = getClassStatus(cls.period.startTime, cls.period.endTime);

              return (
                <div
                  key={cls.id}
                  className={cn(
                    "flex items-center gap-4 p-4 rounded-2xl border transition-all duration-300",
                    status === "active"
                      ? "bg-primary text-white border-transparent shadow-xl shadow-primary/25 scale-[1.015] z-10"
                      : status === "completed"
                      ? "bg-zinc-50 dark:bg-zinc-900/30 border-zinc-100 dark:border-zinc-800/40 opacity-70"
                      : "bg-white dark:bg-[#0d0d0d] border-zinc-200/60 dark:border-zinc-800/60 hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-md"
                  )}
                >
                  {/* Status Icon */}
                  <div className={cn(
                    "h-12 w-12 flex-shrink-0 rounded-[16px] flex items-center justify-center",
                    status === "active"
                      ? "bg-white/20"
                      : "bg-zinc-100 dark:bg-zinc-800/60"
                  )}>
                    {status === "completed" ? (
                      <CheckCircle2 className="h-5 w-5 text-zinc-400" />
                    ) : status === "active" ? (
                      <div className="relative flex h-3.5 w-3.5">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                        <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-white" />
                      </div>
                    ) : (
                      <Timer className="h-5 w-5 text-zinc-400" />
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className={cn(
                      "font-black text-[15px] tracking-tight truncate",
                      status !== "active" && "text-zinc-900 dark:text-zinc-100"
                    )}>
                      {cls.subject?.subjectName || "Free Period"}
                    </h3>
                    <div className={cn(
                      "flex items-center flex-wrap gap-x-2 text-[11px] font-bold mt-0.5",
                      status === "active" ? "text-white/75" : "text-zinc-500"
                    )}>
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatTime(cls.period.startTime)} – {formatTime(cls.period.endTime)}
                      </span>
                      {cls.teacher && (
                        <>
                          <span className="opacity-40">·</span>
                          <span>{cls.teacher.firstName} {cls.teacher.lastName || ""}</span>
                        </>
                      )}
                      {cls.roomNo && (
                        <>
                          <span className="opacity-40">·</span>
                          <span>Room {cls.roomNo}</span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Status badge */}
                  {status === "active" && (
                    <span className="ml-auto flex-shrink-0 text-[10px] font-black uppercase tracking-widest bg-white/25 px-2.5 py-1 rounded-full">
                      Live
                    </span>
                  )}
                  {status === "upcoming" && (
                    <span className="ml-auto flex-shrink-0 text-[10px] font-black uppercase tracking-widest bg-zinc-100 dark:bg-zinc-800 text-zinc-500 px-2.5 py-1 rounded-full">
                      Soon
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Notice Board ── */}
      <div>
        <div className="flex items-center justify-between mb-4 ml-1">
          <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-zinc-400">Notice Board</h2>
        </div>

        {recentNotices.length === 0 ? (
          <div className="bg-white dark:bg-[#0d0d0d] border border-dashed border-zinc-200 dark:border-zinc-800 rounded-3xl p-8 text-center">
            <Megaphone className="h-10 w-10 text-zinc-300 dark:text-zinc-700 mx-auto mb-3" />
            <p className="font-black text-sm text-zinc-500">No notices yet</p>
          </div>
        ) : (
          <div className="bg-white dark:bg-[#0d0d0d] border border-zinc-200/60 dark:border-zinc-800/60 rounded-3xl overflow-hidden shadow-sm divide-y divide-zinc-100 dark:divide-zinc-800/50">
            {recentNotices.map((notice) => (
              <div
                key={notice.id}
                className="flex gap-4 p-5 hover:bg-zinc-50 dark:hover:bg-zinc-900/40 transition-colors cursor-pointer group"
              >
                <div className="mt-0.5 h-10 w-10 rounded-2xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-105">
                  <Megaphone className="h-5 w-5 text-blue-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[14px] font-black tracking-tight text-zinc-900 dark:text-zinc-100 leading-snug truncate">{notice.title}</p>
                  <p className="text-[12px] font-medium text-zinc-500 mt-0.5 line-clamp-1">{notice.content}</p>
                  <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider mt-1.5">
                    {formatDistanceToNow(new Date(notice.createdAt), { addSuffix: true })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Scroll buffer for bottom nav on mobile */}
      <div className="h-4 lg:hidden" />
    </div>
  );
}
