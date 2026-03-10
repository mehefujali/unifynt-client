/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format, subDays, parseISO, startOfDay } from "date-fns";
import { toast } from "sonner";
import {
  ArrowLeft, FileSpreadsheet, Download, Search, LayoutTemplate, Activity,
  RefreshCw, FileText, TableProperties, Eye, Unplug, Link2,
  ChevronLeft, ChevronRight, BarChart3, TrendingUp, Users, CheckCircle2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CustomFormService } from "@/services/form.service";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, BarChart, Bar, Cell
} from "recharts";
import { cn } from "@/lib/utils";

const COLORS = ["#6366f1", "#8b5cf6", "#ec4899", "#f59e0b", "#10b981", "#3b82f6"];

function AnalyticsView({ submissions, fields }: { submissions: any[]; fields: any[] }) {
  // Build last 14 days chart data
  const last14 = Array.from({ length: 14 }, (_, i) => {
    const day = startOfDay(subDays(new Date(), 13 - i));
    const count = submissions.filter((s) => startOfDay(parseISO(s.createdAt)).getTime() === day.getTime()).length;
    return { date: format(day, "MMM d"), count };
  });

  // Build per-field summary for choice fields
  const choiceFields = fields.filter((f) => ["RADIO", "CHECKBOX", "SELECT"].includes(f.type));
  const fieldSummaries = choiceFields.map((field: any) => {
    const tally: Record<string, number> = {};
    submissions.forEach((sub) => {
      const answer = sub.answers?.[field.id];
      const answers = Array.isArray(answer) ? answer : [answer];
      answers.forEach((a: string) => { if (a) tally[a] = (tally[a] || 0) + 1; });
    });
    return {
      field,
      data: Object.entries(tally).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value),
    };
  });

  const total = submissions.length;

  return (
    <div className="p-6 space-y-6">
      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Responses", value: total, icon: Users, color: "text-violet-500", bg: "bg-violet-50 dark:bg-violet-500/10" },
          { label: "Last 7 Days",  value: last14.slice(7).reduce((s, d) => s + d.count, 0), icon: TrendingUp, color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-500/10" },
          { label: "Today",        value: last14[last14.length - 1]?.count || 0, icon: Activity,   color: "text-blue-500",   bg: "bg-blue-50 dark:bg-blue-500/10" },
          { label: "Fields",       value: fields.length, icon: CheckCircle2, color: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-500/10" },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-4 flex items-center gap-3 shadow-sm">
            <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center shrink-0", bg)}>
              <Icon className={cn("h-5 w-5", color)} />
            </div>
            <div>
              <p className="text-xl font-bold text-zinc-900 dark:text-zinc-100">{value}</p>
              <p className="text-[10px] text-zinc-500 font-medium">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Responses over time chart */}
      <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-5">
          <BarChart3 className="h-4 w-4 text-primary" />
          <h3 className="text-sm font-bold text-zinc-800 dark:text-zinc-200">Responses Over Time</h3>
          <span className="text-xs text-zinc-400 ml-auto">Last 14 days</span>
        </div>
        <ResponsiveContainer width="100%" height={180}>
          <AreaChart data={last14}>
            <defs>
              <linearGradient id="responseGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} interval={1} />
            <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} allowDecimals={false} />
            <Tooltip
              contentStyle={{ borderRadius: "12px", border: "1px solid #e2e8f0", fontSize: "12px", padding: "8px 12px" }}
              labelStyle={{ fontWeight: 700 }}
            />
            <Area type="monotone" dataKey="count" stroke="#6366f1" strokeWidth={2} fill="url(#responseGrad)" name="Responses" dot={{ r: 3, fill: "#6366f1" }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Per-field summaries */}
      {fieldSummaries.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {fieldSummaries.map(({ field, data }) => (
            <div key={field.id} className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm">
              <h4 className="text-xs font-bold text-zinc-500 uppercase tracking-wider mb-4">{field.label}</h4>
              {data.length === 0 ? (
                <p className="text-xs text-zinc-400 text-center py-4">No responses yet</p>
              ) : (
                <ResponsiveContainer width="100%" height={150}>
                  <BarChart data={data} layout="vertical">
                    <XAxis type="number" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} allowDecimals={false} />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: "#64748b" }} axisLine={false} tickLine={false} width={80} />
                    <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid #e2e8f0", fontSize: "11px" }} />
                    <Bar dataKey="value" radius={[0, 6, 6, 0]} name="Responses">
                      {data.map((_: any, i: number) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

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

  // For analytics we need all submissions — fetch up to 1000
  const { data: allSubsResponse } = useQuery({
    queryKey: ["form-submissions-all", form?.id],
    queryFn: () => CustomFormService.getFormSubmissions(form?.id, { page: 1, limit: 1000 }),
    enabled: !!form?.id,
  });

  const submissions = submissionsResponse?.data || [];
  const allSubmissions = allSubsResponse?.data || [];
  const meta = submissionsResponse?.meta;
  const fields: any[] = form?.fields || [];

  const connectGoogleMutation = useMutation({
    mutationFn: () => CustomFormService.getGoogleAuthUrl(),
    onSuccess: (data) => { if (data?.data?.url) window.location.href = data.data.url; },
  });

  const syncSheetMutation = useMutation({
    mutationFn: () => CustomFormService.updateForm(form.id, { settings: { ...form.settings, syncToGoogleSheet: true } }),
    onSuccess: (response) => {
      toast.success("Google Sheet connected!");
      queryClient.invalidateQueries({ queryKey: ["form", slug] });
      if (response?.data?.googleSheetUrl) window.open(response.data.googleSheetUrl, "_blank");
    },
  });

  const disconnectSheetMutation = useMutation({
    mutationFn: () => CustomFormService.updateForm(form.id, { settings: { ...form.settings, syncToGoogleSheet: false } }),
    onSuccess: () => {
      toast.success("Google Sheet disconnected.");
      queryClient.invalidateQueries({ queryKey: ["form", slug] });
      setIsDisconnectOpen(false);
    },
  });

  const reconnectSheetMutation = useMutation({
    mutationFn: () => CustomFormService.updateForm(form.id, { settings: { ...form.settings, syncToGoogleSheet: true } }),
    onSuccess: () => { toast.success("Reconnected."); queryClient.invalidateQueries({ queryKey: ["form", slug] }); },
  });

  const getExportData = () => {
    const headers = ["Submission Date", ...fields.map((f) => f.label)];
    const rows = submissions.map((sub: any) => {
      const row = [format(new Date(sub.createdAt), "dd MMM yyyy, hh:mm a")];
      fields.forEach((f) => {
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
    const csv = data.map((row) => row.map((c: any) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const link = document.createElement("a");
    link.href = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8;" }));
    link.download = `${form.title}-Responses.csv`;
    link.click();
  };

  const exportToExcel = () => {
    if (!submissions.length) return toast.error("No data to export");
    const data = getExportData();
    const tsv = data.map((row) => row.join("\t")).join("\n");
    const link = document.createElement("a");
    link.href = URL.createObjectURL(new Blob([tsv], { type: "application/vnd.ms-excel;" }));
    link.download = `${form.title}-Responses.xls`;
    link.click();
  };

  if (isFormLoading) return (
    <div className="p-8 space-y-4">
      <Skeleton className="h-12 w-1/3" />
      <Skeleton className="h-[400px] w-full rounded-2xl" />
    </div>
  );
  if (!form) return <div className="p-10 text-center text-zinc-500 font-medium">Form not found or inactive.</div>;

  return (
    <div className="p-4 md:p-8 space-y-6 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => router.push("/admin/forms")} className="h-9 w-9 rounded-xl border-zinc-200 dark:border-zinc-800">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">{form.title}</h2>
              <span className="bg-zinc-100 text-zinc-600 dark:bg-zinc-800 dark:text-zinc-400 text-[10px] font-bold px-2 py-0.5 rounded-lg uppercase tracking-wider">
                {meta?.total || 0} responses
              </span>
            </div>
            <p className="text-sm text-zinc-500 mt-0.5 flex items-center gap-1.5">
              <Activity className="h-3.5 w-3.5" /> Collecting responses
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {form.googleSheetUrl ? (
            <>
              <a href={form.googleSheetUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-4 h-9 rounded-xl text-xs font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 dark:bg-emerald-500/10 dark:border-emerald-500/20 dark:text-emerald-400 transition-colors">
                <FileSpreadsheet className="h-3.5 w-3.5" /> View Sheet
              </a>
              {form.settings?.syncToGoogleSheet ? (
                <Button onClick={() => setIsDisconnectOpen(true)} variant="outline" className="h-9 px-4 rounded-xl text-xs font-semibold border-rose-200 text-rose-600 hover:bg-rose-50 dark:border-rose-500/20 dark:text-rose-400 dark:hover:bg-rose-500/10">
                  <Unplug className="h-3.5 w-3.5 mr-2" /> Disconnect
                </Button>
              ) : (
                <Button onClick={() => reconnectSheetMutation.mutate()} disabled={reconnectSheetMutation.isPending} variant="outline" className="h-9 px-4 rounded-xl text-xs font-semibold border-emerald-200 text-emerald-600 hover:bg-emerald-50 dark:border-emerald-500/20 dark:text-emerald-400">
                  {reconnectSheetMutation.isPending ? <RefreshCw className="h-3.5 w-3.5 mr-2 animate-spin" /> : <Link2 className="h-3.5 w-3.5 mr-2" />} Reconnect
                </Button>
              )}
            </>
          ) : (
            <Button onClick={() => isGoogleConnected ? syncSheetMutation.mutate() : connectGoogleMutation.mutate()} disabled={syncSheetMutation.isPending || connectGoogleMutation.isPending} variant="outline" className="h-9 px-4 rounded-xl text-xs font-semibold border-zinc-200 dark:border-zinc-800 shadow-sm">
              {(syncSheetMutation.isPending || connectGoogleMutation.isPending) ? <RefreshCw className="h-3.5 w-3.5 mr-2 animate-spin text-emerald-500" /> : <FileSpreadsheet className="h-3.5 w-3.5 mr-2 text-emerald-500" />}
              {syncSheetMutation.isPending ? "Connecting..." : "Connect Sheet"}
            </Button>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="h-9 px-4 rounded-xl text-xs font-semibold shadow-sm gap-2">
                <Download className="h-3.5 w-3.5" /> Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44 rounded-xl border-zinc-200 dark:border-zinc-800 shadow-xl">
              <DropdownMenuItem onClick={exportToCSV} className="cursor-pointer text-xs font-medium py-2 gap-2"><FileText className="h-3.5 w-3.5 text-blue-500" /> Export as CSV</DropdownMenuItem>
              <DropdownMenuItem onClick={exportToExcel} className="cursor-pointer text-xs font-medium py-2 gap-2"><TableProperties className="h-3.5 w-3.5 text-emerald-500" /> Export as Excel</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="analytics" className="space-y-0">
        <TabsList className="bg-zinc-100 dark:bg-zinc-900 rounded-xl p-1 gap-1">
          <TabsTrigger value="analytics" className="rounded-lg px-5 text-xs font-semibold data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-950 data-[state=active]:shadow-sm gap-2">
            <BarChart3 className="h-3.5 w-3.5" /> Analytics
          </TabsTrigger>
          <TabsTrigger value="responses" className="rounded-lg px-5 text-xs font-semibold data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-950 data-[state=active]:shadow-sm gap-2">
            <TableProperties className="h-3.5 w-3.5" /> Responses
          </TabsTrigger>
        </TabsList>

        <TabsContent value="analytics" className="mt-4">
          <AnalyticsView submissions={allSubmissions} fields={fields} />
        </TabsContent>

        <TabsContent value="responses" className="mt-4">
          <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm overflow-hidden flex flex-col min-h-[400px]">
            <div className="p-4 border-b border-zinc-100 dark:border-zinc-800/50 bg-zinc-50/50 dark:bg-zinc-900/20">
              <div className="relative w-full sm:max-w-sm">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                <Input placeholder="Search responses..." className="pl-9 h-10 rounded-xl text-sm bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 shadow-sm" value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }} />
              </div>
            </div>

            <div className="flex-1 overflow-x-auto">
              <Table>
                <TableHeader className="bg-zinc-50/50 dark:bg-zinc-900/50">
                  <TableRow className="border-b border-zinc-200 dark:border-zinc-800 hover:bg-transparent">
                    <TableHead className="h-11 px-5 text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Date</TableHead>
                    {fields.slice(0, 4).map((f) => (
                      <TableHead key={f.id} className="h-11 px-4 text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider truncate max-w-[140px]">{f.label}</TableHead>
                    ))}
                    {fields.length > 4 && <TableHead className="h-11 px-4 text-xs font-bold text-zinc-500">More</TableHead>}
                    <TableHead className="h-11 px-5 text-right text-xs font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isSubmissionsLoading ? (
                    <TableRow><TableCell colSpan={fields.length + 2} className="h-48 text-center"><div className="flex items-center justify-center gap-2 text-zinc-400"><RefreshCw className="h-4 w-4 animate-spin" /><span className="text-sm">Loading responses...</span></div></TableCell></TableRow>
                  ) : submissions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={fields.length + 2} className="h-64 text-center">
                        <div className="flex flex-col items-center gap-2 opacity-50"><LayoutTemplate className="h-8 w-8 text-zinc-400" /><p className="text-sm font-medium text-zinc-500">No responses yet</p></div>
                      </TableCell>
                    </TableRow>
                  ) : submissions.map((sub: any) => (
                    <TableRow key={sub.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30 transition-colors border-0">
                      <TableCell className="px-5 py-3.5 text-xs font-medium text-zinc-500">{format(new Date(sub.createdAt), "dd MMM yyyy, hh:mm a")}</TableCell>
                      {fields.slice(0, 4).map((f) => {
                        const answer = sub.answers[f.id];
                        return (
                          <TableCell key={f.id} className="px-4 py-3.5 max-w-[140px] truncate text-sm font-medium text-zinc-800 dark:text-zinc-200">
                            {f.type === "FILE" && answer ? (
                              <a href={answer} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 hover:underline"><FileText className="h-3 w-3" /> View</a>
                            ) : (
                              Array.isArray(answer) ? answer.join(", ") : (answer || <span className="text-zinc-400 italic text-xs">—</span>)
                            )}
                          </TableCell>
                        );
                      })}
                      {fields.length > 4 && <TableCell className="px-4 text-zinc-400 text-xs">+{fields.length - 4} more</TableCell>}
                      <TableCell className="px-5 py-3.5 text-right">
                        <Button variant="outline" size="sm" onClick={() => setSelectedSubmission(sub)} className="h-7 rounded-lg text-xs font-medium border-zinc-200 dark:border-zinc-800 gap-1">
                          <Eye className="h-3 w-3" /> View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {meta && meta.total > 0 && (
              <div className="p-3 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/30 dark:bg-zinc-900/20 flex items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-zinc-500">Rows:</span>
                  <Select value={`${limit}`} onValueChange={(v) => { setLimit(Number(v)); setCurrentPage(1); }}>
                    <SelectTrigger className="h-7 w-16 rounded-lg text-xs border-zinc-200 dark:border-zinc-800"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {["10", "20", "50"].map((v) => <SelectItem key={v} value={v} className="text-xs">{v}</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <span className="text-xs text-zinc-500">of <strong className="text-zinc-800 dark:text-zinc-200">{meta.total}</strong></span>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1} className="h-7 w-7 p-0 rounded-lg border-zinc-200 dark:border-zinc-800">
                    <ChevronLeft className="h-3.5 w-3.5" />
                  </Button>
                  <span className="text-xs font-medium text-zinc-500 px-1">{currentPage} / {meta.totalPage || 1}</span>
                  <Button variant="outline" size="sm" onClick={() => setCurrentPage((p) => Math.min(meta.totalPage || 1, p + 1))} disabled={currentPage === (meta.totalPage || 1)} className="h-7 w-7 p-0 rounded-lg border-zinc-200 dark:border-zinc-800">
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Submission Detail Dialog */}
      <Dialog open={!!selectedSubmission} onOpenChange={(open) => !open && setSelectedSubmission(null)}>
        <DialogContent className="sm:max-w-[560px] max-h-[85vh] overflow-hidden flex flex-col p-0 rounded-2xl bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 shadow-2xl">
          <DialogHeader className="p-5 border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 shrink-0">
            <DialogTitle className="text-base font-bold text-zinc-900 dark:text-zinc-100">Response Details</DialogTitle>
            <p className="text-xs font-medium text-zinc-500">
              Submitted {selectedSubmission && format(new Date(selectedSubmission.createdAt), "dd MMMM yyyy 'at' hh:mm a")}
            </p>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {fields.map((field) => {
              const answer = selectedSubmission?.answers?.[field.id];
              const display = Array.isArray(answer) ? answer.join(", ") : (answer || null);
              return (
                <div key={field.id} className="space-y-1">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">{field.label}</p>
                  {field.type === "FILE" && answer ? (
                    <a href={answer} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-xs font-medium">
                      <FileText className="h-3.5 w-3.5" /> View File
                    </a>
                  ) : display ? (
                    <p className="text-sm font-medium text-zinc-900 dark:text-zinc-100 bg-zinc-50 dark:bg-zinc-900 rounded-xl px-4 py-3 whitespace-pre-wrap">{display}</p>
                  ) : (
                    <p className="text-sm text-zinc-400 italic">—</p>
                  )}
                </div>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>

      {/* Disconnect Dialog */}
      <Dialog open={isDisconnectOpen} onOpenChange={setIsDisconnectOpen}>
        <DialogContent className="sm:max-w-[380px] rounded-2xl p-0 overflow-hidden bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 shadow-2xl">
          <div className="p-6 text-center">
            <div className="mx-auto h-12 w-12 bg-rose-50 dark:bg-rose-500/10 text-rose-600 flex items-center justify-center rounded-full mb-4">
              <Unplug className="h-6 w-6" />
            </div>
            <h2 className="text-base font-bold text-zinc-900 dark:text-zinc-100 mb-2">Disconnect Google Sheet?</h2>
            <p className="text-xs text-zinc-500">New submissions will no longer sync. You can reconnect anytime.</p>
          </div>
          <div className="p-4 border-t border-zinc-200 dark:border-zinc-800 flex gap-3">
            <Button variant="outline" onClick={() => setIsDisconnectOpen(false)} className="flex-1 h-9 rounded-xl text-xs font-semibold">Cancel</Button>
            <Button variant="destructive" onClick={() => disconnectSheetMutation.mutate()} disabled={disconnectSheetMutation.isPending} className="flex-1 h-9 rounded-xl text-xs font-semibold">
              {disconnectSheetMutation.isPending ? "Disconnecting..." : "Disconnect"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}