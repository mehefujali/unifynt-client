/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useQuery } from "@tanstack/react-query";
import { examService } from "@/services/exam.service";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, Printer, FileText } from "lucide-react";
import { MarksheetPreview } from "../marksheet-builder/marksheet-preview";
import { MarksheetConfig, defaultMarksheetConfig } from "@/types/marksheet-config";
import { useState, useEffect } from "react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  examId: string;
  studentId: string;
}

export default function MarksheetModal({ isOpen, onClose, examId, studentId }: Props) {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["studentMarksheet", studentId, examId],
    queryFn: () =>
      examService.getStudentMarksheet({
        studentId,
        examId,
      }),
    enabled: !!studentId && !!examId && isOpen,
  });

  const [config, setConfig] = useState<MarksheetConfig>(defaultMarksheetConfig);

  useEffect(() => {
    const saved = localStorage.getItem("marksheetConfig");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setTimeout(() => setConfig(parsed), 0);
      } catch (e) {
        console.error("Failed to parse marksheet config", e);
      }
    }
  }, [isOpen]);

  const handlePrint = () => {
    if (data && data.studentInfo && data.config) {
      const originalTitle = document.title;
      // Construct dynamic filename matching "Student Name - School Name - Student ID"
      const studentName = data.studentInfo.name || "Student";
      const schoolName = data.config.schoolName || "School";
      const sId = data.studentInfo.studentId || "ID_N_A";

      document.title = `${studentName} - ${schoolName} - ${sId}`;
      window.print();

      // Delay restoration so the print spooler has time to read the spoofed title
      setTimeout(() => {
        document.title = originalTitle;
      }, 1000);
    } else {
      window.print();
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[1000px] w-[95vw] p-0 overflow-hidden bg-zinc-100/50 dark:bg-zinc-950 rounded-2xl border-0 ring-1 ring-border shadow-2xl print:w-full print:max-w-none print:transform-none print:static print:absolute-none print:fixed-none print:shadow-none print:border-none print:ring-0 print:rounded-none overflow-y-auto max-h-[90vh] print:max-h-none print:overflow-visible">
        {/* Header Action Bar - Hidden in Print */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-white dark:bg-zinc-900 print:hidden z-10 relative shadow-sm">
          <DialogTitle className="text-lg font-bold flex items-center gap-2 text-zinc-800 dark:text-zinc-100 uppercase tracking-tight">
            <FileText className="h-5 w-5 text-primary" />
            Report Card Preview
          </DialogTitle>
          <Button onClick={handlePrint} className="rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground shadow-md font-bold tracking-wide transition-all h-10 px-6">
            <Printer className="mr-2 h-4 w-4" />
            Print Marksheet
          </Button>
        </div>

        {/* Content Area */}
        <div className="relative bg-zinc-100 dark:bg-zinc-950/50 print:bg-white min-h-[500px]">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center p-24">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="mt-4 text-sm font-medium text-zinc-500">Loading student marksheet...</p>
            </div>
          ) : isError || !data ? (
            <div className="flex flex-col items-center justify-center p-24 text-center">
              <div className="h-12 w-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <Loader2 className="h-6 w-6 text-red-600" />
              </div>
              <p className="text-red-600 font-medium text-center max-w-sm">
                {(error as any)?.message || "Failed to load marksheet data. Please try again."}
              </p>
            </div>
          ) : (
            <div className="w-full flex justify-center p-4 md:p-8 print:p-0">
              <MarksheetPreview data={data} config={config} />
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}