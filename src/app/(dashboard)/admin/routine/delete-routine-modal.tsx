"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { AxiosError } from "axios";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { RoutineService } from "@/services/routine.service";

interface DeleteRoutineModalProps {
    isOpen: boolean;
    onClose: () => void;
    routineId: string | null;
}

export function DeleteRoutineModal({ isOpen, onClose, routineId }: DeleteRoutineModalProps) {
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: (id: string) => RoutineService.deleteRoutine(id),
        onSuccess: () => {
            toast.success("Routine deleted successfully!");
            queryClient.invalidateQueries({ queryKey: ["routines"] });
            onClose();
        },
        onError: (error: AxiosError<{ message: string }>) => {
            toast.error(error.response?.data?.message || "Failed to delete routine");
        },
    });

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Delete Class Schedule</DialogTitle>
                    <DialogDescription>
                        Are you sure you want to delete this schedule? This action cannot be undone.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="gap-2 sm:gap-0 mt-4">
                    <Button variant="outline" onClick={onClose} disabled={mutation.isPending}>Cancel</Button>
                    <Button variant="destructive" onClick={() => routineId && mutation.mutate(routineId)} disabled={mutation.isPending}>
                        {mutation.isPending ? "Deleting..." : "Delete"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}