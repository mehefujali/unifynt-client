"use client";

import { useQuery } from "@tanstack/react-query";
import { InquiryService } from "@/services/inquiry.service";
import { DataTable } from "./data-table";
import { inquiryColumns } from "./columns";
import { Mailbox } from "lucide-react";

export default function InquiriesPage() {
  const { data: inquiriesResponse, isLoading } = useQuery({
    queryKey: ["inquiries"],
    queryFn: () => InquiryService.getInquiries(),
  });

  const inquiries = inquiriesResponse?.data || [];

  return (
    <div className="flex flex-col gap-8">
      <div>
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-primary/10 text-primary">
            <Mailbox className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Public Inquiries</h1>
            <p className="text-sm text-muted-foreground mt-1">
              View and respond to messages submitted via your public website.
            </p>
          </div>
        </div>
      </div>

      <div className="bg-card rounded-2xl border shadow-sm">
        {isLoading ? (
          <div className="p-8 text-center text-muted-foreground">Loading inquiries...</div>
        ) : (
        <DataTable 
            columns={inquiryColumns} 
            data={inquiries}
            isLoading={isLoading}
            emptyMessage="No inquiries yet."
          />
        )}
      </div>
    </div>
  );
}
