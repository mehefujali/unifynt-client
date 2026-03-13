"use client";

import { useQuery } from "@tanstack/react-query";
import { InquiryService } from "@/services/inquiry.service";
import { DataTable } from "./data-table";
import { inquiryColumns } from "./columns";
import { Mailbox, ShieldAlert } from "lucide-react";
import { PermissionGate } from "@/components/common/permission-gate";
import { PERMISSIONS } from "@/config/permissions";

export default function InquiriesPage() {
  const { data: inquiriesResponse, isLoading } = useQuery({
    queryKey: ["inquiries"],
    queryFn: () => InquiryService.getInquiries(),
  });

  const inquiries = inquiriesResponse?.data || [];

  return (
    <PermissionGate 
      required={PERMISSIONS.INQUIRY_VIEW}
      fallback={
        <div className="flex flex-col items-center justify-center py-32 text-center animate-in fade-in zoom-in-95 duration-500">
          <div className="h-20 w-20 bg-red-50 dark:bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mb-6 ring-8 ring-red-50/50 dark:ring-red-500/5">
            <ShieldAlert className="h-10 w-10" />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white uppercase">Unauthorized Access</h2>
          <p className="text-muted-foreground mt-2 max-w-md mx-auto font-medium">
            You do not have the required permissions to access system inquiries. Please contact your administrator for assistance.
          </p>
        </div>
      }
    >
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
    </PermissionGate>
  );
}
