/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Plus, LayoutTemplate, ExternalLink, Copy, CheckCircle2, Search,
  FileSpreadsheet, ListChecks, MoreHorizontal, Pencil, Trash2,
  BarChart3, FileText, Globe, Clock, Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { CustomFormService } from "@/services/form.service";
import { SiteConfigService } from "@/services/site-config.service";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuSeparator, DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const STATUS_TABS = [
  { label: "All", value: "all" },
  { label: "Published", value: "PUBLISHED" },
  { label: "Draft", value: "DRAFT" },
  { label: "Closed", value: "CLOSED" },
];

export default function FormsPage() {
  const router = useRouter();
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { data: siteConfigResponse } = useQuery({
    queryKey: ["site-config"],
    queryFn: () => SiteConfigService.getMyConfig(),
  });

  const schoolSubdomain = siteConfigResponse?.data?.subdomain;
  const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "localhost:3000";
  const protocol = rootDomain.includes("localhost") ? "http://" : "https://";

  const { data: serverResponse, isLoading, refetch } = useQuery({
    queryKey: ["forms", searchTerm],
    queryFn: () => CustomFormService.getAllForms({ page: 1, limit: 100, searchTerm }),
  });

  const allForms: any[] = serverResponse?.data || [];
  const forms = allForms.filter((f) => statusFilter === "all" || f.status === statusFilter);

  const stats = {
    total: allForms.length,
    published: allForms.filter((f) => f.status === "PUBLISHED").length,
    drafts: allForms.filter((f) => f.status === "DRAFT").length,
    responses: allForms.reduce((sum: number, f: any) => sum + (f._count?.submissions || 0), 0),
  };

  const publicUrl = (slug: string) =>
    schoolSubdomain
      ? `${protocol}${schoolSubdomain}.${rootDomain}/f/${slug}`
      : `${window.location.origin}/f/${slug}`;

  const copyLink = (slug: string, id: string) => {
    navigator.clipboard.writeText(publicUrl(slug));
    setCopiedId(id);
    toast.success("Public link copied!");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this form? All responses will be lost.")) return;
    setDeletingId(id);
    try {
      await CustomFormService.deleteForm(id);
      toast.success("Form deleted.");
      refetch();
    } catch {
      toast.error("Failed to delete form.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="flex-1 space-y-6 p-8 pt-6">
      {/* --- Header --- */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 uppercase">Form Management</h2>
          <p className="text-sm text-zinc-500 mt-1">Create and manage custom forms for data collection and surveys.</p>
        </div>
        <Button
          onClick={() => router.push("/admin/forms/builder")}
          className="h-10 px-5 rounded-xl font-bold text-sm shadow-md bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 dark:text-zinc-900 transition-all gap-2"
        >
          <Plus className="h-4 w-4" /> Build New Form
        </Button>
      </div>

      {/* --- Stats Row --- */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Forms",   value: stats.total,     icon: FileText },
          { label: "Published",    value: stats.published, icon: Globe },
          { label: "Drafts",       value: stats.drafts,    icon: Clock },
          { label: "Submissions",   value: stats.responses, icon: BarChart3 },
        ].map(({ label, value, icon: Icon }) => (
          <div key={label} className="bg-white dark:bg-sidebar border border-zinc-200 dark:border-sidebar-border rounded-xl p-5 shadow-sm flex items-center gap-4">
            <div className="h-10 w-10 rounded-lg bg-zinc-50 dark:bg-zinc-800 flex items-center justify-center shrink-0 border border-zinc-100 dark:border-zinc-700/50">
              <Icon className="h-5 w-5 text-zinc-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 leading-none">{value}</p>
              <p className="text-[10px] text-zinc-400 font-black uppercase tracking-widest mt-1.5">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* --- Filters Table --- */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white dark:bg-sidebar p-4 rounded-xl border border-zinc-200 dark:border-sidebar-border shadow-sm">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
          <Input
            placeholder="Search by title or slug..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-zinc-800 h-10 rounded-lg text-sm font-medium"
          />
        </div>
        <div className="flex items-center gap-1.5 bg-zinc-50 dark:bg-background/40 p-1 rounded-lg border border-zinc-200 dark:border-sidebar-border">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setStatusFilter(tab.value)}
              className={cn(
                "px-4 py-1.5 rounded-md text-[10px] font-black uppercase tracking-widest transition-all",
                statusFilter === tab.value
                  ? "bg-white dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shadow-sm border border-zinc-200 dark:border-zinc-700"
                  : "text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* --- Data Table --- */}
      <div className="bg-white dark:bg-sidebar rounded-xl border border-zinc-200 dark:border-sidebar-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader className="bg-zinc-50/50 dark:bg-sidebar/30 border-b border-zinc-200 dark:border-sidebar-border">
              <TableRow className="hover:bg-transparent">
                <TableHead className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-500">Form Name</TableHead>
                <TableHead className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-500">Status</TableHead>
                <TableHead className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-500 text-center">Submissions</TableHead>
                <TableHead className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-500 text-right">Google Sheet</TableHead>
                <TableHead className="px-6 py-4 text-[10px] font-black uppercase tracking-widest text-zinc-500 text-right"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-64 text-center">
                    <div className="flex flex-col items-center justify-center text-zinc-500">
                      <Loader2 className="h-8 w-8 animate-spin mb-4 text-zinc-400" />
                      <p className="text-sm font-bold uppercase tracking-widest">Loading Forms...</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : forms.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-64 text-center text-zinc-400 font-bold uppercase tracking-widest text-xs">
                    No forms found.
                  </TableCell>
                </TableRow>
              ) : (
                forms.map((form: any) => {
                  const responseCount = form._count?.submissions || 0;
                  return (
                    <TableRow key={form.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-800/20 transition-all group border-b border-zinc-100 dark:border-zinc-800/50 last:border-0">
                      <TableCell className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-lg bg-zinc-900 dark:bg-zinc-100 flex items-center justify-center shrink-0">
                            <LayoutTemplate className="h-5 w-5 text-white dark:text-zinc-900" />
                          </div>
                          <div className="flex flex-col min-w-0">
                            <span className="font-bold text-zinc-950 dark:text-zinc-50 truncate group-hover:text-primary transition-colors cursor-pointer" onClick={() => router.push(`/admin/forms/builder?id=${form.id}`)}>
                              {form.title}
                            </span>
                            <span className="text-[10px] text-zinc-400 font-mono mt-0.5 truncate uppercase">/{form.slug}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-4">
                        <Badge variant="outline" className={cn("font-black text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full border shadow-none", 
                          form.status === "PUBLISHED" ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" :
                          form.status === "DRAFT" ? "bg-amber-500/10 text-amber-600 border-amber-500/20" :
                          "bg-zinc-500/10 text-zinc-600 border-zinc-500/20"
                        )}>
                          {form.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="px-6 py-4 text-center">
                        <div className="flex flex-col items-center">
                          <span className="text-lg font-black text-zinc-900 dark:text-zinc-100">{responseCount}</span>
                          <span className="text-[9px] font-black text-zinc-400 uppercase tracking-tighter">Submissions</span>
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-4 text-right">
                        <div className="flex flex-col items-end gap-1">
                          {form.googleSheetUrl ? (
                            <div className="flex items-center gap-1.5 text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">
                              <FileSpreadsheet className="h-3 w-3" /> Linked
                            </div>
                          ) : (
                            <div className="text-[10px] font-black text-zinc-400 uppercase tracking-widest">Not Linked</div>
                          )}
                          <span className="text-[9px] font-bold text-zinc-400/60 uppercase">{formatDistanceToNow(new Date(form.createdAt), { addSuffix: true })}</span>
                        </div>
                      </TableCell>
                      <TableCell className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                           <Button
                            variant="ghost"
                            size="sm"
                            className="h-9 px-4 rounded-lg text-[10px] font-black uppercase tracking-widest text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-all"
                            onClick={() => router.push(`/admin/forms/${form.slug}/submissions`)}
                          >
                            <ListChecks className="h-3.5 w-3.5 mr-2" /> Submissions
                          </Button>
                          
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 rounded-lg">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56 rounded-xl border-zinc-200 dark:border-zinc-800 shadow-xl p-1">
                              <DropdownMenuItem className="text-[11px] font-bold uppercase tracking-widest gap-3 cursor-pointer py-2.5" onClick={() => router.push(`/admin/forms/builder?id=${form.id}`)}>
                                <Pencil className="h-4 w-4 text-zinc-400" /> Edit Layout
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-[11px] font-bold uppercase tracking-widest gap-3 cursor-pointer py-2.5" onClick={() => copyLink(form.slug, form.id)}>
                                {copiedId === form.id ? <CheckCircle2 className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4 text-zinc-400" />}
                                {copiedId === form.id ? "Copied" : "Copy Link"}
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-[11px] font-bold uppercase tracking-widest gap-3 cursor-pointer py-2.5" onClick={() => window.open(publicUrl(form.slug), "_blank")}>
                                <ExternalLink className="h-4 w-4 text-zinc-400" /> View Form
                              </DropdownMenuItem>
                              <DropdownMenuSeparator className="bg-zinc-100 dark:bg-zinc-800" />
                              <DropdownMenuItem
                                className="text-[11px] font-bold uppercase tracking-widest gap-3 cursor-pointer py-2.5 text-rose-600 focus:text-rose-600 focus:bg-rose-50 dark:focus:bg-rose-900/20"
                                onClick={() => handleDelete(form.id)}
                                disabled={deletingId === form.id}
                              >
                                {deletingId === form.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                                Delete Form
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>
        
        <div className="border-t border-zinc-200 dark:border-sidebar-border bg-zinc-50/30 dark:bg-sidebar/40 p-4 flex items-center justify-between">
          <span className="text-[10px] text-zinc-400 font-black tracking-widest uppercase">
            Manage {forms.length} forms in your account.
          </span>
          <p className="text-[9px] font-bold text-zinc-400/50 uppercase tracking-tighter italic">
            Secure Form Distribution Active
          </p>
        </div>
      </div>
    </div>
  );
}