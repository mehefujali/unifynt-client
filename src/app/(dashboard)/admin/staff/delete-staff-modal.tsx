/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2, AlertTriangle } from "lucide-react";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { StaffService } from "@/services/staff.service";

export function DeleteStaffModal({ staff, open, onClose }: { staff: any; open: boolean; onClose: () => void }) {
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: () => StaffService.deleteStaff(staff.id),
        onSuccess: () => {
            toast.success("Staff deleted successfully!");
            queryClient.invalidateQueries({ queryKey: ["staff"] });
            onClose();
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Failed to delete staff");
        },
    });

    if (!staff) return null;

    return (
        <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader className="flex flex-col items-center text-center pt-6">
                    <div className="h-16 w-16 bg-rose-100 dark:bg-rose-500/10 rounded-full flex items-center justify-center mb-4">
                        <AlertTriangle className="h-8 w-8 text-rose-600" />
                    </div>
                    <DialogTitle className="text-2xl font-black text-foreground">Delete Staff Account</DialogTitle>
                    <DialogDescription className="mt-2 text-sm font-medium">
                        Are you sure you want to delete <span className="font-bold text-foreground">{staff.firstName} {staff.lastName}</span>? This action will block their access and cannot be undone.
                    </DialogDescription>
                </DialogHeader>

                <div className="flex flex-col gap-3 mt-6">
                    <Button 
                        variant="destructive" 
                        className="w-full h-12 font-black text-[13px] uppercase tracking-widest" 
                        onClick={() => mutation.mutate()} 
                        disabled={mutation.isPending}
                    >
                        {mutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                        Yes, Delete Account
                    </Button>
                    <Button 
                        variant="outline" 
                        className="w-full h-12 font-bold" 
                        onClick={onClose} 
                        disabled={mutation.isPending}
                    >
                        Cancel
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}