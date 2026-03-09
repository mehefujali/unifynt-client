"use client";
/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useState } from "react";
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
import { Loader2, UserPlus } from "lucide-react";
import ProfessionalFileUpload from "@/components/ui/file-upload";

interface Props {
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

export default function AddStudentModal({ isOpen, onClose }: Props) {
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

  const { data: configRes } = useQuery({
    queryKey: ["admissionConfig"],
    queryFn: AdmissionService.getConfig,
  });
  const { data: classesRes } = useQuery({
    queryKey: ["classes"],
    queryFn: () => AcademicService.getAllClasses(),
  });
  const { data: yearsRes } = useQuery({
    queryKey: ["academicYears"],
    queryFn: () => AcademicService.getAllAcademicYears(),
  });
  const { data: sectionsRes } = useQuery({
    queryKey: ["allSections"],
    queryFn: () => AcademicService.getAllSections({}),
  });

  const selectedClassId = watch("classId");

  const createMutation = useMutation({
    mutationFn: (formData: FormData) => StudentService.createStudent(formData),
    onSuccess: () => {
      toast.success("Student added successfully!");
      queryClient.invalidateQueries({ queryKey: ["students"] });
      reset();
      onClose();
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Failed to add student");
    },
  });

  const onSubmit = (data: any) => {
    const formData = new FormData();
    const fileKeys = parsedFields
      .filter((f: any) => f.type === "FILE")
      .map((f: any) => f.name);

    const textData = { ...data };
    fileKeys.forEach((k: string) => delete textData[k]);

    formData.append("data", JSON.stringify(textData));

    fileKeys.forEach((key: string) => {
      if (data[key] && data[key].length > 0) {
        formData.append(key, data[key][0]);
      }
    });

    createMutation.mutate(formData);
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
    (sec: any) => sec.classId === selectedClassId,
  );

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent
        side="right"
        className="flex w-full flex-col gap-0 p-0 sm:max-w-xl md:max-w-2xl lg:max-w-3xl"
      >
        <SheetHeader className="shrink-0 border-b bg-muted/10 p-6">
          <SheetTitle className="flex items-center gap-2 text-xl font-bold">
            <UserPlus className="h-5 w-5 text-primary" /> Admit New Student
          </SheetTitle>
          <SheetDescription>
            Manually enter student details and assign them to a class.
          </SheetDescription>
        </SheetHeader>

        <form
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
                  className="rounded-none border-b-2 border-transparent px-4 font-semibold data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
                >
                  Core Information
                </TabsTrigger>
                {parsedFields.length > 0 && (
                  <TabsTrigger
                    value="additional"
                    className="rounded-none border-b-2 border-transparent px-4 font-semibold data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none"
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
                        Required
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
                      Email
                    </Label>
                    <Input
                      type="email"
                      {...register("email")}
                      className="bg-background"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase text-muted-foreground">
                      Phone
                    </Label>
                    <Input
                      type="tel"
                      {...register("phone")}
                      className="bg-background"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-bold uppercase text-muted-foreground">
                      Session <span className="text-destructive">*</span>
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
                        Required
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
                            setValue("sectionId", "");
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
                        Required
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
                          disabled={
                            !selectedClassId || filteredSections.length === 0
                          }
                        >
                          <SelectTrigger className="bg-background">
                            <SelectValue
                              placeholder={
                                !selectedClassId
                                  ? "Select Class First"
                                  : filteredSections.length === 0
                                    ? "No Sections Found"
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
                {parsedFields.length > 0 && (
                  <div className="mt-6 flex justify-end border-t pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setActiveTab("additional")}
                    >
                      Next: Additional Details
                    </Button>
                  </div>
                )}
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
                      {field.type !== "FILE" && (
                        <Label className="text-xs font-bold uppercase text-muted-foreground">
                          {field.label}{" "}
                          {field.required && (
                            <span className="text-destructive">*</span>
                          )}
                        </Label>
                      )}
                      
                      {field.type === "TEXT" && (
                        <Input
                          {...register(field.name, {
                            required: field.required,
                          })}
                          className="bg-background"
                        />
                      )}
                      {field.type === "NUMBER" && (
                        <Input
                          type="number"
                          {...register(field.name, {
                            required: field.required,
                          })}
                          className="bg-background"
                        />
                      )}
                      {field.type === "DATE" && (
                        <Input
                          type="date"
                          {...register(field.name, {
                            required: field.required,
                          })}
                          className="bg-background"
                        />
                      )}
                      {field.type === "DROPDOWN" && (
                        <Controller
                          control={control}
                          name={field.name}
                          rules={{ required: field.required }}
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
                        <Controller
                          control={control}
                          name={field.name}
                          rules={{ required: field.required }}
                          render={({ field: { onChange } }) => (
                            <ProfessionalFileUpload
                              label={`${field.label} ${field.required ? '*' : ''}`}
                              onFileChange={(file) => onChange(file ? [file] : [])}
                            />
                          )}
                        />
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
              disabled={createMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createMutation.isPending}
              className="px-8 font-bold shadow-sm"
            >
              {createMutation.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                "Save Student"
              )}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}