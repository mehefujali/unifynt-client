/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { SubjectService } from "@/services/subject.service";

import { useDebounce } from "@/hooks/use-debounce";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Edit2, Trash2, Loader2, Search, ChevronLeft, ChevronRight, BookOpen } from "lucide-react";
import SubjectModal from "./subject-modal";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { AcademicService } from "@/services/academic.service";

// --- Import Permissions and Gate ---
import { PERMISSIONS } from "@/config/permissions";
import { PermissionGate } from "@/components/common/permission-gate";
import { usePermission } from "@/hooks/use-permission";

export default function SubjectsPage() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<any>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 500);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [classFilter, setClassFilter] = useState("ALL");
  const [typeFilter, setTypeFilter] = useState("ALL");

  // Check edit/delete permissions for the Actions column
  const { hasPermission } = usePermission();
  const canEditOrDelete = hasPermission([PERMISSIONS.SUBJECT_EDIT, PERMISSIONS.SUBJECT_DELETE]);

  const { data: classesResponse } = useQuery({ 
    queryKey: ["classes"], 
    queryFn: () => AcademicService.getAllClasses() 
  });
  const classList = Array.isArray(classesResponse?.data) ? classesResponse.data : (Array.isArray(classesResponse) ? classesResponse : []);

  const { data: response, isLoading } = useQuery({
    queryKey: ["subjects", page, limit, debouncedSearch, classFilter, typeFilter],
    queryFn: () => SubjectService.getAllSubjects({ 
      page, 
      limit, 
      searchTerm: debouncedSearch,
      classId: classFilter !== "ALL" ? classFilter : undefined,
      type: typeFilter !== "ALL" ? typeFilter : undefined
    }),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => SubjectService.deleteSubject(id),
    onSuccess: () => {
      toast.success("Subject deleted successfully");
      queryClient.invalidateQueries({ queryKey: ["subjects"] });
    },
    onError: (error: any) => toast.error(error?.response?.data?.message || "Failed to delete subject"),
  });

  const handleEdit = (subject: any) => {
    setSelectedSubject(subject);
    setIsModalOpen(true);
  };

  const subjects = Array.isArray(response?.data) ? response.data : [];
  const meta = response?.meta || { total: 0, page: 1, limit: 10, totalPage: 1 };
  const totalPages = meta.totalPage || Math.ceil(meta.total / meta.limit) || 1;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-zinc-900 dark:text-zinc-100">Subjects</h1>
          <p className="text-sm text-zinc-500 mt-1">Manage all academic subjects and their assigned classes.</p>
        </div>
        
        {/* 🔒 Gate for Add Subject Button */}
        <PermissionGate required={PERMISSIONS.SUBJECT_CREATE}>
            <Button 
            onClick={() => { setSelectedSubject(null); setIsModalOpen(true); }} 
            className="rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white shadow-sm dark:bg-zinc-100 dark:hover:bg-zinc-200 dark:text-zinc-900 transition-all"
            >
            <Plus className="mr-2 h-4 w-4" /> Add Subject
            </Button>
        </PermissionGate>
      </div>

      <Card className="border-0 shadow-sm ring-1 ring-border/50 rounded-2xl bg-white dark:bg-zinc-950 overflow-hidden flex flex-col">
        <CardHeader className="pb-4 border-b border-border/50 bg-zinc-50/50 dark:bg-zinc-900/50 px-6 space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <CardTitle className="text-lg font-medium text-zinc-900 dark:text-zinc-100">Subject Directory</CardTitle>
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <Select value={classFilter} onValueChange={(v) => { setClassFilter(v); setPage(1); }}>
                <SelectTrigger className="w-full sm:w-[160px] h-10 rounded-xl bg-white dark:bg-zinc-950 border-0 ring-1 ring-inset ring-border/50 shadow-sm">
                  <SelectValue placeholder="All Classes" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="ALL">All Classes</SelectItem>
                  {classList.map((c: any) => (<SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>))}
                </SelectContent>
              </Select>
              <Select value={typeFilter} onValueChange={(v) => { setTypeFilter(v); setPage(1); }}>
                <SelectTrigger className="w-full sm:w-[160px] h-10 rounded-xl bg-white dark:bg-zinc-950 border-0 ring-1 ring-inset ring-border/50 shadow-sm">
                  <SelectValue placeholder="All Types" />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  <SelectItem value="ALL">All Types</SelectItem>
                  {["THEORY", "PRACTICAL", "MANDATORY", "OPTIONAL"].map((t) => (<SelectItem key={t} value={t}>{t}</SelectItem>))}
                </SelectContent>
              </Select>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
                <Input
                  placeholder="Search by name or code..."
                  value={searchTerm}
                  onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
                  className="pl-9 h-10 rounded-xl bg-white dark:bg-zinc-950 border-0 ring-1 ring-inset ring-border/50 focus-visible:ring-2 focus-visible:ring-primary shadow-sm transition-all"
                />
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0 flex-1 overflow-x-auto">
          {isLoading ? (
            <div className="flex h-64 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : subjects.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="h-16 w-16 rounded-2xl bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center mb-4 ring-1 ring-inset ring-border/50">
                <BookOpen className="h-8 w-8 text-zinc-400" />
              </div>
              <p className="text-lg font-medium text-zinc-900 dark:text-zinc-100">No Subjects Found</p>
              <p className="text-sm text-zinc-500 mt-1">Try adjusting your search criteria or add a new subject.</p>
            </div>
          ) : (
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-zinc-500 bg-zinc-50/50 dark:bg-zinc-900/50 border-b border-border/50 uppercase">
                <tr>
                  <th className="px-6 py-4 font-medium">Subject Info</th>
                  <th className="px-6 py-4 font-medium">Type</th>
                  <th className="px-6 py-4 font-medium">Assigned Classes</th>
                  <th className="px-6 py-4 font-medium">Book Name</th>
                  {canEditOrDelete && <th className="px-6 py-4 font-medium text-right">Actions</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-border/50">
                {subjects.map((subject: any) => (
                  <tr key={subject.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/50 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-semibold text-zinc-900 dark:text-zinc-100">{subject.subjectName}</p>
                      <p className="text-xs text-zinc-500 mt-0.5 font-mono">{subject.subjectCode}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "px-2.5 py-1 rounded-lg text-xs font-semibold ring-1 ring-inset", 
                        subject.type === "THEORY" ? "bg-blue-100 text-blue-700 ring-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:ring-blue-900/50" : 
                        subject.type === "PRACTICAL" ? "bg-amber-100 text-amber-700 ring-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:ring-amber-900/50" : 
                        "bg-zinc-100 text-zinc-700 ring-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:ring-zinc-700"
                      )}>
                        {subject.type}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1.5">
                        {subject.classes?.length > 0 ? subject.classes.map((c: any) => (
                          <span key={c.id} className="bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300 px-2 py-0.5 rounded-md text-xs font-medium ring-1 ring-border/50">
                            {c.name}
                          </span>
                        )) : <span className="text-zinc-400 text-xs italic">Unassigned</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-zinc-600 dark:text-zinc-400">
                      {subject.bookName || "-"}
                    </td>
                    
                    {/* Actions Column */}
                    {canEditOrDelete && (
                        <td className="px-6 py-4 text-right space-x-2">
                            {/* 🔒 Gate for Edit Button */}
                            <PermissionGate required={PERMISSIONS.SUBJECT_EDIT}>
                                <Button variant="ghost" size="icon" onClick={() => handleEdit(subject)} className="h-8 w-8 rounded-lg text-blue-600 hover:bg-blue-50 dark:text-blue-400 dark:hover:bg-blue-900/30">
                                    <Edit2 className="h-4 w-4" />
                                </Button>
                            </PermissionGate>
                            
                            {/* 🔒 Gate for Delete Button */}
                            <PermissionGate required={PERMISSIONS.SUBJECT_DELETE}>
                                <Button variant="ghost" size="icon" onClick={() => { if (confirm("Are you sure?")) deleteMutation.mutate(subject.id); }} disabled={deleteMutation.isPending} className="h-8 w-8 rounded-lg text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/30">
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </PermissionGate>
                        </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>

        {!isLoading && subjects.length > 0 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-border/50 bg-zinc-50/50 dark:bg-zinc-900/50">
            <div className="text-sm text-zinc-500 dark:text-zinc-400 font-medium">
              Showing {(page - 1) * limit + 1} to {Math.min(page * limit, meta.total)} of {meta.total} subjects
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="h-9 w-9 p-0 rounded-xl bg-white dark:bg-zinc-950 border-0 ring-1 ring-inset ring-border/50 shadow-sm disabled:opacity-50"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="px-4 text-sm font-medium text-zinc-900 dark:text-zinc-100">
                Page {page} of {totalPages}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages || totalPages === 0}
                className="h-9 w-9 p-0 rounded-xl bg-white dark:bg-zinc-950 border-0 ring-1 ring-inset ring-border/50 shadow-sm disabled:opacity-50"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </Card>

      <SubjectModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} subjectToEdit={selectedSubject} />
    </div>
  );
}