"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod/v3";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient, useMutation } from "@tanstack/react-query";

import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from "@/components/ui/sheet";
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
    initialData?: SmsPackage | null;
}

export function PackageModal({ isOpen, onClose, initialData }: PackageModalProps) {
    const queryClient = useQueryClient();
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

    const { reset, handleSubmit, control } = form;

    useEffect(() => {
        if (initialData && isOpen) {
            reset({
                name: initialData.name,
                credits: initialData.credits,
                price: initialData.price,
                isActive: initialData.isActive,
            });
        } else if (!initialData && isOpen) {
            reset({ name: "", credits: 0, price: 0, isActive: true });
        }
    }, [initialData, isOpen, reset]);

    const mutation = useMutation({
        mutationFn: async (values: PackageFormValues) => {
            if (isEditing && initialData) {
                return await SmsService.updatePackage(initialData.id, values);
            }
            return await SmsService.createPackage(values);
        },
        onSuccess: () => {
            toast.success(isEditing ? "Package updated successfully" : "Package created successfully");
            queryClient.invalidateQueries({ queryKey: ["sms-packages"] });
            onClose();
        },
        onError: (error: { response?: { data?: { message?: string } } }) => {
            toast.error(error.response?.data?.message || `Failed to ${isEditing ? 'update' : 'create'} package`);
        },
    });

    const onSubmit = (values: PackageFormValues) => {
        mutation.mutate(values);
    };

    return (
        <Sheet open={isOpen} onOpenChange={onClose}>
            <SheetContent className="w-full sm:max-w-[540px] flex flex-col h-full p-0">
                <SheetHeader className="p-6 border-b bg-muted/20">
                    <SheetTitle>{isEditing ? "Edit SMS Package" : "Add SMS Package"}</SheetTitle>
                    <SheetDescription>
                        Set up the bundle name, credits, and pricing details.
                    </SheetDescription>
                </SheetHeader>

                <div className="flex-1 overflow-y-auto p-6">
                    <Form {...form}>
                        <form id="sms-package-form" onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                            <FormField control={control} name="name" render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="font-bold">Package Name</FormLabel>
                                    <FormControl>
                                        <Input placeholder="e.g. Starter Bundle" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />

                            <div className="grid grid-cols-2 gap-4">
                                <FormField control={control} name="credits" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="font-bold">SMS Credits</FormLabel>
                                        <FormControl>
                                            <Input type="number" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                                <FormField control={control} name="price" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="font-bold">Price (INR)</FormLabel>
                                        <FormControl>
                                            <Input type="number" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )} />
                            </div>

                            <FormField control={control} name="isActive" render={({ field }) => (
                                <FormItem className="flex items-center justify-between rounded-lg border p-4 bg-muted/10 shadow-sm">
                                    <div className="space-y-0.5">
                                        <FormLabel className="text-base font-bold">Active Status</FormLabel>
                                        <div className="text-[13px] text-muted-foreground">
                                            Make this package available for purchase.
                                        </div>
                                    </div>
                                    <FormControl>
                                        <Switch
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                        />
                                    </FormControl>
                                </FormItem>
                            )} />
                        </form>
                    </Form>
                </div>

                <div className="p-6 border-t bg-muted/5 flex items-center justify-end gap-3">
                    <Button variant="outline" onClick={onClose} disabled={mutation.isPending}>
                        Cancel
                    </Button>
                    <Button type="submit" form="sms-package-form" disabled={mutation.isPending}>
                        {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                        <Save className="mr-2 h-4 w-4" />
                        {isEditing ? "Save Changes" : "Create Package"}
                    </Button>
                </div>
            </SheetContent>
        </Sheet>
    );
}