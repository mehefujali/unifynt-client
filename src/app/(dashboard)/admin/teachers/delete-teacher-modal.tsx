/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { TeacherService } from "@/services/teacher.service";

interface DeleteTeacherModalProps {
    teacher: any;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function DeleteTeacherModal({ teacher, open, onOpenChange }: DeleteTeacherModalProps) {
    const [confirmText, setConfirmText] = useState("");
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: async (id: string) => {
            return await TeacherService.deleteTeacher(id);
        },
        onSuccess: () => {
            toast.success("Teacher deleted successfully");
            queryClient.invalidateQueries({ queryKey: ["teachers"] });
            onOpenChange(false);
            setConfirmText("");
        },
        onError: (error: any) => {
            toast.error(error.response?.data?.message || "Failed to delete teacher");
        },
    });

    const handleDelete = () => {
        if (confirmText !== "Delete") return;
        mutation.mutate(teacher.id);
    };

    const handleClose = () => {
        if (!mutation.isPending) {
            setConfirmText("");
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
                        <DialogTitle className="text-xl text-destructive font-bold">Delete Teacher?</DialogTitle>
                    </div>
                    <DialogDescription className="pt-3 font-medium text-left">
                        This action cannot be undone. This will permanently delete
                        <span className="font-bold text-foreground mx-1">
                            {teacher?.firstName} {teacher?.lastName}
                        </span>
                        and remove their data from our servers.
                    </DialogDescription>
                </DialogHeader>

                <div className="p-6 py-5">
                    <div className="space-y-3">
                        <Label className="text-sm font-semibold">
                            Please type <span className="font-bold text-foreground select-none">Delete</span> to confirm.
                        </Label>
                        <Input
                            value={confirmText}
                            onChange={(e) => setConfirmText(e.target.value)}
                            placeholder="Delete"
                            className="font-medium h-11"
                            disabled={mutation.isPending}
                        />
                    </div>
                </div>

                <DialogFooter className="p-6 pt-4 border-t bg-muted/10 sm:justify-between">
                    <Button variant="outline" onClick={handleClose} disabled={mutation.isPending}>
                        Cancel
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={handleDelete}
                        disabled={confirmText !== "Delete" || mutation.isPending}
                        className="font-bold px-6"
                    >
                        {mutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Delete Teacher"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}