import axiosInstance from "@/lib/axios";

export const NoticeService = {
  createNotice: async (data: { title: string; content: string; image?: string; isPublic?: boolean }) => {
    const response = await axiosInstance.post("/notices", data);
    return response.data;
  },
  getAllNotices: async (query?: Record<string, unknown>) => {
    const response = await axiosInstance.get("/notices", { params: query });
    return response.data;
  },
  getNoticeById: async (id: string) => {
    const response = await axiosInstance.get(`/notices/${id}`);
    return response.data;
  },
  updateNotice: async (id: string, data: { title?: string; content?: string; image?: string; isPublic?: boolean }) => {
    const response = await axiosInstance.patch(`/notices/${id}`, data);
    return response.data;
  },
  deleteNotice: async (id: string) => {
    const response = await axiosInstance.delete(`/notices/${id}`);
    return response.data;
  },
  getPublicNotices: async (subdomain: string, query?: Record<string, unknown>) => {
    const response = await axiosInstance.get(`/notices/public/${subdomain}`, { params: query });
    return response.data;
  }
};
