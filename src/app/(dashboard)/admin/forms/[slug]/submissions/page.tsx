/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format, subDays, parseISO, startOfDay } from "date-fns";
import { toast } from "sonner";
import {
  ArrowLeft, FileSpreadsheet, Download, Search, LayoutTemplate, Activity,
  RefreshCw, FileText, TableProperties, Unplug, Link2,
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

const COLORS = ["#3b82f6", "#10b981", "#6366f1", "#f59e0b", "#ec4899", "#8b5cf6"];

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
          { label: "Total Submissions", value: total, icon: Users },
          { label: "Last 7 Days",  value: last14.slice(7).reduce((s, d) => s + d.count, 0), icon: TrendingUp },
          { label: "Submissions Today",   value: last14[last14.length - 1]?.count || 0, icon: Activity },
          { label: "Total Fields",  value: fields.length, icon: CheckCircle2 },
        ].map(({ label, value, icon: Icon }) => (
          <div key={label} className="bg-white dark:bg-sidebar border border-zinc-200 dark:border-sidebar-border rounded-xl p-4 flex items-center gap-3 shadow-sm">
            <div className="h-10 w-10 rounded-lg bg-zinc-50 dark:bg-zinc-800 flex items-center justify-center shrink-0 border border-zinc-100 dark:border-zinc-700/50">
              <Icon className="h-5 w-5 text-zinc-500" />
            </div>
            <div>
              <p className="text-xl font-bold text-zinc-900 dark:text-zinc-100">{value}</p>
              <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Responses over time chart */}
      <div className="bg-white dark:bg-sidebar border border-zinc-200 dark:border-sidebar-border rounded-xl p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-5">
          <BarChart3 className="h-4 w-4 text-zinc-400" />
          <h3 className="text-[11px] font-black uppercase tracking-widest text-zinc-500">Submission Trends</h3>
          <span className="text-[10px] text-zinc-400 ml-auto font-bold uppercase tracking-tighter">Last 14 days cycle</span>
        </div>
        <ResponsiveContainer width="100%" height={180}>
          <AreaChart data={last14}>
            <defs>
              <linearGradient id="responseGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#94a3b8" strokeOpacity={0.1} vertical={false} />
            <XAxis dataKey="date" tick={{ fontSize: 9, fill: "#94a3b8", fontWeight: 700 }} axisLine={false} tickLine={false} interval={1} />
            <YAxis tick={{ fontSize: 9, fill: "#94a3b8", fontWeight: 700 }} axisLine={false} tickLine={false} allowDecimals={false} />
            <Tooltip
              contentStyle={{ borderRadius: "12px", border: "1px solid #e2e8f0", fontSize: "11px", padding: "8px 12px", fontWeight: 700, textTransform: 'uppercase' }}
              labelStyle={{ fontWeight: 900, marginBottom: '4px' }}
            />
            <Area type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={3} fill="url(#responseGrad)" name="Acquisitions" dot={{ r: 4, fill: "#3b82f6", strokeWidth: 2, stroke: "#fff" }} activeDot={{ r: 6, strokeWidth: 0 }} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Per-field summaries */}
      {fieldSummaries.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {fieldSummaries.map(({ field, data }) => (
            <div key={field.id} className="bg-white dark:bg-sidebar border border-zinc-200 dark:border-sidebar-border rounded-xl p-5 shadow-sm">
              <h4 className="text-[10px] font-black text-zinc-400 uppercase tracking-widest mb-4">{field.label}</h4>
              {data.length === 0 ? (
                <p className="text-xs text-zinc-400 text-center py-4 font-bold uppercase">No responses found</p>
              ) : (
                <ResponsiveContainer width="100%" height={150}>
                  <BarChart data={data} layout="vertical">
                    <XAxis type="number" tick={{ fontSize: 10, fill: "#94a3b8", fontWeight: 700 }} axisLine={false} tickLine={false} allowDecimals={false} />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 9, fill: "#64748b", fontWeight: 800 }} axisLine={false} tickLine={false} width={80} />
                    <Tooltip contentStyle={{ borderRadius: "12px", border: "1px solid #e2e8f0", fontSize: "11px", fontWeight: 700 }} />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]} name="Responses">
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
      toast.success("Google Sheet linked!");
      queryClient.invalidateQueries({ queryKey: ["form", slug] });
      if (response?.data?.googleSheetUrl) window.open(response.data.googleSheetUrl, "_blank");
    },
  });

  const disconnectSheetMutation = useMutation({
    mutationFn: () => CustomFormService.updateForm(form.id, { settings: { ...form.settings, syncToGoogleSheet: false } }),
    onSuccess: () => {
      toast.success("Sync mapping removed.");
      queryClient.invalidateQueries({ queryKey: ["form", slug] });
      setIsDisconnectOpen(false);
    },
  });

  const reconnectSheetMutation = useMutation({
    mutationFn: () => CustomFormService.updateForm(form.id, { settings: { ...form.settings, syncToGoogleSheet: true } }),
    onSuccess: () => { toast.success("Refreshed sync mapping."); queryClient.invalidateQueries({ queryKey: ["form", slug] }); },
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
    if (!submissions.length) return toast.error("No submissions available");
    const data = getExportData();
    const csv = data.map((row) => row.map((c: any) => `"${String(c).replace(/"/g, '""')}"`).join(",")).join("\n");
    const link = document.createElement("a");
    link.href = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8;" }));
    link.download = `${form.title}-Submissions.csv`;
    link.click();
  };

  const exportToExcel = () => {
    if (!submissions.length) return toast.error("No submissions available");
    const data = getExportData();
    const tsv = data.map((row) => row.join("\t")).join("\n");
    const link = document.createElement("a");
    link.href = URL.createObjectURL(new Blob([tsv], { type: "application/vnd.ms-excel;" }));
    link.download = `${form.title}-Submissions.xls`;
    link.click();
  };

  if (isFormLoading) return (
    <div className="p-8 space-y-4">
      <Skeleton className="h-12 w-1/3 rounded-xl" />
      <Skeleton className="h-[400px] w-full rounded-2xl" />
    </div>
  );
  if (!form) return <div className="p-10 text-center text-zinc-400 font-black uppercase tracking-widest text-sm">Form Not Found.</div>;

  return (
    <div className="p-4 md:p-8 space-y-6 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-zinc-200 dark:border-zinc-800">
        <div className="flex items-center gap-4">
          <Button variant="outline" size="icon" onClick={() => router.push("/admin/forms")} className="h-9 w-9 rounded-xl border-zinc-200 dark:border-zinc-800 transition-all">
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-black tracking-tight text-zinc-900 dark:text-zinc-100 uppercase">{form.title}</h2>
              <span className="bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest">
                {meta?.total || 0} Submissions
              </span>
            </div>
            <p className="text-[10px] text-zinc-400 mt-0.5 flex items-center gap-1.5 font-bold uppercase tracking-widest">
              <Activity className="h-3 w-3" /> Collecting Responses
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {form.googleSheetUrl ? (
            <>
              <a href={form.googleSheetUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 px-4 h-9 rounded-xl text-[10px] font-black uppercase tracking-widest bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 dark:bg-emerald-500/10 dark:border-emerald-500/20 dark:text-emerald-400 transition-all">
                <FileSpreadsheet className="h-4 w-4" /> Google Sheet
              </a>
              {form.settings?.syncToGoogleSheet ? (
                <Button onClick={() => setIsDisconnectOpen(true)} variant="outline" className="h-9 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest border-rose-200 text-rose-600 hover:bg-rose-50 dark:border-rose-500/20 dark:text-rose-400 dark:hover:bg-rose-500/10">
                  <Unplug className="h-3.5 w-3.5 mr-2" /> Disconnect
                </Button>
              ) : (
                <Button onClick={() => reconnectSheetMutation.mutate()} disabled={reconnectSheetMutation.isPending} variant="outline" className="h-9 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest border-emerald-200 text-emerald-600 hover:bg-emerald-50 dark:border-emerald-500/20 dark:text-emerald-400">
                  {reconnectSheetMutation.isPending ? <RefreshCw className="h-3.5 w-3.5 mr-2 animate-spin" /> : <Link2 className="h-3.5 w-3.5 mr-2" />} Restore
                </Button>
              )}
            </>
          ) : (
            <Button onClick={() => isGoogleConnected ? syncSheetMutation.mutate() : connectGoogleMutation.mutate()} disabled={syncSheetMutation.isPending || connectGoogleMutation.isPending} variant="outline" className="h-9 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest border-zinc-200 dark:border-zinc-800 shadow-sm transition-all hover:bg-zinc-50 dark:hover:bg-zinc-900">
              {(syncSheetMutation.isPending || connectGoogleMutation.isPending) ? <RefreshCw className="h-3.5 w-3.5 mr-2 animate-spin text-zinc-400" /> : <Link2 className="h-3.5 w-3.5 mr-2 text-zinc-400" />}
              {syncSheetMutation.isPending ? "Connecting..." : "Connect to Sheet"}
            </Button>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="h-9 px-5 rounded-xl text-[10px] font-black uppercase tracking-widest bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 dark:text-zinc-900 transition-all gap-2">
                <Download className="h-3.5 w-3.5" /> Export Data
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48 rounded-xl border-zinc-200 dark:border-zinc-800 shadow-xl p-1">
              <DropdownMenuItem onClick={exportToCSV} className="cursor-pointer text-[10px] font-black uppercase tracking-widest py-2.5 gap-3"><FileText className="h-4 w-4 text-zinc-400" /> Export CSV</DropdownMenuItem>
              <DropdownMenuItem onClick={exportToExcel} className="cursor-pointer text-[10px] font-black uppercase tracking-widest py-2.5 gap-3"><TableProperties className="h-4 w-4 text-emerald-500" /> Export Excel</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="analytics" className="space-y-0">
        <TabsList className="bg-white dark:bg-sidebar rounded-xl p-1 border border-zinc-200 dark:border-sidebar-border gap-1">
          <TabsTrigger value="analytics" className="rounded-lg px-6 h-9 text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-800 data-[state=active]:shadow-sm data-[state=active]:border border-transparent data-[state=active]:border-zinc-200 dark:data-[state=active]:border-zinc-700 gap-2 transition-all">
            <BarChart3 className="h-3.5 w-3.5" /> Analytics
          </TabsTrigger>
          <TabsTrigger value="responses" className="rounded-lg px-6 h-9 text-[10px] font-black uppercase tracking-widest data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-800 data-[state=active]:shadow-sm data-[state=active]:border border-transparent data-[state=active]:border-zinc-200 dark:data-[state=active]:border-zinc-700 gap-2 transition-all">
            <TableProperties className="h-3.5 w-3.5" /> Raw Data
          </TabsTrigger>
        </TabsList>

        <TabsContent value="analytics" className="mt-4">
          <AnalyticsView submissions={allSubmissions} fields={fields} />
        </TabsContent>

        <TabsContent value="responses" className="mt-4">
          <div className="bg-white dark:bg-sidebar border border-zinc-200 dark:border-sidebar-border rounded-xl shadow-sm overflow-hidden flex flex-col min-h-[400px]">
            <div className="p-4 border-b border-zinc-100 dark:border-zinc-800/50 bg-zinc-50/50 dark:bg-zinc-900/20 flex items-center justify-between">
              <div className="relative w-full sm:max-w-xs">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                <Input placeholder="Filter submissions..." className="pl-9 h-10 rounded-lg text-xs bg-white dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 font-medium" value={searchTerm} onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }} />
              </div>
              <div className="text-[10px] font-black text-zinc-400 uppercase tracking-widest bg-zinc-50 dark:bg-zinc-800 px-3 py-1.5 rounded-lg border border-zinc-100 dark:border-zinc-700">
                Found {meta?.total || 0} Submissions
              </div>
            </div>

            <div className="flex-1 overflow-x-auto">
              <Table>
                <TableHeader className="bg-zinc-50/50 dark:bg-sidebar/30 border-b border-zinc-200 dark:border-sidebar-border">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="h-12 px-6 text-[10px] font-black uppercase tracking-widest text-zinc-500">Submission Date</TableHead>
                    {fields.slice(0, 4).map((f) => (
                      <TableHead key={f.id} className="h-12 px-5 text-[10px] font-black uppercase tracking-widest text-zinc-500 truncate max-w-[140px]">{f.label}</TableHead>
                    ))}
                    {fields.length > 4 && <TableHead className="h-12 px-5 text-[10px] font-black uppercase tracking-widest text-zinc-400">Extra</TableHead>}
                    <TableHead className="h-12 px-6 text-right text-[10px] font-black uppercase tracking-widest text-zinc-500">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isSubmissionsLoading ? (
                    <TableRow><TableCell colSpan={fields.length + 2} className="h-64 text-center"><div className="flex flex-col items-center justify-center gap-2 text-zinc-400 animate-pulse"><RefreshCw className="h-5 w-5 animate-spin" /><p className="text-[10px] font-black uppercase tracking-widest">Loading Data...</p></div></TableCell></TableRow>
                  ) : submissions.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={fields.length + 2} className="h-64 text-center">
                        <div className="flex flex-col items-center gap-2 opacity-50"><LayoutTemplate className="h-8 w-8 text-zinc-300" /><p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">No Submissions</p></div>
                      </TableCell>
                    </TableRow>
                  ) : submissions.map((sub: any) => (
                    <TableRow key={sub.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/20 transition-all border-b border-zinc-100 dark:border-zinc-800/50 last:border-0">
                      <TableCell className="px-6 py-4 text-[11px] font-bold text-zinc-400 uppercase">{format(new Date(sub.createdAt), "dd MMM yyyy, hh:mm a")}</TableCell>
                      {fields.slice(0, 4).map((f) => {
                        const answer = sub.answers[f.id];
                        return (
                          <TableCell key={f.id} className="px-5 py-4 max-w-[140px] truncate text-sm font-bold text-zinc-800 dark:text-zinc-200">
                            {f.type === "FILE" && answer ? (
                              <a href={answer} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-zinc-600 dark:text-zinc-400 hover:text-primary transition-colors"><FileText className="h-3 w-3" /> Artifact</a>
                            ) : (
                              Array.isArray(answer) ? answer.join(", ") : (answer || <span className="text-zinc-300 italic text-[10px] uppercase font-black tracking-widest">N/A</span>)
                            )}
                          </TableCell>
                        );
                      })}
                      {fields.length > 4 && <TableCell className="px-5 text-zinc-300 text-[10px] font-black uppercase">+{fields.length - 4}</TableCell>}
                      <TableCell className="px-6 py-4 text-right">
                        <Button variant="ghost" size="sm" onClick={() => setSelectedSubmission(sub)} className="h-8 px-4 rounded-lg text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all border border-transparent hover:border-zinc-200 dark:hover:border-zinc-700">
                          View Details
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {meta && meta.total > 0 && (
              <div className="p-3 border-t border-zinc-200 dark:border-sidebar-border bg-zinc-50/30 dark:bg-sidebar/40 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-black uppercase text-zinc-400 tracking-widest">Density:</span>
                  <Select value={`${limit}`} onValueChange={(v) => { setLimit(Number(v)); setCurrentPage(1); }}>
                    <SelectTrigger className="h-8 w-20 rounded-lg text-[10px] font-black uppercase tracking-widest bg-white dark:bg-sidebar border-zinc-200 dark:border-sidebar-border outline-none"><SelectValue /></SelectTrigger>
                    <SelectContent className="rounded-xl border-zinc-200 dark:border-zinc-700 p-1">
                      {["10", "20", "50", "100"].map((v) => <SelectItem key={v} value={v} className="text-[10px] font-black uppercase py-2 cursor-pointer">{v} Rows</SelectItem>)}
                    </SelectContent>
                  </Select>
                  <span className="text-[10px] font-black uppercase text-zinc-400 tracking-widest px-2 py-1 rounded-md bg-zinc-100 dark:bg-zinc-800">
                    Total: <strong className="text-zinc-900 dark:text-zinc-100">{meta.total}</strong>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} disabled={currentPage === 1} className="h-8 w-8 p-0 rounded-lg border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all">
                    <ChevronLeft className="h-4 w-4 text-zinc-500" />
                  </Button>
                  <div className="px-3 h-8 flex items-center justify-center text-[10px] font-black text-zinc-500 bg-white dark:bg-sidebar rounded-lg border border-zinc-200 dark:border-sidebar-border uppercase tracking-widest min-w-[80px]">
                    Page {currentPage} / {meta.totalPage || 1}
                  </div>
                  <Button variant="outline" size="sm" onClick={() => setCurrentPage((p) => Math.min(meta.totalPage || 1, p + 1))} disabled={currentPage === (meta.totalPage || 1)} className="h-8 w-8 p-0 rounded-lg border-zinc-200 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all">
                    <ChevronRight className="h-4 w-4 text-zinc-500" />
                  </Button>
                </div>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Submission Detail Dialog */}
      <Dialog open={!!selectedSubmission} onOpenChange={(open) => !open && setSelectedSubmission(null)}>
        <DialogContent className="sm:max-w-[560px] max-h-[85vh] overflow-hidden flex flex-col p-0 rounded-2xl bg-white dark:bg-sidebar border-zinc-200 dark:border-sidebar-border shadow-2xl">
          <DialogHeader className="p-6 border-b border-zinc-200 dark:border-sidebar-border bg-zinc-50/50 dark:bg-sidebar/50 shrink-0">
            <DialogTitle className="text-[14px] font-black uppercase tracking-widest text-zinc-900 dark:text-zinc-100">Submission Details</DialogTitle>
            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-1">
              Captured {selectedSubmission && format(new Date(selectedSubmission.createdAt), "dd MMMM yyyy 'at' hh:mm a")}
            </p>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto p-6 space-y-5 custom-scrollbar">
            {fields.map((field) => {
              const answer = selectedSubmission?.answers?.[field.id];
              const display = Array.isArray(answer) ? answer.join(", ") : (answer || null);
              return (
                <div key={field.id} className="space-y-2">
                  <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400 pl-1">{field.label}</p>
                  {field.type === "FILE" && answer ? (
                    <a href={answer} target="_blank" rel="noreferrer" className="inline-flex items-center gap-3 px-4 py-2.5 rounded-xl bg-zinc-100 dark:bg-background text-zinc-700 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-800 text-[11px] font-black uppercase tracking-widest transition-all">
                      <FileText className="h-4 w-4" /> View File
                    </a>
                  ) : display ? (
                    <div className="text-[13px] font-bold text-zinc-900 dark:text-zinc-100 bg-zinc-50 dark:bg-background/60 rounded-xl px-5 py-4 border border-zinc-100 dark:border-sidebar-border leading-relaxed break-words whitespace-pre-wrap">{display}</div>
                  ) : (
                    <div className="text-[10px] font-black text-zinc-300 uppercase italic tracking-widest pl-1">— No Data —</div>
                  )}
                </div>
              );
            })}
          </div>
          <div className="p-4 border-t border-zinc-200 dark:border-sidebar-border bg-zinc-50/30 dark:bg-sidebar/40 text-center">
             <p className="text-[9px] font-black text-zinc-400 uppercase tracking-tighter italic">Data Privacy & Security Verified</p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Disconnect Dialog */}
      <Dialog open={isDisconnectOpen} onOpenChange={setIsDisconnectOpen}>
        <DialogContent className="sm:max-w-[400px] rounded-2xl p-0 overflow-hidden bg-white dark:bg-sidebar border-zinc-200 dark:border-sidebar-border shadow-2xl">
          <div className="p-8 text-center bg-zinc-50/50 dark:bg-sidebar/10">
            <div className="mx-auto h-14 w-14 bg-rose-50 dark:bg-rose-500/10 text-rose-600 flex items-center justify-center rounded-2xl mb-5 border border-rose-100 dark:border-rose-500/20">
              <Unplug className="h-7 w-7" />
            </div>
            <h2 className="text-base font-black uppercase tracking-widest text-zinc-900 dark:text-zinc-100 mb-2">Disconnect Google Sheet?</h2>
            <p className="text-[11px] font-bold text-zinc-500 leading-relaxed uppercase tracking-tight">Access to sync data to this Google Sheet will be stopped.</p>
          </div>
          <div className="p-4 bg-white dark:bg-sidebar border-t border-zinc-200 dark:border-sidebar-border flex gap-3">
            <Button variant="ghost" onClick={() => setIsDisconnectOpen(false)} className="flex-1 h-11 rounded-xl text-[11px] font-black uppercase tracking-widest text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-900">Cancel</Button>
            <Button variant="destructive" onClick={() => disconnectSheetMutation.mutate()} disabled={disconnectSheetMutation.isPending} className="flex-1 h-11 rounded-xl text-[11px] font-black uppercase tracking-widest bg-rose-600 hover:bg-rose-700 text-white shadow-lg shadow-rose-600/20">
              {disconnectSheetMutation.isPending ? "Disconnecting..." : "Disconnect"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}