"use client";

import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import api from "@/lib/axios";
import { AddMemberModal } from "@/components/dashboard/library/add-member-modal";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { 
    Search, 
    Users, 
    ChevronLeft, 
    ChevronRight,
    MoreHorizontal,
    IdCard,
    IdCard as IdIcon,
    Loader2
} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

export default function MembersPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");

    // Debounce
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearch(searchTerm);
        }, 500);
        return () => clearTimeout(handler);
    }, [searchTerm]);

    const { isLoading } = useQuery({
        queryKey: ["library-members", debouncedSearch],
        queryFn: async () => {
            const response = await api.get("/library/books"); // Placeholder
            return response.data;
        },
    });

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Library Members</h2>
                    <p className="text-muted-foreground">Manage and track library access for students and staff.</p>
                </div>
                <AddMemberModal />
            </div>

            {/* Filters and Controls */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-card p-4 rounded-xl border border-border shadow-sm">
                <div className="relative w-full sm:max-w-xs">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search members by name or ID..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9 bg-muted/20 border-border"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 text-[10px] font-bold py-1 px-3">
                        Total Members: 0
                    </Badge>
                </div>
            </div>

            {/* Table Section */}
            <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader className="bg-muted/30 border-b border-border text-xs">
                            <TableRow>
                                <TableHead className="w-[300px] font-bold text-foreground">Member</TableHead>
                                <TableHead className="font-bold text-foreground">Member ID</TableHead>
                                <TableHead className="font-bold text-foreground">Role</TableHead>
                                <TableHead className="font-bold text-foreground">Membership Status</TableHead>
                                <TableHead className="text-right font-bold text-foreground"></TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <TableRow key={i} className="border-b border-border/50">
                                        <TableCell>
                                            <div className="flex items-center gap-3">
                                                <Skeleton className="h-10 w-10 rounded-full" />
                                                <Skeleton className="h-4 w-[120px]" />
                                            </div>
                                        </TableCell>
                                        <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                                        <TableCell><Skeleton className="h-6 w-[80px] rounded-full" /></TableCell>
                                        <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                                        <TableCell><Skeleton className="h-8 w-8 rounded-lg ml-auto" /></TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-60 text-center">
                                        <div className="flex flex-col items-center justify-center text-muted-foreground gap-2">
                                            <Users className="h-12 w-12 opacity-20" />
                                            <p className="font-medium">No library members found for &quot;{debouncedSearch}&quot;.</p>
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
                        Showing <span className="text-foreground">0</span> results
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
