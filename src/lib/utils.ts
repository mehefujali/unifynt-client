import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getFileUrl(url: any): string {
  if (!url || typeof url !== "string") return "";

  // If it's already a blob or data URL, or already our proxy URL, return as is
  if (url.startsWith("blob:") || url.startsWith("data:") || url.includes("/files/shared/")) return url;

  // Professional S3 to Proxy Transformation (Fallback for legacy data)
  if (url.includes(".s3") && url.includes(".amazonaws.com/")) {
    const parts = url.split(".amazonaws.com/");
    if (parts.length > 1) {
      const apiBase = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1").replace(/\/$/, "");
      return `${apiBase}/files/shared/${parts[1]}`;
    }
  }

  return url;
}
