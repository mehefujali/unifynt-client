/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { CalendarIcon, ShieldAlert } from "lucide-react";
import { useQuery } from "@tanstack/react-query";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import AttendanceGrid from "./attendance-grid";
import { AcademicService } from "@/services/academic.service";

// --- Import Permissions and Gate ---
import { PERMISSIONS } from "@/config/permissions";
import { PermissionGate } from "@/components/common/permission-gate";

export default function AttendancePage() {
  const [date, setDate] = useState<Date>(new Date());
  const [classId, setClassId] = useState("");
  const [sectionId, setSectionId] = useState("");
  const [academicYearId, setAcademicYearId] = useState("");

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

  const isFilterComplete = classId && sectionId && academicYearId && date;

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
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-semibold tracking-tight">Daily Attendance</h1>
        </div>

        <Card className="border-0 shadow-sm ring-1 ring-border/50 rounded-2xl bg-white dark:bg-zinc-950">
          <CardHeader className="pb-4 border-b border-border/50">
            <CardTitle className="text-lg font-medium">Filter Criteria</CardTitle>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Select value={academicYearId} onValueChange={setAcademicYearId}>
                <SelectTrigger className="rounded-xl h-11 bg-zinc-50 dark:bg-zinc-900 border-0 ring-1 ring-inset ring-border/50 focus:ring-2 focus:ring-primary transition-all">
                  <SelectValue placeholder="Academic Year" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  {academicYears?.data?.map((year: any) => (
                    <SelectItem key={year.id} value={year.id} className="rounded-lg">
                      {year.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={classId} onValueChange={setClassId}>
                <SelectTrigger className="rounded-xl h-11 bg-zinc-50 dark:bg-zinc-900 border-0 ring-1 ring-inset ring-border/50 focus:ring-2 focus:ring-primary transition-all">
                  <SelectValue placeholder="Select Class" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  {classes?.data?.map((c: any) => (
                    <SelectItem key={c.id} value={c.id} className="rounded-lg">
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={sectionId} onValueChange={setSectionId} disabled={!classId}>
                <SelectTrigger className="rounded-xl h-11 bg-zinc-50 dark:bg-zinc-900 border-0 ring-1 ring-inset ring-border/50 focus:ring-2 focus:ring-primary transition-all disabled:opacity-50">
                  <SelectValue placeholder="Select Section" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  {sections?.map((s: any) => (
                    <SelectItem key={s.id} value={s.id} className="rounded-lg">
                      {s.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "rounded-xl h-11 justify-start text-left font-normal bg-zinc-50 dark:bg-zinc-900 border-0 ring-1 ring-inset ring-border/50 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all shadow-none",
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
          </CardContent>
        </Card>

        {isFilterComplete ? (
          <AttendanceGrid
            classId={classId}
            sectionId={sectionId}
            academicYearId={academicYearId}
            date={format(date, "yyyy-MM-dd")}
          />
        ) : (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="h-16 w-16 rounded-2xl bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center mb-4 ring-1 ring-inset ring-border/50">
              <CalendarIcon className="h-8 w-8 text-zinc-400" />
            </div>
            <h3 className="text-lg font-medium text-zinc-900 dark:text-zinc-100">No Target Selected</h3>
            <p className="text-sm text-zinc-500 mt-1 max-w-sm">
              Please select an academic year, class, section, and date to manage attendance.
            </p>
          </div>
        )}
      </div>
    </PermissionGate>
  );
}