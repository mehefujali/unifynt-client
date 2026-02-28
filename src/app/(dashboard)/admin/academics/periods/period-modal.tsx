/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AxiosError } from "axios";
import { Clock } from "lucide-react";

import { cn } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

import { PeriodService } from "@/services/period.service";
import { periodSchema, PeriodFormValues } from "./schema";

const DAYS = ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"];

interface PeriodModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialData?: any | null;
}

export function PeriodModal({ isOpen, onClose, initialData }: PeriodModalProps) {
    const queryClient = useQueryClient();
    const isEdit = !!initialData;

    const form = useForm<PeriodFormValues>({
        resolver: zodResolver(periodSchema),
        defaultValues: {
            name: "",
            startTime: "",
            endTime: "",
            type: "CLASS",
            days: ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"],
        },
    });

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                form.reset({
                    name: initialData.name,
                    startTime: initialData.startTime,
                    endTime: initialData.endTime,
                    type: initialData.type,
                    days: initialData.days || [],
                });
            } else {
                form.reset({
                    name: "",
                    startTime: "",
                    endTime: "",
                    type: "CLASS",
                    days: ["MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY"],
                });
            }
        }
    }, [initialData, form, isOpen]);

    const mutation = useMutation({
        mutationFn: (data: PeriodFormValues) => {
            if (isEdit && initialData?.id) {
                return PeriodService.updatePeriod(initialData.id, data);
            }
            return PeriodService.createPeriod(data);
        },
        onSuccess: () => {
            toast.success(`Period ${isEdit ? "updated" : "created"} successfully!`);
            queryClient.invalidateQueries({ queryKey: ["periods"] });
            onClose();
        },
        onError: (error: AxiosError<{ message: string }>) => {
            toast.error(error.response?.data?.message || "Failed to save period");
        },
    });

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[500px] border-white/20 dark:border-white/10 shadow-2xl bg-white/80 dark:bg-slate-950/80 backdrop-blur-2xl rounded-[24px]">
                <DialogHeader className="pb-4 border-b border-black/5 dark:border-white/5">
                    <DialogTitle className="text-[18px] font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
                            <Clock className="h-4 w-4" />
                        </div>
                        {isEdit ? "Edit Time Slot" : "Create New Time Slot"}
                    </DialogTitle>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit((data) => mutation.mutate(data))} className="space-y-6 pt-4">
                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-[13px] font-bold text-slate-700 dark:text-slate-300">Period Name <span className="text-red-500">*</span></FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g. 1st Period, Break" className="bg-white/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 shadow-sm focus-visible:ring-primary/20 h-10 rounded-xl font-medium" {...field} />
                                    </FormControl>
                                    <FormMessage className="text-[11px]" />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="type"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-[13px] font-bold text-slate-700 dark:text-slate-300">Type <span className="text-red-500">*</span></FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger className="bg-white/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 shadow-sm focus:ring-primary/20 h-10 rounded-xl font-medium">
                                                    <SelectValue placeholder="Select Type" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent className="rounded-xl">
                                                <SelectItem value="CLASS" className="font-bold text-primary">Class</SelectItem>
                                                <SelectItem value="BREAK" className="font-bold text-orange-600">Break / Tiffin</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage className="text-[11px]" />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4 bg-white/30 dark:bg-slate-900/30 p-4 rounded-2xl border border-black/5 dark:border-white/5 shadow-sm">
                            <FormField
                                control={form.control}
                                name="startTime"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="text-[12px] font-bold text-slate-600 dark:text-slate-400">Start Time <span className="text-red-500">*</span></FormLabel>
                                        <FormControl>
                                            <Input type="time" className="bg-white/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 shadow-sm focus-visible:ring-primary/20 font-medium text-[13px] rounded-lg" {...field} />
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
                                        <FormLabel className="text-[12px] font-bold text-slate-600 dark:text-slate-400">End Time <span className="text-red-500">*</span></FormLabel>
                                        <FormControl>
                                            <Input type="time" className="bg-white/50 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 shadow-sm focus-visible:ring-primary/20 font-medium text-[13px] rounded-lg" {...field} />
                                        </FormControl>
                                        <FormMessage className="text-[11px]" />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="days"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="text-[13px] font-bold text-slate-700 dark:text-slate-300">Applicable Days <span className="text-red-500">*</span></FormLabel>
                                    <div className="flex flex-wrap gap-2 mt-1.5">
                                        {DAYS.map((day) => {
                                            const isSelected = field.value.includes(day);
                                            return (
                                                <Badge
                                                    key={day}
                                                    variant={isSelected ? "default" : "outline"}
                                                    className={cn(
                                                        "cursor-pointer px-3 py-1.5 rounded-lg text-[10px] font-bold tracking-widest uppercase transition-all",
                                                        isSelected ? "shadow-md shadow-primary/20" : "hover:bg-black/5 dark:hover:bg-white/5"
                                                    )}
                                                    onClick={() => {
                                                        const newValue = isSelected
                                                            ? field.value.filter((d) => d !== day)
                                                            : [...field.value, day];
                                                        field.onChange(newValue);
                                                    }}
                                                >
                                                    {day.slice(0, 3)}
                                                </Badge>
                                            );
                                        })}
                                    </div>
                                    <FormMessage className="text-[11px]" />
                                </FormItem>
                            )}
                        />

                        <div className="flex justify-end gap-3 pt-4 border-t border-black/5 dark:border-white/5">
                            <Button type="button" variant="ghost" onClick={onClose} disabled={mutation.isPending} className="rounded-xl font-bold text-slate-500 hover:text-slate-900 dark:hover:text-white transition-colors bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10">
                                Cancel
                            </Button>
                            <Button type="submit" disabled={mutation.isPending} className="rounded-xl font-bold px-8 shadow-md shadow-primary/20 transition-all hover:shadow-lg hover:-translate-y-0.5">
                                {mutation.isPending ? "Saving..." : "Save Slot"}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}