/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    Edit, Trash2, Search, Clock, MapPin,
    BookOpen, FilterX, ChevronLeft, ChevronRight,
    Phone, CalendarDays, Info, Plus,
    CalendarClock, UserCheck, Ban,
    RotateCcw, ChevronDown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AcademicService } from "@/services/academic.service";
import { RoutineService } from "@/services/routine.service";
import { PeriodService } from "@/services/period.service";
import { TeacherService } from "@/services/teacher.service";
import { RoutineModal } from "./routine-modal";
import { DeleteRoutineModal } from "./delete-routine-modal";
import { toast } from "sonner";
import { PERMISSIONS } from "@/config/permissions";
import { PermissionGate } from "@/components/common/permission-gate";
import { usePermission } from "@/hooks/use-permission";
import { cn } from "@/lib/utils";

const DAYS = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"];

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
                        className="rounded-xl h-9 font-black bg-slate-900 dark:bg-white dark:text-black text-white px-6"
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

// ─── Daily View ─────────────────────────────────────────────────────────────
function DailyView() {
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

    // Build a map of routineId → adjustment
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

    // Bulk-cancel all non-cancelled classes for this date
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
        <div className="space-y-5">
            {/* Date Navigator */}
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-white/10 rounded-2xl p-4">
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" className="h-9 w-9 rounded-xl border-slate-200 dark:border-white/10" onClick={() => goDay(-1)}>
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <input
                        type="date"
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="h-9 rounded-xl border border-slate-200 dark:border-white/10 bg-transparent text-[13px] font-black text-slate-900 dark:text-white px-3 focus:outline-none focus:ring-2 focus:ring-slate-300 dark:focus:ring-white/20 transition-all"
                    />
                    <Button variant="outline" size="icon" className="h-9 w-9 rounded-xl border-slate-200 dark:border-white/10" onClick={() => goDay(1)}>
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-9 rounded-xl text-[12px] font-black text-slate-500 hover:text-slate-900 px-3" onClick={() => setSelectedDate(getTodayISO())}>
                        Today
                    </Button>
                </div>
                <div className="flex items-center gap-3 sm:ml-auto">
                    <span className="text-[13px] font-black text-slate-700 dark:text-slate-200">{formatDate(selectedDate)}</span>
                    <Select value={selectedClassId} onValueChange={setSelectedClassId}>
                        <SelectTrigger className="h-9 w-40 rounded-xl text-[13px] font-bold border-slate-200 dark:border-white/10">
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

            {/* Bulk Cancel Confirm Dialog */}
            <Dialog open={showCancelAllDialog} onOpenChange={setShowCancelAllDialog}>
                <DialogContent className="max-w-sm rounded-2xl">
                    <DialogHeader>
                        <DialogTitle className="text-[16px] font-black text-slate-900 dark:text-white flex items-center gap-2">
                            <Ban className="h-5 w-5 text-red-500" />
                            Cancel All Classes
                        </DialogTitle>
                        <DialogDescription className="text-[13px] text-slate-500">
                            This will cancel{" "}
                            <span className="font-black text-slate-800 dark:text-white">
                                {routines.filter((r: any) => r.period?.type === "CLASS" && !adjustmentMap[r.id]).length} class(es)
                            </span>{" "}
                            scheduled for{" "}
                            <span className="font-bold text-slate-700 dark:text-slate-300">{formatDate(selectedDate)}</span>.
                            This action can be reverted individually.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2 mt-2">
                        <Button variant="outline" size="sm" className="rounded-xl h-9 font-bold" onClick={() => setShowCancelAllDialog(false)}>No, keep</Button>
                        <Button
                            size="sm"
                            className="rounded-xl h-9 font-black bg-red-600 hover:bg-red-700 text-white px-5 gap-1.5"
                            onClick={handleCancelAll}
                        >
                            <Ban className="h-3.5 w-3.5" /> Yes, Cancel All
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Legend + Cancel All row */}
            <div className="flex items-center justify-between gap-4 px-1">
                <div className="flex items-center gap-5">
                    <span className="flex items-center gap-1.5 text-[12px] font-bold text-slate-500"><span className="h-2 w-2 rounded-full bg-slate-300 inline-block" /> Default</span>
                    <span className="flex items-center gap-1.5 text-[12px] font-bold text-slate-500"><span className="h-2 w-2 rounded-full bg-amber-400 inline-block" /> Cancelled</span>
                    <span className="flex items-center gap-1.5 text-[12px] font-bold text-slate-500"><span className="h-2 w-2 rounded-full bg-sky-400 inline-block" /> Substituted</span>
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

            {/* Daily Table */}
            <div className="rounded-2xl border border-slate-200 dark:border-white/10 overflow-hidden bg-white dark:bg-slate-900/30">
                <Table>
                    <TableHeader className="bg-slate-50 dark:bg-white/5">
                        <TableRow className="hover:bg-transparent border-slate-200 dark:border-white/10">
                            <TableHead className="pl-6 h-11 text-[11px] font-black text-slate-400 uppercase tracking-widest w-[130px]">Period</TableHead>
                            <TableHead className="h-11 text-[11px] font-black text-slate-400 uppercase tracking-widest">Subject</TableHead>
                            <TableHead className="h-11 text-[11px] font-black text-slate-400 uppercase tracking-widest">Class</TableHead>
                            <TableHead className="h-11 text-[11px] font-black text-slate-400 uppercase tracking-widest">Teacher</TableHead>
                            <TableHead className="h-11 text-[11px] font-black text-slate-400 uppercase tracking-widest w-[110px]">Status</TableHead>
                            <TableHead className="text-right pr-6 h-11 text-[11px] font-black text-slate-400 uppercase tracking-widest w-[120px]">Actions</TableHead>
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
                                        <p className="text-[14px] font-black text-slate-400">No classes scheduled for {dayOfWeek.charAt(0) + dayOfWeek.slice(1).toLowerCase()}</p>
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
                                        isSubstituted && "bg-sky-50/60 dark:bg-sky-900/10",
                                    )}
                                >
                                    {/* Period */}
                                    <TableCell className="pl-6 py-4">
                                        <div className="space-y-0.5">
                                            <p className="text-[13px] font-black text-slate-700 dark:text-slate-200">{routine.period?.name}</p>
                                            <p className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
                                                <Clock className="h-3 w-3" />
                                                {routine.period?.startTime}–{routine.period?.endTime}
                                            </p>
                                        </div>
                                    </TableCell>
                                    {/* Subject */}
                                    <TableCell className="py-4">
                                        {routine.subject ? (
                                            <p className={cn("text-[14px] font-black", isCancelled ? "line-through text-slate-400" : "text-slate-800 dark:text-white")}>
                                                {routine.subject.subjectName}
                                            </p>
                                        ) : (
                                            <span className="text-[12px] font-bold text-slate-400">Break</span>
                                        )}
                                    </TableCell>
                                    {/* Class/Section */}
                                    <TableCell className="py-4">
                                        <span className="text-[13px] font-bold text-slate-600 dark:text-slate-300">
                                            {routine.class?.name} · {routine.section?.name}
                                        </span>
                                    </TableCell>
                                    {/* Teacher */}
                                    <TableCell className="py-4">
                                        <div className="space-y-0.5">
                                            {isSubstituted && adj?.teacher ? (
                                                <>
                                                    <p className="text-[12px] font-bold text-slate-400 line-through">
                                                        {routine.teacher?.firstName} {routine.teacher?.lastName}
                                                    </p>
                                                    <p className="text-[13px] font-black text-sky-700 dark:text-sky-400">
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
                                    {/* Status */}
                                    <TableCell className="py-4">
                                        {isCancelled ? (
                                            <span className="inline-flex items-center gap-1.5 text-[11px] font-black text-amber-700 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/30 px-2.5 py-1 rounded-lg uppercase tracking-wider">
                                                <Ban className="h-3 w-3" /> Cancelled
                                            </span>
                                        ) : isSubstituted ? (
                                            <span className="inline-flex items-center gap-1.5 text-[11px] font-black text-sky-700 dark:text-sky-400 bg-sky-100 dark:bg-sky-900/30 px-2.5 py-1 rounded-lg uppercase tracking-wider">
                                                <UserCheck className="h-3 w-3" /> Substitute
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-slate-500 bg-slate-100 dark:bg-white/5 px-2.5 py-1 rounded-lg uppercase tracking-wider">
                                                Default
                                            </span>
                                        )}
                                    </TableCell>
                                    {/* Actions */}
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
                                                            className="text-[13px] font-bold gap-2.5 px-3 py-2.5 cursor-pointer text-sky-700 dark:text-sky-400 hover:bg-sky-50 dark:hover:bg-sky-900/20 rounded-lg mx-1"
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

// ─── Weekly Template View ────────────────────────────────────────────────────
function WeeklyTemplateView() {
    const [currentPage, setCurrentPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedClassId, setSelectedClassId] = useState("all");
    const [selectedSectionId, setSelectedSectionId] = useState("all");
    const [selectedDay, setSelectedDay] = useState("all");
    const [selectedPeriodId, setSelectedPeriodId] = useState("all");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedRoutine, setSelectedRoutine] = useState<any>(null);
    const { hasPermission } = usePermission();
    const canEditOrDelete = hasPermission([PERMISSIONS.ROUTINE_EDIT, PERMISSIONS.ROUTINE_DELETE]);

    const { data: classes } = useQuery({ queryKey: ["classes"], queryFn: () => AcademicService.getAllClasses() });
    const { data: sections } = useQuery({
        queryKey: ["sections", selectedClassId],
        queryFn: () => AcademicService.getAllSections({ classId: selectedClassId }),
        enabled: selectedClassId !== "all"
    });
    const { data: periods } = useQuery({ queryKey: ["periods-filter"], queryFn: () => PeriodService.getAllPeriods() });

    const { data: serverResponse, isLoading } = useQuery({
        queryKey: ["routines", currentPage, limit, selectedClassId, selectedSectionId, selectedDay, selectedPeriodId, searchTerm],
        queryFn: () => RoutineService.getAllRoutines({
            page: currentPage, limit,
            classId: selectedClassId === "all" ? undefined : selectedClassId,
            sectionId: selectedSectionId === "all" ? undefined : selectedSectionId,
            day: selectedDay === "all" ? undefined : selectedDay,
            periodId: selectedPeriodId === "all" ? undefined : selectedPeriodId,
            searchTerm: searchTerm || undefined,
        }),
    });

    const classList = classes?.data?.data || classes?.data || [];
    const sectionList = sections?.data?.data || sections?.data || [];
    const periodList = periods?.data || [];
    const routines = serverResponse?.data || [];
    const meta = serverResponse?.meta;

    const handle = (setter: any, val: any) => { setter(val); setCurrentPage(1); };
    const clearFilters = () => {
        setSearchTerm(""); setSelectedClassId("all"); setSelectedSectionId("all");
        setSelectedDay("all"); setSelectedPeriodId("all"); setCurrentPage(1);
    };

    return (
        <>
            <div className="flex justify-end mb-4">
                <PermissionGate required={PERMISSIONS.ROUTINE_CREATE}>
                    <Button onClick={() => { setSelectedRoutine(null); setIsModalOpen(true); }} className="h-10 px-5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm shadow-indigo-600/20 font-bold transition-all text-sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Routine
                    </Button>
                </PermissionGate>
            </div>
            <Card className="rounded-2xl border border-slate-200 dark:border-white/10 shadow-none bg-white dark:bg-slate-900/30 overflow-hidden">
                <CardHeader className="p-5 border-b border-slate-100 dark:border-white/5 space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-3">
                        <div className="relative lg:col-span-2">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <Input
                                placeholder="Search subject or teacher..."
                                className="pl-10 h-10 rounded-xl border-slate-200 dark:border-white/10 text-[13px] font-bold bg-transparent"
                                value={searchTerm}
                                onChange={(e) => handle(setSearchTerm, e.target.value)}
                            />
                        </div>
                        <Select value={selectedClassId} onValueChange={(v) => { handle(setSelectedClassId, v); setSelectedSectionId("all"); }}>
                            <SelectTrigger className="h-10 rounded-xl border-slate-200 dark:border-white/10 text-[13px] font-bold">
                                <SelectValue placeholder="Class" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl">
                                <SelectItem value="all" className="font-bold">All Classes</SelectItem>
                                {classList.map((c: any) => <SelectItem key={c.id} value={String(c.id)} className="font-medium">{c.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                        <Select value={selectedSectionId} onValueChange={(v) => handle(setSelectedSectionId, v)} disabled={selectedClassId === "all"}>
                            <SelectTrigger className="h-10 rounded-xl border-slate-200 dark:border-white/10 text-[13px] font-bold">
                                <SelectValue placeholder="Section" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl">
                                <SelectItem value="all" className="font-bold">All Sections</SelectItem>
                                {sectionList.map((s: any) => <SelectItem key={s.id} value={String(s.id)} className="font-medium">{s.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                        <Select value={selectedDay} onValueChange={(v) => handle(setSelectedDay, v)}>
                            <SelectTrigger className="h-10 rounded-xl border-slate-200 dark:border-white/10 text-[13px] font-bold">
                                <SelectValue placeholder="Day" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl">
                                <SelectItem value="all" className="font-bold">All Days</SelectItem>
                                {DAYS.map((d) => <SelectItem key={d} value={d} className="font-medium">{d.charAt(0) + d.slice(1).toLowerCase()}</SelectItem>)}
                            </SelectContent>
                        </Select>
                        <Select value={selectedPeriodId} onValueChange={(v) => handle(setSelectedPeriodId, v)}>
                            <SelectTrigger className="h-10 rounded-xl border-slate-200 dark:border-white/10 text-[13px] font-bold">
                                <SelectValue placeholder="Period" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl max-h-[260px]">
                                <SelectItem value="all" className="font-bold">All Periods</SelectItem>
                                {periodList.map((p: any) => <SelectItem key={p.id} value={p.id} className="font-medium">{p.name} ({p.startTime})</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="flex justify-between items-center">
                        <span className="text-[12px] font-bold text-slate-400">
                            {meta?.total || 0} entries found
                        </span>
                        {(searchTerm || selectedClassId !== "all" || selectedDay !== "all" || selectedPeriodId !== "all") && (
                            <Button variant="ghost" size="sm" onClick={clearFilters} className="text-[12px] font-black text-slate-500 hover:text-slate-900 rounded-xl h-8 px-3 gap-1.5">
                                <FilterX className="h-3.5 w-3.5" /> Clear filters
                            </Button>
                        )}
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader className="bg-slate-50 dark:bg-white/5">
                                <TableRow className="hover:bg-transparent border-slate-200 dark:border-white/10">
                                    <TableHead className="pl-6 h-11 text-[11px] font-black text-slate-400 uppercase tracking-widest">Period & Day</TableHead>
                                    <TableHead className="h-11 text-[11px] font-black text-slate-400 uppercase tracking-widest">Subject</TableHead>
                                    <TableHead className="h-11 text-[11px] font-black text-slate-400 uppercase tracking-widest">Class / Section</TableHead>
                                    <TableHead className="h-11 text-[11px] font-black text-slate-400 uppercase tracking-widest">Teacher</TableHead>
                                    <TableHead className="h-11 text-[11px] font-black text-slate-400 uppercase tracking-widest">Room</TableHead>
                                    {canEditOrDelete && <TableHead className="text-right pr-6 h-11 text-[11px] font-black text-slate-400 uppercase tracking-widest">Actions</TableHead>}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    <TableRow><TableCell colSpan={canEditOrDelete ? 6 : 5} className="h-48 text-center text-[13px] font-bold text-slate-400 animate-pulse">Loading...</TableCell></TableRow>
                                ) : routines.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={canEditOrDelete ? 6 : 5} className="h-64 text-center">
                                            <div className="flex flex-col items-center gap-3">
                                                <BookOpen className="h-10 w-10 text-slate-200" />
                                                <p className="text-[14px] font-black text-slate-400">No schedule entries found</p>
                                                <p className="text-[12px] text-slate-400">Adjust your filters or add a new entry</p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : routines.map((routine: any) => (
                                    <TableRow key={routine.id} className="border-slate-100 dark:border-white/5 hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors">
                                        <TableCell className="pl-6 py-4">
                                            <div className="space-y-0.5">
                                                <div className="flex items-center gap-2">
                                                    <span className="text-[12px] font-black text-slate-500 bg-slate-100 dark:bg-white/5 px-2 py-0.5 rounded-md uppercase tracking-wide">{routine.day.slice(0, 3)}</span>
                                                    <span className="text-[13px] font-black text-slate-700 dark:text-slate-200">{routine.period?.name}</span>
                                                </div>
                                                <p className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
                                                    <Clock className="h-3 w-3" />{routine.period?.startTime}–{routine.period?.endTime}
                                                </p>
                                            </div>
                                        </TableCell>
                                        <TableCell className="py-4">
                                            {routine.subject ? (
                                                <div>
                                                    <p className="text-[14px] font-black text-slate-800 dark:text-white">{routine.subject.subjectName}</p>
                                                    <p className="text-[11px] font-bold text-slate-400">{routine.subject.subjectCode}</p>
                                                </div>
                                            ) : (
                                                <span className="text-[12px] font-bold text-slate-400 flex items-center gap-1.5"><Info className="h-3.5 w-3.5" /> Break</span>
                                            )}
                                        </TableCell>
                                        <TableCell className="py-4">
                                            <span className="text-[13px] font-bold text-slate-600 dark:text-slate-300">
                                                {routine.class?.name} <span className="text-slate-300 dark:text-slate-600">·</span> {routine.section?.name}
                                            </span>
                                        </TableCell>
                                        <TableCell className="py-4">
                                            {routine.teacher ? (
                                                <div>
                                                    <p className="text-[13px] font-black text-slate-700 dark:text-slate-200">{routine.teacher.firstName} {routine.teacher.lastName}</p>
                                                    {routine.teacher.phone && <p className="text-[11px] font-bold text-slate-400 flex items-center gap-1"><Phone className="h-3 w-3" />{routine.teacher.phone}</p>}
                                                </div>
                                            ) : <span className="text-[12px] font-bold text-slate-400">Unassigned</span>}
                                        </TableCell>
                                        <TableCell className="py-4">
                                            <span className="text-[13px] font-bold text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                                                <MapPin className="h-3.5 w-3.5 text-slate-400" />{routine.roomNo || "—"}
                                            </span>
                                        </TableCell>
                                        {canEditOrDelete && (
                                            <TableCell className="text-right pr-6 py-4">
                                                <div className="flex justify-end gap-1.5">
                                                    <PermissionGate required={PERMISSIONS.ROUTINE_EDIT}>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl hover:bg-slate-100 dark:hover:bg-white/10 text-slate-400 hover:text-slate-700" onClick={() => { setSelectedRoutine(routine); setIsModalOpen(true); }}>
                                                            <Edit className="h-4 w-4" />
                                                        </Button>
                                                    </PermissionGate>
                                                    <PermissionGate required={PERMISSIONS.ROUTINE_DELETE}>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 text-slate-400 hover:text-red-600" onClick={() => { setSelectedRoutine(routine); setIsDeleteModalOpen(true); }}>
                                                            <Trash2 className="h-4 w-4" />
                                                        </Button>
                                                    </PermissionGate>
                                                </div>
                                            </TableCell>
                                        )}
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                    {/* Pagination */}
                    <div className="flex items-center justify-between px-6 py-4 border-t border-slate-100 dark:border-white/5">
                        <span className="text-[12px] font-bold text-slate-400">
                            Showing {routines.length} of {meta?.total || 0}
                        </span>
                        <div className="flex items-center gap-3">
                            <Select value={`${limit}`} onValueChange={(v) => { setLimit(Number(v)); setCurrentPage(1); }}>
                                <SelectTrigger className="h-8 w-[70px] rounded-xl text-[12px] font-black border-slate-200 dark:border-white/10">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent className="rounded-xl font-bold">
                                    {[10, 20, 50].map(v => <SelectItem key={v} value={`${v}`}>{v}</SelectItem>)}
                                </SelectContent>
                            </Select>
                            <div className="flex items-center gap-1.5">
                                <Button variant="outline" size="icon" className="h-8 w-8 rounded-xl border-slate-200 dark:border-white/10" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}>
                                    <ChevronLeft className="h-3.5 w-3.5" />
                                </Button>
                                <span className="text-[12px] font-black text-slate-600 dark:text-white min-w-[60px] text-center">
                                    {currentPage} / {meta?.totalPage || 1}
                                </span>
                                <Button variant="outline" size="icon" className="h-8 w-8 rounded-xl border-slate-200 dark:border-white/10" onClick={() => setCurrentPage(p => Math.min(meta?.totalPage || 1, p + 1))} disabled={currentPage >= (meta?.totalPage || 1)}>
                                    <ChevronRight className="h-3.5 w-3.5" />
                                </Button>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
            <RoutineModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} initialData={selectedRoutine} />
            <DeleteRoutineModal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} routineId={selectedRoutine?.id || null} />
        </>
    );
}

// ─── Main Page ───────────────────────────────────────────────────────────────
export default function RoutinePage() {
    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-3.5">
                    <div className="p-2.5 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10">
                        <CalendarDays className="h-6 w-6 text-slate-700 dark:text-slate-300" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">Class Routine</h1>
                        <p className="text-[13px] font-medium text-slate-400 mt-0.5">Manage weekly schedule and day-specific overrides</p>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="template">
                <div className="flex items-center justify-between mb-5">
                    <TabsList className="h-10 p-1 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 gap-0.5">
                        <TabsTrigger
                            value="template"
                            className="h-8 px-4 rounded-lg text-[13px] font-black data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:text-slate-900 dark:data-[state=active]:text-white text-slate-500 transition-all"
                        >
                            <BookOpen className="h-3.5 w-3.5 mr-1.5" />
                            Weekly Template
                        </TabsTrigger>
                        <TabsTrigger
                            value="daily"
                            className="h-8 px-4 rounded-lg text-[13px] font-black data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:text-slate-900 dark:data-[state=active]:text-white text-slate-500 transition-all"
                        >
                            <CalendarClock className="h-3.5 w-3.5 mr-1.5" />
                            Daily Override
                        </TabsTrigger>
                    </TabsList>
                    <PermissionGate required={PERMISSIONS.ROUTINE_CREATE}>
                        <Tabs asChild>
                            <TabsContent value="template" asChild>
                                {/* Add Schedule shown in Weekly Template tab via a portal trick */}
                                <span />
                            </TabsContent>
                        </Tabs>
                    </PermissionGate>
                </div>

                <TabsContent value="template" className="mt-0">
                    <WeeklyTemplateView />
                </TabsContent>
                <TabsContent value="daily" className="mt-0">
                    <DailyView />
                </TabsContent>
            </Tabs>
        </div>
    );
}