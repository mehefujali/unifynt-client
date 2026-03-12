"use client";

import { useState, Suspense } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
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
    const queryClient = useQueryClient();
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
            <div className="flex-1 space-y-4 p-8 pt-6">
                <div className="flex items-center justify-center h-[400px]">
                    <div className="flex flex-col items-center gap-4 text-center">
                        <div className="h-12 w-12 rounded-full bg-destructive/10 flex items-center justify-center text-destructive">
                            <ShieldAlert className="h-6 w-6" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold">Registry connection failed</h3>
                            <p className="text-sm text-muted-foreground">Unable to fetch registered institutions from the server.</p>
                        </div>
                        <Button variant="outline" onClick={() => queryClient.invalidateQueries({ queryKey: ["schools"] })}>
                            Try Again
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <PermissionGate
            required={PERMISSIONS.SCHOOL_VIEW}
            fallback={
                <div className="flex-1 space-y-4 p-8 pt-6">
                    <div className="flex items-center justify-center h-[400px]">
                        <div className="text-center space-y-2">
                            <h3 className="text-lg font-bold">Access Restricted</h3>
                            <p className="text-sm text-muted-foreground">You don&apos;t have permission to view registered institutions.</p>
                        </div>
                    </div>
                </div>
            }
        >
            <div className="flex-1 space-y-6 p-8 pt-6">
                <div className="flex items-center justify-between">
                    <div className="space-y-1">
                        <h2 className="text-3xl font-bold tracking-tight">Institution Hub</h2>
                        <p className="text-sm text-muted-foreground">
                            Manage and monitor all registered workspaces across the platform.
                        </p>
                    </div>

                    <PermissionGate required={PERMISSIONS.SCHOOL_CREATE}>
                        <Button onClick={() => { }} className="h-10">
                            <Plus className="mr-2 h-4 w-4" /> Provision Workspace
                        </Button>
                    </PermissionGate>
                </div>

                <div className="flex items-center justify-between gap-4 bg-card p-4 rounded-xl border border-border shadow-sm">
                    <div className="relative w-full max-w-sm">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search by name, domain, or email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9 bg-muted/20"
                        />
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground font-medium">
                        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-muted/30 rounded-lg border border-border">
                            <Building2 className="h-4 w-4" />
                            <span>{response?.meta?.total || 0} Registered</span>
                        </div>
                    </div>
                </div>

                <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden p-0">
                    {isLoading ? (
                        <div className="flex items-center justify-center h-96">
                            <div className="flex flex-col items-center gap-2">
                                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                                <p className="text-sm text-muted-foreground font-medium text-center">Syncing Registry...</p>
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
            <div className="flex-1 space-y-4 p-8 pt-6">
                <div className="flex items-center justify-center h-[400px]">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            </div>
        }>
            <SchoolsContent />
        </Suspense>
    );
}