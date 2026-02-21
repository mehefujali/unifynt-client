"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AxiosError } from "axios";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { SubjectService } from "@/services/subject.service";
import { ISubject } from "./subject-modal";

interface DeleteSubjectModalProps {
    isOpen: boolean;
    onClose: () => void;
    subject: ISubject | null;
}

export function DeleteSubjectModal({ isOpen, onClose, subject }: DeleteSubjectModalProps) {
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: (id: string) => SubjectService.deleteSubject(id),
        onSuccess: () => {
            toast.success("Subject deleted successfully!");
            queryClient.invalidateQueries({ queryKey: ["subjects"] });
            onClose();
        },
        onError: (error: AxiosError<{ message: string }>) => {
            toast.error(error.response?.data?.message || "Failed to delete subject");
        },
    });

    if (!subject) return null;

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Delete Subject</DialogTitle>
                    <DialogDescription>
                        Are you sure you want to delete <span className="font-bold text-foreground">{subject.name} ({subject.code})</span>? This action cannot be undone.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="gap-2 sm:gap-0 mt-4">
                    <Button variant="outline" onClick={onClose} disabled={mutation.isPending}>
                        Cancel
                    </Button>
                    <Button variant="destructive" onClick={() => mutation.mutate(subject.id)} disabled={mutation.isPending}>
                        {mutation.isPending ? "Deleting..." : "Delete"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}