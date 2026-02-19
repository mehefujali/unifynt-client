/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2, Plus, Trash2, Save } from "lucide-react";

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

import api from "@/lib/axios";
import { planSchema, PlanFormValues } from "./schema";

interface PlanModalProps {
    isOpen: boolean;
    onClose: () => void;
    editingPlan?: any | null;
}

export function PlanModal({ isOpen, onClose, editingPlan }: PlanModalProps) {
    const queryClient = useQueryClient();

    const form = useForm<PlanFormValues>({
        resolver: zodResolver(planSchema) as any,
        defaultValues: {
            name: "",
            pricePerMonth: 0,
            studentLimit: 50,
            features: [{ value: "" }],
            extraOffers: "",
            isActive: true,
        }
    });

    const { register, control, handleSubmit, reset, setValue, watch, formState: { errors } } = form;

    const { fields, append, remove } = useFieldArray({
        control,
        name: "features",
    });

    useEffect(() => {
        if (editingPlan && isOpen) {
            reset({
                name: editingPlan.name || "",
                pricePerMonth: editingPlan.pricePerMonth || 0,
                studentLimit: editingPlan.studentLimit || 50,
                features: editingPlan.features?.length
                    ? editingPlan.features.map((f: string) => ({ value: f }))
                    : [{ value: "" }],
                extraOffers: editingPlan.extraOffers || "",
                isActive: editingPlan.isActive ?? true,
            });
        } else if (!editingPlan && isOpen) {
            reset({
                name: "",
                pricePerMonth: 0,
                studentLimit: 50,
                features: [{ value: "" }],
                extraOffers: "",
                isActive: true,
            });
        }
    }, [editingPlan, isOpen, reset]);

    const mutation = useMutation({
        mutationFn: async (data: PlanFormValues) => {
            const formattedData = {
                ...data,
                features: data.features.map(f => f.value),
            };
            if (editingPlan) {
                return await api.patch(`/plans/${editingPlan.id}`, formattedData);
            }
            return await api.post("/plans", formattedData);
        },
        onSuccess: () => {
            toast.success(editingPlan ? "Plan updated successfully" : "Plan created successfully");
            queryClient.invalidateQueries({ queryKey: ["plans"] });
            onClose();
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Failed to process plan");
        },
    });

    const onSubmit = (data: PlanFormValues) => {
        mutation.mutate(data);
    };

    return (
        <Sheet open={isOpen} onOpenChange={onClose}>
            <SheetContent className="sm:max-w-[600px] overflow-y-auto p-0 border-l-0 shadow-2xl flex flex-col h-full">
                <div className="p-8 pb-4 bg-muted/20 border-b shrink-0">
                    <SheetHeader>
                        <SheetTitle className="text-2xl font-extrabold tracking-tight text-primary">
                            {editingPlan ? "Edit Subscription Plan" : "Create New Plan"}
                        </SheetTitle>
                        <SheetDescription className="text-sm font-medium">
                            Configure pricing, limits, and features for this SaaS plan.
                        </SheetDescription>
                    </SheetHeader>
                </div>

                <div className="flex-1 overflow-y-auto p-8">
                    <form id="plan-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <div className="p-5 bg-background border rounded-xl shadow-sm space-y-4">
                            <div className="space-y-2">
                                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Plan Name <span className="text-red-500">*</span></Label>
                                <Input className="h-11 shadow-sm bg-muted/10" placeholder="e.g. Pro School" {...register("name")} />
                                {errors.name && <p className="text-xs font-semibold text-red-500">{errors.name.message}</p>}
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Price / Month ($) <span className="text-red-500">*</span></Label>
                                    <Input type="number" className="h-11 shadow-sm bg-muted/10" {...register("pricePerMonth")} />
                                    {errors.pricePerMonth && <p className="text-xs font-semibold text-red-500">{errors.pricePerMonth.message}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Student Limit <span className="text-red-500">*</span></Label>
                                    <Input type="number" className="h-11 shadow-sm bg-muted/10" {...register("studentLimit")} />
                                    {errors.studentLimit && <p className="text-xs font-semibold text-red-500">{errors.studentLimit.message}</p>}
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Extra Offers (Optional)</Label>
                                <Input className="h-11 shadow-sm bg-muted/10" placeholder="e.g. Free Domain Setup" {...register("extraOffers")} />
                            </div>

                            <div className="flex items-center justify-between p-4 border rounded-lg bg-muted/5">
                                <div className="space-y-0.5">
                                    <Label className="text-sm font-bold">Plan Status</Label>
                                    <p className="text-xs text-muted-foreground">Active plans are visible to schools.</p>
                                </div>
                                <Switch
                                    checked={watch("isActive")}
                                    onCheckedChange={(val) => setValue("isActive", val, { shouldDirty: true })}
                                />
                            </div>
                        </div>

                        <div className="p-5 bg-background border rounded-xl shadow-sm space-y-4">
                            <div className="flex items-center justify-between border-b pb-2">
                                <Label className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Plan Features</Label>
                                <Button type="button" variant="outline" size="sm" onClick={() => append({ value: "" })}>
                                    <Plus className="h-3 w-3 mr-1" /> Add Feature
                                </Button>
                            </div>
                            <div className="space-y-3">
                                {fields.map((field, index) => (
                                    <div key={field.id} className="flex items-start gap-3">
                                        <div className="flex-1 space-y-1">
                                            <Input className="h-10 shadow-sm bg-muted/10" placeholder="e.g. Unlimited Exams" {...register(`features.${index}.value` as const)} />
                                            {errors.features?.[index]?.value && <p className="text-xs font-semibold text-red-500">{errors.features[index]?.value?.message}</p>}
                                        </div>
                                        <Button type="button" variant="ghost" size="icon" className="h-10 w-10 text-destructive hover:bg-destructive/10 shrink-0" onClick={() => remove(index)} disabled={fields.length === 1}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </form>
                </div>

                <div className="p-6 border-t bg-background/90 backdrop-blur shrink-0 flex justify-between">
                    <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
                    <Button type="submit" form="plan-form" className="font-bold px-8" disabled={mutation.isPending}>
                        {mutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />} Save Plan
                    </Button>
                </div>
            </SheetContent>
        </Sheet>
    );
}