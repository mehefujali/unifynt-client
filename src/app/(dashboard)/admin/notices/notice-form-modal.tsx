"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { NoticeService } from "@/services/notice.service";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogTitle, DialogFooter, DialogHeader } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Loader2, LayoutTemplate, Link2 } from "lucide-react";

interface NoticeFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    noticeId?: string | null;
}

const noticeSchema = z.object({
    title: z.string().min(3, "Title must be at least 3 characters"),
    content: z.string().min(10, "Content must be at least 10 characters"),
    link: z.string().url("Must be a valid URL").optional().or(z.literal("")),
    isPublic: z.boolean().default(false).optional(),
});

type NoticeFormValues = z.infer<typeof noticeSchema>;

export default function NoticeFormModal({ isOpen, onClose, onSuccess, noticeId }: NoticeFormModalProps) {
    const isEditing = !!noticeId;

    const form = useForm<NoticeFormValues>({
        resolver: zodResolver(noticeSchema),
        defaultValues: {
            title: "",
            content: "",
            link: "",
            isPublic: false,
        }
    });

    const { data: noticeData } = useQuery({
        queryKey: ["notice", noticeId],
        queryFn: () => NoticeService.getNoticeById(noticeId as string),
        enabled: isEditing && isOpen,
    });

    useEffect(() => {
        if (isEditing && noticeData?.data) {
            form.reset({
                title: noticeData.data.title,
                content: noticeData.data.content,
                link: noticeData.data.link || "",
                isPublic: noticeData.data.isPublic,
            });
        } else if (!isOpen) {
            form.reset({ title: "", content: "", link: "", isPublic: false });
        }
    }, [noticeData, isEditing, isOpen, form]);

    const mutation = useMutation({
        mutationFn: async (values: NoticeFormValues) => {
            if (isEditing) {
                return NoticeService.updateNotice(noticeId as string, values);
            }
            return NoticeService.createNotice(values);
        },
        onSuccess: () => {
            toast.success(`Notice ${isEditing ? "updated" : "created"} successfully!`);
            onSuccess();
            onClose();
        },
        onError: (err: Error | unknown) => {
            const errorObj = err as { response?: { data?: { message?: string } } };
            toast.error(errorObj?.response?.data?.message || `Failed to ${isEditing ? "update" : "create"} notice`);
        }
    });

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden border-0 shadow-2xl rounded-2xl">
                <div className="bg-primary p-6 text-primary-foreground relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-8 opacity-10 transform translate-x-4 -translate-y-4">
                        <LayoutTemplate className="w-32 h-32" />
                    </div>
                    <DialogHeader className="relative z-10 text-left">
                        <DialogTitle className="text-2xl font-black tracking-tight">{isEditing ? "Edit Global Notice" : "Create Global Notice"}</DialogTitle>
                        <DialogDescription className="text-primary-foreground/80 font-medium">
                            {isEditing ? "Update the details of this institutional announcement." : "Publish a new announcement to your institution's dashboard or public website."}
                        </DialogDescription>
                    </DialogHeader>
                </div>

                <form onSubmit={form.handleSubmit((data) => mutation.mutate(data))} className="p-6 space-y-6">
                    <div className="space-y-5">
                        <div className="space-y-2">
                            <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Notice Title <span className="text-rose-500">*</span></Label>
                            <Input 
                                {...form.register("title")} 
                                placeholder="e.g. Campus Closed for Holidays" 
                                className="h-12 font-medium bg-slate-50 border-slate-200 focus-visible:ring-primary/20 transition-all"
                            />
                            {form.formState.errors.title && <p className="text-xs text-rose-500 font-medium">{form.formState.errors.title.message}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label className="text-xs font-bold uppercase tracking-wider text-slate-500">Notice Content <span className="text-rose-500">*</span></Label>
                            <Textarea 
                                {...form.register("content")} 
                                placeholder="Write the full body of your announcement here..." 
                                className="min-h-[120px] resize-y font-medium bg-slate-50 border-slate-200 focus-visible:ring-primary/20 transition-all"
                            />
                            {form.formState.errors.content && <p className="text-xs text-rose-500 font-medium">{form.formState.errors.content.message}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                                External Link <span className="text-[9px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded uppercase tracking-widest">(Optional)</span>
                            </Label>
                            <div className="relative">
                                <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <Input 
                                    {...form.register("link")} 
                                    placeholder="https://example.com" 
                                    className="h-12 pl-10 font-medium bg-slate-50 border-slate-200 focus-visible:ring-primary/20 transition-all"
                                />
                            </div>
                            {form.formState.errors.link && <p className="text-xs text-rose-500 font-medium">{form.formState.errors.link.message}</p>}
                        </div>

                        <div className="flex flex-row items-center justify-between rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                            <div className="space-y-0.5">
                                <Label className="text-sm font-bold text-slate-900">Visibility Status</Label>
                                <p className="text-[11px] font-medium text-slate-500">
                                    Should this be visible on your <span className="font-bold text-primary">Public Website</span>?
                                </p>
                            </div>
                            <Switch
                                checked={form.watch("isPublic")}
                                onCheckedChange={(val) => form.setValue("isPublic", val)}
                                disabled={mutation.isPending}
                                className="data-[state=checked]:bg-emerald-500"
                            />
                        </div>
                    </div>

                    <DialogFooter className="pt-4 border-t border-slate-100 flex gap-2">
                        <Button type="button" variant="ghost" onClick={onClose} disabled={mutation.isPending} className="font-bold">
                            Cancel
                        </Button>
                        <Button type="submit" disabled={mutation.isPending} className="bg-primary hover:bg-primary/90 font-bold px-8">
                            {mutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : (isEditing ? "Save Changes" : "Publish Notice")}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
