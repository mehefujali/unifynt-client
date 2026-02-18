/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Plus, Search, Trash2, CheckCircle2, Loader2, ChevronLeft, ChevronRight, Edit } from "lucide-react";
import api from "@/lib/axios";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export default function SessionsPage() {
    const queryClient = useQueryClient();
    const [isOpen, setIsOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [selectedSession, setSelectedSession] = useState<any>(null);
    const [search, setSearch] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;

    const { data: years = [], isLoading } = useQuery({
        queryKey: ["years"],
        queryFn: async () => (await api.get("/academic/years")).data.data,
    });

    const filteredYears = years.filter((yr: any) =>
        yr.name.toLowerCase().includes(search.toLowerCase())
    );
    const totalPages = Math.ceil(filteredYears.length / itemsPerPage);
    const paginatedYears = filteredYears.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const createMutation = useMutation({
        mutationFn: async (data: any) => await api.post("/academic/years", data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["years"] });
            setIsOpen(false);
            toast.success("Academic Session created");
        },
        onError: (err: any) => toast.error(err.response?.data?.message || "Failed"),
    });

    const updateMutation = useMutation({
        mutationFn: async ({ id, data }: { id: string; data: any }) => await api.patch(`/academic/years/${id}`, data),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["years"] });
            setIsEditOpen(false);
            toast.success("Session updated successfully");
        },
        onError: (err: any) => toast.error(err.response?.data?.message || "Update failed"),
    });

    const setActiveMutation = useMutation({
        mutationFn: async (id: string) => await api.patch(`/academic/years/${id}`, { isCurrent: true }),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["years"] });
            toast.success("Active session updated");
        },
    });

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => await api.delete(`/academic/years/${id}`),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ["years"] });
            toast.success("Deleted successfully");
        },
    });

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        createMutation.mutate({
            name: formData.get("name"),
            startDate: new Date(formData.get("startDate") as string),
            endDate: new Date(formData.get("endDate") as string),
            isCurrent: formData.get("isCurrent") === "on",
        });
    };

    const handleUpdate = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        updateMutation.mutate({
            id: selectedSession.id,
            data: {
                name: formData.get("name"),
                startDate: new Date(formData.get("startDate") as string),
                endDate: new Date(formData.get("endDate") as string),
                isCurrent: formData.get("isCurrent") === "on",
            }
        });
    };

    const openEditModal = (session: any) => {
        setSelectedSession(session);
        setIsEditOpen(true);
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-col sm:flex-row justify-between gap-4 items-center">
                <div className="relative w-full sm:w-72">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search sessions..."
                        className="pl-9"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <Dialog open={isOpen} onOpenChange={setIsOpen}>
                    <DialogTrigger asChild>
                        <Button className="shadow-lg shadow-primary/20 w-full sm:w-auto">
                            <Plus className="mr-2 h-4 w-4" /> New Session
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader><DialogTitle>Create Academic Year</DialogTitle></DialogHeader>
                        <form onSubmit={handleSubmit} className="grid gap-4 py-4">
                            <div className="grid gap-2"><Label>Session Name</Label><Input name="name" placeholder="e.g. 2024-2025" required /></div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="grid gap-2"><Label>Start Date</Label><Input name="startDate" type="date" required /></div>
                                <div className="grid gap-2"><Label>End Date</Label><Input name="endDate" type="date" required /></div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Switch name="isCurrent" id="isCurrent" />
                                <Label htmlFor="isCurrent">Set as Active Session</Label>
                            </div>
                            <Button type="submit" disabled={createMutation.isPending}>
                                {createMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Create Session
                            </Button>
                        </form>
                    </DialogContent>
                </Dialog>

                <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                    <DialogContent>
                        <DialogHeader><DialogTitle>Edit Academic Year</DialogTitle></DialogHeader>
                        {selectedSession && (
                            <form onSubmit={handleUpdate} className="grid gap-4 py-4">
                                <div className="grid gap-2"><Label>Session Name</Label><Input name="name" defaultValue={selectedSession.name} required /></div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="grid gap-2">
                                        <Label>Start Date</Label>
                                        <Input name="startDate" type="date" defaultValue={new Date(selectedSession.startDate).toISOString().split('T')[0]} required />
                                    </div>
                                    <div className="grid gap-2">
                                        <Label>End Date</Label>
                                        <Input name="endDate" type="date" defaultValue={new Date(selectedSession.endDate).toISOString().split('T')[0]} required />
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Switch name="isCurrent" id="editIsCurrent" defaultChecked={selectedSession.isCurrent} />
                                    <Label htmlFor="editIsCurrent">Set as Active Session</Label>
                                </div>
                                <Button type="submit" disabled={updateMutation.isPending}>
                                    {updateMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Update Session
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
                                <TableHead>Name</TableHead>
                                <TableHead>Duration</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {isLoading ? (
                                <TableRow><TableCell colSpan={4} className="h-24 text-center">Loading...</TableCell></TableRow>
                            ) : paginatedYears.length > 0 ? (
                                paginatedYears.map((yr: any) => (
                                    <TableRow key={yr.id}>
                                        <TableCell className="font-medium">{yr.name}</TableCell>
                                        <TableCell className="text-muted-foreground text-sm">
                                            {new Date(yr.startDate).toLocaleDateString()} - {new Date(yr.endDate).toLocaleDateString()}
                                        </TableCell>
                                        <TableCell>
                                            {yr.isCurrent ? (
                                                <Badge className="bg-emerald-100 text-emerald-700 border-0 flex w-fit items-center gap-1">
                                                    <CheckCircle2 className="h-3 w-3" /> Active
                                                </Badge>
                                            ) : (
                                                <Button variant="outline" size="sm" className="h-6 text-xs" onClick={() => setActiveMutation.mutate(yr.id)}>
                                                    Set Active
                                                </Button>
                                            )}
                                        </TableCell>
                                        <TableCell className="text-right flex justify-end gap-2">
                                            <Button variant="ghost" size="icon" onClick={() => openEditModal(yr)}>
                                                <Edit className="h-4 w-4 text-blue-500" />
                                            </Button>
                                            <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(yr.id)}>
                                                <Trash2 className="h-4 w-4 text-destructive" />
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow><TableCell colSpan={4} className="h-24 text-center text-muted-foreground">No sessions found.</TableCell></TableRow>
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