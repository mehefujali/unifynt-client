/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    Plus, Search, Trash2, Loader2, Filter, UserPlus, Calendar as CalendarIcon, Edit
} from "lucide-react";
import api from "@/lib/axios";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";

export default function StudentsPage() {
    const queryClient = useQueryClient();
    const [search, setSearch] = useState("");
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState<any>(null);
    const [selectedClassId, setSelectedClassId] = useState<string | null>(null);

    const { data: students = [], isLoading } = useQuery({
        queryKey: ["students"],
        queryFn: async () => (await api.get("/students")).data.data,
    });

    const { data: classes = [] } = useQuery({
        queryKey: ["classes"],
        queryFn: async () => (await api.get("/academic/classes")).data.data,
    });

    const { data: sections = [] } = useQuery({
        queryKey: ["sections"],
        queryFn: async () => (await api.get("/academic/sections")).data.data,
    });

    const { data: academicYears = [] } = useQuery({
        queryKey: ["years"],
        queryFn: async () => (await api.get("/academic/years")).data.data,
    });

    const availableSections = sections.filter((sec: any) => sec.classId === selectedClassId);
    const currentAcademicYear = academicYears.find((yr: any) => yr.isCurrent) || academicYears[0];

    const createStudentMutation = useMutation({
        mutationFn: async (data: any) => await api.post("/students", data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["students"] });
            setIsCreateOpen(false);
            toast.success("Student registered successfully");
        },
        onError: (err: any) => {
            if (err.response?.data?.errorMessages) {
                err.response.data.errorMessages.forEach((msg: any) => toast.error(`${msg.path}: ${msg.message}`));
            } else {
                toast.error(err.response?.data?.message || "Registration failed");
            }
        },
    });

    const updateStudentMutation = useMutation({
        mutationFn: async ({ id, data }: { id: string; data: any }) => await api.patch(`/students/${id}`, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["students"] });
            setIsEditOpen(false);
            toast.success("Student updated successfully");
        },
        onError: (err: any) => toast.error(err.response?.data?.message || "Update failed"),
    });

    const deleteStudentMutation = useMutation({
        mutationFn: async (id: string) => await api.delete(`/students/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["students"] });
            toast.success("Student deleted");
        },
    });

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const data = Object.fromEntries(formData.entries());

        if (!currentAcademicYear) {
            toast.error("No active academic year found!");
            return;
        }

        const payload = {
            password: "password123",
            email: data.email,
            firstName: data.firstName,
            lastName: data.lastName,
            phone: data.phone || undefined,
            gender: data.gender,
            dateOfBirth: new Date(data.dateOfBirth as string).toISOString(),
            bloodGroup: data.bloodGroup || undefined,
            religion: data.religion || undefined,
            address: data.address || undefined,
            classId: data.classId,
            sectionId: data.sectionId,
            academicYearId: currentAcademicYear.id,
            rollNumber: data.rollNumber,
            admissionDate: new Date().toISOString(),
            guardianName: data.guardianName,
            guardianPhone: data.guardianPhone,
            guardianRelation: data.guardianRelation,
        };

        createStudentMutation.mutate(payload);
    };

    const handleUpdate = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const data = Object.fromEntries(formData.entries());

        const payload = {
            firstName: data.firstName,
            lastName: data.lastName,
            phone: data.phone,
            gender: data.gender,
            bloodGroup: data.bloodGroup || undefined,
            religion: data.religion,
            address: data.address,
            classId: data.classId,
            sectionId: data.sectionId,
            rollNumber: data.rollNumber,
            guardianName: data.guardianName,
            guardianPhone: data.guardianPhone,
            guardianRelation: data.guardianRelation,
        };

        updateStudentMutation.mutate({ id: selectedStudent.id, data: payload });
    };

    const openEditModal = (student: any) => {
        setSelectedStudent(student);
        setSelectedClassId(student.classId);
        setIsEditOpen(true);
    };

    return (
        <div className="flex flex-col gap-6 p-2">
            <div className="grid gap-4 md:grid-cols-3">
                <Card className="bg-gradient-to-br from-blue-50 to-white dark:from-blue-950/20 dark:to-background border-none shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Total Students</CardTitle>
                        <UserPlus className="h-4 w-4 text-blue-600" />
                    </CardHeader>
                    <CardContent><div className="text-2xl font-bold">{students.length}</div></CardContent>
                </Card>
                <Card className="bg-gradient-to-br from-emerald-50 to-white dark:from-emerald-950/20 dark:to-background border-none shadow-sm">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">Active Session</CardTitle>
                        <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{currentAcademicYear?.name || "N/A"}</div>
                        <p className="text-xs text-muted-foreground">Current Academic Year</p>
                    </CardContent>
                </Card>
            </div>

            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between bg-card p-4 rounded-xl border shadow-sm">
                <div>
                    <h1 className="text-2xl font-bold tracking-tight">Students Directory</h1>
                    <p className="text-sm text-muted-foreground">Manage admissions and student records.</p>
                </div>
                <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                    <DialogTrigger asChild>
                        <Button size="lg" className="shadow-lg shadow-primary/20">
                            <Plus className="mr-2 h-5 w-5" /> Admit Student
                        </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>New Student Admission</DialogTitle>
                            <DialogDescription>Session: {currentAcademicYear?.name}</DialogDescription>
                        </DialogHeader>
                        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                            <div className="space-y-3 border-b pb-4">
                                <h4 className="text-sm font-semibold text-primary flex items-center gap-2"><UserPlus className="h-4 w-4" /> Personal Information</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2"><Label>First Name *</Label><Input name="firstName" required /></div>
                                    <div className="grid gap-2"><Label>Last Name *</Label><Input name="lastName" required /></div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label>Gender *</Label>
                                        <Select name="gender" required><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger><SelectContent><SelectItem value="MALE">Male</SelectItem><SelectItem value="FEMALE">Female</SelectItem><SelectItem value="OTHER">Other</SelectItem></SelectContent></Select>
                                    </div>
                                    <div className="grid gap-2"><Label>DOB *</Label><Input name="dateOfBirth" type="date" required /></div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2"><Label>Blood Group</Label><Select name="bloodGroup"><SelectTrigger><SelectValue placeholder="Optional" /></SelectTrigger><SelectContent><SelectItem value="A_POS">A+</SelectItem><SelectItem value="A_NEG">A-</SelectItem><SelectItem value="B_POS">B+</SelectItem><SelectItem value="B_NEG">B-</SelectItem><SelectItem value="AB_POS">AB+</SelectItem><SelectItem value="AB_NEG">AB-</SelectItem><SelectItem value="O_POS">O+</SelectItem><SelectItem value="O_NEG">O-</SelectItem></SelectContent></Select></div>
                                    <div className="grid gap-2"><Label>Religion</Label><Input name="religion" /></div>
                                </div>
                            </div>
                            <div className="space-y-3 border-b pb-4">
                                <h4 className="text-sm font-semibold text-primary flex items-center gap-2"><CalendarIcon className="h-4 w-4" /> Academic Details</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label>Class *</Label>
                                        <Select name="classId" onValueChange={setSelectedClassId} required><SelectTrigger><SelectValue placeholder="Select Class" /></SelectTrigger><SelectContent>{classes.map((c: any) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent></Select>
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>Section *</Label>
                                        <Select name="sectionId" disabled={!selectedClassId} required><SelectTrigger><SelectValue placeholder="Select Section" /></SelectTrigger><SelectContent>{availableSections.map((s: any) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent></Select>
                                    </div>
                                </div>
                                <div className="grid gap-2"><Label>Roll Number *</Label><Input name="rollNumber" required /></div>
                            </div>
                            <div className="space-y-3">
                                <h4 className="text-sm font-semibold text-primary">Guardian & Login</h4>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2"><Label>Guardian Name *</Label><Input name="guardianName" required /></div>
                                    <div className="grid gap-2"><Label>Relationship *</Label><Input name="guardianRelation" required /></div>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2"><Label>Guardian Phone *</Label><Input name="guardianPhone" required /></div>
                                    <div className="grid gap-2"><Label>Email *</Label><Input name="email" type="email" required /></div>
                                </div>
                            </div>
                            <DialogFooter className="mt-4"><Button type="submit" size="lg" className="w-full" disabled={createStudentMutation.isPending}>{createStudentMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Confirm</Button></DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>

                <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                    <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
                        <DialogHeader><DialogTitle>Edit Student Profile</DialogTitle></DialogHeader>
                        {selectedStudent && (
                            <form onSubmit={handleUpdate} className="grid gap-4 py-4">
                                <div className="space-y-3 border-b pb-4">
                                    <h4 className="text-sm font-semibold text-primary">Personal Information</h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="grid gap-2"><Label>First Name</Label><Input name="firstName" defaultValue={selectedStudent.firstName} required /></div>
                                        <div className="grid gap-2"><Label>Last Name</Label><Input name="lastName" defaultValue={selectedStudent.lastName} required /></div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="grid gap-2"><Label>Gender</Label><Select name="gender" defaultValue={selectedStudent.gender} required><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="MALE">Male</SelectItem><SelectItem value="FEMALE">Female</SelectItem><SelectItem value="OTHER">Other</SelectItem></SelectContent></Select></div>
                                        <div className="grid gap-2"><Label>Religion</Label><Input name="religion" defaultValue={selectedStudent.religion} /></div>
                                    </div>
                                </div>
                                <div className="space-y-3 border-b pb-4">
                                    <h4 className="text-sm font-semibold text-primary">Academic Details</h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="grid gap-2"><Label>Class</Label><Select name="classId" defaultValue={selectedStudent.classId} onValueChange={setSelectedClassId} required><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{classes.map((c: any) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}</SelectContent></Select></div>
                                        <div className="grid gap-2"><Label>Section</Label><Select name="sectionId" defaultValue={selectedStudent.sectionId} required><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{availableSections.map((s: any) => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}</SelectContent></Select></div>
                                    </div>
                                    <div className="grid gap-2"><Label>Roll Number</Label><Input name="rollNumber" defaultValue={selectedStudent.rollNumber} required /></div>
                                </div>
                                <div className="space-y-3">
                                    <h4 className="text-sm font-semibold text-primary">Guardian Info</h4>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="grid gap-2"><Label>Guardian Name</Label><Input name="guardianName" defaultValue={selectedStudent.guardianName} required /></div>
                                        <div className="grid gap-2"><Label>Relationship</Label><Input name="guardianRelation" defaultValue={selectedStudent.guardianRelation} required /></div>
                                    </div>
                                    <div className="grid gap-2"><Label>Guardian Phone</Label><Input name="guardianPhone" defaultValue={selectedStudent.guardianPhone} required /></div>
                                </div>
                                <DialogFooter className="mt-4"><Button type="submit" className="w-full" disabled={updateStudentMutation.isPending}>{updateStudentMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Update Student</Button></DialogFooter>
                            </form>
                        )}
                    </DialogContent>
                </Dialog>
            </div>

            <Card>
                <div className="p-4 flex items-center justify-between border-b bg-muted/5">
                    <div className="relative w-full md:w-80">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input placeholder="Search by name, roll..." className="pl-9 bg-background" value={search} onChange={(e) => setSearch(e.target.value)} />
                    </div>
                    <Button variant="outline" size="sm"><Filter className="mr-2 h-4 w-4" /> Filter</Button>
                </div>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Student</TableHead>
                            <TableHead>Class Info</TableHead>
                            <TableHead>Guardian</TableHead>
                            <TableHead>Roll No</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {students.filter((s: any) => s.firstName.toLowerCase().includes(search.toLowerCase())).map((student: any) => (
                            <TableRow key={student.id} className="hover:bg-muted/50">
                                <TableCell className="flex items-center gap-3">
                                    <Avatar className="h-9 w-9 border-2 border-background shadow-sm">
                                        <AvatarImage src={student.avatar} />
                                        <AvatarFallback className="bg-primary/10 text-primary font-bold">{student.firstName[0]}</AvatarFallback>
                                    </Avatar>
                                    <div className="flex flex-col">
                                        <span className="font-semibold text-sm text-foreground">{student.firstName} {student.lastName}</span>
                                        <span className="text-xs text-muted-foreground">{student.user?.email || student.email}</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-col gap-1">
                                        <Badge variant="secondary" className="w-fit font-normal">Class {student.class?.name}</Badge>
                                        <span className="text-xs text-muted-foreground pl-1">Section {student.section?.name}</span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-col text-sm">
                                        <span>{student.guardianName}</span>
                                        <span className="text-xs text-muted-foreground">{student.guardianRelation} - {student.guardianPhone}</span>
                                    </div>
                                </TableCell>
                                <TableCell className="font-medium">#{student.rollNumber}</TableCell>
                                <TableCell className="text-right flex justify-end gap-2">
                                    <Button variant="ghost" size="icon" onClick={() => openEditModal(student)}>
                                        <Edit className="h-4 w-4 text-blue-500" />
                                    </Button>
                                    <Button variant="ghost" size="icon" onClick={() => deleteStudentMutation.mutate(student.id)}>
                                        <Trash2 className="h-4 w-4 text-destructive" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                        {students.length === 0 && (
                            <TableRow><TableCell colSpan={5} className="h-24 text-center text-muted-foreground">No students found. Add one to get started.</TableCell></TableRow>
                        )}
                    </TableBody>
                </Table>
            </Card>
        </div>
    );
}