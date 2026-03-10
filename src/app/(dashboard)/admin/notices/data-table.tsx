"use client";

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  pageCount: number;
  currentPage: number;
  isLoading?: boolean;
  onPageChange: (page: number) => void;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  pageCount,
  currentPage,
  isLoading,
  onPageChange,
}: DataTableProps<TData, TValue>) {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    manualPagination: true,
    pageCount,
  });

  return (
    <div className="flex flex-col flex-1 h-full min-h-[500px]">
      <div className="overflow-x-auto flex-1">
        <Table>
          <TableHeader className="bg-slate-50 dark:bg-slate-900/50 sticky top-0 z-10 border-b border-slate-100 dark:border-slate-800">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="border-none hover:bg-transparent">
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} className="font-black text-[11px] uppercase text-slate-400 tracking-[2px] py-5 px-6 whitespace-nowrap">
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-[300px] text-center">
                  <div className="flex justify-center flex-col items-center gap-3 text-slate-500">
                     <Loader2 className="h-8 w-8 animate-spin text-primary" />
                     <span className="text-[13px] font-bold tracking-tight">Loading notices...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                  className="border-b border-slate-50 dark:border-slate-800/50 hover:bg-slate-50/80 dark:hover:bg-slate-800/30 transition-colors"
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="py-4 px-6">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={columns.length} className="h-[300px] text-center text-slate-500">
                   <div className="flex justify-center flex-col items-center gap-1">
                     <span className="text-[15px] font-black text-slate-700 dark:text-slate-300">No notices found.</span>
                     <span className="text-[13px] font-medium text-slate-400">Click &apos;Create Notice&apos; to add one.</span>
                   </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {pageCount > 0 && (
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/20 flex items-center justify-between">
            <span className="text-[13px] font-bold text-slate-700 dark:text-slate-300 leading-none">
                Page {currentPage} of {pageCount}
            </span>
            <div className="flex items-center space-x-2">
                <Button
                    variant="outline"
                    className="h-9 w-9 p-0 rounded-xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm disabled:opacity-50"
                    onClick={() => onPageChange(Math.max(1, currentPage - 1))}
                    disabled={currentPage <= 1 || isLoading}
                >
                    <ChevronLeft className="h-4 w-4" strokeWidth={3} />
                </Button>
                <div className="px-4 h-9 flex items-center justify-center bg-primary text-primary-foreground rounded-xl font-black text-[13px] shadow-md">
                    {currentPage}
                </div>
                <Button
                    variant="outline"
                    className="h-9 w-9 p-0 rounded-xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm disabled:opacity-50"
                     onClick={() => onPageChange(Math.min(pageCount, currentPage + 1))}
                     disabled={currentPage >= pageCount || isLoading}
                >
                    <ChevronRight className="h-4 w-4" strokeWidth={3} />
                </Button>
            </div>
        </div>
      )}
    </div>
  );
}
