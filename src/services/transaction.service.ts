import api from "@/lib/axios";

export const TransactionService = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  getAllTransactions: async (params?: any) => {
    const response = await api.get("/transactions", { params });
    return response.data;
  },

  getSchoolTransactions: async (schoolId: string) => {
    const response = await api.get(`/transactions/${schoolId}`);
    return response.data.data;
  },
};
