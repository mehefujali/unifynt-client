/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react/no-unescaped-entities */
"use client";

import React, { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { StudentService } from "@/services/student.service";
import { AcademicService } from "@/services/academic.service";
import { AdmissionService } from "@/services/admission.service";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Edit3, FileUp, Link as LinkIcon } from "lucide-react";

interface Props {
  studentId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

const extractData = (res: any) => {
  if (!res) return [];
  if (Array.isArray(res)) return res;
  if (Array.isArray(res.data)) return res.data;
  if (res.data && Array.isArray(res.data.data)) return res.data.data;
  return [];
};

const formatDate = (dateStr: any) => {
  if (!dateStr) return "";
  try {
    return new Date(dateStr).toISOString().split("T")[0];
  } catch (e) {
    return "";
  }
};

export default function EditStudentModal({
  studentId,
  isOpen,
  onClose,
}: Props) {
  const queryClient = useQueryClient();
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    watch,
    reset,
    setValue,
  } = useForm();

  const [activeTab, setActiveTab] = useState("core");
  const [initializedId, setInitializedId] = useState<string | null>(null);

  const { data: studentRes, isLoading: loadingStudent } = useQuery({
    queryKey: ["student", studentId],
    queryFn: () => StudentService.getStudentById(studentId!),
    enabled: !!studentId && isOpen,
  });

  const { data: configRes } = useQuery({
    queryKey: ["admissionConfig"],
    queryFn: AdmissionService.getConfig,
  });

  const { data: classesRes, isLoading: loadingClasses } = useQuery({
    queryKey: ["classes"],
    queryFn: () => AcademicService.getAllClasses(),
  });

  const { data: yearsRes, isLoading: loadingYears } = useQuery({
    queryKey: ["academicYears"],
    queryFn: () => AcademicService.getAllAcademicYears(),
  });

  const student = studentRes?.data;
  const selectedClassId = watch("classId");
  const effectiveClassId = selectedClassId || student?.classId;

  const { data: sectionsRes, isLoading: loadingSections } = useQuery({
    queryKey: ["sections", effectiveClassId],
    queryFn: () =>
      AcademicService.getAllSections({ classId: effectiveClassId }),
    enabled: !!effectiveClassId,
  });

  useEffect(() => {
    if (!isOpen) {
      setInitializedId(null);
      reset({});
      setActiveTab("core");
      return;
    }

    const isAllDropdownDataReady =
      !loadingClasses && classesRes && !loadingYears && yearsRes;

    if (
      isOpen &&
      student &&
      student.id !== initializedId &&
      isAllDropdownDataReady
    ) {
      const app = student.admissionApplication || {};
      const custom = app.customData || {};

      const coreValues: any = {
        firstName: student.firstName || "",
        lastName: student.lastName || "",
        email: student.email || "",
        phone: student.phone || "",
        classId: student.classId || "",
        sectionId: student.sectionId || "",
        academicYearId: student.academicYearId || "",
      };

      const defaultValues: any = { ...coreValues };

      Object.keys(app).forEach((key) => {
        if (!(key in coreValues)) {
          if (key.toLowerCase().includes("date") && app[key]) {
            defaultValues[key] = formatDate(app[key]);
          } else if (typeof app[key] !== "object") {
            defaultValues[key] = app[key] || "";
          }
        }
      });

      Object.keys(custom).forEach((key) => {
        if (!(key in coreValues)) {
          if (key.toLowerCase().includes("date") && custom[key]) {
            defaultValues[key] = formatDate(custom[key]);
          } else {
            defaultValues[key] = custom[key] || "";
          }
        }
      });

      reset(defaultValues);
      setInitializedId(student.id);
    }
  }, [
    isOpen,
    student,
    initializedId,
    loadingClasses,
    classesRes,
    loadingYears,
    yearsRes,
    reset,
  ]);

  const updateMutation = useMutation({
    mutationFn: (formData: FormData) =>
      StudentService.updateStudent(studentId!, formData),
    onSuccess: () => {
      toast.success("Student updated successfully");
      queryClient.invalidateQueries({ queryKey: ["students"] });
      queryClient.invalidateQueries({ queryKey: ["student", studentId] });
      onClose();
    },
    onError: (error: any) => {
      toast.error(
        error?.response?.data?.message || "Failed to update student",
      );
    },
  });

  const onSubmit = (data: any) => {
    const formData = new FormData();
    const fileKeys = parsedFields
      .filter((f: any) => f.type === "FILE")
      .map((f: any) => f.name);

    const textData = { ...data };
    fileKeys.forEach((k: string) => delete textData[k]);

    fileKeys.forEach((key: string) => {
      const fileValue = data[key];
      if (fileValue && typeof fileValue !== "string" && fileValue.length > 0) {
        formData.append(key, fileValue[0]);
      } else if (typeof fileValue === "string" && fileValue.trim() !== "") {
        textData[key] = fileValue;
      }
    });

    formData.append("data", JSON.stringify(textData));
    updateMutation.mutate(formData);
  };

  let parsedFields: any[] = [];
  try {
    parsedFields =
      typeof configRes?.data?.fields === "string"
        ? JSON.parse(configRes.data.fields)
        : configRes?.data?.fields || [];
  } catch (e) {}

  const classList = extractData(classesRes);
  const yearList = extractData(yearsRes);
  const allSections = extractData(sectionsRes);
  const filteredSections = allSections.filter(
    (sec: any) => sec.classId === effectiveClassId,
  );

  const isFormReadyToRender = student && initializedId === student.id;

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent
        side="right"
        className="flex w-full flex-col gap-0 p-0 sm:max-w-xl md:max-w-2xl lg:max-w-3xl"
      >
        <SheetHeader className="shrink-0 border-b bg-muted/10 p-6">
          <SheetTitle className="flex items-center gap-2 text-xl font-bold">
            <Edit3 className="h-5 w-5 text-amber-500" />
            Edit Student Profile
          </SheetTitle>
          <SheetDescription>
            Update the student's personal, academic, and additional records.
          </SheetDescription>
        </SheetHeader>

        {!isFormReadyToRender ||
        loadingStudent ||
        loadingClasses ||
        loadingYears ? (
          <div className="flex h-full flex-col items-center justify-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="animate-pulse text-sm font-medium text-muted-foreground">
              Loading student details...
            </p>
          </div>
        ) : (
          <form
            key={student.id}
            onSubmit={handleSubmit(onSubmit)}
            className="flex min-h-0 flex-1 flex-col"
          >
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="flex min-h-0 flex-1 flex-col"
            >
              <div className="shrink-0 overflow-x-auto border-b bg-muted/5">
                <TabsList className="flex h-12 w-max min-w-full justify-start space-x-2 rounded-none bg-transparent px-4">
                  <TabsTrigger
                    value="core"
                    className="rounded-none border-b-2 border-transparent px-4 font-semibold data-[state=active]:border-amber-500 data-[state=active]:bg-transparent data-[state=active]:shadow-none"
                  >
                    Core Information
                  </TabsTrigger>
                  {parsedFields.length > 0 && (
                    <TabsTrigger
                      value="additional"
                      className="rounded-none border-b-2 border-transparent px-4 font-semibold data-[state=active]:border-amber-500 data-[state=active]:bg-transparent data-[state=active]:shadow-none"
                    >
                      Additional Details
                    </TabsTrigger>
                  )}
                </TabsList>
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                <TabsContent value="core" className="m-0 space-y-6">
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase text-muted-foreground">
                        First Name <span className="text-destructive">*</span>
                      </Label>
                      <Input
                        {...register("firstName", { required: true })}
                        className="bg-background"
                      />
                      {errors.firstName && (
                        <span className="text-[10px] font-semibold text-destructive">
                          Required field
                        </span>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase text-muted-foreground">
                        Last Name
                      </Label>
                      <Input
                        {...register("lastName")}
                        className="bg-background"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase text-muted-foreground">
                        Email Address
                      </Label>
                      <Input
                        type="email"
                        {...register("email")}
                        className="bg-background"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase text-muted-foreground">
                        Phone Number
                      </Label>
                      <Input
                        type="tel"
                        {...register("phone")}
                        className="bg-background"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase text-muted-foreground">
                        Academic Session{" "}
                        <span className="text-destructive">*</span>
                      </Label>
                      <Controller
                        control={control}
                        name="academicYearId"
                        rules={{ required: true }}
                        render={({ field }) => (
                          <Select
                            onValueChange={field.onChange}
                            value={field.value || undefined}
                          >
                            <SelectTrigger className="bg-background">
                              <SelectValue placeholder="Select Session" />
                            </SelectTrigger>
                            <SelectContent position="popper">
                              {yearList.map((year: any) => (
                                <SelectItem key={year.id} value={year.id}>
                                  {year.name || year.year}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                      {errors.academicYearId && (
                        <span className="text-[10px] font-semibold text-destructive">
                          Required field
                        </span>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase text-muted-foreground">
                        Class <span className="text-destructive">*</span>
                      </Label>
                      <Controller
                        control={control}
                        name="classId"
                        rules={{ required: true }}
                        render={({ field }) => (
                          <Select
                            onValueChange={(val) => {
                              field.onChange(val);
                              if (val !== student?.classId) {
                                setValue("sectionId", "");
                              }
                            }}
                            value={field.value || undefined}
                          >
                            <SelectTrigger className="bg-background">
                              <SelectValue placeholder="Select Class" />
                            </SelectTrigger>
                            <SelectContent position="popper">
                              {classList.map((cls: any) => (
                                <SelectItem key={cls.id} value={cls.id}>
                                  {cls.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                      {errors.classId && (
                        <span className="text-[10px] font-semibold text-destructive">
                          Required field
                        </span>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label className="text-xs font-bold uppercase text-muted-foreground">
                        Section
                      </Label>
                      <Controller
                        control={control}
                        name="sectionId"
                        render={({ field }) => (
                          <Select
                            onValueChange={field.onChange}
                            value={field.value || undefined}
                            disabled={!effectiveClassId || loadingSections}
                          >
                            <SelectTrigger className="bg-background">
                              <SelectValue
                                placeholder={
                                  !effectiveClassId
                                    ? "Select Class First"
                                    : loadingSections
                                      ? "Loading..."
                                      : "Select Section"
                                }
                              />
                            </SelectTrigger>
                            <SelectContent position="popper">
                              {filteredSections.map((sec: any) => (
                                <SelectItem key={sec.id} value={sec.id}>
                                  {sec.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="additional" className="m-0 space-y-6">
                  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
                    {parsedFields.map((field: any) => (
                      <div
                        key={field.name}
                        className={`space-y-2 ${
                          field.type === "FILE" ? "sm:col-span-2" : ""
                        }`}
                      >
                        <Label className="text-xs font-bold uppercase text-muted-foreground">
                          {field.label}
                        </Label>
                        {field.type === "TEXT" && (
                          <Input
                            {...register(field.name)}
                            className="bg-background"
                          />
                        )}
                        {field.type === "NUMBER" && (
                          <Input
                            type="number"
                            {...register(field.name)}
                            className="bg-background"
                          />
                        )}
                        {field.type === "DATE" && (
                          <Input
                            type="date"
                            {...register(field.name)}
                            className="bg-background"
                          />
                        )}
                        {field.type === "DROPDOWN" && (
                          <Controller
                            control={control}
                            name={field.name}
                            render={({ field: selectField }) => (
                              <Select
                                onValueChange={selectField.onChange}
                                value={selectField.value || undefined}
                              >
                                <SelectTrigger className="bg-background">
                                  <SelectValue
                                    placeholder={`Select ${field.label}`}
                                  />
                                </SelectTrigger>
                                <SelectContent position="popper">
                                  {field.options?.map((opt: string) => (
                                    <SelectItem key={opt} value={opt}>
                                      {opt}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            )}
                          />
                        )}
                        {field.type === "FILE" && (
                          <div className="space-y-3">
                            {watch(field.name) &&
                              typeof watch(field.name) === "string" && (
                                <a
                                  href={watch(field.name)}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex w-max items-center gap-2 rounded-md bg-primary/10 px-3 py-1.5 text-sm font-semibold text-primary transition-colors hover:bg-primary/20"
                                >
                                  <LinkIcon className="h-4 w-4" />
                                  View Existing File
                                </a>
                              )}
                            <div className="relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed bg-background p-6 text-center transition-colors hover:bg-muted/30">
                              <FileUp className="mb-2 h-6 w-6 text-muted-foreground" />
                              <div className="text-sm font-semibold text-foreground">
                                Upload a new file
                              </div>
                              <div className="text-xs text-muted-foreground mt-1">
                                Click or drag and drop to replace
                              </div>
                              <input
                                type="file"
                                {...register(field.name)}
                                className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </TabsContent>
              </div>
            </Tabs>

            <div className="flex shrink-0 items-center justify-end gap-3 border-t bg-muted/10 p-4 sm:p-6">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={updateMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={updateMutation.isPending}
                className="bg-amber-500 px-8 font-bold text-white hover:bg-amber-600"
              >
                {updateMutation.isPending ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  "Update Details"
                )}
              </Button>
            </div>
          </form>
        )}
      </SheetContent>
    </Sheet>
  );
}