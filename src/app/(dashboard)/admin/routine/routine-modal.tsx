/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AxiosError } from "axios";
import { Check, ChevronsUpDown } from "lucide-react";

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
import api from "@/lib/axios";
import { routineSchema, RoutineFormValues } from "./schema";

interface RoutineModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialData?: any | null;
    defaultClassId?: string;
    defaultSectionId?: string;
}

export function RoutineModal({ isOpen, onClose, initialData, defaultClassId, defaultSectionId }: RoutineModalProps) {
    const queryClient = useQueryClient();
    const isEdit = !!initialData;
    const [openTeacherSelect, setOpenTeacherSelect] = useState(false);

    const form = useForm<RoutineFormValues>({
        resolver: zodResolver(routineSchema),
        defaultValues: {
            classId: defaultClassId ? String(defaultClassId) : "",
            sectionId: defaultSectionId ? String(defaultSectionId) : "",
            subjectId: "",
            teacherId: "none",
            day: "MONDAY",
            startTime: "",
            endTime: "",
            roomNo: "",
        },
    });

    const { reset, control, setValue } = form;
    const selectedClassId = useWatch({ control, name: "classId" });
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

    const { data: subjectsData } = useQuery({
        queryKey: ["subjects", selectedClassId],
        queryFn: () => SubjectService.getAllSubjects({ limit: 1000, classId: selectedClassId }),
        enabled: isOpen && !!selectedClassId,
    });

    const { data: teachersData } = useQuery({
        queryKey: ["teachers"],
        queryFn: async () => {
            const res = await api.get("/teachers", { params: { limit: 1000 } });
            return res.data;
        },
        enabled: isOpen,
    });

    const classList = classes?.data?.data || classes?.data || (Array.isArray(classes) ? classes : []);
    const sectionList = sections?.data?.data || sections?.data || (Array.isArray(sections) ? sections : []);
    const subjectList = subjectsData?.data?.data || subjectsData?.data || (Array.isArray(subjectsData) ? subjectsData : []);
    const teachersList = teachersData?.data?.data || teachersData?.data || (Array.isArray(teachersData) ? teachersData : []);

    const filteredSubjects = subjectList.filter((s: any) => String(s.classId) === String(selectedClassId));

    const recommendedTeachers = selectedSubjectId
        ? teachersList.filter((teacher: any) =>
            teacher.subjects?.some((sub: any) => String(sub.id) === String(selectedSubjectId))
        )
        : [];

    const otherTeachers = selectedSubjectId
        ? teachersList.filter((teacher: any) =>
            !teacher.subjects?.some((sub: any) => String(sub.id) === String(selectedSubjectId))
        )
        : teachersList;

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                reset({
                    classId: String(initialData.classId),
                    sectionId: String(initialData.sectionId),
                    subjectId: String(initialData.subjectId),
                    teacherId: initialData.teacherId ? String(initialData.teacherId) : "none",
                    day: initialData.day,
                    startTime: initialData.startTime,
                    endTime: initialData.endTime,
                    roomNo: initialData.roomNo || "",
                });
            } else {
                reset({
                    classId: defaultClassId ? String(defaultClassId) : "",
                    sectionId: defaultSectionId ? String(defaultSectionId) : "",
                    subjectId: "",
                    teacherId: "none",
                    day: "MONDAY",
                    startTime: "",
                    endTime: "",
                    roomNo: "",
                });
            }
        }
    }, [initialData, reset, isOpen, defaultClassId, defaultSectionId]);

    const mutation = useMutation({
        mutationFn: (data: RoutineFormValues) => {
            const payload = {
                ...data,
                teacherId: data.teacherId === "none" ? null : data.teacherId,
                roomNo: data.roomNo || null,
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
            toast.error(error.response?.data?.message || "Failed to save schedule");
        },
    });

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto p-0 gap-0 border-white/20 dark:border-white/10 shadow-2xl bg-white/80 dark:bg-slate-950/80 backdrop-blur-2xl">
                <DialogHeader className="p-6 pb-4 border-b border-black/5 dark:border-white/5 bg-slate-50/50 dark:bg-slate-900/50">
                    <DialogTitle className="text-[18px] font-extrabold text-slate-900 dark:text-white">
                        {isEdit ? "Edit Schedule" : "Add New Schedule"}
                    </DialogTitle>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit((data) => mutation.mutate(data))} className="p-6 space-y-6">
                        <div className="grid grid-cols-2 gap-5">
                            <FormField
                                control={form.control}
                                name="classId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-[13px] font-bold text-slate-700 dark:text-slate-300">Class <span className="text-red-500">*</span></FormLabel>
                                        <Select
                                            onValueChange={(val) => {
                                                field.onChange(val);
                                                setValue("sectionId", "");
                                                setValue("subjectId", "");
                                                setValue("teacherId", "none");
                                            }}
                                            value={field.value ? String(field.value) : undefined}
                                        >
                                            <FormControl>
                                                <SelectTrigger className="bg-white/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 shadow-sm focus:ring-primary/20 backdrop-blur-sm transition-colors hover:bg-white/80 dark:hover:bg-slate-900/80">
                                                    <SelectValue placeholder="Select Class" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent className="max-h-[200px]">
                                                {classList.map((c: any) => (
                                                    <SelectItem key={c.id} value={String(c.id)} className="font-medium">{c.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage className="text-[11px]" />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="sectionId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-[13px] font-bold text-slate-700 dark:text-slate-300">Section <span className="text-red-500">*</span></FormLabel>
                                        <Select
                                            onValueChange={field.onChange}
                                            value={field.value ? String(field.value) : undefined}
                                            disabled={!selectedClassId}
                                        >
                                            <FormControl>
                                                <SelectTrigger className="bg-white/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 shadow-sm focus:ring-primary/20 backdrop-blur-sm transition-colors hover:bg-white/80 dark:hover:bg-slate-900/80">
                                                    <SelectValue placeholder="Select Section" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent className="max-h-[200px]">
                                                {sectionList.map((s: any) => (
                                                    <SelectItem key={s.id} value={String(s.id)} className="font-medium">{s.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage className="text-[11px]" />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-5">
                            <FormField
                                control={form.control}
                                name="subjectId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-[13px] font-bold text-slate-700 dark:text-slate-300">Subject <span className="text-red-500">*</span></FormLabel>
                                        <Select
                                            onValueChange={(val) => {
                                                field.onChange(val);
                                                setValue("teacherId", "none");
                                            }}
                                            value={field.value ? String(field.value) : undefined}
                                            disabled={!selectedClassId}
                                        >
                                            <FormControl>
                                                <SelectTrigger className="bg-white/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 shadow-sm focus:ring-primary/20 backdrop-blur-sm transition-colors hover:bg-white/80 dark:hover:bg-slate-900/80">
                                                    <SelectValue placeholder="Select Subject" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent className="max-h-[200px]">
                                                {filteredSubjects.map((s: any) => (
                                                    <SelectItem key={s.id} value={String(s.id)} className="font-medium">{s.name} ({s.code})</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage className="text-[11px]" />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="teacherId"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                        <FormLabel className="text-[13px] font-bold text-slate-700 dark:text-slate-300 mb-[6px]">Teacher</FormLabel>
                                        <Popover open={openTeacherSelect} onOpenChange={setOpenTeacherSelect}>
                                            <PopoverTrigger asChild>
                                                <FormControl>
                                                    <Button
                                                        variant="outline"
                                                        role="combobox"
                                                        disabled={!selectedSubjectId}
                                                        className={cn(
                                                            "w-full justify-between bg-white/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 shadow-sm backdrop-blur-sm transition-colors hover:bg-white/80 dark:hover:bg-slate-900/80",
                                                            !field.value && "text-slate-500 font-normal"
                                                        )}
                                                    >
                                                        {field.value === "none"
                                                            ? (!selectedSubjectId ? "Select Subject First" : "Self Study / Tiffin")
                                                            : (() => {
                                                                const t = teachersList.find((t: any) => String(t.id) === String(field.value));
                                                                if (!t) return "Search Teacher...";
                                                                const isRec = t.subjects?.some((s: any) => String(s.id) === String(selectedSubjectId));
                                                                return (
                                                                    <div className="flex items-center gap-2">
                                                                        <span className="truncate font-semibold text-slate-900 dark:text-white">{t.firstName} {t.lastName}</span>
                                                                        {!isRec && <Badge variant="secondary" className="h-[18px] text-[9px] px-1.5 bg-orange-100 text-orange-700 hover:bg-orange-200 border-0 uppercase tracking-widest font-bold rounded-sm">Sub</Badge>}
                                                                    </div>
                                                                );
                                                            })()
                                                        }
                                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                    </Button>
                                                </FormControl>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 shadow-xl border-slate-200 dark:border-slate-800 rounded-xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl">
                                                <Command>
                                                    <CommandInput placeholder="Search teacher..." className="h-10 text-[13px]" />
                                                    <CommandList className="custom-scrollbar">
                                                        <CommandEmpty className="text-[13px] py-4">No teacher found.</CommandEmpty>

                                                        <CommandGroup heading="System Options" className="text-[11px] font-bold text-slate-400">
                                                            <CommandItem
                                                                value="none"
                                                                onSelect={() => {
                                                                    form.setValue("teacherId", "none");
                                                                    setOpenTeacherSelect(false);
                                                                }}
                                                                className="text-[13px] font-medium"
                                                            >
                                                                <Check className={cn("mr-2 h-4 w-4 text-primary", field.value === "none" ? "opacity-100" : "opacity-0")} />
                                                                Self Study / Tiffin
                                                            </CommandItem>
                                                        </CommandGroup>

                                                        {recommendedTeachers.length > 0 && (
                                                            <>
                                                                <CommandSeparator className="bg-slate-100 dark:bg-slate-800" />
                                                                <CommandGroup heading="Subject Teachers" className="text-[11px] font-bold text-primary">
                                                                    {recommendedTeachers.map((teacher: any) => (
                                                                        <CommandItem
                                                                            key={teacher.id}
                                                                            value={`${teacher.firstName} ${teacher.lastName} ${teacher.phone || ""}`}
                                                                            onSelect={() => {
                                                                                form.setValue("teacherId", String(teacher.id));
                                                                                setOpenTeacherSelect(false);
                                                                            }}
                                                                            className="py-2"
                                                                        >
                                                                            <Check className={cn("mr-2 h-4 w-4 text-primary", String(field.value) === String(teacher.id) ? "opacity-100" : "opacity-0")} />
                                                                            <div className="flex flex-col gap-0.5">
                                                                                <span className="font-bold text-[13px] text-slate-900 dark:text-white">{teacher.firstName} {teacher.lastName}</span>
                                                                                {teacher.phone && <span className="text-[10px] font-medium text-slate-500">{teacher.phone}</span>}
                                                                            </div>
                                                                        </CommandItem>
                                                                    ))}
                                                                </CommandGroup>
                                                            </>
                                                        )}

                                                        {otherTeachers.length > 0 && (
                                                            <>
                                                                <CommandSeparator className="bg-slate-100 dark:bg-slate-800" />
                                                                <CommandGroup heading="Other Teachers (Substitute)" className="text-[11px] font-bold text-slate-400">
                                                                    {otherTeachers.map((teacher: any) => (
                                                                        <CommandItem
                                                                            key={teacher.id}
                                                                            value={`${teacher.firstName} ${teacher.lastName} ${teacher.phone || ""}`}
                                                                            onSelect={() => {
                                                                                form.setValue("teacherId", String(teacher.id));
                                                                                setOpenTeacherSelect(false);
                                                                            }}
                                                                            className="py-2"
                                                                        >
                                                                            <Check className={cn("mr-2 h-4 w-4 text-primary", String(field.value) === String(teacher.id) ? "opacity-100" : "opacity-0")} />
                                                                            <div className="flex flex-col gap-0.5">
                                                                                <span className="font-semibold text-[13px] text-slate-600 dark:text-slate-300">{teacher.firstName} {teacher.lastName}</span>
                                                                                {teacher.phone && <span className="text-[10px] font-medium text-slate-400">{teacher.phone}</span>}
                                                                            </div>
                                                                        </CommandItem>
                                                                    ))}
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
                        </div>

                        <FormField
                            control={form.control}
                            name="day"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-[13px] font-bold text-slate-700 dark:text-slate-300">Day <span className="text-red-500">*</span></FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value ? String(field.value) : undefined}>
                                        <FormControl>
                                            <SelectTrigger className="bg-white/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 shadow-sm focus:ring-primary/20 backdrop-blur-sm transition-colors hover:bg-white/80 dark:hover:bg-slate-900/80">
                                                <SelectValue placeholder="Select Day" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"].map((d) => (
                                                <SelectItem key={d} value={d} className="font-medium">{d}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage className="text-[11px]" />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-3 gap-5 bg-white/30 dark:bg-slate-900/30 p-4 rounded-2xl border border-white/40 dark:border-white/5 backdrop-blur-sm">
                            <FormField
                                control={form.control}
                                name="startTime"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-[12px] font-bold text-slate-600 dark:text-slate-400">Start Time</FormLabel>
                                        <FormControl>
                                            <Input type="time" className="bg-white/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 shadow-sm focus-visible:ring-primary/20 font-medium text-[13px] backdrop-blur-sm" {...field} />
                                        </FormControl>
                                        <FormMessage className="text-[11px]" />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="endTime"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-[12px] font-bold text-slate-600 dark:text-slate-400">End Time</FormLabel>
                                        <FormControl>
                                            <Input type="time" className="bg-white/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 shadow-sm focus-visible:ring-primary/20 font-medium text-[13px] backdrop-blur-sm" {...field} />
                                        </FormControl>
                                        <FormMessage className="text-[11px]" />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="roomNo"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-[12px] font-bold text-slate-600 dark:text-slate-400">Room No</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g. 101" className="bg-white/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 shadow-sm focus-visible:ring-primary/20 font-medium text-[13px] backdrop-blur-sm" {...field} value={field.value || ""} />
                                        </FormControl>
                                        <FormMessage className="text-[11px]" />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="flex justify-end gap-3 pt-4">
                            <Button type="button" variant="ghost" onClick={onClose} disabled={mutation.isPending} className="rounded-xl font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors bg-white/20 dark:bg-white/5 hover:bg-white/40 dark:hover:bg-white/10">
                                Cancel
                            </Button>
                            <Button type="submit" disabled={mutation.isPending} className="rounded-xl font-bold px-8 shadow-md shadow-primary/20 transition-all hover:shadow-lg hover:-translate-y-0.5">
                                {mutation.isPending ? "Saving..." : "Save Schedule"}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}