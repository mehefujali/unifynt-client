"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
} from "@/components/ui/form";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { format } from "date-fns";
import { Flag, History, Loader2, Send } from "lucide-react";
import { ReportService } from "@/services/report.service";
import { toast } from "sonner";

const reportSchema = z.object({
    type: z.enum(["BUG", "FEATURE_REQUEST", "GENERAL_FEEDBACK", "PERFORMANCE_ISSUE", "SECURITY_CONCERN", "OTHER"]),
    title: z.string().min(5, "Title must be at least 5 characters"),
    message: z.string().min(10, "Description must be at least 10 characters"),
    priority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]),
});

type ReportFormValues = z.infer<typeof reportSchema>;

export function ReportModal({ children }: { children: React.ReactNode }) {
    const [open, setOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [activeTab, setActiveTab] = useState("new");

    const form = useForm<ReportFormValues>({
        resolver: zodResolver(reportSchema),
        defaultValues: {
            type: "BUG",
            title: "",
            message: "",
            priority: "MEDIUM",
        },
    });

    const { data: history, isLoading: isLoadingHistory } = useQuery({
        queryKey: ["my-reports"],
        queryFn: () => ReportService.getMyReports({}),
        enabled: open && activeTab === "history",
    });

    const onSubmit = async (values: ReportFormValues) => {
        try {
            setIsSubmitting(true);
            await ReportService.createReport(values);
            toast.success("Thank you! Your report has been submitted.");
            form.reset();
            setActiveTab("history");
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : "Failed to submit report";
            toast.error(errorMessage);
        } finally {
            setIsSubmitting(false);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "PENDING":
                return <Badge variant="outline" className="h-5 text-[10px] font-bold bg-amber-500/5 text-amber-500 border-amber-500/20 uppercase">Pending</Badge>;
            case "IN_PROGRESS":
                return <Badge variant="outline" className="h-5 text-[10px] font-bold bg-blue-500/5 text-blue-500 border-blue-500/20 uppercase">In Progress</Badge>;
            case "RESOLVED":
                return <Badge variant="outline" className="h-5 text-[10px] font-bold bg-emerald-500/5 text-emerald-500 border-emerald-500/20 uppercase tracking-tighter">Resolved</Badge>;
            case "REJECTED":
                return <Badge variant="outline" className="h-5 text-[10px] font-bold bg-rose-500/5 text-rose-500 border-rose-500/20 uppercase">Rejected</Badge>;
            default:
                return <Badge variant="outline" className="h-5 text-[10px] uppercase">{status}</Badge>;
        }
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>{children}</DialogTrigger>
            <DialogContent className="sm:max-w-[500px] border-sidebar-border/50 bg-sidebar p-0 shadow-2xl overflow-hidden">
                <div className="p-6 pb-0">
                    <DialogHeader>
                        <div className="flex items-center gap-2 mb-1">
                            <div className="p-2 rounded-lg bg-slate-900 dark:bg-zinc-100 text-white dark:text-zinc-900 shadow-lg shadow-slate-900/10">
                                <Flag className="h-4 w-4" />
                            </div>
                            <DialogTitle className="text-xl font-bold tracking-tight">Support Center</DialogTitle>
                        </div>
                        <DialogDescription className="text-sm text-slate-500">
                            Submit a report or track your existing support tickets.
                        </DialogDescription>
                    </DialogHeader>
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <div className="px-6 border-b border-sidebar-border/20 bg-sidebar-accent/50">
                        <TabsList className="bg-transparent gap-6 h-12 p-0">
                            <TabsTrigger 
                                value="new" 
                                className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-slate-900 dark:data-[state=active]:border-zinc-100 rounded-none h-full px-1 text-[13px] font-bold text-slate-500 data-[state=active]:text-slate-900 dark:data-[state=active]:text-zinc-100 transition-none"
                            >
                                <Send className="h-3.5 w-3.5 mr-2" />
                                New Report
                            </TabsTrigger>
                            <TabsTrigger 
                                value="history" 
                                className="data-[state=active]:bg-transparent data-[state=active]:border-b-2 data-[state=active]:border-slate-900 dark:data-[state=active]:border-zinc-100 rounded-none h-full px-1 text-[13px] font-bold text-slate-500 data-[state=active]:text-slate-900 dark:data-[state=active]:text-zinc-100 transition-none"
                            >
                                <History className="h-3.5 w-3.5 mr-2" />
                                My History
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    <div className="p-6">
                        <TabsContent value="new" className="mt-0 space-y-4">
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <FormField
                                            control={form.control}
                                            name="type"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-[12px] font-bold text-slate-700 dark:text-zinc-300">Issue Type</FormLabel>
                                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                        <FormControl>
                                                            <SelectTrigger className="bg-slate-50/50 dark:bg-zinc-900/50 border-sidebar-border/40 text-[13px]">
                                                                <SelectValue placeholder="Select type" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            <SelectItem value="BUG">Bug Report</SelectItem>
                                                            <SelectItem value="FEATURE_REQUEST">Feature Request</SelectItem>
                                                            <SelectItem value="GENERAL_FEEDBACK">General Feedback</SelectItem>
                                                            <SelectItem value="PERFORMANCE_ISSUE">Performance Issue</SelectItem>
                                                            <SelectItem value="SECURITY_CONCERN">Security Concern</SelectItem>
                                                            <SelectItem value="OTHER">Other</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="priority"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel className="text-[12px] font-bold text-slate-700 dark:text-zinc-300">Priority</FormLabel>
                                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                        <FormControl>
                                                            <SelectTrigger className="bg-slate-50/50 dark:bg-zinc-900/50 border-sidebar-border/40 text-[13px]">
                                                                <SelectValue placeholder="Select priority" />
                                                            </SelectTrigger>
                                                        </FormControl>
                                                        <SelectContent>
                                                            <SelectItem value="LOW">Low</SelectItem>
                                                            <SelectItem value="MEDIUM">Medium</SelectItem>
                                                            <SelectItem value="HIGH">High</SelectItem>
                                                            <SelectItem value="CRITICAL">Critical</SelectItem>
                                                        </SelectContent>
                                                    </Select>
                                                </FormItem>
                                            )}
                                        />
                                    </div>

                                    <FormField
                                        control={form.control}
                                        name="title"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-[12px] font-bold text-slate-700 dark:text-zinc-300">Short Summary</FormLabel>
                                                <FormControl>
                                                    <Input 
                                                        placeholder="e.g., Page not loading..." 
                                                        className="bg-slate-50/50 dark:bg-zinc-900/50 border-sidebar-border/40 text-[13px]"
                                                        {...field} 
                                                    />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />

                                    <FormField
                                        control={form.control}
                                        name="message"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel className="text-[12px] font-bold text-slate-700 dark:text-zinc-300">Detailed Description</FormLabel>
                                                <FormControl>
                                                    <Textarea 
                                                        placeholder="Describe the issue..." 
                                                        className="min-h-[100px] bg-slate-50/50 dark:bg-zinc-900/50 border-sidebar-border/40 resize-none text-[13px]"
                                                        {...field} 
                                                    />
                                                </FormControl>
                                            </FormItem>
                                        )}
                                    />

                                    <div className="flex items-center justify-end gap-3 pt-2">
                                        <Button 
                                            type="submit" 
                                            disabled={isSubmitting}
                                            className="w-full bg-slate-900 dark:bg-zinc-100 dark:text-slate-900 hover:bg-slate-800 dark:hover:bg-zinc-200 transition-all gap-2 h-11 font-bold"
                                        >
                                            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                                            Submit Report
                                        </Button>
                                    </div>
                                </form>
                            </Form>
                        </TabsContent>

                        <TabsContent value="history" className="mt-0">
                            <ScrollArea className="h-[380px] pr-4 -mr-4">
                                {isLoadingHistory ? (
                                    <div className="flex flex-col items-center justify-center h-[300px] gap-2">
                                        <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Loading history...</p>
                                    </div>
                                ) : history?.data?.length === 0 ? (
                                    <div className="flex flex-col items-center justify-center h-[300px] gap-3">
                                        <div className="p-4 rounded-full bg-slate-50 dark:bg-zinc-900/50">
                                            <History className="h-8 w-8 text-slate-300" />
                                        </div>
                                        <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest">No reports submitted yet</p>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {history?.data?.map((report: { id: string; title: string; message: string; type: string; priority: string; status: string; createdAt: string }) => (
                                            <div key={report.id} className="p-4 rounded-xl border border-sidebar-border/10 bg-sidebar-accent/30 space-y-3 shadow-sm">
                                                <div className="flex items-start justify-between gap-4">
                                                    <div className="space-y-1">
                                                        <h4 className="text-[13px] font-bold text-slate-900 dark:text-zinc-100 line-clamp-1">
                                                            {report.title || "Untitled Report"}
                                                        </h4>
                                                        <div className="flex items-center gap-2">
                                                            <span className="text-[10px] font-bold text-slate-400 tabular-nums">
                                                                {format(new Date(report.createdAt), "MMM dd, hh:mm a")}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    {getStatusBadge(report.status)}
                                                </div>
                                                <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                                                    {report.message}
                                                </p>
                                                <div className="flex items-center gap-2 pt-1 border-t border-sidebar-border/10">
                                                    <Badge variant="outline" className="text-[9px] h-4 border-none bg-slate-100 text-slate-500 font-bold uppercase tracking-tighter">
                                                        {report.type.replace("_", " ")}
                                                    </Badge>
                                                    <Badge variant="outline" className={`text-[9px] h-4 border-none font-bold uppercase ${
                                                        report.priority === 'CRITICAL' ? 'bg-rose-500/10 text-rose-500' : 
                                                        report.priority === 'HIGH' ? 'bg-amber-500/10 text-amber-500' : 'bg-slate-100 text-slate-500'
                                                    }`}>
                                                        {report.priority}
                                                    </Badge>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </ScrollArea>
                        </TabsContent>
                    </div>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
}
