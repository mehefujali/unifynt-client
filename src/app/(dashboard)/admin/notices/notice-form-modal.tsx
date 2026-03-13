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
import { Loader2 } from "lucide-react";

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
            <DialogContent className="sm:max-w-[500px] p-0 overflow-hidden border border-border shadow-2xl rounded-2xl bg-card">
                <div className="p-6 border-b border-border bg-muted/30">
                    <DialogHeader className="text-left">
                        <DialogTitle className="text-xl font-bold tracking-tight text-foreground">
                            {isEditing ? "Edit Notice" : "Create New Notice"}
                        </DialogTitle>
                        <DialogDescription className="text-muted-foreground text-sm font-medium mt-1">
                            {isEditing ? "Modify existing institutional announcement details." : "Publish an announcement to the dashboard or website."}
                        </DialogDescription>
                    </DialogHeader>
                </div>

                <form onSubmit={form.handleSubmit((data) => mutation.mutate(data))} className="p-6 space-y-5">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label className="text-sm font-bold text-foreground">Notice Title <span className="text-destructive">*</span></Label>
                            <Input 
                                {...form.register("title")} 
                                placeholder="e.g. Campus Closed for Holidays" 
                                className="h-10 bg-muted/20 border-border focus-visible:ring-primary/20 font-medium"
                            />
                            {form.formState.errors.title && <p className="text-[11px] text-destructive font-bold mt-1">{form.formState.errors.title.message}</p>}
                        </div>

                        <div className="space-y-2">
                            <Label className="text-sm font-bold text-foreground">Content <span className="text-destructive">*</span></Label>
                            <Textarea 
                                {...form.register("content")} 
                                placeholder="Write the full body of your announcement here..." 
                                className="min-h-[120px] resize-none bg-muted/20 border-border focus-visible:ring-primary/20 font-medium text-sm leading-relaxed"
                            />
                            {form.formState.errors.content && <p className="text-[11px] text-destructive font-bold mt-1">{form.formState.errors.content.message}</p>}
                        </div>

                        <div className="space-y-2">
                            <div className="flex items-center justify-between">
                                <Label className="text-sm font-bold text-foreground">External Link</Label>
                                <span className="text-[9px] uppercase tracking-widest bg-muted/50 font-bold border border-border px-1.5 py-0.5 rounded text-muted-foreground">Optional</span>
                            </div>
                            <div className="relative group">
                                <Input 
                                    {...form.register("link")} 
                                    placeholder="https://example.com" 
                                    className="h-10 bg-muted/20 border-border focus-visible:ring-primary/20 font-medium"
                                />
                            </div>
                            {form.formState.errors.link && <p className="text-[11px] text-destructive font-bold mt-1">{form.formState.errors.link.message}</p>}
                        </div>

                        <div className="flex flex-row items-center justify-between rounded-xl border border-border bg-muted/10 p-4 transition-colors hover:bg-muted/20">
                            <div className="space-y-0.5">
                                <Label className="text-sm font-bold text-foreground tracking-tight">Public Visibility</Label>
                                <p className="text-[11px] font-medium text-muted-foreground">
                                    Show on <span className="font-bold text-primary">Public Website</span>
                                </p>
                            </div>
                            <Switch
                                checked={form.watch("isPublic")}
                                onCheckedChange={(val) => form.setValue("isPublic", val)}
                                disabled={mutation.isPending}
                                className="data-[state=checked]:bg-primary h-5 w-9 scale-90"
                            />
                        </div>
                    </div>

                    <DialogFooter className="pt-4 border-t border-border flex flex-row gap-3">
                        <Button 
                            type="button" 
                            variant="ghost" 
                            onClick={onClose} 
                            disabled={mutation.isPending} 
                            className="flex-1 font-bold h-10 px-4 rounded-lg bg-muted/30 hover:bg-muted/50 transition-all"
                        >
                            Cancel
                        </Button>
                        <Button 
                            type="submit" 
                            disabled={mutation.isPending} 
                            className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground font-bold h-10 px-4 rounded-lg shadow-sm transition-all"
                        >
                            {mutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : (isEditing ? "Save Changes" : "Create Notice")}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}
