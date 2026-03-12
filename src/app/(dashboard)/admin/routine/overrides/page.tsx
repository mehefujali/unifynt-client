/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    Clock, 
    CalendarClock, 
    UserCheck, 
    Ban,
    RotateCcw, 
    ChevronDown,
    ChevronLeft,
    ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AcademicService } from "@/services/academic.service";
import { RoutineService } from "@/services/routine.service";
import { TeacherService } from "@/services/teacher.service";
import { toast } from "sonner";
import { PERMISSIONS } from "@/config/permissions";
import { PermissionGate } from "@/components/common/permission-gate";
import { cn } from "@/lib/utils";

function getTodayISO() {
    return new Date().toISOString().split("T")[0];
}
function getDayOfWeek(iso: string): string {
    const days = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];
    return days[new Date(iso).getDay()];
}
function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
}

// ─── Substitute Dialog ──────────────────────────────────────────────────────
function SubstituteDialog({
    open,
    onClose,
    routine,
    date,
    onConfirm,
    isPending,
}: {
    open: boolean;
    onClose: () => void;
    routine: any;
    date: string;
    onConfirm: (teacherId: string, reason: string) => void;
    isPending: boolean;
}) {
    const [teacherId, setTeacherId] = useState("");
    const [reason, setReason] = useState("");

    const { data: teachers } = useQuery({
        queryKey: ["teachers-list"],
        queryFn: () => TeacherService.getAllTeachers({ limit: 200 }),
        enabled: open,
    });
    const teacherList = Array.isArray(teachers) ? teachers : (teachers?.data || []);

    return (
        <Dialog open={open} onOpenChange={onClose}>
            <DialogContent className="max-w-md rounded-2xl">
                <DialogHeader>
                    <DialogTitle className="text-[16px] font-black text-slate-900 dark:text-white">Assign Substitute Teacher</DialogTitle>
                    <DialogDescription className="text-[13px] text-slate-500">
                        For <span className="font-bold text-slate-700 dark:text-slate-300">{routine?.subject?.subjectName || "this class"}</span> on{" "}
                        <span className="font-bold text-slate-700 dark:text-slate-300">{formatDate(date)}</span>
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-2">
                    <div className="space-y-1.5">
                        <Label className="text-[12px] font-black text-slate-500 uppercase tracking-wider">Select Substitute</Label>
                        <Select value={teacherId} onValueChange={setTeacherId}>
                            <SelectTrigger className="h-11 rounded-xl font-bold text-[13px]">
                                <SelectValue placeholder="Choose a teacher..." />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl">
                                {teacherList.map((t: any) => (
                                    <SelectItem key={t.id} value={t.id} className="font-medium">
                                        {t.firstName} {t.lastName}
                                        {t.department ? ` — ${t.department}` : ""}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-1.5">
                        <Label className="text-[12px] font-black text-slate-500 uppercase tracking-wider">Reason <span className="font-medium normal-case text-slate-400">(optional)</span></Label>
                        <Textarea
                            rows={3}
                            placeholder="e.g. Original teacher on leave"
                            className="rounded-xl text-[13px] font-medium resize-none"
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                        />
                    </div>
                </div>
                <DialogFooter className="gap-2">
                    <Button variant="outline" size="sm" className="rounded-xl h-9 font-bold" onClick={onClose}>Cancel</Button>
                    <Button
                        size="sm"
                        className="rounded-xl h-9 font-black bg-zinc-900 hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 text-white px-6 transition-all"
                        disabled={!teacherId || isPending}
                        onClick={() => onConfirm(teacherId, reason)}
                    >
                        {isPending ? "Assigning..." : "Confirm Substitute"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export default function DailyOverridesPage() {
    const queryClient = useQueryClient();
    const [selectedDate, setSelectedDate] = useState(getTodayISO());
    const [selectedClassId, setSelectedClassId] = useState("all");
    const [substituteTarget, setSubstituteTarget] = useState<any>(null);
    const [showCancelAllDialog, setShowCancelAllDialog] = useState(false);
    const [isCancellingAll, setIsCancellingAll] = useState(false);

    const dayOfWeek = useMemo(() => getDayOfWeek(selectedDate), [selectedDate]);

    const { data: classes } = useQuery({
        queryKey: ["classes"],
        queryFn: () => AcademicService.getAllClasses(),
    });
    const classList = classes?.data?.data || classes?.data || [];

    const { data: routinesData, isLoading: loadingRoutines } = useQuery({
        queryKey: ["routines-daily", dayOfWeek, selectedClassId],
        queryFn: () =>
            RoutineService.getAllRoutines({
                day: dayOfWeek,
                classId: selectedClassId === "all" ? undefined : selectedClassId,
                limit: 200,
            }),
    });

    const { data: adjustmentsData } = useQuery({
        queryKey: ["adjustments", selectedDate],
        queryFn: () => RoutineService.getAdjustments({ date: selectedDate }),
    });

    const routines: any[] = routinesData?.data || [];

    const adjustmentMap = useMemo(() => {
        const adjs: any[] = adjustmentsData?.data || [];
        const map: Record<string, any> = {};
        for (const adj of adjs) {
            map[adj.routineId] = adj;
        }
        return map;
    }, [adjustmentsData]);

    const adjustMutation = useMutation({
        mutationFn: (data: any) => RoutineService.adjustClass(data),
        onSuccess: () => {
            toast.success("Schedule updated");
            queryClient.invalidateQueries({ queryKey: ["adjustments", selectedDate] });
            setSubstituteTarget(null);
        },
        onError: (err: any) => toast.error(err?.response?.data?.message || "Failed"),
    });

    const revertMutation = useMutation({
        mutationFn: (id: string) => RoutineService.revertAdjustment(id),
        onSuccess: () => {
            toast.success("Restored to default");
            queryClient.invalidateQueries({ queryKey: ["adjustments", selectedDate] });
        },
        onError: (err: any) => toast.error(err?.response?.data?.message || "Failed"),
    });

    const handleCancel = (routineId: string) => {
        adjustMutation.mutate({ routineId, date: selectedDate, action: "CANCELLED" });
    };

    const handleCancelAll = async () => {
        setShowCancelAllDialog(false);
        setIsCancellingAll(true);
        const toCancel = routines.filter((r: any) => {
            const adj = adjustmentMap[r.id];
            return r.period?.type === "CLASS" && !adj;
        });
        for (const r of toCancel) {
            await RoutineService.adjustClass({ routineId: r.id, date: selectedDate, action: "CANCELLED" });
        }
        setIsCancellingAll(false);
        queryClient.invalidateQueries({ queryKey: ["adjustments", selectedDate] });
        toast.success(`${toCancel.length} class${toCancel.length !== 1 ? 'es' : ''} cancelled for ${formatDate(selectedDate)}`);
    };

    const handleSubstitute = (teacherId: string, reason: string) => {
        if (!substituteTarget) return;
        adjustMutation.mutate({
            routineId: substituteTarget.id,
            date: selectedDate,
            action: "SUBSTITUTED",
            substitutedTeacherId: teacherId,
            reason,
        });
    };

    const goDay = (delta: number) => {
        const d = new Date(selectedDate);
        d.setDate(d.getDate() + delta);
        setSelectedDate(d.toISOString().split("T")[0]);
    };

    return (
        <div className="p-4 md:p-8 space-y-8 bg-transparent">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-zinc-100 dark:bg-white/5 flex items-center justify-center border border-zinc-200 dark:border-white/10 shadow-sm">
                        <CalendarClock className="h-6 w-6 text-zinc-600 dark:text-zinc-400" />
                    </div>
                    <div>
                        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-2">Daily Overrides</h1>
                        <p className="text-[13px] font-medium text-zinc-500 mt-0.5">Manage day-specific class adjustments and substitutes.</p>
                    </div>
                </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center gap-4 bg-white dark:bg-sidebar border border-zinc-200 dark:border-sidebar-border rounded-2xl p-4 shadow-sm transition-colors">
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" className="h-10 w-10 rounded-xl border-zinc-200 dark:border-sidebar-border bg-zinc-50 dark:bg-background/20" onClick={() => goDay(-1)}>
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="h-10 rounded-xl border border-zinc-200 dark:border-sidebar-border bg-zinc-50 dark:bg-background/20 text-[13px] font-bold text-zinc-900 dark:text-zinc-100 px-4 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
                    />
                    <Button variant="outline" size="icon" className="h-10 w-10 rounded-xl border-zinc-200 dark:border-sidebar-border bg-zinc-50 dark:bg-background/20" onClick={() => goDay(1)}>
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-10 rounded-xl text-[12px] font-bold text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 px-4" onClick={() => setSelectedDate(getTodayISO())}>
                        Today
                    </Button>
                </div>
                <div className="flex items-center gap-3 sm:ml-auto">
                    <div className="flex flex-col items-end">
                        <span className="text-[14px] font-extrabold text-zinc-900 dark:text-zinc-100">{formatDate(selectedDate)}</span>
                        <span className="text-[10px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">{dayOfWeek}</span>
                    </div>
                    <Select value={selectedClassId} onValueChange={setSelectedClassId}>
                        <SelectTrigger className="h-10 w-44 rounded-xl text-[13px] font-bold border-zinc-200 dark:border-sidebar-border bg-zinc-50 dark:bg-background/20">
                            <SelectValue placeholder="All Classes" />
                        </SelectTrigger>
                        <SelectContent className="rounded-xl">
                            <SelectItem value="all" className="font-bold">All Classes</SelectItem>
                            {classList.map((c: any) => (
                                <SelectItem key={c.id} value={String(c.id)} className="font-medium">{c.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <Dialog open={showCancelAllDialog} onOpenChange={setShowCancelAllDialog}>
                <DialogContent className="max-w-sm rounded-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-[16px] font-black text-slate-900 dark:text-white flex items-center gap-2">
                            <Ban className="h-5 w-5 text-red-500" />
                            Cancel All Classes
                        </DialogTitle>
                        <DialogDescription className="text-[13px] text-slate-500">
                            This will cancel scheduled classes for <span className="font-bold text-slate-700 dark:text-slate-300">{formatDate(selectedDate)}</span>.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2 mt-2">
                        <Button variant="outline" size="sm" className="rounded-xl h-9 font-bold" onClick={() => setShowCancelAllDialog(false)}>No, keep</Button>
                        <Button size="sm" className="rounded-xl h-9 font-black bg-red-600 hover:bg-red-700 text-white px-5" onClick={handleCancelAll}>
                             Yes, Cancel All
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <div className="flex items-center justify-between gap-4 px-1">
                <div className="flex flex-wrap items-center gap-5">
                    <span className="flex items-center gap-2 text-[11px] font-extrabold text-zinc-500 uppercase tracking-widest"><span className="h-2.5 w-2.5 rounded-full bg-zinc-200 dark:bg-zinc-800 inline-block" /> Regular</span>
                    <span className="flex items-center gap-2 text-[11px] font-extrabold text-rose-500 uppercase tracking-widest"><span className="h-2.5 w-2.5 rounded-full bg-rose-500 inline-block animate-pulse" /> Cancelled</span>
                    <span className="flex items-center gap-2 text-[11px] font-extrabold text-blue-500 uppercase tracking-widest"><span className="h-2.5 w-2.5 rounded-full bg-blue-500 inline-block" /> Substituted</span>
                </div>
                <PermissionGate required={PERMISSIONS.ROUTINE_EDIT}>
                    {routines.some((r: any) => r.period?.type === "CLASS" && !adjustmentMap[r.id]) && (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowCancelAllDialog(true)}
                            disabled={isCancellingAll}
                            className="h-8 px-4 rounded-xl text-[12px] font-black text-red-600 border-red-200 hover:bg-red-50 dark:border-red-900/40 dark:text-red-400 dark:hover:bg-red-900/20 gap-1.5 transition-all"
                        >
                            <Ban className="h-3.5 w-3.5" />
                            {isCancellingAll ? "Cancelling..." : "Cancel All Classes"}
                        </Button>
                    )}
                </PermissionGate>
            </div>

            <div className="rounded-2xl border border-zinc-200 dark:border-sidebar-border overflow-hidden bg-white dark:bg-sidebar shadow-sm transition-colors">
                <Table>
                    <TableHeader className="bg-zinc-50 dark:bg-background/40">
                        <TableRow className="hover:bg-transparent border-zinc-200 dark:border-zinc-800">
                            <TableHead className="pl-6 h-12 text-[11px] font-extrabold text-zinc-500 uppercase tracking-widest w-[140px]">Period</TableHead>
                            <TableHead className="h-12 text-[11px] font-extrabold text-zinc-500 uppercase tracking-widest">Subject</TableHead>
                            <TableHead className="h-12 text-[11px] font-extrabold text-zinc-500 uppercase tracking-widest">Class & Section</TableHead>
                            <TableHead className="h-12 text-[11px] font-extrabold text-zinc-500 uppercase tracking-widest">Faculty</TableHead>
                            <TableHead className="h-12 text-[11px] font-extrabold text-zinc-500 uppercase tracking-widest w-[130px]">Status</TableHead>
                            <TableHead className="text-right pr-6 h-12 text-[11px] font-extrabold text-zinc-500 uppercase tracking-widest w-[140px]">Operations</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loadingRoutines ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-48 text-center text-[13px] font-bold text-slate-400 animate-pulse">Loading schedule...</TableCell>
                            </TableRow>
                        ) : routines.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={6} className="h-60 text-center">
                                    <div className="flex flex-col items-center gap-3">
                                        <CalendarClock className="h-10 w-10 text-slate-200" />
                                        <p className="text-[14px] font-black text-slate-400">No classes scheduled for {dayOfWeek}</p>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ) : routines.map((routine: any) => {
                            const adj = adjustmentMap[routine.id];
                            const isCancelled = adj?.action === "CANCELLED";
                            const isSubstituted = adj?.action === "SUBSTITUTED";

                            return (
                                <TableRow
                                    key={routine.id}
                                    className={cn(
                                        "border-slate-100 dark:border-white/5 transition-colors",
                                        isCancelled && "bg-amber-50/60 dark:bg-amber-900/10",
                                        isSubstituted && "bg-blue-50/60 dark:bg-blue-900/10",
                                    )}
                                >
                                    <TableCell className="pl-6 py-4">
                                        <div className="space-y-0.5">
                                            <p className="text-[13px] font-black text-slate-700 dark:text-slate-200">{routine.period?.name}</p>
                                            <p className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
                                                <Clock className="h-3 w-3" />
                                                {routine.period?.startTime}–{routine.period?.endTime}
                                            </p>
                                        </div>
                                    </TableCell>
                                    <TableCell className="py-4">
                                        {routine.subject ? (
                                            <p className={cn("text-[14px] font-black", isCancelled ? "line-through text-slate-400" : "text-slate-800 dark:text-white")}>
                                                {routine.subject.subjectName}
                                            </p>
                                        ) : (
                                            <span className="text-[12px] font-bold text-slate-400">Break</span>
                                        )}
                                    </TableCell>
                                    <TableCell className="py-4">
                                        <span className="text-[13px] font-bold text-slate-600 dark:text-slate-300">
                                            {routine.class?.name} · {routine.section?.name}
                                        </span>
                                    </TableCell>
                                    <TableCell className="py-4">
                                        <div className="space-y-0.5">
                                            {isSubstituted && adj?.teacher ? (
                                                <>
                                                    <p className="text-[12px] font-bold text-slate-400 line-through">
                                                        {routine.teacher?.firstName} {routine.teacher?.lastName}
                                                    </p>
                                                    <p className="text-[13px] font-black text-blue-700 dark:text-blue-400">
                                                        {adj.teacher.firstName} {adj.teacher.lastName}
                                                    </p>
                                                </>
                                            ) : (
                                                <p className={cn("text-[13px] font-bold", isCancelled ? "text-slate-400" : "text-slate-700 dark:text-slate-200")}>
                                                    {routine.teacher ? `${routine.teacher.firstName} ${routine.teacher.lastName}` : "—"}
                                                </p>
                                            )}
                                        </div>
                                    </TableCell>
                                    <TableCell className="py-4">
                                        {isCancelled ? (
                                            <span className="inline-flex items-center gap-1.5 text-[11px] font-black text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/30 px-2.5 py-1 rounded-lg uppercase tracking-wider">
                                                <Ban className="h-3 w-3" /> Cancelled
                                            </span>
                                        ) : isSubstituted ? (
                                            <span className="inline-flex items-center gap-1.5 text-[11px] font-black text-blue-700 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/30 px-2.5 py-1 rounded-lg uppercase tracking-wider">
                                                <UserCheck className="h-3 w-3" /> Substitute
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-slate-500 bg-slate-100 dark:bg-white/5 px-2.5 py-1 rounded-lg uppercase tracking-wider">
                                                Default
                                            </span>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-right pr-6 py-4">
                                        <PermissionGate required={PERMISSIONS.ROUTINE_EDIT}>
                                            {adj ? (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className="h-8 px-3 rounded-xl text-[12px] font-black text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:hover:bg-white/10 gap-1.5"
                                                    onClick={() => revertMutation.mutate(adj.id)}
                                                    disabled={revertMutation.isPending}
                                                >
                                                    <RotateCcw className="h-3.5 w-3.5" /> Revert
                                                </Button>
                                            ) : (
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button
                                                            variant="ghost"
                                                            size="sm"
                                                            className="h-8 px-3 rounded-xl text-[12px] font-black text-slate-500 hover:text-slate-900 hover:bg-slate-100 dark:hover:bg-white/10 gap-1.5"
                                                        >
                                                            Modify <ChevronDown className="h-3 w-3" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="w-44 rounded-xl border-slate-200 dark:border-white/10">
                                                        <DropdownMenuItem
                                                            className="text-[13px] font-bold gap-2.5 px-3 py-2.5 cursor-pointer text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20 rounded-lg mx-1"
                                                            onClick={() => handleCancel(routine.id)}
                                                        >
                                                            <Ban className="h-4 w-4" /> Cancel Class
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem
                                                            className="text-[13px] font-bold gap-2.5 px-3 py-2.5 cursor-pointer text-blue-700 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg mx-1"
                                                            onClick={() => setSubstituteTarget(routine)}
                                                        >
                                                            <UserCheck className="h-4 w-4" /> Assign Substitute
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            )}
                                        </PermissionGate>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </div>

            <SubstituteDialog
                open={!!substituteTarget}
                onClose={() => setSubstituteTarget(null)}
                routine={substituteTarget}
                date={selectedDate}
                onConfirm={handleSubstitute}
                isPending={adjustMutation.isPending}
            />
        </div>
    );
}
