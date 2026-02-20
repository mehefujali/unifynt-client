/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Loader2, AlertTriangle } from "lucide-react";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { StudentService } from "@/services/student.service";

interface DeleteStudentModalProps {
    student: any;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function DeleteStudentModal({ student, open, onOpenChange }: DeleteStudentModalProps) {
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: async (id: string) => {
            return await StudentService.deleteStudent(id);
        },
        onSuccess: () => {
            toast.success("Student deleted successfully");
            queryClient.invalidateQueries({ queryKey: ["students"] });
            onOpenChange(false);
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Failed to delete student");
        },
    });

    const handleDelete = () => {
        mutation.mutate(student.id);
    };

    const handleClose = () => {
        if (!mutation.isPending) {
            onOpenChange(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={handleClose}>
            <DialogContent className="sm:max-w-[425px] p-0 overflow-hidden">
                <DialogHeader className="p-6 pb-4 border-b bg-muted/10">
                    <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-destructive/10 flex items-center justify-center shrink-0">
                            <AlertTriangle className="h-5 w-5 text-destructive" />
                        </div>
                        <DialogTitle className="text-xl text-destructive font-bold">Delete Student?</DialogTitle>
                    </div>
                    <DialogDescription className="pt-3 font-medium text-left">
                        Are you sure you want to permanently delete
                        <span className="font-bold text-foreground mx-1">
                            {student?.firstName} {student?.lastName}
                        </span>?
                        <br /><br />
                        This action cannot be undone and will permanently remove all their academic records, attendance history, and fee details from the servers.
                    </DialogDescription>
                </DialogHeader>

                <DialogFooter className="p-6 bg-muted/10 sm:justify-between">
                    <Button variant="outline" onClick={handleClose} disabled={mutation.isPending}>
                        Cancel
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={handleDelete}
                        disabled={mutation.isPending}
                        className="font-bold px-6 shadow-md"
                    >
                        {mutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Yes, Delete Student"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}