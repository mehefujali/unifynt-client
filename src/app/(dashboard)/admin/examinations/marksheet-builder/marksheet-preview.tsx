/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { cn } from "@/lib/utils";
import { MarksheetConfig } from "@/types/marksheet-config";
import { useQuery } from "@tanstack/react-query";
import { examService } from "@/services/exam.service";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";

interface Props {
    data: any; // The student's data payload from examService.getStudentMarksheet
    config: MarksheetConfig;
}

export function MarksheetPreview({ data, config }: Props) {
    const [mounted, setMounted] = useState(false);
    useEffect(() => {
        // eslint-disable-next-line
        setMounted(true);
    }, []);

    const { data: gradesData } = useQuery({
        queryKey: ["examGrades"],
        queryFn: () => examService.getAllExamGrades(),
    });

    if (!data) return null;

    // Helper to calculate dynamic grade
    const calculateGrade = (obtained: number, max: number) => {
        if (!gradesData || gradesData.length === 0 || max === 0) return "-";
        const percentage = (obtained / max) * 100;

        // Find the matching grade bracket
        const matchedGrade = gradesData.find(
            (g: any) => percentage >= g.minMarks && percentage <= g.maxMarks
        );
        return matchedGrade ? matchedGrade.name : "-";
    };

    // We map titleSize to corresponding text classes
    const titleSizeClass = {
        sm: "text-2xl",
        md: "text-3xl",
        lg: "text-4xl",
        xl: "text-5xl",
    }[config.header.titleSize] || "text-4xl";

    // Conditionally render columns if AT LEAST one subject has them enabled
    const hasTheory = data.subjectWiseMarks.some((sub: any) => sub.hasTheory);
    const hasPracticalOrViva = data.subjectWiseMarks.some((sub: any) => sub.hasPractical || sub.hasViva);

    // Calculate ColSpan for Footer
    let footerColSpan = 2; // Subjects + Max Marks
    if (config.table.showMinMarks) footerColSpan++;
    if (hasTheory) footerColSpan++;
    if (hasPracticalOrViva) footerColSpan++;



    const marksheetContent = (
        <div className="relative w-full max-w-[210mm] min-h-[297mm] print:min-h-[277mm] mx-auto bg-white print:m-0 print:p-0 marksheet-print-area overflow-hidden text-zinc-900 border border-zinc-200 shadow-xl print:shadow-none print:border-0 flex flex-col">
            {/* Inner padding wrapper */}
            <div className="px-6 py-8 md:p-10 print:p-0 flex flex-col w-full flex-1">

                <div className={cn("absolute inset-0 flex items-center justify-center pointer-events-none z-0 select-none", config.design.watermarkType === "none" && "hidden")} style={{ opacity: config.design.watermarkOpacity / 100 }}>
                    {config.design.watermarkType === "image" && data.config?.schoolLogo ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={data.config.schoolLogo} alt="Watermark" className="w-[80%] max-w-[600px] object-contain grayscale" />
                    ) : config.design.watermarkType === "text" ? (
                        <h1 className="text-[100px] w-full font-black uppercase text-center leading-none tracking-tighter rotate-[-30deg] text-zinc-400">
                            {config.design.customWatermarkText}
                        </h1>
                    ) : null}
                </div>

                {/* 🎯 Real Content Wrapper (Z-10 brings it above watermark) */}
                <div className="relative z-10 h-full flex flex-col">

                    {/* --- Header Section --- */}
                    <div className="flex items-center justify-between border-b-[3px] border-zinc-900 pb-6 mb-8 print:border-b-4" style={{ borderColor: config.design.themeColor }}>
                        {/* Left Logo - Invisible if null or explicitly hidden via config */}
                        <div className={cn("w-28 h-28 relative flex-shrink-0 flex items-center justify-center p-2", (!data.config?.schoolLogo || !config.header.showLogo) && "opacity-0 invisible")}>
                            {data.config?.schoolLogo && config.header.showLogo && (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={data.config.schoolLogo} alt="School Logo" className="object-contain w-full h-full" />
                            )}
                        </div>

                        {/* Center Details */}
                        <div className="flex-1 text-center px-6 space-y-2">
                            <h1 className={cn("font-black uppercase tracking-tight leading-none", titleSizeClass)} style={{ color: config.design.themeColor }}>
                                {config.header.headingText || data.config?.schoolName}
                            </h1>
                            {config.header.subtitle && (
                                <p className="text-sm font-semibold text-zinc-600 uppercase tracking-widest">
                                    {config.header.subtitle}
                                </p>
                            )}
                            {config.header.affiliationText && (
                                <p className="text-xs font-bold text-zinc-500 tracking-wider uppercase">
                                    {config.header.affiliationText}
                                </p>
                            )}
                            <div className="inline-block mt-3 px-6 py-1.5 border-2 rounded-full bg-zinc-50 print:bg-transparent" style={{ borderColor: config.design.themeColor }}>
                                <h2 className="text-sm font-black uppercase tracking-widest" style={{ color: config.design.themeColor }}>{data.examInfo.examName}</h2>
                            </div>
                        </div>

                        {/* Right Photo */}
                        <div className={cn("w-28 h-32 flex-shrink-0 border-2 p-1 flex items-center justify-center overflow-hidden", data.studentInfo.profilePicture && config.profile.showPhoto ? "border-zinc-300 bg-zinc-50 print:border-zinc-400" : "border-transparent opacity-0 invisible")}>
                            {data.studentInfo.profilePicture && config.profile.showPhoto && (
                                // eslint-disable-next-line @next/next/no-img-element
                                <img src={data.studentInfo.profilePicture} alt="Student" className="w-full h-full object-cover" />
                            )}
                        </div>
                    </div>

                    {/* --- Student Profile Box --- */}
                    <div className="border border-zinc-900 p-4 mb-8 print:border-2" style={{ borderColor: config.design.themeColor }}>
                        <div className="grid grid-cols-2 gap-x-8 gap-y-3">
                            <div className="flex">
                                <span className="w-32 text-xs font-bold text-zinc-600 uppercase tracking-wider">Student Name</span>
                                <span className="text-xs font-black text-zinc-900 uppercase">: {data.studentInfo.name}</span>
                            </div>
                            {config.profile.fields?.filter((f: any) => f.isVisible).map((field: any) => (
                                <div className="flex" key={field.key}>
                                    <span className="w-32 text-[11px] font-bold text-zinc-600 uppercase tracking-wider">{field.label}</span>
                                    <span className="text-[11px] font-black text-zinc-900 uppercase">: {data.studentInfo[field.key] || "-"}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* --- Performance Table --- */}
                    <div className="mb-8">
                        <div className="flex items-center gap-2 mb-3">
                            <h3 className="text-sm font-black uppercase tracking-widest text-zinc-900">Scholastic Performance</h3>
                        </div>
                        <table className="w-full border-collapse border-2 border-zinc-900 text-sm print:border-2">
                            <thead>
                                <tr className="bg-zinc-100" style={{ backgroundColor: `${config.design.themeColor}10` }}>
                                    <th className="border border-zinc-900 p-3 text-left font-black uppercase tracking-wider text-xs w-[35%]">Subjects</th>
                                    <th className="border border-zinc-900 p-3 text-center font-black uppercase tracking-wider text-[10px] w-[10%] leading-tight">Max<br />Marks</th>
                                    {config.table.showMinMarks && (
                                        <th className="border border-zinc-900 p-3 text-center font-black uppercase tracking-wider text-[10px] w-[10%] leading-tight">Min<br />Marks</th>
                                    )}
                                    {hasTheory && (
                                        <th className="border border-zinc-900 p-3 text-center font-bold uppercase tracking-wider text-[10px] w-[12%]">Theory</th>
                                    )}
                                    {hasPracticalOrViva && (
                                        <th className="border border-zinc-900 p-3 text-center font-bold uppercase tracking-wider text-[10px] w-[12%] leading-tight">Prac/<br />Viva</th>
                                    )}
                                    <th className="border border-zinc-900 p-3 text-center font-black uppercase tracking-wider text-[10px] w-[10%] leading-tight">Marks<br />Obt.</th>
                                    {config.table.showGrades && (
                                        <th className="border border-zinc-900 p-3 text-center font-black uppercase tracking-wider text-[10px] w-[11%]">Grade</th>
                                    )}
                                </tr>
                            </thead>
                            <tbody>
                                {data.subjectWiseMarks.map((sub: any, idx: number) => (
                                    <tr key={idx}>
                                        <td className="border border-zinc-900 p-3">
                                            <p className="font-bold text-zinc-900">{sub.subjectName}</p>
                                            <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-wider mt-0.5">{sub.subjectCode}</p>
                                        </td>
                                        <td className="border border-zinc-900 p-3 text-center font-semibold text-zinc-700">{sub.fullMarks ?? "-"}</td>
                                        {config.table.showMinMarks && (
                                            <td className="border border-zinc-900 p-3 text-center font-semibold text-zinc-700">{sub.passMarks ?? "-"}</td>
                                        )}
                                        {hasTheory && (
                                            <td className="border border-zinc-900 p-3 text-center font-semibold text-zinc-700">
                                                {sub.theoryMarks !== null && sub.theoryMarks !== undefined ? sub.theoryMarks : "-"}
                                            </td>
                                        )}
                                        {hasPracticalOrViva && (
                                            <td className="border border-zinc-900 p-3 text-center font-semibold text-zinc-700">
                                                {/* Combine Practical + Viva if both exist, otherwise show whichever exists */}
                                                {sub.practicalMarks !== null || sub.vivaMarks !== null
                                                    ? (sub.practicalMarks || 0) + (sub.vivaMarks || 0)
                                                    : "-"}
                                            </td>
                                        )}
                                        <td className="border border-zinc-900 p-3 text-center font-black text-zinc-900">{sub.totalObtained ?? "-"}</td>
                                        {config.table.showGrades && (
                                            <td className="border border-zinc-900 p-3 text-center font-black text-zinc-900">
                                                {/* Use dynamic grade calculation if we have grades and obtained marks, fallback to backend strictly mapped grade */}
                                                {gradesData?.length ? calculateGrade(sub.totalObtained, sub.fullMarks) : (sub.grade || "-")}
                                            </td>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot>
                                <tr>
                                    <td colSpan={footerColSpan} className="border border-zinc-900 p-3 text-right font-black uppercase tracking-widest text-xs">
                                        Grand Total
                                    </td>
                                    <td className="border border-zinc-900 p-3 text-center font-black text-lg text-zinc-900">
                                        {data.resultSummary.marksObtained ?? "-"}
                                    </td>
                                    <td className="border border-zinc-900 p-2 text-center text-[10px] font-bold text-zinc-500 leading-tight">
                                        OUT OF<br />{data.resultSummary.totalMarks ?? "-"}
                                    </td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>

                    {/* --- Summary & Result Section --- */}
                    <div className="mb-6">
                        {/* Final Result Box */}
                        <div className="border-2 border-zinc-900 p-6 bg-zinc-50 flex flex-col justify-center" style={{ borderColor: config.design.themeColor }}>
                            <div className="flex justify-between items-end mb-4">
                                <span className="text-sm font-black uppercase tracking-widest text-zinc-600">Final Recommendation Status</span>
                                <span className={cn(
                                    "text-3xl font-black uppercase tracking-tighter"
                                )} style={{ color: (data.resultSummary.status === "PASS" || data.resultSummary.status === "PROMOTED") ? '#15803d' : '#b91c1c' }}>
                                    {data.resultSummary.status}
                                </span>
                            </div>
                            <div className="flex justify-between border-t-2 border-zinc-300 pt-3">
                                <div>
                                    <p className="text-xs uppercase font-bold text-zinc-500">Overall Percentage</p>
                                    <p className="text-2xl font-black text-zinc-900">{data.resultSummary.percentage}%</p>
                                </div>
                                {config.table.showGrades && (
                                    <div className="text-center">
                                        <p className="text-xs uppercase font-bold text-zinc-500">Final Grade</p>
                                        <p className="text-2xl font-black text-zinc-900">{data.resultSummary.grade}</p>
                                    </div>
                                )}
                                <div className="text-right">
                                    <p className="text-xs uppercase font-bold text-zinc-500">Class Rank</p>
                                    <p className="text-2xl font-black text-zinc-900">{data.resultSummary.rankPosition}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Spacer to push signatures to bottom */}
                    <div className="flex-1"></div>

                    {/* --- Signatures --- */}
                    <div className="grid grid-cols-3 gap-4 pt-4 mt-auto">
                        {config.footer.signature1Text ? (
                            <div className="text-center flex flex-col items-center">
                                <div className="w-48 h-12 border-b border-zinc-500 mb-2 print:border-b-[1px]"></div>
                                <p className="text-xs font-black uppercase tracking-widest text-zinc-900 w-48 text-center pt-1">{config.footer.signature1Text}</p>
                            </div>
                        ) : <div />}
                        {config.footer.signature2Text ? (
                            <div className="text-center flex flex-col items-center">
                                <div className="w-48 h-12 border-b border-zinc-500 mb-2 print:border-b-[1px]"></div>
                                <p className="text-xs font-black uppercase tracking-widest text-zinc-900 pt-1">{config.footer.signature2Text}</p>
                            </div>
                        ) : <div />}
                        {config.footer.signature3Text ? (
                            <div className="text-center flex flex-col items-center px-2">
                                <div className="w-48 h-12 border-b border-zinc-500 mb-2 pt-1 relative print:border-b-[1px]"></div>
                                <p className="text-xs font-black uppercase tracking-widest text-zinc-900 w-48 text-center pt-1">{config.footer.signature3Text}</p>
                            </div>
                        ) : <div />}
                    </div>

                    {config.footer.showDate && (
                        <div className="w-full text-center pt-4">
                            <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-widest">
                                Date of Issue: {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })}
                            </p>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );

    return (
        <>
            {/* Screen Display (Hidden explicitly by CSS in print) */}
            <div className="print:hidden w-full max-w-[794px] mx-auto">
                {marksheetContent}
            </div>

            {/* Print Display (Injected perfectly at DOM root to bypass ALL modal constraints) */}
            {mounted && typeof document !== "undefined" && createPortal(
                <div id="genuine-print-root" className="hidden print:block w-full bg-white m-0 p-0 text-zinc-900">
                    {marksheetContent}
                </div>,
                document.body
            )}

            {/* Inject Global Print CSS styling exclusively for the injected root */}
            <style dangerouslySetInnerHTML={{
                __html: `
        @media print {
          @page { margin: 0; size: A4 portrait; }
          body { 
            margin: 0; 
            padding: 0; 
            -webkit-print-color-adjust: exact; 
            color-adjust: exact; 
            background: white !important; 
          }

          /* CRITICAL: Hide EVERYTHING in the NextJS app (including modal portals) */
          body > * { display: none !important; }

          /* ONLY show our injected genuine-print-root */
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
          }
        }
      `}} />
        </>
    );
}
