/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
    Search, Clock, MapPin,
    BookOpen, FilterX,
    Phone, CalendarDays, Info, Plus,
    Edit, Trash2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AcademicService } from "@/services/academic.service";
import { RoutineService } from "@/services/routine.service";
import { PeriodService } from "@/services/period.service";
import { RoutineModal } from "../routine-modal";
import { DeleteRoutineModal } from "../delete-routine-modal";
import { PERMISSIONS } from "@/config/permissions";
import { PermissionGate } from "@/components/common/permission-gate";
import { usePermission } from "@/hooks/use-permission";

const DAYS = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"];

export default function WeeklyTemplatePage() {
    const [currentPage, setCurrentPage] = useState(1);
    const [limit] = useState(10);
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
        <div className="p-4 md:p-8 space-y-8 bg-transparent">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-xl bg-zinc-100 dark:bg-white/5 flex items-center justify-center border border-zinc-200 dark:border-white/10 shadow-sm">
                        <CalendarDays className="h-6 w-6 text-zinc-600 dark:text-zinc-400" />
                    </div>
                    <div>
                        <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-2">Weekly Template</h1>
                        <p className="text-[13px] font-medium text-zinc-500 mt-0.5">Manage the master weekly routine and time-slots.</p>
                    </div>
                </div>
            </div>

            <div className="flex justify-end mb-5">
                <PermissionGate required={PERMISSIONS.ROUTINE_CREATE}>
                    <Button onClick={() => { setSelectedRoutine(null); setIsModalOpen(true); }} className="h-11 px-6 rounded-xl bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 shadow-lg shadow-zinc-900/10 font-bold transition-all text-sm">
                        <Plus className="h-5 w-5 mr-2" />
                        Initialize Routine
                    </Button>
                </PermissionGate>
            </div>

            <Card className="rounded-2xl border border-zinc-200 dark:border-sidebar-border shadow-sm bg-white dark:bg-sidebar overflow-hidden transition-colors">
                <CardHeader className="p-6 border-b border-zinc-100 dark:border-sidebar-border space-y-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-3">
                        <div className="relative lg:col-span-2">
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <Input
                                placeholder="Search subject or teacher..."
                                className="pl-10 h-10 rounded-xl border-slate-200 dark:border-sidebar-border text-[13px] font-bold bg-transparent"
                                value={searchTerm}
                                onChange={(e) => handle(setSearchTerm, e.target.value)}
                            />
                        </div>
                        <Select value={selectedClassId} onValueChange={(v) => { handle(setSelectedClassId, v); setSelectedSectionId("all"); }}>
                            <SelectTrigger className="h-10 rounded-xl border-slate-200 dark:border-sidebar-border text-[13px] font-bold bg-zinc-50 dark:bg-background/20">
                                <SelectValue placeholder="Class" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl">
                                <SelectItem value="all" className="font-bold">All Classes</SelectItem>
                                {classList.map((c: any) => <SelectItem key={c.id} value={String(c.id)} className="font-medium">{c.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                        <Select value={selectedSectionId} onValueChange={(v) => handle(setSelectedSectionId, v)} disabled={selectedClassId === "all"}>
                            <SelectTrigger className="h-10 rounded-xl border-slate-200 dark:border-sidebar-border text-[13px] font-bold bg-zinc-50 dark:bg-background/20">
                                <SelectValue placeholder="Section" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl">
                                <SelectItem value="all" className="font-bold">All Sections</SelectItem>
                                {sectionList.map((s: any) => <SelectItem key={s.id} value={String(s.id)} className="font-medium">{s.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                        <Select value={selectedDay} onValueChange={(v) => handle(setSelectedDay, v)}>
                            <SelectTrigger className="h-10 rounded-xl border-slate-200 dark:border-sidebar-border text-[13px] font-bold bg-zinc-50 dark:bg-background/20">
                                <SelectValue placeholder="Day" />
                            </SelectTrigger>
                            <SelectContent className="rounded-xl">
                                <SelectItem value="all" className="font-bold">All Days</SelectItem>
                                {DAYS.map((d) => <SelectItem key={d} value={d} className="font-medium">{d.charAt(0) + d.slice(1).toLowerCase()}</SelectItem>)}
                            </SelectContent>
                        </Select>
                        <Select value={selectedPeriodId} onValueChange={(v) => handle(setSelectedPeriodId, v)}>
                            <SelectTrigger className="h-10 rounded-xl border-slate-200 dark:border-sidebar-border text-[13px] font-bold bg-zinc-50 dark:bg-background/20">
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
                    <div className="overflow-x-auto custom-scrollbar">
                        <Table>
                            <TableHeader className="bg-zinc-50 dark:bg-background/40">
                                <TableRow className="hover:bg-transparent border-zinc-200 dark:border-sidebar-border">
                                    <TableHead className="pl-6 h-12 text-[11px] font-extrabold text-zinc-500 uppercase tracking-widest w-[160px]">Schedule Details</TableHead>
                                    <TableHead className="h-12 text-[11px] font-extrabold text-zinc-500 uppercase tracking-widest">Subject Information</TableHead>
                                    <TableHead className="h-12 text-[11px] font-extrabold text-zinc-500 uppercase tracking-widest">Class Placement</TableHead>
                                    <TableHead className="h-12 text-[11px] font-extrabold text-zinc-500 uppercase tracking-widest">Teacher / Faculty</TableHead>
                                    <TableHead className="h-12 text-[11px] font-extrabold text-zinc-500 uppercase tracking-widest">Venue</TableHead>
                                    {canEditOrDelete && <TableHead className="text-right pr-6 h-12 text-[11px] font-extrabold text-zinc-500 uppercase tracking-widest">Operations</TableHead>}
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
                </CardContent>
            </Card>
            <RoutineModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} initialData={selectedRoutine} />
            <DeleteRoutineModal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} routineId={selectedRoutine?.id || null} />
        </div>
    );
}
