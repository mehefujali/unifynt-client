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
import { PlanColumn } from "./columns";

interface PlanModalProps {
    isOpen: boolean;
    onClose: () => void;
    editingPlan?: PlanColumn | null;
}

export function PlanModal({ isOpen, onClose, editingPlan }: PlanModalProps) {
    const queryClient = useQueryClient();

    const form = useForm<PlanFormValues>({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
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
        onError: (error: { response?: { data?: { message?: string } } }) => {
            toast.error(error.response?.data?.message || "Failed to process plan");
        },
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const onSubmit: any = (data: PlanFormValues) => {
        mutation.mutate(data);
    };

    return (
        <Sheet open={isOpen} onOpenChange={onClose}>
            <SheetContent className="w-full sm:max-w-[540px] flex flex-col h-full p-0">
                <SheetHeader className="p-6 border-b bg-muted/20">
                    <SheetTitle>{editingPlan ? "Edit Subscription Plan" : "Add Subscription Plan"}</SheetTitle>
                    <SheetDescription>
                        Configure plan details, pricing, and feature limits.
                    </SheetDescription>
                </SheetHeader>

                <div className="flex-1 overflow-y-auto p-6 space-y-8">
                    <form id="plan-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <div className="space-y-4">
                            <div className="grid gap-2">
                                <Label htmlFor="name" className="font-bold">Plan Name</Label>
                                <Input id="name" placeholder="e.g. Professional" {...register("name")} />
                                {errors.name && <p className="text-xs text-destructive font-medium">{errors.name.message}</p>}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2">
                                    <Label htmlFor="price" className="font-bold">Monthly Price ($)</Label>
                                    <Input id="price" type="number" {...register("pricePerMonth")} />
                                    {errors.pricePerMonth && <p className="text-xs text-destructive font-medium">{errors.pricePerMonth.message}</p>}
                                </div>
                                <div className="grid gap-2">
                                    <Label htmlFor="limit" className="font-bold">Student Limit</Label>
                                    <Input id="limit" type="number" {...register("studentLimit")} />
                                    {errors.studentLimit && <p className="text-xs text-destructive font-medium">{errors.studentLimit.message}</p>}
                                </div>
                            </div>

                            <div className="grid gap-2">
                                <Label htmlFor="extra" className="font-bold">Extra Offers (Optional)</Label>
                                <Input id="extra" placeholder="e.g. Priority Support" {...register("extraOffers")} />
                            </div>

                            <div className="flex items-center justify-between rounded-lg border p-4 bg-muted/10 shadow-sm">
                                <div className="space-y-0.5">
                                    <Label className="text-base font-bold">Active Status</Label>
                                    <div className="text-[13px] text-muted-foreground">
                                        Allow schools to subscribe to this plan.
                                    </div>
                                </div>
                                <Switch
                                    checked={watch("isActive")}
                                    onCheckedChange={(val) => setValue("isActive", val, { shouldDirty: true })}
                                />
                            </div>
                        </div>

                        <div className="space-y-4 pt-4 border-t">
                            <div className="flex items-center justify-between">
                                <Label className="text-sm font-bold uppercase tracking-wider text-muted-foreground">Features List</Label>
                                <Button type="button" variant="outline" size="sm" onClick={() => append({ value: "" })} className="h-8">
                                    <Plus className="h-4 w-4 mr-2" /> Add Feature
                                </Button>
                            </div>
                            <div className="space-y-3">
                                {fields.map((field, index) => (
                                    <div key={field.id} className="flex items-center gap-3">
                                        <div className="flex-1">
                                            <Input placeholder="Enter feature description..." {...register(`features.${index}.value` as const)} />
                                            {errors.features?.[index]?.value && <p className="text-xs text-destructive mt-1 font-medium">{errors.features[index]?.value?.message}</p>}
                                        </div>
                                        <Button type="button" variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-destructive" onClick={() => remove(index)} disabled={fields.length === 1}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </form>
                </div>

                <div className="p-6 border-t bg-muted/5 flex items-center justify-end gap-3">
                    <Button variant="outline" onClick={onClose} disabled={mutation.isPending}>
                        Cancel
                    </Button>
                    <Button type="submit" form="plan-form" disabled={mutation.isPending}>
                        {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        <Save className="mr-2 h-4 w-4" />
                        {editingPlan ? "Save Changes" : "Create Plan"}
                    </Button>
                </div>
            </SheetContent>
        </Sheet>
    );
}