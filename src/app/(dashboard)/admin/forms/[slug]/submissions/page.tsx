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

    if (isFormLoading) return <div className="p-6 space-y-4"><Skeleton className="h-12 w-1/3" /><Skeleton className="h-[400px] w-full" /></div>;
    if (!form) return <div className="p-10 text-center text-zinc-500 font-medium">Form not found or inactive.</div>;

    return (
        <div className="p-4 md:p-8 space-y-6 min-h-screen">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-zinc-200 dark:border-zinc-800">
                <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" onClick={() => router.push("/admin/forms")} className="h-9 w-9 rounded-lg border-zinc-200 dark:border-zinc-800 shadow-sm">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <div>
                        <div className="flex items-center gap-2">
                            <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">{form.title}</h2>
                            <span className="bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 text-[10px] font-semibold px-2 py-0.5 rounded uppercase tracking-wider">Responses</span>
                        </div>
                        <p className="text-sm text-zinc-500 mt-1 flex items-center gap-1.5">
                            <Activity className="h-3.5 w-3.5" /> {meta?.total || 0} Submissions Collected
                        </p>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                    {form.googleSheetUrl ? (
                        <>
                            <a href={form.googleSheetUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-4 h-9 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 dark:bg-emerald-500/10 dark:border-emerald-500/20 dark:text-emerald-400 transition-colors">
                                <FileSpreadsheet className="h-3.5 w-3.5" /> View Sheet
                            </a>
                            {form.settings?.syncToGoogleSheet ? (
                                <Button onClick={() => setIsDisconnectOpen(true)} variant="outline" className="h-9 px-4 rounded-lg text-xs font-semibold border-rose-200 text-rose-600 hover:bg-rose-50 dark:border-rose-500/20 dark:text-rose-400 dark:hover:bg-rose-500/10 transition-colors">
                                    <Unplug className="h-3.5 w-3.5 mr-2" /> Disconnect
                                </Button>
                            ) : (
                                <Button onClick={() => reconnectSheetMutation.mutate()} disabled={reconnectSheetMutation.isPending} variant="outline" className="h-9 px-4 rounded-lg text-xs font-semibold border-emerald-200 text-emerald-600 hover:bg-emerald-50 dark:border-emerald-500/20 dark:text-emerald-400 dark:hover:bg-emerald-500/10 transition-colors">
                                    {reconnectSheetMutation.isPending ? <RefreshCw className="h-3.5 w-3.5 mr-2 animate-spin" /> : <Link2 className="h-3.5 w-3.5 mr-2" />} Reconnect
                                </Button>
                            )}
                        </>
                    ) : (
                        <Button onClick={handleConnectSheet} disabled={syncSheetMutation.isPending || connectGoogleMutation.isPending} variant="outline" className="h-9 px-4 rounded-lg text-xs font-semibold border-zinc-200 dark:border-zinc-800 shadow-sm transition-colors">
                            {syncSheetMutation.isPending || connectGoogleMutation.isPending ? <RefreshCw className="h-3.5 w-3.5 mr-2 animate-spin text-emerald-500" /> : <FileSpreadsheet className="h-3.5 w-3.5 mr-2 text-emerald-500" />}
                            {syncSheetMutation.isPending ? "Connecting..." : "Connect Sheet"}
                        </Button>
                    )}

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button className="h-9 px-4 rounded-lg text-xs font-semibold shadow-sm transition-colors">
                                <Download className="h-3.5 w-3.5 mr-2" /> Export
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40 rounded-xl border-zinc-200 dark:border-zinc-800">
                            <DropdownMenuItem onClick={exportToCSV} className="cursor-pointer text-xs font-medium py-2"><FileText className="mr-2 h-3.5 w-3.5 text-blue-500" /> Export as CSV</DropdownMenuItem>
                            <DropdownMenuItem onClick={exportToExcel} className="cursor-pointer text-xs font-medium py-2"><TableProperties className="mr-2 h-3.5 w-3.5 text-emerald-500" /> Export as Excel</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800/80 rounded-xl shadow-sm overflow-hidden flex flex-col min-h-[500px]">
                <div className="p-4 border-b border-zinc-100 dark:border-zinc-800/50 flex items-center justify-between gap-4 bg-zinc-50/50 dark:bg-zinc-900/20">
                    <div className="relative w-full sm:max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                        <Input placeholder="Search responses..." className="pl-9 h-10 rounded-lg text-sm bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 shadow-sm" value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }} />
                    </div>
                </div>

                <div className="flex-1 overflow-x-auto custom-scrollbar">
                    <Table>
                        <TableHeader className="bg-zinc-50/50 dark:bg-zinc-900/50">
                            <TableRow className="border-b border-zinc-200 dark:border-zinc-800 hover:bg-transparent">
                                <TableHead className="h-11 px-5 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Date</TableHead>
                                {fields.slice(0, 4).map((f: any) => <TableHead key={f.id} className="h-11 px-5 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider truncate max-w-[150px]">{f.label}</TableHead>)}
                                {fields.length > 4 && <TableHead className="h-11 px-5 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">...</TableHead>}
                                <TableHead className="h-11 px-5 text-right text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody className="divide-y divide-zinc-100 dark:divide-zinc-800/50">
                            {isSubmissionsLoading ? (
                                <TableRow><TableCell colSpan={fields.length + 2} className="h-64 text-center font-medium animate-pulse text-zinc-400">Loading records...</TableCell></TableRow>
                            ) : submissions.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={fields.length + 2} className="h-80 text-center">
                                        <div className="flex flex-col items-center justify-center space-y-3 opacity-60">
                                            <LayoutTemplate className="h-8 w-8 text-zinc-400" />
                                            <p className="text-sm font-medium text-zinc-500">No responses recorded yet</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                submissions.map((sub: any) => (
                                    <TableRow key={sub.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30 transition-colors border-0">
                                        <TableCell className="px-5 py-3 text-xs font-medium text-zinc-500">{format(new Date(sub.createdAt), 'dd MMM yyyy, hh:mm a')}</TableCell>
                                        {fields.slice(0, 4).map((f: any) => {
                                            const answer = sub.answers[f.id];
                                            return (
                                                <TableCell key={f.id} className="px-5 py-3 max-w-[150px] truncate text-sm font-medium text-zinc-900 dark:text-zinc-100">
                                                    {f.type === "FILE" && answer ? (
                                                        <a href={answer} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 hover:underline">
                                                            <FileText className="h-3.5 w-3.5" /> View
                                                        </a>
                                                    ) : (
                                                        Array.isArray(answer) ? answer.join(", ") : (answer || "N/A")
                                                    )}
                                                </TableCell>
                                            );
                                        })}
                                        {fields.length > 4 && <TableCell className="px-5 py-3 text-zinc-400">...</TableCell>}
                                        <TableCell className="px-5 py-3 text-right">
                                            <Button variant="outline" size="sm" onClick={() => setSelectedSubmission(sub)} className="h-8 rounded-lg text-xs font-medium border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-400 shadow-sm">
                                                <Eye className="h-3.5 w-3.5 mr-1.5" /> View
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>

                {meta && meta.total > 0 && (
                    <div className="p-3 border-t border-zinc-200 dark:border-zinc-800/80 bg-zinc-50/30 dark:bg-zinc-900/20 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="text-xs font-medium text-zinc-500 px-2">
                            Showing <span className="font-bold text-zinc-900 dark:text-zinc-100">{(currentPage - 1) * limit + 1}</span> to <span className="font-bold text-zinc-900 dark:text-zinc-100">{Math.min(currentPage * limit, meta.total)}</span> of <span className="font-bold text-zinc-900 dark:text-zinc-100">{meta.total}</span> records
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-medium text-zinc-500">Rows:</span>
                                <Select value={`${limit}`} onValueChange={(val) => { setLimit(Number(val)); setCurrentPage(1); }}>
                                    <SelectTrigger className="h-8 w-[70px] rounded-lg text-xs font-medium border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="10" className="text-xs">10</SelectItem>
                                        <SelectItem value="20" className="text-xs">20</SelectItem>
                                        <SelectItem value="50" className="text-xs">50</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="flex items-center gap-2">
                                <Button variant="outline" size="sm" onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))} disabled={currentPage === 1} className="h-8 px-3 rounded-lg text-xs font-medium border-zinc-200 dark:border-zinc-800">
                                    Previous
                                </Button>
                                <span className="text-xs font-medium text-zinc-500 px-1">
                                    {currentPage} / {meta.totalPage || 1}
                                </span>
                                <Button variant="outline" size="sm" onClick={() => setCurrentPage(prev => Math.min(meta.totalPage || 1, prev + 1))} disabled={currentPage === (meta.totalPage || 1)} className="h-8 px-3 rounded-lg text-xs font-medium border-zinc-200 dark:border-zinc-800">
                                    Next
                                </Button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            <Dialog open={!!selectedSubmission} onOpenChange={(open) => !open && setSelectedSubmission(null)}>
                <DialogContent className="sm:max-w-[600px] max-h-[85vh] overflow-hidden flex flex-col p-0 rounded-2xl bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 shadow-xl">
                    <DialogHeader className="p-5 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 shrink-0">
                        <DialogTitle className="text-lg font-bold text-zinc-900 dark:text-zinc-100">Application Details</DialogTitle>
                        <p className="text-xs font-medium text-zinc-500 mt-1">Submitted on {selectedSubmission && format(new Date(selectedSubmission.createdAt), 'dd MMMM yyyy, hh:mm a')}</p>
                    </DialogHeader>
                    <div className="flex-1 overflow-y-auto p-6 space-y-5 custom-scrollbar">
                        {fields.map((field: any) => {
                            const answer = selectedSubmission?.answers?.[field.id];
                            const displayAnswer = Array.isArray(answer) ? answer.join(", ") : (answer || "N/A");

                            return (
                                <div key={field.id} className="border-b border-zinc-100 dark:border-zinc-800/50 pb-4 last:border-0 last:pb-0">
                                    <p className="text-xs font-semibold text-zinc-500 mb-1.5">{field.label}</p>
                                    {field.type === "FILE" && answer ? (
                                        <a href={answer} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors text-xs font-medium">
                                            <ExternalLink className="h-3.5 w-3.5" /> View Attached File
                                        </a>
                                    ) : (
                                        <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 whitespace-pre-wrap">{displayAnswer}</p>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </DialogContent>
            </Dialog>

            <Dialog open={isDisconnectOpen} onOpenChange={setIsDisconnectOpen}>
                <DialogContent className="sm:max-w-[400px] rounded-2xl p-0 overflow-hidden bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 shadow-xl">
                    <div className="p-6 text-center">
                        <div className="mx-auto h-12 w-12 bg-rose-50 dark:bg-rose-500/10 text-rose-600 flex items-center justify-center rounded-full mb-4">
                            <Unplug className="h-6 w-6" />
                        </div>
                        <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 mb-2">Disconnect Google Sheet?</h2>
                        <p className="text-sm text-zinc-500">
                            New submissions will no longer be pushed to your Google Sheet. You can reconnect anytime.
                        </p>
                    </div>
                    <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 flex gap-3">
                        <Button variant="outline" onClick={() => setIsDisconnectOpen(false)} className="flex-1 h-10 rounded-lg text-xs font-semibold">Cancel</Button>
                        <Button variant="destructive" onClick={() => disconnectSheetMutation.mutate()} disabled={disconnectSheetMutation.isPending} className="flex-1 h-10 rounded-lg text-xs font-semibold">
                            {disconnectSheetMutation.isPending ? "Disconnecting..." : "Disconnect"}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}