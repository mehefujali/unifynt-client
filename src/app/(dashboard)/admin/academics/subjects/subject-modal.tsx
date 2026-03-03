/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useEffect } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { SubjectService } from "@/services/subject.service";

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { AcademicService } from "@/services/academic.service";

interface Props {
    isOpen: boolean;
    onClose: () => void;
    subjectToEdit?: any;
}

export default function SubjectModal({ isOpen, onClose, subjectToEdit }: Props) {
    const queryClient = useQueryClient();
    const [formData, setFormData] = useState({ name: "", code: "", type: "THEORY", classId: "", bookName: "" });

    const { data: classesResponse } = useQuery({
        queryKey: ["classes"],
        queryFn: () => AcademicService.getAllClasses(),
    });

    const classList = Array.isArray(classesResponse?.data) ? classesResponse.data : (Array.isArray(classesResponse) ? classesResponse : []);

    useEffect(() => {
        if (subjectToEdit) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setFormData({
                name: subjectToEdit.subjectName || "",
                code: subjectToEdit.subjectCode || "",
                type: subjectToEdit.type || "THEORY",
                classId: subjectToEdit.classes?.[0]?.id || "",
                bookName: subjectToEdit.bookName || "",
            });
        } else {
            setFormData({ name: "", code: "", type: "THEORY", classId: "", bookName: "" });
        }
    }, [subjectToEdit, isOpen]);

    const mutation = useMutation({
        mutationFn: (data: any) => (subjectToEdit ? SubjectService.updateSubject(subjectToEdit.id, data) : SubjectService.createSubject(data)),
        onSuccess: () => {
            toast.success(subjectToEdit ? "Subject updated successfully" : "Subject created successfully");
            queryClient.invalidateQueries({ queryKey: ["subjects"] });
            onClose();
        },
        onError: (error: any) => toast.error(error?.response?.data?.message || "Something went wrong"),
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        mutation.mutate(formData);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="rounded-2xl border-0 ring-1 ring-border/50 shadow-xl bg-white dark:bg-zinc-950 sm:max-w-[425px]">
                <form onSubmit={handleSubmit}>
                    <DialogHeader className="pb-4 border-b border-border/50">
                        <DialogTitle className="text-lg font-medium">{subjectToEdit ? "Edit Subject" : "Add New Subject"}</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-500">Subject Name</label>
                            <Input required placeholder="e.g. Mathematics" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="h-11 rounded-xl bg-zinc-50 dark:bg-zinc-900 border-0 ring-1 ring-inset ring-border/50" />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-zinc-500">Subject Code</label>
                                <Input required placeholder="e.g. MATH101" value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value })} className="h-11 rounded-xl bg-zinc-50 dark:bg-zinc-900 border-0 ring-1 ring-inset ring-border/50" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-zinc-500">Subject Type</label>
                                <Select value={formData.type} onValueChange={(val) => setFormData({ ...formData, type: val })}>
                                    <SelectTrigger className="h-11 rounded-xl bg-zinc-50 dark:bg-zinc-900 border-0 ring-1 ring-inset ring-border/50"><SelectValue /></SelectTrigger>
                                    <SelectContent className="rounded-xl">
                                        {["THEORY", "PRACTICAL", "MANDATORY", "OPTIONAL"].map((t) => (<SelectItem key={t} value={t}>{t}</SelectItem>))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-500">Assign to Class</label>
                            <Select value={formData.classId} onValueChange={(val) => setFormData({ ...formData, classId: val })}>
                                <SelectTrigger className="h-11 rounded-xl bg-zinc-50 dark:bg-zinc-900 border-0 ring-1 ring-inset ring-border/50"><SelectValue placeholder="Select Class" /></SelectTrigger>
                                <SelectContent className="rounded-xl">
                                    {classList.map((c: any) => (<SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-zinc-500">Book Name (Optional)</label>
                            <Input placeholder="e.g. Advanced Math Vol 1" value={formData.bookName} onChange={(e) => setFormData({ ...formData, bookName: e.target.value })} className="h-11 rounded-xl bg-zinc-50 dark:bg-zinc-900 border-0 ring-1 ring-inset ring-border/50" />
                        </div>
                    </div>
                    <DialogFooter className="pt-4 border-t border-border/50">
                        <Button type="button" variant="ghost" onClick={onClose} className="rounded-xl">Cancel</Button>
                        <Button type="submit" disabled={mutation.isPending} className="rounded-xl px-6 bg-primary text-primary-foreground">
                            {mutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />} Save Subject
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}