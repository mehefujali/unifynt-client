/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { SubjectService } from "@/services/subject.service";

import { useDebounce } from "@/hooks/use-debounce";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Edit2, Trash2, Loader2, Search, ChevronLeft, ChevronRight, BookOpen, Library, FilterX } from "lucide-react";
import SubjectModal from "./subject-modal";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { AcademicService } from "@/services/academic.service";

import { PERMISSIONS } from "@/config/permissions";
import { PermissionGate } from "@/components/common/permission-gate";
import { usePermission } from "@/hooks/use-permission";
import { Badge } from "@/components/ui/badge";

export default function SubjectsPage() {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<any>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 500);
  const [page, setPage] = useState(1);
  const limit = 10;
  const [classFilter, setClassFilter] = useState("ALL");
  const [typeFilter, setTypeFilter] = useState("ALL");

  const { hasPermission } = usePermission();

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

  const handleClearFilters = () => {
    setSearchTerm("");
    setClassFilter("ALL");
    setTypeFilter("ALL");
    setPage(1);
  };

  const subjects = Array.isArray(response?.data) ? response.data : [];
  const meta = response?.meta || { total: 0, page: 1, limit: 10, totalPage: 1 };
  const totalPages = meta.totalPage || Math.ceil(meta.total / meta.limit) || 1;

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header with Sub-title and Add button */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <Library className="h-6 w-6 text-primary" /> Subject Directory
          </h2>
          <p className="text-muted-foreground text-sm font-medium">Configure academic subjects, types, and class assignments.</p>
        </div>
        <div className="shrink-0 w-full md:w-auto">
          <PermissionGate required={PERMISSIONS.SUBJECT_CREATE}>
            <Button
              onClick={() => { setSelectedSubject(null); setIsModalOpen(true); }}
              className="w-full md:w-auto px-6 font-bold shadow-md"
            >
              <Plus className="mr-2 h-5 w-5" /> Add Subject
            </Button>
          </PermissionGate>
        </div>
      </div>

      {/* Filters Section - Super Admin Style */}
      <div className="flex flex-col xl:flex-row gap-4 justify-between items-center bg-card p-4 rounded-xl border border-border shadow-sm">
        <div className="relative w-full xl:max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name or code..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
            className="pl-9 h-10 bg-muted/20 border-border"
          />
        </div>
        <div className="flex flex-wrap items-center gap-3 w-full xl:w-auto">
          <Select value={classFilter} onValueChange={(v) => { setClassFilter(v); setPage(1); }}>
            <SelectTrigger className="flex-1 sm:w-[180px] h-10 bg-muted/20 border-border font-semibold">
              <SelectValue placeholder="All Classes" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Classes</SelectItem>
              {classList.map((c: any) => (<SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>))}
            </SelectContent>
          </Select>

          <Select value={typeFilter} onValueChange={(v) => { setTypeFilter(v); setPage(1); }}>
            <SelectTrigger className="flex-1 sm:w-[160px] h-10 bg-muted/20 border-border font-semibold">
              <SelectValue placeholder="Subject Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Types</SelectItem>
              {["THEORY", "PRACTICAL", "MANDATORY", "OPTIONAL"].map((t) => (<SelectItem key={t} value={t}>{t}</SelectItem>))}
            </SelectContent>
          </Select>

          {(searchTerm || classFilter !== "ALL" || typeFilter !== "ALL") && (
            <Button variant="ghost" onClick={handleClearFilters} className="text-rose-500 hover:text-rose-600 hover:bg-rose-50 h-10 px-4 rounded-lg font-bold text-xs uppercase tracking-widest">
              <FilterX className="h-4 w-4 mr-2" /> Reset
            </Button>
          )}
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-card rounded-xl border border-border shadow-sm overflow-hidden min-h-[400px] flex flex-col">
        <div className="overflow-x-auto flex-grow">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-muted-foreground bg-muted/30 border-b border-border uppercase">
              <tr>
                <th className="px-6 py-4 font-bold">Subject Information</th>
                <th className="px-6 py-4 font-bold">Category</th>
                <th className="px-6 py-4 font-bold">Assignments</th>
                <th className="px-6 py-4 font-bold">Curriculum/Book</th>
                {hasPermission([PERMISSIONS.SUBJECT_EDIT, PERMISSIONS.SUBJECT_DELETE]) && <th className="px-6 py-4 font-bold text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="h-64 text-center">
                    <div className="flex flex-col items-center justify-center text-zinc-500">
                      <Loader2 className="h-8 w-8 animate-spin mb-4 text-zinc-400" />
                      <p className="font-bold uppercase tracking-widest text-xs">Loading academic data...</p>
                    </div>
                  </td>
                </tr>
              ) : subjects.length === 0 ? (
                <tr>
                  <td colSpan={5} className="h-64 text-center">
                    <div className="flex flex-col items-center justify-center gap-4 opacity-40">
                      <BookOpen className="h-16 w-16 mx-auto" />
                      <p className="font-bold uppercase tracking-widest text-sm">Empty Repository</p>
                    </div>
                  </td>
                </tr>
              ) : (
                subjects.map((subject: any) => (
                  <tr key={subject.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-6 py-4">
                      <p className="font-bold text-foreground">{subject.subjectName}</p>
                      <p className="text-[10px] font-bold text-primary mt-0.5 tracking-wider uppercase opacity-70">{subject.subjectCode}</p>
                    </td>
                    <td className="px-6 py-4">
                      <Badge variant="outline" className={cn(
                        "font-bold text-[9px] uppercase tracking-widest px-2 py-0.5 border shadow-none",
                        subject.type === "THEORY" ? "bg-blue-500/10 text-blue-600 border-blue-500/20" :
                          subject.type === "PRACTICAL" ? "bg-amber-500/10 text-amber-600 border-amber-500/20" :
                            "bg-slate-500/10 text-slate-600 border-slate-500/20"
                      )}>
                        {subject.type}
                      </Badge>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {subject.classes?.length > 0 ? subject.classes.map((c: any) => (
                          <span key={c.id} className="bg-muted px-2 py-0.5 rounded text-[10px] font-bold text-muted-foreground border border-border/50 tracking-tight">
                            {c.name}
                          </span>
                        )) : <span className="text-muted-foreground text-[10px] italic">No Class</span>}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-muted-foreground font-medium">
                      {subject.bookName || "—"}
                    </td>

                    {hasPermission([PERMISSIONS.SUBJECT_EDIT, PERMISSIONS.SUBJECT_DELETE]) && (
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-1">
                          <PermissionGate required={PERMISSIONS.SUBJECT_EDIT}>
                            <Button variant="ghost" size="icon" onClick={() => handleEdit(subject)} className="h-8 w-8 text-blue-600 hover:bg-blue-50 rounded-lg">
                              <Edit2 className="h-4 w-4" />
                            </Button>
                          </PermissionGate>

                          <PermissionGate required={PERMISSIONS.SUBJECT_DELETE}>
                            <Button variant="ghost" size="icon" onClick={() => { if (confirm("Proceed to delete this subject?")) deleteMutation.mutate(subject.id); }} disabled={deleteMutation.isPending} className="h-8 w-8 text-rose-600 hover:bg-rose-50 rounded-lg">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </PermissionGate>
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {!isLoading && subjects.length > 0 && (
          <div className="border-t border-border bg-muted/20 p-4 flex items-center justify-between">
            <span className="text-sm text-muted-foreground font-bold">
              Showing <span className="text-foreground">{((page - 1) * limit) + 1}</span> to <span className="text-foreground">{Math.min(page * limit, meta.total)}</span> of <span className="text-foreground">{meta.total}</span> entries
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="h-8 w-8 p-0 rounded-lg"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <div className="px-3 text-xs font-bold text-foreground/70 bg-background/50 py-1 rounded-md border border-border/50">
                Page {page} of {totalPages}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages || totalPages === 0}
                className="h-8 w-8 p-0 rounded-lg"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      <SubjectModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} subjectToEdit={selectedSubject} />
    </div>
  );
}