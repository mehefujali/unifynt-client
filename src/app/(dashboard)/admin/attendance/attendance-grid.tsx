/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { attendanceService } from "@/services/attendance.service";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { CheckCircle2, XCircle, Clock, CalendarOff, Loader2, UsersIcon } from "lucide-react";
import { cn } from "@/lib/utils";

// --- Import Permissions and Gate ---
import { PERMISSIONS } from "@/config/permissions";
import { PermissionGate } from "@/components/common/permission-gate";
import { usePermission } from "@/hooks/use-permission";

interface Props {
  classId: string;
  sectionId: string;
  academicYearId: string;
  date: string;
  periodId?: string;
}

export default function AttendanceGrid({ classId, sectionId, academicYearId, date, periodId }: Props) {
  const queryClient = useQueryClient();
  const [records, setRecords] = useState<any[]>([]);

  // Check if the user has permission to mark/edit attendance
  const { hasPermission } = usePermission();
  const canMarkAttendance = hasPermission(PERMISSIONS.ATTENDANCE_MARK);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["attendanceGrid", classId, sectionId, academicYearId, date, periodId],
    queryFn: () => attendanceService.getDailyGrid({ classId, sectionId, academicYearId, date, periodId }),
    retry: false,
  });

  useEffect(() => {
    if (data && data.students) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setRecords(
        data.students.map((student: any) => ({
          studentId: student.studentId,
          status: student.status || "PRESENT",
          remarks: student.remarks || "",
          studentData: student,
        }))
      );
    } else {
      setRecords([]);
    }
  }, [data, classId, sectionId, periodId]);

  const mutation = useMutation({
    mutationFn: (payload: any) => attendanceService.saveDailyAttendance(payload),
    onSuccess: () => {
      toast.success("Attendance saved successfully");
      queryClient.invalidateQueries({ queryKey: ["attendanceGrid"] });
    },
    onError: () => {
      toast.error("Failed to save attendance");
    },
  });

  const handleStatusChange = (studentId: string, status: string) => {
    if (!canMarkAttendance) return;
    setRecords((prev) => prev.map((r) => (r.studentId === studentId ? { ...r, status } : r)));
  };

  const handleRemarksChange = (studentId: string, remarks: string) => {
    if (!canMarkAttendance) return;
    setRecords((prev) => prev.map((r) => (r.studentId === studentId ? { ...r, remarks } : r)));
  };

  const handleSave = () => {
    const payload = {
      classId,
      sectionId,
      academicYearId,
      date,
      periodId,
      records: records.map((r) => ({
        studentId: r.studentId,
        status: r.status,
        remarks: r.remarks,
      })),
    };
    mutation.mutate(payload);
  };

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center bg-white dark:bg-sidebar rounded-2xl ring-1 ring-border/50">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isError || !data || !data.students || data.students.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center border-0 shadow-sm ring-1 ring-border/50 rounded-2xl bg-white dark:bg-sidebar">
        <div className="h-16 w-16 rounded-2xl bg-zinc-100 dark:bg-background flex items-center justify-center mb-4 ring-1 ring-inset ring-border/50">
          <UsersIcon className="h-8 w-8 text-zinc-400" />
        </div>
        <p className="text-lg font-medium text-zinc-900 dark:text-zinc-100">No Students Found</p>
        <p className="text-sm text-zinc-500 mt-1">There are no active students in this section.</p>
      </div>
    );
  }

  const stats = {
    total: records.length,
    present: records.filter((r) => r.status === "PRESENT").length,
    absent: records.filter((r) => r.status === "ABSENT").length,
    late: records.filter((r) => r.status === "LATE").length,
  };

  return (
    <div className="bg-white dark:bg-sidebar border border-zinc-200 dark:border-sidebar-border rounded-2xl shadow-sm overflow-hidden flex flex-col transition-colors">
      <div className="p-5 border-b border-zinc-100 dark:border-sidebar-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-zinc-50/30 dark:bg-background/40">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <h3 className="font-bold text-base text-zinc-800 dark:text-zinc-100">Student Registry</h3>
          <div className="flex flex-wrap items-center gap-2">
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-[11px] font-bold text-zinc-600 dark:text-zinc-400">
               Total: {stats.total}
            </span>
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/30 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
               Present: {stats.present}
            </span>
            <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-50 dark:bg-rose-950/20 border border-rose-100 dark:border-rose-900/30 text-[11px] font-bold text-rose-600 dark:text-rose-400">
               Absent: {stats.absent}
            </span>
          </div>
        </div>
        
        {/* 🔒 Gate for Save Button */}
        <PermissionGate required={PERMISSIONS.ATTENDANCE_MARK}>
            <Button
            onClick={handleSave}
            disabled={mutation.isPending || records.length === 0}
            className="h-10 px-8 text-[13px] font-black shadow-lg shadow-zinc-900/10 bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 rounded-xl transition-all"
            >
            {mutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle2 className="mr-2 h-4 w-4" />}
            Save Registry
            </Button>
        </PermissionGate>
      </div>
      <div className="p-0">
        <div className="divide-y divide-border/50">
          {records.map((record) => (
            <div key={record.studentId} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50 transition-colors gap-4">
              <div className="flex items-center space-x-4">
                <Avatar className="h-11 w-11 border border-zinc-200 dark:border-zinc-700 shadow-sm">
                  <AvatarImage src={record.studentData.profilePicture} />
                  <AvatarFallback className="bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 text-xs font-bold uppercase">
                    {record.studentData.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-[14px] font-black tracking-tight text-zinc-900 dark:text-zinc-100">{record.studentData.name}</p>
                  <p className="text-[11px] font-bold text-zinc-500 mt-1 uppercase tracking-wider">ROLL #{record.studentData.rollNumber} • ADM No: {record.studentData.admissionNo}</p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4">
                <div className="flex p-1.5 bg-zinc-100 dark:bg-background/40 rounded-xl border border-zinc-200 dark:border-zinc-700/50">
                  <button
                    disabled={!canMarkAttendance}
                    onClick={() => handleStatusChange(record.studentId, "PRESENT")}
                    className={cn(
                      "flex items-center px-4 py-2 text-[11px] font-black uppercase tracking-widest rounded-lg transition-all", 
                      record.status === "PRESENT" ? "bg-white dark:bg-zinc-800 text-emerald-600 dark:text-emerald-400 shadow-sm border border-zinc-200 dark:border-zinc-700" : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200",
                      !canMarkAttendance && "opacity-60 cursor-not-allowed pointer-events-none"
                    )}
                  >
                    <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" /> Present
                  </button>
                  <button
                    disabled={!canMarkAttendance}
                    onClick={() => handleStatusChange(record.studentId, "ABSENT")}
                    className={cn(
                      "flex items-center px-4 py-2 text-[11px] font-black uppercase tracking-widest rounded-lg transition-all", 
                      record.status === "ABSENT" ? "bg-white dark:bg-zinc-800 text-rose-600 dark:text-rose-400 shadow-sm border border-zinc-200 dark:border-zinc-700" : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200",
                      !canMarkAttendance && "opacity-60 cursor-not-allowed pointer-events-none"
                    )}
                  >
                    <XCircle className="mr-1.5 h-3.5 w-3.5" /> Absent
                  </button>
                  <button
                    disabled={!canMarkAttendance}
                    onClick={() => handleStatusChange(record.studentId, "LATE")}
                    className={cn(
                      "flex items-center px-4 py-2 text-[11px] font-black uppercase tracking-widest rounded-lg transition-all", 
                      record.status === "LATE" ? "bg-white dark:bg-zinc-800 text-amber-600 dark:text-amber-400 shadow-sm border border-zinc-200 dark:border-zinc-700" : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200",
                      !canMarkAttendance && "opacity-60 cursor-not-allowed pointer-events-none"
                    )}
                  >
                    <Clock className="mr-1.5 h-3.5 w-3.5" /> Late
                  </button>
                  <button
                    disabled={!canMarkAttendance}
                    onClick={() => handleStatusChange(record.studentId, "LEAVE")}
                    className={cn(
                      "flex items-center px-4 py-2 text-[11px] font-black uppercase tracking-widest rounded-lg transition-all", 
                      record.status === "LEAVE" ? "bg-white dark:bg-zinc-800 text-blue-600 dark:text-blue-400 shadow-sm border border-zinc-200 dark:border-zinc-700" : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200",
                      !canMarkAttendance && "opacity-60 cursor-not-allowed pointer-events-none"
                    )}
                  >
                    <CalendarOff className="mr-1.5 h-3.5 w-3.5" /> Leave
                  </button>
                </div>

                <Input
                  disabled={!canMarkAttendance}
                  placeholder="Remarks..."
                  value={record.remarks}
                  onChange={(e) => handleRemarksChange(record.studentId, e.target.value)}
                  className={cn(
                    "w-48 rounded-xl h-11 bg-zinc-50 dark:bg-background/20 border-zinc-200 dark:border-sidebar-border text-[12px] font-bold shadow-none focus-visible:ring-1 focus-visible:ring-zinc-400",
                    !canMarkAttendance && "opacity-60 cursor-not-allowed"
                  )}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}