"use client";

import * as React from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    ChevronLeft,
    ChevronRight,
    MoreHorizontal,
    Search,
    Eye,
    Pencil,
    Trash2,
    Plus
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Teacher } from "./types";
import { toast } from "sonner";
import { TeacherService } from "@/services/teacher.service";

interface DataTableProps {
    data: Teacher[];
}

export function DataTable({ data }: DataTableProps) {
    const [searchTerm, setSearchTerm] = React.useState("");
    const [currentPage, setCurrentPage] = React.useState(1);
    const itemsPerPage = 10;

    // Filter Logic
    const filteredData = React.useMemo(() => {
        return data.filter((teacher) =>
            teacher.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            teacher.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
            teacher.phone?.includes(searchTerm) ||
            teacher.user?.email.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [data, searchTerm]);

    // Pagination Logic
    const totalPages = Math.ceil(filteredData.length / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const paginatedData = filteredData.slice(startIndex, startIndex + itemsPerPage);

    const handleDelete = async (id: string) => {
        try {
            await TeacherService.deleteTeacher(id);
            toast.success("Teacher deleted successfully");
            window.location.reload();
        } catch (error) {
            toast.error("Failed to delete teacher");
        }
    };

    return (
        <div className="w-full space-y-4">
            {/* Search and Add Button */}
            <div className="flex items-center justify-between gap-4">
                <div className="relative w-full max-w-sm">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search teachers..."
                        value={searchTerm}
                        onChange={(e) => {
                            setSearchTerm(e.target.value);
                            setCurrentPage(1); // Reset to page 1 on search
                        }}
                        className="pl-8"
                    />
                </div>

            </div>

            {/* Table UI */}
            <div className="rounded-md border bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Teacher Name</TableHead>
                            <TableHead>Designation</TableHead>
                            <TableHead>Phone</TableHead>
                            <TableHead>Class Teacher</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {paginatedData.length > 0 ? (
                            paginatedData.map((teacher) => (
                                <TableRow key={teacher.id}>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-9 w-9">
                                                <AvatarImage src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${teacher.firstName}`} />
                                                <AvatarFallback>{teacher.firstName[0]}{teacher.lastName[0]}</AvatarFallback>
                                            </Avatar>
                                            <div className="flex flex-col">
                                                <span className="font-medium">{teacher.firstName} {teacher.lastName}</span>
                                                <span className="text-xs text-muted-foreground">{teacher.user?.email || "N/A"}</span>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>{teacher.designation || "N/A"}</TableCell>
                                    <TableCell>{teacher.phone || "N/A"}</TableCell>
                                    <TableCell>
                                        {teacher.assignedSection ? (
                                            <Badge variant="outline">
                                                Class {teacher.assignedSection.class.numericValue} - {teacher.assignedSection.name}
                                            </Badge>
                                        ) : (
                                            <span className="text-muted-foreground text-xs">N/A</span>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant={teacher.user?.status === "ACTIVE" ? "default" : "destructive"}>
                                            {teacher.user?.status || "ACTIVE"}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0">
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                <DropdownMenuItem onClick={() => navigator.clipboard.writeText(teacher.phone || "")}>
                                                    Copy Phone
                                                </DropdownMenuItem>
                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem asChild>
                                                    <Link href={`/admin/teachers/${teacher.id}`} className="flex items-center cursor-pointer">
                                                        <Eye className="mr-2 h-4 w-4" /> View Details
                                                    </Link>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem asChild>
                                                    <Link href={`/admin/teachers/${teacher.id}/edit`} className="flex items-center cursor-pointer">
                                                        <Pencil className="mr-2 h-4 w-4" /> Edit
                                                    </Link>
                                                </DropdownMenuItem>
                                                <DropdownMenuItem
                                                    className="text-red-600 focus:text-red-600 cursor-pointer"
                                                    onClick={() => handleDelete(teacher.id)}
                                                >
                                                    <Trash2 className="mr-2 h-4 w-4" /> Delete
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        ) : (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center">
                                    No results found.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center justify-end space-x-2 py-4">
                <div className="flex-1 text-sm text-muted-foreground">
                    Page {currentPage} of {totalPages || 1}
                </div>
                <div className="space-x-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                    >
                        <ChevronLeft className="h-4 w-4" /> Previous
                    </Button>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages || totalPages === 0}
                    >
                        Next <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        </div>
    );
}