"use client";

import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { examService } from "@/services/exam.service";
import { MarksheetPreview } from "../marksheet-builder/marksheet-preview";
import { MarksheetConfig, defaultMarksheetConfig } from "@/types/marksheet-config";
import { createPortal } from "react-dom";

interface Props {
    examId: string;
    studentId: string | null;
    onComplete: () => void;
}

export function DirectPrintHandler({ examId, studentId, onComplete }: Props) {
    const { data, isSuccess, isFetching } = useQuery({
        queryKey: ["studentMarksheet", studentId, examId],
        queryFn: () => examService.getStudentMarksheet({ studentId: studentId!, examId }),
        enabled: !!studentId && !!examId,
    });

    const [config, setConfig] = useState<MarksheetConfig>(defaultMarksheetConfig);

    useEffect(() => {
        const saved = localStorage.getItem("marksheetConfig");
        if (saved) {
            try {
                setConfig(JSON.parse(saved));
            } catch (e) {
                console.error("Failed to parse marksheet config", e);
            }
        }
    }, []);

    useEffect(() => {
        if (isSuccess && data && !isFetching && studentId) {
            // Small timeout ensures the DOM has fully parsed the hidden preview before printing
            const timer = setTimeout(() => {
                executePrint();
            }, 500);
            return () => clearTimeout(timer);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isSuccess, data, isFetching, studentId]);

    const executePrint = () => {
        const originalTitle = document.title;
        if (data?.studentInfo && data?.config) {
            const studentName = data.studentInfo.name || "Student";
            const schoolName = data.config.schoolName || "School";
            const sId = data.studentInfo.studentId || "ID_N_A";
            document.title = `${studentName} - ${schoolName} - ${sId}`;
        }

        window.print();

        setTimeout(() => {
            document.title = originalTitle;
            onComplete();
        }, 1000);
    };

    if (!studentId || !isSuccess || !data) return null;

    return createPortal(
        <div id="genuine-print-root" className="hidden print:block w-full bg-white m-0 p-0 text-zinc-900 absolute top-0 left-0 z-[-9999]">
            <div className="print:hidden w-full max-w-[794px] mx-auto absolute opacity-0 pointer-events-none">
                <MarksheetPreview data={data} config={config} />
            </div>
            <style dangerouslySetInnerHTML={{
                __html: `
        @media print {
          @page { margin: 0; size: A4 portrait; }
          body { margin: 0; padding: 0; -webkit-print-color-adjust: exact; color-adjust: exact; background: white !important; }
          body > * { display: none !important; }
          body > #genuine-print-root {
            display: block !important;
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 10mm;
            box-sizing: border-box;
          }
          #genuine-print-root .marksheet-print-area {
            width: 100%;
            height: auto;
            min-height: 277mm;
          }
        }
      `}} />
        </div>,
        document.body
    );
}
