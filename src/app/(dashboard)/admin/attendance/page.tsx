/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { CalendarIcon, ShieldAlert, UsersIcon } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import AttendanceGrid from "./attendance-grid";
import { AcademicService } from "@/services/academic.service";
import { PeriodService } from "@/services/period.service";
import { SchoolService } from "@/services/school.service";
import { useAuth } from "@/hooks/use-auth";

// --- Import Permissions and Gate ---
import { PERMISSIONS } from "@/config/permissions";
import { PermissionGate } from "@/components/common/permission-gate";

export default function AttendancePage() {
  const { user } = useAuth();
  const [date, setDate] = useState<Date>(new Date());
  const [classId, setClassId] = useState("");
  const [sectionId, setSectionId] = useState("");
  const [periodId, setPeriodId] = useState("");
  const [academicYearId, setAcademicYearId] = useState("");

  const { data: schoolData } = useQuery({
    queryKey: ["my-school", user?.schoolId],
    queryFn: () => SchoolService.getSingleSchool(user?.schoolId as string),
    enabled: !!user?.schoolId,
  });

  const isSubjectWise = schoolData?.attendanceType === "SUBJECT_WISE";

  const { data: periods } = useQuery({
    queryKey: ["periods", classId],
    queryFn: () => PeriodService.getAllPeriods({ classId }),
    enabled: !!classId,
  });

  const { data: academicYears } = useQuery({
    queryKey: ["academicYears"],
    queryFn: () => AcademicService.getAllAcademicYears(),
  });

  const { data: classes } = useQuery({
    queryKey: ["classes"],
    queryFn: () => AcademicService.getAllClasses(),
  });

  const { data: sections } = useQuery({
    queryKey: ["sections", classId],
    queryFn: () => AcademicService.getSectionsByClass(classId),
    enabled: !!classId,
  });

  useEffect(() => {
    if (academicYears?.length > 0 && !academicYearId) {
      const activeYear = academicYears.find((year: any) => year.status === "ACTIVE") || academicYears[0];
      setAcademicYearId(activeYear.id);
    }
  }, [academicYears, academicYearId]);

  const isFilterComplete = classId && sectionId && academicYearId && date && (!isSubjectWise || periodId);

  return (
    // 🔒 Gate for the Entire Page View
    <PermissionGate 
      required={PERMISSIONS.ATTENDANCE_VIEW}
      fallback={
        <div className="flex flex-col items-center justify-center py-32 text-center animate-in fade-in zoom-in-95 duration-500">
          <div className="h-20 w-20 bg-red-50 dark:bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mb-6 ring-8 ring-red-50/50 dark:ring-red-500/5">
            <ShieldAlert className="h-10 w-10" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Access Restricted</h2>
          <p className="text-muted-foreground mt-2 max-w-md mx-auto">
            You do not have permission to view the attendance records. Please contact your school administrator if you believe this is an error.
          </p>
        </div>
      }
    >
      <div className="p-4 md:p-8 space-y-8 bg-transparent">
        {/* Header Section */}
        <div className="flex flex-col gap-2 pb-5 border-b border-zinc-200 dark:border-zinc-800">
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-3">
                <div className="h-12 w-12 bg-zinc-100 dark:bg-white/5 rounded-xl flex items-center justify-center border border-zinc-200 dark:border-white/10 shadow-sm">
                    <UsersIcon className="h-6 w-6 text-zinc-600 dark:text-zinc-400" />
                </div>
                Daily Attendance
            </h1>
            <p className="text-sm text-zinc-500 max-w-2xl leading-relaxed">
                Record and manage student attendance accurately. Select the criteria below to load the student registry.
            </p>
        </div>        <div className="p-6 bg-white dark:bg-sidebar border border-zinc-200 dark:border-sidebar-border rounded-2xl shadow-sm space-y-5 transition-colors">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
              <div className="space-y-2">
                <Label className="text-[11px] font-extrabold text-zinc-500 uppercase tracking-widest">Academic Year</Label>
                <Select value={academicYearId} onValueChange={setAcademicYearId}>
                  <SelectTrigger className="rounded-xl h-11 bg-zinc-50 dark:bg-background/20 border-zinc-200 dark:border-sidebar-border text-[13px] font-bold shadow-none">
                    <SelectValue placeholder="Academic Year" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {academicYears?.data?.map((year: any) => (
                      <SelectItem key={year.id} value={year.id} className="font-medium">
                        {year.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-[11px] font-extrabold text-zinc-500 uppercase tracking-widest">Class</Label>
                <Select value={classId} onValueChange={setClassId}>
                  <SelectTrigger className="rounded-xl h-11 bg-zinc-50 dark:bg-background/20 border-zinc-200 dark:border-sidebar-border text-[13px] font-bold shadow-none">
                    <SelectValue placeholder="Select Class" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {classes?.data?.map((c: any) => (
                      <SelectItem key={c.id} value={c.id} className="font-medium">
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-[11px] font-extrabold text-zinc-500 uppercase tracking-widest">Section</Label>
                <Select value={sectionId} onValueChange={setSectionId} disabled={!classId}>
                  <SelectTrigger className="rounded-xl h-11 bg-zinc-50 dark:bg-background/20 border-zinc-200 dark:border-sidebar-border text-[13px] font-bold shadow-none disabled:opacity-50">
                    <SelectValue placeholder="Select Section" />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl">
                    {(Array.isArray(sections) ? sections : sections?.data?.data || sections?.data || [])?.map((s: any) => (
                      <SelectItem key={s.id} value={s.id} className="font-medium">
                        {s.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-[11px] font-extrabold text-zinc-500 uppercase tracking-widest">Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full rounded-xl h-11 justify-start text-left text-[13px] font-bold bg-zinc-50 dark:bg-background/20 border-zinc-200 dark:border-sidebar-border hover:bg-zinc-100 dark:hover:bg-background/30 transition-all shadow-none",
                        !date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, "PPP") : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 rounded-xl" align="start">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={(d) => d && setDate(d)}
                      initialFocus
                      className="rounded-xl"
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {isSubjectWise && (
                <div className="space-y-2">
                  <Label className="text-[11px] font-extrabold text-zinc-500 uppercase tracking-widest">Period</Label>
                  <Select value={periodId} onValueChange={setPeriodId} disabled={!classId}>
                    <SelectTrigger className="rounded-xl h-11 bg-zinc-50 dark:bg-background/20 border-zinc-200 dark:border-sidebar-border text-[13px] font-bold shadow-none disabled:opacity-50">
                      <SelectValue placeholder="Select Period" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      {(Array.isArray(periods) ? periods : periods?.data || [])?.map((p: any) => (
                        <SelectItem key={p.id} value={p.id} className="font-medium">
                          {p.name} ({format(new Date(`2000-01-01T${p.startTime}`), "hh:mm a")})
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
        </div>

        {isFilterComplete ? (
          <AttendanceGrid
            classId={classId}
            sectionId={sectionId}
            academicYearId={academicYearId}
            date={format(date, "yyyy-MM-dd")}
            periodId={isSubjectWise ? periodId : undefined}
          />
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-center bg-white dark:bg-sidebar border border-zinc-200 dark:border-sidebar-border rounded-2xl shadow-sm transition-colors">
            <div className="h-16 w-16 rounded-2xl bg-zinc-100 dark:bg-background/40 flex items-center justify-center mb-4 border border-zinc-200 dark:border-white/5">
              <CalendarIcon className="h-8 w-8 text-zinc-400" />
            </div>
            <h3 className="text-lg font-black text-zinc-900 dark:text-zinc-100">Selection Required</h3>
            <p className="text-[13px] font-medium text-zinc-500 mt-1 max-w-sm">
              Please select appropriate filters to load and manage the attendance registry.
            </p>
          </div>
        )}
      </div>
    </PermissionGate>
  );
}