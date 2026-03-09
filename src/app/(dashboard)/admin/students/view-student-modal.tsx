/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { StudentService } from "@/services/student.service";
import { format } from "date-fns";
import { toast } from "sonner";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
  Loader2,
  Mail,
  Phone,
  GraduationCap,
  CalendarDays,
  Link as LinkIcon,
  AlertCircle,
  Trash2,
} from "lucide-react";

import { PERMISSIONS } from "@/config/permissions";
import { PermissionGate } from "@/components/common/permission-gate";

interface Props {
  studentId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

const formatKeyLabel = (key: string) =>
  key.replace(/([A-Z])/g, " $1").replace(/^./, (str) => str.toUpperCase());

const isImageUrl = (url: string) =>
  /\.(jpg|jpeg|png|webp|avif|gif)$/.test(url.toLowerCase());

export default function ViewStudentModal({ studentId, isOpen, onClose }: Props) {
  const queryClient = useQueryClient();
  const [deleteConfirmText, setDeleteConfirmText] = useState("");

  const { data: res, isLoading } = useQuery({
    queryKey: ["student", studentId],
    queryFn: () => StudentService.getStudentById(studentId!),
    enabled: !!studentId && isOpen,
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      return await StudentService.deleteStudent(studentId!);
    },
    onSuccess: () => {
      toast.success("Student deleted permanently");
      queryClient.invalidateQueries({ queryKey: ["students"] });
      setDeleteConfirmText("");
      onClose();
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Failed to delete student");
    },
  });

  const student = res?.data;
  const admissionData = student?.admissionApplication;

  const handleModalClose = () => {
    setDeleteConfirmText("");
    onClose();
  };

  const renderDynamicFields = (
    dataObj: Record<string, any>,
    excludeKeys: string[] = [],
  ) => {
    if (!dataObj) return null;

    const validEntries = Object.entries(dataObj).filter(
      ([key, value]) =>
        !excludeKeys.includes(key) &&
        value !== null &&
        value !== undefined &&
        value !== "" &&
        value !== "null",
    );

    if (validEntries.length === 0) {
      return (
        <div className="flex w-full items-center justify-center gap-2 rounded-lg border border-dashed p-8 text-sm text-muted-foreground bg-muted/5">
          <AlertCircle className="h-4 w-4" />
          <span>No additional data available</span>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {validEntries.map(([key, value]) => {
          const strValue = String(value);
          const isLink = strValue.startsWith("http");

          return (
            <div
              key={key}
              className="group flex flex-col space-y-1.5 rounded-xl border border-border/40 bg-muted/10 p-4 transition-colors hover:bg-muted/20"
            >
              <Label className="text-[10px] font-bold tracking-widest text-muted-foreground uppercase">
                {formatKeyLabel(key)}
              </Label>
              <div className="mt-1 flex-1">
                {isLink ? (
                  isImageUrl(strValue) ? (
                    <a
                      href={strValue}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-block overflow-hidden rounded-md border shadow-sm transition-opacity hover:opacity-80"
                    >
                      <img
                        src={strValue}
                        alt={key}
                        className="h-16 w-16 object-cover"
                      />
                    </a>
                  ) : (
                    <a
                      href={strValue}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex w-full items-center gap-2 rounded-md bg-primary/5 p-2 text-sm font-medium text-primary transition-colors hover:bg-primary/10"
                    >
                      <LinkIcon className="h-4 w-4 shrink-0" />
                      <span className="truncate">View Document</span>
                    </a>
                  )
                ) : (
                  <p className="break-words text-sm font-medium text-foreground">
                    {key.toLowerCase().includes("date") &&
                      !isNaN(Date.parse(strValue))
                      ? format(new Date(strValue), "dd MMM yyyy")
                      : strValue}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && handleModalClose()}>
      <SheetContent
        side="right"
        className="flex h-[100dvh] w-full flex-col gap-0 border-l p-0 shadow-2xl sm:max-w-xl md:max-w-2xl lg:max-w-4xl overflow-hidden bg-background"
      >
        <SheetTitle className="sr-only">Student Profile Details</SheetTitle>

        {isLoading ? (
          <div className="flex h-full flex-col items-center justify-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="animate-pulse text-sm font-medium text-muted-foreground">
              Retrieving student records...
            </p>
          </div>
        ) : student ? (
          <>
            <SheetHeader className="shrink-0 space-y-0 border-b bg-muted/10 z-10 relative">
              <div className="flex flex-col gap-4 p-4 sm:gap-6 sm:p-6 sm:flex-row sm:items-start">
                <Avatar className="h-20 w-20 sm:h-28 sm:w-28 shrink-0 rounded-2xl border-2 border-background shadow-md">
                  <AvatarImage
                    src={student.profilePicture}
                    className="object-cover"
                  />
                  <AvatarFallback className="rounded-2xl bg-primary/10 text-2xl sm:text-3xl font-bold text-primary">
                    {student.firstName?.charAt(0)}
                    {student.lastName?.charAt(0)}
                  </AvatarFallback>
                </Avatar>

                <div className="flex flex-1 flex-col justify-between space-y-3 sm:space-y-4 overflow-hidden">
                  <div className="flex flex-col items-start justify-between gap-3 sm:flex-row">
                    <div className="space-y-1 w-full sm:w-auto">
                      <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground truncate">
                        {student.firstName} {student.lastName}
                      </h2>
                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        <Badge
                          variant="secondary"
                          className="bg-primary/10 font-mono text-xs text-primary"
                        >
                          ID: {student.studentId}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          Roll: {student.rollNumber}
                        </Badge>
                        <Badge
                          variant="outline"
                          className={`text-xs capitalize ${student.user?.status === "ACTIVE"
                              ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                              : "border-red-200 bg-red-50 text-red-700"
                            }`}
                        >
                          {student.user?.status?.toLowerCase() || "Unknown"}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-y-2 text-xs sm:text-sm text-muted-foreground sm:grid-cols-2 w-full">
                    <div className="flex items-center gap-2 truncate">
                      <GraduationCap className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">
                        Class {student.class?.name} • Sec {student.section?.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 truncate">
                      <CalendarDays className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">
                        {student.academicYear?.name || "Current Session"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 truncate">
                      <Mail className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">{student.email}</span>
                    </div>
                    <div className="flex items-center gap-2 truncate">
                      <Phone className="h-3.5 w-3.5 shrink-0" />
                      <span className="truncate">{student.phone || "N/A"}</span>
                    </div>
                  </div>
                </div>
              </div>
            </SheetHeader>

            <Tabs
              defaultValue="overview"
              className="flex min-h-0 flex-1 flex-col overflow-hidden"
            >
              <ScrollArea className="w-full shrink-0 border-b">
                <TabsList className="h-14 w-full justify-start rounded-none bg-transparent p-0">
                  <TabsTrigger
                    value="overview"
                    className="relative h-14 rounded-none border-b-2 border-transparent px-4 sm:px-6 text-sm font-semibold text-muted-foreground data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none"
                  >
                    Overview
                  </TabsTrigger>
                  <TabsTrigger
                    value="guardian"
                    className="relative h-14 rounded-none border-b-2 border-transparent px-4 sm:px-6 text-sm font-semibold text-muted-foreground data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none"
                  >
                    Guardians
                  </TabsTrigger>
                  <TabsTrigger
                    value="history"
                    className="relative h-14 rounded-none border-b-2 border-transparent px-4 sm:px-6 text-sm font-semibold text-muted-foreground data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none"
                  >
                    Academics
                  </TabsTrigger>
                  <TabsTrigger
                    value="documents"
                    className="relative h-14 rounded-none border-b-2 border-transparent px-4 sm:px-6 text-sm font-semibold text-muted-foreground data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:shadow-none"
                  >
                    Documents
                  </TabsTrigger>

                  <PermissionGate required={PERMISSIONS.STUDENT_DELETE}>
                    <TabsTrigger
                      value="danger"
                      className="relative h-14 rounded-none border-b-2 border-transparent px-4 sm:px-6 text-sm font-semibold text-rose-500/70 hover:text-rose-600 data-[state=active]:border-rose-500 data-[state=active]:bg-transparent data-[state=active]:text-rose-600 data-[state=active]:shadow-none"
                    >
                      Danger Zone
                    </TabsTrigger>
                  </PermissionGate>
                </TabsList>
                <ScrollBar orientation="horizontal" className="invisible" />
              </ScrollArea>

              <div className="flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-6 pb-12">
                <TabsContent value="overview" className="m-0 animate-in fade-in-50 duration-300">
                  <div className="space-y-6">
                    <div className="flex items-center justify-between border-b pb-2">
                      <h3 className="text-sm font-semibold tracking-tight">
                        Personal Details
                      </h3>
                    </div>
                    {renderDynamicFields(admissionData, [
                      "id",
                      "schoolId",
                      "studentId",
                      "classId",
                      "academicYearId",
                      "createdAt",
                      "updatedAt",
                      "status",
                      "customData",
                      "fatherName",
                      "fatherPhone",
                      "fatherEmail",
                      "fatherOccupation",
                      "fatherEducation",
                      "fatherIncome",
                      "fatherNationalId",
                      "fatherPhotoUrl",
                      "motherName",
                      "motherPhone",
                      "motherEmail",
                      "motherOccupation",
                      "motherEducation",
                      "motherIncome",
                      "motherNationalId",
                      "motherPhotoUrl",
                      "localGuardianName",
                      "localGuardianPhone",
                      "localGuardianRelation",
                      "guardianEmail",
                      "guardianOccupation",
                      "guardianAddress",
                      "guardianPhotoUrl",
                      "birthCertificateUrl",
                      "nationalIdDocumentUrl",
                      "tcDocumentUrl",
                      "previousMarksheetUrl",
                      "casteCertificateUrl",
                      "medicalCertificateUrl",
                      "incomeCertificateUrl",
                    ])}
                  </div>
                </TabsContent>

                <TabsContent value="guardian" className="m-0 space-y-10 animate-in fade-in-50 duration-300">
                  {["Father", "Mother", "Guardian"].map((type) => {
                    const prefix =
                      type === "Guardian"
                        ? "localGuardian"
                        : type.toLowerCase();
                    const hasData =
                      admissionData &&
                      Object.keys(admissionData).some(
                        (k) => k.startsWith(prefix) && admissionData[k],
                      );

                    if (!hasData && type !== "Father") return null;

                    return (
                      <div key={type} className="space-y-4">
                        <div className="flex items-center justify-between border-b pb-2">
                          <h3 className="text-sm font-semibold tracking-tight">
                            {type} Information
                          </h3>
                        </div>
                        {renderDynamicFields(
                          Object.fromEntries(
                            Object.entries(admissionData || {}).filter(([k]) =>
                              k.toLowerCase().includes(type.toLowerCase()),
                            ),
                          ),
                          [],
                        )}
                      </div>
                    );
                  })}
                </TabsContent>

                <TabsContent value="history" className="m-0 animate-in fade-in-50 duration-300">
                  <div className="flex items-center justify-between border-b pb-2 mb-6">
                    <h3 className="text-sm font-semibold tracking-tight">
                      Promotion History
                    </h3>
                  </div>

                  {student.academicHistories && student.academicHistories.length > 0 ? (
                    <div className="space-y-4">
                      {student.academicHistories.map((history: any) => (
                        <div
                          key={history.id}
                          className="flex flex-col justify-between gap-4 rounded-xl border bg-card p-5 shadow-sm sm:flex-row sm:items-center"
                        >
                          <div className="space-y-1">
                            <h4 className="font-bold text-foreground">
                              Session {history.academicYear?.name}
                            </h4>
                            <p className="text-sm font-medium text-muted-foreground">
                              Class {history.class?.name} • Sec{" "}
                              {history.section?.name} • Roll:{" "}
                              {history.rollNumber}
                            </p>
                          </div>
                          <div className="flex flex-wrap items-center gap-2">
                            {history.totalMarks && (
                              <Badge variant="secondary" className="px-3 py-1">
                                Marks: {history.totalMarks}
                              </Badge>
                            )}
                            {history.percentage && (
                              <Badge variant="secondary" className="px-3 py-1">
                                {history.percentage}%
                              </Badge>
                            )}
                            {history.grade && (
                              <Badge className="border-emerald-200 bg-emerald-50 px-3 py-1 text-emerald-700 hover:bg-emerald-50 shadow-none">
                                Grade {history.grade}
                              </Badge>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed py-12 text-center bg-muted/5">
                      <GraduationCap className="mb-4 h-12 w-12 text-muted-foreground/30" />
                      <h4 className="text-sm font-semibold text-foreground">
                        No Academic History
                      </h4>
                      <p className="mt-1 text-sm text-muted-foreground">
                        This student does not have any previous session records.
                      </p>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="documents" className="m-0 space-y-10 animate-in fade-in-50 duration-300">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between border-b pb-2">
                      <h3 className="text-sm font-semibold tracking-tight">
                        Provided Documents
                      </h3>
                    </div>
                    {renderDynamicFields(
                      admissionData,
                      Object.keys(admissionData || {}).filter(
                        (k) => !k.toLowerCase().includes("url"),
                      ),
                    )}
                  </div>

                  {admissionData?.customData && Object.keys(admissionData.customData).length > 0 && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between border-b pb-2">
                        <h3 className="text-sm font-semibold tracking-tight">
                          Custom Form Responses
                        </h3>
                      </div>
                      {renderDynamicFields(admissionData.customData, [
                        "schoolId",
                        "studentId",
                        "classId",
                        "academicYearId",
                        "id",
                      ])}
                    </div>
                  )}
                </TabsContent>

                <PermissionGate required={PERMISSIONS.STUDENT_DELETE}>
                  <TabsContent value="danger" className="m-0 animate-in fade-in-50 duration-300">
                    <div className="space-y-6">
                      <div className="flex items-center justify-between border-b pb-2">
                        <h3 className="text-sm font-semibold tracking-tight text-destructive">
                          Danger Zone
                        </h3>
                      </div>
                      <div className="rounded-xl border border-destructive/20 bg-destructive/5 p-4 sm:p-6">
                        <h3 className="text-base sm:text-lg font-bold text-destructive flex items-center gap-2">
                          <AlertCircle className="h-5 w-5 shrink-0" /> Permanently Delete Student
                        </h3>
                        <p className="text-sm text-muted-foreground mt-2 mb-6">
                          This action cannot be undone. This will permanently delete the student&apos;s profile, academic records, and remove all associated data from the servers.
                        </p>

                        <div className="space-y-4 max-w-md">
                          <div className="space-y-2">
                            <Label className="text-sm font-semibold leading-relaxed">
                              To verify, type <span className="font-mono bg-background px-1.5 py-0.5 rounded text-foreground border border-border/50">{student.studentId || "DELETE"}</span> below:
                            </Label>
                            <Input
                              value={deleteConfirmText}
                              onChange={(e) => setDeleteConfirmText(e.target.value)}
                              placeholder={student.studentId || "DELETE"}
                              className="bg-background focus-visible:ring-destructive"
                            />
                          </div>
                          <Button
                            variant="destructive"
                            className="w-full font-bold shadow-sm"
                            disabled={deleteConfirmText !== (student.studentId || "DELETE") || deleteMutation.isPending}
                            onClick={() => deleteMutation.mutate()}
                          >
                            {deleteMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Trash2 className="h-4 w-4 mr-2" />}
                            Delete student
                          </Button>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </PermissionGate>
              </div>
            </Tabs>
          </>
        ) : null}
      </SheetContent>
    </Sheet>
  );
}