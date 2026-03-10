"use client";

import { toast } from "sonner";
import { useMutation } from "@tanstack/react-query";
import { StudentService } from "@/services/student.service";
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, KeyRound, AlertTriangle } from "lucide-react";
import { Dispatch, SetStateAction, useState } from "react";

interface ResetPasswordModalProps {
    studentId: string | null;
    isOpen: boolean;
    onClose: () => void;
    setGeneratedPasswordInfo: Dispatch<SetStateAction<{ email: string, password: string } | null>>;
}

export default function ResetPasswordModal({ studentId, isOpen, onClose, setGeneratedPasswordInfo }: ResetPasswordModalProps) {
    const [newPassword, setNewPassword] = useState("");

    const mutation = useMutation({
        mutationFn: async () => {
            if (!studentId) throw new Error("No student selected");
            return await StudentService.resetPassword(studentId, { newPassword });
        },
        onSuccess: (res: { data?: { plainPassword?: string, email?: string } }) => {
            toast.success("Password reset successfully!", { duration: 4000 });
            if (res.data?.plainPassword && res.data?.email) {
                setGeneratedPasswordInfo({ email: res.data.email, password: res.data.plainPassword });
            }
            onClose();
            setNewPassword("");
        },
        onError: (err: Error | unknown) => {
            const errorObj = err as { response?: { data?: { message?: string } } };
            toast.error(errorObj?.response?.data?.message || "Failed to reset password");
        }
    });

    const handleReset = () => {
        mutation.mutate();
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[400px] rounded-3xl border-rose-100 dark:border-rose-900/30 shadow-2xl overflow-hidden p-0 gap-0">
                <div className="bg-rose-50 dark:bg-rose-950/20 p-8 text-center flex flex-col items-center relative overflow-hidden">
                    <div className="absolute top-0 inset-x-0 h-1 bg-rose-500 animate-pulse"></div>
                    <div className="h-20 w-20 bg-rose-100 dark:bg-rose-900/50 rounded-full flex items-center justify-center mb-5 ring-8 ring-rose-50/50 dark:ring-rose-950/30">
                        <KeyRound className="h-10 w-10 text-rose-600 dark:text-rose-400" />
                    </div>
                    <DialogTitle className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">Reset Password?</DialogTitle>
                    <DialogDescription className="text-slate-500 dark:text-slate-400 font-medium mt-2 leading-relaxed">
                        Reset this student&apos;s password. You can manually enter a new password below, or leave it blank to auto-generate a random secure password.
                    </DialogDescription>
                </div>
                
                <div className="p-6 bg-white dark:bg-slate-950/50 space-y-2">
                    <label className="text-[11px] font-black uppercase tracking-widest text-slate-400">New Password (Optional)</label>
                    <Input 
                        placeholder="Leave blank to auto-generate" 
                        value={newPassword} 
                        onChange={(e) => setNewPassword(e.target.value)} 
                        className="h-12 rounded-xl font-bold bg-slate-50 dark:bg-slate-900 border-none focus-visible:ring-2 focus-visible:ring-rose-500/50"
                    />
                </div>

                <div className="bg-rose-100/50 dark:bg-rose-900/10 p-4 border-y border-rose-100 dark:border-rose-900/20 flex items-start gap-3">
                    <AlertTriangle className="h-5 w-5 text-rose-600 shrink-0 mt-0.5" />
                    <p className="text-[11px] font-bold text-rose-700 dark:text-rose-300 uppercase tracking-widest leading-relaxed">
                        Action is irreversible. Make sure the student requires a new password before proceeding.
                    </p>
                </div>

                <DialogFooter className="p-4 bg-white dark:bg-slate-950 gap-3">
                    <Button variant="ghost" onClick={onClose} className="rounded-xl font-bold h-11 px-6 flex-1 hover:bg-slate-100 dark:hover:bg-slate-900">
                        Cancel
                    </Button>
                    <Button 
                        onClick={handleReset} 
                        disabled={mutation.isPending} 
                        className="rounded-xl font-black h-11 px-6 bg-rose-600 hover:bg-rose-700 text-white shadow-lg shadow-rose-600/20 flex-1 transition-all"
                    >
                        {mutation.isPending ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : "Confirm Reset"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
