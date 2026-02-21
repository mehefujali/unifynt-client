/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2, PlayCircle, PlusCircle, Trash2, Settings2 } from "lucide-react";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { PayrollService } from "@/services/payroll.service";
import { generateSalarySchema, GenerateSalaryFormValues } from "./schema";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function GenerateSalaryModal() {
    const [open, setOpen] = useState(false);
    const queryClient = useQueryClient();

    const form = useForm<GenerateSalaryFormValues>({
        resolver: zodResolver(generateSalarySchema) as any,
        defaultValues: {
            month: new Date().getMonth() + 1,
            year: new Date().getFullYear(),
            allowances: [],
            deductions: [],
        },
    });

    const { register, control, handleSubmit, reset, formState: { errors } } = form;

    const { fields: allowanceFields, append: addAllowance, remove: removeAllowance } = useFieldArray({
        control,
        name: "allowances"
    });

    const { fields: deductionFields, append: addDeduction, remove: removeDeduction } = useFieldArray({
        control,
        name: "deductions"
    });

    const mutation = useMutation({
        mutationFn: PayrollService.generateBulkSalary,
        onSuccess: (data: any) => {
            toast.success(data.message || "Salaries generated successfully!");
            queryClient.invalidateQueries({ queryKey: ["payroll"] });
            reset();
            setOpen(false);
        },
        onError: (error: any) => toast.error(error.response?.data?.message || "Failed to generate salaries"),
    });

    const onSubmit = (data: GenerateSalaryFormValues) => mutation.mutate(data);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button className="font-bold shadow-md h-11"><PlayCircle className="mr-2 h-4 w-4" /> Run Payroll</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[650px] p-0 overflow-hidden bg-background">
                <div className="p-6 bg-muted/20 border-b">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-extrabold text-primary">Generate Bulk Salary</DialogTitle>
                        <DialogDescription>Run payroll for all active teachers. Double payments are automatically prevented.</DialogDescription>
                    </DialogHeader>
                </div>

                <form onSubmit={handleSubmit(onSubmit)}>
                    <ScrollArea className="max-h-[60vh] p-6">
                        <div className="space-y-8">
                            {/* Month & Year Selection */}
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label className="font-bold">Month</Label>
                                    <select
                                        className={`flex h-11 w-full rounded-md border bg-background px-3 py-2 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring ${errors.month ? 'border-red-500' : 'border-input'}`}
                                        {...register("month", { valueAsNumber: true })}
                                    >
                                        {MONTHS.map((m, i) => <option key={m} value={i + 1}>{m}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <Label className="font-bold">Year</Label>
                                    <Input
                                        type="number"
                                        className={`h-11 shadow-sm ${errors.year ? 'border-red-500' : ''}`}
                                        {...register("year", { valueAsNumber: true })}
                                    />
                                </div>
                            </div>

                            {/* Global Allowances */}
                            <div className="p-5 bg-primary/5 border border-primary/20 rounded-xl space-y-4">
                                <div className="flex items-center justify-between">
                                    <Label className="font-bold text-primary flex items-center gap-2">
                                        Global Allowances
                                        <span className="text-xs font-normal text-muted-foreground hidden sm:inline">(e.g., Bonus, HRA)</span>
                                    </Label>
                                    <Button type="button" variant="outline" size="sm" onClick={() => addAllowance({ name: "", amount: 0 })} className="h-8 bg-background">
                                        <PlusCircle className="h-4 w-4 mr-1" /> Add Allowance
                                    </Button>
                                </div>
                                {allowanceFields.map((field, index) => (
                                    <div key={field.id} className="flex gap-3 items-start animate-in fade-in zoom-in-95 duration-200">
                                        <div className="flex-1">
                                            <Input
                                                placeholder="Allowance Name"
                                                className="bg-background shadow-sm"
                                                {...register(`allowances.${index}.name` as const)}
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <Input
                                                type="number"
                                                placeholder="Amount (₹)"
                                                className="bg-background shadow-sm"
                                                {...register(`allowances.${index}.amount` as const, { valueAsNumber: true })}
                                            />
                                        </div>
                                        <Button type="button" variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10 shrink-0" onClick={() => removeAllowance(index)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                                {allowanceFields.length === 0 && <p className="text-sm text-muted-foreground italic text-center py-2">No allowances added.</p>}
                            </div>

                            {/* Global Deductions */}
                            <div className="p-5 bg-destructive/5 border border-destructive/20 rounded-xl space-y-4">
                                <div className="flex items-center justify-between">
                                    <Label className="font-bold text-destructive flex items-center gap-2">
                                        Global Deductions
                                        <span className="text-xs font-normal text-muted-foreground hidden sm:inline">(e.g., Tax, Unpaid Leave)</span>
                                    </Label>
                                    <Button type="button" variant="outline" size="sm" onClick={() => addDeduction({ name: "", amount: 0 })} className="h-8 bg-background">
                                        <PlusCircle className="h-4 w-4 mr-1" /> Add Deduction
                                    </Button>
                                </div>
                                {deductionFields.map((field, index) => (
                                    <div key={field.id} className="flex gap-3 items-start animate-in fade-in zoom-in-95 duration-200">
                                        <div className="flex-1">
                                            <Input
                                                placeholder="Deduction Name"
                                                className="bg-background shadow-sm"
                                                {...register(`deductions.${index}.name` as const)}
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <Input
                                                type="number"
                                                placeholder="Amount (₹)"
                                                className="bg-background shadow-sm"
                                                {...register(`deductions.${index}.amount` as const, { valueAsNumber: true })}
                                            />
                                        </div>
                                        <Button type="button" variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10 shrink-0" onClick={() => removeDeduction(index)}>
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                ))}
                                {deductionFields.length === 0 && <p className="text-sm text-muted-foreground italic text-center py-2">No deductions added.</p>}
                            </div>

                            <div className="p-4 bg-muted/50 rounded-lg flex items-start gap-3 text-sm text-muted-foreground border">
                                <Settings2 className="h-5 w-5 shrink-0 text-primary" />
                                <p>This will calculate <strong className="text-foreground">(Basic Salary + Total Allowances) - Total Deductions</strong> for all eligible teachers. Double calculation is protected by the server.</p>
                            </div>
                        </div>
                    </ScrollArea>

                    <div className="p-6 border-t bg-muted/10 flex justify-end gap-3 shrink-0">
                        <Button type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                        <Button type="submit" className="font-bold px-8" disabled={mutation.isPending}>
                            {mutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Run Payroll Generator"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}