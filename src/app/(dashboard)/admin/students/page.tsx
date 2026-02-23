"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { StudentService } from "@/services/student.service";
import { AcademicService } from "@/services/academic.service";
import { useDebounce } from "@/hooks/use-debounce";

import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Search, Eye, Inbox, Loader2, ChevronLeft, ChevronRight, UserX, Plus, Edit } from "lucide-react";

import ViewStudentModal from "./view-student-modal";
import AddStudentModal from "./add-student-modal";
import EditStudentModal from "./edit-student-modal";

const extractData = (res: any) => {
    if (!res) return [];
    if (Array.isArray(res)) return res;
    if (Array.isArray(res.data)) return res.data;
    if (res.data && Array.isArray(res.data.data)) return res.data.data;
    return [];
};

export default function StudentsPage() {
    const [search, setSearch] = useState("");
    const debouncedSearch = useDebounce(search, 500);
    const [classId, setClassId] = useState<string>("ALL");
    const [sectionId, setSectionId] = useState<string>("ALL");
    const [page, setPage] = useState(1);
    const limit = 10;
    
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
    const [editingStudentId, setEditingStudentId] = useState<string | null>(null);

    const { data: classesRes } = useQuery({ 
        queryKey: ["classes"], 
        queryFn: () => AcademicService.getAllClasses() 
    });

    const { data: sectionsRes } = useQuery({ 
        queryKey: ["sections", classId], 
        queryFn: () => AcademicService.getAllSections({ classId: classId === "ALL" ? undefined : classId }),
        enabled: classId !== "ALL"
    });

    const { data: studentsRes, isLoading } = useQuery({
        queryKey: ["students", page, debouncedSearch, classId, sectionId],
        queryFn: () => StudentService.getAllStudents({ 
            page, limit, 
            searchTerm: debouncedSearch, 
            classId: classId === "ALL" ? undefined : classId,
            sectionId: sectionId === "ALL" ? undefined : sectionId
        }),
    });

    const students = studentsRes?.data || [];
    const meta = studentsRes?.meta || { total: 0, page: 1, limit, totalPage: 1 };

    const classList = extractData(classesRes);
    const sectionList = extractData(sectionsRes);

    return (
        <div className="p-6 space-y-6 animate-in fade-in duration-500">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-2xl font-bold tracking-tight text-foreground">Student Directory</h2>
                    <p className="text-sm text-muted-foreground mt-1">Manage and view all enrolled students across the institution.</p>
                </div>
                <Button onClick={() => setIsAddModalOpen(true)} className="font-bold shadow-sm h-11 px-6">
                    <Plus className="h-4 w-4 mr-2" /> Add Student
                </Button>
            </div>

            <Card className="shadow-sm border-border">
                <CardHeader className="p-4 border-b bg-muted/20">
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
                        <div className="relative sm:col-span-6 lg:col-span-4">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                            <Input 
                                placeholder="Search by name, ID or guardian..." 
                                value={search}
                                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                                className="pl-9 h-10 bg-background"
                            />
                        </div>
                        <div className="sm:col-span-3 lg:col-span-3">
                            <Select value={classId} onValueChange={(val) => { setClassId(val); setSectionId("ALL"); setPage(1); }}>
                                <SelectTrigger className="h-10 bg-background">
                                    <SelectValue placeholder="All Classes" />
                                </SelectTrigger>
                                <SelectContent position="popper">
                                    <SelectItem value="ALL" className="font-semibold text-primary">All Classes</SelectItem>
                                    {classList.map((cls: any) => (
                                        <SelectItem key={cls.id} value={cls.id}>{cls.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="sm:col-span-3 lg:col-span-3">
                            <Select value={sectionId} onValueChange={(val) => { setSectionId(val); setPage(1); }} disabled={classId === "ALL"}>
                                <SelectTrigger className="h-10 bg-background">
                                    <SelectValue placeholder={classId === "ALL" ? "Select Class First" : "All Sections"} />
                                </SelectTrigger>
                                <SelectContent position="popper">
                                    <SelectItem value="ALL" className="font-semibold text-primary">All Sections</SelectItem>
                                    {sectionList.map((sec: any) => (
                                        <SelectItem key={sec.id} value={sec.id}>Section {sec.name}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader className="bg-muted/40">
                            <TableRow>
                                <TableHead className="font-semibold text-foreground px-6">Student Info</TableHead>
                                <TableHead className="font-semibold text-foreground">Class & Roll</TableHead>
                                <TableHead className="font-semibold text-foreground">Guardian Details</TableHead>
                                <TableHead className="font-semibold text-foreground">Status</TableHead>
                                <TableHead className="text-right font-semibold text-foreground px-6">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow><TableCell colSpan={5} className="h-64 text-center"><Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" /></TableCell></TableRow>
                            ) : students.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-64 text-center text-muted-foreground">
                                        <UserX className="h-12 w-12 mx-auto mb-4 opacity-20" />
                                        No students found matching your criteria.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                students.map((std: any) => (
                                    <TableRow key={std.id} className="hover:bg-muted/20 transition-colors group">
                                        <TableCell className="px-6 py-4">
                                            <div className="flex items-center gap-4">
                                                <Avatar className="h-12 w-12 border-2 shadow-sm">
                                                    <AvatarImage src={std.profilePicture} alt={std.firstName} className="object-cover" />
                                                    <AvatarFallback className="bg-primary/10 text-primary font-bold text-lg">
                                                        {std.firstName.charAt(0)}
                                                    </AvatarFallback>
                                                </Avatar>
                                                <div className="flex flex-col">
                                                    <span className="font-bold text-sm text-foreground group-hover:text-primary transition-colors">
                                                        {std.firstName} {std.lastName}
                                                    </span>
                                                    <span className="text-[11px] font-mono text-muted-foreground mt-0.5">{std.studentId}</span>
                                                    <span className="text-xs text-muted-foreground mt-0.5">{std.email}</span>
                                                </div>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="text-sm font-semibold">{std.class?.name} - {std.section?.name}</span>
                                                <span className="text-xs text-muted-foreground mt-0.5">Roll: <span className="font-bold text-foreground">{std.rollNumber}</span></span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="text-sm font-medium">{std.admissionApplication?.fatherName || std.admissionApplication?.localGuardianName || "N/A"}</span>
                                                <span className="text-xs text-muted-foreground mt-0.5">{std.admissionApplication?.fatherPhone || std.admissionApplication?.localGuardianPhone || "N/A"}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className={
                                                std.user?.status === "ACTIVE" ? "bg-emerald-50 text-emerald-600 border-emerald-200" :
                                                "bg-red-50 text-red-600 border-red-200"
                                            }>
                                                {std.user?.status || "UNKNOWN"}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right px-6">
                                            <div className="flex items-center justify-end gap-2">
                                                <Button variant="outline" size="icon" onClick={() => setSelectedStudentId(std.id)} className="h-9 w-9 text-muted-foreground hover:text-primary hover:border-primary/30 hover:bg-primary/5">
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                                <Button variant="outline" size="icon" onClick={() => setEditingStudentId(std.id)} className="h-9 w-9 text-muted-foreground hover:text-amber-600 hover:border-amber-300 hover:bg-amber-50">
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>

                    {!isLoading && meta.total > 0 && (
                        <div className="flex items-center justify-between px-6 py-4 border-t bg-muted/10">
                            <div className="text-sm text-muted-foreground font-medium">
                                Showing {((meta.page - 1) * meta.limit) + 1} to {Math.min(meta.page * meta.limit, meta.total)} of {meta.total} students
                            </div>
                            <div className="flex items-center space-x-2">
                                <Button variant="outline" size="sm" onClick={() => setPage(p => Math.max(1, p - 1))} disabled={meta.page === 1} className="h-8 shadow-none">
                                    <ChevronLeft className="h-4 w-4 mr-1" /> Prev
                                </Button>
                                <Button variant="outline" size="sm" onClick={() => setPage(p => p + 1)} disabled={meta.page >= meta.totalPage} className="h-8 shadow-none">
                                    Next <ChevronRight className="h-4 w-4 ml-1" />
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            <AddStudentModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />
            <ViewStudentModal studentId={selectedStudentId} isOpen={!!selectedStudentId} onClose={() => setSelectedStudentId(null)} />
            <EditStudentModal studentId={editingStudentId} isOpen={!!editingStudentId} onClose={() => setEditingStudentId(null)} />
        </div>
    );
}