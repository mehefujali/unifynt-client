/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  Plus, LayoutTemplate, ExternalLink, Copy, CheckCircle2, Search,
  FileSpreadsheet, ListChecks, MoreHorizontal, Pencil, Trash2,
  BarChart3, FileText, Globe, Lock, Clock, ArrowRight, Loader2
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

const STATUS_TABS = [
  { label: "All", value: "all" },
  { label: "Published", value: "PUBLISHED" },
  { label: "Draft", value: "DRAFT" },
  { label: "Closed", value: "CLOSED" },
];

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any; bg: string }> = {
  PUBLISHED: { label: "Published", color: "text-emerald-600 dark:text-emerald-400", icon: Globe, bg: "bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20" },
  DRAFT:     { label: "Draft",     color: "text-amber-600 dark:text-amber-400",   icon: Clock, bg: "bg-amber-50 dark:bg-amber-500/10 border-amber-200 dark:border-amber-500/20" },
  CLOSED:    { label: "Closed",    color: "text-zinc-500 dark:text-zinc-400",     icon: Lock,  bg: "bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700" },
};

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
    <div className="p-4 md:p-8 space-y-8 min-h-screen">
      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <LayoutTemplate className="h-6 w-6 text-primary" />
            Form Builder Studio
          </h1>
          <p className="text-sm text-zinc-500 mt-1">Create, deploy, and analyze forms and surveys.</p>
        </div>
        <Button
          onClick={() => router.push("/admin/forms/builder")}
          className="h-10 px-5 rounded-xl font-semibold text-sm shadow-md gap-2 bg-primary hover:bg-primary/90 transition-all"
        >
          <Plus className="h-4 w-4" /> New Form
        </Button>
      </div>

      {/* ── Stats Row ── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: "Total Forms",  value: stats.total,     icon: FileText,  color: "text-violet-500",  bg: "bg-violet-50 dark:bg-violet-500/10" },
          { label: "Published",    value: stats.published, icon: Globe,     color: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-500/10" },
          { label: "Drafts",       value: stats.drafts,    icon: Clock,     color: "text-amber-500",   bg: "bg-amber-50 dark:bg-amber-500/10" },
          { label: "Responses",    value: stats.responses, icon: BarChart3, color: "text-blue-500",    bg: "bg-blue-50 dark:bg-blue-500/10" },
        ].map(({ label, value, icon: Icon, color, bg }) => (
          <div key={label} className="relative overflow-hidden bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm flex items-center gap-4">
            <div className={cn("h-12 w-12 rounded-xl flex items-center justify-center shrink-0", bg)}>
              <Icon className={cn("h-6 w-6", color)} />
            </div>
            <div>
              <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">{value}</p>
              <p className="text-xs text-zinc-500 font-medium">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* ── Filter Bar ── */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative w-full sm:max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
          <Input
            placeholder="Search forms..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9 h-10 rounded-xl bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 shadow-sm"
          />
        </div>
        <div className="flex items-center gap-1 bg-zinc-100 dark:bg-zinc-900 rounded-xl p-1 flex-shrink-0">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setStatusFilter(tab.value)}
              className={cn(
                "px-4 py-1.5 rounded-lg text-xs font-semibold transition-all",
                statusFilter === tab.value
                  ? "bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 shadow-sm"
                  : "text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── Forms Grid ── */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-48 bg-zinc-100 dark:bg-zinc-900 animate-pulse rounded-2xl" />
          ))}
        </div>
      ) : forms.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="h-20 w-20 rounded-2xl bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center mb-5">
            <LayoutTemplate className="h-10 w-10 text-zinc-300 dark:text-zinc-700" />
          </div>
          <h3 className="text-lg font-bold text-zinc-700 dark:text-zinc-300 mb-1">No forms yet</h3>
          <p className="text-sm text-zinc-400 max-w-xs mb-6">Create your first form or survey to start collecting responses.</p>
          <Button onClick={() => router.push("/admin/forms/builder")} className="rounded-xl gap-2">
            <Plus className="h-4 w-4" /> Create your first form
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {forms.map((form: any) => {
            const cfg = STATUS_CONFIG[form.status] || STATUS_CONFIG.DRAFT;
            const StatusIcon = cfg.icon;
            const responseCount = form._count?.submissions || 0;
            return (
              <div
                key={form.id}
                className="group bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl shadow-sm hover:shadow-md hover:border-zinc-300 dark:hover:border-zinc-700 transition-all duration-200 flex flex-col overflow-hidden"
              >
                {/* card top accent by status */}
                <div className={cn("h-1 w-full", form.status === "PUBLISHED" ? "bg-emerald-400" : form.status === "DRAFT" ? "bg-amber-400" : "bg-zinc-300")} />

                <div className="p-5 flex flex-col flex-1 gap-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-sm text-zinc-900 dark:text-zinc-100 truncate group-hover:text-primary transition-colors">{form.title}</h3>
                      <p className="text-xs text-zinc-400 font-mono mt-0.5 truncate">/{form.slug}</p>
                    </div>
                    <span className={cn("inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full border", cfg.bg, cfg.color)}>
                      <StatusIcon className="h-2.5 w-2.5" /> {cfg.label}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-zinc-500">
                    <span className="flex items-center gap-1.5 font-medium">
                      <BarChart3 className="h-3.5 w-3.5 text-blue-400" />
                      {responseCount} response{responseCount !== 1 ? "s" : ""}
                    </span>
                    {form.googleSheetUrl && (
                      <span className="flex items-center gap-1.5 font-medium text-emerald-600 dark:text-emerald-400">
                        <FileSpreadsheet className="h-3.5 w-3.5" /> Sheets sync
                      </span>
                    )}
                    <span className="ml-auto text-zinc-400">{formatDistanceToNow(new Date(form.createdAt), { addSuffix: true })}</span>
                  </div>

                  <div className="flex items-center gap-2 pt-1 border-t border-zinc-100 dark:border-zinc-800/60">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 h-8 rounded-lg text-xs font-semibold border-zinc-200 dark:border-zinc-800 gap-1.5"
                      onClick={() => router.push(`/admin/forms/${form.slug}/submissions`)}
                    >
                      <ListChecks className="h-3.5 w-3.5" /> Responses
                      {responseCount > 0 && (
                        <Badge className="ml-0.5 h-4 px-1 text-[9px] bg-primary/10 text-primary border-0 font-bold">{responseCount}</Badge>
                      )}
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 px-3 rounded-lg text-xs font-semibold border-zinc-200 dark:border-zinc-800 gap-1.5"
                      onClick={() => router.push(`/admin/forms/builder?id=${form.id}`)}
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="outline" size="sm" className="h-8 w-8 p-0 rounded-lg border-zinc-200 dark:border-zinc-800">
                          <MoreHorizontal className="h-3.5 w-3.5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48 rounded-xl border-zinc-200 dark:border-zinc-800 shadow-xl">
                        <DropdownMenuItem className="text-xs font-medium gap-2 cursor-pointer py-2" onClick={() => copyLink(form.slug, form.id)}>
                          {copiedId === form.id ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                          {copiedId === form.id ? "Copied!" : "Copy Public Link"}
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-xs font-medium gap-2 cursor-pointer py-2" onClick={() => window.open(publicUrl(form.slug), "_blank")}>
                          <ExternalLink className="h-3.5 w-3.5" /> Open Public Form
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-xs font-medium gap-2 cursor-pointer py-2 text-rose-600 dark:text-rose-400 focus:text-rose-600 focus:bg-rose-50 dark:focus:bg-rose-500/10"
                          onClick={() => handleDelete(form.id)}
                          disabled={deletingId === form.id}
                        >
                          {deletingId === form.id ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
                          Delete Form
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>

                    {form.status === "PUBLISHED" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-3 rounded-lg text-xs font-semibold text-emerald-600 hover:bg-emerald-50 dark:text-emerald-400 dark:hover:bg-emerald-500/10 gap-1"
                        onClick={() => window.open(publicUrl(form.slug), "_blank")}
                      >
                        <ArrowRight className="h-3.5 w-3.5" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}