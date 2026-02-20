"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod/v3";
import { Loader2, PackagePlus, Edit3, Zap } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";

import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { SmsService, SmsPackage } from "@/services/sms.service";

const packageSchema = z.object({
    name: z.string().min(3, "Package name must be at least 3 characters"),
    credits: z.coerce.number().min(1, "Credits must be greater than 0"),
    price: z.coerce.number().min(1, "Price must be greater than 0"),
    isActive: z.boolean(),
});

type PackageFormValues = z.infer<typeof packageSchema>;

interface PackageModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialData?: SmsPackage | null; // NEW: Receives data for editing
}

interface ApiError {
    response?: {
        data?: {
            message?: string;
        };
    };
}

export function PackageModal({ isOpen, onClose, initialData }: PackageModalProps) {
    const queryClient = useQueryClient();
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

    const isEditing = !!initialData;

    const form = useForm<PackageFormValues>({
        resolver: zodResolver(packageSchema),
        defaultValues: {
            name: "",
            credits: 0,
            price: 0,
            isActive: true
        },
    });

    // Pre-fill form when editing
    useEffect(() => {
        if (initialData && isOpen) {
            form.reset({
                name: initialData.name,
                credits: initialData.credits,
                price: initialData.price,
                isActive: initialData.isActive,
            });
        } else if (!isOpen) {
            form.reset({ name: "", credits: 0, price: 0, isActive: true });
        }
    }, [initialData, isOpen, form]);

    const onSubmit = async (values: PackageFormValues) => {
        setIsSubmitting(true);
        try {
            if (isEditing && initialData) {
                await SmsService.updatePackage(initialData.id, values);
                toast.success("SMS Package updated successfully!");
            } else {
                await SmsService.createPackage(values);
                toast.success("SMS Package created successfully!");
            }
            queryClient.invalidateQueries({ queryKey: ["sms-packages"] });
            onClose();
        } catch (error: unknown) {
            const err = error as ApiError;
            toast.error(err.response?.data?.message || `Failed to ${isEditing ? 'update' : 'create'} package.`);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[450px] max-h-[90vh] overflow-y-auto custom-scrollbar">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2 text-xl font-bold">
                        {isEditing ? <Edit3 className="h-5 w-5 text-primary" /> : <PackagePlus className="h-5 w-5 text-primary" />}
                        {isEditing ? "Edit SMS Package" : "Create SMS Package"}
                    </DialogTitle>
                    <DialogDescription>
                        {isEditing ? "Modify the details of this credit bundle." : "Define a new credit bundle for schools to purchase."}
                    </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5 pt-2">
                        <FormField control={form.control} name="name" render={({ field }) => (
                            <FormItem>
                                <FormLabel className="font-bold">Package Name</FormLabel>
                                <FormControl><Input placeholder="E.g., Gold Pack - 10k SMS" className="h-11 shadow-sm" {...field} /></FormControl>
                                <FormMessage />
                            </FormItem>
                        )} />

                        <div className="grid grid-cols-2 gap-4">
                            <FormField control={form.control} name="credits" render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="font-bold flex items-center gap-1"><Zap className="h-3.5 w-3.5 text-amber-500" /> SMS Credits</FormLabel>
                                    <FormControl><Input type="number" placeholder="10000" className="h-11 shadow-sm font-bold" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                            <FormField control={form.control} name="price" render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="font-bold">Price (₹)</FormLabel>
                                    <FormControl><Input type="number" placeholder="499" className="h-11 shadow-sm font-bold text-primary" {...field} /></FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />
                        </div>

                        <FormField control={form.control} name="isActive" render={({ field }) => (
                            <FormItem className="flex flex-row items-center justify-between rounded-lg border border-border/50 bg-muted/20 p-4 shadow-sm">
                                <div className="space-y-0.5">
                                    <FormLabel className="text-sm font-bold text-foreground">Active Status</FormLabel>
                                    <p className="text-[11px] text-muted-foreground font-medium">If disabled, schools won&apos;t see this package.</p>
                                </div>
                                <FormControl>
                                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                                </FormControl>
                            </FormItem>
                        )} />

                        <DialogFooter className="pt-4 border-t border-border/40 sm:justify-center">
                            <div className="grid grid-cols-2 gap-3 w-full">
                                <Button type="button" variant="outline" onClick={onClose} className="w-full h-11 font-bold">
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={isSubmitting} className="w-full h-11 font-bold shadow-md">
                                    {isSubmitting ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...</> : isEditing ? "Save Changes" : "Create Package"}
                                </Button>
                            </div>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
}