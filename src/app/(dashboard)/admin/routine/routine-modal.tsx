"use client";

import { useEffect, useState, useMemo } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AxiosError } from "axios";
import { Check, ChevronsUpDown, BookOpen, User, Info, AlertCircle, Search, Star } from "lucide-react";

import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";

import { RoutineService } from "@/services/routine.service";
import { AcademicService } from "@/services/academic.service";
import { SubjectService } from "@/services/subject.service";
import { PeriodService } from "@/services/period.service";
import api from "@/lib/axios";
import { routineSchema, RoutineFormValues } from "./schema";

interface RoutineModalProps {
    isOpen: boolean;
    onClose: () => void;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    initialData?: any | null;
}

export function RoutineModal({ isOpen, onClose, initialData }: RoutineModalProps) {
    const queryClient = useQueryClient();
    const isEdit = !!initialData;
    const [openTeacherSelect, setOpenTeacherSelect] = useState(false);

    const form = useForm<RoutineFormValues>({
        resolver: zodResolver(routineSchema),
        defaultValues: {
            classId: "",
            sectionId: "",
            periodId: "",
            subjectId: "",
            teacherId: "none",
            day: "MONDAY",
            roomNo: "",
        },
    });

    const { reset, control, setValue, handleSubmit } = form;
    const selectedClassId = useWatch({ control, name: "classId" });
    const selectedDay = useWatch({ control, name: "day" });
    const selectedPeriodId = useWatch({ control, name: "periodId" });
    const selectedSubjectId = useWatch({ control, name: "subjectId" });

    const { data: classes } = useQuery({
        queryKey: ["classes"],
        queryFn: () => AcademicService.getAllClasses(),
        enabled: isOpen,
    });

    const { data: sections } = useQuery({
        queryKey: ["sections", selectedClassId],
        queryFn: () => AcademicService.getAllSections({ classId: selectedClassId }),
        enabled: isOpen && !!selectedClassId,
    });

    const { data: periodsData } = useQuery({
        queryKey: ["periods", selectedDay],
        queryFn: () => PeriodService.getAllPeriods({ day: selectedDay }),
        enabled: isOpen && !!selectedDay,
    });

    const { data: subjectsData } = useQuery({
        queryKey: ["subjects"],
        queryFn: () => SubjectService.getAllSubjects({ limit: 1000 }),
        enabled: isOpen,
    });

    const { data: teachersData } = useQuery({
        queryKey: ["teachers"],
        queryFn: async () => {
            const res = await api.get("/teachers", { params: { limit: 1000 } });
            return res.data;
        },
        enabled: isOpen,
    });

    const { data: busyTeachersResponse } = useQuery({
        queryKey: ["busy-teachers", selectedDay, selectedPeriodId],
        queryFn: async () => {
            const res = await api.get("/routines", { params: { day: selectedDay, periodId: selectedPeriodId, limit: 1000 } });
            return res.data;
        },
        enabled: isOpen && !!selectedDay && !!selectedPeriodId,
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const classList = classes?.data?.data || classes?.data || (Array.isArray(classes) ? classes : []);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const sectionList = sections?.data?.data || sections?.data || (Array.isArray(sections) ? sections : []);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const periodList = periodsData?.data || (Array.isArray(periodsData) ? periodsData : []);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const allSubjects = subjectsData?.data?.data || subjectsData?.data || (Array.isArray(subjectsData) ? subjectsData : []);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const teachersList = teachersData?.data?.data || teachersData?.data || (Array.isArray(teachersData) ? teachersData : []);
    const busyRoutines = busyTeachersResponse?.data || [];

    const filteredSubjects = useMemo(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return allSubjects.filter((s: any) =>
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            s.classes?.some((c: any) => String(c.id) === String(selectedClassId))
        );
    }, [allSubjects, selectedClassId]);

    const busyTeacherIds = useMemo(() => {
        return busyRoutines
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .filter((r: any) => r.teacherId && r.id !== initialData?.id)
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            .map((r: any) => String(r.teacherId));
    }, [busyRoutines, initialData]);

    const { expertTeachers, otherTeachers } = useMemo(() => {
        if (!selectedSubjectId) {
            return { expertTeachers: [], otherTeachers: teachersList };
        }
        
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const experts = teachersList.filter((t: any) => 
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            t.subjects?.some((s: any) => String(s.id) === String(selectedSubjectId))
        );
        
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const others = teachersList.filter((t: any) => 
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            !t.subjects?.some((s: any) => String(s.id) === String(selectedSubjectId))
        );
        
        return { expertTeachers: experts, otherTeachers: others };
    }, [teachersList, selectedSubjectId]);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const selectedPeriod = periodList.find((p: any) => p.id === selectedPeriodId);
    const isBreak = selectedPeriod?.type === "BREAK";

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                reset({
                    classId: String(initialData.classId),
                    sectionId: String(initialData.sectionId),
                    periodId: String(initialData.periodId),
                    subjectId: initialData.subjectId ? String(initialData.subjectId) : "",
                    teacherId: initialData.teacherId ? String(initialData.teacherId) : "none",
                    day: initialData.day,
                    roomNo: initialData.roomNo || "",
                });
            } else {
                reset({
                    classId: "",
                    sectionId: "",
                    periodId: "",
                    subjectId: "",
                    teacherId: "none",
                    day: "MONDAY",
                    roomNo: "",
                });
            }
        }
    }, [initialData, reset, isOpen]);

    const mutation = useMutation({
        mutationFn: (data: RoutineFormValues) => {
            const payload = {
                ...data,
                teacherId: data.teacherId === "none" ? null : data.teacherId,
                subjectId: data.subjectId === "" ? null : data.subjectId,
            };
            if (isEdit && initialData?.id) {
                return RoutineService.updateRoutine(initialData.id, payload);
            }
            return RoutineService.createRoutine(payload);
        },
        onSuccess: () => {
            toast.success(`Schedule ${isEdit ? "updated" : "created"} successfully!`);
            queryClient.invalidateQueries({ queryKey: ["routines"] });
            onClose();
        },
        onError: (error: AxiosError<{ message: string }>) => {
            toast.error(error.response?.data?.message || "Conflict detected");
        },
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const renderTeacherItem = (teacher: any, isExpert: boolean) => {
        const isBusy = busyTeacherIds.includes(String(teacher.id));
        return (
            <CommandItem
                key={teacher.id}
                value={`${teacher.firstName} ${teacher.lastName} ${teacher.employeeId || ""}`}
                disabled={isBusy}
                onSelect={() => { if (!isBusy) { setValue("teacherId", String(teacher.id)); setOpenTeacherSelect(false); } }}
                className={cn(
                    "rounded-xl py-2.5 px-3 mb-1 transition-all",
                    isBusy ? "opacity-40 grayscale cursor-not-allowed" : "cursor-pointer"
                )}
            >
                <div className="flex flex-1 items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className={cn("p-1.5 rounded-lg border", isExpert ? "bg-primary/10 border-primary/20 text-primary" : "bg-slate-100 border-slate-200 text-slate-400 dark:bg-slate-800 dark:border-slate-700")}>
                            {isExpert ? <Star className="h-3.5 w-3.5 fill-current" /> : <User className="h-3.5 w-3.5" />}
                        </div>
                        <div className="flex flex-col">
                            <span className={cn("text-[13px] font-bold", isExpert && !isBusy ? "text-primary" : "text-slate-900 dark:text-slate-100")}>
                                {teacher.firstName} {teacher.lastName}
                            </span>
                            <span className="text-[10px] font-medium text-slate-500">{teacher.phone || "No Contact"}</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        {isBusy && (
                            <Badge variant="outline" className="bg-red-500/10 text-red-600 border-red-500/20 text-[9px] font-black uppercase px-2 py-0 h-5">
                                <AlertCircle className="h-2.5 w-2.5 mr-1" /> Booked
                            </Badge>
                        )}
                        {isExpert && !isBusy && (
                            <Badge variant="secondary" className="bg-primary/10 text-primary border-0 text-[9px] font-black uppercase px-2 py-0 h-5">Expert</Badge>
                        )}
                    </div>
                </div>
            </CommandItem>
        );
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[700px] w-full max-h-[90vh] overflow-y-auto border-white/20 dark:border-white/10 shadow-2xl bg-white/95 dark:bg-slate-950/95 backdrop-blur-2xl rounded-[32px] p-0 gap-0">
                <DialogHeader className="p-8 border-b border-black/5 dark:border-white/5 bg-slate-50/50 dark:bg-slate-900/50">
                    <DialogTitle className="text-[22px] font-black text-slate-900 dark:text-white flex items-center gap-3">
                        <div className="p-2.5 rounded-2xl bg-primary/10 text-primary border border-primary/20 shadow-sm">
                            <BookOpen className="h-5 w-5" />
                        </div>
                        {isEdit ? "Update Schedule" : "New Class Schedule"}
                    </DialogTitle>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="p-8">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                            <FormField
                                control={control}
                                name="day"
                                render={({ field }) => (
                                    <FormItem className="flex w-full flex-col">
                                        <FormLabel className="text-[13px] font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Day Selection</FormLabel>
                                        <Select onValueChange={(val) => { field.onChange(val); setValue("periodId", ""); setValue("teacherId", "none"); }} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger className="bg-white/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 shadow-sm font-bold h-12 rounded-2xl focus:ring-primary/20 w-full">
                                                    <SelectValue placeholder="Select Day" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent className="rounded-2xl">
                                                {["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"].map((d) => (
                                                    <SelectItem key={d} value={d} className="font-semibold">{d}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage className="text-[11px]" />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={control}
                                name="periodId"
                                render={({ field }) => (
                                    <FormItem className="flex w-full flex-col">
                                        <FormLabel className="text-[13px] font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Time Slot</FormLabel>
                                        <Select onValueChange={(val) => { field.onChange(val); setValue("teacherId", "none"); }} value={field.value} disabled={!selectedDay}>
                                            <FormControl>
                                                <SelectTrigger className="bg-white/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 shadow-sm font-bold h-12 rounded-2xl focus:ring-primary/20 w-full">
                                                    <SelectValue placeholder={selectedDay ? "Pick a Period" : "Select Day First"} />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent className="rounded-2xl">
                                                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                                {periodList.map((p: any) => (
                                                    <SelectItem key={p.id} value={p.id} className="font-medium">
                                                        <div className="flex flex-col py-1">
                                                            <span className="font-bold text-[14px]">{p.name}</span>
                                                            <span className="text-[11px] text-slate-500 font-medium">{p.startTime} - {p.endTime}</span>
                                                        </div>
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage className="text-[11px]" />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={control}
                                name="classId"
                                render={({ field }) => (
                                    <FormItem className="flex w-full flex-col">
                                        <FormLabel className="text-[13px] font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Class</FormLabel>
                                        <Select onValueChange={(val) => { field.onChange(val); setValue("sectionId", ""); setValue("subjectId", ""); setValue("teacherId", "none"); }} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger className="bg-white/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 shadow-sm font-bold h-12 rounded-2xl w-full">
                                                    <SelectValue placeholder="Select Class" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent className="max-h-[240px] rounded-2xl">
                                                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                                {classList.map((c: any) => (
                                                    <SelectItem key={c.id} value={String(c.id)} className="font-semibold">{c.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage className="text-[11px]" />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={control}
                                name="sectionId"
                                render={({ field }) => (
                                    <FormItem className="flex w-full flex-col">
                                        <FormLabel className="text-[13px] font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Section</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value} disabled={!selectedClassId}>
                                            <FormControl>
                                                <SelectTrigger className="bg-white/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 shadow-sm font-bold h-12 rounded-2xl w-full">
                                                    <SelectValue placeholder="Select Section" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent className="rounded-2xl">
                                                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                                {sectionList.map((s: any) => (
                                                    <SelectItem key={s.id} value={String(s.id)} className="font-semibold">{s.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage className="text-[11px]" />
                                    </FormItem>
                                )}
                            />

                            {!isBreak && (
                                <>
                                    <FormField
                                        control={control}
                                        name="subjectId"
                                        render={({ field }) => (
                                            <FormItem className="flex w-full flex-col animate-in fade-in slide-in-from-top-4 duration-500">
                                                <FormLabel className="text-[13px] font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Subject</FormLabel>
                                                <Select onValueChange={(val) => { field.onChange(val); setValue("teacherId", "none"); }} value={field.value || ""} disabled={!selectedClassId}>
                                                    <FormControl>
                                                        <SelectTrigger className="bg-white/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 shadow-sm font-bold h-12 rounded-2xl w-full">
                                                            <SelectValue placeholder={selectedClassId ? "Pick Subject" : "Select Class First"} />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent className="max-h-[240px] rounded-2xl">
                                                        {filteredSubjects.length > 0 ? (
                                                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                                            filteredSubjects.map((s: any) => (
                                                                <SelectItem key={s.id} value={String(s.id)} className="font-semibold">
                                                                    {s.subjectName} <span className="text-[10px] text-slate-400 ml-2">[{s.subjectCode}]</span>
                                                                </SelectItem>
                                                            ))
                                                        ) : (
                                                            <div className="p-4 text-center text-xs text-slate-400 font-bold">No subjects in this class</div>
                                                        )}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage className="text-[11px]" />
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={control}
                                        name="teacherId"
                                        render={({ field }) => (
                                            <FormItem className="flex w-full flex-col animate-in fade-in slide-in-from-top-4 duration-500">
                                                <FormLabel className="text-[13px] font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Assign Teacher</FormLabel>
                                                <Popover open={openTeacherSelect} onOpenChange={setOpenTeacherSelect}>
                                                    <PopoverTrigger asChild>
                                                        <FormControl>
                                                            <Button
                                                                variant="outline"
                                                                role="combobox"
                                                                disabled={!selectedPeriodId}
                                                                className={cn(
                                                                    "w-full justify-between bg-white/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 shadow-sm h-12 rounded-2xl font-bold transition-all",
                                                                    !field.value && "text-slate-500 font-normal"
                                                                )}
                                                            >
                                                                {field.value === "none" ? "Self Study / No Teacher" : 
                                                                    (() => {
                                                                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                                                        const t = teachersList.find((t: any) => String(t.id) === String(field.value));
                                                                        return t ? `${t.firstName} ${t.lastName}` : "Search Teacher";
                                                                    })()
                                                                }
                                                                <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                            </Button>
                                                        </FormControl>
                                                    </PopoverTrigger>
                                                    <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 shadow-2xl border-slate-200 dark:border-slate-800 rounded-[24px] bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl overflow-hidden">
                                                        <Command className="bg-transparent">
                                                            <div className="flex items-center border-b border-black/5 dark:border-white/5 px-3">
                                                                <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
                                                                <CommandInput placeholder="Search all faculty..." className="h-12 border-0 bg-transparent focus:ring-0 text-[13px] font-medium" />
                                                            </div>
                                                            <CommandList className="max-h-[300px] custom-scrollbar p-1">
                                                                <CommandEmpty className="text-[13px] py-8 text-center text-slate-400 font-bold">No faculty member found.</CommandEmpty>
                                                                
                                                                <CommandGroup heading="General Option" className="text-[10px] font-black uppercase tracking-widest text-slate-400 p-2">
                                                                    <CommandItem value="none" onSelect={() => { setValue("teacherId", "none"); setOpenTeacherSelect(false); }} className="rounded-xl h-11 px-3">
                                                                        <Check className={cn("mr-2 h-4 w-4 text-primary", field.value === "none" ? "opacity-100" : "opacity-0")} />
                                                                        <span className="font-bold text-[13px]">Self Study (No Teacher)</span>
                                                                    </CommandItem>
                                                                </CommandGroup>

                                                                {expertTeachers.length > 0 && (
                                                                    <>
                                                                        <CommandSeparator className="bg-black/5 dark:bg-white/5" />
                                                                        <CommandGroup heading="Recommended Experts" className="text-[10px] font-black uppercase tracking-widest text-primary p-2">
                                                                            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                                                            {expertTeachers.map((teacher: any) => renderTeacherItem(teacher, true))}
                                                                        </CommandGroup>
                                                                    </>
                                                                )}

                                                                {otherTeachers.length > 0 && (
                                                                    <>
                                                                        <CommandSeparator className="bg-black/5 dark:bg-white/5" />
                                                                        <CommandGroup heading={selectedSubjectId ? "Other Faculty" : "All Faculty"} className="text-[10px] font-black uppercase tracking-widest text-slate-400 p-2">
                                                                            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                                                            {otherTeachers.map((teacher: any) => renderTeacherItem(teacher, false))}
                                                                        </CommandGroup>
                                                                    </>
                                                                )}

                                                            </CommandList>
                                                        </Command>
                                                    </PopoverContent>
                                                </Popover>
                                                <FormMessage className="text-[11px]" />
                                            </FormItem>
                                        )}
                                    />
                                </>
                            )}

                            {isBreak && (
                                <div className="w-full md:col-span-2 p-8 border-2 border-dashed border-orange-500/30 bg-orange-500/5 rounded-[24px] flex flex-col items-center justify-center text-center animate-in zoom-in-95 duration-500">
                                    <div className="h-14 w-14 rounded-full bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center mb-4 border-2 border-orange-200 dark:border-orange-800">
                                        <Info className="h-7 w-7 text-orange-600 dark:text-orange-400" />
                                    </div>
                                    <h4 className="font-black text-orange-700 dark:text-orange-400 text-[16px] uppercase tracking-tight">Break Time Slot</h4>
                                    <p className="text-orange-600/70 text-[13px] font-bold mt-2 max-w-[300px]">This period is designated as a break. No academic assignments are necessary.</p>
                                </div>
                            )}

                            <FormField
                                control={control}
                                name="roomNo"
                                render={({ field }) => (
                                    <FormItem className="flex w-full flex-col md:col-span-2">
                                        <FormLabel className="text-[13px] font-extrabold text-slate-700 dark:text-slate-300 uppercase tracking-wider">Venue / Room No</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g. Hall 102, Lab A" className="bg-white/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 shadow-sm h-12 rounded-2xl font-bold focus-visible:ring-primary/20 w-full" {...field} value={field.value || ""} />
                                        </FormControl>
                                        <FormMessage className="text-[11px]" />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="flex justify-end gap-4 pt-6 mt-6 border-t border-black/5 dark:border-white/5 w-full">
                            <Button type="button" variant="ghost" onClick={onClose} disabled={mutation.isPending} className="rounded-2xl font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-all h-12 px-6">
                                Cancel
                            </Button>
                            <Button type="submit" disabled={mutation.isPending} className="rounded-2xl font-black px-12 shadow-xl shadow-primary/20 transition-all hover:shadow-2xl hover:-translate-y-1 h-12 bg-primary">
                                {mutation.isPending ? "Processing..." : "Sync Schedule"}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}