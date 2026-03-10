/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import { cn } from "@/lib/utils";
import {
  CalendarDays,
  Clock,
  User,
  BookOpen,
  MapPin,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

interface RoutineEntry {
  id: string;
  roomNo?: string;
  day: string;
  subject?: { subjectName: string; subjectCode: string };
  teacher?: { firstName: string; lastName?: string };
  period: { startTime: string; endTime: string; type: string; name: string };
}

interface WeeklyRoutine {
  studentInfo: { className: string; sectionName: string; rollNumber: number };
  days: string[];
  routine: Record<string, RoutineEntry[]>;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const DAYS_SHORT: Record<string, string> = {
  MONDAY: "Mon",
  TUESDAY: "Tue",
  WEDNESDAY: "Wed",
  THURSDAY: "Thu",
  FRIDAY: "Fri",
  SATURDAY: "Sat",
};

const SUBJECT_COLORS = [
  "bg-blue-50 dark:bg-blue-500/10 border-blue-200/60 dark:border-blue-500/20 text-blue-700 dark:text-blue-300",
  "bg-purple-50 dark:bg-purple-500/10 border-purple-200/60 dark:border-purple-500/20 text-purple-700 dark:text-purple-300",
  "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200/60 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-300",
  "bg-amber-50 dark:bg-amber-500/10 border-amber-200/60 dark:border-amber-500/20 text-amber-700 dark:text-amber-300",
  "bg-rose-50 dark:bg-rose-500/10 border-rose-200/60 dark:border-rose-500/20 text-rose-700 dark:text-rose-300",
  "bg-cyan-50 dark:bg-cyan-500/10 border-cyan-200/60 dark:border-cyan-500/20 text-cyan-700 dark:text-cyan-300",
  "bg-indigo-50 dark:bg-indigo-500/10 border-indigo-200/60 dark:border-indigo-500/20 text-indigo-700 dark:text-indigo-300",
  "bg-orange-50 dark:bg-orange-500/10 border-orange-200/60 dark:border-orange-500/20 text-orange-700 dark:text-orange-300",
];

// Build a stable color map for subjects
function buildColorMap(routine: Record<string, RoutineEntry[]>) {
  const seen: Record<string, number> = {};
  let idx = 0;
  Object.values(routine).flat().forEach(r => {
    const key = r.subject?.subjectCode || r.subject?.subjectName || "__break";
    if (!(key in seen)) { seen[key] = idx++ % SUBJECT_COLORS.length; }
  });
  return seen;
}

function formatTime(t: string) {
  const [h, m] = t.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const hour = h % 12 || 12;
  return `${hour}:${m.toString().padStart(2, "0")} ${ampm}`;
}

function isCurrentDay(day: string) {
  const today = new Date().getDay();
  const map: Record<string, number> = { MONDAY: 1, TUESDAY: 2, WEDNESDAY: 3, THURSDAY: 4, FRIDAY: 5, SATURDAY: 6 };
  return map[day] === today;
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────

function Skeleton() {
  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto pb-8">
      <div className="flex flex-col gap-2 pt-2">
        <div className="animate-pulse h-10 w-56 bg-zinc-100 dark:bg-zinc-800 rounded-xl" />
        <div className="animate-pulse h-4 w-40 bg-zinc-100 dark:bg-zinc-800 rounded-lg" />
      </div>
      <div className="flex gap-2">
        {[...Array(6)].map((_, i) => <div key={i} className="animate-pulse h-10 flex-1 bg-zinc-100 dark:bg-zinc-800 rounded-xl" />)}
      </div>
      <div className="flex flex-col gap-3">
        {[...Array(5)].map((_, i) => <div key={i} className="animate-pulse h-20 bg-zinc-100 dark:bg-zinc-800 rounded-2xl" />)}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function StudentRoutinePage() {
  const todayDayNames = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];
  const todayName = todayDayNames[new Date().getDay()];
  // Default active tab: if today is a school day, show it; else default to MONDAY
  const defaultDay = ["MONDAY","TUESDAY","WEDNESDAY","THURSDAY","FRIDAY","SATURDAY"].includes(todayName)
    ? todayName : "MONDAY";

  const [activeDay, setActiveDay] = useState(defaultDay);

  const { data, isLoading, isError } = useQuery<WeeklyRoutine>({
    queryKey: ["student-routine"],
    queryFn: async () => {
      const res = await api.get("/routine/my-weekly");
      return res.data.data;
    },
    staleTime: 1000 * 60 * 10,
  });

  if (isLoading) return <Skeleton />;

  if (isError) return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4 text-center">
      <div className="h-20 w-20 rounded-full bg-rose-50 dark:bg-rose-500/10 flex items-center justify-center">
        <AlertCircle className="h-10 w-10 text-rose-400" />
      </div>
      <p className="font-black text-zinc-700 dark:text-zinc-300">Could not load routine data.</p>
      <p className="text-sm text-zinc-500">Please try refreshing the page.</p>
    </div>
  );

  const { studentInfo, days, routine } = data!;
  const colorMap = buildColorMap(routine);
  const currentEntries = routine[activeDay] || [];
  const totalPeriods = currentEntries.filter(e => e.period.type !== "BREAK").length;
  const totalBreaks = currentEntries.filter(e => e.period.type === "BREAK").length;

  // Count entries per day for the pill indicator
  const dayCount = (d: string) => (routine[d] || []).filter(e => e.period.type !== "BREAK").length;

  const activeDayIdx = days.indexOf(activeDay);

  return (
    <div className="flex flex-col gap-6 max-w-4xl mx-auto pb-8">

      {/* ── Header ── */}
      <div className="flex flex-col gap-1 pt-2">
        <h1 className="text-3xl lg:text-4xl font-black tracking-tight text-zinc-900 dark:text-zinc-100 mt-2">
          Weekly Timetable
        </h1>
        <p className="text-sm font-semibold text-zinc-500">
          Class <span className="font-black text-zinc-700 dark:text-zinc-400">{studentInfo.className}</span>–
          <span className="font-black text-zinc-700 dark:text-zinc-400">{studentInfo.sectionName}</span>
          {" · "}Roll #{studentInfo.rollNumber}
        </p>
      </div>

      {/* ── Day Selector (Tab Row) ── */}
      <div className="relative">
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {days.map((day) => {
            const isCurrent = isCurrentDay(day);
            const isActive = activeDay === day;
            const count = dayCount(day);
            return (
              <button
                key={day}
                onClick={() => setActiveDay(day)}
                className={cn(
                  "flex-shrink-0 flex flex-col items-center gap-1 px-4 py-2.5 rounded-2xl font-black text-[13px] tracking-wide transition-all duration-200 border relative",
                  isActive
                    ? "bg-primary text-white border-transparent shadow-lg shadow-primary/25 scale-[1.02]"
                    : "bg-white dark:bg-[#0d0d0d] border-zinc-200/60 dark:border-zinc-800/60 text-zinc-500 hover:text-zinc-800 dark:hover:text-zinc-200 hover:border-zinc-300"
                )}
              >
                <span className="uppercase">{DAYS_SHORT[day]}</span>
                <span className={cn(
                  "text-[10px] font-bold",
                  isActive ? "text-white/70" : "text-zinc-400"
                )}>
                  {count} {count === 1 ? "class" : "classes"}
                </span>
                {/* Today Indicator Dot */}
                {isCurrent && !isActive && (
                  <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full bg-primary" />
                )}
              </button>
            );
          })}
        </div>

        {/* Mobile nav arrows */}
        <div className="flex sm:hidden items-center justify-between mt-2">
          <button
            onClick={() => setActiveDay(days[Math.max(0, activeDayIdx - 1)])}
            disabled={activeDayIdx === 0}
            className="h-8 w-8 rounded-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center disabled:opacity-30 transition-opacity"
          >
            <ChevronLeft className="h-4 w-4 text-zinc-600" />
          </button>
          <span className="text-[11px] font-black uppercase tracking-widest text-primary">
            {activeDay}
          </span>
          <button
            onClick={() => setActiveDay(days[Math.min(days.length - 1, activeDayIdx + 1)])}
            disabled={activeDayIdx === days.length - 1}
            className="h-8 w-8 rounded-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 flex items-center justify-center disabled:opacity-30 transition-opacity"
          >
            <ChevronRight className="h-4 w-4 text-zinc-600" />
          </button>
        </div>
      </div>

      {/* ── Summary Chips ── */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="flex items-center gap-2 bg-zinc-100 dark:bg-zinc-900 px-3 py-1.5 rounded-full">
          <BookOpen className="h-3.5 w-3.5 text-primary" />
          <span className="text-[11px] font-black text-zinc-600 dark:text-zinc-400">{totalPeriods} Periods</span>
        </div>
        {totalBreaks > 0 && (
          <div className="flex items-center gap-2 bg-zinc-100 dark:bg-zinc-900 px-3 py-1.5 rounded-full">
            <Clock className="h-3.5 w-3.5 text-amber-500" />
            <span className="text-[11px] font-black text-zinc-600 dark:text-zinc-400">{totalBreaks} Break{totalBreaks > 1 ? "s" : ""}</span>
          </div>
        )}
        {isCurrentDay(activeDay) && (
          <div className="flex items-center gap-2 bg-primary/10 dark:bg-primary/10 px-3 py-1.5 rounded-full">
            <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse inline-block" />
            <span className="text-[11px] font-black text-primary">Today</span>
          </div>
        )}
      </div>

      {/* ── Timetable Cards ── */}
      {currentEntries.length === 0 ? (
        <div className="bg-white dark:bg-[#0d0d0d] border border-dashed border-zinc-200 dark:border-zinc-800 rounded-3xl p-12 text-center shadow-sm">
          <div className="h-16 w-16 rounded-2xl bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center mx-auto mb-4">
            <CalendarDays className="h-8 w-8 text-zinc-300 dark:text-zinc-700" />
          </div>
          <p className="font-black text-zinc-600 dark:text-zinc-400">No classes on {activeDay.charAt(0) + activeDay.slice(1).toLowerCase()}</p>
          <p className="text-sm text-zinc-400 mt-1 font-medium">Time to relax! 🎉</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {currentEntries.map((entry, idx) => {
            const isBreak = entry.period.type === "BREAK";

            if (isBreak) return (
              <div key={entry.id} className="flex items-center gap-3 px-2 py-1">
                <div className="flex-1 h-px bg-zinc-200/70 dark:bg-zinc-800/70" />
                <span className="text-[10px] font-black uppercase tracking-[0.15em] text-zinc-400 bg-zinc-100 dark:bg-zinc-900 px-3 py-1 rounded-full whitespace-nowrap">
                  {entry.period.name || "Break"} · {formatTime(entry.period.startTime)} – {formatTime(entry.period.endTime)}
                </span>
                <div className="flex-1 h-px bg-zinc-200/70 dark:bg-zinc-800/70" />
              </div>
            );

            const subKey = entry.subject?.subjectCode || entry.subject?.subjectName || `free-${idx}`;
            const colorIdx = colorMap[subKey] ?? 0;
            const cardColor = SUBJECT_COLORS[colorIdx % SUBJECT_COLORS.length];

            return (
              <div
                key={entry.id}
                className={cn(
                  "flex items-stretch gap-0 rounded-2xl border overflow-hidden shadow-sm hover:shadow-md transition-shadow group",
                  "bg-white dark:bg-[#0d0d0d] border-zinc-200/60 dark:border-zinc-800/60"
                )}
              >
                {/* Color left stripe */}
                <div className={cn("w-1.5 flex-shrink-0 rounded-l-2xl", cardColor.split(" ")[0], "!bg-opacity-100 dark:!bg-opacity-100")} style={{ background: undefined }}>
                  <div className={cn("w-full h-full", cardColor.split(" ")[0])} />
                </div>

                <div className="flex-1 flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 pl-5">
                  {/* Period info (time) */}
                  <div className="flex-shrink-0 text-center sm:w-28">
                    <p className="text-[11px] font-black uppercase tracking-wider text-zinc-400 mb-1">
                      {entry.period.name}
                    </p>
                    <p className="text-[12px] font-bold text-zinc-600 dark:text-zinc-400 whitespace-nowrap">
                      {formatTime(entry.period.startTime)}
                    </p>
                    <p className="text-[10px] text-zinc-400 font-semibold">
                      – {formatTime(entry.period.endTime)}
                    </p>
                  </div>

                  {/* Divider */}
                  <div className="hidden sm:block w-px h-12 bg-zinc-100 dark:bg-zinc-800 flex-shrink-0" />

                  {/* Subject info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                      <span className={cn(
                        "inline-flex items-center gap-1.5 text-[11px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full border",
                        cardColor
                      )}>
                        <BookOpen className="h-3 w-3" />
                        {entry.subject?.subjectCode || "—"}
                      </span>
                    </div>
                    <h3 className="font-black text-[16px] tracking-tight text-zinc-900 dark:text-zinc-100 truncate">
                      {entry.subject?.subjectName || "Free Period"}
                    </h3>

                    <div className="flex items-center flex-wrap gap-x-4 gap-y-1 mt-1.5">
                      {entry.teacher && (
                        <span className="flex items-center gap-1.5 text-[11px] font-bold text-zinc-500">
                          <User className="h-3.5 w-3.5 text-zinc-400" />
                          {entry.teacher.firstName} {entry.teacher.lastName || ""}
                        </span>
                      )}
                      {entry.roomNo && (
                        <span className="flex items-center gap-1.5 text-[11px] font-bold text-zinc-500">
                          <MapPin className="h-3.5 w-3.5 text-zinc-400" />
                          Room {entry.roomNo}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* ── Full Week Summary Grid (desktop only) ── */}
      <div className="hidden lg:block mt-4">
        <h2 className="text-[11px] font-black uppercase tracking-[0.2em] text-zinc-400 mb-4 ml-1">Week at a Glance</h2>
        <div className="grid grid-cols-6 gap-3">
          {days.map((day) => {
            const entries = routine[day] || [];
            const classEntries = entries.filter(e => e.period.type !== "BREAK");
            const isCurrent = isCurrentDay(day);
            return (
              <button
                key={day}
                onClick={() => setActiveDay(day)}
                className={cn(
                  "rounded-2xl p-3 text-left border transition-all duration-200",
                  activeDay === day
                    ? "border-primary/40 bg-primary/5 dark:bg-primary/10 shadow-sm"
                    : "bg-white dark:bg-[#0d0d0d] border-zinc-200/60 dark:border-zinc-800/60 hover:border-primary/30"
                )}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className={cn(
                    "text-[11px] font-black uppercase tracking-widest",
                    isCurrent ? "text-primary" : "text-zinc-500"
                  )}>{DAYS_SHORT[day]}</span>
                  {isCurrent && <span className="w-1.5 h-1.5 rounded-full bg-primary" />}
                </div>
                <div className="flex flex-col gap-1">
                  {classEntries.slice(0, 4).map((e, i) => (
                    <div
                      key={e.id}
                      className={cn(
                        "h-2 rounded-full text-[9px] truncate",
                        SUBJECT_COLORS[(colorMap[e.subject?.subjectCode || e.subject?.subjectName || `free-${i}`] ?? 0) % SUBJECT_COLORS.length].split(" ")[0]
                      )}
                    />
                  ))}
                  {classEntries.length > 4 && (
                    <span className="text-[9px] font-bold text-zinc-400">+{classEntries.length - 4} more</span>
                  )}
                  {classEntries.length === 0 && (
                    <span className="text-[9px] font-bold text-zinc-300 dark:text-zinc-700">No classes</span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="h-4 lg:hidden" />
    </div>
  );
}
