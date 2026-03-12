"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Save, RotateCcw } from "lucide-react";
import { MarksheetConfig, defaultMarksheetConfig } from "@/types/marksheet-config";
import { BuilderEditor } from "./builder-editor";
import { MarksheetPreview } from "./marksheet-preview";
import { toast } from "sonner";

// Mock Data strictly for the Live Preview
const mockStudentData = {
    config: {
        schoolName: "INTERNATIONAL PUBLIC SCHOOL",
        schoolAddress: "Excellence in Global Education, New Delhi",
        schoolLogo: "https://ui-avatars.com/api/?name=IPS&background=random&size=200", // A generic placeholder logo
    },
    studentInfo: {
        name: "John Doe",
        studentId: "UNIF-0042",
        rollNumber: "42",
        className: "Class X",
        sectionName: "A",
        dob: "15/08/2009",
        admissionNo: "ADM-2024-001",
        bloodGroup: "O+",
        profilePicture: "https://ui-avatars.com/api/?name=John+Doe&background=random&size=200",
    },
    examInfo: {
        examName: "Term 1 Examination",
    },
    subjectWiseMarks: [
        { subjectName: "Mathematics", subjectCode: "MTH", fullMarks: 100, passMarks: 33, totalObtained: 85, grade: "A2" },
        { subjectName: "Science", subjectCode: "SCI", fullMarks: 100, passMarks: 33, totalObtained: 92, grade: "A1" },
        { subjectName: "English", subjectCode: "ENG", fullMarks: 100, passMarks: 33, totalObtained: 78, grade: "B1" },
        { subjectName: "History", subjectCode: "HIS", fullMarks: 100, passMarks: 33, totalObtained: 88, grade: "A2" },
        { subjectName: "Computer Science", subjectCode: "CS", fullMarks: 100, passMarks: 33, totalObtained: 96, grade: "A1" },
    ],
    resultSummary: {
        status: "PASS",
        percentage: "87.8",
        grade: "A2",
        rankPosition: "5",
        marksObtained: 439,
        totalMarks: 500,
    }
};

export default function MarksheetBuilderPage() {
    const [config, setConfig] = useState<MarksheetConfig>(defaultMarksheetConfig);
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        try {
            const saved = localStorage.getItem("marksheetConfig");
            if (saved) {
                const parsed = JSON.parse(saved);
                // Safe merge to ensure older cached versions don't break newer schema properties
                const mergedConfig = {
                    ...defaultMarksheetConfig,
                    header: { ...defaultMarksheetConfig.header, ...(parsed.header || {}) },
                    profile: { ...defaultMarksheetConfig.profile, ...(parsed.profile || {}) },
                    table: { ...defaultMarksheetConfig.table, ...(parsed.table || {}) },
                    footer: { ...defaultMarksheetConfig.footer, ...(parsed.footer || {}) },
                    design: { ...defaultMarksheetConfig.design, ...(parsed.design || {}) },
                };

                // Extra safety for the new fields array if it was missing in the cache
                if (!mergedConfig.profile.fields) {
                    mergedConfig.profile.fields = defaultMarksheetConfig.profile.fields;
                }

                setConfig(mergedConfig);
            }
        } catch (e) {
            console.error("Failed to load saved config:", e);
        } finally {
            // setTimeout avoids synchronous setState during effect lint errors
            setTimeout(() => setIsMounted(true), 0);
        }
    }, []);

    const handleSave = () => {
        // TODO: Connect this to the Node.js backend to save the JSON config per school
        localStorage.setItem("marksheetConfig", JSON.stringify(config));
        toast.success("Marksheet Configuration Saved!", {
            description: "Your layout has been saved locally for testing."
        });
    };

    const handleReset = () => {
        if (confirm("Are you sure you want to reset all configurations to default?")) {
            localStorage.removeItem("marksheetConfig");
            setConfig(defaultMarksheetConfig);
            toast.info("Reset to Default", {
                description: "Marksheet layout has been restored."
            });
        }
    }

    if (!isMounted) return null; // Prevent hydration flash

    return (
        <div className="flex h-[calc(100vh-theme(spacing.16))] w-full bg-transparent overflow-hidden">

            {/* LEFT PANE: Settings Editor */}
            <div className="w-[400px] flex-shrink-0 border-r border-zinc-200 dark:border-sidebar-border bg-white dark:bg-sidebar flex flex-col h-full shadow-sm z-10 relative transition-colors">
                <div className="p-6 border-b border-zinc-100 dark:border-sidebar-border bg-zinc-50/30 dark:bg-background/40">
                    <h1 className="text-xl font-black text-zinc-900 dark:text-zinc-100 tracking-tight uppercase">Report Card Builder</h1>
                    <p className="text-[12px] font-medium text-zinc-500 mt-1 leading-relaxed">Customize the layout, wording, and design of your marksheet registry.</p>
                </div>

                <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                    <BuilderEditor config={config} onChange={setConfig} />
                </div>

                <div className="p-6 border-t border-zinc-100 dark:border-sidebar-border bg-white dark:bg-sidebar shadow-[0_-4px_10px_rgba(0,0,0,0.02)] space-y-3 transition-colors">
                    <Button 
                        onClick={handleSave} 
                        className="w-full h-11 text-[13px] font-black bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 text-white dark:text-zinc-900 rounded-xl shadow-lg shadow-zinc-900/10 dark:shadow-none transition-all"
                    >
                        <Save className="mr-2 h-4 w-4" /> Save Configuration
                    </Button>
                    <Button 
                        onClick={handleReset} 
                        variant="ghost" 
                        className="w-full h-11 text-[13px] font-bold rounded-xl text-zinc-500 hover:text-rose-600 hover:bg-rose-50 dark:text-zinc-400 dark:hover:text-rose-400 dark:hover:bg-rose-900/20 transition-all border border-transparent hover:border-rose-100 dark:hover:border-rose-900/50"
                    >
                        <RotateCcw className="mr-2 h-4 w-4" /> Reset to Default
                    </Button>
                </div>
            </div>

            {/* RIGHT PANE: Live Preview */}
            <div className="flex-1 overflow-y-auto custom-scrollbar bg-zinc-50/50 dark:bg-background flex flex-col items-center p-8 relative transition-colors">
                {/* Toolbar */}
                <div className="absolute top-4 right-8 z-20 flex gap-2">
                    <div className="bg-white dark:bg-sidebar px-4 py-2 rounded-2xl border border-zinc-200 dark:border-sidebar-border shadow-sm flex items-center gap-2 text-[11px] font-black text-zinc-600 dark:text-zinc-400 uppercase tracking-widest transition-all">
                        <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                        Live Preview Mode
                    </div>
                </div>

                {/* Scaled Wrapper for Preview - To fit A4 inside the pane */}
                <div className="w-full max-w-[794px] transform origin-top transition-transform shadow-2xl shadow-zinc-400/10 dark:shadow-black/40 rounded-sm">
                    <MarksheetPreview data={mockStudentData} config={config} />
                </div>
            </div>

        </div>
    );
}
