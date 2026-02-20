"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod/v3";
import { Loader2, Send, Package, ReceiptText } from "lucide-react";
import { toast } from "sonner";
import { useQuery, useQueryClient } from "@tanstack/react-query";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SmsService, SmsPackage } from "@/services/sms.service";

// We don't need schoolId in schema since we pass it directly as a prop
const assignSchema = z.object({
    packageId: z.string().min(1, "Please select an SMS package"),
    referenceId: z.string().optional(),
});

type AssignFormValues = z.infer<typeof assignSchema>;

interface AssignSmsModalProps {
    isOpen: boolean;
    onClose: () => void;
    schoolId: string;
    schoolName: string;
}

export function AssignSmsModal({ isOpen, onClose, schoolId, schoolName }: AssignSmsModalProps) {
    const queryClient = useQueryClient();
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

    // Fetch active SMS packages
    const { data: packages = [], isLoading: isPackagesLoading } = useQuery<SmsPackage[]>({
        queryKey: ["active-sms-packages"],
        queryFn: async () => {
            const allPackages = await SmsService.getPackages();
            return allPackages.filter((p) => p.isActive);
        },
        enabled: isOpen,
    });

    const form = useForm<AssignFormValues>({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        resolver: zodResolver(assignSchema) as any,
        defaultValues: { packageId: "", referenceId: "" },
    });

    const onSubmit = async (values: AssignFormValues) => {
        setIsSubmitting(true);
        try {
            // Pass the schoolId from props along with form values
            await SmsService.assignPackageToSchool({
                schoolId,
                packageId: values.packageId,
                referenceId: values.referenceId,
            });

            toast.success(`SMS Package successfully assigned to ${schoolName}!`);
            // Invalidate relevant queries to update UI
            queryClient.invalidateQueries({ queryKey: ["schools"] });
            queryClient.invalidateQueries({ queryKey: ["sms-stats", schoolId] });

            form.reset();
            onClose();
        } catch (error: unknown) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const err = error as any;
            toast.error(err.response?.data?.message || "Failed to assign package.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[450px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl font-bold">
                        <Send className="h-5 w-5 text-primary" /> Assign SMS Package
                    </DialogTitle>
                    <DialogDescription>
                        Adding SMS credits for <strong className="text-foreground">{schoolName}</strong>
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 pt-2">

                        {/* Package Selection */}
                        <FormField control={form.control} name="packageId" render={({ field }) => (
                            <FormItem>
                                <FormLabel className="font-bold flex items-center gap-1">
                                    <Package className="h-4 w-4 text-amber-500" /> Select SMS Package
                                </FormLabel>
                                <Select onValueChange={field.onChange} value={field.value} disabled={isPackagesLoading}>
                                    <FormControl>
                                        <SelectTrigger className="h-11 shadow-sm">
                                            <SelectValue placeholder={isPackagesLoading ? "Loading packages..." : "Select a package to assign"} />
                                        </SelectTrigger>
                                    </FormControl>
                                    <SelectContent>
                                        {packages.map((pkg) => (
                                            <SelectItem key={pkg.id} value={pkg.id} className="font-medium">
                                                {pkg.name} — <span className="text-primary">{pkg.credits.toLocaleString()} Credits</span> (₹{pkg.price})
                                            </SelectItem>
                                        ))}
                                        {packages.length === 0 && !isPackagesLoading && (
                                            <div className="p-2 text-sm text-muted-foreground text-center">No active packages found</div>
                                        )}
                                    </SelectContent>
                                </Select>
                                <FormMessage />
                            </FormItem>
                        )} />

                        {/* Reference Note */}
                        <FormField control={form.control} name="referenceId" render={({ field }) => (
                            <FormItem>
                                <FormLabel className="font-bold flex items-center gap-1">
                                    <ReceiptText className="h-4 w-4 text-muted-foreground" /> Payment Reference (Optional)
                                </FormLabel>
                                <FormControl>
                                    <Input placeholder="E.g., Offline Cash / Txn ID" className="h-11 shadow-sm" {...field} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />

                        <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-6 border-t border-border/40 mt-4">
                            <Button type="button" variant="outline" onClick={onClose} className="w-full sm:w-auto h-11 font-bold">Cancel</Button>
                            <Button type="submit" disabled={isSubmitting || packages.length === 0} className="w-full sm:w-auto h-11 font-bold shadow-md">
                                {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Processing...</> : "Confirm Assignment"}
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}