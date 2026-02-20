/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod/v3";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Send, Users, Smartphone, Info, Loader2, Target, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/axios";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

import { SmsService } from "@/services/sms.service";
import { useAuth } from "@/hooks/use-auth";

const smsSchema = z.object({
    targetType: z.enum(["STUDENTS", "TEACHERS"], { required_error: "Target audience is required" }),
    classId: z.string().optional(),
    sectionId: z.string().optional(),
    message: z.string().min(1, "Message cannot be empty").max(1600, "Maximum 1600 characters allowed"),
});

export default function ComposeSmsPage() {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const [isSending, setIsSending] = useState(false);

    const form = useForm<z.infer<typeof smsSchema>>({
        resolver: zodResolver(smsSchema),
        defaultValues: { targetType: "STUDENTS", classId: "ALL", sectionId: "ALL", message: "" },
    });

    const watchTarget = form.watch("targetType");
    const watchClass = form.watch("classId");
    const watchMessage = form.watch("message");

    const charCount = watchMessage?.length || 0;
    const smsSegments = Math.max(1, Math.ceil(charCount / 160));

    // Safe fallback fetch for classes
    const { data: classesData = [] } = useQuery({
        queryKey: ["classes"],
        queryFn: async () => {
            const res = await api.get('/academic/classes');
            return res.data?.data || [];
        },
        enabled: !!user?.schoolId,
    });

    const onSubmit = async (values: z.infer<typeof smsSchema>) => {
        setIsSending(true);
        try {
            const payload = {
                targetType: values.targetType,
                message: values.message,
                ...(values.targetType === "STUDENTS" && values.classId !== "ALL" ? { classId: values.classId } : {}),
                ...(values.targetType === "STUDENTS" && values.sectionId !== "ALL" ? { sectionId: values.sectionId } : {}),
            };

            await SmsService.sendSmsMessage(payload);
            toast.success("Campaign dispatched successfully!");
            form.reset({ targetType: "STUDENTS", classId: "ALL", sectionId: "ALL", message: "" });
            queryClient.invalidateQueries({ queryKey: ["sms-stats"] });
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to send SMS. Check balance.");
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
                        <MessageSquare className="h-5 w-5 text-primary" /> Compose Campaign
                    </CardTitle>
                    <CardDescription>Draft and target your message precisely.</CardDescription>
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

                            <FormField control={form.control} name="message" render={({ field }) => (
                                <FormItem>
                                    <FormLabel className="font-bold flex items-center gap-2"><Users className="h-4 w-4 text-primary" /> Message Content</FormLabel>
                                    <FormControl>
                                        <Textarea placeholder="Type your SMS message here..." className="min-h-[160px] resize-none bg-background shadow-sm focus-visible:ring-primary/20 rounded-xl p-4 text-sm leading-relaxed" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )} />

                            <div className="flex items-center justify-between bg-muted/30 p-3 rounded-lg border border-border/50">
                                <div className="flex flex-col"><span className="text-xs font-bold">{charCount} Characters</span><span className="text-[10px] text-muted-foreground">160 chars = 1 Credit/User</span></div>
                                <Badge variant="secondary" className="font-bold px-3 py-1 bg-background shadow-sm">{smsSegments} Segment{smsSegments > 1 ? 's' : ''} / Message</Badge>
                            </div>

                            <Button type="submit" className="w-full h-12 font-bold shadow-md" disabled={isSending || charCount === 0}>
                                {isSending ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Dispatching...</> : <><Send className="h-4 w-4 mr-2" /> Send SMS Now</>}
                            </Button>
                        </form>
                    </Form>
                </CardContent>
            </Card>

            {/* Right: Live Mobile Preview */}
            <div className="xl:col-span-5 hidden xl:flex flex-col items-center pt-4">
                <div className="w-[320px] h-[620px] bg-zinc-900 rounded-[3.5rem] p-3.5 shadow-2xl relative border-4 border-zinc-800 flex flex-col overflow-hidden ring-1 ring-white/10">
                    <div className="absolute top-0 inset-x-0 h-6 bg-zinc-800 rounded-b-3xl w-40 mx-auto z-20 flex justify-center items-end pb-1.5"><div className="h-1.5 w-12 bg-black rounded-full opacity-50" /></div>
                    <div className="flex-1 bg-[#F2F2F7] dark:bg-zinc-950 rounded-[2.8rem] overflow-hidden flex flex-col relative z-10">
                        <div className="h-16 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-b border-border/40 flex items-center justify-center pt-4 shadow-sm z-20">
                            <div className="flex flex-col items-center"><span className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold">Message from</span><span className="text-sm font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5"><Smartphone className="h-3.5 w-3.5" /> School Admin</span></div>
                        </div>
                        <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-3 relative z-10 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] bg-repeat opacity-90">
                            <div className="flex justify-center"><span className="text-[10px] font-semibold text-zinc-500 bg-zinc-200/80 dark:bg-zinc-800/80 px-2 py-0.5 rounded-full backdrop-blur-sm shadow-sm">Today, {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span></div>
                            <div className="max-w-[85%] bg-white dark:bg-zinc-800 rounded-2xl rounded-tl-sm p-3.5 shadow-md self-start animate-in fade-in slide-in-from-bottom-2 border border-zinc-200 dark:border-zinc-700">
                                <p className="text-[13.5px] leading-relaxed text-zinc-800 dark:text-zinc-200 whitespace-pre-wrap break-words">{watchMessage || <span className="text-zinc-400 italic">Live message preview...</span>}</p>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="mt-8 flex items-center gap-2 text-xs font-medium text-muted-foreground bg-muted/40 px-5 py-2.5 rounded-full border border-border/50 shadow-sm"><Info className="h-4 w-4 text-primary" /> Actual rendering depends on the recipient&apos;s device.</div>
            </div>
        </div>
    );
}