/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod/v3";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Send, Users, Info, Loader2, Target, Mail } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/axios";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

import { EmailService } from "@/services/email.service";
import { useAuth } from "@/hooks/use-auth";

const emailSchema = z.object({
    targetType: z.enum(["STUDENTS", "TEACHERS"], { required_error: "Target audience is required" }),
    classId: z.string().optional(),
    sectionId: z.string().optional(),
    subject: z.string().min(1, "Subject cannot be empty").max(200, "Subject too long"),
    message: z.string().min(1, "Message cannot be empty"),
});

export default function ComposeEmailPage() {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const [isSending, setIsSending] = useState(false);

    const form = useForm<z.infer<typeof emailSchema>>({
        resolver: zodResolver(emailSchema),
        defaultValues: { targetType: "STUDENTS", classId: "ALL", sectionId: "ALL", subject: "", message: "" },
    });

    const watchTarget = form.watch("targetType");
    const watchMessage = form.watch("message");
    const watchSubject = form.watch("subject");

    const { data: classesData = [] } = useQuery({
        queryKey: ["classes"],
        queryFn: async () => {
            const res = await api.get('/academic/classes');
            // Normalise: API may return { data: [...] } or { data: { data: [...] } }
            const raw = res.data?.data;
            if (Array.isArray(raw)) return raw;
            if (Array.isArray(raw?.data)) return raw.data;
            return [];
        },
        enabled: !!user?.schoolId,
    });

    const onSubmit = async (values: z.infer<typeof emailSchema>) => {
        setIsSending(true);
        try {
            const payload = {
                targetType: values.targetType,
                subject: values.subject,
                message: values.message,
                ...(values.targetType === "STUDENTS" && values.classId !== "ALL" ? { classId: values.classId } : {}),
                ...(values.targetType === "STUDENTS" && values.sectionId !== "ALL" ? { sectionId: values.sectionId } : {}),
            };

            await EmailService.sendEmailMessage(payload);
            toast.success("Email campaign dispatched successfully!");
            form.reset({ targetType: "STUDENTS", classId: "ALL", sectionId: "ALL", subject: "", message: "" });
            queryClient.invalidateQueries({ queryKey: ["email-stats"] });
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to send email. Check your balance.");
        } finally {
            setIsSending(false);
        }
    };

    return (
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 animate-in fade-in duration-500">
            {/* Left: Compose Form */}
            <Card className="xl:col-span-7 shadow-sm border-border bg-card h-fit">
                <CardHeader className="border-b border-border/40 bg-muted/10 pb-4">
                    <CardTitle className="text-lg font-bold flex items-center gap-2">
                        <Mail className="h-5 w-5 text-primary" /> Compose Email Campaign
                    </CardTitle>
                    <CardDescription>Draft and target your email to the right audience.</CardDescription>
                </CardHeader>
                <CardContent className="pt-6">
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <div className="space-y-4 p-5 border border-border/60 rounded-xl bg-muted/10">
                                <FormField control={form.control} name="targetType" render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="font-bold flex items-center gap-2"><Target className="h-4 w-4 text-primary" /> Target Audience</FormLabel>
                                        <Select onValueChange={(val) => { field.onChange(val); form.setValue("classId", "ALL"); }} value={field.value}>
                                            <FormControl><SelectTrigger className="h-11 shadow-sm"><SelectValue placeholder="Select audience" /></SelectTrigger></FormControl>
                                            <SelectContent>
                                                <SelectItem value="STUDENTS" className="font-medium">Students & Parents</SelectItem>
                                                <SelectItem value="TEACHERS" className="font-medium">Teachers & Staff</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </FormItem>
                                )} />

                                {watchTarget === "STUDENTS" && (
                                    <div className="animate-in slide-in-from-top-2 pt-2 border-t border-border/40">
                                        <FormField control={form.control} name="classId" render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-xs font-semibold text-muted-foreground">Filter by Class (Optional)</FormLabel>
                                                <Select onValueChange={field.onChange} value={field.value}>
                                                    <FormControl><SelectTrigger className="h-10"><SelectValue placeholder="All Classes" /></SelectTrigger></FormControl>
                                                    <SelectContent>
                                                        <SelectItem value="ALL" className="font-bold text-primary">All Classes</SelectItem>
                                                        {classesData.map((cls: any) => <SelectItem key={cls.id} value={cls.id}>{cls.name}</SelectItem>)}
                                                    </SelectContent>
                                                </Select>
                                            </FormItem>
                                        )} />
                                    </div>
                                )}
                            </div>

                            <FormField control={form.control} name="subject" render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="font-bold flex items-center gap-2"><Mail className="h-4 w-4 text-primary" /> Email Subject</FormLabel>
                                    <FormControl>
                                        <Input placeholder="E.g., Important Notice: School Fee Reminder" className="h-11 shadow-sm" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />

                            <FormField control={form.control} name="message" render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="font-bold flex items-center gap-2"><Users className="h-4 w-4 text-primary" /> Email Body</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="Type your email message here..." className="min-h-[200px] resize-none bg-background shadow-sm focus-visible:ring-primary/20 rounded-xl p-4 text-sm leading-relaxed" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />

                            <div className="flex items-center justify-between bg-muted/30 p-3 rounded-lg border border-border/50">
                                <div className="flex flex-col"><span className="text-xs font-bold">{watchMessage?.length || 0} Characters</span><span className="text-[10px] text-muted-foreground">1 Credit per recipient</span></div>
                                <Badge variant="secondary" className="font-bold px-3 py-1 bg-background shadow-sm">Bulk Deduction — {watchMessage?.length > 0 ? "Calculated at Send" : "N/A"}</Badge>
                            </div>

                            <Button type="submit" className="w-full h-12 font-bold shadow-md" disabled={isSending || !watchMessage || !watchSubject}>
                                {isSending ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Dispatching...</> : <><Send className="h-4 w-4 mr-2" /> Send Email Now</>}
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>

            {/* Right: Email Preview */}
            <div className="xl:col-span-5 hidden xl:flex flex-col items-center pt-4">
                <div className="w-[360px] bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-border overflow-hidden">
                    {/* Email Client Header */}
                    <div className="bg-slate-800 px-5 py-4">
                        <div className="flex gap-2 mb-3">
                            <div className="h-3 w-3 rounded-full bg-red-500" />
                            <div className="h-3 w-3 rounded-full bg-yellow-500" />
                            <div className="h-3 w-3 rounded-full bg-green-500" />
                        </div>
                        <div className="text-[10px] uppercase tracking-widest font-black text-white/40">Email Preview</div>
                    </div>
                    {/* Email Metadata */}
                    <div className="border-b border-border/40 px-5 py-4 bg-muted/10">
                        <div className="flex items-center gap-3 mb-3">
                            <div className="h-9 w-9 rounded-full bg-primary/20 flex items-center justify-center text-primary font-black text-sm">U</div>
                            <div>
                                <p className="text-xs font-black text-foreground">Unifynt School System</p>
                                <p className="text-[10px] text-muted-foreground">noreply@unifynt.com</p>
                            </div>
                        </div>
                        <p className="text-sm font-bold text-foreground">{watchSubject || <span className="text-muted-foreground italic font-normal">Your subject line will appear here...</span>}</p>
                    </div>
                    {/* Email Body */}
                    <div className="px-5 py-5 min-h-[200px] bg-white dark:bg-zinc-950">
                        <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed whitespace-pre-wrap break-words">
                            {watchMessage || <span className="text-zinc-400 italic">Your email message body will appear here as you type...</span>}
                        </p>
                    </div>
                    {/* Footer */}
                    <div className="bg-slate-50 dark:bg-zinc-900 border-t border-border/40 px-5 py-3 text-center">
                        <p className="text-[10px] text-muted-foreground">© {new Date().getFullYear()} Unifynt. All rights reserved.</p>
                    </div>
                </div>
                <div className="mt-6 flex items-center gap-2 text-xs font-medium text-muted-foreground bg-muted/40 px-5 py-2.5 rounded-full border border-border/50 shadow-sm"><Info className="h-4 w-4 text-primary" /> Emails are sent via Nodemailer SMTP.</div>
            </div>
        </div>
    );
}
