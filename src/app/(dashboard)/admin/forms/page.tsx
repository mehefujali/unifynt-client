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
import { Card, CardContent, CardHeader } from "@/components/ui/card";
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
        <div className="p-6 space-y-6 animate-in fade-in zoom-in-[0.99] duration-500 ease-out">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-white/40 dark:bg-slate-800/40 backdrop-blur-xl rounded-[20px] shadow-sm border border-white/60 dark:border-white/10 ring-1 ring-black/5">
                        <LayoutTemplate className="h-7 w-7 text-primary" />
                    </div>
                    <div>
                        <h2 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white">Form Builder Studio</h2>
                        <p className="text-muted-foreground text-[14px] font-bold opacity-80 uppercase tracking-wide">Manage dynamic custom forms</p>
                    </div>
                </div>
                <Button 
                    onClick={() => { setSelectedForm(null); setIsModalOpen(true); }} 
                    className="rounded-2xl font-black px-8 h-12 shadow-xl shadow-primary/20 transition-all hover:shadow-2xl hover:-translate-y-0.5 bg-primary hover:bg-primary/90 text-white dark:text-slate-900"
                >
                    <Plus className="mr-2 h-5 w-5 stroke-[3]" /> Create Form
                </Button>
            </div>

            <Card className="rounded-[32px] bg-white/40 dark:bg-slate-900/40 backdrop-blur-2xl border-white/60 dark:border-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-none overflow-hidden flex flex-col">
                <CardHeader className="bg-white/30 dark:bg-white/5 border-b border-black/5 dark:border-white/5 p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <h3 className="text-[16px] font-black text-slate-800 dark:text-slate-200">Active Forms & Surveys</h3>
                    <div className="relative w-full md:w-[300px]">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                        <Input
                            placeholder="Search forms..."
                            className="pl-11 bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800 shadow-sm focus-visible:ring-primary/20 font-bold text-[13px] h-10 rounded-xl transition-all"
                            value={searchTerm}
                            onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                        />
                    </div>
                </CardHeader>

                <CardContent className="p-0 flex-1">
                    <div className="overflow-x-auto custom-scrollbar">
                        <Table>
                            <TableHeader className="bg-slate-50/50 dark:bg-white/5">
                                <TableRow className="hover:bg-transparent border-b-black/5 dark:border-b-white/5">
                                    <TableHead className="pl-8 h-14 text-[11px] font-black text-slate-400 uppercase tracking-[2px]">Form Details</TableHead>
                                    <TableHead className="h-14 text-[11px] font-black text-slate-400 uppercase tracking-[2px]">Status</TableHead>
                                    <TableHead className="h-14 text-[11px] font-black text-slate-400 uppercase tracking-[2px]">Responses</TableHead>
                                    <TableHead className="h-14 text-[11px] font-black text-slate-400 uppercase tracking-[2px]">Google Sheet</TableHead>
                                    <TableHead className="h-14 text-[11px] font-black text-slate-400 uppercase tracking-[2px]">Public Link</TableHead>
                                    <TableHead className="text-right pr-8 h-14 text-[11px] font-black text-slate-400 uppercase tracking-[2px]">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    <TableRow><TableCell colSpan={6} className="h-64 text-center text-slate-400 font-bold animate-pulse">Loading forms...</TableCell></TableRow>
                                ) : forms.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-80 text-center">
                                            <div className="flex flex-col items-center justify-center space-y-4">
                                                <div className="p-6 bg-slate-100 dark:bg-white/5 rounded-[32px] border border-dashed border-slate-300 dark:border-white/10 shadow-inner"><LayoutTemplate className="h-12 w-12 text-slate-300 dark:text-slate-700" /></div>
                                                <p className="text-[16px] font-black text-slate-600 dark:text-slate-400">No Forms Found</p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    forms.map((item: any) => (
                                        <TableRow key={item.id} className="group hover:bg-white/80 dark:hover:bg-white/5 transition-all border-b-black/5 dark:border-b-white/5">
                                            <TableCell className="pl-8 py-5">
                                                <div className="flex flex-col gap-1.5">
                                                    <span className="font-black text-[15px] text-slate-900 dark:text-white leading-none">{item.title}</span>
                                                    <span className="text-[11px] font-bold text-slate-400 uppercase">Created: {new Date(item.createdAt).toLocaleDateString()}</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-5">
                                                {item.status === "PUBLISHED" ? <Badge className="bg-emerald-500/10 text-emerald-600 border-0 font-black text-[10px] uppercase tracking-widest px-2.5 py-1 rounded-lg">Published</Badge> : item.status === "DRAFT" ? <Badge className="bg-slate-500/10 text-slate-600 dark:text-slate-400 border-0 font-black text-[10px] uppercase tracking-widest px-2.5 py-1 rounded-lg">Draft</Badge> : <Badge className="bg-red-500/10 text-red-600 border-0 font-black text-[10px] uppercase tracking-widest px-2.5 py-1 rounded-lg">Closed</Badge>}
                                            </TableCell>
                                            <TableCell className="py-5">
                                                <div onClick={() => router.push(`/admin/forms/${item.slug}/submissions`)} className="flex items-center gap-2 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-800 p-1.5 -ml-1.5 rounded-xl transition-all w-fit">
                                                    <div className="h-8 w-8 rounded-full bg-blue-500/10 text-blue-600 flex items-center justify-center font-black text-[12px]">{item._count?.submissions || 0}</div>
                                                    <span className="text-[12px] font-bold text-slate-500 hover:text-blue-600 transition-colors">Submissions</span>
                                                </div>
                                            </TableCell>
                                            <TableCell className="py-5">
                                                {item.googleSheetUrl ? (
                                                    <a href={item.googleSheetUrl} target="_blank" rel="noreferrer" className="flex items-center gap-1.5 text-[12px] font-bold text-green-600 bg-green-50 dark:bg-green-500/10 hover:bg-green-100 px-3 py-1.5 rounded-lg w-fit transition-colors"><FileSpreadsheet className="h-3.5 w-3.5" /> View Sheet</a>
                                                ) : <span className="text-[12px] font-bold text-slate-400 italic">Not Synced</span>}
                                            </TableCell>
                                            <TableCell className="py-5">
                                                <div className="flex items-center gap-2">
                                                    <Badge variant="outline" className="text-[11px] font-medium border-slate-200 dark:border-white/10 text-slate-500 bg-white dark:bg-white/5 max-w-[120px] truncate rounded-lg py-1 px-2.5" title={schoolSubdomain ? `${schoolSubdomain}.${rootDomain}/f/${item.slug}` : `/f/${item.slug}`}>
                                                        {schoolSubdomain ? `${schoolSubdomain}.${rootDomain}/f/${item.slug}` : `/f/${item.slug}`}
                                                    </Badge>
                                                    <Button variant="ghost" size="icon" onClick={() => copyToClipboard(item.slug, item.id)} className="h-7 w-7 rounded-lg hover:bg-slate-100 dark:hover:bg-white/10 text-slate-400 transition-all">
                                                        {copiedId === item.id ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                                                    </Button>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right pr-8 py-5">
                                                <div className="flex justify-end gap-2.5">
                                                    <Button variant="ghost" size="icon" title="View Submissions" className="h-10 w-10 rounded-xl bg-purple-50 dark:bg-purple-500/10 hover:bg-purple-100 dark:hover:bg-purple-500/20 text-purple-600 dark:text-purple-400 border border-purple-200/50 dark:border-purple-500/20 shadow-sm transition-all" onClick={() => router.push(`/admin/forms/${item.slug}/submissions`)}>
                                                        <ListChecks className="h-[18px] w-[18px] stroke-[2.5]" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" title="Edit Form" className="h-10 w-10 rounded-xl bg-white/50 dark:bg-slate-800/50 hover:bg-blue-500/10 text-slate-600 dark:text-slate-400 hover:text-blue-600 border border-black/5 dark:border-white/10 shadow-sm transition-all" onClick={() => { setSelectedForm(item); setIsModalOpen(true); }}>
                                                        <Edit className="h-[18px] w-[18px] stroke-[2.5]" />
                                                    </Button>
                                                    <Button variant="ghost" size="icon" title="View Public Link" className="h-10 w-10 rounded-xl bg-white/50 dark:bg-slate-800/50 hover:bg-emerald-500/10 text-slate-600 dark:text-slate-400 hover:text-emerald-600 border border-black/5 dark:border-white/10 shadow-sm transition-all" onClick={() => {
                                                        const url = schoolSubdomain ? `${protocol}${schoolSubdomain}.${rootDomain}/f/${item.slug}` : `${window.location.origin}/f/${item.slug}`;
                                                        window.open(url, "_blank");
                                                    }}>
                                                        <ExternalLink className="h-[18px] w-[18px] stroke-[2.5]" />
                                                    </Button>
                                                </div>
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
            <FormModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} initialData={selectedForm} />
        </div>
    );
}