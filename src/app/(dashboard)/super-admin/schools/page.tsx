"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Plus, Building2, Search, SlidersHorizontal } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { SchoolService } from "@/services/school.service";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useDebounce } from "@/hooks/use-debounce";
import { DataTable } from "./data-table";
import { SchoolDetailsModal } from "./school-details-modal";
import { columns } from "./columns";

export default function SchoolsPage() {
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
            <div className="flex h-[80vh] items-center justify-center text-destructive text-lg font-medium">
                Failed to load schools data. Please try again later.
            </div>
        );
    }

    return (
        <div className="max-w-[1400px] mx-auto space-y-8 p-8">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-foreground">Registered Institutions</h1>
                    <p className="text-sm text-muted-foreground mt-1.5 font-medium">
                        Manage workspaces, monitor limits, and control billing for all client schools.
                    </p>
                </div>
                <Button size="lg" className="h-11 px-6 shadow-md font-bold">
                    <Plus className="mr-2 h-5 w-5" /> Provision Workspace
                </Button>
            </div>

            <div className="bg-card rounded-2xl border border-border/60 shadow-sm overflow-hidden">
                <div className="p-5 border-b border-border/50 bg-muted/10 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div className="relative w-full max-w-md">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search by school name, domain, or email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-9 h-11 bg-background border-border/60 shadow-sm"
                        />
                    </div>
                    <Button variant="outline" className="h-11 px-4 border-border/60 shadow-sm shrink-0">
                        <SlidersHorizontal className="mr-2 h-4 w-4 text-muted-foreground" />
                        Filters
                    </Button>
                </div>

                <div className="p-0">
                    {isLoading ? (
                        <div className="flex h-[500px] items-center justify-center">
                            <Loader2 className="h-8 w-8 animate-spin text-primary" />
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
    );
}