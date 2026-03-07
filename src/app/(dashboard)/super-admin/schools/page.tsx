/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, Suspense } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Plus, Search, SlidersHorizontal, ShieldAlert, Building2, Globe, Sparkles } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { SchoolService } from "@/services/school.service";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/use-debounce";
import { DataTable } from "./data-table";
import { SchoolDetailsModal } from "./school-details-modal";
import { columns } from "./columns";

// --- Import Permissions and Gate ---
import { PERMISSIONS } from "@/config/permissions";
import { PermissionGate } from "@/components/common/permission-gate";

function SchoolsContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const schoolId = searchParams.get("schoolId");

    const [searchTerm, setSearchTerm] = useState("");
    const debouncedSearchTerm = useDebounce(searchTerm, 500);

    const [pagination, setPagination] = useState({
        pageIndex: 0,
        pageSize: 10,
    });

    const { data: response, isLoading, isError } = useQuery({
        queryKey: ["schools", pagination.pageIndex, pagination.pageSize, debouncedSearchTerm],
        queryFn: () => SchoolService.getAllSchools({
            page: pagination.pageIndex + 1,
            limit: pagination.pageSize,
            searchTerm: debouncedSearchTerm || undefined,
        }),
    });

    const handleCloseModal = () => {
        router.push("/super-admin/schools", { scroll: false });
    };

    if (isError) {
        return (
            <div className="flex h-[80vh] items-center justify-center flex-col gap-4">
                <div className="h-16 w-16 bg-rose-50 dark:bg-rose-500/10 text-rose-500 rounded-full flex items-center justify-center shadow-inner">
                    <ShieldAlert className="h-8 w-8" />
                </div>
                <p className="text-destructive text-lg font-black uppercase tracking-tight">Registry connection failed</p>
                <Button variant="outline" onClick={() => window.location.reload()} className="rounded-xl font-bold">
                    Reconnect to Server
                </Button>
            </div>
        );
    }

    return (
        // 🔒 Global Gate: Entire Institution Registry Access
        <PermissionGate 
            required={PERMISSIONS.SCHOOL_VIEW}
            fallback={
                <div className="flex flex-col items-center justify-center py-32 text-center animate-in fade-in zoom-in-95 duration-500">
                    <div className="h-24 w-24 bg-zinc-100 dark:bg-white/5 text-zinc-400 rounded-3xl flex items-center justify-center mb-8 -rotate-3 shadow-xl">
                        <Building2 className="h-12 w-12 opacity-20" />
                    </div>
                    <h2 className="text-3xl font-black tracking-tight text-slate-900 dark:text-white uppercase">Global Registry Locked</h2>
                    <p className="text-muted-foreground mt-3 max-w-md mx-auto font-medium">
                        You do not have the required clearance level to view the registered institutions registry.
                    </p>
                </div>
            }
        >
            <div className="max-w-[1400px] mx-auto space-y-10 p-4 md:p-8 animate-in fade-in duration-700">
                {/* Header Section */}
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 bg-white/40 dark:bg-zinc-900/40 backdrop-blur-xl p-8 rounded-[40px] border border-white/20 dark:border-white/5 shadow-2xl shadow-black/5">
                    <div className="flex items-center gap-6">
                        <div className="p-5 bg-indigo-600 text-white rounded-[24px] shadow-2xl shadow-indigo-500/40 -rotate-3">
                            <Building2 className="h-8 w-8 stroke-[2.5]" />
                        </div>
                        <div className="space-y-1">
                            <h1 className="text-4xl font-black tracking-tighter text-slate-900 dark:text-white uppercase italic">
                                Institution Hub
                            </h1>
                            <div className="flex items-center gap-2">
                                <Globe className="h-3 w-3 text-emerald-500" />
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                                    Global Workspace Management & Monitoring
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="shrink-0">
                        {/* 🔒 Gate for School Provisioning Action */}
                        <PermissionGate required={PERMISSIONS.SCHOOL_CREATE}>
                            <Button 
                                size="lg" 
                                className="h-14 px-8 rounded-2xl font-black uppercase tracking-widest shadow-xl shadow-primary/20 transition-all hover:scale-[1.03] active:scale-95"
                            >
                                <Plus className="mr-2 h-5 w-5 stroke-[4]" /> Provision Workspace
                            </Button>
                        </PermissionGate>
                    </div>
                </div>

                {/* Filter & Table Area */}
                <div className="bg-card rounded-[32px] border border-border/60 shadow-sm overflow-hidden transition-all duration-500">
                    <div className="p-6 border-b border-border/50 bg-muted/10 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="relative w-full max-w-md">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <Input
                                placeholder="Search by school name, domain, or email..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-11 h-12 bg-background rounded-2xl border-slate-200 dark:border-slate-800 shadow-sm font-bold text-[13px]"
                            />
                        </div>
                        <div className="flex items-center gap-3 w-full sm:w-auto">
                            <Button variant="outline" className="h-12 px-6 rounded-2xl border-border/60 shadow-sm font-bold shrink-0 transition-all hover:bg-white dark:hover:bg-zinc-800">
                                <SlidersHorizontal className="mr-2.5 h-4 w-4 text-primary" />
                                Filter Parameters
                            </Button>
                        </div>
                    </div>

                    <div className="p-0">
                        {isLoading ? (
                            <div className="flex h-[500px] items-center justify-center">
                                <div className="flex flex-col items-center gap-4">
                                    <Loader2 className="h-10 w-10 animate-spin text-primary" />
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Syncing Registry...</p>
                                </div>
                            </div>
                        ) : (
                            <DataTable
                                columns={columns}
                                data={response?.data || []}
                                pageCount={response?.meta?.totalPage || -1}
                                pagination={pagination}
                                onPaginationChange={setPagination}
                            />
                        )}
                    </div>
                </div>

                <SchoolDetailsModal
                    schoolId={schoolId}
                    onClose={handleCloseModal}
                />
            </div>
        </PermissionGate>
    );
}

export default function SchoolsPage() {
    return (
        <Suspense fallback={
            <div className="flex h-[80vh] items-center justify-center">
                <div className="flex flex-col items-center gap-4">
                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                    <Sparkles className="h-6 w-6 text-primary/20 animate-pulse" />
                </div>
            </div>
        }>
            <SchoolsContent />
        </Suspense>
    );
}