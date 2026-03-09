"use client";

import { useState, Suspense } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Plus, Search, ShieldAlert, Building2 } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { SchoolService } from "@/services/school.service";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/use-debounce";
import { DataTable } from "./data-table";
import { SchoolDetailsModal } from "./school-details-modal";
import { columns } from "./columns";

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
            <div className="flex min-h-[60vh] items-center justify-center flex-col gap-4">
                <div className="h-16 w-16 bg-rose-50 dark:bg-rose-500/10 text-rose-500 rounded-full flex items-center justify-center">
                    <ShieldAlert className="h-8 w-8" />
                </div>
                <p className="text-rose-600 font-semibold text-lg">Registry connection failed</p>
                <Button variant="outline" onClick={() => window.location.reload()} className="h-9 font-medium text-xs">
                    Reconnect to Server
                </Button>
            </div>
        );
    }

    return (
        <PermissionGate
            required={PERMISSIONS.SCHOOL_VIEW}
            fallback={
                <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
                    <div className="h-20 w-20 bg-zinc-100 dark:bg-zinc-900 text-zinc-400 rounded-2xl flex items-center justify-center mb-6">
                        <Building2 className="h-10 w-10 opacity-50" />
                    </div>
                    <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">Global Registry Locked</h2>
                    <p className="text-zinc-500 mt-2 max-w-md mx-auto text-sm">
                        You do not have the required clearance level to view the registered institutions.
                    </p>
                </div>
            }
        >
            <div className="p-4 md:p-8 space-y-6 min-h-screen">
                {/* Header Section */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-zinc-200 dark:border-zinc-800">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
                            <Building2 className="h-6 w-6 text-zinc-700 dark:text-zinc-400" />
                            Institution Hub
                        </h1>
                        <p className="text-sm text-zinc-500 mt-1">
                            Manage and monitor all registered workspaces across the platform.
                        </p>
                    </div>

                    <PermissionGate required={PERMISSIONS.SCHOOL_CREATE}>
                        <Button className="h-10 px-5 rounded-lg font-semibold text-xs transition-colors shadow-sm w-full sm:w-auto">
                            <Plus className="mr-2 h-4 w-4" /> Provision Workspace
                        </Button>
                    </PermissionGate>
                </div>

                {/* Filter & Table Area */}
                <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800/80 rounded-xl shadow-sm overflow-hidden flex flex-col min-h-[500px]">
                    <div className="p-4 border-b border-zinc-100 dark:border-zinc-800/50 flex flex-col sm:flex-row items-center gap-4 bg-zinc-50/50 dark:bg-zinc-900/20">
                        <div className="relative w-full sm:max-w-md">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                            <Input
                                placeholder="Search by name, domain, or email..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-9 h-10 bg-white dark:bg-zinc-950 border-zinc-200 dark:border-zinc-800 shadow-sm text-sm"
                            />
                        </div>
                    </div>

                    <div className="flex-1 flex flex-col relative min-h-0">
                        {isLoading ? (
                            <div className="flex-1 flex items-center justify-center min-h-[400px]">
                                <div className="flex flex-col items-center gap-3 opacity-50">
                                    <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
                                    <p className="text-xs font-semibold text-zinc-500 uppercase tracking-widest">Syncing Registry...</p>
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
            <div className="flex min-h-[60vh] items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
            </div>
        }>
            <SchoolsContent />
        </Suspense>
    );
}