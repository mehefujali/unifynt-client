/* eslint-disable @typescript-eslint/no-explicit-any */
// src/lib/export-utils.ts 
import * as XLSX from "xlsx";


export function downloadCSV(data: any[], filename: string) {
  if (!data || !data.length) return;
  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(","),
    ...data.map((row) =>
      headers.map((header) => {
          let cell = row[header] === null || row[header] === undefined ? "" : String(row[header]);
          if (cell.includes(",") || cell.includes('"') || cell.includes("\n")) {
            cell = `"${cell.replace(/"/g, '""')}"`;
          }
          return cell;
        }).join(",")
    ),
  ].join("\n");

  const blob = new Blob(["\uFEFF" + csvContent], { type: "text/csv;charset=utf-8;" });
  const link = document.createElement("a");
  const url = URL.createObjectURL(blob);
  link.setAttribute("href", url);
  link.setAttribute("download", `${filename}.csv`);
  link.style.visibility = "hidden";
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}


export function downloadExcel(data: any[], filename: string) {
  if (!data || !data.length) {
    console.warn("No data provided for Excel export.");
    return;
  }


  const worksheet = XLSX.utils.json_to_sheet(data);

  const workbook = XLSX.utils.book_new();
  

  XLSX.utils.book_append_sheet(workbook, worksheet, "Applications");
  

  XLSX.writeFile(workbook, `${filename}.xlsx`);
}