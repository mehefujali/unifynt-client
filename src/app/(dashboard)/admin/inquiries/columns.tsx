"use client";

import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { IInquiry } from "@/services/inquiry.service";
import { Mail, MessageCircle } from "lucide-react";
import { Dialog, DialogContent, DialogTrigger, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export const inquiryColumns: ColumnDef<IInquiry>[] = [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => (
      <div className="font-semibold">{row.original.name}</div>
    ),
  },
  {
    accessorKey: "contact",
    header: "Contact Info",
    cell: ({ row }) => (
      <div className="flex items-center text-sm font-medium gap-2">
        <Mail className="h-3.5 w-3.5 text-muted-foreground" />
        {row.original.contact}
      </div>
    ),
  },
  {
    accessorKey: "createdAt",
    header: "Date Received",
    cell: ({ row }) => {
      const date = new Date(row.original.createdAt);
      return <div className="text-sm font-medium">{format(date, "MMM dd, yyyy h:mm a")}</div>;
    },
  },
  {
    id: "actions",
    header: "Message",
    cell: ({ row }) => {
      return (
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm">
              <MessageCircle className="h-4 w-4 mr-2" /> View Message
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Message from {row.original.name}</DialogTitle>
              <DialogDescription className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <span className="flex items-center gap-1.5"><Mail className="h-3 w-3" /> {row.original.contact}</span>
                <span className="text-muted-foreground/30">•</span>
                <span>{format(new Date(row.original.createdAt), "MMM dd, yyyy h:mm a")}</span>
              </DialogDescription>
            </DialogHeader>
            <div className="mt-4 p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-800/50 text-sm text-foreground/90 whitespace-pre-wrap leading-relaxed min-h-[150px] shadow-sm">
              {row.original.message}
            </div>
            <div className="flex justify-end mt-6">
              {row.original.contact.includes("@") && (
                <Button onClick={() => window.location.href = `mailto:${row.original.contact}`}>
                  Reply via Email
                </Button>
              )}
            </div>
          </DialogContent>
        </Dialog>
      );
    },
  },
];
