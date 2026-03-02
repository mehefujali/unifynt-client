/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { toast } from "sonner";
import { 
    ArrowLeft, FileSpreadsheet, Download, Search, LayoutTemplate, Activity, RefreshCw, FileText, TableProperties, Eye, Unplug, Link2, ExternalLink, ChevronLeft, ChevronRight
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CustomFormService } from "@/services/form.service";

export default function FormSubmissionsPage() {
    const params = useParams();
    const router = useRouter();
    const queryClient = useQueryClient();
    const slug = params.slug as string;

    const [currentPage, setCurrentPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedSubmission, setSelectedSubmission] = useState<any>(null); 
    const [isDisconnectOpen, setIsDisconnectOpen] = useState(false);

    const { data: googleStatus } = useQuery({ queryKey: ["googleStatus"], queryFn: () => CustomFormService.checkGoogleStatus() });
    const isGoogleConnected = googleStatus?.data?.isConnected || false;

    const { data: formResponse, isLoading: isFormLoading } = useQuery({
        queryKey: ["form", slug],
        queryFn: () => CustomFormService.getFormBySlug(slug),
    });
    const form = formResponse?.data;

    const { data: submissionsResponse, isLoading: isSubmissionsLoading } = useQuery({
        queryKey: ["form-submissions", form?.id, currentPage, limit, searchTerm],
        queryFn: () => CustomFormService.getFormSubmissions(form?.id, { page: currentPage, limit, searchTerm }),
        enabled: !!form?.id,
    });

    const submissions = submissionsResponse?.data || [];
    const meta = submissionsResponse?.meta;
    const fields = form?.fields || [];

    const connectGoogleMutation = useMutation({
        mutationFn: () => CustomFormService.getGoogleAuthUrl(),
        onSuccess: (data) => { if (data?.data?.url) window.location.href = data.data.url; }
    });

    const syncSheetMutation = useMutation({
        mutationFn: () => CustomFormService.updateForm(form.id, { settings: { ...form.settings, syncToGoogleSheet: true } }),
        onSuccess: (response) => {
            toast.success("Google Sheet connected successfully!");
            queryClient.invalidateQueries({ queryKey: ["form", slug] });
            queryClient.invalidateQueries({ queryKey: ["forms"] });
            if (response?.data?.googleSheetUrl) {
                window.open(response.data.googleSheetUrl, "_blank");
            }
        }
    });

    const disconnectSheetMutation = useMutation({
        mutationFn: () => CustomFormService.updateForm(form.id, { settings: { ...form.settings, syncToGoogleSheet: false } }),
        onSuccess: () => {
            toast.success("Google Sheet disconnected successfully.");
            queryClient.invalidateQueries({ queryKey: ["form", slug] });
            queryClient.invalidateQueries({ queryKey: ["forms"] });
            setIsDisconnectOpen(false);
        }
    });

    const reconnectSheetMutation = useMutation({
        mutationFn: () => CustomFormService.updateForm(form.id, { settings: { ...form.settings, syncToGoogleSheet: true } }),
        onSuccess: () => {
            toast.success("Google Sheet reconnected successfully.");
            queryClient.invalidateQueries({ queryKey: ["form", slug] });
            queryClient.invalidateQueries({ queryKey: ["forms"] });
        }
    });

    const handleConnectSheet = () => {
        if (!isGoogleConnected) {
            toast.info("Connecting to Google Account...");
            connectGoogleMutation.mutate();
        } else {
            syncSheetMutation.mutate();
        }
    };

    const getExportData = () => {
        const headers = ["Submission Date", ...fields.map((f: any) => f.label)];
        const rows = submissions.map((sub: any) => {
            const row = [format(new Date(sub.createdAt), 'dd MMM yyyy, hh:mm a')];
            fields.forEach((f: any) => {
                const answer = sub.answers[f.id];
                row.push(Array.isArray(answer) ? answer.join(", ") : (answer || "N/A"));
            });
            return row;
        });
        return [headers, ...rows];
    };

    const exportToCSV = () => {
        if (!submissions.length) return toast.error("No data to export");
        const data = getExportData();
        const csvContent = data.map(row => row.map((cell: any) => `"${String(cell).replace(/"/g, '""')}"`).join(",")).join("\n");
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `${form.title}-Responses.csv`;
        link.click();
    };

    const exportToExcel = () => {
        if (!submissions.length) return toast.error("No data to export");
        const data = getExportData();
        const tsvContent = data.map(row => row.join("\t")).join("\n");
        const blob = new Blob([tsvContent], { type: "application/vnd.ms-excel;charset=utf-8;" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `${form.title}-Responses.xls`;
        link.click();
    };

    if (isFormLoading) return <div className="p-6 space-y-4"><Skeleton className="h-12 w-1/3" /><Skeleton className="h-64 w-full" /></div>;
    if (!form) return <div className="p-10 text-center text-red-500 font-bold">Form not found or inactive.</div>;

    return (
        <div className="p-6 space-y-6 animate-in fade-in zoom-in-[0.99] duration-500 ease-out">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" onClick={() => router.push("/admin/forms")} className="h-10 w-10 rounded-xl bg-white dark:bg-slate-900 shadow-sm border border-slate-200 dark:border-slate-800">
                        <ArrowLeft className="h-5 w-5" />
                    </Button>
                    <div className="p-3 bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl rounded-[20px] shadow-sm border border-white/60 dark:border-white/10 hidden sm:block">
                        <LayoutTemplate className="h-7 w-7 text-primary" />
                    </div>
                    <div>
                        <div className="flex items-center gap-3">
                            <h2 className="text-2xl md:text-3xl font-black tracking-tight text-slate-900 dark:text-white">{form.title}</h2>
                            <Badge className="bg-blue-500/10 text-blue-600 border-0 uppercase tracking-widest text-[10px] rounded-lg">Responses</Badge>
                        </div>
                        <p className="text-muted-foreground text-[13px] font-bold opacity-80 mt-1 flex items-center gap-2">
                            <Activity className="h-4 w-4" /> {meta?.total || 0} Applications
                        </p>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                    {form.googleSheetUrl ? (
                        <>
                            <a href={form.googleSheetUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-5 h-11 rounded-2xl font-bold bg-emerald-50 text-emerald-600 hover:bg-emerald-100 border border-emerald-200 transition-all shadow-sm">
                                <FileSpreadsheet className="h-4 w-4" /> View Sheet
                            </a>
                            {form.settings?.syncToGoogleSheet ? (
                                <Button onClick={() => setIsDisconnectOpen(true)} variant="outline" className="h-11 px-5 rounded-2xl font-bold border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 transition-all shadow-sm">
                                    <Unplug className="h-4 w-4 mr-2" /> Disconnect
                                </Button>
                            ) : (
                                <Button onClick={() => reconnectSheetMutation.mutate()} disabled={reconnectSheetMutation.isPending} variant="outline" className="h-11 px-5 rounded-2xl font-bold border-emerald-200 text-emerald-600 hover:bg-emerald-50 transition-all shadow-sm">
                                    {reconnectSheetMutation.isPending ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Link2 className="h-4 w-4 mr-2" />} 
                                    Reconnect
                                </Button>
                            )}
                        </>
                    ) : (
                        <Button onClick={handleConnectSheet} disabled={syncSheetMutation.isPending || connectGoogleMutation.isPending} className="h-11 px-5 rounded-2xl font-bold bg-white dark:bg-slate-900 text-slate-700 border border-slate-200 shadow-sm transition-all hover:bg-slate-50">
                            {syncSheetMutation.isPending || connectGoogleMutation.isPending ? <RefreshCw className="h-4 w-4 mr-2 animate-spin text-emerald-500" /> : <FileSpreadsheet className="h-4 w-4 mr-2 text-emerald-500" />} 
                            {syncSheetMutation.isPending ? "Connecting..." : "Connect Sheet"}
                        </Button>
                    )}
                    
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button className="h-11 px-5 rounded-2xl font-bold bg-primary text-white shadow-md shadow-primary/20 hover:shadow-lg transition-all">
                                <Download className="h-4 w-4 mr-2 stroke-[3]" /> Export Data
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48 rounded-2xl p-2 font-bold shadow-xl border-slate-100">
                            <DropdownMenuItem onClick={exportToCSV} className="cursor-pointer rounded-xl py-3 hover:bg-slate-50"><FileText className="mr-2 h-4 w-4 text-blue-500" /> Export as CSV</DropdownMenuItem>
                            <DropdownMenuItem onClick={exportToExcel} className="cursor-pointer rounded-xl py-3 hover:bg-slate-50"><TableProperties className="mr-2 h-4 w-4 text-emerald-500" /> Export as Excel</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            <Card className="rounded-[32px] bg-white/40 dark:bg-slate-900/40 backdrop-blur-2xl border-white/60 dark:border-white/10 shadow-sm overflow-hidden flex flex-col">
                <CardHeader className="bg-white/30 dark:bg-white/5 border-b p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <h3 className="text-[16px] font-black">Application Data</h3>
                    <div className="relative w-full md:w-[300px]">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input placeholder="Search responses..." className="pl-11 h-10 rounded-xl font-medium shadow-sm border-slate-200" value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }} />
                    </div>
                </CardHeader>
                <CardContent className="p-0 flex-1">
                    <div className="overflow-x-auto custom-scrollbar">
                        <Table>
                            <TableHeader className="bg-slate-50/50">
                                <TableRow>
                                    <TableHead className="pl-8 h-14 text-[11px] font-black text-slate-400 uppercase tracking-[2px]">Date</TableHead>
                                    {fields.slice(0, 4).map((f: any) => <TableHead key={f.id} className="h-14 text-[11px] font-black text-slate-400 uppercase tracking-[2px] truncate max-w-[150px]">{f.label}</TableHead>)}
                                    {fields.length > 4 && <TableHead className="h-14 text-[11px] font-black text-slate-400 uppercase tracking-[2px]">...</TableHead>}
                                    <TableHead className="text-right pr-8 h-14 text-[11px] font-black text-slate-400 uppercase tracking-[2px]">Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isSubmissionsLoading ? (
                                    <TableRow><TableCell colSpan={fields.length + 2} className="h-64 text-center font-bold animate-pulse text-slate-400">Loading records...</TableCell></TableRow>
                                ) : submissions.length === 0 ? (
                                    <TableRow><TableCell colSpan={fields.length + 2} className="h-64 text-center font-bold text-slate-400">No responses yet</TableCell></TableRow>
                                ) : (
                                    submissions.map((sub: any) => (
                                        <TableRow key={sub.id} className="hover:bg-slate-50/50 transition-colors">
                                            <TableCell className="pl-8 py-4 text-[13px] font-bold text-slate-500">{format(new Date(sub.createdAt), 'dd MMM yyyy, hh:mm a')}</TableCell>
                                            {fields.slice(0, 4).map((f: any) => {
                                                const answer = sub.answers[f.id];
                                                return (
                                                    <TableCell key={f.id} className="py-4 max-w-[150px] truncate text-[13px] font-medium text-slate-900">
                                                        {f.type === "FILE" && answer ? (
                                                            <a href={answer} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-indigo-600 hover:text-indigo-800 font-bold hover:underline">
                                                                <FileText className="h-3.5 w-3.5" /> View
                                                            </a>
                                                        ) : (
                                                            Array.isArray(answer) ? answer.join(", ") : (answer || "N/A")
                                                        )}
                                                    </TableCell>
                                                );
                                            })}
                                            {fields.length > 4 && <TableCell className="py-4 text-slate-400">...</TableCell>}
                                            <TableCell className="text-right pr-8 py-4">
                                                <Button variant="ghost" size="sm" onClick={() => setSelectedSubmission(sub)} className="h-9 rounded-xl text-blue-600 bg-blue-50/50 hover:bg-blue-100 font-black uppercase text-[11px] tracking-wider transition-all">
                                                    <Eye className="h-3.5 w-3.5 mr-1.5" /> View Full
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>

                {meta && meta.total > 0 && (
                    <div className="flex flex-col sm:flex-row items-center justify-between px-6 py-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50">
                        <div className="text-[13px] font-bold text-slate-500">
                            Showing <span className="text-slate-900 dark:text-white">{(currentPage - 1) * limit + 1}</span> to <span className="text-slate-900 dark:text-white">{Math.min(currentPage * limit, meta.total)}</span> of <span className="text-slate-900 dark:text-white">{meta.total}</span> records
                        </div>
                        <div className="flex items-center gap-6 mt-4 sm:mt-0">
                            <div className="flex items-center gap-2">
                                <span className="text-[13px] font-bold text-slate-500">Rows per page:</span>
                                <Select value={`${limit}`} onValueChange={(val) => { setLimit(Number(val)); setCurrentPage(1); }}>
                                    <SelectTrigger className="h-9 w-[70px] rounded-xl font-bold bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent className="rounded-xl">
                                        <SelectItem value="10" className="font-semibold">10</SelectItem>
                                        <SelectItem value="20" className="font-semibold">20</SelectItem>
                                        <SelectItem value="50" className="font-semibold">50</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button variant="outline" size="icon" onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))} disabled={currentPage === 1} className="h-9 w-9 rounded-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
                                    <ChevronLeft className="h-4 w-4" />
                                </Button>
                                <div className="px-3 h-9 flex items-center justify-center bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white rounded-xl font-black text-[13px] shadow-sm">
                                    {currentPage} / {meta.totalPage || 1}
                                </div>
                                <Button variant="outline" size="icon" onClick={() => setCurrentPage(prev => Math.min(meta.totalPage || 1, prev + 1))} disabled={currentPage === (meta.totalPage || 1)} className="h-9 w-9 rounded-xl border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950">
                                    <ChevronRight className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </Card>

            <Dialog open={!!selectedSubmission} onOpenChange={(open) => !open && setSelectedSubmission(null)}>
                <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-hidden flex flex-col p-0 rounded-[32px] border-white/20 shadow-2xl">
                    <DialogHeader className="p-6 border-b bg-slate-50 dark:bg-slate-900/50 shrink-0">
                        <DialogTitle className="text-[20px] font-black">Application Details</DialogTitle>
                        <p className="text-[13px] font-bold text-slate-500 mt-1">Submitted on {selectedSubmission && format(new Date(selectedSubmission.createdAt), 'dd MMMM yyyy, hh:mm a')}</p>
                    </DialogHeader>
                    <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-white dark:bg-slate-950">
                        {fields.map((field: any) => {
                            const answer = selectedSubmission?.answers?.[field.id];
                            const displayAnswer = Array.isArray(answer) ? answer.join(", ") : (answer || "N/A");
                            
                            return (
                                <div key={field.id} className="border-b border-slate-100 dark:border-slate-800 pb-4 last:border-0 last:pb-0">
                                    <p className="text-[12px] font-black uppercase tracking-wider text-slate-400 mb-2">{field.label}</p>
                                    {field.type === "FILE" && answer ? (
                                        <a href={answer} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-500/20 transition-colors border border-indigo-100 dark:border-indigo-500/20 font-bold text-[14px]">
                                            <ExternalLink className="h-4 w-4" /> View Attached File
                                        </a>
                                    ) : (
                                        <p className="text-[15px] font-bold text-slate-900 dark:text-white whitespace-pre-wrap leading-relaxed">{displayAnswer}</p>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                    <div className="p-5 bg-slate-50 dark:bg-slate-900 border-t shrink-0 flex justify-end">
                        <Button onClick={() => setSelectedSubmission(null)} className="rounded-xl px-8 font-bold bg-slate-900 text-white hover:bg-slate-800 shadow-md">Close</Button>
                    </div>
                </DialogContent>
            </Dialog>

            <Dialog open={isDisconnectOpen} onOpenChange={setIsDisconnectOpen}>
                <DialogContent className="sm:max-w-[425px] rounded-[32px] p-0 overflow-hidden border-0 shadow-2xl">
                    <div className="p-8 bg-red-50 dark:bg-red-500/10 flex flex-col items-center text-center">
                        <div className="h-20 w-20 bg-red-100 dark:bg-red-500/20 text-red-600 rounded-full flex items-center justify-center mb-5 shadow-sm">
                            <Unplug className="h-10 w-10" />
                        </div>
                        <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Disconnect Sheet?</h2>
                        <p className="text-[15px] font-medium text-slate-600 dark:text-slate-400 leading-relaxed">
                            New submissions will no longer be added to your Google Sheet. You can reconnect anytime.
                        </p>
                    </div>
                    <div className="p-6 flex items-center justify-between gap-3 bg-white dark:bg-slate-950">
                        <Button variant="ghost" onClick={() => setIsDisconnectOpen(false)} className="rounded-xl font-bold h-12 px-6 hover:bg-slate-100">Cancel</Button>
                        <Button variant="destructive" onClick={() => disconnectSheetMutation.mutate()} disabled={disconnectSheetMutation.isPending} className="rounded-xl font-black h-12 px-8 shadow-lg shadow-red-500/20 hover:shadow-xl hover:-translate-y-0.5 transition-all">
                            {disconnectSheetMutation.isPending ? "Disconnecting..." : "Yes, Disconnect"}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}