"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";
import { StudentService } from "@/services/student.service";
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Bell } from "lucide-react";

interface SendNotificationModalProps {
    studentId: string | null;
    isOpen: boolean;
    onClose: () => void;
}

export default function SendNotificationModal({ studentId, isOpen, onClose }: SendNotificationModalProps) {
    const [title, setTitle] = useState("");
    const [message, setMessage] = useState("");

    const mutation = useMutation({
        mutationFn: async () => {
            if (!studentId) throw new Error("No student selected");
            return await StudentService.sendNotification(studentId, { title, message });
        },
        onSuccess: () => {
            toast.success("Notification sent successfully to the student");
            setTitle("");
            setMessage("");
            onClose();
        },
        onError: (err: Error | unknown) => {
            const errorObj = err as { response?: { data?: { message?: string } } };
            toast.error(errorObj?.response?.data?.message || "Failed to send notification");
        }
    });

    const handleSend = () => {
        if (!title.trim() || !message.trim()) {
            toast.error("Title and Message are required.");
            return;
        }
        mutation.mutate();
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[425px] rounded-3xl border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden p-0 gap-0">
                <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-6 text-white flex flex-col items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-white/10 opacity-20 z-0"></div>
                    <div className="h-16 w-16 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-4 z-10 shadow-inner">
                        <Bell className="h-8 w-8 text-white" />
                    </div>
                    <DialogTitle className="text-2xl font-black tracking-tight z-10">Send Notification</DialogTitle>
                    <DialogDescription className="text-indigo-100 text-center font-medium mt-1 z-10">
                        Deliver a direct message to this student.
                    </DialogDescription>
                </div>
                
                <div className="p-6 space-y-5 bg-white dark:bg-slate-950">
                    <div className="space-y-2">
                        <label className="text-[11px] font-black uppercase tracking-widest text-slate-400">Title</label>
                        <Input 
                            placeholder="Notification Subject" 
                            value={title} 
                            onChange={(e) => setTitle(e.target.value)} 
                            className="h-12 rounded-xl font-bold bg-slate-50 dark:bg-slate-900 border-none focus-visible:ring-2 focus-visible:ring-indigo-500/50"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[11px] font-black uppercase tracking-widest text-slate-400">Message</label>
                        <Textarea 
                            placeholder="Write your message here..." 
                            value={message} 
                            onChange={(e) => setMessage(e.target.value)} 
                            className="min-h-[120px] rounded-xl font-medium bg-slate-50 dark:bg-slate-900 border-none focus-visible:ring-2 focus-visible:ring-indigo-500/50 resize-none p-4"
                        />
                    </div>
                </div>

                <DialogFooter className="mr-0 mb-0 flex border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-black/20 p-4 gap-3">
                    <Button variant="ghost" onClick={onClose} className="rounded-xl font-bold h-11 px-6 sm:w-1/2 justify-center hover:bg-slate-200/50 dark:hover:bg-slate-800">
                        Cancel
                    </Button>
                    <Button 
                        onClick={handleSend} 
                        disabled={mutation.isPending} 
                        className="rounded-xl font-bold h-11 px-6 bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-600/20 sm:w-1/2 justify-center transition-all"
                    >
                        {mutation.isPending ? <Loader2 className="h-5 w-5 animate-spin" /> : "Send Now"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
