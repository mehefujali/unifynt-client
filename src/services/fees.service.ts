/* eslint-disable @typescript-eslint/no-explicit-any */
import api from "@/lib/axios";

export interface FeeHead {
  id: string;
  name: string;
  type: "MONTHLY" | "YEARLY" | "ONE_TIME";
}

export interface FeeStructure {
  id: string;
  feeHeadId: string;
  classId: string;
  amount: number;
  feeHead: { name: string; type: string };
  class: { name: string };
}

export interface StudentInvoice {
  id: string;
  studentId: string;
  invoiceTitle: string;
  invoiceMonth: string;
  amountDue: number;
  amountPaid: number;
  discount: number;
  fine: number;
  dueDate: string;
  status: "PENDING" | "PARTIAL" | "PAID" | "OVERDUE";
  student: {
    firstName: string;
    lastName: string;
    rollNumber: string;
    class: { name: string };
  };
  items: { amount: number; feeHead: { name: string } }[];
}

export const FeesService = {
  // --- GET APIs ---
  getAllFeeHeads: async (): Promise<FeeHead[]> => {
    const res = await api.get("/fees/heads");
    return res.data?.data || [];
  },

  getFeeStructures: async (classId?: string): Promise<FeeStructure[]> => {
    const params = classId ? { classId } : {};
    const res = await api.get("/fees/structures", { params });
    return res.data?.data || [];
  },

  getStudentInvoices: async (
    params?: Record<string, any>,
  ): Promise<StudentInvoice[]> => {
    const res = await api.get("/fees/invoices", { params });
    return res.data?.data || [];
  },

  // --- POST APIs ---
  createFeeHead: async (payload: { name: string; type: string }) => {
    const res = await api.post("/fees/heads", payload);
    return res.data;
  },

  createFeeStructure: async (payload: {
    feeHeadId: string;
    classId: string;
    amount: number;
  }) => {
    const res = await api.post("/fees/structures", payload);
    return res.data;
  },

  bulkGenerateInvoices: async (payload: {
    classId: string;
    academicYearId: string;
    invoiceTitle: string;
    invoiceMonth: string;
    dueDate: string;
  }) => {
    const res = await api.post("/fees/invoices/bulk-generate", payload);
    return res.data;
  },

  collectPayment: async (payload: {
    studentInvoiceId: string;
    amount: number;
    paymentMode: string;
    referenceNo?: string;
  }) => {
    const res = await api.post("/fees/payments/collect", payload);
    return res.data;
  },
  getFeeStats: async (): Promise<{
    totalCollected: number;
    totalDue: number;
    activeInvoicesCount: number;
  }> => {
    const res = await api.get("/fees/stats");
    return res.data?.data;
  },
};
