"use client";

import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { LibraryService, ILibraryBook } from "@/services/library.service";
import { AddBookModal } from "@/components/dashboard/library/add-book-modal";
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
    Book, 
    MoreHorizontal, 
    ChevronLeft, 
    ChevronRight,
    Filter,
    Loader2,
    BookOpen,
    Trash2,
    Edit2
} from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import Image from "next/image";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export default function BookListPage() {
    const [searchTerm, setSearchTerm] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");

    // Debounce search term
    useEffect(() => {
        const handler = setTimeout(() => {
            setDebouncedSearch(searchTerm);
        }, 500);
        return () => clearTimeout(handler);
    }, [searchTerm]);

    const { data: books, isLoading, error } = useQuery({
        queryKey: ["library-books", debouncedSearch],
        queryFn: () => LibraryService.getBooks(debouncedSearch),
    });

    const bookList = books?.data || [];

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Book Inventory</h2>
                    <p className="text-muted-foreground">Manage and track your school&apos;s physical book collection.</p>
                </div>
                <AddBookModal />
            </div>

            {/* Filters and Controls */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-card p-4 rounded-xl border border-border shadow-sm">
                <div className="relative w-full sm:max-w-xs">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search by title, author or ISBN..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-9 bg-muted/20 border-border"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="h-10 rounded-lg gap-2">
                        <Filter className="h-4 w-4" />
                        Filters
                    </Button>
                </div>
            </div>

            {/* Data Table */}
            <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <Table>
                        <TableHeader className="bg-muted/30 border-b border-border text-xs">
                            <TableRow>
                                <TableHead className="w-[80px] font-bold text-foreground">Cover</TableHead>
                                <TableHead className="min-w-[200px] font-bold text-foreground">Book Details</TableHead>
                                <TableHead className="font-bold text-foreground">Category</TableHead>
                                <TableHead className="font-bold text-foreground">Availability</TableHead>
                                <TableHead className="text-right font-bold text-foreground">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <TableRow key={i} className="border-b border-border/50">
                                        <TableCell><Skeleton className="h-14 w-10 rounded-lg" /></TableCell>
                                        <TableCell>
                                            <div className="space-y-2">
                                                <Skeleton className="h-4 w-[200px]" />
                                                <Skeleton className="h-3 w-[150px]" />
                                            </div>
                                        </TableCell>
                                        <TableCell><Skeleton className="h-4 w-[80px]" /></TableCell>
                                        <TableCell><Skeleton className="h-6 w-[100px] rounded-full" /></TableCell>
                                        <TableCell><Skeleton className="h-8 w-8 rounded-lg ml-auto" /></TableCell>
                                    </TableRow>
                                ))
                            ) : error ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-64 text-center text-red-500 font-medium">
                                        Failed to load books. Please try again.
                                    </TableCell>
                                </TableRow>
                            ) : bookList.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-64 text-center">
                                        <div className="flex flex-col items-center justify-center text-muted-foreground gap-2">
                                            <Book className="h-12 w-12 opacity-20" />
                                            <p className="font-medium">No books found in the inventory.</p>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ) : (
                                bookList.map((book: ILibraryBook) => {
                                    const availableCopies = book.copies?.filter(c => c.status === "AVAILABLE").length || 0;
                                    const totalCopies = book._count?.copies || 0;
                                    
                                    return (
                                        <TableRow key={book.id} className="hover:bg-muted/20 transition-colors border-b border-border/50 last:border-0">
                                            <TableCell>
                                                <div className="relative h-14 w-10 rounded-md overflow-hidden bg-muted border border-border shadow-sm">
                                                    {book.coverImage ? (
                                                        <Image 
                                                            src={book.coverImage} 
                                                            alt={book.title} 
                                                            fill 
                                                            className="object-cover" 
                                                        />
                                                    ) : (
                                                        <div className="h-full w-full flex items-center justify-center">
                                                            <BookOpen className="h-5 w-5 opacity-30" />
                                                        </div>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-foreground leading-tight">{book.title}</span>
                                                    <span className="text-xs text-muted-foreground font-medium">By {book.author}</span>
                                                    {book.isbn && <span className="text-[10px] text-muted-foreground font-mono mt-1">ISBN: {book.isbn}</span>}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="bg-primary/5 text-primary border-primary/20 text-[10px] font-bold uppercase tracking-wider">
                                                    {book.category || "General"}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex flex-col gap-1.5 min-w-[120px]">
                                                    <div className="flex items-center gap-2">
                                                        <div className={cn(
                                                            "h-2 w-2 rounded-full",
                                                            availableCopies > 0 ? "bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" : "bg-rose-500"
                                                        )} />
                                                        <span className="text-xs font-bold">{availableCopies} / {totalCopies} Available</span>
                                                    </div>
                                                    <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                                                        <div 
                                                            className="h-full bg-primary transition-all duration-700" 
                                                            style={{ width: `${(availableCopies / (totalCopies || 1)) * 100}%` }}
                                                        />
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell className="text-right">
                                                <DropdownMenu>
                                                    <DropdownMenuTrigger asChild>
                                                        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-lg">
                                                            <MoreHorizontal className="h-4 w-4" />
                                                        </Button>
                                                    </DropdownMenuTrigger>
                                                    <DropdownMenuContent align="end" className="w-40 p-1">
                                                        <DropdownMenuItem className="gap-2 font-medium cursor-pointer rounded-md">
                                                            <Edit2 className="h-3.5 w-3.5" />
                                                            Edit Details
                                                        </DropdownMenuItem>
                                                        <DropdownMenuItem className="gap-2 font-medium cursor-pointer rounded-md text-destructive hover:text-destructive">
                                                            <Trash2 className="h-3.5 w-3.5" />
                                                            Remove
                                                        </DropdownMenuItem>
                                                    </DropdownMenuContent>
                                                </DropdownMenu>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </div>
                
                {/* Pagination Placeholder */}
                <div className="border-t border-border bg-muted/20 p-4 flex items-center justify-between">
                    <span className="text-sm text-muted-foreground font-bold">
                        Showing <span className="text-foreground">{bookList.length}</span> results
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
