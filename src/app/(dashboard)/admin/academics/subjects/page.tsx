"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus, Edit, Trash2, Search, BookOpen, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { SubjectService } from "@/services/subject.service";
import { SubjectModal, ISubject } from "./subject-modal";
import { DeleteSubjectModal } from "./delete-subject-modal";
import { useDebounce } from "@/hooks/use-debounce"; // Ensure you have this hook, or remove debounce logic if not needed

export default function SubjectsPage() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
    const [selectedSubject, setSelectedSubject] = useState<ISubject | null>(null);
    const [searchTerm, setSearchTerm] = useState("");

    // Debounce the search term to avoid too many API calls
    const debouncedSearch = useDebounce(searchTerm, 500);

    const { data, isLoading } = useQuery({
        queryKey: ["subjects", debouncedSearch],
        queryFn: () => SubjectService.getAllSubjects({ searchTerm: debouncedSearch }),
    });

    const handleEdit = (subject: ISubject) => {
        setSelectedSubject(subject);
        setIsModalOpen(true);
    };

    const handleDelete = (subject: ISubject) => {
        setSelectedSubject(subject);
        setIsDeleteModalOpen(true);
    };

    const handleAddNew = () => {
        setSelectedSubject(null);
        setIsModalOpen(true);
    };

    // Helper function to render beautiful premium badges for dark/light mode
    const renderTypeBadge = (type: string) => {
        switch (type) {
            case "THEORY":
                return <Badge variant="secondary" className="bg-blue-500/10 text-blue-700 hover:bg-blue-500/20 dark:text-blue-400 border-0">Theory</Badge>;
            case "PRACTICAL":
                return <Badge variant="secondary" className="bg-emerald-500/10 text-emerald-700 hover:bg-emerald-500/20 dark:text-emerald-400 border-0">Practical</Badge>;
            case "OPTIONAL":
                return <Badge variant="secondary" className="bg-purple-500/10 text-purple-700 hover:bg-purple-500/20 dark:text-purple-400 border-0">Optional</Badge>;
            case "LAB":
                return <Badge variant="secondary" className="bg-orange-500/10 text-orange-700 hover:bg-orange-500/20 dark:text-orange-400 border-0">Lab</Badge>;
            default:
                return <Badge variant="outline">{type}</Badge>;
        }
    };

    return (
        <div className="p-6 space-y-6 animate-in fade-in duration-300">

            {/* Header Section */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-extrabold tracking-tight text-foreground">Subjects Overview</h2>
                    <p className="text-muted-foreground mt-1 text-sm">
                        Create and manage all academic subjects, lab codes, and credits.
                    </p>
                </div>
                <Button onClick={handleAddNew} className="shadow-md">
                    <Plus className="mr-2 h-4 w-4" /> Add New Subject
                </Button>
            </div>

            {/* Main Content Card */}
            <Card className="border-border/60 shadow-sm">
                <CardHeader className="flex flex-col md:flex-row justify-between items-center gap-4 bg-muted/20 border-b border-border/40 pb-4">
                    <div className="flex items-center gap-2 w-full md:w-auto">
                        <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <BookOpen className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <CardTitle className="text-lg">Academic Subjects</CardTitle>
                            <CardDescription>View and filter the registered subjects.</CardDescription>
                        </div>
                    </div>

                    {/* Search Bar */}
                    <div className="relative w-full md:w-[300px]">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search by name or code..."
                            className="pl-9 bg-background focus-visible:ring-primary/20"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </CardHeader>

                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <Table>
                            <TableHeader className="bg-muted/30">
                                <TableRow className="hover:bg-transparent border-border/50">
                                    <TableHead className="font-semibold text-foreground pl-6">Subject Name</TableHead>
                                    <TableHead className="font-semibold text-foreground">Code</TableHead>
                                    <TableHead className="font-semibold text-foreground">Type</TableHead>
                                    <TableHead className="font-semibold text-foreground text-center">Credit Points</TableHead>
                                    <TableHead className="font-semibold text-foreground text-right pr-6">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {isLoading ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-48 text-center">
                                            <div className="flex flex-col items-center justify-center text-muted-foreground">
                                                <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
                                                <p className="text-sm font-medium">Loading subjects...</p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : data?.data?.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-64 text-center">
                                            <div className="flex flex-col items-center justify-center text-muted-foreground">
                                                <div className="h-16 w-16 rounded-full bg-muted/50 flex items-center justify-center mb-4">
                                                    <BookOpen className="h-8 w-8 text-muted-foreground/50" />
                                                </div>
                                                <p className="text-lg font-semibold text-foreground">No subjects found</p>
                                                <p className="text-sm mt-1">Try adjusting your search or add a new subject.</p>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    data?.data?.map((subject: ISubject) => (
                                        <TableRow key={subject.id} className="group border-border/50 hover:bg-muted/40 transition-colors">
                                            <TableCell className="pl-6 font-medium text-foreground">
                                                {subject.name}
                                            </TableCell>
                                            <TableCell>
                                                <Badge variant="outline" className="font-mono bg-background text-xs text-muted-foreground">
                                                    {subject.code}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                {renderTypeBadge(subject.type)}
                                            </TableCell>
                                            <TableCell className="text-center font-medium">
                                                {subject.credit ? (
                                                    <span className="text-foreground">{subject.credit}</span>
                                                ) : (
                                                    <span className="text-muted-foreground/50">-</span>
                                                )}
                                            </TableCell>
                                            <TableCell className="text-right pr-6">
                                                <div className="flex justify-end items-center gap-2 opacity-100 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 hover:bg-blue-500/10 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                                                        onClick={() => handleEdit(subject)}
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
                                                        onClick={() => handleDelete(subject)}
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            {/* Modals */}
            <SubjectModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                initialData={selectedSubject}
            />

            <DeleteSubjectModal
                isOpen={isDeleteModalOpen}
                onClose={() => setIsDeleteModalOpen(false)}
                subject={selectedSubject}
            />
        </div>
    );
}