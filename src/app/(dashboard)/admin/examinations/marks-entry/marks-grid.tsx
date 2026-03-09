/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState, useRef, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { examService } from "@/services/exam.service";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogTitle,
    DialogDescription,
    DialogFooter
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
        return <div className="flex h-64 items-center justify-center bg-white dark:bg-zinc-950 rounded-2xl ring-1 ring-border/50"><Loader2 className="h-8 w-8 animate-spin text-primary" /></div>;
    }

    if (isError || marksData.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-24 text-center border-0 shadow-sm ring-1 ring-border/50 rounded-2xl bg-white dark:bg-zinc-950">
                <div className="h-16 w-16 rounded-2xl bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center mb-4 ring-1 ring-inset ring-border/50"><AlertCircle className="h-8 w-8 text-zinc-400" /></div>
                <p className="text-lg font-medium text-zinc-900 dark:text-zinc-100">No Students Found</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* ✅ Professional Override Warning for Admin */}
            {isAllLocked && isAdmin && (
                <div className={cn(
                    "rounded-[20px] p-4 flex items-center justify-between gap-4 border transition-all duration-500",
                    adminOverride
                        ? "bg-emerald-50/50 border-emerald-200 text-emerald-800 dark:bg-emerald-950/20 dark:border-emerald-900/50"
                        : "bg-amber-50/50 border-amber-200 text-amber-800 dark:bg-amber-950/20 dark:border-amber-900/50"
                )}>
                    <div className="flex items-center gap-3">
                        <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center ring-1 ring-inset", adminOverride ? "bg-emerald-100 text-emerald-600 ring-emerald-200" : "bg-amber-100 text-amber-600 ring-amber-200")}>
                            {adminOverride ? <ShieldCheck className="h-5 w-5" /> : <ShieldAlert className="h-5 w-5" />}
                        </div>
                        <div>
                            <p className="font-bold text-sm uppercase tracking-tight">
                                {adminOverride ? "Admin Override Active" : "Data Protected & Locked"}
                            </p>
                            <p className="text-xs opacity-80 font-medium">
                                {adminOverride ? "You are editing locked marks. Changes will be saved directly." : "Only Administrators can enable 'Override' to edit this locked dataset."}
                            </p>
                        </div>
                    </div>
                    <Button
                        onClick={() => setAdminOverride(!adminOverride)}
                        variant="outline"
                        className={cn("rounded-xl h-9 px-4 font-bold text-[10px] uppercase border-0 ring-1 ring-inset transition-all", adminOverride ? "bg-emerald-600 text-white ring-emerald-700 hover:bg-emerald-700" : "bg-white text-amber-700 ring-amber-200 hover:bg-amber-50")}
                    >
                        {adminOverride ? <><Lock className="h-3 w-3 mr-2" /> Disable Override</> : <><Key className="h-3 w-3 mr-2" /> Enable Override</>}
                    </Button>
                </div>
            )}

            <Card className="border-0 shadow-md ring-1 ring-border/50 rounded-2xl bg-white dark:bg-zinc-950 overflow-hidden">
                <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-border bg-zinc-50/30 dark:bg-zinc-900/30 px-6">
                    <div className="space-y-1">
                        <CardTitle className="text-xl font-bold flex items-center gap-2">
                            {data.scheduleInfo.subjectName}
                            {isAllLocked && <Lock className="h-4 w-4 text-rose-500 fill-rose-500/10" />}
                        </CardTitle>
                        <p className="text-sm text-zinc-500 font-medium">Full: {data.scheduleInfo.fullMarks} • Pass: {data.scheduleInfo.passMarks}</p>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className={cn("px-3 py-1.5 rounded-full text-[11px] font-bold uppercase tracking-wider ring-1 ring-inset", (saveMutation.isPending || isFetching) ? "bg-amber-50 text-amber-600 ring-amber-100 animate-pulse" : "bg-emerald-50 text-emerald-600 ring-emerald-100")}>
                            {(saveMutation.isPending || isFetching) ? <><CloudUpload className="h-3.5 w-3.5" /> Syncing...</> : <><CloudCheck className="h-3.5 w-3.5" /> Synced</>}
                        </div>

                        {isAdmin && (
                            <Button
                                onClick={() => isAllLocked ? setIsUnlockModalOpen(true) : setIsLockModalOpen(true)}
                                variant="outline"
                                className={cn("rounded-xl h-10 px-5 border-0 ring-1 ring-border font-bold text-xs transition-all", isAllLocked ? "hover:ring-emerald-200 hover:bg-emerald-50 hover:text-emerald-600" : "hover:ring-rose-200 hover:bg-rose-50 hover:text-rose-600")}
                            >
                                {isAllLocked ? <><Unlock className="h-3.5 w-3.5 mr-2" /> Unlock (Database)</> : <><Lock className="h-3.5 w-3.5 mr-2" /> Lock Final</>}
                            </Button>
                        )}
                    </div>
                </CardHeader>

                <CardContent className="p-0 overflow-x-auto">
                    <table className="w-full text-sm text-left border-collapse">
                        <thead className="text-[11px] text-zinc-400 bg-zinc-50 dark:bg-zinc-900/50 border-b border-border uppercase tracking-widest font-bold">
                            <tr>
                                <th className="px-6 py-4 border-r border-border">Student Details</th>
                                <th className="px-6 py-4 border-r border-border text-center w-32">Attendance</th>
                                {components.map((comp: any) => (
                                    <th key={comp.id} className="px-6 py-4 border-r border-border text-center w-36">
                                        <div className="flex flex-col items-center gap-2">
                                            <span>{comp.name}</span>
                                            <div className="flex items-center gap-1.5 bg-white dark:bg-zinc-950 px-2 py-1 rounded-md ring-1 ring-border mt-1">
                                                <input
                                                    type="checkbox"
                                                    id={`toggle-${comp.id}`}
                                                    className="h-3 w-3 accent-primary cursor-pointer"
                                                    checked={!disabledComponents.includes(comp.id)}
                                                    onChange={(e) => {
                                                        const isChecked = e.target.checked;
                                                        setDisabledComponents(prev =>
                                                            isChecked ? prev.filter(c => c !== comp.id) : [...prev, comp.id]
                                                        );
                                                        // Trigger re-calculation of totals for all rows
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
                                                <label htmlFor={`toggle-${comp.id}`} className="text-[9px] cursor-pointer tracking-tighter normal-case">Enable</label>
                                            </div>
                                        </div>
                                    </th>
                                ))}
                                <th className="px-6 py-4 text-center w-32">Total Score</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {paginatedData.map((row) => (
                                <tr key={row.studentId} className={cn("group transition-all duration-200", row.isAbsent ? "bg-rose-50/30 dark:bg-rose-950/10" : "hover:bg-zinc-50/50 dark:hover:bg-zinc-900/20")}>
                                    <td className="px-6 py-3 border-r border-border">
                                        <div className="flex items-center space-x-3">
                                            <Avatar className="h-9 w-9 rounded-xl ring-1 ring-border shadow-sm"><AvatarFallback className="bg-zinc-100 text-zinc-600 text-xs font-bold uppercase">{row.studentName.charAt(0)}</AvatarFallback></Avatar>
                                            <div>
                                                <p className="font-bold text-zinc-900 dark:text-zinc-100 leading-tight">{row.studentName}</p>
                                                <p className="text-[10px] font-bold text-zinc-400 mt-0.5 uppercase tracking-tighter">Roll: {row.rollNumber}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-3 border-r border-border text-center">
                                        <button
                                            onClick={() => toggleAbsent(row.studentId)}
                                            disabled={isFieldDisabled(row, true)}
                                            className={cn("h-8 w-24 rounded-lg text-[10px] font-black uppercase transition-all ring-1 ring-inset", row.isAbsent ? "bg-rose-600 text-white ring-rose-700 shadow-sm" : "bg-white text-zinc-400 ring-border dark:bg-zinc-950 disabled:opacity-40")}
                                        >
                                            {row.isAbsent ? "Absent" : "Present"}
                                        </button>
                                    </td>
                                    {components.map((comp: any) => {
                                        const isDisabledGlobally = disabledComponents.includes(comp.id);
                                        return (
                                            <td key={comp.id} className={cn("px-6 py-3 border-r border-border", isDisabledGlobally && "bg-zinc-100/50 dark:bg-zinc-900/20 opacity-60")}>
                                                <Input
                                                    type="number"
                                                    value={row[comp.id] ?? ""}
                                                    onChange={(e) => handleMarkChange(row.studentId, comp.id, e.target.value)}
                                                    disabled={isFieldDisabled(row) || isDisabledGlobally}
                                                    className="h-10 rounded-xl bg-transparent border-0 ring-0 text-center font-bold text-zinc-900 dark:text-zinc-100 disabled:opacity-40"
                                                    placeholder={isDisabledGlobally ? "N/A" : "-"}
                                                />
                                            </td>
                                        );
                                    })}
                                    <td className="px-6 py-3 text-center">
                                        <div className={cn("h-10 flex items-center justify-center rounded-xl font-black text-sm", row.totalMarks < data.scheduleInfo.passMarks && !row.isAbsent ? "text-rose-600 bg-rose-50 dark:bg-rose-950/30" : "text-zinc-900 dark:text-zinc-100 bg-zinc-100/50 dark:bg-zinc-900/50 ring-1 ring-inset ring-border/50")}>{row.totalMarks ?? 0}</div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </CardContent>
            </Card>

            {/* Pagination Controls */}
            <div className="flex flex-col sm:flex-row items-center justify-between px-2 gap-4">
                <p className="text-[11px] font-medium text-zinc-400 uppercase tracking-tight">Page {currentPage} of {totalPages || 1} • {marksData.length} Students</p>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="h-9 w-9 rounded-xl border-0 ring-1 ring-border"><ChevronLeft className="h-4 w-4" /></Button>
                    <Button variant="outline" size="icon" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="h-9 w-9 rounded-xl border-0 ring-1 ring-border"><ChevronRight className="h-4 w-4" /></Button>
                </div>
            </div>

            {/* Modals */}
            <Dialog open={isLockModalOpen} onOpenChange={setIsLockModalOpen}>
                <DialogContent className="rounded-[28px] border-0 ring-1 ring-border shadow-2xl bg-white dark:bg-zinc-950 sm:max-w-[400px] p-0 overflow-hidden">
                    <div className="p-8 text-center">
                        <div className="h-14 w-14 rounded-2xl bg-rose-50 flex items-center justify-center mx-auto mb-6 ring-1 ring-rose-100"><ShieldAlert className="h-8 w-8 text-rose-600" /></div>
                        <DialogTitle className="text-xl font-black uppercase tracking-tight">Finalize Marks?</DialogTitle>
                        <DialogDescription className="text-sm font-medium text-zinc-500 mt-2">Locked marks cannot be edited by teachers.</DialogDescription>
                    </div>
                    <DialogFooter className="bg-zinc-50 dark:bg-zinc-900/50 p-4 px-8 border-t border-border flex justify-center gap-3">
                        <Button variant="ghost" onClick={() => setIsLockModalOpen(false)} className="rounded-xl font-bold">Cancel</Button>
                        <Button onClick={() => lockMutation.mutate({ scheduleId })} disabled={lockMutation.isPending} className="rounded-xl px-6 bg-rose-600 text-white font-bold">Lock Now</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={isUnlockModalOpen} onOpenChange={setIsUnlockModalOpen}>
                <DialogContent className="rounded-[28px] border-0 ring-1 ring-border shadow-2xl bg-white dark:bg-zinc-950 sm:max-w-[400px] p-0 overflow-hidden">
                    <div className="p-8 text-center">
                        <div className="h-14 w-14 rounded-2xl bg-emerald-50 flex items-center justify-center mx-auto mb-6 ring-1 ring-emerald-100"><ShieldCheck className="h-8 w-8 text-emerald-600" /></div>
                        <DialogTitle className="text-xl font-black uppercase tracking-tight">Unlock Database Marks?</DialogTitle>
                        <DialogDescription className="text-sm font-medium text-zinc-500 mt-2">Everyone can edit the marks again.</DialogDescription>
                    </div>
                    <DialogFooter className="bg-zinc-50 dark:bg-zinc-900/50 p-4 px-8 border-t border-border flex justify-center gap-3">
                        <Button variant="ghost" onClick={() => setIsUnlockModalOpen(false)} className="rounded-xl font-bold">Cancel</Button>
                        <Button onClick={() => unlockMutation.mutate({ scheduleId })} disabled={unlockMutation.isPending} className="rounded-xl px-6 bg-emerald-600 text-white font-bold">Unlock Now</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}