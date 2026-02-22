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
            classId: defaultClassId || "",
            sectionId: defaultSectionId || "",
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
        queryFn: () => AcademicService.getAllSections(selectedClassId),
        enabled: isOpen && !!selectedClassId,
    });

    const { data: subjectsData } = useQuery({
        queryKey: ["subjects"],
        queryFn: () => SubjectService.getAllSubjects({ limit: 1000 }),
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

    const teachersList = teachersData?.data?.data || teachersData?.data || [];
    const filteredSubjects = subjectsData?.data?.filter((s: any) => s.classId === selectedClassId) || [];

    const recommendedTeachers = selectedSubjectId
        ? teachersList.filter((teacher: any) =>
            teacher.subjects?.some((sub: any) => sub.id === selectedSubjectId)
        )
        : [];

    const otherTeachers = selectedSubjectId
        ? teachersList.filter((teacher: any) =>
            !teacher.subjects?.some((sub: any) => sub.id === selectedSubjectId)
        )
        : teachersList;

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                reset({
                    classId: initialData.classId,
                    sectionId: initialData.sectionId,
                    subjectId: initialData.subjectId,
                    teacherId: initialData.teacherId || "none",
                    day: initialData.day,
                    startTime: initialData.startTime,
                    endTime: initialData.endTime,
                    roomNo: initialData.roomNo || "",
                });
            } else {
                reset({
                    classId: defaultClassId || "",
                    sectionId: defaultSectionId || "",
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
            toast.success(`Routine ${isEdit ? "updated" : "created"} successfully!`);
            queryClient.invalidateQueries({ queryKey: ["routines"] });
            onClose();
        },
        onError: (error: AxiosError<{ message: string }>) => {
            toast.error(error.response?.data?.message || "Failed to save routine");
        },
    });

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto p-0 gap-0">
                <DialogHeader className="p-6 pb-2">
                    <DialogTitle className="text-xl font-bold">{isEdit ? "Edit Schedule" : "Add New Schedule"}</DialogTitle>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit((data) => mutation.mutate(data))} className="p-6 pt-2 space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="classId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Class <span className="text-destructive">*</span></FormLabel>
                                        <Select onValueChange={(val) => { field.onChange(val); setValue("sectionId", ""); setValue("subjectId", ""); setValue("teacherId", "none"); }} value={field.value || undefined}>
                                            <FormControl><SelectTrigger className="bg-muted/30"><SelectValue placeholder="Select Class" /></SelectTrigger></FormControl>
                                            <SelectContent>
                                                {Array.isArray(classes) && classes.map((c: any) => (
                                                    <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="sectionId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Section <span className="text-destructive">*</span></FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value || undefined} disabled={!selectedClassId}>
                                            <FormControl><SelectTrigger className="bg-muted/30"><SelectValue placeholder="Select Section" /></SelectTrigger></FormControl>
                                            <SelectContent>
                                                {Array.isArray(sections) && sections.map((s: any) => (
                                                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="subjectId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Subject <span className="text-destructive">*</span></FormLabel>
                                        <Select onValueChange={(val) => { field.onChange(val); setValue("teacherId", "none"); }} value={field.value || undefined} disabled={!selectedClassId}>
                                            <FormControl><SelectTrigger className="bg-muted/30"><SelectValue placeholder="Select Subject" /></SelectTrigger></FormControl>
                                            <SelectContent>
                                                {filteredSubjects.map((s: any) => (
                                                    <SelectItem key={s.id} value={s.id}>{s.name} ({s.code})</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="teacherId"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                        <FormLabel className="mb-1">Teacher</FormLabel>
                                        <Popover open={openTeacherSelect} onOpenChange={setOpenTeacherSelect}>
                                            <PopoverTrigger asChild>
                                                <FormControl>
                                                    <Button
                                                        variant="outline"
                                                        role="combobox"
                                                        disabled={!selectedSubjectId}
                                                        className={cn(
                                                            "w-full justify-between bg-muted/30 text-left font-normal",
                                                            !field.value && "text-muted-foreground"
                                                        )}
                                                    >
                                                        {field.value === "none"
                                                            ? (!selectedSubjectId ? "Select Subject First" : "Self Study / Tiffin")
                                                            : (() => {
                                                                const t = teachersList.find((t: any) => t.id === field.value);
                                                                if (!t) return "Search Teacher...";
                                                                const isRec = t.subjects?.some((s: any) => s.id === selectedSubjectId);
                                                                return (
                                                                    <div className="flex items-center gap-2">
                                                                        <span className="truncate">{t.firstName} {t.lastName}</span>
                                                                        {!isRec && <Badge variant="secondary" className="h-4 text-[9px] px-1 bg-orange-100 text-orange-700 hover:bg-orange-200 border-orange-200 uppercase tracking-wider">Substitute</Badge>}
                                                                    </div>
                                                                );
                                                            })()
                                                        }
                                                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                                                    </Button>
                                                </FormControl>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
                                                <Command>
                                                    <CommandInput placeholder="Search teacher..." className="h-9" />
                                                    <CommandList>
                                                        <CommandEmpty>No teacher found.</CommandEmpty>

                                                        <CommandGroup heading="System Options">
                                                            <CommandItem
                                                                value="none"
                                                                onSelect={() => {
                                                                    form.setValue("teacherId", "none");
                                                                    setOpenTeacherSelect(false);
                                                                }}
                                                            >
                                                                <Check className={cn("mr-2 h-4 w-4", field.value === "none" ? "opacity-100" : "opacity-0")} />
                                                                Self Study / Tiffin
                                                            </CommandItem>
                                                        </CommandGroup>

                                                        {recommendedTeachers.length > 0 && (
                                                            <>
                                                                <CommandSeparator />
                                                                <CommandGroup heading="Recommended (Subject Teachers)">
                                                                    {recommendedTeachers.map((teacher: any) => (
                                                                        <CommandItem
                                                                            key={teacher.id}
                                                                            value={`${teacher.firstName} ${teacher.lastName} ${teacher.phone || ""}`}
                                                                            onSelect={() => {
                                                                                form.setValue("teacherId", teacher.id);
                                                                                setOpenTeacherSelect(false);
                                                                            }}
                                                                        >
                                                                            <Check className={cn("mr-2 h-4 w-4", field.value === teacher.id ? "opacity-100 text-primary" : "opacity-0")} />
                                                                            <div className="flex flex-col">
                                                                                <span className="font-semibold">{teacher.firstName} {teacher.lastName}</span>
                                                                                {teacher.phone && <span className="text-[10px] text-muted-foreground">{teacher.phone}</span>}
                                                                            </div>
                                                                        </CommandItem>
                                                                    ))}
                                                                </CommandGroup>
                                                            </>
                                                        )}

                                                        {otherTeachers.length > 0 && (
                                                            <>
                                                                <CommandSeparator />
                                                                <CommandGroup heading="Other Teachers (Substitute)">
                                                                    {otherTeachers.map((teacher: any) => (
                                                                        <CommandItem
                                                                            key={teacher.id}
                                                                            value={`${teacher.firstName} ${teacher.lastName} ${teacher.phone || ""}`}
                                                                            onSelect={() => {
                                                                                form.setValue("teacherId", teacher.id);
                                                                                setOpenTeacherSelect(false);
                                                                            }}
                                                                        >
                                                                            <Check className={cn("mr-2 h-4 w-4", field.value === teacher.id ? "opacity-100 text-primary" : "opacity-0")} />
                                                                            <div className="flex flex-col">
                                                                                <span className="text-muted-foreground font-medium">{teacher.firstName} {teacher.lastName}</span>
                                                                                {teacher.phone && <span className="text-[10px] text-muted-foreground/70">{teacher.phone}</span>}
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
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="day"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Day <span className="text-destructive">*</span></FormLabel>
                                    <Select onValueChange={field.onChange} value={field.value || undefined}>
                                        <FormControl><SelectTrigger className="bg-muted/30"><SelectValue placeholder="Select Day" /></SelectTrigger></FormControl>
                                        <SelectContent>
                                            {["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"].map((d) => (
                                                <SelectItem key={d} value={d}>{d}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-3 gap-4">
                            <FormField
                                control={form.control}
                                name="startTime"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Start Time</FormLabel>
                                        <FormControl><Input type="time" className="bg-muted/30" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="endTime"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>End Time</FormLabel>
                                        <FormControl><Input type="time" className="bg-muted/30" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="roomNo"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Room No</FormLabel>
                                        <FormControl><Input placeholder="e.g. 101" className="bg-muted/30" {...field} value={field.value || ""} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="flex justify-end gap-3 pt-6 border-t">
                            <Button type="button" variant="ghost" onClick={onClose} disabled={mutation.isPending}>Cancel</Button>
                            <Button type="submit" disabled={mutation.isPending} className="px-8">{mutation.isPending ? "Saving..." : "Save Routine"}</Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}