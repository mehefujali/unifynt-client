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
    phone: string;
    class: { name: string };
  };
  items: { amount: number; feeHead: { name: string } }[];
}

export const FeesService = {
  getAllFeeHeads: async (params?: Record<string, any>) => {
    const res = await api.get("/fees/heads", { params });
    return res.data;
  },

  getFeeStructures: async (params?: Record<string, any>) => {
    const res = await api.get("/fees/structures", { params });
    return res.data;
  },

  getStudentInvoices: async (params?: Record<string, any>) => {
    const res = await api.get("/fees/invoices", { params });
    return res.data;
  },

  createFeeHead: async (payload: { name: string; type: string }) => {
    const res = await api.post("/fees/heads", payload);
    return res.data;
  },

  updateFeeHead: async (id: string, payload: { name?: string; type?: string }) => {
    const res = await api.patch(`/fees/heads/${id}`, payload);
    return res.data;
  },

  deleteFeeHead: async (id: string) => {
    const res = await api.delete(`/fees/heads/${id}`);
    return res.data;
  },

  createFeeStructure: async (payload: { feeHeadId: string; classId: string; amount: number; }) => {
    const res = await api.post("/fees/structures", payload);
    return res.data;
  },

  updateFeeStructure: async (id: string, payload: { amount: number }) => {
    const res = await api.patch(`/fees/structures/${id}`, payload);
    return res.data;
  },

  deleteFeeStructure: async (id: string) => {
    const res = await api.delete(`/fees/structures/${id}`);
    return res.data;
  },

  bulkGenerateInvoices: async (payload: { classId: string; academicYearId: string; invoiceTitle: string; invoiceMonth: string; dueDate: string; feeHeadIds: string[] }) => {
    const res = await api.post("/fees/invoices/bulk-generate", payload);
    return res.data;
  },

  collectPayment: async (payload: { studentInvoiceId: string; amount: number; paymentMode: string; referenceNo?: string; }) => {
    const res = await api.post("/fees/payments/collect", payload);
    return res.data;
  },

  getFeeStats: async () => {
    const res = await api.get("/fees/stats");
    return res.data?.data;
  },

  sendFeeReminders: async (payload: { invoiceIds: string[]; templateId: string }) => {
    const res = await api.post("/fees/invoices/send-reminders", payload);
    return res.data;
  },
  getTransactions: async (params?: Record<string, any>) => {
    const res = await api.get("/fees/transactions", { params }); // backend route match kore niben
    return res.data;
},
};