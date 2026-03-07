/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2, PlusCircle, MinusCircle, CheckCircle } from "lucide-react";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PayrollService } from "@/services/payroll.service";
import { addAdjustmentSchema, AddAdjustmentFormValues } from "./schema";

export function AddAdjustmentModal({ slip, open, onClose }: { slip: any, open: boolean, onClose: () => void }) {
    const queryClient = useQueryClient();
    const employee = slip?.teacher || slip?.staff;

    const form = useForm<AddAdjustmentFormValues>({
        resolver: zodResolver(addAdjustmentSchema),
        defaultValues: { type: "ALLOWANCE", title: "", amount: 0 },
    });

    useEffect(() => {
        if (!open) form.reset();
    }, [open, form]);

    const mutation = useMutation({
        mutationFn: (data: AddAdjustmentFormValues) => 
            PayrollService.addAdjustment({ slipIds: [slip.id], ...data }),
        onSuccess: () => {
            toast.success("Adjustment added successfully!");
            queryClient.invalidateQueries({ queryKey: ["payroll"] });
            onClose();
        },
        onError: (error: any) => toast.error(error.response?.data?.message || "Failed to add adjustment"),
    });

    const onSubmit = (data: AddAdjustmentFormValues) => mutation.mutate(data);

    if (!slip) return null;

    return (
        <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
            <DialogContent className="sm:max-w-[450px]">
                <DialogHeader>
                    <DialogTitle className="text-xl font-extrabold text-primary flex items-center gap-2">
                        Adjust Salary
                    </DialogTitle>
                    <DialogDescription>
                        Add a bonus or deduction for <span className="font-bold text-foreground">{employee?.firstName} {employee?.lastName}</span>.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 py-4">
                    <div className="space-y-2">
                        <Label className="font-bold">Adjustment Type</Label>
                        <Select 
                            onValueChange={(val) => form.setValue("type", val as any)} 
                            defaultValue={form.getValues("type")}
                        >
                            <SelectTrigger className="h-11 shadow-sm">
                                <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="ALLOWANCE">
                                    <div className="flex items-center text-emerald-600 font-medium">
                                        <PlusCircle className="mr-2 h-4 w-4" /> Allowance (Bonus / Overtime)
                                    </div>
                                </SelectItem>
                                <SelectItem value="DEDUCTION">
                                    <div className="flex items-center text-destructive font-medium">
                                        <MinusCircle className="mr-2 h-4 w-4" /> Deduction (Fine / Unpaid Leave)
                                    </div>
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label className="font-bold">Title / Reason</Label>
                        <Input
                            placeholder="e.g.  Bonus, Late Fine..."
                            className="h-11 shadow-sm"
                            {...form.register("title")}
                        />
                        {form.formState.errors.title && <p className="text-sm text-destructive">{form.formState.errors.title.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <Label className="font-bold">Amount (₹)</Label>
                        <Input
                            type="number"
                            placeholder="Enter amount"
                            className="h-11 shadow-sm"
                            {...form.register("amount")}
                        />
                        {form.formState.errors.amount && <p className="text-sm text-destructive">{form.formState.errors.amount.message}</p>}
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t mt-2">
                        <Button type="button" variant="outline" onClick={onClose} disabled={mutation.isPending}>Cancel</Button>
                        <Button type="submit" disabled={mutation.isPending} className="font-bold px-6">
                            {mutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <CheckCircle className="mr-2 h-4 w-4" />}
                            Apply Adjustment
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}