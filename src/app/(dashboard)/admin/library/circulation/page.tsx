"use client";

import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { LibraryService } from "@/services/library.service";
import { IssueBookModal } from "@/components/dashboard/library/issue-book-modal";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
    Search, 
    BookCheck, 
    ChevronRight, 
    Clock,
    History,
    AlertCircle,
    ChevronLeft,
    Loader2,
    RotateCcw
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function CirculationPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");

    // Debounce search
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearch(searchTerm);
        }, 500);
        return () => clearTimeout(handler);
    }, [searchTerm]);

    // This would fetch active issues (using getBooks query as a base for now, but filtered by ISSUED in future)
    const { isLoading, refetch } = useQuery({
        queryKey: ["library-issues", debouncedSearch],
        queryFn: () => LibraryService.getBooks(debouncedSearch), // Placeholder
    });

    const { data: stats, isLoading: isStatsLoading } = useQuery({
        queryKey: ["library-stats"],
        queryFn: () => LibraryService.getStats(),
    });

    const handleReturn = async (id: string) => {
        try {
            await LibraryService.returnBook(id);
            toast.success("Book returned successfully");
            refetch();
        } catch {
            toast.error("Failed to return book");
        }
    };

    return (
        <div className="space-y-6">
            {/* Header Section */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Circulation Desk</h2>
                    <p className="text-muted-foreground">Issue, return and track book circulation history.</p>
                </div>
                <IssueBookModal />
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-card p-6 rounded-xl border border-border shadow-sm flex items-center gap-4 group">
                    <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                        <Clock className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground font-bold tracking-wider uppercase">Active Issues</p>
                        <h3 className="text-2xl font-bold">
                            {isStatsLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : stats?.activeIssues || 0}
                        </h3>
                    </div>
                </div>
                <div className="bg-card p-6 rounded-xl border border-border shadow-sm flex items-center gap-4 group">
                    <div className="h-12 w-12 rounded-xl bg-amber-500/10 flex items-center justify-center text-amber-500 group-hover:bg-amber-500 group-hover:text-amber-foreground transition-all duration-300">
                        <AlertCircle className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground font-bold tracking-wider uppercase">Overdue</p>
                        <h3 className="text-2xl font-bold text-amber-500">
                            {isStatsLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : stats?.overdueIssues || 0}
                        </h3>
                    </div>
                </div>
                <div className="bg-card p-6 rounded-xl border border-border shadow-sm flex items-center gap-4 group">
                    <div className="h-12 w-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 group-hover:bg-emerald-500 group-hover:text-emerald-foreground transition-all duration-300">
                        <History className="h-6 w-6" />
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground font-bold tracking-wider uppercase">Issued Today</p>
                        <h3 className="text-2xl font-bold text-emerald-500">
                            {isStatsLoading ? <Loader2 className="h-5 w-5 animate-spin" /> : stats?.issuedToday || 0}
                        </h3>
                    </div>
                </div>
            </div>

            {/* Filters Section */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-card p-4 rounded-xl border border-border shadow-sm">
                <div className="relative w-full sm:max-w-xs">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search issues by ID or Book..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9 bg-muted/20 border-border"
                    />
                </div>
                <div className="flex items-center gap-2">
                   <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 text-[10px] font-bold py-1 px-3">
                        Filtering: ACTIVE ISSUES
                   </Badge>
                </div>
            </div>

            {/* Table Section */}
            <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader className="bg-muted/30 border-b border-border text-xs">
                            <TableRow>
                                <TableHead className="font-bold text-foreground">Book Details</TableHead>
                                <TableHead className="font-bold text-foreground">Issued To</TableHead>
                                <TableHead className="font-bold text-foreground">Issue Date</TableHead>
                                <TableHead className="font-bold text-foreground">Due Date</TableHead>
                                <TableHead className="font-bold text-foreground">Status</TableHead>
                                <TableHead className="text-right font-bold text-foreground">Action</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                Array.from({ length: 3 }).map((_, i) => (
                                    <TableRow key={i} className="border-b border-border/50">
                                        <TableCell><Skeleton className="h-4 w-[150px]" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-[120px]" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                                        <TableCell><Skeleton className="h-6 w-[80px] rounded-full" /></TableCell>
                                        <TableCell><Skeleton className="h-8 w-20 rounded-lg ml-auto" /></TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={6} className="h-60 text-center">
                                        <div className="flex flex-col items-center justify-center text-muted-foreground gap-2">
                                            <BookCheck className="h-12 w-12 opacity-20" />
                                            <p className="font-medium">No active issue records found for &quot;{debouncedSearch}&quot;.</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
                
                {/* Pagination Placeholder */}
                <div className="border-t border-border bg-muted/20 p-4 flex items-center justify-between">
                    <span className="text-sm text-muted-foreground font-bold">
                        Showing <span className="text-foreground">0</span> active issues
                    </span>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="sm" disabled className="h-8 w-8 p-0 rounded-lg"><ChevronLeft className="h-4 w-4" /></Button>
                        <div className="px-3 text-xs font-bold text-foreground/70 bg-background/50 py-1 rounded-md border border-border/50">Page 1</div>
                        <Button variant="outline" size="sm" disabled className="h-8 w-8 p-0 rounded-lg"><ChevronRight className="h-4 w-4" /></Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
