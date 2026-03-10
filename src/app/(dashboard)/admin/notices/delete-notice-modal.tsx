"use client";

import { useMutation } from "@tanstack/react-query";
import { NoticeService } from "@/services/notice.service";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { AlertTriangle, Loader2 } from "lucide-react";

interface DeleteNoticeModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    noticeId: string | null;
}

export default function DeleteNoticeModal({ isOpen, onClose, onSuccess, noticeId }: DeleteNoticeModalProps) {
    const mutation = useMutation({
        mutationFn: () => NoticeService.deleteNotice(noticeId as string),
        onSuccess: () => {
            toast.success("Notice deleted successfully");
            onSuccess();
            onClose();
        },
        onError: (err: Error | unknown) => {
            const errorObj = err as { response?: { data?: { message?: string } } };
            toast.error(errorObj?.response?.data?.message || "Failed to delete notice");
        }
    });

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[425px] p-6 text-center border-0 shadow-2xl rounded-2xl">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-16 w-16 bg-rose-100 dark:bg-rose-500/20 rounded-full flex items-center justify-center">
                        <AlertTriangle className="h-8 w-8 text-rose-600" />
                    </div>
                    
                    <div className="space-y-2">
                        <DialogTitle className="text-xl font-black tracking-tight">Delete Notice?</DialogTitle>
                        <DialogDescription className="text-slate-500 font-medium">
                            Are you absolutely sure you want to delete this notice? This action cannot be undone and will permanently remove it from both internal and public channels.
                        </DialogDescription>
                    </div>
                </div>

                <DialogFooter className="sm:justify-center mt-6 gap-2">
                    <Button type="button" variant="outline" onClick={onClose} disabled={mutation.isPending} className="font-bold border-slate-200 hover:bg-slate-50 flex-1">
                        Cancel
                    </Button>
                    <Button 
                        type="button" 
                        variant="destructive" 
                        onClick={() => mutation.mutate()} 
                        disabled={mutation.isPending}
                        className="font-bold flex-1 shadow-md hover:shadow-lg transition-all"
                    >
                        {mutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : "Delete Notice"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
