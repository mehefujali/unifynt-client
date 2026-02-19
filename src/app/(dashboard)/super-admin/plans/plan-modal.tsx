/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { PlanService } from "@/services/plan.service";
import { planSchema, PlanFormValues } from "./schema";

interface PlanModalProps {
    isOpen: boolean;
    onClose: () => void;
    editingPlan: any | null;
}

export function PlanModal({ isOpen, onClose, editingPlan }: PlanModalProps) {
    const queryClient = useQueryClient();

    const form = useForm<PlanFormValues>({
        resolver: zodResolver(planSchema),
        defaultValues: {
            name: "",
            pricePerMonth: 0,
            studentLimit: 50,
            features: [{ value: "" }],
            extraOffers: "",
            isActive: true,
        },
    });

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "features",
    });

    useEffect(() => {
        if (editingPlan && isOpen) {
            form.reset({
                name: editingPlan.name,
                pricePerMonth: editingPlan.pricePerMonth,
                studentLimit: editingPlan.studentLimit,
                features: editingPlan.features.map((f: string) => ({ value: f })),
                extraOffers: editingPlan.extraOffers || "",
                isActive: editingPlan.isActive,
            });
        } else if (!isOpen) {
            form.reset({
                name: "",
                pricePerMonth: 0,
                studentLimit: 50,
                features: [{ value: "" }],
                extraOffers: "",
                isActive: true,
            });
        }
    }, [editingPlan, isOpen, form]);

    const mutation = useMutation({
        mutationFn: (data: any) => {
            const payload = {
                ...data,
                features: data.features.map((f: any) => f.value),
            };
            if (editingPlan) {
                return PlanService.updatePlan(editingPlan.id, payload);
            }
            return PlanService.createPlan(payload);
        },
        onSuccess: () => {
            toast.success(`Plan ${editingPlan ? "updated" : "created"} successfully`);
            queryClient.invalidateQueries({ queryKey: ["plans"] });
            onClose();
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Something went wrong");
        },
    });

    const onSubmit = (data: PlanFormValues) => {
        mutation.mutate(data);
    };

    return (
        <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <SheetContent className="sm:max-w-[600px] overflow-y-auto bg-slate-50 dark:bg-slate-950 p-0 flex flex-col h-full">
                <div className="p-6 border-b bg-background shadow-sm z-10 sticky top-0">
                    <SheetHeader>
                        <SheetTitle className="text-2xl font-bold">
                            {editingPlan ? "Edit Subscription Plan" : "Create New Plan"}
                        </SheetTitle>
                    </SheetHeader>
                </div>

                <div className="flex-1 p-6">
                    <form id="plan-form" onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <div className="p-5 bg-background border rounded-xl shadow-sm space-y-4">
                            <div className="space-y-2">
                                <Label>Plan Name <span className="text-red-500">*</span></Label>
                                <Input className="h-11" placeholder="e.g. Pro School" {...form.register("name")} />
                                {form.formState.errors.name && <p className="text-sm text-red-500">{form.formState.errors.name.message}</p>}
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Price Per Month (₹) <span className="text-red-500">*</span></Label>
                                    <Input type="number" className="h-11" {...form.register("pricePerMonth", { valueAsNumber: true })} />
                                    {form.formState.errors.pricePerMonth && <p className="text-sm text-red-500">{form.formState.errors.pricePerMonth.message}</p>}
                                </div>
                                <div className="space-y-2">
                                    <Label>Max Student Limit <span className="text-red-500">*</span></Label>
                                    <Input type="number" className="h-11" {...form.register("studentLimit", { valueAsNumber: true })} />
                                    {form.formState.errors.studentLimit && <p className="text-sm text-red-500">{form.formState.errors.studentLimit.message}</p>}
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label>Extra Promotional Offers</Label>
                                <Input className="h-11" placeholder="e.g. Free 500 SMS/month" {...form.register("extraOffers")} />
                            </div>
                        </div>

                        <div className="p-5 bg-background border rounded-xl shadow-sm space-y-4">
                            <div className="flex items-center justify-between">
                                <Label className="text-base font-semibold">Included Features</Label>
                                <Button type="button" variant="outline" size="sm" onClick={() => append({ value: "" })}>
                                    <Plus className="h-4 w-4 mr-1" /> Add Feature
                                </Button>
                            </div>
                            {form.formState.errors.features && <p className="text-sm text-red-500">{form.formState.errors.features.message}</p>}
                            <div className="space-y-3">
                                {fields.map((field, index) => (
                                    <div key={field.id} className="flex items-center gap-2">
                                        <div className="flex-1">
                                            <Input className="h-11" placeholder={`Feature ${index + 1}`} {...form.register(`features.${index}.value`)} />
                                            {form.formState.errors.features?.[index]?.value && (
                                                <p className="text-xs text-red-500 mt-1">{form.formState.errors.features[index]?.value?.message}</p>
                                            )}
                                        </div>
                                        <Button type="button" variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10" onClick={() => remove(index)}>
                                            <Trash2 className="h-5 w-5" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="p-5 bg-background border rounded-xl shadow-sm flex items-center justify-between">
                            <div className="space-y-1">
                                <Label className="text-base font-semibold">Active Status</Label>
                                <p className="text-sm text-muted-foreground">Make this plan visible to schools for renewal.</p>
                            </div>
                            <Switch checked={form.watch("isActive")} onCheckedChange={(val) => form.setValue("isActive", val)} className="scale-110 mr-2" />
                        </div>
                    </form>
                </div>

                <div className="p-6 border-t bg-background shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)] z-10 sticky bottom-0 flex justify-end">
                    <Button form="plan-form" type="submit" size="lg" className="w-full md:w-auto px-8 shadow-lg text-md h-12" disabled={mutation.isPending}>
                        {mutation.isPending && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                        {editingPlan ? "Update Plan" : "Create Plan"}
                    </Button>
                </div>
            </SheetContent>
        </Sheet>
    );
}