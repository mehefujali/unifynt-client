import api from "@/lib/axios";

export const ReportService = {
  createReport: async (data: {
    title?: string;
    type: string;
    message: string;
    priority?: string;
  }) => {
    const response = await api.post("/reports", data);
    return response.data;
  },

  getReports: async (params: {
    page?: number;
    limit?: number;
    searchTerm?: string;
    type?: string;
    status?: string;
  }) => {
    const response = await api.get("/reports", { params });
    return response.data;
  },

  getSingleReport: async (id: string) => {
    const response = await api.get(`/reports/${id}`);
    return response.data.data;
  },

  updateReportStatus: async (id: string, status: string) => {
    const response = await api.patch(`/reports/${id}/status`, { status });
    return response.data;
  },

  getMyReports: async (params: {
    page?: number;
    limit?: number;
    searchTerm?: string;
  }) => {
    const response = await api.get("/reports/my-reports", { params });
    return response.data;
  },
};
