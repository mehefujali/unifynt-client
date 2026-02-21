"use client";

import { useState } from "react";
import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { Loader2, Banknote } from "lucide-react";
import { PayrollService } from "@/services/payroll.service";

import { useDebounce } from "@/hooks/use-debounce";
import { GenerateSalaryModal } from "./generate-salary-modal";
import { DataTable } from "./data-table";

export default function PayrollPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const debouncedSearchTerm = useDebounce(searchTerm, 500);

    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();

    const [selectedMonth, setSelectedMonth] = useState<string>(String(currentMonth));
    const [selectedYear, setSelectedYear] = useState<string>(String(currentYear));
    const [selectedStatus, setSelectedStatus] = useState<string>("");

    const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });

    const { data: response, isLoading, isError, isFetching } = useQuery({
        queryKey: ["payroll", pagination.pageIndex, pagination.pageSize, debouncedSearchTerm, selectedMonth, selectedYear, selectedStatus],
        queryFn: () => PayrollService.getAllSalarySlips({
            page: pagination.pageIndex + 1,
            limit: pagination.pageSize,
            searchTerm: debouncedSearchTerm || undefined,
            month: selectedMonth || undefined,
            year: selectedYear || undefined,
            status: selectedStatus || undefined,
        }),
        placeholderData: keepPreviousData,
    });

    if (isLoading && !response) {
        return <div className="flex h-[80vh] items-center justify-center"><Loader2 className="h-10 w-10 animate-spin text-primary" /></div>;
    }

    if (isError) {
        return <div className="flex h-[80vh] items-center justify-center text-destructive font-bold">Failed to load payroll data.</div>;
    }

    return (
        <div className="flex flex-col gap-8 p-8 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-background p-6 rounded-xl border shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-primary/10 rounded-lg"><Banknote className="h-6 w-6 text-primary" /></div>
                    <div>
                        <h1 className="text-2xl font-extrabold tracking-tight">Payroll Management</h1>
                        <p className="text-muted-foreground text-sm font-medium mt-1">Generate salaries, track disbursements, and view payslips.</p>
                    </div>
                </div>
                <div className="shrink-0">
                    <GenerateSalaryModal />
                </div>
            </div>

            <div className="bg-background rounded-xl border shadow-sm p-0 overflow-hidden relative">
                {isFetching && <div className="absolute top-0 left-0 w-full h-1 bg-primary/10 z-50 overflow-hidden"><div className="h-full bg-primary/60 animate-pulse w-1/2 rounded-full"></div></div>}

                <DataTable
                    data={response?.data || []}
                    pageCount={response?.meta?.totalPage || -1}
                    pagination={pagination}
                    onPaginationChange={setPagination}
                    searchTerm={searchTerm}
                    onSearchChange={setSearchTerm}
                    selectedMonth={selectedMonth}
                    setSelectedMonth={setSelectedMonth}
                    selectedYear={selectedYear}
                    setSelectedYear={setSelectedYear}
                    selectedStatus={selectedStatus}
                    setSelectedStatus={setSelectedStatus}
                />
            </div>
        </div>
    );
}