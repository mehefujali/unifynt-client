/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Search, Trash2, Layers, Loader2, ChevronLeft, ChevronRight, Edit } from "lucide-react";
import api from "@/lib/axios";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function SectionsPage() {
    const queryClient = useQueryClient();
    const [isOpen, setIsOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [selectedSection, setSelectedSection] = useState<any>(null);
    const [search, setSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    const { data: classes = [] } = useQuery({
        queryKey: ["classes"],
        queryFn: async () => (await api.get("/academic/classes")).data.data,
    });

    const { data: sections = [], isLoading } = useQuery({
        queryKey: ["sections"],
        queryFn: async () => (await api.get("/academic/sections")).data.data,
    });

    const filteredSections = sections.filter((sec: any) =>
        sec.name.toLowerCase().includes(search.toLowerCase()) ||
        sec.class?.name.toLowerCase().includes(search.toLowerCase())
    );
    const totalPages = Math.ceil(filteredSections.length / itemsPerPage);
    const paginatedSections = filteredSections.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const createMutation = useMutation({
        mutationFn: async (data: any) => await api.post("/academic/sections", data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["sections"] });
            setIsOpen(false);
            toast.success("Section added successfully");
        },
        onError: (err: any) => toast.error(err.response?.data?.message || "Failed"),
    });

    const updateMutation = useMutation({
        mutationFn: async ({ id, data }: { id: string; data: any }) => await api.patch(`/academic/sections/${id}`, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["sections"] });
            setIsEditOpen(false);
            toast.success("Section updated successfully");
        },
        onError: (err: any) => toast.error(err.response?.data?.message || "Update failed"),
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => await api.delete(`/academic/sections/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["sections"] });
            toast.success("Deleted successfully");
        },
    });

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        createMutation.mutate({
            name: formData.get("name"),
            classId: formData.get("classId"),
            capacity: Number(formData.get("capacity")) || 50,
        });
    };

    const handleUpdate = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        updateMutation.mutate({
            id: selectedSection.id,
            data: {
                name: formData.get("name"),
                classId: formData.get("classId"),
                capacity: Number(formData.get("capacity")) || 50,
            }
        });
    };

    const openEditModal = (sec: any) => {
        setSelectedSection(sec);
        setIsEditOpen(true);
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between gap-4 items-center">
                <div className="relative w-full sm:w-72">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search sections..."
                        className="pl-9"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <Dialog open={isOpen} onOpenChange={setIsOpen}>
                    <DialogTrigger asChild>
                        <Button className="shadow-lg shadow-primary/20 w-full sm:w-auto">
                            <Plus className="mr-2 h-4 w-4" /> Add Section
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader><DialogTitle>Create New Section</DialogTitle></DialogHeader>
                        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                            <div className="grid gap-2">
                                <Label>Select Class</Label>
                                <Select name="classId" required>
                                    <SelectTrigger><SelectValue placeholder="Choose a class" /></SelectTrigger>
                                    <SelectContent>
                                        {classes.map((cls: any) => (
                                            <SelectItem key={cls.id} value={cls.id}>{cls.name}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2"><Label>Section Name</Label><Input name="name" placeholder="e.g. A, Rose" required /></div>
                                <div className="grid gap-2"><Label>Capacity</Label><Input name="capacity" type="number" defaultValue={50} /></div>
                            </div>
                            <Button type="submit" disabled={createMutation.isPending}>
                                {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Save Section
                            </Button>
                        </form>
                    </DialogContent>
                </Dialog>

                <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                    <DialogContent>
                        <DialogHeader><DialogTitle>Edit Section</DialogTitle></DialogHeader>
                        {selectedSection && (
                            <form onSubmit={handleUpdate} className="grid gap-4 py-4">
                                <div className="grid gap-2">
                                    <Label>Select Class</Label>
                                    <Select name="classId" defaultValue={selectedSection.classId} required>
                                        <SelectTrigger><SelectValue placeholder="Choose a class" /></SelectTrigger>
                                        <SelectContent>
                                            {classes.map((cls: any) => (
                                                <SelectItem key={cls.id} value={cls.id}>{cls.name}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2"><Label>Section Name</Label><Input name="name" defaultValue={selectedSection.name} required /></div>
                                    <div className="grid gap-2"><Label>Capacity</Label><Input name="capacity" type="number" defaultValue={selectedSection.capacity} /></div>
                                </div>
                                <Button type="submit" disabled={updateMutation.isPending}>
                                    {updateMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Update Section
                                </Button>
                            </form>
                        )}
                    </DialogContent>
                </Dialog>
            </div>

            <Card>
                <CardContent className="p-0">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Section Name</TableHead>
                                <TableHead>Parent Class</TableHead>
                                <TableHead>Capacity</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow><TableCell colSpan={4} className="h-24 text-center">Loading...</TableCell></TableRow>
                            ) : paginatedSections.length > 0 ? (
                                paginatedSections.map((sec: any) => (
                                    <TableRow key={sec.id}>
                                        <TableCell className="font-medium flex items-center gap-2">
                                            <div className="h-8 w-8 rounded-lg bg-green-100 text-green-600 flex items-center justify-center">
                                                <Layers className="h-4 w-4" />
                                            </div>
                                            Section {sec.name}
                                        </TableCell>
                                        <TableCell>{sec.class?.name || "N/A"}</TableCell>
                                        <TableCell>{sec.capacity} Students</TableCell>
                                        <TableCell className="text-right flex justify-end gap-2">
                                            <Button variant="ghost" size="icon" onClick={() => openEditModal(sec)}>
                                                <Edit className="h-4 w-4 text-blue-500" />
                                            </Button>
                                            <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(sec.id)}>
                                                <Trash2 className="h-4 w-4 text-destructive" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow><TableCell colSpan={4} className="h-24 text-center text-muted-foreground">No sections found.</TableCell></TableRow>
                            )}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>

            {totalPages > 1 && (
                <div className="flex items-center justify-end space-x-2">
                    <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1}><ChevronLeft className="h-4 w-4" /></Button>
                    <span className="text-sm text-muted-foreground">Page {currentPage} of {totalPages}</span>
                    <Button variant="outline" size="sm" onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages}><ChevronRight className="h-4 w-4" /></Button>
                </div>
            )}
        </div>
    );
}