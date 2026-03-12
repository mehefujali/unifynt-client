/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { examService } from "@/services/exam.service";
import { useAuth } from "@/hooks/use-auth";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
    Loader2,
    Lock,
    Unlock,
    AlertCircle,
    CloudCheck,
    CloudUpload,
    ChevronLeft,
    ChevronRight,
    ShieldAlert,
    ShieldCheck,
    Key
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useDebounce } from "@/hooks/use-debounce";

interface Props {
    scheduleId: string;
}

export default function MarksGrid({ scheduleId }: Props) {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const [marksData, setMarksData] = useState<any[]>([]);
    const [isLockModalOpen, setIsLockModalOpen] = useState(false);
    const [isUnlockModalOpen, setIsUnlockModalOpen] = useState(false);

    // Track components that the teacher wants to skip (e.g. Viva or Practical)
    const [disabledComponents, setDisabledComponents] = useState<string[]>([]);

    // ✅ Local UI override state for Admin
    const [adminOverride, setAdminOverride] = useState(false);

    const isFirstRender = useRef(true);
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 10;

    const debouncedMarks = useDebounce(marksData, 1500);
    const isAdmin = user?.role === "SCHOOL_ADMIN" || user?.role === "SUPER_ADMIN";

    const { data, isLoading, isError, isFetching } = useQuery({
        queryKey: ["marksGrid", scheduleId],
        queryFn: () => examService.getMarksGrid(scheduleId),
        retry: false,
        staleTime: 5000,
    });

    // 🟢 Generate components array dynamically from API data, or fallback to default
    const components = useMemo(() => {
        return data?.scheduleInfo?.components || [
            { id: "theoryMarks", name: "Theory" },
            { id: "practicalMarks", name: "Practical" },
            { id: "vivaMarks", name: "Viva" }
        ];
    }, [data]);

    useEffect(() => {
        if (data?.gridData && !isFetching) {
            setMarksData(data.gridData);
            isFirstRender.current = true;
        }
    }, [data, isFetching]);

    const saveMutation = useMutation({
        mutationFn: (payload: any) => examService.saveMarks(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["marksGrid"] });
        },
        onError: (error: any) => {
            toast.error(error?.response?.data?.message || "Auto-save failed");
        },
    });

    const lockMutation = useMutation({
        mutationFn: (payload: any) => examService.lockMarks(payload),
        onSuccess: () => {
            toast.success("Marks locked successfully");
            setIsLockModalOpen(false);
            queryClient.invalidateQueries({ queryKey: ["marksGrid"] });
        },
    });

    const unlockMutation = useMutation({
        mutationFn: (payload: any) => examService.unlockMarks(payload),
        onSuccess: () => {
            toast.success("Marks unlocked successfully");
            setIsUnlockModalOpen(false);
            setAdminOverride(false);
            queryClient.invalidateQueries({ queryKey: ["marksGrid"] });
        },
    });

    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }

        if (debouncedMarks.length > 0) {
            const isCurrentlyLocked = debouncedMarks.some(m => m.isLocked);
            // If locked and admin override is NOT active, don't auto-save
            if (isCurrentlyLocked && (!isAdmin || !adminOverride)) return;

            const payload = {
                scheduleId,
                marks: debouncedMarks.map((m: any) => {
                    const { studentId, isAbsent, remarks, graceMarks } = m;

                    const componentData = components.reduce((acc: any, comp: any) => {
                        // If a component is disabled by the teacher, explicitly set to 0 or null
                        acc[comp.id] = disabledComponents.includes(comp.id) ? null : m[comp.id];
                        return acc;
                    }, {});

                    return {
                        studentId,
                        isAbsent,
                        remarks,
                        graceMarks,
                        ...componentData
                    };
                }),
            };
            saveMutation.mutate(payload);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [debouncedMarks, scheduleId, isAdmin, adminOverride, components, disabledComponents]);

    const handleMarkChange = (studentId: string, field: string, value: string) => {
        const numValue = value === "" ? null : Number(value);
        setMarksData((prev) =>
            prev.map((row) => {
                if (row.studentId === studentId) {
                    const updatedRow = { ...row, [field]: numValue };
                    const componentsTotal = components.reduce((acc: number, comp: any) => {
                        if (disabledComponents.includes(comp.id)) return acc;
                        return acc + (updatedRow[comp.id] || 0);
                    }, 0);
                    const grace = updatedRow.graceMarks || 0;
                    updatedRow.totalMarks = updatedRow.isAbsent ? 0 : componentsTotal + grace;
                    return updatedRow;
                }
                return row;
            })
        );
    };

    const toggleAbsent = (studentId: string) => {
        setMarksData((prev) =>
            prev.map((row) => {
                if (row.studentId === studentId) {
                    const isAbsent = !row.isAbsent;
                    const componentsTotal = components.reduce((acc: number, comp: any) => {
                        if (disabledComponents.includes(comp.id)) return acc;
                        return acc + (row[comp.id] || 0);
                    }, 0);
                    return {
                        ...row,
                        isAbsent,
                        totalMarks: isAbsent ? 0 : componentsTotal + (row.graceMarks || 0),
                    };
                }
                return row;
            })
        );
    };

    const paginatedData = useMemo(() => {
        const startIndex = (currentPage - 1) * pageSize;
        return marksData.slice(startIndex, startIndex + pageSize);
    }, [marksData, currentPage, pageSize]);

    const totalPages = Math.ceil(marksData.length / pageSize);
    const isAllLocked = marksData.some((m) => m.isLocked);

    const isFieldDisabled = (row: any, isAttendanceBtn = false) => {
        if (isAllLocked) {
            // Only allow if Admin AND Override is active
            if (isAdmin && adminOverride) return false;
            return true;
        }
        if (!isAttendanceBtn && row.isAbsent) return true;
        return false;
    };

    if (isLoading) {
        return (
            <div className="flex h-64 items-center justify-center bg-white dark:bg-sidebar border border-zinc-200 dark:border-sidebar-border rounded-2xl transition-colors">
                <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
            </div>
        );
    }

    if (isError || marksData.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-24 text-center bg-white dark:bg-sidebar border border-zinc-200 dark:border-sidebar-border rounded-2xl transition-colors">
                <div className="h-16 w-16 rounded-2xl bg-zinc-100 dark:bg-background/40 flex items-center justify-center mb-4 border border-zinc-200 dark:border-white/5 transition-colors">
                    <AlertCircle className="h-8 w-8 text-zinc-400" />
                </div>
                <h3 className="text-lg font-black text-zinc-900 dark:text-zinc-100 uppercase tracking-tight">No Students Identified</h3>
                <p className="text-[13px] font-medium text-zinc-500 mt-1 max-w-sm mx-auto leading-relaxed">
                    There are no students currently enrolled or registered for the selected class and section.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* ✅ Professional Override Warning for Admin */}
            {isAllLocked && isAdmin && (
                <div className={cn(
                    "rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 border shadow-sm transition-all duration-500",
                    adminOverride
                        ? "bg-emerald-50/40 border-emerald-200 dark:bg-emerald-900/10 dark:border-emerald-900/40"
                        : "bg-amber-50/40 border-amber-200 dark:bg-amber-900/10 dark:border-amber-900/40"
                )}>
                    <div className="flex items-center gap-4">
                        <div className={cn(
                            "h-12 w-12 rounded-xl flex items-center justify-center border shadow-sm transition-all", 
                            adminOverride 
                                ? "bg-emerald-100 text-emerald-600 border-emerald-200 dark:bg-emerald-900/30 dark:border-emerald-900/50" 
                                : "bg-amber-100 text-amber-600 border-amber-200 dark:bg-amber-900/30 dark:border-amber-900/50"
                        )}>
                            {adminOverride ? <ShieldCheck className="h-6 w-6" /> : <ShieldAlert className="h-6 w-6" />}
                        </div>
                        <div>
                            <p className={cn("text-[14px] font-black uppercase tracking-tight", adminOverride ? "text-emerald-800 dark:text-emerald-400" : "text-amber-800 dark:text-amber-400")}>
                                {adminOverride ? "Administrator Override Enabled" : "Data Protected & Integrity Locked"}
                            </p>
                            <p className="text-[12px] font-medium text-zinc-500 dark:text-zinc-400 mt-0.5 max-w-xl leading-snug">
                                {adminOverride ? "Session is currently authenticated for administrative writes. Database entries will be updated directly." : "This dataset has been finalized. Enable the administrative override to modify grades or attendance."}
                            </p>
                        </div>
                    </div>
                    <Button
                        onClick={() => setAdminOverride(!adminOverride)}
                        className={cn(
                            "rounded-xl h-11 px-6 font-black text-[11px] uppercase tracking-widest transition-all shadow-lg", 
                            adminOverride 
                                ? "bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-500/20" 
                                : "bg-amber-600 text-white hover:bg-amber-700 shadow-amber-500/20"
                        )}
                    >
                        {adminOverride ? <><Lock className="h-4 w-4 mr-2" /> Disable Override</> : <><Key className="h-4 w-4 mr-2" /> Enable Override</>}
                    </Button>
                </div>
            )}

            <div className="bg-white dark:bg-sidebar border border-zinc-200 dark:border-sidebar-border rounded-2xl shadow-sm overflow-hidden transition-all duration-300">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between p-6 bg-zinc-50/30 dark:bg-background/40 border-b border-zinc-100 dark:border-sidebar-border gap-6">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-white dark:bg-sidebar border border-zinc-200 dark:border-sidebar-border flex items-center justify-center shadow-sm transition-colors">
                            <span className="text-xl font-black text-zinc-900 dark:text-zinc-100 uppercase">{data.scheduleInfo.subjectName.charAt(0)}</span>
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-zinc-900 dark:text-zinc-100 uppercase tracking-tight flex items-center gap-2">
                                {data.scheduleInfo.subjectName} Registry
                                {isAllLocked && <Lock className="h-4 w-4 text-rose-500 drop-shadow-sm" />}
                            </h3>
                            <div className="flex items-center gap-3 mt-1">
                                <span className="text-[11px] font-black text-emerald-600 dark:text-emerald-500 uppercase tracking-widest bg-emerald-50 dark:bg-emerald-400/10 px-2 py-0.5 rounded-md">Full: {data.scheduleInfo.fullMarks}</span>
                                <span className="text-[11px] font-black text-zinc-500 uppercase tracking-widest">Pass: {data.scheduleInfo.passMarks}</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className={cn(
                            "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border shadow-sm flex items-center gap-2 transition-all", 
                            (saveMutation.isPending || isFetching) 
                                ? "bg-amber-50 text-amber-600 border-amber-100 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-900/50 animate-pulse" 
                                : "bg-emerald-50 text-emerald-600 border-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-900/50"
                        )}>
                            {(saveMutation.isPending || isFetching) ? <><CloudUpload className="h-3.5 w-3.5" /> Synchronizing</> : <><CloudCheck className="h-3.5 w-3.5" /> All Saved</>}
                        </div>

                        {isAdmin && (
                            <Button
                                onClick={() => isAllLocked ? setIsUnlockModalOpen(true) : setIsLockModalOpen(true)}
                                variant="ghost"
                                className={cn(
                                    "rounded-xl h-10 px-5 border font-black text-[11px] uppercase tracking-widest transition-all shadow-sm", 
                                    isAllLocked 
                                        ? "text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50 border-emerald-200 dark:border-emerald-900/50 dark:hover:bg-emerald-900/20" 
                                        : "text-rose-600 hover:text-rose-700 hover:bg-rose-50 border-rose-200 dark:border-rose-900/50 dark:hover:bg-rose-900/20"
                                )}
                            >
                                {isAllLocked ? <><Unlock className="h-3.5 w-3.5 mr-2" /> Unlock Registry</> : <><Lock className="h-3.5 w-3.5 mr-2" /> Finalize Marks</>}
                            </Button>
                        )}
                    </div>
                </div>

                <div className="overflow-x-auto custom-scrollbar">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-zinc-50/80 dark:bg-background/60 hover:bg-zinc-50 dark:hover:bg-background/60 border-b border-zinc-200 dark:border-sidebar-border uppercase">
                            <tr>
                                <th className="px-8 py-5 text-[11px] font-extrabold uppercase tracking-widest text-zinc-500 border-r border-zinc-100 dark:border-sidebar-border/30">Candidate Information</th>
                                <th className="px-8 py-5 text-[11px] font-extrabold uppercase tracking-widest text-zinc-500 text-center w-32 border-r border-zinc-100 dark:border-sidebar-border/30">Attendance</th>
                                {components.map((comp: any) => (
                                    <th key={comp.id} className="px-8 py-5 text-[11px] font-extrabold uppercase tracking-widest text-zinc-500 text-center w-40 border-r border-zinc-100 dark:border-sidebar-border/30">
                                        <div className="flex flex-col items-center gap-2">
                                            <span>{comp.name}</span>
                                            <div className="flex items-center gap-2 bg-white dark:bg-sidebar border border-zinc-200 dark:border-sidebar-border px-2 py-1.5 rounded-lg shadow-sm">
                                                <input
                                                    type="checkbox"
                                                    id={`toggle-${comp.id}`}
                                                    className="h-3.5 w-3.5 accent-zinc-900 dark:accent-zinc-100 cursor-pointer rounded-sm"
                                                    checked={!disabledComponents.includes(comp.id)}
                                                    onChange={(e) => {
                                                        const isChecked = e.target.checked;
                                                        setDisabledComponents(prev =>
                                                            isChecked ? prev.filter(c => c !== comp.id) : [...prev, comp.id]
                                                        );
                                                        setMarksData(prevData => prevData.map(row => {
                                                            const componentsTotal = components.reduce((acc: number, c: any) => {
                                                                const isDisabled = (!isChecked && c.id === comp.id) || (c.id !== comp.id && disabledComponents.includes(c.id));
                                                                if (isDisabled) return acc;
                                                                return acc + (row[c.id] || 0);
                                                            }, 0);
                                                            return { ...row, totalMarks: row.isAbsent ? 0 : componentsTotal + (row.graceMarks || 0) };
                                                        }));
                                                    }}
                                                />
                                                <label htmlFor={`toggle-${comp.id}`} className="text-[10px] cursor-pointer font-black tracking-widest normal-case text-zinc-400 text-nowrap">ENABLE</label>
                                            </div>
                                        </div>
                                    </th>
                                ))}
                                <th className="px-8 py-5 text-[11px] font-extrabold uppercase tracking-widest text-zinc-500 text-center w-36">Aggregate</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-100 dark:divide-sidebar-border/50">
                            {paginatedData.map((row) => (
                                <tr key={row.studentId} className={cn(
                                    "transition-all duration-200 border-b border-zinc-50 dark:border-sidebar-border/20 last:border-0 hover:bg-zinc-50/50 dark:hover:bg-sidebar/40", 
                                    row.isAbsent && "bg-rose-50/10 dark:bg-rose-950/5"
                                )}>
                                    <td className="px-8 py-4 border-r border-zinc-100 dark:border-sidebar-border/30">
                                        <div className="flex items-center gap-4">
                                            <Avatar className="h-10 w-10 rounded-xl border border-zinc-200 dark:border-sidebar-border shadow-sm transition-transform group-hover:scale-105">
                                                <AvatarFallback className="bg-zinc-100 dark:bg-black/20 text-zinc-600 dark:text-zinc-400 text-[10px] font-black uppercase">
                                                    {row.studentName.charAt(0)}
                                                </AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <p className="text-[14px] font-black tracking-tight text-zinc-900 dark:text-zinc-100 uppercase">{row.studentName}</p>
                                                <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest mt-0.5">Roll: {row.rollNumber}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-4 border-r border-zinc-100 dark:border-sidebar-border/30 text-center">
                                        <button
                                            onClick={() => toggleAbsent(row.studentId)}
                                            disabled={isFieldDisabled(row, true)}
                                            className={cn(
                                                "h-9 w-28 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border shadow-sm", 
                                                row.isAbsent 
                                                    ? "bg-rose-600 text-white border-rose-700 shadow-rose-500/20" 
                                                    : "bg-white text-zinc-500 border-zinc-200 hover:bg-zinc-50 dark:bg-sidebar dark:border-sidebar-border dark:text-zinc-400 dark:hover:bg-background disabled:opacity-40"
                                            )}
                                        >
                                            {row.isAbsent ? "Absent" : "Present"}
                                        </button>
                                    </td>
                                    {components.map((comp: any) => {
                                        const isDisabledGlobally = disabledComponents.includes(comp.id);
                                        return (
                                            <td key={comp.id} className={cn("px-8 py-4 border-r border-zinc-100 dark:border-sidebar-border/30", isDisabledGlobally && "bg-zinc-50/50 dark:bg-sidebar/20 opacity-40")}>
                                                <Input
                                                    type="number"
                                                    value={row[comp.id] ?? ""}
                                                    onChange={(e) => handleMarkChange(row.studentId, comp.id, e.target.value)}
                                                    disabled={isFieldDisabled(row) || isDisabledGlobally}
                                                    className="h-11 rounded-xl bg-transparent border-0 focus-visible:ring-1 focus-visible:ring-zinc-200 dark:focus-visible:ring-zinc-800 text-center text-base font-black text-zinc-900 dark:text-zinc-100 disabled:opacity-30 placeholder:text-zinc-300 transition-all font-mono"
                                                    placeholder={isDisabledGlobally ? "N/A" : "00"}
                                                />
                                            </td>
                                        );
                                    })}
                                    <td className="px-8 py-4 text-center">
                                        <div className={cn(
                                            "h-11 flex items-center justify-center rounded-2xl font-black text-base transition-all border shadow-sm px-4 font-mono", 
                                            row.totalMarks < data.scheduleInfo.passMarks && !row.isAbsent 
                                                ? "text-rose-600 bg-rose-50 border-rose-100 dark:bg-rose-950/30 dark:border-rose-900/50" 
                                                : "text-zinc-900 dark:text-zinc-100 bg-zinc-50 dark:bg-sidebar/40 border-zinc-200 dark:border-sidebar-border"
                                        )}>
                                            {row.totalMarks ?? 0}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pagination Controls */}
            <div className="flex flex-col sm:flex-row items-center justify-between px-2 py-4 gap-4">
                <p className="text-[11px] font-black text-zinc-400 uppercase tracking-widest bg-zinc-100 dark:bg-zinc-800 px-3 py-1 rounded-lg border border-zinc-200 dark:border-zinc-700 transition-colors">
                    Registry Page {currentPage} / {totalPages || 1} • {marksData.length} Candidates
                </p>
                <div className="flex items-center gap-2">
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))} 
                        disabled={currentPage === 1} 
                        className="h-11 w-11 rounded-2xl border border-zinc-200 dark:border-sidebar-border text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-sidebar transition-all shadow-sm"
                    >
                        <ChevronLeft className="h-5 w-5" />
                    </Button>
                    <Button 
                        variant="ghost" 
                        size="icon" 
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} 
                        disabled={currentPage === totalPages} 
                        className="h-11 w-11 rounded-2xl border border-zinc-200 dark:border-sidebar-border text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-sidebar transition-all shadow-sm"
                    >
                        <ChevronRight className="h-5 w-5" />
                    </Button>
                </div>
            </div>

            {/* Modals */}
            <Dialog open={isLockModalOpen} onOpenChange={setIsLockModalOpen}>
                <DialogContent className="rounded-[28px] border-none shadow-2xl bg-white dark:bg-sidebar sm:max-w-[420px] p-0 overflow-hidden outline-none">
                    <div className="p-10 text-center">
                        <div className="h-16 w-16 rounded-[24px] bg-rose-50 dark:bg-rose-900/20 border border-rose-100 dark:border-rose-900/50 flex items-center justify-center mx-auto mb-6 shadow-sm"><ShieldAlert className="h-8 w-8 text-rose-600 dark:text-rose-500" /></div>
                        <DialogTitle className="text-2xl font-black text-zinc-900 dark:text-zinc-100 uppercase tracking-tight">Finalize Registry?</DialogTitle>
                        <DialogDescription className="text-[13px] font-medium text-zinc-500 dark:text-zinc-400 mt-3 leading-relaxed">
                            Once locked, marks cannot be modified by teaching staff. This action will finalize the current scores in the central database.
                        </DialogDescription>
                    </div>
                    <div className="bg-zinc-50 dark:bg-sidebar/50 p-6 px-10 border-t border-zinc-100 dark:border-sidebar-border flex flex-col sm:flex-row justify-center gap-3">
                        <Button variant="ghost" onClick={() => setIsLockModalOpen(false)} className="rounded-xl h-11 px-8 font-black text-[12px] uppercase tracking-widest text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-all">Cancel</Button>
                        <Button onClick={() => lockMutation.mutate({ scheduleId })} disabled={lockMutation.isPending} className="rounded-xl h-11 px-8 bg-rose-600 hover:bg-rose-700 text-white font-black text-[12px] uppercase tracking-widest shadow-lg shadow-rose-500/20 transition-all">Lock Registry</Button>
                    </div>
                </DialogContent>
            </Dialog>

            <Dialog open={isUnlockModalOpen} onOpenChange={setIsUnlockModalOpen}>
                <DialogContent className="rounded-[28px] border-none shadow-2xl bg-white dark:bg-sidebar sm:max-w-[420px] p-0 overflow-hidden outline-none">
                    <div className="p-10 text-center">
                        <div className="h-16 w-16 rounded-[24px] bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-900/50 flex items-center justify-center mx-auto mb-6 shadow-sm"><ShieldCheck className="h-8 w-8 text-emerald-600 dark:text-emerald-500" /></div>
                        <DialogTitle className="text-2xl font-black text-zinc-900 dark:text-zinc-100 uppercase tracking-tight">Unlock Database?</DialogTitle>
                        <DialogDescription className="text-[13px] font-medium text-zinc-500 dark:text-zinc-400 mt-3 leading-relaxed">
                            This will restore write access for all authorized personnel. Subject marks will transition back to an editable state.
                        </DialogDescription>
                    </div>
                    <div className="bg-zinc-50 dark:bg-sidebar/50 p-6 px-10 border-t border-zinc-100 dark:border-sidebar-border flex flex-col sm:flex-row justify-center gap-3">
                        <Button variant="ghost" onClick={() => setIsUnlockModalOpen(false)} className="rounded-xl h-11 px-8 font-black text-[12px] uppercase tracking-widest text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 transition-all">Cancel</Button>
                        <Button onClick={() => unlockMutation.mutate({ scheduleId })} disabled={unlockMutation.isPending} className="rounded-xl h-11 px-8 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-[12px] uppercase tracking-widest shadow-lg shadow-emerald-500/20 transition-all">Unlock Marks</Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}