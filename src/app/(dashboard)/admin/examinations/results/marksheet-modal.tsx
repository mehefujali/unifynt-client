/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useQuery } from "@tanstack/react-query";
import { examService } from "@/services/exam.service";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Loader2, Printer, GraduationCap, Award } from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  examId: string;
  studentId: string;
}

export default function MarksheetModal({ isOpen, onClose, examId, studentId }: Props) {
  const { data, isLoading } = useQuery({
    queryKey: ["marksheet", examId, studentId],
    queryFn: () => examService.getStudentMarksheet({ examId, studentId }),
    enabled: isOpen && !!examId && !!studentId,
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl p-0 overflow-hidden bg-white dark:bg-zinc-950 rounded-[24px] border-0 ring-1 ring-border/50 shadow-2xl">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border/50 bg-zinc-50/50 dark:bg-zinc-900/50 print:hidden">
          <DialogTitle className="text-lg font-medium flex items-center gap-2">
            <GraduationCap className="h-5 w-5 text-primary" />
            Student Marksheet
          </DialogTitle>
          <Button onClick={handlePrint} variant="outline" className="rounded-xl bg-white shadow-sm ring-1 ring-inset ring-border/50 border-0 h-9">
            <Printer className="mr-2 h-4 w-4" />
            Print Result
          </Button>
        </div>

        {isLoading || !data ? (
          <div className="flex h-[500px] items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="p-8 overflow-y-auto max-h-[80vh] print:p-0 print:max-h-none print:overflow-visible marksheet-print-area bg-white">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-bold uppercase tracking-wider text-zinc-900">{data.config?.schoolName || "INTERNATIONAL SCHOOL ERP"}</h1>
              <p className="text-sm text-zinc-500 mt-1">{data.config?.schoolAddress || "Excellence in Education"}</p>
              <div className="inline-block mt-4 px-4 py-1.5 rounded-full bg-zinc-100 ring-1 ring-inset ring-zinc-200">
                <h2 className="text-sm font-semibold text-zinc-800 uppercase tracking-wide">{data.examInfo.examName}</h2>
              </div>
            </div>

            <div className="flex items-center justify-between mb-8 p-6 rounded-2xl ring-1 ring-inset ring-zinc-200 bg-zinc-50/50">
              <div className="flex items-center gap-6">
                <Avatar className="h-20 w-20 ring-4 ring-white shadow-sm">
                  <AvatarImage src={data.studentInfo.profilePicture} />
                  <AvatarFallback className="bg-zinc-200 text-zinc-600 text-xl font-medium">
                    {data.studentInfo.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <div className="space-y-1">
                  <h3 className="text-xl font-bold text-zinc-900">{data.studentInfo.name}</h3>
                  <div className="flex gap-4 text-sm text-zinc-600">
                    <p><span className="font-medium text-zinc-900">Class:</span> {data.studentInfo.className}</p>
                    <p><span className="font-medium text-zinc-900">Section:</span> {data.studentInfo.sectionName}</p>
                    <p><span className="font-medium text-zinc-900">Roll No:</span> {data.studentInfo.rollNumber}</p>
                  </div>
                </div>
              </div>
              <div className="text-right space-y-1">
                <div className="flex items-center justify-end gap-2 text-primary font-semibold">
                  <Award className="h-5 w-5" />
                  <span>Class Rank: {data.resultSummary.rankPosition}</span>
                </div>
                <p className="text-sm text-zinc-600">Section Rank: {data.resultSummary.sectionRank}</p>
              </div>
            </div>

            <table className="w-full text-sm text-left mb-8 ring-1 ring-inset ring-zinc-200 rounded-xl overflow-hidden border-collapse">
              <thead className="text-xs uppercase bg-zinc-100 text-zinc-600">
                <tr>
                  <th className="px-4 py-3 font-semibold border-b border-zinc-200">Subject</th>
                  <th className="px-4 py-3 font-semibold border-b border-zinc-200 text-center">Full Marks</th>
                  <th className="px-4 py-3 font-semibold border-b border-zinc-200 text-center">Pass Marks</th>
                  <th className="px-4 py-3 font-semibold border-b border-zinc-200 text-center">Theory</th>
                  <th className="px-4 py-3 font-semibold border-b border-zinc-200 text-center">Practical</th>
                  <th className="px-4 py-3 font-semibold border-b border-zinc-200 text-center bg-zinc-50">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200 bg-white">
                {data.subjectWiseMarks.map((sub: any, idx: number) => (
                  <tr key={idx}>
                    <td className="px-4 py-3 font-medium text-zinc-900">
                      {sub.subjectName} <span className="text-xs text-zinc-400 font-normal">({sub.subjectCode})</span>
                    </td>
                    <td className="px-4 py-3 text-center text-zinc-600">{sub.fullMarks}</td>
                    <td className="px-4 py-3 text-center text-zinc-600">{sub.passMarks}</td>
                    <td className="px-4 py-3 text-center text-zinc-600">{sub.theoryMarks ?? "-"}</td>
                    <td className="px-4 py-3 text-center text-zinc-600">{sub.practicalMarks ?? "-"}</td>
                    <td className={cn("px-4 py-3 text-center font-bold bg-zinc-50", sub.totalObtained < sub.passMarks || sub.isAbsent ? "text-red-600" : "text-zinc-900")}>
                      {sub.isAbsent ? "ABSENT" : sub.totalObtained}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="flex justify-end">
              <div className="w-72 rounded-2xl ring-1 ring-inset ring-zinc-200 bg-zinc-50/50 p-5 space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500">Total Marks</span>
                  <span className="font-semibold text-zinc-900">{data.resultSummary.totalMarks}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500">Marks Obtained</span>
                  <span className="font-semibold text-zinc-900">{data.resultSummary.marksObtained}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-zinc-500">Percentage</span>
                  <span className="font-semibold text-zinc-900">{data.resultSummary.percentage}%</span>
                </div>
                <div className="h-px bg-zinc-200 w-full my-2"></div>
                <div className="flex justify-between items-center">
                  <span className="font-medium text-zinc-900">Final Result</span>
                  <div className="flex items-center gap-2">
                    <span className={cn("px-2.5 py-1 rounded-lg text-xs font-bold", data.resultSummary.status === "PASS" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700")}>
                      {data.resultSummary.status}
                    </span>
                    <span className="text-xl font-black text-zinc-900">{data.resultSummary.grade}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-16 flex justify-between items-end px-8 print:mt-24">
              <div className="text-center">
                <div className="w-40 border-b border-zinc-400 mb-2"></div>
                <p className="text-xs text-zinc-500 uppercase tracking-wider font-medium">Class Teacher</p>
              </div>
              <div className="text-center">
                <div className="w-40 border-b border-zinc-400 mb-2"></div>
                <p className="text-xs text-zinc-500 uppercase tracking-wider font-medium">Principal</p>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}