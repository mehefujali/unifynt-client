/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Search, Trash2, BookOpen, Loader2, ChevronLeft, ChevronRight, Edit } from "lucide-react";
import api from "@/lib/axios";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";

export default function ClassesPage() {
    const queryClient = useQueryClient();
    const [isOpen, setIsOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [selectedClass, setSelectedClass] = useState<any>(null);
    const [search, setSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    const { data: classes = [], isLoading } = useQuery({
        queryKey: ["classes"],
        queryFn: async () => (await api.get("/academic/classes")).data.data,
    });

    const filteredClasses = classes.filter((cls: any) =>
        cls.name.toLowerCase().includes(search.toLowerCase())
    );
    const totalPages = Math.ceil(filteredClasses.length / itemsPerPage);
    const paginatedClasses = filteredClasses.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const createMutation = useMutation({
        mutationFn: async (data: any) => await api.post("/academic/classes", data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["classes"] });
            setIsOpen(false);
            toast.success("Class created successfully");
        },
        onError: (err: any) => toast.error(err.response?.data?.message || "Failed"),
    });

    const updateMutation = useMutation({
        mutationFn: async ({ id, data }: { id: string; data: any }) => await api.patch(`/academic/classes/${id}`, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["classes"] });
            setIsEditOpen(false);
            toast.success("Class updated successfully");
        },
        onError: (err: any) => toast.error(err.response?.data?.message || "Update failed"),
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => await api.delete(`/academic/classes/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["classes"] });
            toast.success("Deleted successfully");
        },
    });

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        createMutation.mutate({
            name: formData.get("name"),
            numericValue: Number(formData.get("numericValue")),
        });
    };

    const handleUpdate = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        updateMutation.mutate({
            id: selectedClass.id,
            data: {
                name: formData.get("name"),
                numericValue: Number(formData.get("numericValue")),
            }
        });
    };

    const openEditModal = (cls: any) => {
        setSelectedClass(cls);
        setIsEditOpen(true);
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between gap-4 items-center">
                <div className="relative w-full sm:w-72">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search classes..."
                        className="pl-9"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <Dialog open={isOpen} onOpenChange={setIsOpen}>
                    <DialogTrigger asChild>
                        <Button className="shadow-lg shadow-primary/20 w-full sm:w-auto">
                            <Plus className="mr-2 h-4 w-4" /> Add Class
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader><DialogTitle>Create New Class</DialogTitle></DialogHeader>
                        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                            <div className="grid gap-2"><Label>Class Name</Label><Input name="name" placeholder="e.g. Class Ten" required /></div>
                            <div className="grid gap-2"><Label>Numeric Value</Label><Input name="numericValue" type="number" placeholder="e.g. 10" required /></div>
                            <Button type="submit" disabled={createMutation.isPending}>
                                {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Save Class
                            </Button>
                        </form>
                    </DialogContent>
                </Dialog>

                <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                    <DialogContent>
                        <DialogHeader><DialogTitle>Edit Class</DialogTitle></DialogHeader>
                        {selectedClass && (
                            <form onSubmit={handleUpdate} className="grid gap-4 py-4">
                                <div className="grid gap-2"><Label>Class Name</Label><Input name="name" defaultValue={selectedClass.name} required /></div>
                                <div className="grid gap-2"><Label>Numeric Value</Label><Input name="numericValue" type="number" defaultValue={selectedClass.numericValue} required /></div>
                                <Button type="submit" disabled={updateMutation.isPending}>
                                    {updateMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Update Class
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
                                <TableHead>Class Name</TableHead>
                                <TableHead>Level</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow><TableCell colSpan={3} className="h-24 text-center">Loading...</TableCell></TableRow>
                            ) : paginatedClasses.length > 0 ? (
                                paginatedClasses.map((cls: any) => (
                                    <TableRow key={cls.id}>
                                        <TableCell className="font-medium flex items-center gap-2">
                                            <div className="h-8 w-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center">
                                                <BookOpen className="h-4 w-4" />
                                            </div>
                                            {cls.name}
                                        </TableCell>
                                        <TableCell><Badge variant="outline">Level {cls.numericValue}</Badge></TableCell>
                                        <TableCell className="text-right flex justify-end gap-2">
                                            <Button variant="ghost" size="icon" onClick={() => openEditModal(cls)}>
                                                <Edit className="h-4 w-4 text-blue-500" />
                                            </Button>
                                            <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(cls.id)}>
                                                <Trash2 className="h-4 w-4 text-destructive" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow><TableCell colSpan={3} className="h-24 text-center text-muted-foreground">No classes found.</TableCell></TableRow>
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