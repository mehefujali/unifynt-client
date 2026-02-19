"use client";

import { useState, useEffect } from "react";
import { UploadCloud, X, Image as ImageIcon } from "lucide-react";
import { Label } from "@/components/ui/label";

interface ImageUploaderProps {
    label: string;
    value: string | File | null;
    onChange: (file: File | string | null) => void;
}

export function ImageUploader({ label, value, onChange }: ImageUploaderProps) {
    const [preview, setPreview] = useState<string | null>(null);

    useEffect(() => {
        if (value instanceof File) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            setPreview(URL.createObjectURL(value));
        } else if (typeof value === "string" && value.length > 0) {
            setPreview(value);
        } else {
            setPreview(null);
        }
    }, [value]);

    return (
        <div className="space-y-2">
            <Label className="text-xs font-semibold text-slate-500 uppercase">{label}</Label>

            {preview ? (
                <div className="relative group w-full h-32 rounded-lg overflow-hidden border border-slate-200">
                    <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                    <button
                        type="button"
                        onClick={() => onChange(null)}
                        className="absolute top-2 right-2 bg-white/90 p-1 rounded-full shadow-sm hover:bg-red-50 hover:text-red-500 transition-colors"
                    >
                        <X size={14} />
                    </button>
                </div>
            ) : (
                <div className="relative w-full h-32 border-2 border-dashed border-slate-300 rounded-lg hover:border-primary/50 hover:bg-slate-50 transition-all flex flex-col items-center justify-center cursor-pointer group">
                    <input
                        type="file"
                        accept="image/*"
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        onChange={(e) => {
                            if (e.target.files?.[0]) onChange(e.target.files[0]);
                        }}
                    />
                    <div className="bg-white p-2 rounded-full shadow-sm mb-2 group-hover:scale-110 transition-transform">
                        <UploadCloud className="w-5 h-5 text-slate-400 group-hover:text-primary" />
                    </div>
                    <span className="text-[10px] font-medium text-slate-500">Upload Image</span>
                </div>
            )}
        </div>
    );
}