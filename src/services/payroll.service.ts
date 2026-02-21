/* eslint-disable @typescript-eslint/no-explicit-any */
import api from "@/lib/axios";

export const PayrollService = {
  getAllSalarySlips: async (params?: any) => {
    const response = await api.get("/payroll", { params });
    return response.data;
  },
  generateBulkSalary: async (data: any) => {
    const response = await api.post("/payroll/generate-bulk", data);
    return response.data;
  },
  updateSalaryStatus: async (id: string, data: any) => {
    const response = await api.patch(`/payroll/${id}/status`, data);
    return response.data;
  },
};
