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
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => (
      <div className="flex items-center text-sm text-muted-foreground gap-2">
        <Mail className="h-3.5 w-3.5" />
        {row.original.email}
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
              <DialogDescription>
                {row.original.email} • {format(new Date(row.original.createdAt), "MMM dd, yyyy h:mm a")}
              </DialogDescription>
            </DialogHeader>
            <div className="mt-4 p-4 rounded-xl bg-zinc-50 border border-zinc-100 text-sm whitespace-pre-wrap leading-relaxed min-h-[150px]">
              {row.original.message}
            </div>
            <div className="flex justify-end mt-4">
              <Button onClick={() => window.location.href = `mailto:${row.original.email}`}>
                Reply via Email
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      );
    },
  },
];
