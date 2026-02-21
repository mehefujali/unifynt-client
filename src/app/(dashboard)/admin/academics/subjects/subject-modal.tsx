"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AxiosError } from "axios";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SubjectService } from "@/services/subject.service";
import { AcademicService } from "@/services/academic.service";
import { subjectSchema, SubjectFormValues } from "./schema";

export interface ISubject {
    id: string;
    name: string;
    code: string;
    classId: string;
    bookName?: string | null;
    type: "THEORY" | "PRACTICAL" | "OPTIONAL" | "LAB";
    credit: number | null;
}

interface SubjectModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialData?: ISubject | null;
}

export function SubjectModal({ isOpen, onClose, initialData }: SubjectModalProps) {
    const queryClient = useQueryClient();
    const isEdit = !!initialData;

    const { data: classData, isLoading: isClassesLoading } = useQuery({
        queryKey: ["classes"],
        queryFn: () => AcademicService.getAllClasses(),
        enabled: isOpen,
    });

    const form = useForm<SubjectFormValues>({
        resolver: zodResolver(subjectSchema),
        defaultValues: {
            name: "",
            code: "",
            classId: "",
            bookName: "",
            type: "THEORY",
            credit: 0,
        },
    });

    const { reset } = form;

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                reset({
                    name: initialData.name,
                    code: initialData.code,
                    classId: initialData.classId || "",
                    bookName: initialData.bookName || "",
                    type: initialData.type,
                    credit: initialData.credit || 0,
                });
            } else {
                reset({
                    name: "",
                    code: "",
                    classId: "",
                    bookName: "",
                    type: "THEORY",
                    credit: 0,
                });
            }
        }
    }, [initialData, reset, isOpen]);

    const mutation = useMutation({
        mutationFn: (data: SubjectFormValues) => {

            if (isEdit && initialData?.id) {
                return SubjectService.updateSubject(initialData.id, data);
            }
            return SubjectService.createSubject(data);
        },
        onSuccess: () => {
            toast.success(`Subject ${isEdit ? "updated" : "created"} successfully!`);
            queryClient.invalidateQueries({ queryKey: ["subjects"] });
            onClose();
        },
        onError: (error: AxiosError<{ message: string }>) => {
            toast.error(error.response?.data?.message || "Something went wrong!");
        },
    });

    const onSubmit = (data: SubjectFormValues) => {
        mutation.mutate(data);
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[550px]">
                <DialogHeader>
                    <DialogTitle>{isEdit ? "Edit Subject" : "Add New Subject"}</DialogTitle>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-2">
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Subject Name <span className="text-destructive">*</span></FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g. Mathematics" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="classId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Assign to Class <span className="text-destructive">*</span></FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value} disabled={isClassesLoading}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder={isClassesLoading ? "Loading..." : "Select class"} />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {Array.isArray(classData) && classData.map((c: { id: string; name: string }) => (
                                                    <SelectItem key={c.id} value={c.id}>
                                                        {c.name}
                                                    </SelectItem>
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
                                name="code"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Subject Code <span className="text-destructive">*</span></FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g. MATH101" className="uppercase" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="type"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Subject Type</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select type" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="THEORY">Theory</SelectItem>
                                                <SelectItem value="PRACTICAL">Practical</SelectItem>
                                                <SelectItem value="OPTIONAL">Optional</SelectItem>
                                                <SelectItem value="LAB">Lab</SelectItem>
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
                                name="bookName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Book Name / Author</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g. RS Aggarwal" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="credit"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Credit Point</FormLabel>
                                        <FormControl>
                                            <Input
                                                type="number"
                                                placeholder="0"
                                                {...field}
                                                onChange={(e) => field.onChange(e.target.value === "" ? 0 : Number(e.target.value))}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="flex justify-end gap-3 pt-4 border-t mt-6">
                            <Button type="button" variant="ghost" onClick={onClose} disabled={mutation.isPending}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={mutation.isPending}>
                                {mutation.isPending ? "Saving..." : "Save Subject"}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}