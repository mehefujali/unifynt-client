/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm, Controller } from "react-hook-form";
import { toast } from "sonner";
import {
  CheckCircle2, AlertCircle, Loader2, ArrowRight,
  CalendarDays, Info, UploadCloud, File as FileIcon, X,
  Star, Phone, Minus
} from "lucide-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

import { Header, Footer } from "@/components/templates/enterprise-sections";
import { CustomFormService } from "@/services/form.service";
import { SiteConfigService } from "@/services/site-config.service";
import { DEFAULT_SITE_DATA } from "@/config/default-site-data";
import api from "@/lib/axios";

// ─── Star Rating ──────────────────────────────────────────────────────────────
function StarRating({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  const [hovered, setHovered] = useState(0);
  const labels = ["", "Poor", "Fair", "Good", "Very Good", "Excellent"];
  return (
    <div className="flex items-center gap-2">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          onMouseEnter={() => setHovered(star)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => onChange(star)}
          className="focus:outline-none transition-transform hover:scale-110"
        >
          <Star className={cn("h-8 w-8 transition-colors", (hovered || value) >= star ? "fill-amber-400 text-amber-400" : "text-slate-300 dark:text-slate-600")} />
        </button>
      ))}
      {value > 0 && <span className="text-xs font-bold text-amber-600 dark:text-amber-400 ml-1">{labels[value]}</span>}
    </div>
  );
}

export default function PublicFormPage() {
  const params = useParams();
  const domain = params.domain as string;
  const slug = params.slug as string;

  const [isSubmitted, setIsSubmitted] = useState(false);
  const [uploadingFields, setUploadingFields] = useState<Record<string, boolean>>({});

  // Fetch site data for header/footer
  const { data: siteData, isLoading: isSiteLoading } = useQuery({
    queryKey: ["public-site", domain],
    queryFn: () => SiteConfigService.getPublicSiteData(domain),
    enabled: !!domain,
  });

  const theme = { ...DEFAULT_SITE_DATA.theme, ...(siteData?.themeSettings || {}) };
  const headerData = { ...DEFAULT_SITE_DATA.content.header, ...(siteData?.content?.header || {}) };
  const footerData = { ...DEFAULT_SITE_DATA.content.footer, ...(siteData?.content?.footer || {}) };
  const school = siteData?.school || { name: domain };

  // Fetch form
  const { data: formResponse, isLoading: isFormLoading, error } = useQuery({
    queryKey: ["public-form", slug],
    queryFn: () => CustomFormService.getFormBySlug(slug),
    retry: 1,
  });

  const form = formResponse?.data;
  const fields = form?.fields || [];

  const { register, handleSubmit, control, setValue, watch, formState: { errors } } = useForm();

  const submitMutation = useMutation({
    mutationFn: async (answers: any) => {
      const response = await api.post(`/forms/submit/${form.id}`, { answers });
      return response.data;
    },
    onSuccess: () => {
      setIsSubmitted(true);
      toast.success("Response submitted successfully!");
    },
    onError: (err: any) => {
      toast.error(err?.response?.data?.message || "Something went wrong. Please try again.");
    },
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, fieldId: string) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadingFields((prev) => ({ ...prev, [fieldId]: true }));
    try {
      const formData = new FormData();
      formData.append("file", file);
      const response = await api.post("/upload", formData, { headers: { "Content-Type": "multipart/form-data" } });
      const fileUrl = response.data?.data?.url || response.data?.url;
      if (fileUrl) {
        setValue(fieldId, fileUrl, { shouldValidate: true });
        toast.success("File uploaded successfully");
      } else throw new Error("Invalid response");
    } catch {
      toast.error("Failed to upload file. Please try again.");
      e.target.value = "";
    } finally {
      setUploadingFields((prev) => ({ ...prev, [fieldId]: false }));
    }
  };

  const onSubmit = (data: any) => submitMutation.mutate(data);

  const isLoading = isSiteLoading || isFormLoading;

  return (
    <div style={{ backgroundColor: theme.background || undefined }} className="min-h-screen flex flex-col">

      {/* ── Site Header ────────────────────────────────────────────────────── */}
      <Header data={headerData} theme={theme} school={school} />

      {/* ── Main ───────────────────────────────────────────────────────────── */}
      <main className="flex-grow bg-slate-50 dark:bg-slate-950 py-12 px-4 sm:px-6">

        {/* Loading */}
        {isLoading && (
          <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
            <Loader2 className="h-8 w-8 text-primary animate-spin" />
            <p className="text-sm text-slate-400 font-medium">Loading form...</p>
          </div>
        )}

        {/* Error */}
        {!isLoading && (error || !form) && (
          <div className="max-w-md mx-auto text-center py-16">
            <div className="h-20 w-20 mx-auto bg-rose-100 dark:bg-rose-500/20 rounded-full flex items-center justify-center mb-5">
              <AlertCircle className="h-10 w-10 text-rose-500" />
            </div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Form Not Available</h2>
            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed">
              This form may have been closed, expired, or the link is incorrect.
            </p>
          </div>
        )}

        {/* Form */}
        {!isLoading && form && (
          <div className="max-w-2xl mx-auto">

            {isSubmitted ? (
              /* ── Success ───────────────────────────────────────────────── */
              <div className="text-center py-12 animate-in zoom-in duration-500">
                <div className="mx-auto h-24 w-24 bg-emerald-500 rounded-full flex items-center justify-center shadow-2xl shadow-emerald-500/30 mb-6">
                  <CheckCircle2 className="h-12 w-12 text-white" />
                </div>
                <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-3">Thank You!</h2>
                <p className="text-slate-500 dark:text-slate-400 leading-relaxed max-w-sm mx-auto mb-8">
                  Your response has been recorded. We appreciate you taking the time to fill this out.
                </p>
                <Button onClick={() => (window.location.href = "/")} className="rounded-2xl font-bold h-12 px-8 shadow-lg">
                  Return to Homepage
                </Button>
              </div>
            ) : (
              <>
                {/* ── Form Header ─────────────────────────────────────────── */}
                <div className="mb-8 text-center">
                  <div className="inline-flex items-center px-3 py-1 mb-4 rounded-full bg-primary/10 text-primary font-semibold text-xs border border-primary/20 tracking-wider uppercase">
                    {school.name}
                  </div>
                  <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight mb-3">
                    {form.title}
                  </h1>
                  {form.description && (
                    <p className="text-slate-500 dark:text-slate-400 max-w-xl mx-auto leading-relaxed text-base whitespace-pre-wrap">
                      {form.description}
                    </p>
                  )}
                </div>

                {/* ── Form Card ───────────────────────────────────────────── */}
                <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-slate-200 dark:border-slate-800 overflow-hidden">
                  <div className="h-1.5 bg-gradient-to-r from-primary via-primary/70 to-primary" />

                  <form onSubmit={handleSubmit(onSubmit)} className="p-6 sm:p-8 space-y-7">
                    {fields.map((field: any, index: number) => {
                      const isError = errors[field.id];
                      const fileValue = watch(field.id);
                      const isUploading = uploadingFields[field.id];

                      // Layout fields
                      if (field.type === "DIVIDER") {
                        return (
                          <div key={field.id} className="flex items-center gap-3 py-1">
                            <Minus className="h-4 w-4 text-slate-300 dark:text-slate-600 shrink-0" />
                            <hr className="flex-1 border-slate-200 dark:border-slate-700" />
                          </div>
                        );
                      }
                      if (field.type === "HEADING") {
                        return (
                          <div key={field.id} className="pt-1">
                            <h3 className="text-lg font-bold text-slate-800 dark:text-slate-200 border-b border-slate-100 dark:border-slate-800 pb-2">
                              {field.label}
                            </h3>
                          </div>
                        );
                      }

                      return (
                        <div
                          key={field.id}
                          className="space-y-2.5 animate-in fade-in slide-in-from-bottom-4"
                          style={{ animationDelay: `${index * 40}ms` }}
                        >
                          <Label className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                            {field.label}
                            {field.required && <span className="text-rose-500">*</span>}
                          </Label>

                          {/* TEXT / EMAIL / NUMBER */}
                          {["TEXT", "EMAIL", "NUMBER"].includes(field.type) && (
                            <Input
                              type={field.type === "EMAIL" ? "email" : field.type === "NUMBER" ? "number" : "text"}
                              placeholder={field.placeholder || "Enter your answer"}
                              className={cn("h-12 rounded-2xl bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 focus-visible:ring-primary/20 focus-visible:border-primary/40", isError && "border-rose-400 focus-visible:ring-rose-400/20")}
                              {...register(field.id, { required: field.required ? "This field is required" : false })}
                            />
                          )}

                          {/* PHONE */}
                          {field.type === "PHONE" && (
                            <div className="relative">
                              <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                              <Input
                                type="tel"
                                placeholder={field.placeholder || "+880 1XXX-XXXXXX"}
                                className={cn("h-12 pl-10 rounded-2xl bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 focus-visible:ring-primary/20", isError && "border-rose-400")}
                                {...register(field.id, { required: field.required ? "Phone number is required" : false })}
                              />
                            </div>
                          )}

                          {/* TEXTAREA */}
                          {field.type === "TEXTAREA" && (
                            <Textarea
                              placeholder={field.placeholder || "Type here..."}
                              className={cn("min-h-[110px] rounded-2xl bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 focus-visible:ring-primary/20 resize-none", isError && "border-rose-400")}
                              {...register(field.id, { required: field.required ? "This field is required" : false })}
                            />
                          )}

                          {/* DATE */}
                          {field.type === "DATE" && (
                            <div className="relative">
                              <CalendarDays className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                              <Input
                                type="date"
                                className={cn("h-12 pl-10 rounded-2xl bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 focus-visible:ring-primary/20", isError && "border-rose-400")}
                                {...register(field.id, { required: field.required ? "Date is required" : false })}
                              />
                            </div>
                          )}

                          {/* RATING */}
                          {field.type === "RATING" && (
                            <Controller
                              name={field.id}
                              control={control}
                              rules={{ required: field.required ? "Please give a rating" : false }}
                              render={({ field: { onChange, value } }) => (
                                <StarRating value={value || 0} onChange={onChange} />
                              )}
                            />
                          )}

                          {/* SELECT */}
                          {field.type === "SELECT" && (
                            <Controller
                              name={field.id}
                              control={control}
                              rules={{ required: field.required ? "Please select an option" : false }}
                              render={({ field: { onChange, value } }) => (
                                <Select onValueChange={onChange} value={value}>
                                  <SelectTrigger className={cn("h-12 rounded-2xl bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 font-semibold", isError && "border-rose-400")}>
                                    <SelectValue placeholder="Choose an option..." />
                                  </SelectTrigger>
                                  <SelectContent className="rounded-2xl shadow-xl border-slate-200 dark:border-slate-800">
                                    {field.options?.map((opt: string) => (
                                      <SelectItem key={opt} value={opt} className="font-semibold">{opt}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              )}
                            />
                          )}

                          {/* RADIO */}
                          {field.type === "RADIO" && (
                            <Controller
                              name={field.id}
                              control={control}
                              rules={{ required: field.required ? "Please choose one option" : false }}
                              render={({ field: { onChange, value } }) => (
                                <RadioGroup onValueChange={onChange} value={value} className="space-y-2.5">
                                  {field.options?.map((opt: string) => (
                                    <div key={opt} onClick={() => onChange(opt)} className={cn("flex items-center gap-3 p-3.5 rounded-2xl cursor-pointer border transition-all", value === opt ? "border-primary bg-primary/5 dark:bg-primary/10" : "border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 hover:border-slate-300")}>
                                      <RadioGroupItem value={opt} id={`${field.id}-${opt}`} />
                                      <Label htmlFor={`${field.id}-${opt}`} className="cursor-pointer font-semibold text-sm leading-none">{opt}</Label>
                                    </div>
                                  ))}
                                </RadioGroup>
                              )}
                            />
                          )}

                          {/* CHECKBOX */}
                          {field.type === "CHECKBOX" && (
                            <div className="space-y-2.5">
                              {field.options?.map((opt: string) => (
                                <div key={opt} className="flex items-center gap-3 p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 hover:border-slate-300 transition-colors">
                                  <Checkbox id={`${field.id}-${opt}`} value={opt} {...register(field.id)} />
                                  <Label htmlFor={`${field.id}-${opt}`} className="cursor-pointer font-semibold text-sm leading-none">{opt}</Label>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* FILE UPLOAD */}
                          {field.type === "FILE" && (
                            <div>
                              {fileValue ? (
                                <div className="flex items-center justify-between p-4 border border-primary/30 bg-primary/5 rounded-2xl">
                                  <div className="flex items-center gap-3 overflow-hidden">
                                    <div className="h-9 w-9 shrink-0 bg-primary/10 flex items-center justify-center rounded-xl">
                                      <FileIcon className="h-4 w-4 text-primary" />
                                    </div>
                                    <a href={fileValue} target="_blank" rel="noreferrer" className="text-sm font-semibold text-primary truncate hover:underline">View Uploaded File</a>
                                  </div>
                                  <Button type="button" variant="ghost" size="icon" onClick={() => setValue(field.id, "", { shouldValidate: true })} className="h-8 w-8 text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg shrink-0">
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
                              ) : (
                                <div className={cn("relative flex flex-col items-center justify-center w-full h-28 border-2 border-dashed rounded-2xl transition-colors", isError ? "border-rose-300 bg-rose-50/30" : "border-slate-300 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 hover:bg-slate-100 dark:hover:bg-slate-900")}>
                                  {isUploading ? (
                                    <div className="flex flex-col items-center gap-2">
                                      <Loader2 className="h-6 w-6 animate-spin text-primary" />
                                      <span className="text-xs font-bold text-slate-500">Uploading...</span>
                                    </div>
                                  ) : (
                                    <>
                                      <UploadCloud className="h-7 w-7 text-slate-400 mb-1.5" />
                                      <p className="text-sm font-semibold text-slate-500"><span className="text-primary">Click to upload</span> or drag and drop</p>
                                      <p className="text-[11px] text-slate-400 mt-0.5">Images, PDF, DOC up to 10MB</p>
                                    </>
                                  )}
                                  <input type="file" className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed" disabled={isUploading} onChange={(e) => handleFileUpload(e, field.id)} accept="image/*,.pdf,.doc,.docx" />
                                </div>
                              )}
                              <input type="hidden" {...register(field.id, { required: field.required ? "Please upload a file" : false })} />
                            </div>
                          )}

                          {/* Error */}
                          {isError && (
                            <p className="text-xs font-bold text-rose-500 flex items-center gap-1.5">
                              <Info className="h-3.5 w-3.5 shrink-0" />
                              {(isError as any).message || "This field is required"}
                            </p>
                          )}
                        </div>
                      );
                    })}

                    {/* Submit */}
                    <div className="pt-6 border-t border-slate-100 dark:border-slate-800">
                      <Button
                        type="submit"
                        disabled={submitMutation.isPending || Object.values(uploadingFields).some(Boolean)}
                        className="w-full h-12 rounded-2xl font-black text-base shadow-xl hover:-translate-y-0.5 transition-all disabled:opacity-60 disabled:translate-y-0"
                      >
                        {submitMutation.isPending
                          ? <><Loader2 className="mr-2 h-5 w-5 animate-spin" /> Submitting...</>
                          : <>Submit Form <ArrowRight className="ml-2 h-5 w-5" /></>
                        }
                      </Button>
                      <p className="text-center text-xs text-slate-400 mt-3 font-medium">🔒 Your information is safe and secure</p>
                    </div>
                  </form>
                </div>

                <p className="text-center text-xs text-slate-400 mt-5 font-medium">
                  {fields.filter((f: any) => !["DIVIDER", "HEADING"].includes(f.type)).length} fields &nbsp;·&nbsp; {fields.filter((f: any) => f.required).length} required
                </p>
              </>
            )}
          </div>
        )}
      </main>

      {/* ── Site Footer ────────────────────────────────────────────────────── */}
      <Footer data={footerData} theme={theme} school={school} />
    </div>
  );
}