"use client";

import React, { useRef, useState, useEffect } from "react";
import { FileUp, X, FileText, Image as ImageIcon } from "lucide-react";

interface ProfessionalFileUploadProps {
  label: string;
  accept?: string;
  onFileChange: (file: File | null) => void;
  helperText?: string;
}

export default function ProfessionalFileUpload({
  label,
  accept = "image/*,application/pdf",
  onFileChange,
  helperText = "PNG, JPG or PDF (Max 5MB)"
}: ProfessionalFileUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Clean up object URL to avoid memory leaks
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleFile = (selectedFile: File) => {
    setFile(selectedFile);
    onFileChange(selectedFile);

    // If it's an image, create a preview URL
    if (selectedFile.type.startsWith("image/")) {
      const url = URL.createObjectURL(selectedFile);
      setPreviewUrl(url);
    } else {
      setPreviewUrl(null);
    }
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFile(e.target.files[0]);
    }
  };

  const removeFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFile(null);
    setPreviewUrl(null);
    onFileChange(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  return (
    <div className="w-full space-y-2">
      <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
        {label}
      </label>

      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        className={`relative w-full flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-300 ease-in-out
          ${isDragging ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10" : "border-slate-300 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-500 hover:bg-slate-50 dark:hover:bg-slate-900/50"}
          ${file ? "bg-white dark:bg-slate-950 border-solid border-slate-200 dark:border-slate-800" : "bg-transparent"}
        `}
      >
        <input
          type="file"
          ref={inputRef}
          onChange={onChange}
          accept={accept}
          className="hidden"
        />

        {!file ? (
          <div className="flex flex-col items-center text-center space-y-3">
            <div className="p-3 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
              <FileUp className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-700 dark:text-slate-300">
                Click to upload document
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                or drag and drop
              </p>
            </div>
            <p className="text-[10px] uppercase font-bold text-slate-400">{helperText}</p>
          </div>
        ) : (
          <div className="w-full flex items-center justify-between p-2">
            <div className="flex items-center gap-4 overflow-hidden">
              {/* Preview Thumbnail */}
              <div className="shrink-0 h-14 w-14 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 flex items-center justify-center border border-slate-200 dark:border-slate-700">
                {previewUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={previewUrl} alt="Preview" className="h-full w-full object-cover" />
                ) : (
                  <FileText className="h-6 w-6 text-indigo-500" />
                )}
              </div>
              
              {/* File Details */}
              <div className="flex flex-col overflow-hidden">
                <p className="text-sm font-bold text-slate-700 dark:text-slate-200 truncate max-w-[200px] sm:max-w-xs">
                  {file.name}
                </p>
                <p className="text-xs font-medium text-slate-500 mt-0.5">
                  {formatFileSize(file.size)}
                </p>
              </div>
            </div>

            {/* Remove Button */}
            <button
              onClick={removeFile}
              className="p-2 rounded-full hover:bg-red-50 dark:hover:bg-red-500/10 text-slate-400 hover:text-red-500 transition-colors focus:outline-none"
              title="Remove file"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}