/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus, Edit, LayoutTemplate, ExternalLink, Copy, CheckCircle2, Search, FileSpreadsheet, ListChecks, ChevronLeft, ChevronRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { CustomFormService } from "@/services/form.service";
import { SiteConfigService } from "@/services/site-config.service";
import { FormModal } from "./form-modal";

export default function FormsPage() {
    const router = useRouter();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedForm, setSelectedForm] = useState<any>(null);
    const [copiedId, setCopiedId] = useState<string | null>(null);
    
    const [currentPage, setCurrentPage] = useState(1);
    const [limit, setLimit] = useState(10);
    const [searchTerm, setSearchTerm] = useState("");

    const { data: siteConfigResponse } = useQuery({
        queryKey: ["site-config"],
        queryFn: () => SiteConfigService.getMyConfig()
    });
    
    const schoolSubdomain = siteConfigResponse?.data?.subdomain;
    const rootDomain = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "localhost:3000";
    const protocol = rootDomain.includes("localhost") ? "http://" : "https://";

    const { data: serverResponse, isLoading } = useQuery({
        queryKey: ["forms", currentPage, limit, searchTerm],
        queryFn: () => CustomFormService.getAllForms({ page: currentPage, limit, searchTerm }),
    });

    const forms = serverResponse?.data || [];
    const meta = serverResponse?.meta;

    const copyToClipboard = (slug: string, id: string) => {
        let url = `${window.location.origin}/f/${slug}`; 
        if (schoolSubdomain) url = `${protocol}${schoolSubdomain}.${rootDomain}/f/${slug}`;
        navigator.clipboard.writeText(url);
        setCopiedId(id);
        toast.success("Public link copied to clipboard!");
        setTimeout(() => setCopiedId(null), 2000);
    };

    return (
        <div className="p-4 md:p-8 space-y-6 min-h-screen">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-4 border-b border-zinc-200 dark:border-zinc-800">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                        <LayoutTemplate className="h-6 w-6 text-zinc-700 dark:text-zinc-400" />
                        Form Builder Studio
                    </h2>
                    <p className="text-sm text-zinc-500 mt-1">Manage, deploy and analyze dynamic forms and surveys.</p>
                </div>
                <Button 
                    onClick={() => { setSelectedForm(null); setIsModalOpen(true); }} 
                    className="h-10 px-5 rounded-lg font-semibold text-xs transition-colors shadow-sm w-full md:w-auto"
                >
                    <Plus className="mr-2 h-4 w-4" /> Create Form
                </Button>
            </div>

            <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800/80 rounded-xl shadow-sm overflow-hidden flex flex-col min-h-[500px]">
                <div className="p-4 border-b border-zinc-100 dark:border-zinc-800/50 flex flex-col sm:flex-row items-center justify-between gap-4 bg-zinc-50/50 dark:bg-zinc-900/20">
                    <div className="relative w-full sm:max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                        <Input
                            placeholder="Search forms..."
                            className="pl-9 h-10 bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 shadow-sm text-sm"
                            value={searchTerm}
                            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-x-auto custom-scrollbar">
                    <Table>
                        <TableHeader className="bg-zinc-50/50 dark:bg-zinc-900/50">
                            <TableRow className="border-b border-zinc-200 dark:border-zinc-800 hover:bg-transparent">
                                <TableHead className="h-11 px-5 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Form Details</TableHead>
                                <TableHead className="h-11 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Status</TableHead>
                                <TableHead className="h-11 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Responses</TableHead>
                                <TableHead className="h-11 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Integration</TableHead>
                                <TableHead className="h-11 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Public Link</TableHead>
                                <TableHead className="h-11 px-5 text-right text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody className="divide-y divide-zinc-100 dark:divide-zinc-800/50">
                            {isLoading ? (
                                <TableRow><TableCell colSpan={6} className="h-64 text-center text-zinc-400 font-medium animate-pulse">Loading forms...</TableCell></TableRow>
                            ) : forms.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-80 text-center">
                                        <div className="flex flex-col items-center justify-center space-y-3 opacity-60">
                                            <LayoutTemplate className="h-8 w-8 text-zinc-400" />
                                            <p className="text-sm font-medium text-zinc-500">No forms found</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                forms.map((item: any) => (
                                    <TableRow key={item.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30 transition-colors border-0">
                                        <TableCell className="px-5 py-3">
                                            <div className="flex flex-col gap-1">
                                                <span className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">{item.title}</span>
                                                <span className="text-xs text-zinc-500">Created: {new Date(item.createdAt).toLocaleDateString()}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="py-3">
                                            {item.status === "PUBLISHED" ? <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded">Published</span> 
                                            : item.status === "DRAFT" ? <span className="bg-zinc-100 text-zinc-600 border border-zinc-200 dark:bg-zinc-800 dark:text-zinc-400 dark:border-zinc-700 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded">Draft</span> 
                                            : <span className="bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-500/10 dark:text-rose-400 dark:border-rose-500/20 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded">Closed</span>}
                                        </TableCell>
                                        <TableCell className="py-3">
                                            <div onClick={() => router.push(`/admin/forms/${item.slug}/submissions`)} className="flex items-center gap-2 cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-800 p-1.5 -ml-1.5 rounded-lg transition-colors w-fit group">
                                                <div className="h-6 w-6 rounded bg-zinc-200 dark:bg-zinc-700 text-zinc-700 dark:text-zinc-300 flex items-center justify-center font-bold text-xs">{item._count?.submissions || 0}</div>
                                                <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400 group-hover:text-zinc-900 dark:group-hover:text-zinc-100">Submissions</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="py-3">
                                            {item.googleSheetUrl ? (
                                                <a href={item.googleSheetUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400 hover:underline w-fit"><FileSpreadsheet className="h-3.5 w-3.5" /> View Sheet</a>
                                            ) : <span className="text-xs text-zinc-400 italic">Not Synced</span>}
                                        </TableCell>
                                        <TableCell className="py-3">
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs font-mono text-zinc-500 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 max-w-[150px] truncate rounded py-1 px-2" title={schoolSubdomain ? `${schoolSubdomain}.${rootDomain}/f/${item.slug}` : `/f/${item.slug}`}>
                                                    /{item.slug}
                                                </span>
                                                <Button variant="ghost" size="icon" onClick={() => copyToClipboard(item.slug, item.id)} className="h-7 w-7 rounded hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-500">
                                                    {copiedId === item.id ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                                                </Button>
                                            </div>
                                        </TableCell>
                                        <TableCell className="px-5 py-3 text-right">
                                            <div className="flex justify-end gap-2">
                                                <Button variant="outline" size="icon" title="View Submissions" className="h-8 w-8 rounded-lg border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 shadow-sm" onClick={() => router.push(`/admin/forms/${item.slug}/submissions`)}>
                                                    <ListChecks className="h-4 w-4" />
                                                </Button>
                                                <Button variant="outline" size="icon" title="Edit Form" className="h-8 w-8 rounded-lg border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 shadow-sm" onClick={() => { setSelectedForm(item); setIsModalOpen(true); }}>
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button variant="outline" size="icon" title="View Public Link" className="h-8 w-8 rounded-lg border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100 shadow-sm" onClick={() => {
                                                    const url = schoolSubdomain ? `${protocol}${schoolSubdomain}.${rootDomain}/f/${item.slug}` : `${window.location.origin}/f/${item.slug}`;
                                                    window.open(url, "_blank");
                                                }}>
                                                    <ExternalLink className="h-4 w-4" />
                                                </Button>
                                            </div>
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
            <FormModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} initialData={selectedForm} />
        </div>
    );
}