/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { attendanceService } from "@/services/attendance.service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
}

export default function AttendanceGrid({ classId, sectionId, academicYearId, date }: Props) {
  const queryClient = useQueryClient();
  const [records, setRecords] = useState<any[]>([]);

  // Check if the user has permission to mark/edit attendance
  const { hasPermission } = usePermission();
  const canMarkAttendance = hasPermission(PERMISSIONS.ATTENDANCE_MARK);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["attendanceGrid", classId, sectionId, academicYearId, date],
    queryFn: () => attendanceService.getDailyGrid({ classId, sectionId, academicYearId, date }),
    retry: false,
  });

  useEffect(() => {
    if (data) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setRecords(
        data.map((student: any) => ({
          studentId: student.studentId,
          status: student.status || "PRESENT",
          remarks: student.remarks || "",
          studentData: student,
        }))
      );
    } else {
      setRecords([]);
    }
  }, [data, classId, sectionId]);

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
      <div className="flex h-64 items-center justify-center bg-white dark:bg-zinc-950 rounded-2xl ring-1 ring-border/50">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isError || !data || data.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center border-0 shadow-sm ring-1 ring-border/50 rounded-2xl bg-white dark:bg-zinc-950">
        <div className="h-16 w-16 rounded-2xl bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center mb-4 ring-1 ring-inset ring-border/50">
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
    <Card className="border-0 shadow-sm ring-1 ring-border/50 rounded-2xl bg-white dark:bg-zinc-950 overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-border/50 bg-zinc-50/50 dark:bg-zinc-900/50 px-6">
        <div className="flex items-center space-x-4">
          <CardTitle className="text-lg font-medium">Student List</CardTitle>
          <div className="flex space-x-2 text-sm font-medium">
            <span className="px-2.5 py-1 rounded-md bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">Total: {stats.total}</span>
            <span className="px-2.5 py-1 rounded-md bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400">Present: {stats.present}</span>
            <span className="px-2.5 py-1 rounded-md bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400">Absent: {stats.absent}</span>
          </div>
        </div>
        
        {/* 🔒 Gate for Save Button */}
        <PermissionGate required={PERMISSIONS.ATTENDANCE_MARK}>
            <Button
            onClick={handleSave}
            disabled={mutation.isPending || records.length === 0}
            className="rounded-xl px-6 bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-zinc-100 dark:hover:bg-white dark:text-zinc-900 shadow-sm transition-all"
            >
            {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Save Attendance
            </Button>
        </PermissionGate>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-border/50">
          {records.map((record) => (
            <div key={record.studentId} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50 transition-colors gap-4">
              <div className="flex items-center space-x-4">
                <Avatar className="h-10 w-10 ring-1 ring-border/50">
                  <AvatarImage src={record.studentData.profilePicture} />
                  <AvatarFallback className="bg-zinc-100 text-zinc-600 font-medium">
                    {record.studentData.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm font-medium leading-none text-zinc-900 dark:text-zinc-100">{record.studentData.name}</p>
                  <p className="text-xs text-zinc-500 mt-1">Roll: {record.studentData.rollNumber} • ID: {record.studentData.admissionNo}</p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-4">
                <div className="flex p-1 bg-zinc-100 dark:bg-zinc-900 rounded-xl ring-1 ring-inset ring-border/50">
                  <button
                    disabled={!canMarkAttendance}
                    onClick={() => handleStatusChange(record.studentId, "PRESENT")}
                    className={cn(
                      "flex items-center px-3 py-1.5 text-xs font-medium rounded-lg transition-all", 
                      record.status === "PRESENT" ? "bg-white dark:bg-zinc-800 text-green-600 shadow-sm ring-1 ring-border/50" : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100",
                      !canMarkAttendance && "opacity-60 cursor-not-allowed pointer-events-none"
                    )}
                  >
                    <CheckCircle2 className="mr-1.5 h-3.5 w-3.5" /> Present
                  </button>
                  <button
                    disabled={!canMarkAttendance}
                    onClick={() => handleStatusChange(record.studentId, "ABSENT")}
                    className={cn(
                      "flex items-center px-3 py-1.5 text-xs font-medium rounded-lg transition-all", 
                      record.status === "ABSENT" ? "bg-white dark:bg-zinc-800 text-red-600 shadow-sm ring-1 ring-border/50" : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100",
                      !canMarkAttendance && "opacity-60 cursor-not-allowed pointer-events-none"
                    )}
                  >
                    <XCircle className="mr-1.5 h-3.5 w-3.5" /> Absent
                  </button>
                  <button
                    disabled={!canMarkAttendance}
                    onClick={() => handleStatusChange(record.studentId, "LATE")}
                    className={cn(
                      "flex items-center px-3 py-1.5 text-xs font-medium rounded-lg transition-all", 
                      record.status === "LATE" ? "bg-white dark:bg-zinc-800 text-amber-600 shadow-sm ring-1 ring-border/50" : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100",
                      !canMarkAttendance && "opacity-60 cursor-not-allowed pointer-events-none"
                    )}
                  >
                    <Clock className="mr-1.5 h-3.5 w-3.5" /> Late
                  </button>
                  <button
                    disabled={!canMarkAttendance}
                    onClick={() => handleStatusChange(record.studentId, "LEAVE")}
                    className={cn(
                      "flex items-center px-3 py-1.5 text-xs font-medium rounded-lg transition-all", 
                      record.status === "LEAVE" ? "bg-white dark:bg-zinc-800 text-blue-600 shadow-sm ring-1 ring-border/50" : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100",
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
                    "w-40 rounded-xl h-9 bg-zinc-50 dark:bg-zinc-900 border-0 ring-1 ring-inset ring-border/50 focus-visible:ring-primary text-sm shadow-none",
                    !canMarkAttendance && "opacity-60 cursor-not-allowed"
                  )}
                />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}