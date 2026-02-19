"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Loader2, Plus, Building2, Search } from "lucide-react";
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
        <div className="flex flex-col gap-8 p-8">
            <div className="flex items-center justify-between bg-card p-8 rounded-xl border shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="p-4 bg-primary/10 rounded-xl text-primary">
                        <Building2 className="h-8 w-8" />
                    </div>
                    <div className="space-y-1">
                        <h1 className="text-3xl font-bold tracking-tight text-foreground">
                            Client Schools
                        </h1>
                        <p className="text-base text-muted-foreground">
                            Monitor, manage, and renew subscriptions for all registered schools.
                        </p>
                    </div>
                </div>
                <Button size="lg" className="px-6 shadow-md">
                    <Plus className="mr-2 h-5 w-5" /> Add New School
                </Button>
            </div>

            <div className="bg-card rounded-xl border shadow-sm p-6 space-y-4">
                <div className="flex items-center max-w-sm px-3 border rounded-md bg-background focus-within:ring-2 focus-within:ring-ring">
                    <Search className="h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search by name, email, subdomain..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                    />
                </div>

                {isLoading ? (
                    <div className="flex h-[400px] items-center justify-center">
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

            <SchoolDetailsModal
                schoolId={schoolId}
                onClose={handleCloseModal}
            />
        </div>
    );
}