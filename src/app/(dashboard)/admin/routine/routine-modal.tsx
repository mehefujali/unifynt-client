/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AxiosError } from "axios";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
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

    // ✅ FIX 1: Safely extract arrays from API responses
    const teachersList = Array.isArray(teachersData?.data?.data)
        ? teachersData.data.data
        : Array.isArray(teachersData?.data)
            ? teachersData.data
            : Array.isArray(teachersData)
                ? teachersData
                : [];

    const filteredSubjects = subjectsData?.data?.filter((s: any) => s.classId === selectedClassId) || [];

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
            <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{isEdit ? "Edit Routine" : "Add New Routine"}</DialogTitle>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit((data) => mutation.mutate(data))} className="space-y-4 mt-2">
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="classId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Class <span className="text-destructive">*</span></FormLabel>
                                        {/* ✅ FIX 2: Added `|| undefined` to prevent empty string error in Shadcn */}
                                        <Select onValueChange={(val) => { field.onChange(val); setValue("sectionId", ""); setValue("subjectId", ""); }} value={field.value || undefined}>
                                            <FormControl><SelectTrigger><SelectValue placeholder="Select Class" /></SelectTrigger></FormControl>
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
                                            <FormControl><SelectTrigger><SelectValue placeholder="Select Section" /></SelectTrigger></FormControl>
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
                                        <Select onValueChange={field.onChange} value={field.value || undefined} disabled={!selectedClassId}>
                                            <FormControl><SelectTrigger><SelectValue placeholder="Select Subject" /></SelectTrigger></FormControl>
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
                                    <FormItem>
                                        <FormLabel>Teacher <span className="text-muted-foreground font-normal text-xs">(Optional)</span></FormLabel>
                                        {/* ✅ FIX 3: Handling Nullable TS error with `|| "none"` */}
                                        <Select onValueChange={field.onChange} value={field.value || "none"}>
                                            <FormControl><SelectTrigger><SelectValue placeholder="Select Teacher" /></SelectTrigger></FormControl>
                                            <SelectContent>
                                                <SelectItem value="none">None (Self Study / Tiffin)</SelectItem>
                                                {teachersList.map((t: any) => (
                                                    <SelectItem key={t.id} value={t.id}>{t.firstName} {t.lastName}</SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
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
                                        <FormControl><SelectTrigger><SelectValue placeholder="Select Day" /></SelectTrigger></FormControl>
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
                                        <FormLabel>Start Time <span className="text-destructive">*</span></FormLabel>
                                        <FormControl><Input type="time" {...field} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="endTime"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>End Time <span className="text-destructive">*</span></FormLabel>
                                        <FormControl><Input type="time" {...field} /></FormControl>
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
                                        <FormControl><Input placeholder="e.g. 101" {...field} value={field.value || ""} /></FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t mt-6">
                            <Button type="button" variant="ghost" onClick={onClose} disabled={mutation.isPending}>Cancel</Button>
                            <Button type="submit" disabled={mutation.isPending}>{mutation.isPending ? "Saving..." : "Save Routine"}</Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}